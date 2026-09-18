// Painel da Luciana — rotas /nutri/*.
//
// Dois papéis (users.role, lido do banco a cada pedido — ver requirePapel):
//   nutri  → a Luciana. Vê tudo, inclusive a anamnese clínica de cada pessoa.
//   admin  → sócios. Lista de pacientes, plano, dúvidas, materiais e o
//            dashboard do público (com o bloco clínico só AGREGADO). Nunca a
//            anamnese clínica individual: assim quem opera o sistema não vira
//            operador de dado de saúde no dia a dia.
//
// Tudo que é "o dia da cliente", "a evolução dela" e "o plano dela" vem de
// services/diario.js — o mesmo código que serve a própria cliente em /me/*.
// A ficha mostra exatamente o que ela vê.

import { Router } from 'express';
import { getPool } from '../db.js';
import { requirePapel } from '../services/auth.js';
import { temAcesso } from '../services/billing.js';
import { novaChaveArquivo, urlDeUpload, urlDeLeitura, apagar, r2Configurado } from '../services/r2.js';
import { enviarPlanoPronto } from '../services/email.js';
import { exigirData, dataValida, somarDias, inicioDaSemana, diaDaSemana, mesValido } from '../utils/datas.js';
import {
  SLOTS, erro, normalizarItens, montarDia, montarEvolucao, planoDaData, planoResumido, perfilComFoto,
} from '../services/diario.js';
import { montarDashboard, gerarSintese } from '../services/dashboard.js';
import { gerarRascunho } from '../services/triagem.js';
import { avisarMensagemDaNutri, avisarPlanoPronto } from '../services/whatsapp/avisos.js';
import { travarLote } from './lote.js';
import { notificar } from '../services/notificacoes.js';

const router = Router();
const equipe = requirePapel('nutri', 'admin');
const soNutri = requirePapel('nutri');

const hojeISO = () => new Date().toISOString().slice(0, 10);
const uuid = (s) => /^[0-9a-f-]{36}$/i.test(String(s || ''));

/** Garante que o id é de uma CLIENTE (nunca de outra pessoa da equipe). */
async function exigirCliente(id) {
  if (!uuid(id)) throw erro('id inválido', 404, 'NOT_FOUND');
  const { rows } = await getPool().query(`SELECT id, display_name, email, created_at, role FROM users WHERE id = $1`, [id]);
  if (!rows[0] || rows[0].role !== 'cliente') throw erro('Paciente não encontrada', 404, 'NOT_FOUND');
  return rows[0];
}

// ─── Resumo pro menu (contadores) ─────────────────────────────────────────

router.get('/resumo', equipe, async (req, res, next) => {
  try {
    const ws = inicioDaSemana(hojeISO());
    const { rows } = await getPool().query(
      `SELECT
         (SELECT COUNT(*)::int FROM lu_messages q WHERE q.kind = 'pergunta'
            AND NOT EXISTS (SELECT 1 FROM lu_messages r WHERE r.reply_to = q.id)) AS duvidas,
         (SELECT COUNT(*)::int FROM users u JOIN client_profiles c ON c.user_id = u.id
           WHERE u.role = 'cliente' AND c.data ? 'onboarding_em'
             AND NOT EXISTS (SELECT 1 FROM meal_plans m WHERE m.user_id = u.id AND m.status = 'ativo' AND m.week_start >= $1)) AS aguardando_plano,
         (SELECT COUNT(*)::int FROM users WHERE role = 'cliente') AS pacientes`,
      [ws],
    );
    res.json({ ...rows[0], papel: req.user.role });
  } catch (e) { next(e); }
});

// ─── Lista de pacientes ───────────────────────────────────────────────────

// Paginada e filtrada NO BANCO (premissa de 10 mil pacientes, ver CLAUDE.md):
// a situação de cada paciente (aguardando plano, dúvida, sem registrar…) é
// calculada em SQL, o filtro do chip e a busca entram no WHERE, e as
// contagens dos chips saem de uma segunda query com FILTER. O navegador só
// recebe uma página (50 por padrão) e assina a URL da foto só dessas.
//
//   GET /nutri/pacientes?filtro=todas|precisam|plano|duvidas|engajadas|incompletas|em_dia
//                       &q=texto&pagina=1&limite=50
//   → { pacientes, total, pagina, limite, contagens: {...}, secoes: {...}, hoje, week_start }
//
// `contagens` é de TODA a base (números dos chips); `secoes` é do filtro+busca
// atual, dividido em precisam / em_dia / incompletas (cabeçalhos das seções).

const FILTROS_PACIENTES = {
  todas: 'TRUE',
  precisam: 'precisa',
  plano: 'aguardando_plano',
  duvidas: 'duvida_pendente',
  engajadas: 'engajada',
  incompletas: 'sem_onboarding',
  em_dia: '(cadastro_ok AND NOT precisa)',
  sem_registro: '(cadastro_ok AND sem_registro)',
  // Tela "Plano alimentar": tudo que pede a nutri montar/publicar um mês.
  planos: '(aguardando_plano OR plano_vencendo OR rascunhos > 0)',
  vencendo: 'plano_vencendo',
  rascunho: '(rascunhos > 0)',
};

