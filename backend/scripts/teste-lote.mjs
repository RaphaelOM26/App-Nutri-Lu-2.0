// Teste de ponta a ponta da APROVAÇÃO EM LOTE (/nutri/lote/*), contra um
// servidor LOCAL com ALLOW_DEV_LOGIN=1 e sem SMTP (scripts/dev-local.mjs).
//
//   node scripts/teste-lote.mjs [http://localhost:3101]
//
// Cobre: geração automática do rascunho pelo trabalhador, lista verde (apta
// × caneta emagrecedora), calibração fechada/aberta, lote com amostra,
// conferir → aprovar → plano ativo pra cliente, e a trava do lote quando a
// nutri corrige alguém da amostra.

import 'dotenv/config';
import pg from 'pg';

const BASE = process.argv[2] || 'http://localhost:3101';
const stamp = Date.now();
const NUTRI = `teste-lote-nutri-${stamp}@example.com`;
const HOJE = new Date().toISOString().slice(0, 10);
let falhas = 0;

const url = new URL(process.env.DATABASE_URL); url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: url.hostname.includes('railway') || url.hostname.includes('rlwy') ? { rejectUnauthorized: false } : undefined });

async function chamar(token, metodo, rota, body, esperado = 200) {
  const res = await fetch(`${BASE}${rota}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
  const ok = res.status === esperado; if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${metodo} ${rota} → ${res.status}${ok ? '' : ` (esperava ${esperado}) ${JSON.stringify(data).slice(0, 260)}`}`);
  return data;
}
const check = (cond, msg, extra) => { if (!cond) { falhas++; console.log(`✘ ${msg}${extra ? `\n    ${String(extra).slice(0, 300)}` : ''}`); } else console.log(`✔ ${msg}`); };
async function login(email) {
  const r = await chamar(null, 'POST', '/auth/email/request', { email });
  if (!r?.dev_code) { console.error('sem dev_code: servidor precisa estar SEM SMTP e com ALLOW_DEV_LOGIN=1'); process.exit(1); }
  return chamar(null, 'POST', '/auth/email/verify', { email, code: r.dev_code });
}
const esperar = async (fn, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await fn(); if (r) return r; await new Promise((x) => setTimeout(x, 700)); } return null; };

const PERFIL_BASE = { sexo: 'feminino', nascimento: '1990-05-10', altura_cm: 165, objetivo: 'perder', meta_kg: 64, atividade: 'leve', restricoes: ['sem-lactose'], gestante: 'nao', indispensavel: 'arroz e feijão no almoço', dor: 'Como bem na semana e perco no fim de semana.', onboarding_em: new Date().toISOString() };
const ANAMNESE_LIMPA = { doencas: '', medicamentos_usa: 'nao', intestino: 'regular', alcool: 'social', perda_controle: 'nao', sintomas: 'nenhum', caneta_usa: 'nao', suplementacao: { usa: 'sim', quais: 'whey' } };

/** Cria uma cliente com cadastro completo e devolve { token, id }. */
async function cliente(nome, perfil = {}, anamnese = {}) {
  const c = await login(`teste-lote-${nome}-${stamp}@example.com`);
  await chamar(c.token, 'PUT', '/me/perfil', { perfil: { nome, ...PERFIL_BASE, ...perfil } });
  await chamar(c.token, 'POST', '/me/peso', { date: HOJE, kg: 70 });
  await chamar(c.token, 'PUT', '/me/anamnese-clinica', { consentimento: true, data: { ...ANAMNESE_LIMPA, ...anamnese } });
  return { token: c.token, id: c.user.id };
}
const naFila = (tN, secao, id) => esperar(async () => { const f = await chamar(tN, 'GET', `/nutri/lote/fila?secao=${secao}&limite=100`); return f.itens?.find((i) => i.user_id === id) || null; });

// 0. Limpa o que ficou de rodadas anteriores (a calibração é global por perfil).
await pool.query(`DELETE FROM planos_lotes WHERE criado_por IN (SELECT id FROM users WHERE email LIKE 'teste-lote-%')`);
await pool.query(`DELETE FROM users WHERE email LIKE 'teste-lote-%'`);

// 1. Nutri + duas clientes: uma apta, uma com caneta emagrecedora
const nutri = await login(NUTRI);
await pool.query(`UPDATE users SET role = 'nutri' WHERE email = $1`, [NUTRI]);
const tN = nutri.token;
const apta = await cliente('Apta');
const caneta = await cliente('Caneta', {}, { caneta_usa: 'sim', caneta_qual: 'Ozempic' });

