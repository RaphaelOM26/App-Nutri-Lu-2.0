// Webhook do WhatsApp (Cloud API da Meta).
//
//   GET  /whatsapp/webhook   a Meta confere que a URL é nossa (uma vez, ao cadastrar)
//   POST /whatsapp/webhook   mensagens recebidas e status de entrega
//
// O POST faz o MÍNIMO e responde 200: confere a assinatura, grava a mensagem
// e enfileira o trabalho. Nada de IA nem de chamada à Meta aqui dentro — ver
// services/whatsapp/fila.js pro porquê. A Meta reenvia por até 7 dias o que
// não receber 200: se o banco estiver fora a gente responde 500 de propósito,
// e o id único da mensagem garante que o reenvio não registra em dobro.

import { Router } from 'express';
import { getPool } from '../db.js';
import { assinaturaValida } from '../services/whatsapp/api.js';
import { registrarEntrada } from '../services/whatsapp/contatos.js';

const router = Router();

router.get('/webhook', (req, res) => {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === token) {
    return res.status(200).type('text/plain').send(String(req.query['hub.challenge'] || ''));
  }
  res.sendStatus(403);
});

// Sem a chave secreta do app não dá pra saber se o POST veio da Meta. Em
// produção isso é recusa; só o servidor local de desenvolvimento aceita sem
// assinatura (é por onde passam as mensagens simuladas dos testes).
function origemConfiavel(req) {
  if (process.env.WHATSAPP_APP_SECRET) return assinaturaValida(req.rawBody, req.get('x-hub-signature-256'));
  return process.env.ALLOW_DEV_LOGIN === '1';
}

// status da Meta → o nosso. A ordem importa: "lida" não volta pra "entregue".
const ORDEM = { enviada: 1, entregue: 2, lida: 3, falhou: 4 };
const STATUS = { sent: 'enviada', delivered: 'entregue', read: 'lida', failed: 'falhou' };

router.post('/webhook', async (req, res) => {
  if (!origemConfiavel(req)) return res.sendStatus(process.env.WHATSAPP_APP_SECRET ? 401 : 503);
  const corpo = req.body;
  if (corpo?.object !== 'whatsapp_business_account') return res.sendStatus(200);

  try {
    for (const entry of corpo.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const v = change.value || {};
        // Outro número do mesmo portfólio (o de venda, no futuro) não é deste bot.
        if (process.env.WHATSAPP_PHONE_ID && v.metadata?.phone_number_id && v.metadata.phone_number_id !== process.env.WHATSAPP_PHONE_ID) continue;

        const nomes = new Map((v.contacts || []).map((c) => [c.wa_id, c.profile?.name]));
        for (const msg of v.messages || []) {
          if (!msg?.id || !msg.from) continue;
          // Grava a mensagem e cria o trabalho numa transação só. Repetida da
          // Meta (mesmo id) não vira trabalho de novo.
          await registrarEntrada({ waId: msg.from, nome: nomes.get(msg.from), msg });
        }
        for (const s of v.statuses || []) {
          const novo = STATUS[s.status];
          if (!novo || !s.id) continue;
          const erro = s.errors?.[0] ? `${s.errors[0].code}: ${s.errors[0].title || s.errors[0].message || ''}`.slice(0, 300) : null;
          if (erro) console.warn(`[whatsapp] entrega falhou: ${erro}`);
          await getPool().query(
            `UPDATE whatsapp_mensagens SET status = $2::text, erro = COALESCE($3::text, erro)
              WHERE wa_message_id = $1 AND direcao = 'out'
                AND COALESCE(($4::jsonb ->> status)::int, 0) < ($4::jsonb ->> $2::text)::int`,
            [s.id, novo, erro, JSON.stringify(ORDEM)]);
        }
      }
    }
  } catch (e) {
    // Não deu nem pra gravar (banco fora): 500 faz a Meta tentar de novo.
    console.error('[whatsapp] webhook falhou:', e.message);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});

export default router;
