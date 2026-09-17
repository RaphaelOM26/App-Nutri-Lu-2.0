// Avisos que NASCEM na plataforma e vão pro WhatsApp: a Nutri Luciana
// respondeu uma dúvida, mandou um recado, publicou o plano.
//
// A regra de custo e de privacidade, numa frase: o CONTEÚDO só sai dentro da
// janela de 24 h (grátis, mensagem livre). Fora dela sai um MODELO curto e
// genérico ("a Nutri Luciana respondeu, toque pra ver") — um por contato a
// cada 20 h — e o conteúdo chega quando a pessoa tocar no botão ou escrever.
// Assim a resposta sobre a saúde dela nunca viaja dentro de um modelo, e três
// respostas na mesma tarde custam um aviso, não três.
//
// Nada aqui roda dentro do request do painel: quem publica/responde só
// enfileira (avisar*), o trabalhador entrega.

import { getPool } from '../../db.js';
import { enfileirar } from './fila.js';
import { contatoDaUsuaria, janelaAberta, mandar, mandarModelo, entregarGuardadas, atualizarEstado } from './contatos.js';

const LINK_PLANO = process.env.MEMBROS_URL ? `${process.env.MEMBROS_URL.replace(/\/$/, '')}/plano` : 'https://nutrilualves.com.br/membros/plano';

// Modelos (categoria UTILIDADE) que o Raphael cadastra na Meta. Textos em
// docs/whatsapp-bot.md. Só são usados se estiverem em WHATSAPP_TEMPLATES.
export const MODELOS = { resposta: 'resposta_nutri', plano: 'plano_pronto', equipe: 'mensagem_equipe' };

// Painel → fila. Chamar DEPOIS do commit; nunca lançam nem seguram o request.
//
// A chave do trabalho é o wa_id, a MESMA das mensagens recebidas: aviso e
// mensagem da mesma pessoa nunca rodam ao mesmo tempo (senão os dois
// entregariam a mesma resposta). Sem WhatsApp vinculado, nem enfileira.
async function enfileirarAviso(kind, userId) {
  try {
    const contato = await contatoDaUsuaria(userId);
    if (contato) await enfileirar('aviso', contato.wa_id, { kind, userId });
  } catch (e) { console.warn('[whatsapp] não enfileirei aviso:', e.message); }
}
export function avisarMensagemDaNutri(userId) { enfileirarAviso('nutri', userId); }
export function avisarPlanoPronto(userId) { enfileirarAviso('plano', userId); }
export function avisarMensagemDaEquipe(contato) {
  enfileirar('aviso', contato.wa_id, { kind: 'equipe', contatoId: contato.id }).catch((e) => console.warn('[whatsapp] não enfileirei aviso:', e.message));
}

const primeiroNome = (s) => String(s || '').trim().split(/\s+/)[0] || 'tudo bem';

/** Executor do tipo 'aviso'. */
export async function executarAviso({ kind, userId, contatoId }) {
  const pool = getPool();
  if (kind === 'equipe') {
    const { rows: [contato] } = await pool.query(`SELECT * FROM whatsapp_contatos WHERE id = $1`, [contatoId]);
    if (!contato) return;
    if (janelaAberta(contato)) { await entregarGuardadas(contato); return; }
    await mandarModelo(contato, MODELOS.equipe, [primeiroNome(contato.nome_perfil)]);
    return;
  }
  const contato = await contatoDaUsuaria(userId);
  if (!contato) return; // sem WhatsApp vinculado: o e-mail e a área de membros continuam valendo
  const { rows: [u] } = await pool.query(`SELECT display_name FROM users WHERE id = $1`, [userId]);
  if (kind === 'plano') await atualizarEstado(contato, { plano_pendente: true });
  if (janelaAberta(contato)) { await entregarPendentes(contato); return; }
  await mandarModelo(contato, kind === 'plano' ? MODELOS.plano : MODELOS.resposta, [primeiroNome(u?.display_name)]);
}

/**
 * Entrega tudo que está esperando a janela: recados/respostas da Nutri
 * Luciana, o aviso de plano pronto e o que a equipe escreveu. Chamado a cada
 * mensagem que a paciente manda (é ela escrevendo que abre a janela).
 *
 * Só o que veio DEPOIS do vínculo e dos últimos 7 dias: quem vincula hoje não
 * recebe de uma vez todos os recados do mês passado.
 *
 * @returns {Promise<number>} quantas mensagens saíram
 */
export async function entregarPendentes(contato) {
  if (!contato.user_id || !janelaAberta(contato)) return 0;
  const pool = getPool();
  let n = 0;
  const { rows } = await pool.query(
    `SELECT m.id, m.kind, m.text, q.text AS pergunta
       FROM lu_messages m LEFT JOIN lu_messages q ON q.id = m.reply_to
      WHERE m.user_id = $1 AND m.author = 'nutri' AND m.wa_entregue_em IS NULL
        AND m.created_at > GREATEST($2::timestamptz, NOW() - interval '7 days')
      ORDER BY m.created_at LIMIT 10`,
    [contato.user_id, contato.vinculado_em || new Date(0)]);
  for (const m of rows) {
    const texto = m.kind === 'resposta'
      ? `*A Nutri Luciana respondeu a sua dúvida*${m.pergunta ? `\n\n_Você perguntou:_ ${String(m.pergunta).slice(0, 300)}` : ''}\n\n${m.text}`
      : `*Recado da Nutri Luciana*\n\n${m.text}`;
    // Marca ANTES de mandar (e desmarca se falhar): duas entregas concorrentes
    // não mandam a mesma resposta duas vezes.
    const { rowCount } = await pool.query(`UPDATE lu_messages SET wa_entregue_em = NOW() WHERE id = $1 AND wa_entregue_em IS NULL`, [m.id]);
    if (!rowCount) continue;
    try {
      // A resposta dela pode falar de saúde: fica fora da visão do suporte.
      await mandar(contato, { texto }, { autor: 'sistema', clinico: true });
      n += 1;
    } catch (e) {
      await pool.query(`UPDATE lu_messages SET wa_entregue_em = NULL WHERE id = $1`, [m.id]);
      throw e;
    }
  }
  if (contato.estado?.plano_pendente) {
    await mandar(contato, { texto: `*Seu plano está pronto!* 🎉\n\nA Nutri Luciana montou e publicou as suas refeições. Pra ver o de hoje aqui mesmo, me pergunta: *o que como hoje?*\n\nO plano completo, com as trocas e a lista de compras, está na área de membros:\n${LINK_PLANO}` }, { autor: 'sistema' });
    await atualizarEstado(contato, { plano_pendente: null });
    n += 1;
  }
  n += await entregarGuardadas(contato);
  return n;
}
