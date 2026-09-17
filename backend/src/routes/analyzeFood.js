// POST /analyze-food
// Body: { image: string } — base64 da foto do prato
// Resposta: { items[], total, confidence }
//
// Usado pela tela "Foto IA" do app (Cal AI parity): usuário fotografa o prato
// e a IA estima macros de cada item identificado. A chamada à IA mora em
// services/refeicaoIA.js, que o bot de WhatsApp também usa.

import { Router } from 'express';
import { teto, TETOS } from '../services/limites.js';
import { requirePremium } from '../services/billing.js';
import { analisarPrato } from '../services/refeicaoIA.js';

const router = Router();

router.post('/', requirePremium, teto('foto-ia', TETOS['foto-ia'].limites, TETOS['foto-ia'].env), async (req, res, next) => {
  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({
        error: 'Body deve conter { image } em base64.',
        code: 'BAD_REQUEST',
      });
    }

    const dataUrl = image.startsWith('data:')
      ? image
      : `data:image/jpeg;base64,${image}`;

    const imgBytes = Math.round((image.length * 3) / 4);
    console.log(`[analyze-food] received image: ${(imgBytes / 1024).toFixed(0)}KB, prefix="${image.slice(0, 20)}..."`);

    const parsed = await analisarPrato(dataUrl);
    console.log(`[analyze-food] AI returned: items=${parsed.items?.length ?? 0}, confidence=${parsed.confidence}`);
    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

export default router;