router.get('/pacientes', equipe, async (req, res, next) => {
  try {
    const hoje = hojeISO(); const ws = inicioDaSemana(hoje); const prox = somarDias(ws, 7);
    // "Semana acabando" só faz sentido de quinta em diante: antes disso toda
    // paciente com plano apareceria na lista sem nada a fazer ainda.
    const fimDeSemana = diaDaSemana(hoje) >= 4;
    const filtroSql = FILTROS_PACIENTES[String(req.query.filtro || 'todas')] || FILTROS_PACIENTES.todas;
    const q = String(req.query.q || '').trim().slice(0, 80);
    const limite = Math.min(200, Math.max(1, parseInt(req.query.limite, 10) || 50));
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    // Sem busca, $7 ainda precisa aparecer na query (o pg exige tipo pra todo parâmetro).
    const busca = q ? `(display_name ILIKE $7 OR email ILIKE $7)` : `($7::text IS NULL)`;
    const params = [hoje, ws, somarDias(hoje, -6), prox, fimDeSemana, somarDias(hoje, -3), q ? `%${q}%` : null];

    // Cada tabela é varrida UMA vez e agrupada por usuário (em vez de uma
    // subquery por usuário por coluna, que cresce N × colunas): é o que
    // mantém a lista rápida em 10 mil pacientes.
    const cte = `
      WITH reg AS (
        SELECT user_id, MAX(date) AS ultimo_registro,
               COUNT(DISTINCT date) FILTER (WHERE date >= $3 AND date <= $1)::int AS dias_semana
          FROM meal_entries GROUP BY user_id
      ), duv AS (
        SELECT q.user_id, COUNT(*)::int AS n FROM lu_messages q
         WHERE q.kind = 'pergunta' AND NOT EXISTS (SELECT 1 FROM lu_messages r WHERE r.reply_to = q.id)
         GROUP BY q.user_id
      ), peso AS (
        SELECT DISTINCT ON (user_id) user_id, kg FROM weight_log ORDER BY user_id, date DESC
      ), pl AS (
        SELECT user_id, json_build_object('id', id, 'week_start', week_start, 'week_index', week_index, 'week_total', week_total) AS plano_semana
          FROM meal_plans WHERE status = 'ativo' AND week_start = $2
      ), prox AS (
        SELECT DISTINCT user_id FROM meal_plans WHERE status = 'ativo' AND week_start = $4
      ), rasc AS (
        -- Rascunho DELA: o do sistema (aprovação em lote) que ela ainda não tocou
        -- não conta aqui, senão toda paciente nova apareceria "com rascunho".
        SELECT user_id, COUNT(*)::int AS n FROM meal_plans WHERE status = 'rascunho' AND (created_by <> 'sistema' OR alterado_pela_nutri) GROUP BY user_id
      ), anam AS (
        -- 'caneta' é dado clínico: só vai na resposta pra nutri (ver abaixo).
        SELECT user_id, (data->>'caneta_usa') = 'sim' AS caneta FROM anamnese_clinica
      ), base AS (
        SELECT u.id, u.display_name, u.email, u.created_at, c.data AS perfil,
               COALESCE(c.data ? 'onboarding_em', FALSE) AS cadastro_ok, -- sem linha de perfil = cadastro incompleto
               reg.ultimo_registro, COALESCE(reg.dias_semana, 0) AS dias_semana,
               COALESCE(duv.n, 0) AS duvidas_pendentes,
               peso.kg AS peso_kg,
               pl.plano_semana,
               (prox.user_id IS NOT NULL) AS tem_proxima,
               COALESCE(rasc.n, 0) AS rascunhos,
               (anam.user_id IS NOT NULL) AS anamnese_respondida,
               COALESCE(anam.caneta, FALSE) AS caneta,
               EXISTS (
                 SELECT 1 FROM purchases p
                  WHERE p.status = 'ativa' AND (p.valido_ate IS NULL OR p.valido_ate > NOW())
                    AND ((p.email IS NOT NULL AND u.email IS NOT NULL AND p.email = BTRIM(LOWER(u.email)))
                         OR EXISTS (SELECT 1 FROM access_codes ac WHERE ac.purchase_id = p.id AND ac.redeemed_by_user_id = u.id))
               ) AS acesso
          FROM users u
          LEFT JOIN client_profiles c ON c.user_id = u.id
          LEFT JOIN reg ON reg.user_id = u.id
          LEFT JOIN duv ON duv.user_id = u.id
          LEFT JOIN peso ON peso.user_id = u.id
          LEFT JOIN pl ON pl.user_id = u.id
          LEFT JOIN prox ON prox.user_id = u.id
          LEFT JOIN rasc ON rasc.user_id = u.id
          LEFT JOIN anam ON anam.user_id = u.id
         WHERE u.role = 'cliente'
      ), sit AS (
        SELECT b.*,
               NOT cadastro_ok AS sem_onboarding,
               (cadastro_ok AND plano_semana IS NULL) AS aguardando_plano,
               (cadastro_ok AND plano_semana IS NOT NULL AND NOT tem_proxima AND $5::boolean) AS plano_vencendo,
               -- date é TEXT (ISO) nas tabelas de registro: comparação de texto funciona pra YYYY-MM-DD.
               (cadastro_ok AND (ultimo_registro IS NULL OR ultimo_registro < $6::text)) AS sem_registro,
               (duvidas_pendentes > 0) AS duvida_pendente
          FROM base b
      ), cls AS (
        SELECT s.*,
               (cadastro_ok AND (aguardando_plano OR duvida_pendente OR plano_vencendo OR sem_registro)) AS precisa,
               (cadastro_ok AND NOT sem_registro AND ultimo_registro IS NOT NULL) AS engajada,
               (CASE WHEN aguardando_plano THEN 8 ELSE 0 END + CASE WHEN duvida_pendente THEN 4 ELSE 0 END
                + CASE WHEN plano_vencendo THEN 3 ELSE 0 END + CASE WHEN sem_registro THEN 1 ELSE 0 END) AS prioridade
          FROM sit s
      )`;
    const pool = getPool();
    const [pag, cont] = await Promise.all([
      pool.query(
        `${cte}
         SELECT * FROM cls
          WHERE ${filtroSql} AND ${busca}
          ORDER BY (CASE WHEN NOT cadastro_ok THEN 2 WHEN precisa THEN 0 ELSE 1 END), prioridade DESC, created_at DESC
          LIMIT $8 OFFSET $9`,
        [...params, limite, (pagina - 1) * limite],
      ),
      pool.query(
        `${cte}
         SELECT COUNT(*)::int AS todas,
                COUNT(*) FILTER (WHERE precisa)::int AS precisam,
                COUNT(*) FILTER (WHERE aguardando_plano)::int AS plano,
                COUNT(*) FILTER (WHERE duvida_pendente)::int AS duvidas,
                COUNT(*) FILTER (WHERE engajada)::int AS engajadas,
                COUNT(*) FILTER (WHERE sem_onboarding)::int AS incompletas,
                COUNT(*) FILTER (WHERE cadastro_ok AND NOT precisa)::int AS em_dia,
                COUNT(*) FILTER (WHERE cadastro_ok AND sem_registro)::int AS sem_registro,
                COUNT(*) FILTER (WHERE aguardando_plano OR plano_vencendo OR rascunhos > 0)::int AS planos,
                COUNT(*) FILTER (WHERE plano_vencendo)::int AS vencendo,
                COUNT(*) FILTER (WHERE rascunhos > 0)::int AS rascunho,
                COUNT(*) FILTER (WHERE ${filtroSql} AND ${busca})::int AS total,
                COUNT(*) FILTER (WHERE ${filtroSql} AND ${busca} AND precisa)::int AS f_precisam,
                COUNT(*) FILTER (WHERE ${filtroSql} AND ${busca} AND cadastro_ok AND NOT precisa)::int AS f_em_dia,
                COUNT(*) FILTER (WHERE ${filtroSql} AND ${busca} AND sem_onboarding)::int AS f_incompletas
           FROM cls`,
        params,
      ),
    ]);
    const pacientes = await Promise.all(pag.rows.map(async (r) => {
      const p = r.perfil || {};
      const situacoes = [];
      if (r.sem_onboarding) situacoes.push('sem_onboarding');
      else {
        if (r.aguardando_plano) situacoes.push('aguardando_plano');
        else { situacoes.push('plano_ativo'); if (r.plano_vencendo) situacoes.push('plano_vencendo'); }
        if (r.sem_registro) situacoes.push('sem_registro');
      }
      if (r.duvida_pendente) situacoes.push('duvida_pendente');
      return {
        id: r.id, nome: r.display_name, email: r.email, since: r.created_at,
        foto_url: p.foto_key && r2Configurado() ? await urlDeLeitura(p.foto_key).catch(() => null) : null,
        objetivo: p.objetivo || null, meta_kg: p.meta_kg ?? null, peso_kg: r.peso_kg != null ? Number(r.peso_kg) : null,
        onboarding_em: p.onboarding_em || null, acesso: r.acesso, anamnese_respondida: r.anamnese_respondida,
        // Etiqueta "caneta emagrecedora" (anamnese clínica): só a nutri vê, o sócio não.
        ...(req.user.role === 'nutri' ? { caneta: r.caneta } : {}),
        ultimo_registro: r.ultimo_registro, dias_semana: r.dias_semana, duvidas_pendentes: r.duvidas_pendentes,
        plano_semana: r.plano_semana, tem_proxima: r.tem_proxima, rascunhos: r.rascunhos, situacoes,
      };
    }));
    const c = cont.rows[0];
    res.json({
      pacientes, total: c.total, pagina, limite,
      contagens: { todas: c.todas, precisam: c.precisam, plano: c.plano, duvidas: c.duvidas, engajadas: c.engajadas, incompletas: c.incompletas, em_dia: c.em_dia, sem_registro: c.sem_registro, planos: c.planos, vencendo: c.vencendo, rascunho: c.rascunho },
      secoes: { precisam: c.f_precisam, em_dia: c.f_em_dia, incompletas: c.f_incompletas },
      hoje, week_start: ws,
    });
  } catch (e) { next(e); }
});

