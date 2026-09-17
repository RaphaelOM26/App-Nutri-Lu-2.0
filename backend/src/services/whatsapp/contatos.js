// Contatos do WhatsApp: quem é quem, a janela de 24 h, o vínculo por código e
// o envio com registro no histórico. Tudo que o bot, os avisos e o painel de
// Atendimento têm em comum mora aqui.

import crypto from 'node:crypto';
import { getPool } from '../../db.js';
import { motivoClinico } from '../triagem.js';
import { enviar, templateAprovado, numeroDoBot } from './api.js';
import { acordar } from './fila.js';

// ─── Janela de 24 h ───────────────────────────────────────────────────────
// Regra da Meta: depois que a PESSOA escreve, a empresa pode responder
// livremente (e de graça) por 24 h. Fora disso, só modelo aprovado — cobrado
// e contado no limite diário do portfólio. 10 min de folga pro relógio.
const JANELA_MS = 24 * 60 * 60 * 1000 - 10 * 60 * 1000;

export function janelaAberta(contato) {
  const t = contato?.ultima_msg_cliente_em ? new Date(contato.ultima_msg_cliente_em).getTime() : 0;
  return Date.now() - t < JANELA_MS;
}

export async function contatoPorWaId(waId) {
  const { rows } = await getPool().query(`SELECT * FROM whatsapp_contatos WHERE wa_id = $1`, [waId]);
  return rows[0] || null;
}
export async function contatoPorId(id) {
  const { rows } = await getPool().query(`SELECT * FROM whatsapp_contatos WHERE id = $1`, [id]);
  return rows[0] || null;
}
export async function contatoDaUsuaria(userId) {
  const { rows } = await getPool().query(`SELECT * FROM whatsapp_contatos WHERE user_id = $1`, [userId]);
  return rows[0] || null;
}

/** O que a pessoa "disse", em texto, pra qualquer tipo de mensagem (histórico e painel). */
export function textoDaMensagem(msg) {
  switch (msg?.type) {
    case 'text': return String(msg.text?.body || '');
    case 'interactive': return String(msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '');
    case 'button': return String(msg.button?.text || '');
    case 'image': return msg.image?.caption ? `[foto] ${msg.image.caption}` : '[foto]';
    case 'audio': return '[áudio]';
    case 'document': return msg.document?.filename ? `[documento] ${msg.document.filename}` : '[documento]';
    default: return `[${msg?.type || 'mensagem'}]`;
  }
}

/**
 * Chamado pelo WEBHOOK pra cada mensagem recebida: abre/renova a janela,
 * grava no histórico, cria o trabalho na fila e diz se a mensagem é nova. `wa_message_id` único é a
 * trava contra o reenvio da Meta (ela repete por até 7 dias se não ouvir 200).
 *
 * @returns {Promise<{ contato: object, mensagemId: string | null }>}  mensagemId nulo = repetida
 */
export async function registrarEntrada({ waId, nome, msg }) {
  // A hora da Meta vem em SEGUNDOS; as nossas respostas são gravadas com
  // milissegundos. Usar a dela no caminho normal embaralha a ordem da conversa
  // (a pergunta aparece depois da resposta dada no mesmo segundo). Então vale a
  // hora da chegada — a não ser que a mensagem chegue atrasada (servidor fora,
  // reenvio): aí a hora da Meta é a verdadeira, e é ela que decide em que
  // refeição a foto cai.
  //
  // E "hora da chegada" é o NOW() do BANCO (quando = null), não o relógio deste
  // servidor: as respostas são gravadas com o NOW() do banco, e dois relógios
  // diferentes embaralhariam a conversa do mesmo jeito.
  const daMeta = Number(msg.timestamp) > 0 ? new Date(Number(msg.timestamp) * 1000) : null;
  const quando = daMeta && Date.now() - daMeta.getTime() > 2 * 60 * 1000 ? daMeta : null;
  // Mensagem e trabalho nascem na MESMA transação. Se fossem dois passos e o
  // segundo falhasse, a Meta reenviaria, a mensagem já existiria ("repetida")
  // e o trabalho nunca seria criado: mensagem perdida em silêncio.
  const pool = await getPool().connect();
  try {
    await pool.query('BEGIN');
    const r = await gravarEntrada(pool, { waId, nome, msg, quando });
    if (r.mensagemId) {
      await pool.query(`INSERT INTO whatsapp_fila (tipo, chave, payload) VALUES ('mensagem', $1, $2)`, [waId, JSON.stringify({ waId, mensagemId: r.mensagemId, msg })]);
    }
    await pool.query('COMMIT');
    if (r.mensagemId) acordar();
    return r;
  } catch (e) {
    await pool.query('ROLLBACK').catch(() => {});
    throw e;
  } finally { pool.release(); }
}

