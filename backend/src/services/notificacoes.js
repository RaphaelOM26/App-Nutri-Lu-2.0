// Notificações da paciente (o sino da área de membros) e o INSIGHT SEMANAL
// da Luna.
//
// Pedido do Raphael em 18/09/2026: um lugar só pra "plano publicado",
// "a Nutri Luciana respondeu", "recado", "o time respondeu" e um comentário
// da Luna sobre a semana. Quem publica/responde chama notificar() DEPOIS do
// commit; nunca segura o request.
//
// Insight por IA: uma chamada curta por paciente por semana, rodando na fila
// (trabalho 'insight'), nunca no request. Entra SÓ o diário (calorias, dias
// registrados, água, peso): nada da anamnese clínica, como em toda IA daqui.
// Custo: ~US$ 0,003 por paciente por semana ≈ US$ 120/mês em 10 mil.

import { getPool } from '../db.js';
import { openai, MODEL } from './openai.js';
import { montarDia } from './diario.js';
import { enfileirar } from './whatsapp/fila.js';
import { comContextoDeUso } from './uso.js';
import { dataBR, somarDias, diaDaSemana, minutosBR } from '../utils/datas.js';

/**
 * Grava um aviso. `refId` evita duplicata (mesma paciente, mesmo tipo, mesma
 * referência): republicar o mês não gera dois "plano pronto".
 */
export async function notificar(userId, { tipo, titulo, texto = null, link = null, refId = null }) {
  try {
    await getPool().query(
      `INSERT INTO notificacoes (user_id, tipo, titulo, texto, link, ref_id) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, tipo, ref_id) WHERE ref_id IS NOT NULL DO UPDATE SET titulo = EXCLUDED.titulo, texto = EXCLUDED.texto, lida_em = NULL, created_at = NOW()`,
      [userId, tipo, String(titulo).slice(0, 120), texto ? String(texto).slice(0, 600) : null, link, refId ? String(refId).slice(0, 80) : null]);
  } catch (e) { console.warn('[notificacoes] não gravei:', e.message); }
}