// ─── Ficha da paciente ────────────────────────────────────────────────────

router.get('/pacientes/:id', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const hoje = hojeISO(); const p = getPool();
    const [perfil, acesso, evolucao, planoAtual, planos, sup, duvidas, ultimo, anam] = await Promise.all([
      p.query(`SELECT data, updated_at FROM client_profiles WHERE user_id = $1`, [u.id]),
      temAcesso(u.id),
      montarEvolucao(u.id, hoje),
      planoDaData(u.id, hoje),
      p.query(`SELECT id, week_start, week_index, week_total, status, targets, note, published_at, updated_at FROM meal_plans WHERE user_id = $1 ORDER BY week_start DESC`, [u.id]),
      p.query(`SELECT id, name, dose, time, with_meal, sort FROM supplements WHERE user_id = $1 AND active ORDER BY sort, time NULLS LAST`, [u.id]),
      p.query(`SELECT COUNT(*)::int AS n FROM lu_messages q WHERE q.user_id = $1 AND q.kind = 'pergunta' AND NOT EXISTS (SELECT 1 FROM lu_messages r WHERE r.reply_to = q.id)`, [u.id]),
      p.query(`SELECT MAX(date) AS date FROM meal_entries WHERE user_id = $1`, [u.id]),
      p.query(`SELECT consentimento_em, updated_at, (data->>'caneta_usa') = 'sim' AS caneta FROM anamnese_clinica WHERE user_id = $1`, [u.id]),
    ]);
    res.json({
      user: { id: u.id, displayName: u.display_name, email: u.email, since: u.created_at },
      perfil: await perfilComFoto(perfil.rows[0]?.data),
      perfil_atualizado_em: perfil.rows[0]?.updated_at || null,
      acesso,
      evolucao,
      plano_atual: planoResumido(planoAtual),
      planos: planos.rows,
      suplementos: sup.rows,
      duvidas_pendentes: duvidas.rows[0].n,
      ultimo_registro: ultimo.rows[0].date,
      // Só o FATO de a anamnese existir; o conteúdo é rota própria, só nutri.
      // `caneta` (usa caneta emagrecedora) é clínico: só a nutri recebe.
      anamnese: anam.rows[0] ? { respondida: true, consentimento_em: anam.rows[0].consentimento_em, updated_at: anam.rows[0].updated_at, ...(req.user.role === 'nutri' ? { caneta: anam.rows[0].caneta === true } : {}) } : { respondida: false },
      hoje,
    });
  } catch (e) { next(e); }
});

// Anamnese clínica: SÓ a nutricionista. Admin recebe 403.
router.get('/pacientes/:id/anamnese-clinica', soNutri, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const { rows } = await getPool().query(`SELECT data, consentimento_em, updated_at FROM anamnese_clinica WHERE user_id = $1`, [u.id]);
    res.json(rows[0]
      ? { respondida: true, data: rows[0].data, consentimento_em: rows[0].consentimento_em, updated_at: rows[0].updated_at }
      : { respondida: false, data: null, consentimento_em: null, updated_at: null });
  } catch (e) { next(e); }
});

// O dia dela, igual ao que ela vê (aba Diário).
router.get('/pacientes/:id/dia', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    res.json(await montarDia(u.id, exigirData(req.query.date || hojeISO())));
  } catch (e) { next(e); }
});

