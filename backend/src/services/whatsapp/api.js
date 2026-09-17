// Cliente da Cloud API do WhatsApp (Meta), direto, sem BSP no meio.
//
// Variáveis (Railway — o Raphael cola lá, NUNCA pelo chat nem no repositório):
//   WHATSAPP_TOKEN          token permanente do usuário do sistema
//   WHATSAPP_PHONE_ID       Phone Number ID (o id do número, não o número)
//   WHATSAPP_WABA_ID        id da conta do WhatsApp Business (só informativo)
//   WHATSAPP_APP_SECRET     chave secreta do app: valida a assinatura do webhook
//   WHATSAPP_VERIFY_TOKEN   texto que a gente inventa e cola na tela do webhook
//   WHATSAPP_NUMERO         o número público do bot, só dígitos (5521…): vira o link wa.me
//   WHATSAPP_TEMPLATES      modelos JÁ APROVADOS na Meta, separados por vírgula
//   WHATSAPP_API_VERSION    padrão v25.0
//
// MODO SIMULADO: sem WHATSAPP_TOKEN/PHONE_ID nada sai pra Meta; o envio vira
// uma linha no log e o chamador grava a mensagem com status 'simulada'. É o que
// deixa o bot inteiro testável antes de o número existir.

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = () => `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v25.0'}`;

export const whatsappConfigurado = () => Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
export const numeroDoBot = () => String(process.env.WHATSAPP_NUMERO || '').replace(/\D/g, '') || null;

/** Modelos que a Meta já aprovou. Modelo fora desta lista não é nem tentado. */
export function templateAprovado(nome) {
  return String(process.env.WHATSAPP_TEMPLATES || '').split(',').map((s) => s.trim()).filter(Boolean).includes(nome);
}

async function chamar(metodo, url, corpo) {
  const res = await fetch(url, {
    method: metodo,
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, ...(corpo ? { 'Content-Type': 'application/json' } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const texto = await res.text();
  let dados; try { dados = JSON.parse(texto); } catch { dados = {}; }
  if (!res.ok) {
    const e = dados?.error || {};
    // A mensagem da Meta vai pro LOG, nunca pra cliente. `codigoMeta` deixa o
    // chamador distinguir "fora da janela de 24 h" (131047) de erro de verdade.
    throw Object.assign(new Error(`Meta ${res.status}: ${e.message || texto.slice(0, 200)}`), { codigoMeta: e.code, status: 502 });
  }
  return dados;
}

/**
 * Manda uma mensagem. `conteudo` é o pedaço específico do tipo:
 *   { type: 'text', text: { body } } · { type: 'interactive', interactive } ·
 *   { type: 'template', template } · { type: 'document', document }
 * @returns {Promise<{ id: string, simulada: boolean, waId: string }>}
 */
export async function enviar(para, conteudo) {
  if (!whatsappConfigurado()) {
    const resumo = conteudo.text?.body || conteudo.interactive?.body?.text || conteudo.template?.name || conteudo.type;
    console.log(`[whatsapp:simulado] → ${mascarar(para)} (${conteudo.type}) ${String(resumo).replace(/\s+/g, ' ').slice(0, 140)}`);
    return { id: `sim.${crypto.randomUUID()}`, simulada: true, waId: para };
  }
  const r = await chamar('POST', `${base()}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    messaging_product: 'whatsapp', recipient_type: 'individual', to: para, ...conteudo,
  });
  // `waId` é o identificador CANÔNICO que a Meta resolveu pra aquele número
  // (no Brasil pode vir sem o nono dígito). É com ele que a resposta da pessoa
  // vai chegar no webhook, então é ele que se guarda.
  return { id: r?.messages?.[0]?.id || null, simulada: false, waId: r?.contacts?.[0]?.wa_id || para };
}

/** "Lida" + "digitando…" enquanto a IA pensa (a foto leva ~8 s). Nunca falha o fluxo. */
export async function marcarLida(waMessageId, digitando = false) {
  if (!whatsappConfigurado() || !waMessageId || waMessageId.startsWith('sim.')) return;
  await chamar('POST', `${base()}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    messaging_product: 'whatsapp', status: 'read', message_id: waMessageId,
    ...(digitando ? { typing_indicator: { type: 'text' } } : {}),
  }).catch((e) => console.warn('[whatsapp] marcar lida falhou:', e.message));
}

const MIDIA_MAX = 16 * 1024 * 1024;
const PASTA_SIMULADA = fileURLToPath(new URL('../../../scripts/food-test', import.meta.url));

/**
 * Baixa a mídia de uma mensagem recebida. Duas idas: o id vira uma URL (que
 * expira em 5 min) e a URL só abre com o token. Por isso a foto é baixada e
 * guardada no R2 assim que o trabalho sai da fila, não "quando precisar".
 *
 * Simulado: id `sim:<arquivo>` lê de scripts/food-test (só sem token, só em dev).
 */
export async function baixarMidia(mediaId) {
  if (!whatsappConfigurado()) {
    if (process.env.ALLOW_DEV_LOGIN === '1' && String(mediaId).startsWith('sim:')) {
      const nome = path.basename(String(mediaId).slice(4));
      const buffer = await fs.readFile(path.join(PASTA_SIMULADA, nome));
      const mime = /\.png$/i.test(nome) ? 'image/png' : /\.(ogg|oga)$/i.test(nome) ? 'audio/ogg' : /\.mp3$/i.test(nome) ? 'audio/mpeg' : /\.m4a$/i.test(nome) ? 'audio/mp4' : 'image/jpeg';
      return { buffer, mime };
    }
    throw new Error('WhatsApp não configurado: não há de onde baixar a mídia');
  }
  const meta = await chamar('GET', `${base()}/${encodeURIComponent(mediaId)}`);
  if (meta.file_size && Number(meta.file_size) > MIDIA_MAX) throw Object.assign(new Error('Arquivo grande demais'), { code: 'MIDIA_GRANDE' });
  const res = await fetch(meta.url, { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Meta ${res.status} ao baixar mídia`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MIDIA_MAX) throw Object.assign(new Error('Arquivo grande demais'), { code: 'MIDIA_GRANDE' });
  return { buffer, mime: String(meta.mime_type || '').split(';')[0].trim().toLowerCase() };
}

/**
 * Confere a assinatura do webhook: HMAC-SHA256 do corpo CRU com a chave
 * secreta do app, no cabeçalho X-Hub-Signature-256. Sem isto qualquer pessoa
 * com a URL registraria refeição no diário de qualquer paciente.
 */
export function assinaturaValida(corpoCru, cabecalho) {
  const segredo = process.env.WHATSAPP_APP_SECRET;
  if (!segredo || !corpoCru || typeof cabecalho !== 'string' || !cabecalho.startsWith('sha256=')) return false;
  const esperado = crypto.createHmac('sha256', segredo).update(corpoCru).digest('hex');
  const recebido = cabecalho.slice(7);
  if (recebido.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(recebido, 'utf8'), Buffer.from(esperado, 'utf8'));
}

/** +55 21 9••••-1234: o suficiente pra reconhecer, sem expor o número em tela e log. */
export function mascarar(waId) {
  const d = String(waId || '').replace(/\D/g, '');
  if (d.length < 8) return '••••';
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ••••-${d.slice(-4)}`;
}
