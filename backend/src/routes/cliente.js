// Rotas da cliente logada — tudo que a área de membros web lê e grava.
//
// Todas exigem sessão (requireAuth). O acesso pago NÃO é exigido aqui: a
// cliente que perdeu o acesso continua vendo o próprio diário; o que ela deixa
// de ter é plano novo e as rotas de IA (requirePremium fica nelas).
//
// Convenções:
//   - datas 'YYYY-MM-DD' vêm prontas do navegador (ver utils/datas.js);
//   - refeições têm um `slot` fixo (cafe, lanche_manha, almoco, lanche_tarde,
//     jantar, ceia) — é o que amarra o registrado ao planejado;
//   - totais (kcal, p, c, f) são SEMPRE recalculados aqui a partir dos itens.
//     Cliente manda item; servidor soma. Nunca o contrário.

import { Router } from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../services/auth.js';
import { temAcesso } from '../services/billing.js';
import { novaChave, urlDeUpload, urlDeLeitura, apagar, r2Configurado } from '../services/r2.js';
import { exigirData, somarDias, diaDaSemana, inicioDaSemana, mesValido } from '../utils/datas.js';

const router = Router();
router.use(requireAuth);

export const SLOTS = ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'];
const FONTES = ['manual', 'taco', 'receita', 'plano', 'foto', 'audio', 'whatsapp'];

const erro = (msg, status = 400, code = 'BAD_REQUEST') => Object.assign(new Error(msg), { status, code });
const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
const r1 = (v) => Math.round(v * 10) / 10;

/** Valida e normaliza a lista de itens de uma refeição; devolve itens + totais. */
function normalizarItens(bruto) {
  if (!Array.isArray(bruto) || bruto.length === 0) throw erro('A refeição precisa de pelo menos um item.');
  if (bruto.length > 50) throw erro('Muitos itens numa refeição só (máximo 50).');
  const itens = bruto.map((it) => {
    const name = String(it?.name || '').trim().slice(0, 120);
    if (!name) throw erro('Item sem nome.');
    const kcal = num(it.kcal), p = num(it.p), c = num(it.c), f = num(it.f);
    if ([kcal, p, c, f].some((v) => v === null)) throw erro(`Macros inválidos em "${name}".`);
    return {
      name,
      portion: String(it.portion || '').trim().slice(0, 60),
      grams: num(it.grams),
      kcal: r1(kcal), p: r1(p), c: r1(c), f: r1(f),
      ...(it.code ? { code: String(it.code).slice(0, 12) } : {}),
    };
  });
  const tot = itens.reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  return { itens, tot: { kcal: r1(tot.kcal), p: r1(tot.p), c: r1(tot.c), f: r1(tot.f) } };
}

function exigirSlot(s) {
  if (!SLOTS.includes(s)) throw erro(`slot inválido (use ${SLOTS.join(', ')})`);
  return s;
}

async function comFotoUrl(rows) {
  if (!r2Configurado()) return rows.map((r) => ({ ...r, photoUrl: null }));
  return Promise.all(rows.map(async (r) => ({ ...r, photoUrl: r.photo_key ? await urlDeLeitura(r.photo_key).catch(() => null) : null })));
}

const numeros = (r) => ({ ...r, kcal: Number(r.kcal), p: Number(r.p), c: Number(r.c), f: Number(r.f) });

// ─── Plano da semana ──────────────────────────────────────────────────────

async function planoDaData(userId, date) {
  const ws = inicioDaSemana(date);
  const { rows } = await getPool().query(
    `SELECT * FROM meal_plans WHERE user_id = $1 AND week_start = $2 AND status = 'ativo' LIMIT 1`,
    [userId, ws],
  );
  return rows[0] || null;
}