router.get('/pacientes/:id/mes', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const mes = req.query.month;
    if (!mesValido(mes)) throw erro('month precisa ser YYYY-MM');
    const { rows } = await getPool().query(
      `SELECT date, COUNT(*)::int AS refeicoes, SUM(kcal)::float AS kcal FROM meal_entries WHERE user_id = $1 AND date LIKE $2 GROUP BY date ORDER BY date`,
      [u.id, `${mes}-%`],
    );
    res.json({ month: mes, dias: rows });
  } catch (e) { next(e); }
});

// A Lu pode corrigir o que é dela decidir: restrições (filtro duro do plano),
// alergias, meta de peso e metas. O resto do perfil é da cliente.
const CAMPOS_NUTRI = new Set(['restricoes', 'alergias', 'meta_kg', 'targets', 'nome']);
router.put('/pacientes/:id/perfil', soNutri, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const dados = req.body?.perfil;
    if (!dados || typeof dados !== 'object') throw erro('perfil obrigatório');
    const limpo = {};
    for (const [k, v] of Object.entries(dados)) if (CAMPOS_NUTRI.has(k)) limpo[k] = v;
    if (!Object.keys(limpo).length) throw erro('Nada pra alterar.');
    if (typeof limpo.nome === 'string' && limpo.nome.trim()) await getPool().query(`UPDATE users SET display_name = $2 WHERE id = $1`, [u.id, limpo.nome.trim().slice(0, 40)]);
    const { rows } = await getPool().query(
      `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW() RETURNING data`,
      [u.id, JSON.stringify(limpo)],
    );
    res.json({ perfil: await perfilComFoto(rows[0].data) });
  } catch (e) { next(e); }
});

// ─── Plano ────────────────────────────────────────────────────────────────

/** Mesmas regras do scripts/carregar-plano.mjs, agora como serviço. */
function validarPlano(b, { publicar }) {
  const falhas = [];
  if (!dataValida(b.week_start)) falhas.push('week_start precisa ser YYYY-MM-DD');
  else if (new Date(`${b.week_start}T00:00:00Z`).getUTCDay() !== 1) falhas.push('a semana precisa começar numa segunda-feira');
  const wi = b.week_index == null ? null : Number(b.week_index), wt = b.week_total == null ? null : Number(b.week_total);
  if (wi != null && !(wi >= 1 && wi <= 52)) falhas.push('week_index fora do esperado');
  if (wt != null && !(wt >= 1 && wt <= 52)) falhas.push('week_total fora do esperado');
  const t = b.targets && typeof b.targets === 'object' ? b.targets : {};
  const targets = {};
  for (const k of ['kcal', 'p', 'c', 'f', 'water_ml']) { const v = Number(t[k]); if (Number.isFinite(v) && v > 0) targets[k] = Math.round(v); }
  if (publicar && !targets.kcal) falhas.push('defina a meta de calorias antes de publicar');
  if (!Array.isArray(b.days)) falhas.push('days precisa ser uma lista');
  const days = [];
  let refeicoes = 0;
  for (const d of Array.isArray(b.days) ? b.days : []) {
    const wd = Number(d?.weekday);
    if (!(wd >= 1 && wd <= 7)) { falhas.push(`weekday inválido: ${d?.weekday}`); continue; }
    if (days.some((x) => x.weekday === wd)) { falhas.push(`dia ${wd} repetido`); continue; }
    const meals = [];
    for (const m of Array.isArray(d.meals) ? d.meals : []) {
      if (!SLOTS.includes(m?.slot)) { falhas.push(`refeição com slot inválido no dia ${wd}`); continue; }
      if (meals.some((x) => x.slot === m.slot)) { falhas.push(`dia ${wd}: ${m.slot} aparece duas vezes`); continue; }
      const name = String(m.name || '').trim().slice(0, 120);
      if (!name) { falhas.push(`dia ${wd}, ${m.slot}: refeição sem nome`); continue; }
      let itens, tot;
      try { ({ itens, tot } = normalizarItens(m.items)); } catch (e) { falhas.push(`dia ${wd}, ${m.slot}: ${e.message}`); continue; }
      const time = m.time && /^\d{2}:\d{2}$/.test(m.time) ? m.time : null;
      // `subs`: substituições possíveis escritas pela nutri ("frango no lugar
      // da carne"). A cliente vê junto da refeição; não altera macros.
      const subs = m.subs ? String(m.subs).trim().slice(0, 600) : null;
      meals.push({ slot: m.slot, time, name, code: m.code ? String(m.code).slice(0, 12) : null, items: itens, ...tot, ...(subs ? { subs } : {}) });
      refeicoes += 1;
    }
    days.push({ weekday: wd, meals });
  }
  days.sort((a, b2) => a.weekday - b2.weekday);
  if (publicar && refeicoes === 0) falhas.push('o plano está vazio: monte ao menos uma refeição');
  if (publicar) for (let wd = 1; wd <= 7; wd++) if (!days.find((d) => d.weekday === wd && d.meals.length)) falhas.push(`o dia ${wd} está sem refeições`);
  if (falhas.length) throw erro(falhas.slice(0, 6).join(' · '), 400, 'PLANO_INVALIDO');
  return { week_start: b.week_start, week_index: wi, week_total: wt, targets, note: b.note ? String(b.note).slice(0, 2000) : null, days };
}

function validarSuplementos(lista) {
  if (!Array.isArray(lista)) throw erro('supplements precisa ser uma lista');
  return lista.slice(0, 30).map((s, i) => {
    const name = String(s?.name || '').trim().slice(0, 80);
    if (!name) throw erro('Suplemento sem nome.');
    return { name, dose: s.dose ? String(s.dose).slice(0, 60) : null, time: s.time && /^\d{2}:\d{2}$/.test(s.time) ? s.time : null, with_meal: s.with_meal ? String(s.with_meal).slice(0, 80) : null, sort: i };
  });
}

router.get('/pacientes/:id/planos', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const { rows } = await getPool().query(`SELECT * FROM meal_plans WHERE user_id = $1 ORDER BY week_start DESC`, [u.id]);
    res.json({ planos: rows.map((p) => ({ ...planoResumido(p), days: p.days, overrides: p.overrides, published_at: p.published_at, updated_at: p.updated_at })) });
  } catch (e) { next(e); }
});

