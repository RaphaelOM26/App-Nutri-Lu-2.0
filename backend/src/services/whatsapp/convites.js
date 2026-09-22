// Boas-vindas pelo WhatsApp a partir da COMPRA (decidido com o Raphael em
// 17/09/2026): a Hotmart manda o telefone do checkout; a compradora recebe um
// modelo aprovado ("Começar") e, ao tocar no botão, o número fica ligado à
// conta do e-mail da compra e a Luna faz o onboarding.
//
// ESTA FUNÇÃO É DESLIGÁVEL E REMOVÍVEL DE PROPÓSITO. Tudo dela mora neste
// arquivo; os únicos pontos de contato com o resto são:
//   1. routes/billing.js   → convidarCompradora() quando a compra é aprovada
//   2. services/whatsapp/bot.js → aceitarConvite() quando um número sem conta toca no botão
//   3. index.js / worker.js → registrarExecutor('convite', …)
// WHATSAPP_BOAS_VINDAS=1 liga. Sem a variável nada acontece: é assim que se
// troca isto por uma ferramenta externa no futuro, sem deploy. O vínculo por
// código (Perfil → Vincular WhatsApp) não depende de nada daqui.
//
// O que NÃO se faz: vincular pelo telefone do checkout. Ele pode estar
// errado, ser de quem pagou ou de quem deu de presente. O vínculo só nasce do
// toque no botão, vindo do número que recebeu o convite.
//
// Custo e limite (10 mil pacientes): um modelo de utilidade por compra
// (~R$ 0,05 → ~R$ 500 no total) e cada convite conta no limite diário do
// portfólio (250/dia sem verificação do negócio, 2 mil com). Estourou o
// limite? O convite volta pra fila e tenta de hora em hora, por até 3 dias.

import { getPool } from '../../db.js';
import { enviar, templateAprovado, mascarar } from './api.js';
import { enfileirar } from './fila.js';
import { primeiroNome } from '../../utils/nomes.js';

export const MODELO_BOAS_VINDAS = 'boas_vindas';
export const boasVindasLigadas = () => process.env.WHATSAPP_BOAS_VINDAS === '1';

/**
 * Telefone do checkout → formato da Meta (55 + DDD + número), só Brasil.
 * A Hotmart manda o DDD em `checkout_phone_code` e o número em
 * `checkout_phone`, mas há contas em que vem tudo junto, com ou sem o 55.
 * Não mexe no nono dígito: a Meta resolve e devolve o wa_id canônico no envio.
 */
