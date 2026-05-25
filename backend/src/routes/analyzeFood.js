// POST /analyze-food
// Body: { image: string } — base64 da foto do prato
// Resposta: { items[], total, confidence }
//
// Usado pela tela "Foto IA" do app (Cal AI parity): usuário fotografa o prato
// e a IA estima macros de cada item identificado.

import { Router } from 'express';
import { openai, MODEL, FOOD_ANALYSIS_SCHEMA, FOOD_SYSTEM_PROMPT } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res, next) => {
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

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: FOOD_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identifique os alimentos neste prato e estime os macros conforme o schema.',
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: FOOD_ANALYSIS_SCHEMA,
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw Object.assign(new Error('Resposta vazia da IA.'), {
        status: 502,
        code: 'AI_EMPTY_RESPONSE',
      });
    }
    res.json(JSON.parse(content));
  } catch (err) {
    next(err);
  }
});

export default router;