router.get('/pacientes/:id/planos/:planoId', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    if (!uuid(req.params.planoId)) throw erro('plano não encontrado', 404, 'NOT_FOUND');
    const { rows } = await getPool().query(`SELECT * FROM meal_plans WHERE id = $1 AND user_id = $2`, [req.params.planoId, u.id]);
    if (!rows[0]) throw erro('plano não encontrado', 404, 'NOT_FOUND');
    const p = rows[0];
    res.json({ plano: { ...planoResumido(p), days: p.days, overrides: p.overrides, published_at: p.published_at, updated_at: p.updated_at } });
  } catch (e) { next(e); }
});

// ─── Plano do MÊS (ciclo de 4 semanas) ────────────────────────────────────
// Decisão dele em 16/09: a Luciana aprova o MÊS inteiro de uma vez; a
// cliente recebe semana a semana (o /me/plano já entrega só a semana
// corrente). No banco continua uma linha por semana — o "mês" é um conjunto
// de linhas com week_start consecutivos e week_index 1..N. Assim nada do
// lado da cliente muda, e a lista de compras, a troca e o diário seguem
// olhando pra semana.

const SEMANAS_NO_MES = 4;
const mesValidoInicio = (s) => dataValida(s) && new Date(`${s}T00:00:00Z`).getUTCDay() === 1;

// Lê as N semanas de um mês (pode vir com buracos: semana ainda não montada).
router.get('/pacientes/:id/plano-mes', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const inicio = req.query.inicio;
    if (!mesValidoInicio(inicio)) throw erro('inicio precisa ser uma segunda-feira (YYYY-MM-DD)');
    const inicios = Array.from({ length: SEMANAS_NO_MES }, (_, i) => somarDias(inicio, 7 * i));
    const { rows } = await getPool().query(`SELECT * FROM meal_plans WHERE user_id = $1 AND week_start = ANY($2) ORDER BY week_start`, [u.id, inicios]);
    const semanas = inicios.map((ws, i) => {
      const p = rows.find((r) => r.week_start === ws);
      return { week_start: ws, indice: i + 1, plano: p ? { ...planoResumido(p), days: p.days, overrides: p.overrides, published_at: p.published_at, updated_at: p.updated_at } : null };
    });
    // Rascunho do sistema: o editor mostra o veredito da lista verde e o lote em que está.
    const s = rows.find((r) => r.created_by === 'sistema' && r.week_index === 1);
    const sistema = s ? { elegivel_lote: s.elegivel_lote, motivos_revisao: s.motivos_revisao, perfil_chave: s.perfil_chave, regras_versao: s.regras_versao, gerado_em: s.gerado_em, alterado_pela_nutri: s.alterado_pela_nutri, lote_id: s.lote_id, aprovacao: s.aprovacao } : null;
    res.json({ inicio, semanas, sistema });
  } catch (e) { next(e); }
});

// Salva (rascunho) ou publica o mês inteiro numa transação só. `weeks` é a
// lista de semanas, cada uma com seus `days`; metas, nota, suplementos, meta
// de peso e recado valem pro mês. Publicar exige as N semanas completas.
router.put('/pacientes/:id/plano-mes', soNutri, async (req, res, next) => {
  const c = await getPool().connect();
  try {
    const u = await exigirCliente(req.params.id);
    const b = req.body || {};
    const publicar = b.publicar === true;
    if (!mesValidoInicio(b.inicio)) throw erro('inicio precisa ser uma segunda-feira (YYYY-MM-DD)');
    if (!Array.isArray(b.weeks) || b.weeks.length < 1 || b.weeks.length > 6) throw erro('weeks precisa ter de 1 a 6 semanas');
    const total = b.weeks.length;
    // Cada semana passa pela MESMA validação do plano semanal, com as metas e
    // a nota do mês. Se uma falhar, o mês inteiro não grava.
    const semanas = b.weeks.map((w, i) => {
      try {
        return validarPlano({ week_start: somarDias(b.inicio, 7 * i), week_index: i + 1, week_total: total, targets: b.targets, note: b.note, days: w?.days }, { publicar });
      } catch (e) { throw erro(`Semana ${i + 1}: ${e.message}`, 400, 'PLANO_INVALIDO'); }
    });
    const sups = b.supplements !== undefined ? validarSuplementos(b.supplements) : null;
    const metaKg = b.meta_kg != null ? Number(b.meta_kg) : null;
    if (b.meta_kg != null && !(metaKg >= 20 && metaKg <= 400)) throw erro('meta_kg fora do esperado');
    const recado = b.recado ? String(b.recado).trim().slice(0, 2000) : '';

    await c.query('BEGIN');
    // Rascunho do SISTEMA (aprovação em lote) neste mês? Então esta gravação
    // é a Luciana revisando: registra se ela mudou algo (calibração) e, se
    // ela estava conferindo a amostra de um lote, trava o lote inteiro.
    const { rows: anteriores } = await c.query(
      `SELECT week_start, created_by, days, targets, lote_id, alterado_pela_nutri FROM meal_plans WHERE user_id = $1 AND week_start = ANY($2) FOR UPDATE`,
      [u.id, semanas.map((s) => s.week_start)]);
    const doSistema = anteriores.filter((a) => a.created_by === 'sistema');
    // O jsonb reordena as chaves ao guardar: a comparação precisa ser canônica.
    const canon = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x));
    const mudou = doSistema.some((a) => {
      const novo = semanas.find((s) => s.week_start === a.week_start);
      return !novo || canon(a.days) !== canon(novo.days) || canon(a.targets) !== canon(novo.targets);
    }) || (doSistema.length > 0 && semanas.length !== anteriores.length);
    const salvos = [];
    for (const plano of semanas) {
      const { rows: [s] } = await c.query(
        `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, note, days, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $8 = 'ativo' THEN NOW() ELSE NULL END)
         ON CONFLICT (user_id, week_start) DO UPDATE SET
           week_index = EXCLUDED.week_index, week_total = EXCLUDED.week_total, targets = EXCLUDED.targets,
           note = EXCLUDED.note, days = EXCLUDED.days, updated_at = NOW(),
           status = CASE WHEN $8 = 'ativo' THEN 'ativo' ELSE meal_plans.status END,
           published_at = CASE WHEN $8 = 'ativo' THEN COALESCE(meal_plans.published_at, NOW()) ELSE meal_plans.published_at END,
           alterado_pela_nutri = meal_plans.alterado_pela_nutri OR ($9::boolean AND meal_plans.created_by = 'sistema'),
           aprovacao = CASE WHEN $8 = 'ativo' AND meal_plans.created_by = 'sistema' THEN 'individual' ELSE meal_plans.aprovacao END,
           aprovado_por = CASE WHEN $8 = 'ativo' AND meal_plans.created_by = 'sistema' THEN $10::uuid ELSE meal_plans.aprovado_por END
         RETURNING *`,
        [u.id, plano.week_start, plano.week_index, plano.week_total, JSON.stringify(plano.targets), plano.note, JSON.stringify(plano.days), publicar ? 'ativo' : 'rascunho', mudou, req.user.userId],
      );
      salvos.push(s);
    }
    const loteId = doSistema.find((a) => a.lote_id)?.lote_id;
    if (loteId && (mudou || publicar)) {
      const { rows: [l] } = await c.query(`SELECT amostra, status FROM planos_lotes WHERE id = $1`, [loteId]);
      if (l?.status === 'aberto' && mudou && l.amostra.includes(u.id)) await travarLote(loteId, `correção na amostra (${u.display_name || u.email})`, c);
      else await c.query(`UPDATE meal_plans SET lote_id = NULL WHERE user_id = $1 AND lote_id = $2`, [u.id, loteId]);
    }
    if (sups) {
      await c.query(`UPDATE supplements SET active = FALSE WHERE user_id = $1`, [u.id]);
      for (const s of sups) await c.query(`INSERT INTO supplements (user_id, name, dose, time, with_meal, sort) VALUES ($1, $2, $3, $4, $5, $6)`, [u.id, s.name, s.dose, s.time, s.with_meal, s.sort]);
    }
    if (publicar) {
      const perfil = { targets: semanas[0].targets };
      if (metaKg != null) perfil.meta_kg = metaKg;
      await c.query(
        `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()`,
        [u.id, JSON.stringify(perfil)],
      );
      if (recado) await c.query(`INSERT INTO lu_messages (user_id, kind, author, text) VALUES ($1, 'recado', 'nutri', $2)`, [u.id, recado]);
    }
    await c.query('COMMIT');

    // WhatsApp: só enfileira (o trabalhador entrega). O recado, se houver, vai junto com o aviso do plano.
    if (publicar && b.avisar !== false) avisarPlanoPronto(u.id);
    if (publicar) notificar(u.id, { tipo: 'plano', titulo: 'Seu plano do mês está pronto', texto: `A Nutri Luciana publicou as suas refeições a partir de ${b.inicio.slice(8, 10)}/${b.inicio.slice(5, 7)}.`, link: '/plano', refId: `mes:${b.inicio}` });

    let email = { enviado: false };
    if (publicar && b.avisar !== false && u.email) {
      email = await enviarPlanoPronto({ para: u.email, nome: (u.display_name || '').split(' ')[0], semana: `${total} semanas a partir de ${b.inicio}` })
        .catch((e) => { console.warn('[nutri] e-mail de plano falhou:', e.message); return { enviado: false, erro: e.message }; });
    }
    res.json({ inicio: b.inicio, semanas: salvos.map((s) => ({ ...planoResumido(s), days: s.days, published_at: s.published_at })), email });
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    next(e);
  } finally { c.release(); }
});