/** O dia do plano, já com as trocas que a cliente fez aplicadas. */
function diaDoPlano(plano, date) {
  if (!plano) return null;
  const wd = diaDaSemana(date);
  const dia = (plano.days || []).find((d) => Number(d.weekday) === wd);
  if (!dia) return null;
  const meals = (dia.meals || []).map((m) => {
    const troca = plano.overrides?.[`${date}:${m.slot}`];
    return troca ? { ...m, ...troca, trocada: true, original: { name: m.name, kcal: m.kcal } } : m;
  });
  return { weekday: wd, meals };
}

// ─── Streak e adesão ──────────────────────────────────────────────────────

async function diasComRegistro(userId, de, ate) {
  const { rows } = await getPool().query(
    `SELECT DISTINCT date FROM meal_entries WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
    [userId, de, ate],
  );
  return new Set(rows.map((r) => r.date));
}

/** Dias seguidos com registro, terminando hoje ou ontem (hoje ainda pode vir). */
function streakDe(dias, hoje) {
  let d = dias.has(hoje) ? hoje : somarDias(hoje, -1);
  let n = 0;
  while (dias.has(d)) { n += 1; d = somarDias(d, -1); }
  return n;
}
async function streak(userId, hoje) {
  return streakDe(await diasComRegistro(userId, somarDias(hoje, -120), hoje), hoje);
}

// ─── GET /me/dia ──────────────────────────────────────────────────────────
// Tudo que as telas Hoje e Meu plano precisam pra um dia, numa chamada só.

router.get('/dia', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const date = exigirData(req.query.date);
    const p = getPool();
    const ws = inicioDaSemana(date);

    // Uma ida só ao banco pra tudo (as consultas correm em paralelo): cada
    // round-trip sequencial custava ~150 ms com o Postgres remoto.
    const [ent, agua, plano, sup, tomados, peso, perfil, acesso, dias] = await Promise.all([
      p.query(`SELECT * FROM meal_entries WHERE user_id = $1 AND date = $2 ORDER BY logged_at`, [userId, date]),
      p.query(`SELECT ml FROM water_log WHERE user_id = $1 AND date = $2`, [userId, date]),
      planoDaData(userId, date),
      p.query(`SELECT id, name, dose, time, with_meal FROM supplements WHERE user_id = $1 AND active ORDER BY time NULLS LAST, sort`, [userId]),
      p.query(`SELECT supplement_id FROM supplement_intake WHERE user_id = $1 AND date = $2`, [userId, date]),
      p.query(`SELECT date, kg FROM weight_log WHERE user_id = $1 ORDER BY date DESC LIMIT 2`, [userId]),
      p.query(`SELECT data FROM client_profiles WHERE user_id = $1`, [userId]),
      temAcesso(userId),
      diasComRegistro(userId, somarDias(date, -120), somarDias(ws, 6)),
    ]);

    const entries = await comFotoUrl(ent.rows.map(numeros));
    const consumido = entries.reduce((a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    const semana = [...dias].filter((d) => d >= ws && d <= somarDias(ws, 6)).sort();
    const tomadosSet = new Set(tomados.rows.map((r) => r.supplement_id));

    res.json({
      date,
      entries,
      consumido: { kcal: r1(consumido.kcal), p: r1(consumido.p), c: r1(consumido.c), f: r1(consumido.f) },
      water_ml: agua.rows[0]?.ml ?? 0,
      targets: plano?.targets && Object.keys(plano.targets).length ? plano.targets : perfil.rows[0]?.data?.targets || null,
      plano: plano
        ? { id: plano.id, week_start: plano.week_start, week_index: plano.week_index, week_total: plano.week_total, note: plano.note, dia: diaDoPlano(plano, date) }
        : null,
      suplementos: sup.rows.map((s) => ({ ...s, tomado: tomadosSet.has(s.id) })),
      peso: peso.rows[0] ? { date: peso.rows[0].date, kg: Number(peso.rows[0].kg) } : null,
      estimativa: perfil.rows[0]?.data?.estimativa || null,
      onboarding_em: perfil.rows[0]?.data?.onboarding_em || null,
      streak: streakDe(dias, date),
      semana: { week_start: ws, dias: semana },
      acesso,
    });
  } catch (e) { next(e); }
});

// ─── Refeições ────────────────────────────────────────────────────────────

router.post('/refeicoes', async (req, res, next) => {
  try {
    const { date, slot, source, items, photo_key, confidence, note, logged_at } = req.body || {};
    exigirData(date); exigirSlot(slot);
    if (!FONTES.includes(source)) throw erro('source inválida');
    const { itens, tot } = normalizarItens(items);
    const { rows } = await getPool().query(
      `INSERT INTO meal_entries (user_id, date, slot, source, items, kcal, p, c, f, photo_key, confidence, note, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13::timestamptz, NOW()))
       RETURNING *`,
      [req.user.userId, date, slot, source, JSON.stringify(itens), tot.kcal, tot.p, tot.c, tot.f,
        photo_key || null, confidence || null, note ? String(note).slice(0, 500) : null, logged_at || null],
    );
    res.status(201).json({ entry: (await comFotoUrl([numeros(rows[0])]))[0] });
  } catch (e) { next(e); }
});

router.put('/refeicoes/:id', async (req, res, next) => {
  try {
    const { items, slot, note } = req.body || {};
    const { itens, tot } = normalizarItens(items);
    if (slot) exigirSlot(slot);
    const { rows } = await getPool().query(
      `UPDATE meal_entries SET items = $3, kcal = $4, p = $5, c = $6, f = $7,
              slot = COALESCE($8, slot), note = COALESCE($9, note)
        WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.userId, JSON.stringify(itens), tot.kcal, tot.p, tot.c, tot.f, slot || null, note ?? null],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Registro não encontrado', code: 'NOT_FOUND' });
    res.json({ entry: (await comFotoUrl([numeros(rows[0])]))[0] });
  } catch (e) { next(e); }
});

