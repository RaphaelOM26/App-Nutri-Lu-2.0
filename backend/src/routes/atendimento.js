// Painel de Atendimento — rotas /atendimento/*.
//
// É por aqui que o TIME responde no WhatsApp. O número da API não abre em
// celular nenhum: a conversa com pessoa acontece nesta tela, e é por isso que
// cabem várias pessoas atendendo ao mesmo tempo.
//
// Quem entra (users.role, lido do banco a cada pedido):
//   suporte → só esta área. Vê a conversa DURANTE o atendimento humano
//             (sessao_humana), nunca o que a paciente falou com a Luna antes,
//             nunca mensagem marcada como saúde, nunca foto de evolução. Da
//             paciente, só o que resolve suporte: nome, e-mail, acesso, plano.
//   admin   → a conversa inteira, com as mensagens de saúde ocultas.
//   nutri   → tudo.
//
// Escala (ver CLAUDE.md): lista paginada e filtrada no banco, contadores por
// query em índice parcial, histórico por cursor. Enviar nunca espera a Meta
// além de uma chamada; fora da janela de 24 h a mensagem fica guardada e um
// aviso por modelo sai pela fila.

import { Router } from 'express';
import { getPool } from '../db.js';
import { requirePapel } from '../services/auth.js';
import { temAcesso } from '../services/billing.js';
import { urlDeLeitura, r2Configurado } from '../services/r2.js';
import { erro, planoDaData } from '../services/diario.js';
import { dataBR } from '../utils/datas.js';
import { mascarar, whatsappConfigurado, numeroDoBot } from '../services/whatsapp/api.js';
import { contatoPorId, janelaAberta, mandar, chamarEquipe, devolverPraLuna } from '../services/whatsapp/contatos.js';
import { avisarMensagemDaEquipe } from '../services/whatsapp/avisos.js';
import { notificar } from '../services/notificacoes.js';

const router = Router();
router.use(requirePapel('nutri', 'admin', 'suporte'));

const uuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));
const OCULTA = '[mensagem sobre saúde: só a Nutri Luciana vê]';

async function exigirContato(id) {
  const c = uuid(id) ? await contatoPorId(id) : null;
  if (!c) throw erro('Conversa não encontrada', 404, 'NOT_FOUND');
  return c;
}

/** O que cada papel pode ler de UMA mensagem. */
function visivel(m, papel) {
  const esconde = m.clinico && papel !== 'nutri';
  return { id: m.id, direcao: m.direcao, autor: m.autor, autor_nome: m.autor_nome || null, tipo: m.tipo, status: m.status, criado_em: m.criado_em, oculta: esconde, texto: esconde ? OCULTA : m.texto };
}

// ─── Contadores (menu) ────────────────────────────────────────────────────

router.get('/resumo', async (req, res, next) => {
  try {
    const { rows: [r] } = await getPool().query(
      `SELECT COUNT(*) FILTER (WHERE aguardando_equipe)::int AS aguardando, COUNT(*)::int AS abertas,
              COUNT(*) FILTER (WHERE fila = 'comercial')::int AS comercial
         FROM whatsapp_contatos WHERE atendimento = 'humano'`);
    res.json({ ...r, papel: req.user.role, whatsapp: { ligado: whatsappConfigurado(), numero: numeroDoBot() ? mascarar(numeroDoBot()) : null } });
  } catch (e) { next(e); }
});

// ─── Lista de conversas ───────────────────────────────────────────────────
//   GET /atendimento/conversas?situacao=abertas|todas&fila=suporte|comercial&q=&pagina=1
// "abertas" = em atendimento humano, quem espera resposta primeiro e, entre
// essas, a mais antiga no topo. "todas" serve pra ACHAR uma paciente e puxar
// conversa; exige busca (ninguém pagina 10 mil contatos à toa).