// Salva (rascunho) ou publica o plano de UMA semana. Continua existindo pra
// ajuste pontual e pros scripts; o painel usa o /plano-mes acima.
router.put('/pacientes/:id/plano', soNutri, async (req, res, next) => {
  const c = await getPool().connect();
  try {
    const u = await exigirCliente(req.params.id);
    const b = req.body || {};
    const publicar = b.publicar === true;
    const plano = validarPlano(b, { publicar });
    const sups = b.supplements !== undefined ? validarSuplementos(b.supplements) : null;
    const metaKg = b.meta_kg != null ? Number(b.meta_kg) : null;
    if (b.meta_kg != null && !(metaKg >= 20 && metaKg <= 400)) throw erro('meta_kg fora do esperado');
    const recado = b.recado ? String(b.recado).trim().slice(0, 2000) : '';

    await c.query('BEGIN');
    const { rows: [salvo] } = await c.query(
      `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, note, days, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $8 = 'ativo' THEN NOW() ELSE NULL END)
       ON CONFLICT (user_id, week_start) DO UPDATE SET
         week_index = EXCLUDED.week_index, week_total = EXCLUDED.week_total, targets = EXCLUDED.targets,
         note = EXCLUDED.note, days = EXCLUDED.days, updated_at = NOW(),
         status = CASE WHEN $8 = 'ativo' THEN 'ativo' ELSE meal_plans.status END,
         published_at = CASE WHEN $8 = 'ativo' THEN COALESCE(meal_plans.published_at, NOW()) ELSE meal_plans.published_at END
       RETURNING *`,
      [u.id, plano.week_start, plano.week_index, plano.week_total, JSON.stringify(plano.targets), plano.note, JSON.stringify(plano.days), publicar ? 'ativo' : 'rascunho'],
    );
    if (sups) {
      await c.query(`UPDATE supplements SET active = FALSE WHERE user_id = $1`, [u.id]);
      for (const s of sups) await c.query(`INSERT INTO supplements (user_id, name, dose, time, with_meal, sort) VALUES ($1, $2, $3, $4, $5, $6)`, [u.id, s.name, s.dose, s.time, s.with_meal, s.sort]);
    }
    if (publicar) {
      const perfil = { targets: plano.targets };
      if (metaKg != null) perfil.meta_kg = metaKg;
      await c.query(
        `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()`,
        [u.id, JSON.stringify(perfil)],
      );
      if (recado) await c.query(`INSERT INTO lu_messages (user_id, kind, author, text) VALUES ($1, 'recado', 'nutri', $2)`, [u.id, recado]);
    }
    await c.query('COMMIT');

    if (publicar && b.avisar !== false) avisarPlanoPronto(u.id);

    let email = { enviado: false };
    if (publicar && b.avisar !== false && u.email) {
      const semana = plano.week_index && plano.week_total ? `semana ${plano.week_index} de ${plano.week_total}` : null;
      email = await enviarPlanoPronto({ para: u.email, nome: (u.display_name || '').split(' ')[0], semana }).catch((e) => { console.warn('[nutri] e-mail de plano falhou:', e.message); return { enviado: false, erro: e.message }; });
    }
    res.json({ plano: { ...planoResumido(salvo), days: salvo.days, published_at: salvo.published_at }, email });
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    next(e);
  } finally { c.release(); }
});