export async function listar(userId, limite = 30) {
  const pool = getPool();
  const [{ rows }, { rows: [c] }] = await Promise.all([
    pool.query(`SELECT id, tipo, titulo, texto, link, lida_em, created_at FROM notificacoes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limite]),
    pool.query(`SELECT COUNT(*)::int AS n FROM notificacoes WHERE user_id = $1 AND lida_em IS NULL`, [userId]),
  ]);
  return { itens: rows, nao_lidas: c.n };
}

export async function marcarLidas(userId, ids = null) {
  if (ids?.length) await getPool().query(`UPDATE notificacoes SET lida_em = NOW() WHERE user_id = $1 AND lida_em IS NULL AND id = ANY($2)`, [userId, ids]);
  else await getPool().query(`UPDATE notificacoes SET lida_em = NOW() WHERE user_id = $1 AND lida_em IS NULL`, [userId]);
}

// ─── Insight semanal ──────────────────────────────────────────────────────

const SCHEMA = {
  name: 'insight_semanal', strict: true,
  schema: { type: 'object', additionalProperties: false, required: ['titulo', 'texto'], properties: {
    titulo: { type: 'string', description: 'Até 8 palavras, sem ponto final, com 1 emoji no máximo.' },
    texto: { type: 'string', description: '2 a 4 frases, em português do Brasil, falando com ela por "você".' },
  } },
};

/** Executor do trabalho 'insight': lê os últimos 7 dias do diário e pede um comentário curto à Luna. */
export async function gerarInsightSemanal({ userId, ate }) {
  const fim = ate || somarDias(dataBR(), -1);
  const pool = getPool();
  const { rows: [u] } = await pool.query(`SELECT display_name FROM users WHERE id = $1 AND role = 'cliente'`, [userId]);
  if (!u) return;
  const { rows: [ja] } = await pool.query(`SELECT 1 FROM notificacoes WHERE user_id = $1 AND tipo = 'insight' AND ref_id = $2`, [userId, `semana:${fim}`]);
  if (ja) return;

  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = somarDias(fim, -i);
    const x = await montarDia(userId, d);
    dias.push({ data: d, refeicoes: x.entries.length, kcal: x.consumido.kcal, p: x.consumido.p, agua: x.water_ml, meta: x.targets?.kcal || x.estimativa?.kcal?.[1] || null, peso: x.peso?.date === d ? x.peso.kg : null });
  }
  const registrados = dias.filter((d) => d.refeicoes > 0);
  if (registrados.length === 0) return; // sem diário não há o que comentar (e não custa)
  const primeiro = String(u.display_name || '').trim().split(/\s+/)[0] || 'você';
  const meta = dias.find((d) => d.meta)?.meta || null;
  const pesos = dias.filter((d) => d.peso != null).map((d) => d.peso);
  const { rows: pesoAntes } = await pool.query(`SELECT kg FROM weight_log WHERE user_id = $1 AND date < $2 ORDER BY date DESC LIMIT 1`, [userId, somarDias(fim, -6)]);
  const resumo = [
    `Nome: ${primeiro}. Semana de ${somarDias(fim, -6)} a ${fim}.`,
    `Dias com registro: ${registrados.length} de 7.`,
    meta ? `Meta de calorias: ${meta} kcal/dia. Média nos dias registrados: ${Math.round(registrados.reduce((a, d) => a + d.kcal, 0) / registrados.length)} kcal.` : 'Sem meta definida ainda (plano não publicado).',
    `Média de proteína: ${Math.round(registrados.reduce((a, d) => a + d.p, 0) / registrados.length)} g/dia. Água média: ${Math.round(registrados.reduce((a, d) => a + d.agua, 0) / registrados.length)} ml/dia.`,
    pesos.length ? `Peso registrado na semana: ${pesos.join(', ')} kg${pesoAntes[0] ? ` (antes: ${pesoAntes[0].kg} kg)` : ''}.` : 'Sem pesagem na semana.',
    `Dia a dia: ${dias.map((d) => `${d.data.slice(5)}: ${d.refeicoes ? `${d.kcal} kcal` : 'sem registro'}`).join(' · ')}`,
  ].join('\n');

  const r = await comContextoDeUso({ rota: 'insight-semanal', userId }, () => openai.chat.completions.create({
    model: MODEL, temperature: 0.7, max_completion_tokens: 300,
    response_format: { type: 'json_schema', json_schema: SCHEMA },
    messages: [
      { role: 'system', content: 'Você é a Luna, assistente de IA da Nutri Luciana no Nutri Lu. Escreva um comentário CURTO e caloroso sobre a semana da paciente, a partir SÓ dos números abaixo: o que foi bem, uma coisa concreta pra próxima semana. Nunca fale de saúde, doença, remédio ou dieta restritiva; nunca invente números; nunca julgue. Se faltaram registros, incentive registrar mesmo por cima. Não se apresente como nutricionista.' },
      { role: 'user', content: resumo },
    ],
  }));
  let dados; try { dados = JSON.parse(r.choices?.[0]?.message?.content || '{}'); } catch { dados = null; }
  if (!dados?.texto) return;
  await notificar(userId, { tipo: 'insight', titulo: dados.titulo || 'Sua semana, pela Luna', texto: dados.texto, link: '/evolucao', refId: `semana:${fim}` });
}

/**
 * Varredura (de hora em hora): segunda às 8 h (BR) enfileira o insight da
 * semana anterior pra quem registrou ao menos um dia. O executor dedupe pelo
 * ref_id, então rodar duas vezes não custa duas vezes.
 */
export async function varrerInsights({ forcar = false } = {}) {
  const hoje = dataBR();
  if (!forcar && !(diaDaSemana(hoje) === 1 && Math.floor(minutosBR() / 60) === 8)) return;
  const fim = somarDias(hoje, -1);
  const { rows } = await getPool().query(
    `SELECT u.id FROM users u JOIN client_profiles c ON c.user_id = u.id
      WHERE u.role = 'cliente' AND c.data ? 'onboarding_em'
        AND EXISTS (SELECT 1 FROM meal_entries e WHERE e.user_id = u.id AND e.date >= $1 AND e.date <= $2)
        AND NOT EXISTS (SELECT 1 FROM notificacoes n WHERE n.user_id = u.id AND n.tipo = 'insight' AND n.ref_id = $3)
        AND NOT EXISTS (SELECT 1 FROM whatsapp_fila f WHERE f.tipo = 'insight' AND f.chave = 'insight:' || u.id::text AND f.status IN ('pendente', 'processando'))
      LIMIT 2000`, [somarDias(fim, -6), fim, `semana:${fim}`]);
  for (const r of rows) await enfileirar('insight', `insight:${r.id}`, { userId: r.id, ate: fim });
  if (rows.length) console.log(`[insight] ${rows.length} insight(s) semanal(is) enfileirado(s)`);
  return rows.length;
}
