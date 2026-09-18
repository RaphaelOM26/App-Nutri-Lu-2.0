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
//
// As leituras compostas (o dia, a evolução, o plano) vivem em
// services/diario.js, porque o painel da nutricionista lê as mesmas coisas.

import { Router } from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../services/auth.js';
import { temAcesso } from '../services/billing.js';
import { novaChave, urlDeUpload, urlDeLeitura, apagar, r2Configurado } from '../services/r2.js';
import { exigirData, mesValido, dataValida, diaDaSemana } from '../utils/datas.js';
import { planoDaLista } from '../services/plano/listaCompras.js';
import { avisarListaCompras } from '../services/whatsapp/avisos.js';
import { listar, marcarLidas } from '../services/notificacoes.js';
import { agendarRascunho } from '../services/triagem.js';
import { numeroDoBot, mascarar } from '../services/whatsapp/api.js';
import { contatoDaUsuaria, criarCodigoDeVinculo } from '../services/whatsapp/contatos.js';
import { pedirGeracao } from '../services/lote/gerar.js';
import {
  SLOTS, FONTES, erro, normalizarItens, exigirSlot, comFotoUrl, numeros,
  planoDaData, planoResumido, montarDia, montarEvolucao,
  CAMPOS_PERFIL, CAMPOS_CLINICOS, perfilComFoto,
} from '../services/diario.js';

const router = Router();
router.use(requireAuth);

export { SLOTS };

// ─── GET /me/dia ──────────────────────────────────────────────────────────
// Tudo que as telas Hoje e Meu plano precisam pra um dia, numa chamada só.

router.get('/dia', async (req, res, next) => {
  try {
    res.json(await montarDia(req.user.userId, exigirData(req.query.date)));
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
    const r = planoResumido(plano); delete r.status;
    res.json({ plano: r });
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
    const hoje = exigirData(req.query.date || new Date().toISOString().slice(0, 10));
    res.json(await montarEvolucao(req.user.userId, hoje));
  } catch (e) { next(e); }
});

// ─── Perfil ───────────────────────────────────────────────────────────────

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
    // Cadastro terminou (ou mudou algo que entra no plano): o sistema monta o
    // rascunho do mês pra Luciana aprovar. Só enfileira; roda no trabalhador.
    if (rows[0].data?.onboarding_em && ['onboarding_em', 'restricoes', 'alergias', 'nao_gosta', 'indispensavel', 'objetivo', 'atividade', 'meta_kg', 'gestante'].some((k) => k in limpo)) pedirGeracao(req.user.userId);
    res.json({ perfil: await perfilComFoto(rows[0].data) });
  } catch (e) { next(e); }
});

// ─── Anamnese clínica (dado de saúde) ─────────────────────────────────────
// Só a dona lê e escreve (e a nutricionista, pelo painel). Não entra em
// /me/dia, /me/perfil, IA nem WhatsApp.

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
    pedirGeracao(req.user.userId); // a lista verde depende da anamnese (lida só pelo código, pra decidir lote × revisão)
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
    // A Luna tria e escreve o rascunho pra Luciana em segundo plano; a
    // cliente recebe o "enviado" na hora.
    agendarRascunho(rows[0].id);
    res.status(201).json({ id: rows[0].id, created_at: rows[0].created_at });
  } catch (e) { next(e); }
});