router.get('/conversas', async (req, res, next) => {
  try {
    const papel = req.user.role;
    const situacao = req.query.situacao === 'todas' ? 'todas' : 'abertas';
    const fila = ['suporte', 'comercial'].includes(req.query.fila) ? req.query.fila : null;
    const q = String(req.query.q || '').trim().slice(0, 80);
    const limite = 30; const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    if (situacao === 'todas' && q.length < 3) return res.json({ conversas: [], total: 0, pagina, limite, precisa_busca: true });

    const digitos = q.replace(/\D/g, '');
    const where = `${situacao === 'abertas' ? `c.atendimento = 'humano'` : 'TRUE'}
       AND ($1::text IS NULL OR c.fila = $1)
       AND ($2::text IS NULL OR u.display_name ILIKE $2 OR u.email ILIKE $2 OR c.nome_perfil ILIKE $2 OR ($3::text <> '' AND c.wa_id LIKE $3))`;
    const params = [fila, q ? `%${q}%` : null, digitos.length >= 4 ? `%${digitos}` : ''];
    const pool = getPool();
    const [lista, total] = await Promise.all([
      pool.query(
        `SELECT c.id, c.wa_id, c.nome_perfil, c.user_id, c.atendimento, c.fila, c.aguardando_equipe, c.atendimento_desde, c.ultima_msg_cliente_em,
                u.display_name, u.email, a.display_name AS atendente_nome,
                (SELECT json_build_object('texto', m.texto, 'autor', m.autor, 'criado_em', m.criado_em, 'clinico', m.clinico)
                   FROM whatsapp_mensagens m WHERE m.contato_id = c.id AND ($6::boolean OR m.sessao_humana)
                  ORDER BY m.criado_em DESC LIMIT 1) AS ultima
           FROM whatsapp_contatos c
           LEFT JOIN users u ON u.id = c.user_id
           LEFT JOIN users a ON a.id = c.atendente_id
          WHERE ${where}
          ORDER BY (c.atendimento = 'humano') DESC, c.aguardando_equipe DESC, c.atendimento_desde ASC NULLS LAST, c.updated_at DESC
          LIMIT $4 OFFSET $5`,
        [...params, limite, (pagina - 1) * limite, papel !== 'suporte']),
      pool.query(`SELECT COUNT(*)::int AS n FROM whatsapp_contatos c LEFT JOIN users u ON u.id = c.user_id WHERE ${where}`, params),
    ]);
    res.json({
      total: total.rows[0].n, pagina, limite,
      conversas: lista.rows.map((c) => ({
        id: c.id, nome: c.display_name || c.nome_perfil || 'Sem nome', email: c.email, numero: mascarar(c.wa_id), paciente: Boolean(c.user_id), user_id: c.user_id,
        atendimento: c.atendimento, fila: c.fila, aguardando: c.aguardando_equipe, desde: c.atendimento_desde, atendente: c.atendente_nome,
        janela_aberta: janelaAberta(c),
        ultima: c.ultima ? { autor: c.ultima.autor, criado_em: c.ultima.criado_em, texto: c.ultima.clinico && papel !== 'nutri' ? OCULTA : String(c.ultima.texto || '').slice(0, 140) } : null,
      })),
    });
  } catch (e) { next(e); }
});

// ─── Uma conversa ─────────────────────────────────────────────────────────

router.get('/conversas/:id', async (req, res, next) => {
  try {
    const c = await exigirContato(req.params.id);
    let paciente = null;
    if (c.user_id) {
      const pool = getPool();
      const [u, acesso, perfil, plano] = await Promise.all([
        pool.query(`SELECT id, display_name, email, created_at FROM users WHERE id = $1`, [c.user_id]),
        temAcesso(c.user_id),
        pool.query(`SELECT data ? 'onboarding_em' AS cadastro_ok FROM client_profiles WHERE user_id = $1`, [c.user_id]),
        planoDaData(c.user_id, dataBR()),
      ]);
      // Só o que resolve suporte. Perfil, diário e anamnese NÃO vêm pra cá.
      paciente = { id: u.rows[0]?.id, nome: u.rows[0]?.display_name, email: u.rows[0]?.email, desde: u.rows[0]?.created_at, acesso, cadastro_ok: perfil.rows[0]?.cadastro_ok === true, plano_publicado: Boolean(plano) };
    }
    const { rows: [a] } = c.atendente_id ? await getPool().query(`SELECT display_name FROM users WHERE id = $1`, [c.atendente_id]) : { rows: [] };
    res.json({
      conversa: { id: c.id, nome: paciente?.nome || c.nome_perfil || 'Sem nome', numero: mascarar(c.wa_id), atendimento: c.atendimento, fila: c.fila, aguardando: c.aguardando_equipe, desde: c.atendimento_desde, atendente: a?.display_name || null, atendente_sou_eu: c.atendente_id === req.user.userId, janela_aberta: janelaAberta(c), avisos_desligados: Boolean(c.opt_out_em) },
      paciente,
    });
  } catch (e) { next(e); }
});

