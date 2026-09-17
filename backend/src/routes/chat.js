// POST /chat — conversa com a Luna pela web.
// Recebe histórico de mensagens + contexto do usuário (perfil, macros, refeições)
// e retorna a próxima mensagem. Chat sem estado: o histórico vem do navegador.
//
// A persona, o prompt, o formato da resposta e a regra dura de saúde moram em
// services/luna.js — o bot de WhatsApp usa a mesma função.

import express from 'express';
import { teto, TETOS } from '../services/limites.js';
import { requirePremium } from '../services/billing.js';
import { responderLuna } from '../services/luna.js';

const router = express.Router();

router.post('/', requirePremium, teto('chat-lu', TETOS['chat-lu'].limites, TETOS['chat-lu'].env), async (req, res, next) => {
  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Faltam mensagens', code: 'BAD_REQUEST' });
    }
    const { reply, receitas, encaminhar } = await responderLuna({ messages, context, canal: 'web' });
    res.json({ reply, receitas, encaminhar });
  } catch (err) {
    next(err);
  }
});

export default router;
