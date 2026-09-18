// Geração AUTOMÁTICA do rascunho do mês (trabalho 'plano' da fila).
//
// Quando roda: a paciente terminou o cadastro ou a anamnese (routes/cliente.js
// enfileira), e uma varredura por hora pega quem ficou pra trás e quem está
// no fim do mês de plano (renovação). O trabalho é idempotente: se a Luciana
// já mexeu no mês, ele não encosta.
//
// O que grava: 4 linhas em meal_plans (uma por semana), status 'rascunho',
// created_by 'sistema', com o veredito da lista verde (elegivel_lote +
// motivos_revisao) e a versão das regras. NADA é publicado aqui: publicar é
// sempre um clique da Luciana (individual ou em lote).

import { getPool } from '../../db.js';
import { enfileirar, acordar } from '../whatsapp/fila.js';
import { inicioDaSemana, somarDias, dataBR } from '../../utils/datas.js';
import { gerarRascunho, ajustarPorcoes } from '../plano/gerador.js';
import { normalizarItens } from '../diario.js';
import { avaliarPaciente, metasPara, checarPlano } from './elegibilidade.js';
import { REGRAS, VERSAO } from './regras.js';

const N = REGRAS.semanasNoMes;

/**
 * Pede a geração. Um pedido pendente por paciente: se já há um esperando,
 * só adianta a hora dele (o cadastro dispara vários PUTs seguidos; e um
 * pedido "agora" não pode ficar atrás de um agendado pra daqui a 90 s, porque
 * a fila serializa por chave).
 */
export async function pedirGeracao(userId, { emSegundos = 90 } = {}) {
  try {
    const chave = `plano:${userId}`;
    const { rowCount } = await getPool().query(
      `UPDATE whatsapp_fila SET disponivel_em = LEAST(disponivel_em, NOW() + ($2 || ' seconds')::interval)
        WHERE tipo = 'plano' AND chave = $1 AND status = 'pendente'`, [chave, String(emSegundos)]);
    if (rowCount) { acordar(); return; }
    await enfileirar('plano', chave, { userId }, { emSegundos });
  } catch (e) { console.warn('[lote] não enfileirei a geração:', e.message); }
}

/**
 * Onde o próximo mês começa pra esta paciente: a segunda desta semana, ou a
 * semana seguinte ao último plano ativo (mesma regra do editor da web).
 * Devolve null quando o mês já tem linha da nutri (não é nosso assunto).
 */
async function proximoInicio(userId) {
  const hoje = dataBR(); const atual = inicioDaSemana(hoje);
  const { rows } = await getPool().query(`SELECT week_start, status, created_by, alterado_pela_nutri FROM meal_plans WHERE user_id = $1 ORDER BY week_start`, [userId]);
  const ativos = rows.filter((r) => r.status === 'ativo').map((r) => r.week_start);
  const inicio = ativos.includes(atual) ? somarDias(ativos[ativos.length - 1], 7) : atual;
  const semanas = Array.from({ length: N }, (_, i) => somarDias(inicio, 7 * i));
  const existentes = rows.filter((r) => semanas.includes(r.week_start));
  // Linha da nutri (ou rascunho do sistema que ela já editou) no mês: não mexe.
  if (existentes.some((r) => r.created_by !== 'sistema' || r.status !== 'rascunho' || r.alterado_pela_nutri)) return null;
  return { inicio, semanas };
}