async function gravarEntrada(pool, { waId, nome, msg, quando }) {
  const { rows: [contato] } = await pool.query(
    `INSERT INTO whatsapp_contatos (wa_id, nome_perfil, ultima_msg_cliente_em) VALUES ($1, $2, COALESCE($3::timestamptz, NOW()))
     ON CONFLICT (wa_id) DO UPDATE SET
       nome_perfil = COALESCE(EXCLUDED.nome_perfil, whatsapp_contatos.nome_perfil),
       ultima_msg_cliente_em = GREATEST(whatsapp_contatos.ultima_msg_cliente_em, EXCLUDED.ultima_msg_cliente_em),
       aguardando_equipe = CASE WHEN whatsapp_contatos.atendimento = 'humano' THEN TRUE ELSE whatsapp_contatos.aguardando_equipe END,
       updated_at = NOW()
     RETURNING *`,
    [waId, nome ? String(nome).slice(0, 80) : null, quando],
  );
  const texto = textoDaMensagem(msg).slice(0, 4000);
  const { rows } = await pool.query(
    `INSERT INTO whatsapp_mensagens (contato_id, direcao, wa_message_id, tipo, texto, autor, clinico, sessao_humana, status, criado_em)
     VALUES ($1, 'in', $2, $3, $4, 'cliente', $5, $6, 'recebida', COALESCE($7::timestamptz, NOW()))
     ON CONFLICT (wa_message_id) DO NOTHING RETURNING id`,
    [contato.id, msg.id, String(msg.type || 'outro').slice(0, 20), texto, motivoClinico(texto) !== null, contato.atendimento === 'humano', quando],
  );
  return { contato, mensagemId: rows[0]?.id || null };
}

// ─── Estado da conversa ───────────────────────────────────────────────────
// Pouca coisa e de vida curta: "estou esperando a pergunta pra Luciana",
// "a pergunta que a Luna ofereceu encaminhar". Valor null apaga a chave.
// Sem corrida: a fila processa UMA mensagem por contato de cada vez.

export async function atualizarEstado(contato, patch) {
  const novo = { ...(contato.estado || {}) };
  for (const [k, v] of Object.entries(patch)) { if (v === null || v === undefined) delete novo[k]; else novo[k] = v; }
  contato.estado = novo;
  await getPool().query(`UPDATE whatsapp_contatos SET estado = $2, updated_at = NOW() WHERE id = $1`, [contato.id, JSON.stringify(novo)]);
  return novo;
}

// ─── Envio com registro ───────────────────────────────────────────────────

const negritoDoWhatsapp = (s) => String(s).replace(/\*\*([^*\n]+)\*\*/g, '*$1*');

