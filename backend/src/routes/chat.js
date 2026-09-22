// POST /chat — conversa com a Luna pela web.
// Recebe histórico de mensagens + contexto do usuário (perfil, macros, refeições)
// e retorna a próxima mensagem. Chat sem estado: o histórico vem do navegador.
//
// A persona, o prompt, o formato da resposta e a regra dura de saúde moram em
// services/luna.js — o bot de WhatsApp usa a mesma função.

import express from 'express';
import { getPool } from '../db.js';
import { teto, TETOS } from '../services/limites.js';
import { optionalAuth } from '../services/auth.js';
import { requirePremium } from '../services/billing.js';
import { responderLuna } from '../services/luna.js';
import { nomeDe } from '../utils/nomes.js';

const router = express.Router();

// `optionalAuth` ANTES do `requirePremium`: com ENFORCE_PREMIUM desligado (a
// produção de hoje) o requirePremium passa direto sem autenticar, `req.user`
// não existiria e o nome cairia no que o navegador mandou. Lendo o token aqui,
// o nome sai do banco em qualquer configuração.
router.post('/', optionalAuth, requirePremium, teto('chat-lu', TETOS['chat-lu'].limites, TETOS['chat-lu'].env), async (req, res, next) => {
  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Faltam mensagens', code: 'BAD_REQUEST' });
    }
    // O nome sai do BANCO, não do que o navegador mandou: é o apelido que ela
    // confirmou (ou o nome da compra), o mesmo que o WhatsApp usa. Só sem token
    // nenhum (dev) é que segue o que veio no payload.
    let ctx = context;
    if (context && req.user?.userId) {
      const { rows: [u] } = await getPool().query(`SELECT apelido, display_name FROM users WHERE id = $1`, [req.user.userId]);
      ctx = { ...context, profile: { ...(context.profile || {}), name: nomeDe(u) || undefined } };
    }
    const { reply, receitas, encaminhar } = await responderLuna({ messages, context: ctx, canal: 'web' });
    res.json({ reply, receitas, encaminhar });
  } catch (err) {
    next(err);
  }
});

export default router;