router.delete('/refeicoes/:id', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `DELETE FROM meal_entries WHERE id = $1 AND user_id = $2 RETURNING photo_key`,
      [req.params.id, req.user.userId],
    );
    if (rows[0]?.photo_key) apagar(rows[0].photo_key).catch(() => {});
    res.json({ ok: true, deleted: rows.length > 0 });
  } catch (e) { next(e); }
});

// Copia as refeições de um dia pra outro (o "copiar o dia de ontem").
router.post('/refeicoes/copiar', async (req, res, next) => {
  try {
    const de = exigirData(req.body?.from); const para = exigirData(req.body?.to);
    if (de === para) throw erro('Origem e destino são o mesmo dia.');
    const { rows } = await getPool().query(
      `INSERT INTO meal_entries (user_id, date, slot, source, items, kcal, p, c, f, note)
       SELECT user_id, $3, slot, 'manual', items, kcal, p, c, f, 'copiado de ' || date
         FROM meal_entries WHERE user_id = $1 AND date = $2
       RETURNING id`,
      [req.user.userId, de, para],
    );
    res.json({ ok: true, copiadas: rows.length });
  } catch (e) { next(e); }
});

// ─── Água ─────────────────────────────────────────────────────────────────

router.put('/agua', async (req, res, next) => {
  try {
    const date = exigirData(req.body?.date);
    const delta = Number(req.body?.delta_ml);
    const abs = Number(req.body?.ml);
    if (!Number.isFinite(delta) && !Number.isFinite(abs)) throw erro('Informe ml ou delta_ml.');
    const { rows } = await getPool().query(
      `INSERT INTO water_log (user_id, date, ml) VALUES ($1, $2, GREATEST(0, $3))
       ON CONFLICT (user_id, date) DO UPDATE
         SET ml = GREATEST(0, CASE WHEN $4::boolean THEN water_log.ml + $3 ELSE $3 END), updated_at = NOW()
       RETURNING ml`,
      [req.user.userId, date, Number.isFinite(delta) ? delta : abs, Number.isFinite(delta)],
    );
    res.json({ water_ml: rows[0].ml });
  } catch (e) { next(e); }
});

// ─── Peso e medidas ───────────────────────────────────────────────────────