// O cadastro enfileira com 90 s de espera; aqui pedimos "agora".
await chamar(tN, 'POST', `/nutri/lote/gerar/${apta.id}`);
await chamar(tN, 'POST', `/nutri/lote/gerar/${caneta.id}`);
const itemApta = await naFila(tN, 'prontos', apta.id);
check(itemApta, 'cliente apta aparece em "prontos pro lote"');
check(itemApta && itemApta.motivos_revisao.length === 0 && itemApta.targets?.kcal >= 1200, 'apta: sem motivos e meta acima do piso', JSON.stringify(itemApta?.targets));
check(itemApta?.perfil_chave === 'perder:feminino', 'perfil_chave = objetivo:sexo');
const itemCaneta = await naFila(tN, 'revisao', caneta.id);
check(itemCaneta && itemCaneta.motivos_revisao.includes('caneta emagrecedora'), 'caneta emagrecedora vai pra revisão individual com o motivo', JSON.stringify(itemCaneta?.motivos_revisao));
const { rows: linhas } = await pool.query(`SELECT week_index, status, created_by, jsonb_array_length(days) AS dias FROM meal_plans WHERE user_id = $1 ORDER BY week_start`, [apta.id]);
check(linhas.length === 4 && linhas.every((l) => l.status === 'rascunho' && l.created_by === 'sistema' && l.dias === 7), '4 semanas de rascunho do sistema, 7 dias cada');
// O rascunho do sistema NÃO aparece pra cliente
const planoCli = await chamar(apta.token, 'GET', `/me/plano?date=${HOJE}`);
check(!planoCli.plano, 'cliente ainda não vê plano (rascunho não publicado)');

// 2. Calibração fechada: lote recusado
await chamar(tN, 'POST', '/nutri/lote/lotes', { user_ids: [apta.id] }, 409);
await chamar(tN, 'POST', '/nutri/lote/lotes', { user_ids: [caneta.id] }, 409);

// 3. Abre a calibração do perfil: 20 rascunhos do sistema publicados um a um sem correção
// (usuárias criadas direto no banco: o login tem limite de 30 pedidos por IP)
for (let i = 0; i < 20; i++) {
  const email = `teste-lote-cal${i}-${stamp}@example.com`;
  const { rows: [c] } = await pool.query(`INSERT INTO users (provider, provider_sub, display_name, email) VALUES ('email', $1, 'Cal', $1) RETURNING id`, [email]);
  await pool.query(
    `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, days, status, created_by, elegivel_lote, perfil_chave, regras_versao, aprovacao, published_at)
     VALUES ($1, '2026-01-05', 1, 4, '{"kcal":1500}', '[]', 'ativo', 'sistema', TRUE, 'perder:feminino', 'x', 'individual', NOW())`, [c.id]);
}
const cal = await chamar(tN, 'GET', '/nutri/lote/calibracao');
check(cal.perfis?.['perder:feminino']?.liberado === true, 'perfil perder:feminino liberado (20 publicados, 0 corrigidos)');

// 4. Lote com amostra → conferir → aprovar
const lote = await chamar(tN, 'POST', '/nutri/lote/lotes', { user_ids: [apta.id] }, 201);
check(lote.lote?.amostra?.includes(apta.id), 'com 1 paciente, ela mesma é a amostra');
await chamar(tN, 'POST', `/nutri/lote/lotes/${lote.lote.id}/aprovar`, {}, 409);
await chamar(tN, 'POST', `/nutri/lote/lotes/${lote.lote.id}/conferir`, { user_id: apta.id });
const ap = await chamar(tN, 'POST', `/nutri/lote/lotes/${lote.lote.id}/aprovar`, {});
check(ap.publicados?.length === 1 && ap.excluidos?.length === 0, 'lote aprovado: 1 publicada, 0 excluídas', JSON.stringify(ap.excluidos));
const { rows: pub } = await pool.query(`SELECT status, aprovacao, aprovado_por, published_at FROM meal_plans WHERE user_id = $1`, [apta.id]);
check(pub.length === 4 && pub.every((p) => p.status === 'ativo' && p.aprovacao === 'lote' && p.aprovado_por === nutri.user.id && p.published_at), '4 semanas ativas, aprovação = lote, assinada pela nutri');
const planoDepois = await chamar(apta.token, 'GET', `/me/plano?date=${HOJE}`);
check(planoDepois.plano?.week_index === 1 && planoDepois.plano?.dias?.length === 7, 'cliente vê a semana 1 do plano publicado');
const perfilDepois = await chamar(apta.token, 'GET', '/me/perfil');
check(perfilDepois.perfil?.targets?.kcal === itemApta.targets.kcal, 'metas do plano entraram no perfil da cliente');
check((await naFila(tN, 'prontos', apta.id, 2000)) === null, 'apta saiu da fila');