// Rascunho some; plano ativo é encerrado (a cliente para de ver, o histórico fica).
router.delete('/pacientes/:id/planos/:planoId', soNutri, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    if (!uuid(req.params.planoId)) throw erro('plano não encontrado', 404, 'NOT_FOUND');
    const { rows } = await getPool().query(`SELECT status FROM meal_plans WHERE id = $1 AND user_id = $2`, [req.params.planoId, u.id]);
    if (!rows[0]) throw erro('plano não encontrado', 404, 'NOT_FOUND');
    if (rows[0].status === 'rascunho') await getPool().query(`DELETE FROM meal_plans WHERE id = $1`, [req.params.planoId]);
    else await getPool().query(`UPDATE meal_plans SET status = 'encerrado', updated_at = NOW() WHERE id = $1`, [req.params.planoId]);
    res.json({ ok: true, status: rows[0].status === 'rascunho' ? 'apagado' : 'encerrado' });
  } catch (e) { next(e); }
});

// Copia uma semana pra outra (rascunho), com o contador avançado. É o gesto
// de toda semana: "repete a semana passada" e ajusta o que mudou.
router.post('/pacientes/:id/planos/:planoId/copiar', soNutri, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const ws = req.body?.week_start;
    if (!dataValida(ws) || new Date(`${ws}T00:00:00Z`).getUTCDay() !== 1) throw erro('week_start precisa ser uma segunda-feira');
    const { rows } = await getPool().query(`SELECT * FROM meal_plans WHERE id = $1 AND user_id = $2`, [req.params.planoId, u.id]);
    if (!rows[0]) throw erro('plano não encontrado', 404, 'NOT_FOUND');
    const o = rows[0];
    const { rows: existe } = await getPool().query(`SELECT id, status FROM meal_plans WHERE user_id = $1 AND week_start = $2`, [u.id, ws]);
    if (existe[0]) throw erro(`Já existe um plano (${existe[0].status}) pra semana de ${ws}.`, 409, 'CONFLICT');
    const wi = o.week_index && o.week_total ? (o.week_index % o.week_total) + 1 : o.week_index;
    const { rows: [novo] } = await getPool().query(
      `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, note, days, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'rascunho') RETURNING *`,
      [u.id, ws, wi, o.week_total, JSON.stringify(o.targets), o.note, JSON.stringify(o.days)],
    );
    res.status(201).json({ plano: { ...planoResumido(novo), days: novo.days } });
  } catch (e) { next(e); }
});

router.put('/pacientes/:id/suplementos', soNutri, async (req, res, next) => {
  const c = await getPool().connect();
  try {
    const u = await exigirCliente(req.params.id);
    const sups = validarSuplementos(req.body?.supplements);
    await c.query('BEGIN');
    await c.query(`UPDATE supplements SET active = FALSE WHERE user_id = $1`, [u.id]);
    for (const s of sups) await c.query(`INSERT INTO supplements (user_id, name, dose, time, with_meal, sort) VALUES ($1, $2, $3, $4, $5, $6)`, [u.id, s.name, s.dose, s.time, s.with_meal, s.sort]);
    await c.query('COMMIT');
    const { rows } = await getPool().query(`SELECT id, name, dose, time, with_meal, sort FROM supplements WHERE user_id = $1 AND active ORDER BY sort`, [u.id]);
    res.json({ suplementos: rows });
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); next(e); } finally { c.release(); }
});

// ─── Recados e dúvidas ────────────────────────────────────────────────────

router.get('/pacientes/:id/recados', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const { rows } = await getPool().query(
      `SELECT id, kind, author, text, reply_to, read_at, created_at FROM lu_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`, [u.id]);
    res.json({ mensagens: rows });
  } catch (e) { next(e); }
});

// Recado (sem reply_to) ou resposta a uma pergunta (com reply_to). Admin pode
// responder também: é dúvida de navegação tanto quanto de plano.
router.post('/pacientes/:id/recados', equipe, async (req, res, next) => {
  try {
    const u = await exigirCliente(req.params.id);
    const text = String(req.body?.text || '').trim();
    if (text.length < 2) throw erro('Escreve o recado antes de mandar.');
    if (text.length > 2000) throw erro('O recado está longo demais (máximo 2.000 caracteres).');
    let replyTo = null;
    if (req.body?.reply_to) {
      if (!uuid(req.body.reply_to)) throw erro('reply_to inválido');
      const { rows } = await getPool().query(`SELECT id FROM lu_messages WHERE id = $1 AND user_id = $2 AND kind = 'pergunta'`, [req.body.reply_to, u.id]);
      if (!rows[0]) throw erro('A pergunta não é desta paciente.', 404, 'NOT_FOUND');
      replyTo = rows[0].id;
    }
    const { rows } = await getPool().query(
      `INSERT INTO lu_messages (user_id, kind, author, text, reply_to) VALUES ($1, $2, 'nutri', $3, $4) RETURNING id, kind, author, text, reply_to, read_at, created_at`,
      [u.id, replyTo ? 'resposta' : 'recado', text, replyTo],
    );
    // Chega também no WhatsApp dela, se estiver vinculado (pela fila, sem segurar esta resposta), e no sino.
    avisarMensagemDaNutri(u.id);
    notificar(u.id, replyTo
      ? { tipo: 'resposta', titulo: 'A Nutri Luciana respondeu a sua dúvida', texto: text.slice(0, 160), link: '/perfil', refId: rows[0].id }
      : { tipo: 'recado', titulo: 'Recado da Nutri Luciana', texto: text.slice(0, 160), link: '/', refId: rows[0].id });
    res.status(201).json({ mensagem: rows[0] });
  } catch (e) { next(e); }
});