export function telefoneBR(ddd, numero) {
  let d = `${String(ddd || '').replace(/\D/g, '')}${String(numero || '').replace(/\D/g, '')}`.replace(/^0+/, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  // DDD (2) + 8 ou 9 dígitos. Fora disso não é um celular brasileiro que dê pra confiar.
  if (!/^[1-9]\d(9?\d{8})$/.test(d)) return null;
  return `55${d}`;
}

/** routes/billing.js → aqui. Nunca lança, nunca segura a resposta pra Hotmart. */
export function convidarCompradora({ purchaseId, email, nome, ddd, telefone }) {
  if (!boasVindasLigadas() || !purchaseId || !email) return;
  (async () => {
    const tel = telefoneBR(ddd, telefone);
    const { rows } = await getPool().query(
      `INSERT INTO whatsapp_convites (purchase_id, email, nome, telefone, status, motivo)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (purchase_id) DO NOTHING RETURNING id`,
      [purchaseId, String(email).trim().toLowerCase(), nome ? String(nome).slice(0, 80) : null, tel || '', tel ? 'pendente' : 'ignorado', tel ? null : 'telefone ausente ou fora do padrão brasileiro']);
    if (rows[0] && tel) await enfileirar('convite', tel, { conviteId: rows[0].id });
  })().catch((e) => console.warn('[whatsapp:convite] não registrei o convite:', e.message));
}

// Códigos da Meta que significam "agora não dá, tente depois": limite de
// vazão, limite diário do portfólio, ritmo por par de números.
const TENTE_DEPOIS = new Set([130429, 131048, 131056, 80007]);
const MAX_ADIAMENTOS = 72; // de hora em hora → 3 dias

/** Executor do tipo 'convite'. */
export async function executarConvite({ conviteId, adiamentos = 0 }) {
  const pool = getPool();
  const { rows: [c] } = await pool.query(`SELECT * FROM whatsapp_convites WHERE id = $1 AND status = 'pendente'`, [conviteId]);
  if (!c) return;
  const encerrar = (status, motivo) => pool.query(`UPDATE whatsapp_convites SET status = $2, motivo = $3 WHERE id = $1`, [c.id, status, motivo]);

  if (!boasVindasLigadas()) return encerrar('ignorado', 'função desligada');
  if (!templateAprovado(MODELO_BOAS_VINDAS)) return encerrar('ignorado', 'modelo boas_vindas não está em WHATSAPP_TEMPLATES');
  // Compra que caiu (reembolso em minutos) ou paciente que já se vinculou pelo código: não incomoda.
  const { rows: [situacao] } = await pool.query(
    `SELECT p.status AS compra,
            EXISTS (SELECT 1 FROM users u JOIN whatsapp_contatos w ON w.user_id = u.id WHERE u.email = $2) AS ja_vinculada,
            (SELECT opt_out_em FROM whatsapp_contatos WHERE wa_id = $3) AS opt_out
       FROM purchases p WHERE p.id = $1`, [c.purchase_id, c.email, c.telefone]);
  if (situacao?.compra !== 'ativa') return encerrar('ignorado', 'compra não está mais ativa');
  if (situacao.ja_vinculada) return encerrar('ignorado', 'a conta já tem WhatsApp vinculado');
  if (situacao.opt_out) return encerrar('ignorado', 'este número pediu pra não receber avisos');

  // O nome da compra tratado (primeiro nome, "MARIA" → "Maria"). É o único
  // que existe neste ponto: ela ainda não respondeu como prefere ser chamada.
  const primeiro = primeiroNome(c.nome) || 'tudo bem';
  let r;
  try {
    r = await enviar(c.telefone, { type: 'template', template: { name: MODELO_BOAS_VINDAS, language: { code: 'pt_BR' }, components: [{ type: 'body', parameters: [{ type: 'text', text: primeiro.slice(0, 60) }] }] } });
  } catch (e) {
    if (TENTE_DEPOIS.has(Number(e.codigoMeta)) && adiamentos < MAX_ADIAMENTOS) {
      console.warn(`[whatsapp:convite] limite da Meta (${e.codigoMeta}); ${mascarar(c.telefone)} volta pra fila em 1 h`);
      await enfileirar('convite', c.telefone, { conviteId: c.id, adiamentos: adiamentos + 1 }, { emSegundos: 3600 });
      return;
    }
    throw e; // a fila tenta de novo; se desistir, marcarConviteFalho() registra
  }

  // O contato nasce com o wa_id que a META devolveu: é com ele que a resposta chega.
  const { rows: [contato] } = await pool.query(
    `INSERT INTO whatsapp_contatos (wa_id, nome_perfil, ultimo_aviso_em) VALUES ($1, $2, NOW())
     ON CONFLICT (wa_id) DO UPDATE SET ultimo_aviso_em = NOW(), updated_at = NOW() RETURNING id`, [r.waId, c.nome]);
  await pool.query(
    `INSERT INTO whatsapp_mensagens (contato_id, direcao, wa_message_id, tipo, texto, autor, status) VALUES ($1, 'out', $2, 'template', $3, 'sistema', $4)`,
    [contato.id, r.id, `[modelo ${MODELO_BOAS_VINDAS}]`, r.simulada ? 'simulada' : 'enviada']);
  await pool.query(`UPDATE whatsapp_convites SET status = 'enviado', wa_id = $2, enviado_em = NOW(), motivo = NULL WHERE id = $1`, [c.id, r.waId]);
}

/** `aoFalhar` da fila: as tentativas acabaram. */
export async function marcarConviteFalho({ conviteId }, erro) {
  await getPool().query(`UPDATE whatsapp_convites SET status = 'falhou', motivo = $2 WHERE id = $1 AND status = 'pendente'`, [conviteId, String(erro?.message || 'erro').slice(0, 300)]);
}

/**
 * Um número SEM conta tocou no botão de um modelo (ou escreveu "começar").
 * Se existe convite enviado pra ele, liga o número à conta do e-mail da
 * compra — criando a conta se a pessoa ainda não entrou na área de membros
 * (é a mesma linha que o login por e-mail vai achar depois).
 *
 * @returns {Promise<null | { userId: string, email: string, nome: string | null, cadastroFeito: boolean }>}
 */
export async function aceitarConvite(contato) {
  if (!boasVindasLigadas() || contato.user_id) return null;
  const c = await getPool().connect();
  try {
    await c.query('BEGIN');
    const { rows: [conv] } = await c.query(
      `SELECT v.id, v.email, v.nome FROM whatsapp_convites v JOIN purchases p ON p.id = v.purchase_id
        WHERE v.wa_id = $1 AND v.status = 'enviado' AND v.enviado_em > NOW() - interval '30 days' AND p.status = 'ativa'
        ORDER BY v.enviado_em DESC LIMIT 1 FOR UPDATE OF v`, [contato.wa_id]);
    if (!conv) { await c.query('ROLLBACK'); return null; }

    let { rows: [u] } = await c.query(
      `SELECT id, role FROM users WHERE email = $1 ORDER BY (provider = 'email') DESC, created_at LIMIT 1`, [conv.email]);
    if (!u) {
      ({ rows: [u] } = await c.query(
        `INSERT INTO users (provider, provider_sub, display_name, email) VALUES ('email', $1, $2, $1)
         ON CONFLICT (provider, provider_sub) DO UPDATE SET email = EXCLUDED.email RETURNING id, role`,
        [conv.email, String(conv.nome || '').trim().slice(0, 40)]));
    }
    // Gente da equipe não vira paciente por convite; e conta que JÁ tem outro
    // número não troca de número por um toque (isso é o caminho do código).
    const { rows: [outro] } = await c.query(`SELECT 1 FROM whatsapp_contatos WHERE user_id = $1`, [u.id]);
    if (u.role !== 'cliente' || outro) {
      await c.query(`UPDATE whatsapp_convites SET status = 'ignorado', motivo = $2 WHERE id = $1`, [conv.id, outro ? 'a conta já tem outro número vinculado' : 'e-mail de pessoa da equipe']);
      await c.query('COMMIT');
      return null;
    }
    await c.query(`UPDATE whatsapp_contatos SET user_id = $2, vinculado_em = NOW(), opt_out_em = NULL, updated_at = NOW() WHERE id = $1`, [contato.id, u.id]);
    await c.query(`UPDATE whatsapp_convites SET status = 'aceito', aceito_em = NOW() WHERE id = $1`, [conv.id]);
    const { rows: [perfil] } = await c.query(`SELECT data ? 'onboarding_em' AS feito FROM client_profiles WHERE user_id = $1`, [u.id]);
    await c.query('COMMIT');
    contato.user_id = u.id; contato.vinculado_em = new Date();
    return { userId: u.id, email: conv.email, nome: conv.nome, cadastroFeito: perfil?.feito === true };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally { c.release(); }
}

/** ma•••@gmail.com: o bastante pra ELA reconhecer, pouco pra um número errado aprender. */
export function emailMascarado(email) {
  const [local, dominio] = String(email || '').split('@');
  if (!dominio) return '';
  return `${local.slice(0, 2)}${'•'.repeat(Math.max(3, Math.min(6, local.length - 2)))}@${dominio}`;
}