router.get('/peso', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `SELECT date, kg FROM weight_log WHERE user_id = $1 ORDER BY date ASC`, [req.user.userId]);
    res.json({ pesos: rows.map((r) => ({ date: r.date, kg: Number(r.kg) })) });
  } catch (e) { next(e); }
});

router.post('/peso', async (req, res, next) => {
  try {
    const date = exigirData(req.body?.date);
    const kg = Number(String(req.body?.kg ?? '').replace(',', '.'));
    if (!Number.isFinite(kg) || kg < 20 || kg > 400) throw erro('Peso fora do esperado (20 a 400 kg).');
    await getPool().query(
      `INSERT INTO weight_log (user_id, date, kg) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET kg = EXCLUDED.kg`,
      [req.user.userId, date, kg],
    );
    res.json({ ok: true, date, kg });
  } catch (e) { next(e); }
});

router.post('/medidas', async (req, res, next) => {
  try {
    const date = exigirData(req.body?.date);
    const m = req.body?.measures;
    if (!m || typeof m !== 'object') throw erro('measures obrigatório');
    const limpo = {};
    for (const [k, v] of Object.entries(m)) {
      const n = Number(String(v).replace(',', '.'));
      if (/^[a-z_]{2,30}$/.test(k) && Number.isFinite(n) && n > 0 && n < 400) limpo[k] = n;
    }
    if (!Object.keys(limpo).length) throw erro('Nenhuma medida válida.');
    await getPool().query(
      `INSERT INTO body_measures (user_id, date, measures) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET measures = body_measures.measures || EXCLUDED.measures`,
      [req.user.userId, date, JSON.stringify(limpo)],
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── Fotos (progresso e prato) ────────────────────────────────────────────

router.post('/fotos/upload-url', async (req, res, next) => {
  try {
    const pasta = ['prato', 'perfil', 'progresso'].includes(req.body?.pasta) ? req.body.pasta : 'progresso';
    const key = novaChave(req.user.userId, pasta, req.body?.content_type);
    res.json(await urlDeUpload({ key, contentType: req.body.content_type, tamanho: Number(req.body?.size) || 0 }));
  } catch (e) { next(e); }
});

router.get('/fotos', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `SELECT id, date, photo_key, weight_kg FROM progress_photos WHERE user_id = $1 ORDER BY date ASC, created_at ASC`,
      [req.user.userId],
    );
    const fotos = await comFotoUrl(rows);
    res.json({ fotos: fotos.map((f) => ({ id: f.id, date: f.date, weight_kg: f.weight_kg ? Number(f.weight_kg) : null, url: f.photoUrl })) });
  } catch (e) { next(e); }
});

router.post('/fotos', async (req, res, next) => {
  try {
    const date = exigirData(req.body?.date);
    const key = String(req.body?.photo_key || '');
    if (!key.startsWith(`${req.user.userId}/`)) throw erro('photo_key inválida');
    const kg = req.body?.weight_kg != null ? Number(req.body.weight_kg) : null;
    const { rows } = await getPool().query(
      `INSERT INTO progress_photos (user_id, date, photo_key, weight_kg) VALUES ($1, $2, $3, $4) RETURNING id`,
      [req.user.userId, date, key, Number.isFinite(kg) ? kg : null],
    );
    res.status(201).json({ id: rows[0].id });
  } catch (e) { next(e); }
});

router.delete('/fotos/:id', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `DELETE FROM progress_photos WHERE id = $1 AND user_id = $2 RETURNING photo_key`, [req.params.id, req.user.userId]);
    if (rows[0]) apagar(rows[0].photo_key).catch(() => {});
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── Plano ────────────────────────────────────────────────────────────────

router.get('/plano', async (req, res, next) => {
  try {
    const date = exigirData(req.query.date || new Date().toISOString().slice(0, 10));
    const plano = await planoDaData(req.user.userId, date);
    if (!plano) return res.json({ plano: null });
    const ws = plano.week_start;
    const dias = (plano.days || []).map((d) => {
      const data = somarDias(ws, Number(d.weekday) - 1);
      return { ...diaDoPlano(plano, data), date: data };
    });
    res.json({ plano: { id: plano.id, week_start: ws, week_index: plano.week_index, week_total: plano.week_total, targets: plano.targets, note: plano.note, dias } });
  } catch (e) { next(e); }
});

// Troca de refeição pela cliente. Fica em `overrides`, separado do que a Lu
// montou — ela vê o que foi trocado, e o plano original continua íntegro.
router.post('/plano/troca', async (req, res, next) => {
  try {
    const date = exigirData(req.body?.date); const slot = exigirSlot(req.body?.slot);
    const nova = req.body?.meal;
    if (!nova || typeof nova !== 'object' || !String(nova.name || '').trim()) throw erro('meal.name obrigatório');
    const { itens, tot } = normalizarItens(nova.items);
    const plano = await planoDaData(req.user.userId, date);
    if (!plano) throw erro('Não há plano ativo nessa semana.', 404, 'NOT_FOUND');
    const override = { name: String(nova.name).slice(0, 120), code: nova.code || null, items: itens, ...tot };
    await getPool().query(
      `UPDATE meal_plans SET overrides = overrides || $3::jsonb, updated_at = NOW() WHERE id = $1 AND user_id = $2`,
      [plano.id, req.user.userId, JSON.stringify({ [`${date}:${slot}`]: override })],
    );
    res.json({ ok: true, meal: override });
  } catch (e) { next(e); }
});

// ─── Suplementos ──────────────────────────────────────────────────────────

router.post('/suplementos/:id/tomado', async (req, res, next) => {
  try {
    const date = exigirData(req.body?.date);
    const tomado = req.body?.taken !== false;
    const p = getPool();
    if (tomado) {
      await p.query(
        `INSERT INTO supplement_intake (user_id, date, supplement_id)
         SELECT $1, $2, id FROM supplements WHERE id = $3 AND user_id = $1
         ON CONFLICT DO NOTHING`,
        [req.user.userId, date, req.params.id],
      );
    } else {
      await p.query(`DELETE FROM supplement_intake WHERE user_id = $1 AND date = $2 AND supplement_id = $3`, [req.user.userId, date, req.params.id]);
    }
    res.json({ ok: true, taken: tomado });
  } catch (e) { next(e); }
});

// ─── Mês (calendário) ─────────────────────────────────────────────────────

router.get('/mes', async (req, res, next) => {
  try {
    const mes = req.query.month;
    if (!mesValido(mes)) throw erro('month precisa ser YYYY-MM');
    const { rows } = await getPool().query(
      `SELECT date, COUNT(*)::int AS refeicoes, SUM(kcal)::float AS kcal
         FROM meal_entries WHERE user_id = $1 AND date LIKE $2 GROUP BY date ORDER BY date`,
      [req.user.userId, `${mes}-%`],
    );
    res.json({ month: mes, dias: rows });
  } catch (e) { next(e); }
});

// ─── Evolução ─────────────────────────────────────────────────────────────

router.get('/evolucao', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const hoje = exigirData(req.query.date || new Date().toISOString().slice(0, 10));
    const p = getPool();
    const [pesos, medidas, fotos, perfil] = await Promise.all([
      p.query(`SELECT date, kg FROM weight_log WHERE user_id = $1 ORDER BY date`, [userId]),
      p.query(`SELECT date, measures FROM body_measures WHERE user_id = $1 ORDER BY date`, [userId]),
      p.query(`SELECT id, date, photo_key, weight_kg FROM progress_photos WHERE user_id = $1 ORDER BY date, created_at`, [userId]),
      p.query(`SELECT data FROM client_profiles WHERE user_id = $1`, [userId]),
    ]);
    // Adesão: dias com registro por semana, últimas 6 semanas (segunda a
    // domingo). Uma consulta só cobre as 6 semanas e o streak (120 dias).
    const semanaAtual = inicioDaSemana(hoje);
    const [todos, fotosUrl] = await Promise.all([
      diasComRegistro(userId, somarDias(hoje, -120), somarDias(semanaAtual, 6)),
      comFotoUrl(fotos.rows),
    ]);
    const semanas = [];
    let ws = semanaAtual;
    for (let i = 0; i < 6; i++) {
      const fim = somarDias(ws, 6);
      let dias = 0;
      for (const d of todos) if (d >= ws && d <= fim) dias += 1;
      const limite = fim > hoje ? diaDaSemana(hoje) : 7;
      semanas.unshift({ week_start: ws, dias, de: limite });
      ws = somarDias(ws, -7);
    }
    res.json({
      pesos: pesos.rows.map((r) => ({ date: r.date, kg: Number(r.kg) })),
      meta_kg: perfil.rows[0]?.data?.meta_kg ?? null,
      medidas: medidas.rows,
      fotos: fotosUrl.map((f) => ({ id: f.id, date: f.date, weight_kg: f.weight_kg ? Number(f.weight_kg) : null, url: f.photoUrl })),
      adesao: semanas,
      streak: streakDe(todos, hoje),
    });
  } catch (e) { next(e); }
});