// Caixa de entrada: todas as perguntas, com a resposta (se houver) e a
// triagem da Luna (rascunho pra aprovar, ou "precisa de você").
router.get('/duvidas', equipe, async (req, res, next) => {
  try {
    const todas = req.query.todas === '1';
    const { rows } = await getPool().query(
      `SELECT q.id, q.user_id, u.display_name AS nome, q.text, q.created_at,
              q.triagem, q.rascunho, q.rascunho_motivo, q.rascunho_em,
              (SELECT json_build_object('id', r.id, 'text', r.text, 'created_at', r.created_at)
                 FROM lu_messages r WHERE r.reply_to = q.id ORDER BY r.created_at DESC LIMIT 1) AS resposta
         FROM lu_messages q JOIN users u ON u.id = q.user_id
        WHERE q.kind = 'pergunta' ${todas ? '' : `AND NOT EXISTS (SELECT 1 FROM lu_messages r WHERE r.reply_to = q.id)`}
        ORDER BY q.created_at DESC LIMIT 300`);
    res.json({ duvidas: rows });
  } catch (e) { next(e); }
});

// (Re)gera a triagem e o rascunho de uma pergunta na hora. Serve pras
// perguntas antigas (antes da triagem existir) e pra "tentar de novo".
router.post('/duvidas/:id/rascunho', soNutri, async (req, res, next) => {
  try {
    if (!uuid(req.params.id)) throw erro('id inválido');
    const d = await gerarRascunho(req.params.id);
    if (!d) throw erro('Pergunta não encontrada.', 404, 'NOT_FOUND');
    res.json({ duvida: d });
  } catch (e) { next(e); }
});

// Recado pra todo mundo que já passou pelo onboarding.
router.post('/recados/todos', soNutri, async (req, res, next) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (text.length < 2) throw erro('Escreve o recado antes de mandar.');
    if (text.length > 2000) throw erro('O recado está longo demais (máximo 2.000 caracteres).');
    const { rows } = await getPool().query(
      `INSERT INTO lu_messages (user_id, kind, author, text)
       SELECT u.id, 'recado', 'nutri', $1 FROM users u JOIN client_profiles c ON c.user_id = u.id
        WHERE u.role = 'cliente' AND c.data ? 'onboarding_em' RETURNING id`, [text]);
    res.status(201).json({ ok: true, enviados: rows.length });
  } catch (e) { next(e); }
});

// ─── Materiais ────────────────────────────────────────────────────────────

const META_MATERIAL = new Set(['duracao', 'destaque', 'thumb', 'porque', 'paginas']);
function validarMaterial(b) {
  const title = String(b?.title || '').trim().slice(0, 120);
  if (!title) throw erro('Título obrigatório.');
  if (!['video', 'pdf'].includes(b.kind)) throw erro('kind precisa ser video ou pdf');
  const url = String(b.url || '').trim().slice(0, 500);
  const fileKey = b.file_key ? String(b.file_key).slice(0, 200) : null;
  if (fileKey && !fileKey.startsWith('materiais/')) throw erro('file_key inválida');
  if (b.kind === 'video' && !/^https?:\/\//.test(url)) throw erro('Cole o link do vídeo (YouTube, Vimeo…).');
  if (b.kind === 'pdf' && !fileKey && !/^https?:\/\//.test(url)) throw erro('Envie o PDF ou cole um link.');
  const meta = {};
  for (const [k, v] of Object.entries(b.meta && typeof b.meta === 'object' ? b.meta : {})) if (META_MATERIAL.has(k) && v !== '' && v != null) meta[k] = typeof v === 'string' ? v.slice(0, 300) : v;
  return { title, kind: b.kind, url, file_key: fileKey, meta, sort: Number.isFinite(Number(b.sort)) ? Number(b.sort) : 0, active: b.active !== false };
}
async function materialComUrl(m) {
  return { ...m, url: m.file_key && r2Configurado() ? await urlDeLeitura(m.file_key).catch(() => m.url) : m.url };
}

router.get('/materiais', equipe, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(`SELECT * FROM materials ORDER BY sort, created_at DESC`);
    res.json({ materiais: await Promise.all(rows.map(materialComUrl)) });
  } catch (e) { next(e); }
});

router.post('/materiais/upload-url', soNutri, async (req, res, next) => {
  try {
    const key = novaChaveArquivo('materiais', req.body?.content_type, Number(req.body?.size) || 0);
    res.json(await urlDeUpload({ key, contentType: req.body.content_type, tamanho: Number(req.body?.size) || 0 }));
  } catch (e) { next(e); }
});

router.post('/materiais', soNutri, async (req, res, next) => {
  try {
    const m = validarMaterial(req.body);
    const { rows } = await getPool().query(
      `INSERT INTO materials (title, kind, url, file_key, meta, sort, active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [m.title, m.kind, m.url, m.file_key, JSON.stringify(m.meta), m.sort, m.active]);
    res.status(201).json({ material: await materialComUrl(rows[0]) });
  } catch (e) { next(e); }
});

router.put('/materiais/:id', soNutri, async (req, res, next) => {
  try {
    if (!uuid(req.params.id)) throw erro('material não encontrado', 404, 'NOT_FOUND');
    const m = validarMaterial(req.body);
    const { rows } = await getPool().query(
      `UPDATE materials SET title = $2, kind = $3, url = $4, file_key = $5, meta = $6, sort = $7, active = $8, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, m.title, m.kind, m.url, m.file_key, JSON.stringify(m.meta), m.sort, m.active]);
    if (!rows[0]) throw erro('material não encontrado', 404, 'NOT_FOUND');
    res.json({ material: await materialComUrl(rows[0]) });
  } catch (e) { next(e); }
});

router.delete('/materiais/:id', soNutri, async (req, res, next) => {
  try {
    if (!uuid(req.params.id)) throw erro('material não encontrado', 404, 'NOT_FOUND');
    const { rows } = await getPool().query(`DELETE FROM materials WHERE id = $1 RETURNING file_key`, [req.params.id]);
    if (rows[0]?.file_key) apagar(rows[0].file_key).catch(() => {});
    res.json({ ok: true, deleted: rows.length > 0 });
  } catch (e) { next(e); }
});

// ─── Dashboard do público ─────────────────────────────────────────────────

// Cacheado por 1h no servidor; `?atualizar=1` recalcula na hora.
router.get('/dashboard', equipe, async (req, res, next) => {
  try { res.json(await montarDashboard({ forcar: req.query.atualizar === '1' })); } catch (e) { next(e); }
});

// Regenera a síntese de persona por IA (só texto NÃO clínico entra no prompt).
router.post('/dashboard/sintese', equipe, async (req, res, next) => {
  try { res.json({ sintese: await gerarSintese({ forcar: true }) }); } catch (e) { next(e); }
});

export default router;
