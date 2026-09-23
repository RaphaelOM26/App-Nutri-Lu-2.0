// Leitura do diário de UMA cliente, compartilhada entre as rotas da própria
// cliente (/me/*) e as do painel da nutricionista (/nutri/*).
//
// Existe pra que "o dia da Mariana" seja calculado por um código só: o que
// ela vê na tela Meu plano é exatamente o que a Luciana vê na ficha dela.
// Nada aqui checa permissão — quem chama já decidiu que pode ler aquele
// userId. Nada aqui lê a anamnese clínica.

import { getPool } from '../db.js';
import { temAcesso } from './billing.js';
import { urlDeLeitura, r2Configurado } from './r2.js';
import { somarDias, diaDaSemana, inicioDaSemana } from '../utils/datas.js';

export const SLOTS = ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'];
export const FONTES = ['manual', 'taco', 'receita', 'plano', 'foto', 'audio', 'whatsapp'];

export const erro = (msg, status = 400, code = 'BAD_REQUEST') => Object.assign(new Error(msg), { status, code });
const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
export const r1 = (v) => Math.round(v * 10) / 10;

/** Valida e normaliza a lista de itens de uma refeição; devolve itens + totais. */
export function normalizarItens(bruto) {
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

export function exigirSlot(s) {
  if (!SLOTS.includes(s)) throw erro(`slot inválido (use ${SLOTS.join(', ')})`);
  return s;
}

export async function comFotoUrl(rows) {
  if (!r2Configurado()) return rows.map((r) => ({ ...r, photoUrl: null }));
  return Promise.all(rows.map(async (r) => ({ ...r, photoUrl: r.photo_key ? await urlDeLeitura(r.photo_key).catch(() => null) : null })));
}

export const numeros = (r) => ({ ...r, kcal: Number(r.kcal), p: Number(r.p), c: Number(r.c), f: Number(r.f) });

// ─── Plano da semana ──────────────────────────────────────────────────────

export async function planoDaData(userId, date) {
  const ws = inicioDaSemana(date);
  const { rows } = await getPool().query(
    `SELECT * FROM meal_plans WHERE user_id = $1 AND week_start = $2 AND status = 'ativo' LIMIT 1`,
    [userId, ws],
  );
  return rows[0] || null;
}

/** O dia do plano, já com as trocas que a cliente fez aplicadas. */
export function diaDoPlano(plano, date) {
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

/** Os 7 dias do plano com data e trocas aplicadas (formato do GET /me/plano). */
export function planoResumido(plano) {
  if (!plano) return null;
  const ws = plano.week_start;
  const dias = (plano.days || []).map((d) => {
    const data = somarDias(ws, Number(d.weekday) - 1);
    return { ...diaDoPlano(plano, data), date: data };
  });
  return { id: plano.id, week_start: ws, week_index: plano.week_index, week_total: plano.week_total, targets: plano.targets, note: plano.note, status: plano.status, published_at: plano.published_at || null, dias };
}

// ─── Streak e adesão ──────────────────────────────────────────────────────

export async function diasComRegistro(userId, de, ate) {
  const { rows } = await getPool().query(
    `SELECT DISTINCT date FROM meal_entries WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
    [userId, de, ate],
  );
  return new Set(rows.map((r) => r.date));
}

/** Dias seguidos com registro, terminando hoje ou ontem (hoje ainda pode vir). */
export function streakDe(dias, hoje) {
  let d = dias.has(hoje) ? hoje : somarDias(hoje, -1);
  let n = 0;
  while (dias.has(d)) { n += 1; d = somarDias(d, -1); }
  return n;
}

// ─── O dia inteiro (tela Hoje / Meu plano / ficha da paciente) ────────────

export async function montarDia(userId, date) {
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

  return {
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
  };
}

// ─── Evolução (peso, medidas, fotos, adesão) ──────────────────────────────

export async function montarEvolucao(userId, hoje) {
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
  return {
    pesos: pesos.rows.map((r) => ({ date: r.date, kg: Number(r.kg) })),
    meta_kg: perfil.rows[0]?.data?.meta_kg ?? null,
    medidas: medidas.rows,
    fotos: fotosUrl.map((f) => ({ id: f.id, date: f.date, weight_kg: f.weight_kg ? Number(f.weight_kg) : null, url: f.photoUrl })),
    adesao: semanas,
    streak: streakDe(todos, hoje),
  };
}

// ─── Perfil ───────────────────────────────────────────────────────────────

export const CAMPOS_PERFIL = new Set([
  'nome', 'sexo', 'nascimento', 'altura_cm', 'meta_kg', 'objetivo', 'atividade', 'sono', 'sono_horas', 'refeicoes_por_dia',
  'nao_gosta', 'restricoes', 'alergias', 'indispensavel', 'limitacoes', 'dia_normal', 'mais_fome', 'doces', 'doces_quando', 'agua_litros',
  'barreiras', 'motivacoes', 'dor', 'desejo', 'urgencia', 'lembretes', 'whatsapp',
  // Onboarding web: quando terminou e a estimativa em faixa (referência até
  // a nutricionista aprovar o plano). foto_key é a foto de perfil no R2.
  'onboarding_em', 'estimativa', 'foto_key',
  // Gestante ou amamentando: 'nao' | 'gravida' | 'amamentando'. Tira do lote
  // de aprovação (services/lote); não é dado clínico, é do cadastro.
  'gestante',
  // Variedade das refeições (23/09): 'simples' | 'media' | 'variada'. Regra do gerador.
  'variedade',
]);

/** Campos clínicos (dado de saúde). Só a dona e o painel da nutri (papel nutri) leem. */
export const CAMPOS_CLINICOS = new Set([
  'doencas', 'historico_familiar', 'medicamentos_usa', 'medicamentos', 'suplementos_usa', 'suplementos', 'alergias',
  'perda_controle', 'perda_controle_quando', 'intestino', 'sintomas', 'alcool', 'exames',
  // Caneta emagrecedora (pedido do Raphael, 17/09): usa? qual? há quanto tempo? dose? última dose?
  'caneta_usa', 'caneta_qual', 'caneta_tempo', 'caneta_dose', 'caneta_ultima_dose',
  // Rastreio de suplementação: objeto { usa, quais, <id da pergunta>: 'sim'|'nao' }
  'suplementacao',
]);

/** Perfil com a URL assinada da foto (a chave nunca sai crua pro navegador). */
export async function perfilComFoto(data) {
  const p = { ...(data || {}) };
  const key = p.foto_key; delete p.foto_key;
  p.foto_url = key && r2Configurado() ? await urlDeLeitura(key).catch(() => null) : null;
  return p;
}