// Histórico por cursor (as mais recentes primeiro; `antes` = criado_em da mais antiga já carregada).
router.get('/conversas/:id/mensagens', async (req, res, next) => {
  try {
    const c = await exigirContato(req.params.id);
    const papel = req.user.role;
    const antes = req.query.antes && !Number.isNaN(Date.parse(req.query.antes)) ? new Date(req.query.antes) : null;
    const limite = 50;
    const { rows } = await getPool().query(
      `SELECT m.id, m.direcao, m.autor, m.tipo, m.texto, m.status, m.clinico, m.sessao_humana, m.media_key, m.media_mime, m.criado_em, u.display_name AS autor_nome
         FROM whatsapp_mensagens m LEFT JOIN users u ON u.id = m.autor_id
        WHERE m.contato_id = $1 AND ($2::timestamptz IS NULL OR m.criado_em < $2) AND ($3::boolean OR m.sessao_humana)
        ORDER BY m.criado_em DESC LIMIT $4`,
      [c.id, antes, papel !== 'suporte', limite + 1]);
    const tem_mais = rows.length > limite;
    const mensagens = await Promise.all(rows.slice(0, limite).map(async (m) => {
      const v = visivel(m, papel);
      // Mídia: só a que chegou DURANTE o atendimento humano (comprovante, print) e não é de saúde.
      const podeMidia = m.media_key && m.sessao_humana && !v.oculta && r2Configurado();
      return { ...v, midia: podeMidia ? { url: await urlDeLeitura(m.media_key).catch(() => null), mime: m.media_mime } : null };
    }));
    res.json({ mensagens: mensagens.reverse(), tem_mais });
  } catch (e) { next(e); }
});

// ─── Ações ────────────────────────────────────────────────────────────────

const meuNome = async (userId) => {
  const { rows: [u] } = await getPool().query(`SELECT display_name FROM users WHERE id = $1`, [userId]);
  return String(u?.display_name || '').trim().split(/\s+/)[0] || 'Equipe';
};

async function assumir(contato, userId) {
  if (contato.atendimento !== 'humano') await chamarEquipe(contato, contato.fila || (contato.user_id ? 'suporte' : 'comercial'));
  const { rows: [novo] } = await getPool().query(
    `UPDATE whatsapp_contatos SET atendente_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [contato.id, userId]);
  return Object.assign(contato, novo);
}

router.post('/conversas/:id/assumir', async (req, res, next) => {
  try {
    const c = await assumir(await exigirContato(req.params.id), req.user.userId);
    res.json({ ok: true, atendimento: c.atendimento, fila: c.fila });
  } catch (e) { next(e); }
});

router.post('/conversas/:id/mensagens', async (req, res, next) => {
  try {
    const texto = String(req.body?.text || '').trim();
    if (texto.length < 1) throw erro('Escreve a mensagem antes de enviar.');
    if (texto.length > 2000) throw erro('A mensagem está longa demais (máximo 2.000 caracteres).');
    let c = await exigirContato(req.params.id);
    // Responder É assumir: com uma pessoa escrevendo, a Luna tem que ficar calada.
    if (c.atendimento !== 'humano' || !c.atendente_id) c = await assumir(c, req.user.userId);
    // A paciente precisa saber que agora é gente (e quem), não a Luna.
    const r = await mandar(c, { texto: `*${await meuNome(req.user.userId)} · time Nutri Lu*\n${texto}` }, { autor: 'equipe', autorId: req.user.userId });
    await getPool().query(`UPDATE whatsapp_contatos SET aguardando_equipe = FALSE, updated_at = NOW() WHERE id = $1`, [c.id]);
    // Janela fechada: a mensagem ficou guardada; um aviso por modelo sai pela fila.
    if (r.pendente) avisarMensagemDaEquipe(c);
    if (c.user_id) notificar(c.user_id, { tipo: 'equipe', titulo: 'O time do Nutri Lu te respondeu', texto: texto.slice(0, 160), link: '/perfil', refId: r.id || null });
    res.status(201).json({ ok: true, enviada: r.enviada, guardada: r.pendente === true });
  } catch (e) { next(e); }
});

router.post('/conversas/:id/encerrar', async (req, res, next) => {
  try {
    const c = await exigirContato(req.params.id);
    if (c.atendimento === 'humano') {
      await devolverPraLuna(c);
      if (janelaAberta(c) && req.body?.avisar !== false) {
        await mandar(c, { texto: c.user_id ? 'Atendimento encerrado. ✅ A Luna volta a te responder por aqui. Se precisar do time de novo, é só escrever *atendente*.' : 'Atendimento encerrado. ✅ Se precisar de novo, é só chamar por aqui.' }, { autor: 'sistema' })
          .catch((e) => console.warn('[atendimento] aviso de encerramento falhou:', e.message));
      }
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
