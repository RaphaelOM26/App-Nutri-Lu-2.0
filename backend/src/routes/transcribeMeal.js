// POST /transcribe-meal
// Body: { audio: base64, format?: 'm4a' | 'mp3' | 'wav' | 'mp4' }
// Fluxo:
//   1) Whisper transcreve o áudio em texto (PT-BR forçado)
//   2) GPT estrutura a transcrição em items + macros + mealType
// Resposta: { transcript, items, total, mealType, confidence }

import { Router } from 'express';
import { openai, MODEL, MEAL_VOICE_SCHEMA, MEAL_VOICE_PROMPT } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res, next) => {
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

    // Extensão baseada no format declarado. Whisper aceita: mp3, mp4, mpeg,
    // mpga, m4a, wav, webm, oga, flac, ogg.
    const ext = (format || 'm4a').toLowerCase();
    const mimeMap = {
      m4a: 'audio/m4a',
      mp3: 'audio/mpeg',
      mp4: 'audio/mp4',
      wav: 'audio/wav',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
    };
    const mime = mimeMap[ext] || 'audio/m4a';

    // ─── 1) Whisper transcreve ──────────────────────────────────
    // OpenAI SDK aceita File-like — usamos toFile do helper.
    const { toFile } = await import('openai/uploads');
    const audioFile = await toFile(buffer, `audio.${ext}`, { type: mime });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt',
      // prompt curto guia o vocabulário de domínio
      prompt: 'Transcrição de uma pessoa relatando o que comeu numa refeição. Vocabulário comum: arroz, feijão, frango, ovo, salada, banana, café, leite, pão, tapioca, batata, brócolis, salmão, atum, aveia, granola.',
    });

    const transcript = (transcription.text || '').trim();

    if (!transcript) {
      return res.status(422).json({
        error: 'Não consegui entender o áudio. Tente falar mais perto do microfone.',
        code: 'TRANSCRIPTION_EMPTY',
      });
    }

    // ─── 2) GPT estrutura a refeição ────────────────────────────
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: MEAL_VOICE_PROMPT },
        {
          role: 'user',
          content: `Transcrição do que o usuário disse:\n\n"${transcript}"\n\nEstruture em items de refeição com macros estimados.`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: MEAL_VOICE_SCHEMA,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw Object.assign(new Error('Resposta vazia da IA.'), {
        status: 502,
        code: 'AI_EMPTY_RESPONSE',
      });
    }

    const parsed = JSON.parse(content);
    res.json({ transcript, ...parsed });
  } catch (err) {
    next(err);
  }
});

export default router;
