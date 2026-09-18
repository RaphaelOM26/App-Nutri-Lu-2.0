// Aprovação em LOTE — rotas /nutri/lote/*. Só o papel `nutri` aprova; `admin`
// pode ver a fila e a calibração.
//
// O fluxo (decidido com o Raphael em 18/09/2026, doc "Critérios da aprovação
// em lote"):
//   1. O sistema gera o rascunho do mês (services/lote/gerar.js) e diz se
//      cabe no lote (lista verde) ou por que precisa da Luciana.
//   2. A fila mostra "prontos pro lote" e "precisam de você".
//   3. Ela marca até 10 do MESMO perfil; o sistema sorteia 2 de amostra.
//   4. Ela abre os 2 no editor e confirma. Se corrigir qualquer um, o lote
//      inteiro trava e todos vão pra revisão individual.
//   5. "Aprovar lote" confere tudo DE NOVO (regras de agora) e publica.
//   Calibração: o lote de um perfil só abre depois de 20 rascunhos do sistema
//   publicados um a um com menos de 5% de correção.

import { Router } from 'express';
import { getPool } from '../db.js';
import { requirePapel } from '../services/auth.js';
import { erro } from '../services/diario.js';
import { enviarPlanoPronto } from '../services/email.js';
import { avisarPlanoPronto } from '../services/whatsapp/avisos.js';
import { somarDias } from '../utils/datas.js';
import { avaliarPaciente, checarPlano } from '../services/lote/elegibilidade.js';
import { REGRAS, VERSAO } from '../services/lote/regras.js';
import { pedirGeracao } from '../services/lote/gerar.js';
import { notificar } from '../services/notificacoes.js';

const router = Router();
const equipe = requirePapel('nutri', 'admin');
const soNutri = requirePapel('nutri');
const uuid = (s) => /^[0-9a-f-]{36}$/i.test(String(s || ''));

// ─── Calibração por perfil ────────────────────────────────────────────────

/** Por perfil: quantos rascunhos do sistema a Luciana já publicou um a um e quantos corrigiu. */
async function calibracao() {
  const { rows } = await getPool().query(
    `SELECT perfil_chave, COUNT(*)::int AS publicados, COUNT(*) FILTER (WHERE alterado_pela_nutri)::int AS corrigidos
       FROM meal_plans WHERE created_by = 'sistema' AND status = 'ativo' AND week_index = 1 AND aprovacao = 'individual'
      GROUP BY perfil_chave`);
  const out = {};
  for (const r of rows) {
    const taxa = r.publicados ? r.corrigidos / r.publicados : 0;
    out[r.perfil_chave] = { publicados: r.publicados, corrigidos: r.corrigidos, taxa, liberado: r.publicados >= REGRAS.calibracao.minimoPublicados && taxa < REGRAS.calibracao.taxaMaxCorrecao };
  }
  return out;
}
const liberado = (cal, chave) => Boolean(cal[chave]?.liberado);

router.get('/calibracao', equipe, async (req, res, next) => {
  try { res.json({ regras: { versao: VERSAO, ...REGRAS }, perfis: await calibracao() }); } catch (e) { next(e); }
});

// ─── A fila ───────────────────────────────────────────────────────────────

router.get('/fila', equipe, async (req, res, next) => {
  try {
    const secao = req.query.secao === 'revisao' ? 'revisao' : 'prontos';
    const limite = Math.min(100, Math.max(1, parseInt(req.query.limite, 10) || 30));
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const cond = secao === 'prontos' ? 'm.elegivel_lote' : 'NOT m.elegivel_lote';
    const pool = getPool();
    const base = `FROM meal_plans m JOIN users u ON u.id = m.user_id
                  WHERE m.created_by = 'sistema' AND m.status = 'rascunho' AND m.week_index = 1 AND NOT m.alterado_pela_nutri`;
    const [itens, cont, cal] = await Promise.all([
      pool.query(
        `SELECT m.user_id, u.display_name AS nome, u.email, m.week_start AS inicio, m.perfil_chave, m.elegivel_lote, m.motivos_revisao,
                m.targets, m.gerado_em, m.regras_versao, m.lote_id
           ${base} AND ${cond}
          ORDER BY m.gerado_em ASC LIMIT $1 OFFSET $2`, [limite, (pagina - 1) * limite]),
      pool.query(`SELECT COUNT(*) FILTER (WHERE m.elegivel_lote)::int AS prontos, COUNT(*) FILTER (WHERE NOT m.elegivel_lote)::int AS revisao ${base}`),
      calibracao(),
    ]);
    res.json({
      secao, pagina, limite, contagens: cont.rows[0], calibracao: cal, regras: { versao: VERSAO, tamanhoLote: REGRAS.tamanhoLote, amostraPorLote: REGRAS.amostraPorLote, ...REGRAS.calibracao },
      itens: itens.rows.map((r) => ({ ...r, perfil_liberado: liberado(cal, r.perfil_chave) })),
    });
  } catch (e) { next(e); }
});