// ─── Notificações (o sino) ────────────────────────────────────────────────
router.get('/notificacoes', async (req, res, next) => {
  try { res.json(await listar(req.user.userId, Math.min(50, parseInt(req.query.limite, 10) || 30))); } catch (e) { next(e); }
});
router.post('/notificacoes/lidas', async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((x) => /^[0-9a-f-]{36}$/i.test(String(x))) : null;
    await marcarLidas(req.user.userId, ids);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── Lista de compras pela Luna ───────────────────────────────────────────
// A tela Meu plano monta a lista no navegador (geral, por dia, por refeição).
// Aqui é o botão "Receber pela Luna no WhatsApp": a MESMA lista, montada no
// servidor, sai pelo bot. Dentro da janela de 24 h vai na hora; fora, sai o
// modelo (se aprovado) e a lista chega quando ela escrever.
router.post('/lista-compras/whatsapp', async (req, res, next) => {
  try {
    const ws = req.body?.week_start;
    if (!dataValida(ws) || diaDaSemana(ws) !== 1) throw erro('week_start precisa ser uma segunda-feira (YYYY-MM-DD)');
    const modo = ['geral', 'dia', 'refeicao'].includes(req.body?.modo) ? req.body.modo : 'geral';
    const { plano } = await planoDaLista(req.user.userId, ws);
    if (!plano) throw erro('Não há plano publicado nessa semana.', 404, 'SEM_PLANO');
    const r = await avisarListaCompras(req.user.userId, ws, modo);
    if (r === 'sem_whatsapp') throw erro('Vincule o seu WhatsApp primeiro (Perfil → Conectar o WhatsApp).', 409, 'SEM_WHATSAPP');
    res.json({ ok: true, quando: r });
  } catch (e) { next(e); }
});

// ─── WhatsApp (vínculo do número) ─────────────────────────────────────────
// A paciente gera um código aqui (logada) e manda DO WhatsApp dela pro número
// do bot: prova as duas pontas sem modelo pago de autenticação. Ver
// services/whatsapp/contatos.js.

router.get('/whatsapp', async (req, res, next) => {
  try {
    const c = await contatoDaUsuaria(req.user.userId);
    const numero = numeroDoBot();
    // Convite da compra (Hotmart) enviado e ainda sem resposta: a tela diz em
    // que número a Luna já escreveu, em vez de mandar gerar código.
    const { rows: [cv] } = c ? { rows: [] } : await getPool().query(
      `SELECT v.wa_id, v.enviado_em FROM whatsapp_convites v JOIN users u ON u.email = v.email
        WHERE u.id = $1 AND v.status = 'enviado' AND v.enviado_em > NOW() - interval '30 days'
        ORDER BY v.enviado_em DESC LIMIT 1`, [req.user.userId]);
    res.json({
      disponivel: Boolean(numero),
      numero_bot: numero,
      link: numero ? `https://wa.me/${numero}` : null,
      vinculado: Boolean(c),
      numero: c ? mascarar(c.wa_id) : null,
      vinculado_em: c?.vinculado_em || null,
      avisos: c ? !c.opt_out_em : null,
      convite: cv?.wa_id ? { numero: mascarar(cv.wa_id), enviado_em: cv.enviado_em } : null,
    });
  } catch (e) { next(e); }
});

router.post('/whatsapp/codigo', async (req, res, next) => {
  try {
    if (!numeroDoBot()) throw erro('O WhatsApp do Nutri Lu ainda não está no ar.', 503, 'WHATSAPP_OFF');
    res.status(201).json(await criarCodigoDeVinculo(req.user.userId));
  } catch (e) { next(e); }
});

// Desvincular: o número volta a ser "de ninguém". O histórico da conversa
// fica (some sozinho em 90 dias) e o diário não é tocado.
router.delete('/whatsapp', async (req, res, next) => {
  try {
    await getPool().query(`UPDATE whatsapp_contatos SET user_id = NULL, vinculado_em = NULL, estado = '{}', updated_at = NOW() WHERE user_id = $1`, [req.user.userId]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── Materiais (globais) ──────────────────────────────────────────────────

router.get('/materiais', async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `SELECT id, title, kind, url, file_key, meta, updated_at FROM materials WHERE active ORDER BY sort, created_at DESC`);
    // PDF guardado no R2: a URL assinada nasce aqui, na hora da leitura.
    const materiais = await Promise.all(rows.map(async (m) => ({
      id: m.id, title: m.title, kind: m.kind, meta: m.meta, updated_at: m.updated_at,
      url: m.file_key && r2Configurado() ? await urlDeLeitura(m.file_key).catch(() => m.url) : m.url,
    })));
    res.json({ materiais });
  } catch (e) { next(e); }
});

export default router;