// 5. Correção na amostra trava o lote
const a2 = await cliente('Apta2'); const a3 = await cliente('Apta3');
await chamar(tN, 'POST', `/nutri/lote/gerar/${a2.id}`); await chamar(tN, 'POST', `/nutri/lote/gerar/${a3.id}`);
check(await naFila(tN, 'prontos', a2.id) && await naFila(tN, 'prontos', a3.id), 'duas novas aptas na fila');
const lote2 = await chamar(tN, 'POST', '/nutri/lote/lotes', { user_ids: [a2.id, a3.id] }, 201);
check(lote2.lote?.amostra?.length === 2, 'lote de 2 → amostra de 2');
const alvo = lote2.lote.amostra[0];
const mes = await chamar(tN, 'GET', `/nutri/pacientes/${alvo}/plano-mes?inicio=${lote2.lote.membros[0].inicio}`);
check(mes.sistema?.lote_id === lote2.lote.id && mes.sistema?.elegivel_lote === true, 'editor recebe o veredito e o lote do rascunho do sistema');
// A nutri tira a primeira refeição do dia 1 da semana 1 e salva
const weeks = mes.semanas.map((s) => ({ days: s.plano.days }));
weeks[0].days[0].meals = weeks[0].days[0].meals.slice(1);
await chamar(tN, 'PUT', `/nutri/pacientes/${alvo}/plano-mes`, { inicio: mes.inicio, weeks, targets: mes.semanas[0].plano.targets, publicar: false });
const l2 = await chamar(tN, 'GET', `/nutri/lote/lotes/${lote2.lote.id}`);
check(l2.lote?.status === 'travado', 'lote travou com a correção na amostra', l2.lote?.status);
const { rows: travados } = await pool.query(`SELECT user_id, elegivel_lote, motivos_revisao, lote_id, alterado_pela_nutri FROM meal_plans WHERE user_id = ANY($1) AND week_index = 1`, [[a2.id, a3.id]]);
check(travados.every((t) => t.elegivel_lote === false && t.lote_id === null && t.motivos_revisao.includes('lote travado: correção na amostra')), 'as duas foram pra revisão individual');
check(travados.find((t) => t.user_id === alvo)?.alterado_pela_nutri === true, 'a corrigida conta como correção na calibração');
// Publicar individual de quem NÃO mudou nada: não conta como correção
const outra = alvo === a2.id ? a3.id : a2.id;
const mes2 = await chamar(tN, 'GET', `/nutri/pacientes/${outra}/plano-mes?inicio=${lote2.lote.membros[0].inicio}`);
await chamar(tN, 'PUT', `/nutri/pacientes/${outra}/plano-mes`, { inicio: mes2.inicio, weeks: mes2.semanas.map((s) => ({ days: s.plano.days })), targets: mes2.semanas[0].plano.targets, publicar: true, avisar: false });
const { rows: [semMudar] } = await pool.query(`SELECT status, aprovacao, alterado_pela_nutri FROM meal_plans WHERE user_id = $1 AND week_index = 1`, [outra]);
check(semMudar.status === 'ativo' && semMudar.aprovacao === 'individual' && semMudar.alterado_pela_nutri === false, 'publicada sem mudar: individual, não conta como correção');
const cal2 = await chamar(tN, 'GET', '/nutri/lote/calibracao');
check(cal2.perfis['perder:feminino'].publicados === 21 && cal2.perfis['perder:feminino'].corrigidos === 0, 'calibração: 21 publicados, 0 corrigidos');

// 6. Cliente comum não entra
await chamar(apta.token, 'GET', '/nutri/lote/fila', null, 403);

await pool.end();
console.log(falhas ? `\n✘ ${falhas} falha(s)` : '\n✔ tudo passou');
process.exit(falhas ? 1 : 0);