/** Pede pra gerar (ou gerar de novo) o rascunho de uma paciente. */
router.post('/gerar/:userId', soNutri, async (req, res, next) => {
  try {
    if (!uuid(req.params.userId)) throw erro('id inválido', 404, 'NOT_FOUND');
    await pedirGeracao(req.params.userId, { emSegundos: 0 });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ─── Lotes ────────────────────────────────────────────────────────────────

async function carregarLote(id) {
  if (!uuid(id)) throw erro('lote não encontrado', 404, 'NOT_FOUND');
  const { rows: [l] } = await getPool().query(`SELECT * FROM planos_lotes WHERE id = $1`, [id]);
  if (!l) throw erro('lote não encontrado', 404, 'NOT_FOUND');
  return l;
}

async function montarLote(l) {
  const ids = l.membros.map((m) => m.user_id);
  const { rows } = await getPool().query(
    `SELECT m.user_id, u.display_name AS nome, m.week_start AS inicio, m.status, m.elegivel_lote, m.motivos_revisao, m.alterado_pela_nutri, m.targets
       FROM meal_plans m JOIN users u ON u.id = m.user_id WHERE m.user_id = ANY($1) AND m.week_index = 1 AND m.created_by = 'sistema'
        AND m.week_start = ANY($2)`, [ids, l.membros.map((m) => m.inicio)]);
  return {
    id: l.id, status: l.status, perfil_chave: l.perfil_chave, regras_versao: l.regras_versao, created_at: l.created_at, fechado_em: l.fechado_em, motivo: l.motivo,
    amostra: l.amostra, conferidos: l.conferidos,
    membros: l.membros.map((m) => ({ ...m, ...(rows.find((r) => r.user_id === m.user_id && r.inicio === m.inicio) || {}), na_amostra: l.amostra.includes(m.user_id), conferido: l.conferidos.includes(m.user_id) })),
  };
}

router.get('/lotes', equipe, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(`SELECT * FROM planos_lotes ORDER BY (status = 'aberto') DESC, created_at DESC LIMIT 50`);
    res.json({ lotes: await Promise.all(rows.map(montarLote)) });
  } catch (e) { next(e); }
});

router.get('/lotes/:id', equipe, async (req, res, next) => {
  try { res.json({ lote: await montarLote(await carregarLote(req.params.id)) }); } catch (e) { next(e); }
});

/** Abre um lote: até N pacientes do MESMO perfil, todas aptas, perfil liberado pela calibração. */
router.post('/lotes', soNutri, async (req, res, next) => {
  const c = await getPool().connect();
  try {
    const ids = [...new Set((Array.isArray(req.body?.user_ids) ? req.body.user_ids : []).filter(uuid))];
    if (!ids.length) throw erro('Escolha ao menos uma paciente.');
    if (ids.length > REGRAS.tamanhoLote) throw erro(`Um lote tem no máximo ${REGRAS.tamanhoLote} planos.`);
    await c.query('BEGIN');
    const { rows } = await c.query(
      `SELECT user_id, week_start, perfil_chave, elegivel_lote, regras_versao, lote_id FROM meal_plans
        WHERE user_id = ANY($1) AND created_by = 'sistema' AND status = 'rascunho' AND week_index = 1 AND NOT alterado_pela_nutri FOR UPDATE`, [ids]);
    const faltam = ids.filter((id) => !rows.some((r) => r.user_id === id));
    if (faltam.length) throw erro('Alguma paciente não tem rascunho do sistema esperando.', 409, 'LOTE_INVALIDO');
    if (rows.some((r) => !r.elegivel_lote)) throw erro('Só quem está em "prontos pro lote" entra no lote.', 409, 'LOTE_INVALIDO');
    if (rows.some((r) => r.lote_id)) throw erro('Alguma paciente já está em outro lote aberto.', 409, 'LOTE_INVALIDO');
    if (rows.some((r) => r.regras_versao !== VERSAO)) throw erro('Há rascunhos avaliados com regras antigas: gere de novo antes.', 409, 'LOTE_INVALIDO');
    const perfis = [...new Set(rows.map((r) => r.perfil_chave))];
    if (perfis.length > 1) throw erro('Um lote só tem pacientes do mesmo perfil (objetivo e sexo).', 409, 'LOTE_INVALIDO');
    if (!liberado(await calibracao(), perfis[0])) throw erro('Este perfil ainda não liberou o lote: faltam aprovações individuais pra calibrar.', 409, 'LOTE_INVALIDO');

    // Amostra sorteada: é ela que a Luciana precisa abrir antes de aprovar.
    const embaralhado = [...ids].sort(() => Math.random() - 0.5);
    const amostra = embaralhado.slice(0, Math.min(REGRAS.amostraPorLote, ids.length));
    const membros = rows.map((r) => ({ user_id: r.user_id, inicio: r.week_start }));
    const { rows: [l] } = await c.query(
      `INSERT INTO planos_lotes (criado_por, perfil_chave, regras_versao, membros, amostra) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.userId, perfis[0], VERSAO, JSON.stringify(membros), JSON.stringify(amostra)]);
    for (const m of membros) {
      await c.query(`UPDATE meal_plans SET lote_id = $3 WHERE user_id = $1 AND created_by = 'sistema' AND status = 'rascunho' AND week_start >= $2 AND week_start < $4`,
        [m.user_id, m.inicio, l.id, somarDias(m.inicio, 7 * REGRAS.semanasNoMes)]);
    }
    await c.query('COMMIT');
    res.status(201).json({ lote: await montarLote(l) });
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); next(e); } finally { c.release(); }
});

/** Ela abriu um plano da amostra e achou bom. */
router.post('/lotes/:id/conferir', soNutri, async (req, res, next) => {
  try {
    const l = await carregarLote(req.params.id);
    if (l.status !== 'aberto') throw erro('Este lote já foi fechado.', 409, 'LOTE_FECHADO');
    const uid = req.body?.user_id;
    if (!l.amostra.includes(uid)) throw erro('Esta paciente não está na amostra do lote.');
    const conferidos = [...new Set([...l.conferidos, uid])];
    await getPool().query(`UPDATE planos_lotes SET conferidos = $2 WHERE id = $1`, [l.id, JSON.stringify(conferidos)]);
    res.json({ lote: await montarLote({ ...l, conferidos }) });
  } catch (e) { next(e); }
});

/** Trava o lote: todos os membros voltam pra revisão individual. Usado quando ela corrige alguém da amostra. */
export async function travarLote(loteId, motivo, c = getPool()) {
  const { rows: [l] } = await c.query(`UPDATE planos_lotes SET status = 'travado', motivo = $2, fechado_em = NOW() WHERE id = $1 AND status = 'aberto' RETURNING *`, [loteId, motivo]);
  if (!l) return null;
  await c.query(
    `UPDATE meal_plans SET lote_id = NULL, elegivel_lote = FALSE,
            motivos_revisao = CASE WHEN motivos_revisao ? $2 THEN motivos_revisao ELSE motivos_revisao || to_jsonb($2::text) END
      WHERE lote_id = $1`, [loteId, 'lote travado: correção na amostra']);
  return l;
}

router.post('/lotes/:id/cancelar', soNutri, async (req, res, next) => {
  try {
    const l = await carregarLote(req.params.id);
    if (l.status !== 'aberto') throw erro('Este lote já foi fechado.', 409, 'LOTE_FECHADO');
    await getPool().query(`UPDATE planos_lotes SET status = 'cancelado', fechado_em = NOW() WHERE id = $1`, [l.id]);
    await getPool().query(`UPDATE meal_plans SET lote_id = NULL WHERE lote_id = $1`, [l.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/** Aprova o lote: confere tudo de novo com as regras de agora e publica quem passou. */
router.post('/lotes/:id/aprovar', soNutri, async (req, res, next) => {
  const pool = getPool();
  try {
    const l = await carregarLote(req.params.id);
    if (l.status !== 'aberto') throw erro('Este lote já foi fechado.', 409, 'LOTE_FECHADO');
    const faltaConferir = l.amostra.filter((id) => !l.conferidos.includes(id));
    if (faltaConferir.length) throw erro(`Abra e confira os ${l.amostra.length} planos da amostra antes de aprovar.`, 409, 'AMOSTRA_PENDENTE');
    if (l.regras_versao !== VERSAO) throw erro('As regras mudaram depois que o lote abriu. Cancele e monte outro.', 409, 'LOTE_INVALIDO');

    const publicados = [], excluidos = [];
    for (const m of l.membros) {
      const semanas = Array.from({ length: REGRAS.semanasNoMes }, (_, i) => somarDias(m.inicio, 7 * i));
      const { rows } = await pool.query(
        `SELECT * FROM meal_plans WHERE user_id = $1 AND week_start = ANY($2) AND created_by = 'sistema' AND status = 'rascunho' AND lote_id = $3 ORDER BY week_start`,
        [m.user_id, semanas, l.id]);
      let motivos = [];
      if (rows.length !== REGRAS.semanasNoMes) motivos.push('rascunho incompleto ou já mexido');
      else if (rows.some((r) => r.alterado_pela_nutri)) motivos.push('foi editado depois de entrar no lote');
      else {
        const aval = await avaliarPaciente(m.user_id);
        motivos = [...aval.motivos];
        if (aval.dados) motivos.push(...checarPlano(rows.map((r) => ({ days: r.days })), rows[0].targets, aval.dados));
      }
      if (motivos.length) {
        await pool.query(`UPDATE meal_plans SET lote_id = NULL, elegivel_lote = FALSE, motivos_revisao = $3 WHERE user_id = $1 AND week_start = ANY($2) AND created_by = 'sistema' AND status = 'rascunho'`,
          [m.user_id, semanas, JSON.stringify([...new Set(motivos)])]);
        excluidos.push({ user_id: m.user_id, motivos: [...new Set(motivos)] });
        continue;
      }
      const c = await pool.connect();
      try {
        await c.query('BEGIN');
        await c.query(
          `UPDATE meal_plans SET status = 'ativo', published_at = COALESCE(published_at, NOW()), aprovacao = 'lote', aprovado_por = $3, updated_at = NOW()
            WHERE user_id = $1 AND week_start = ANY($2) AND created_by = 'sistema' AND status = 'rascunho' AND lote_id = $4`, [m.user_id, semanas, req.user.userId, l.id]);
        await c.query(
          `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()`,
          [m.user_id, JSON.stringify({ targets: rows[0].targets })]);
        await c.query('COMMIT');
      } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; } finally { c.release(); }
      publicados.push({ user_id: m.user_id, inicio: m.inicio });
    }
    await pool.query(`UPDATE planos_lotes SET status = 'aprovado', fechado_em = NOW(), motivo = $2 WHERE id = $1`,
      [l.id, excluidos.length ? `${excluidos.length} excluída(s) na conferência final` : null]);

    // Avisos saem DEPOIS da resposta: WhatsApp pela fila, e-mail pela API (um por paciente, sem segurar a tela).
    res.json({ publicados, excluidos, lote: await montarLote({ ...l, status: 'aprovado' }) });
    for (const p of publicados) {
      avisarPlanoPronto(p.user_id);
      notificar(p.user_id, { tipo: 'plano', titulo: 'Seu plano do mês está pronto', texto: `A Nutri Luciana publicou as suas refeições a partir de ${p.inicio.slice(8, 10)}/${p.inicio.slice(5, 7)}.`, link: '/plano', refId: `mes:${p.inicio}` });
      const { rows: [u] } = await pool.query(`SELECT email, display_name FROM users WHERE id = $1`, [p.user_id]);
      if (u?.email) enviarPlanoPronto({ para: u.email, nome: (u.display_name || '').split(' ')[0], semana: `${REGRAS.semanasNoMes} semanas a partir de ${p.inicio}` })
        .catch((e) => console.warn('[lote] e-mail de plano falhou:', e.message));
    }
  } catch (e) { next(e); }
});

export default router;