// ─── Perfil ───────────────────────────────────────────────────────────────

const CAMPOS_PERFIL = new Set([
  'nome', 'sexo', 'nascimento', 'altura_cm', 'meta_kg', 'objetivo', 'atividade', 'sono', 'sono_horas', 'refeicoes_por_dia',
  'nao_gosta', 'restricoes', 'alergias', 'indispensavel', 'limitacoes', 'dia_normal', 'mais_fome', 'doces', 'doces_quando', 'agua_litros',
  'barreiras', 'motivacoes', 'dor', 'desejo', 'urgencia', 'lembretes', 'whatsapp',
  // Onboarding web: quando terminou e a estimativa em faixa (referência até
  // a nutricionista aprovar o plano). foto_key é a foto de perfil no R2.
  'onboarding_em', 'estimativa', 'foto_key',
]);

/** Perfil com a URL assinada da foto (a chave nunca sai crua pro navegador). */
async function perfilComFoto(data) {
  const p = { ...(data || {}) };
  const key = p.foto_key; delete p.foto_key;
  p.foto_url = key && r2Configurado() ? await urlDeLeitura(key).catch(() => null) : null;
  return p;
}

router.get('/perfil', async (req, res, next) => {
  try {
    const p = getPool();
    const [u, c, a, plano] = await Promise.all([
      p.query(`SELECT id, display_name, email, created_at FROM users WHERE id = $1`, [req.user.userId]),
      p.query(`SELECT data, updated_at FROM client_profiles WHERE user_id = $1`, [req.user.userId]),
      temAcesso(req.user.userId),
      planoDaData(req.user.userId, new Date().toISOString().slice(0, 10)),
    ]);
    if (!u.rows[0]) return res.status(401).json({ error: 'Usuário não existe mais', code: 'AUTH_EXPIRED' });
    res.json({
      user: { id: u.rows[0].id, displayName: u.rows[0].display_name, email: u.rows[0].email, since: u.rows[0].created_at },
      perfil: await perfilComFoto(c.rows[0]?.data),
      acesso: a,
      plano: plano ? { week_index: plano.week_index, week_total: plano.week_total, week_start: plano.week_start, targets: plano.targets } : null,
    });
  } catch (e) { next(e); }
});