function conteudoDe({ texto, botoes, lista, documento }) {
  const corpo = negritoDoWhatsapp(texto || '').slice(0, 4000);
  if (documento) return { type: 'document', document: { link: documento.link, filename: String(documento.nome || 'arquivo.pdf').slice(0, 120), ...(corpo ? { caption: corpo.slice(0, 1000) } : {}) } };
  if (botoes?.length) {
    return { type: 'interactive', interactive: { type: 'button', body: { text: corpo.slice(0, 1024) }, action: { buttons: botoes.slice(0, 3).map((b) => ({ type: 'reply', reply: { id: String(b.id).slice(0, 256), title: String(b.titulo).slice(0, 20) } })) } } };
  }
  if (lista?.itens?.length) {
    return { type: 'interactive', interactive: { type: 'list', body: { text: corpo.slice(0, 1024) }, action: { button: String(lista.botao || 'Escolher').slice(0, 20), sections: [{ title: String(lista.titulo || 'Opções').slice(0, 24), rows: lista.itens.slice(0, 10).map((i) => ({ id: String(i.id).slice(0, 200), title: String(i.titulo).slice(0, 24), ...(i.descricao ? { description: String(i.descricao).slice(0, 72) } : {}) })) }] } } };
  }
  return { type: 'text', text: { body: corpo, preview_url: /https?:\/\//.test(corpo) } };
}

/**
 * Manda uma mensagem LIVRE (não-modelo) e grava no histórico.
 *
 * Fora da janela de 24 h a Meta recusaria. Mensagem da EQUIPE fica guardada
 * ('aguardando_janela') e sai quando a pessoa escrever de novo; resposta do
 * bot fora da janela não deveria existir (ele só fala depois dela) e é descartada.
 *
 * @param {{ texto?: string, botoes?: {id,titulo}[], lista?: object, documento?: object }} saida
 * @returns {Promise<{ enviada: boolean, pendente?: boolean, id?: string }>}
 */
export async function mandar(contato, saida, { autor = 'luna', autorId = null, clinico = false } = {}) {
  const pool = getPool();
  const humana = contato.atendimento === 'humano';
  const gravar = (status, waMessageId, erro) => pool.query(
    `INSERT INTO whatsapp_mensagens (contato_id, direcao, wa_message_id, tipo, texto, autor, autor_id, clinico, sessao_humana, status, erro)
     VALUES ($1, 'out', $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [contato.id, waMessageId || null, saida.documento ? 'document' : saida.botoes?.length || saida.lista ? 'interactive' : 'text', String(saida.texto || '').slice(0, 4000), autor, autorId, clinico, humana, status, erro || null],
  );

  if (!janelaAberta(contato)) {
    if (autor !== 'equipe') { console.warn('[whatsapp] resposta do bot fora da janela descartada'); return { enviada: false }; }
    const { rows } = await gravar('aguardando_janela');
    return { enviada: false, pendente: true, id: rows[0].id };
  }
  // Texto comprido + botões: o corpo de mensagem com botão para em 1.024
  // caracteres. Manda o texto inteiro antes e os botões numa segunda, curta.
  if ((saida.botoes?.length || saida.lista) && String(saida.texto || '').length > 1000) {
    await mandar(contato, { texto: saida.texto }, { autor, autorId, clinico });
    saida = { ...saida, texto: 'O que você prefere?' };
  }
  try {
    const r = await enviar(contato.wa_id, conteudoDe(saida));
    const { rows } = await gravar(r.simulada ? 'simulada' : 'enviada', r.id);
    return { enviada: true, id: rows[0].id };
  } catch (e) {
    await gravar('falhou', null, String(e.message).slice(0, 300));
    throw e;
  }
}

/** Reenvia o que a equipe escreveu enquanto a janela estava fechada. */
export async function entregarGuardadas(contato) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, texto FROM whatsapp_mensagens WHERE contato_id = $1 AND status = 'aguardando_janela' ORDER BY criado_em LIMIT 10`, [contato.id]);
  for (const m of rows) {
    try {
      const r = await enviar(contato.wa_id, conteudoDe({ texto: m.texto }));
      await pool.query(`UPDATE whatsapp_mensagens SET status = $2, wa_message_id = $3, criado_em = NOW() WHERE id = $1`, [m.id, r.simulada ? 'simulada' : 'enviada', r.id]);
    } catch (e) {
      await pool.query(`UPDATE whatsapp_mensagens SET status = 'falhou', erro = $2 WHERE id = $1`, [m.id, String(e.message).slice(0, 300)]);
    }
  }
  return rows.length;
}

// Um modelo por contato a cada 20 h, no máximo: modelo custa (~R$ 0,05) e
// conta no limite diário do portfólio. Se a Luciana responder 3 dúvidas da
// mesma pessoa numa tarde, ela recebe UM aviso e as 3 respostas ao abrir.
const INTERVALO_AVISO_MS = 20 * 60 * 60 * 1000;

/**
 * Manda um MODELO aprovado (única coisa permitida fora da janela).
 * Não manda se: a pessoa pediu PARAR, o modelo não está na lista de
 * aprovados, ou ela já recebeu um aviso há pouco.
 *
 * @returns {Promise<{ enviada: boolean, motivo?: string }>}
 */
export async function mandarModelo(contato, nome, parametros = []) {
  if (contato.opt_out_em) return { enviada: false, motivo: 'opt_out' };
  if (!templateAprovado(nome)) return { enviada: false, motivo: 'modelo_nao_aprovado' };
  if (contato.ultimo_aviso_em && Date.now() - new Date(contato.ultimo_aviso_em).getTime() < INTERVALO_AVISO_MS) return { enviada: false, motivo: 'aviso_recente' };
  const pool = getPool();
  const components = parametros.length ? [{ type: 'body', parameters: parametros.map((t) => ({ type: 'text', text: String(t).slice(0, 60) })) }] : [];
  try {
    const r = await enviar(contato.wa_id, { type: 'template', template: { name: nome, language: { code: 'pt_BR' }, components } });
    await pool.query(`UPDATE whatsapp_contatos SET ultimo_aviso_em = NOW() WHERE id = $1`, [contato.id]);
    await pool.query(
      `INSERT INTO whatsapp_mensagens (contato_id, direcao, wa_message_id, tipo, texto, autor, status) VALUES ($1, 'out', $2, 'template', $3, 'sistema', $4)`,
      [contato.id, r.id, `[modelo ${nome}]`, r.simulada ? 'simulada' : 'enviada']);
    return { enviada: true };
  } catch (e) {
    console.warn(`[whatsapp] modelo ${nome} falhou:`, e.message);
    return { enviada: false, motivo: 'erro' };
  }
}

// ─── Vínculo por código ───────────────────────────────────────────────────
// A paciente gera o código na área de membros (logada) e manda DO WhatsApp
// dela pro número do bot. Prova as duas pontas: quem está logada e de quem é
// o número. E como é ELA que escreve primeiro, a janela abre: o onboarding
// inteiro sai grátis e fora do limite de conversas iniciadas pela empresa.

// Sem 0/O e 1/I/L (mesmo alfabeto dos códigos de acesso): código digitado errado vira suporte.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const TAMANHO = 6;
const VALIDADE_MIN = 30;

export async function criarCodigoDeVinculo(userId) {
  const pool = getPool();
  await pool.query(`DELETE FROM whatsapp_codigos WHERE user_id = $1 AND used_at IS NULL`, [userId]);
  for (let t = 0; t < 8; t++) {
    let code = '';
    for (let i = 0; i < TAMANHO; i++) code += ALFABETO[crypto.randomInt(0, ALFABETO.length)];
    // Todo código tem número: é o que o separa de uma palavra comum de 6 letras
    // ("JANTAR", "MANDAR") na hora de procurá-lo dentro de uma frase.
    if (!/\d/.test(code)) continue;
    try {
      const { rows } = await pool.query(
        `INSERT INTO whatsapp_codigos (code, user_id, expires_at) VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval) RETURNING code, expires_at`,
        [code, userId, String(VALIDADE_MIN)]);
      const numero = numeroDoBot();
      const texto = `Oi! Quero ativar o meu WhatsApp no Nutri Lu. Meu código: ${code}`;
      return { codigo: rows[0].code, expira_em: rows[0].expires_at, link: numero ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` : null };
    } catch (e) { if (e?.code !== '23505') throw e; }
  }
  throw new Error('não consegui gerar um código único');
}

const RE_CODIGO = new RegExp(`(?<![A-Z0-9])(?=[A-Z]*\\d)[${ALFABETO}]{${TAMANHO}}(?![A-Z0-9])`, 'g');
const MAX_ERROS = 5;

/**
 * Procura um código de vínculo no texto e, se valer, liga o número à conta.
 * @returns {Promise<{ ok: true, userId: string } | { ok: false, motivo: 'sem_codigo' | 'invalido' | 'bloqueado' }>}
 */
export async function tentarVinculo(contato, texto) {
  const candidatos = [...new Set(String(texto || '').toUpperCase().match(RE_CODIGO) || [])].slice(0, 4);
  if (!candidatos.length) return { ok: false, motivo: 'sem_codigo' };

  // Freio contra chute: 5 códigos errados por hora por número.
  const erros = contato.estado?.erros_codigo;
  const recentes = erros && Date.now() - new Date(erros.desde).getTime() < 60 * 60 * 1000 ? erros.n : 0;
  if (recentes >= MAX_ERROS) return { ok: false, motivo: 'bloqueado' };

  const c = await getPool().connect();
  try {
    await c.query('BEGIN');
    const { rows } = await c.query(
      `UPDATE whatsapp_codigos SET used_at = NOW()
        WHERE code = ANY($1) AND used_at IS NULL AND expires_at > NOW() RETURNING user_id`, [candidatos]);
    if (!rows[0]) {
      await c.query('ROLLBACK');
      await atualizarEstado(contato, { erros_codigo: { n: recentes + 1, desde: recentes ? erros.desde : new Date().toISOString() } });
      return { ok: false, motivo: 'invalido' };
    }
    const userId = rows[0].user_id;
    // A conta tinha outro número? Solta. (Trocou de celular: o vínculo anda junto.)
    await c.query(`UPDATE whatsapp_contatos SET user_id = NULL, vinculado_em = NULL, updated_at = NOW() WHERE user_id = $1 AND id <> $2`, [userId, contato.id]);
    await c.query(`UPDATE whatsapp_contatos SET user_id = $2, vinculado_em = NOW(), opt_out_em = NULL, updated_at = NOW() WHERE id = $1`, [contato.id, userId]);
    await c.query('COMMIT');
    contato.user_id = userId; contato.vinculado_em = new Date();
    await atualizarEstado(contato, { erros_codigo: null, instrucao_em: null });
    return { ok: true, userId };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally { c.release(); }
}

// ─── Atendimento humano ───────────────────────────────────────────────────

/** Cala a Luna e põe a conversa na fila do painel. */
export async function chamarEquipe(contato, fila) {
  const { rows: [novo] } = await getPool().query(
    `UPDATE whatsapp_contatos SET atendimento = 'humano', fila = $2, aguardando_equipe = TRUE,
            atendimento_desde = CASE WHEN atendimento = 'humano' THEN atendimento_desde ELSE NOW() END, updated_at = NOW()
      WHERE id = $1 RETURNING *`, [contato.id, fila]);
  Object.assign(contato, novo);
  return contato;
}

/** Devolve a conversa pra Luna. */
export async function devolverPraLuna(contato) {
  const { rows: [novo] } = await getPool().query(
    `UPDATE whatsapp_contatos SET atendimento = 'luna', fila = NULL, atendente_id = NULL, aguardando_equipe = FALSE, atendimento_desde = NULL, updated_at = NOW()
      WHERE id = $1 RETURNING *`, [contato.id]);
  Object.assign(contato, novo);
  return contato;
}
