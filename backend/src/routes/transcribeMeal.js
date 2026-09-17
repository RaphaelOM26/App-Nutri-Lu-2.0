// POST /transcribe-meal
// Body: { audio: base64, format?: 'm4a' | 'mp3' | 'wav' | 'mp4' }
// Fluxo:
//   1) Whisper transcreve o áudio em texto (PT-BR forçado)
//   2) GPT estrutura a transcrição em items + macros + mealType
// Resposta: { transcript, items, total, mealType, confidence }
//
// As duas chamadas à IA moram em services/refeicaoIA.js, que o bot de
// WhatsApp também usa.

import { Router } from 'express';
import { teto, TETOS } from '../services/limites.js';
import { requirePremium } from '../services/billing.js';
import { transcrever, estruturarRefeicaoFalada } from '../services/refeicaoIA.js';

const router = Router();

router.post('/', requirePremium, teto('voz', TETOS.voz.limites, TETOS.voz.env), async (req, res, next) => {
  try {
    const { audio, format } = req.body || {};

    if (!audio) {
      return res.status(400).json({
        error: 'Body deve conter { audio: base64 }.',
        code: 'BAD_REQUEST',
      });
    }

    // Aceita base64 puro OU prefixo "data:audio/...;base64,"
    const base64Data = audio.includes(',') ? audio.split(',')[1] : audio;
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length < 500) {
      return res.status(400).json({
        error: 'Áudio muito curto ou inválido.',
        code: 'AUDIO_TOO_SHORT',
      });
    }

    // Whisper aceita: mp3, mp4, mpeg, mpga, m4a, wav, webm, oga, flac, ogg.
    const transcript = await transcrever(buffer, format || 'm4a');

    if (!transcript) {
      return res.status(422).json({
        error: 'Não consegui entender o áudio. Tente falar mais perto do microfone.',
        code: 'TRANSCRIPTION_EMPTY',
      });
    }

    const parsed = await estruturarRefeicaoFalada(transcript);
    res.json({ transcript, ...parsed });
  } catch (err) {
    next(err);
  }
});

export default router;