router.put('/perfil', async (req, res, next) => {
  try {
    const dados = req.body?.perfil;
    if (!dados || typeof dados !== 'object') throw erro('perfil obrigatório');
    const limpo = {};
    for (const [k, v] of Object.entries(dados)) if (CAMPOS_PERFIL.has(k)) limpo[k] = v;
    if (limpo.foto_key != null && limpo.foto_key !== '' && !String(limpo.foto_key).startsWith(`${req.user.userId}/`)) throw erro('foto_key inválida');
    if (limpo.foto_key === '') limpo.foto_key = null;
    if (typeof limpo.nome === 'string' && limpo.nome.trim()) {
      await getPool().query(`UPDATE users SET display_name = $2 WHERE id = $1`, [req.user.userId, limpo.nome.trim().slice(0, 40)]);
    }
    const { rows } = await getPool().query(
      `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()
       RETURNING data`,
      [req.user.userId, JSON.stringify(limpo)],
    );
    res.json({ perfil: await perfilComFoto(rows[0].data) });
  } catch (e) { next(e); }
});

// ─── Anamnese clínica (dado de saúde) ─────────────────────────────────────
// Só a dona lê e escreve. Não entra em /me/dia, /me/perfil, IA nem WhatsApp.

const CAMPOS_CLINICOS = new Set([
  'doencas', 'historico_familiar', 'medicamentos', 'suplementos', 'alergias',
  'perda_controle', 'perda_controle_quando', 'intestino', 'sintomas', 'alcool', 'exames',
]);