/** Executor do trabalho 'plano'. */
export async function gerarPlanoAutomatico({ userId }) {
  const alvo = await proximoInicio(userId);
  if (!alvo) return;
  const aval = await avaliarPaciente(userId);
  const d = aval.dados;
  if (!d || !d.onboardingFeito) return;

  const metas = metasPara(d);
  const motivos = [...aval.motivos];
  let semanas = [];
  let targets = metas?.targets || null;
  if (!metas) motivos.push('sem dados pra calcular as metas');
  else {
    // 4 sementes = 4 semanas diferentes com as MESMAS regras (como "variar entre semanas" no editor).
    // Cada refeição passa pelo MESMO normalizador do editor (normalizarItens):
    // assim o que o sistema grava é byte a byte o que a web devolveria sem
    // mexer, e "a Luciana alterou?" vira uma comparação simples.
    semanas = Array.from({ length: N }, (_, i) => ({
      days: ajustarPorcoes(gerarRascunho({ alvo: targets, restricoes: d.restricoes, naoGosta: d.naoGosta, alergias: d.alergias, indispensavel: d.indispensavel, semente: i + 1 }), targets, REGRAS.toleranciaMeta)
        .map((dia) => ({ weekday: dia.weekday, meals: dia.meals.map((m) => { const { itens, tot } = normalizarItens(m.items); return { slot: m.slot, time: m.time, name: m.name, code: m.code, items: itens, ...tot }; }) })),
    }));
    if (semanas.some((s) => s.days.some((dia) => !dia.meals.length))) motivos.push('o gerador não achou receita pra algum dia');
    motivos.push(...checarPlano(semanas, targets, d));
  }
  const elegivel = motivos.length === 0;
  const unicos = [...new Set(motivos)];

  const c = await getPool().connect();
  try {
    await c.query('BEGIN');
    for (const [i, ws] of alvo.semanas.entries()) {
      const days = semanas[i]?.days || [];
      await c.query(
        `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, note, days, status, created_by,
                                 elegivel_lote, motivos_revisao, perfil_chave, regras_versao, gerado_em)
         VALUES ($1, $2, $3, $4, $5, NULL, $6, 'rascunho', 'sistema', $7, $8, $9, $10, NOW())
         ON CONFLICT (user_id, week_start) DO UPDATE SET
           week_index = EXCLUDED.week_index, week_total = EXCLUDED.week_total, targets = EXCLUDED.targets, days = EXCLUDED.days,
           elegivel_lote = EXCLUDED.elegivel_lote, motivos_revisao = EXCLUDED.motivos_revisao, perfil_chave = EXCLUDED.perfil_chave,
           regras_versao = EXCLUDED.regras_versao, gerado_em = NOW(), updated_at = NOW()
         WHERE meal_plans.created_by = 'sistema' AND meal_plans.status = 'rascunho' AND NOT meal_plans.alterado_pela_nutri AND meal_plans.lote_id IS NULL`,
        [userId, ws, i + 1, N, JSON.stringify(targets || {}), JSON.stringify(days), elegivel, JSON.stringify(unicos), aval.perfil_chave, VERSAO]);
    }
    await c.query('COMMIT');
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; } finally { c.release(); }
  console.log(`[lote] rascunho gerado pra ${userId.slice(0, 8)}… (${alvo.inicio}): ${elegivel ? 'apto pro lote' : `revisão: ${unicos.slice(0, 3).join(', ')}`}`);
}

/**
 * Varredura (1×/hora): quem terminou o cadastro e não tem plano nem rascunho
 * pra esta semana, e quem está na última semana do mês ativo sem o próximo.
 * Só enfileira; cada geração roda no trabalhador, uma por vez por paciente.
 */
export async function varrerPacientesSemPlano() {
  const hoje = dataBR(); const ws = inicioDaSemana(hoje); const prox = somarDias(ws, 7);
  const { rows } = await getPool().query(
    `SELECT u.id FROM users u JOIN client_profiles c ON c.user_id = u.id
      WHERE u.role = 'cliente' AND c.data ? 'onboarding_em'
        AND NOT EXISTS (SELECT 1 FROM whatsapp_fila f WHERE f.tipo = 'plano' AND f.chave = 'plano:' || u.id::text AND f.status IN ('pendente', 'processando'))
        AND (
          NOT EXISTS (SELECT 1 FROM meal_plans m WHERE m.user_id = u.id AND m.week_start = $1)
          -- regras (ou gerador) mudaram: rascunho do sistema ainda intocado é refeito
          OR EXISTS (SELECT 1 FROM meal_plans m WHERE m.user_id = u.id AND m.created_by = 'sistema' AND m.status = 'rascunho'
                        AND NOT m.alterado_pela_nutri AND m.lote_id IS NULL AND m.regras_versao IS DISTINCT FROM $3)
          OR EXISTS (SELECT 1 FROM meal_plans m WHERE m.user_id = u.id AND m.status = 'ativo' AND m.week_start = $1 AND m.week_index = m.week_total
                        AND NOT EXISTS (SELECT 1 FROM meal_plans n WHERE n.user_id = u.id AND n.week_start = $2))
        )
      LIMIT 500`, [ws, prox, VERSAO]);
  for (const r of rows) await pedirGeracao(r.id, { emSegundos: 0 });
  if (rows.length) console.log(`[lote] varredura: ${rows.length} geração(ões) pedida(s)`);
}