router.get('/anamnese-clinica', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(`SELECT data, consentimento_em, updated_at FROM anamnese_clinica WHERE user_id = $1`, [req.user.userId]);
    res.json(rows[0]
      ? { respondida: true, data: rows[0].data, consentimento_em: rows[0].consentimento_em, updated_at: rows[0].updated_at }
      : { respondida: false, data: null, consentimento_em: null, updated_at: null });
  } catch (e) { next(e); }
});

router.put('/anamnese-clinica', async (req, res, next) => {
  try {
    if (req.body?.consentimento !== true) throw erro('É preciso consentir com o uso dos dados de saúde.', 400, 'CONSENT_REQUIRED');
    const dados = req.body?.data;
    if (!dados || typeof dados !== 'object') throw erro('data obrigatório');
    const limpo = {};
    for (const [k, v] of Object.entries(dados)) if (CAMPOS_CLINICOS.has(k)) limpo[k] = typeof v === 'string' ? v.slice(0, 2000) : v;
    const { rows } = await getPool().query(
      `INSERT INTO anamnese_clinica (user_id, data, consentimento_em) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = anamnese_clinica.data || EXCLUDED.data, updated_at = NOW()
       RETURNING data, consentimento_em`,
      [req.user.userId, JSON.stringify(limpo)],
    );
    res.json({ respondida: true, data: rows[0].data, consentimento_em: rows[0].consentimento_em });
  } catch (e) { next(e); }
});

router.delete('/anamnese-clinica', async (req, res, next) => {
  try {
    await getPool().query(`DELETE FROM anamnese_clinica WHERE user_id = $1`, [req.user.userId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── Recados da Lu e perguntas pra Luciana ────────────────────────────────

router.get('/recados', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `SELECT id, kind, author, text, reply_to, read_at, created_at FROM lu_messages
        WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.userId]);
    res.json({ mensagens: rows });
  } catch (e) { next(e); }
});

router.post('/recados/lidos', async (req, res, next) => {
  try {
    await getPool().query(`UPDATE lu_messages SET read_at = NOW() WHERE user_id = $1 AND author = 'nutri' AND read_at IS NULL`, [req.user.userId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/perguntas', async (req, res, next) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (text.length < 3) throw erro('Escreve a pergunta antes de mandar.');
    if (text.length > 2000) throw erro('A pergunta está longa demais (máximo 2.000 caracteres).');
    const { rows } = await getPool().query(
      `INSERT INTO lu_messages (user_id, kind, author, text) VALUES ($1, 'pergunta', 'cliente', $2) RETURNING id, created_at`,
      [req.user.userId, text],
    );
    res.status(201).json({ id: rows[0].id, created_at: rows[0].created_at });
  } catch (e) { next(e); }
});

// ─── Materiais (globais) ──────────────────────────────────────────────────

router.get('/materiais', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `SELECT id, title, kind, url, meta, updated_at FROM materials WHERE active ORDER BY sort, created_at DESC`);
    res.json({ materiais: rows });
  } catch (e) { next(e); }
});

export default router;
