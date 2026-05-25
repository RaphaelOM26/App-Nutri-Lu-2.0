// POST /extract-recipe
// Body: { source: 'image' | 'url' | 'video', data: string }
//   - 'image' → data é base64 (com ou sem prefixo data:image/...)
//   - 'url'   → data é uma URL pública (Instagram, blog, etc.) — extrai do HTML/caption
//   - 'video' → 501 Not Implemented (em breve no MVP)
//
// Resposta: { title, ingredients[], steps[], time, servings, confidence }

import { Router } from 'express';
import { openai, MODEL, RECIPE_SCHEMA, RECIPE_SYSTEM_PROMPT } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { source, data } = req.body || {};

    if (!source || !data) {
      return res.status(400).json({
        error: 'Body deve conter { source, data }.',
        code: 'BAD_REQUEST',
      });
    }

    if (source === 'video') {
      return res.status(501).json({
        error: 'Extração de receita por vídeo ainda não está disponível.',
        code: 'NOT_IMPLEMENTED',
        hint: 'Tente colar o link do vídeo (Instagram/TikTok/YouTube) — vamos extrair da descrição.',
      });
    }

    let recipe;
    if (source === 'image') {
      recipe = await extractFromImage(data);
    } else if (source === 'url') {
      recipe = await extractFromUrl(data);
    } else {
      return res.status(400).json({
        error: `source inválido: "${source}". Use "image", "url" ou "video".`,
        code: 'BAD_REQUEST',
      });
    }

    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

// ─── Extração via imagem (foto de receita) ───────────────────────
async function extractFromImage(base64) {
  // Aceita base64 puro ou com prefixo data:image/...
  const dataUrl = base64.startsWith('data:')
    ? base64
    : `data:image/jpeg;base64,${base64}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: RECIPE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extraia a receita desta imagem e retorne o JSON estruturado.',
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
      json_schema: RECIPE_SCHEMA,
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw Object.assign(new Error('Resposta vazia da IA.'), {
      status: 502,
      code: 'AI_EMPTY_RESPONSE',
    });
  }
  return JSON.parse(content);
}

// ─── Extração via URL (link de receita) ───────────────────────────
async function extractFromUrl(url) {
  // Estratégia simples no MVP: pegamos o HTML da página e mandamos
  // o conteúdo textual relevante pro modelo. Sem scraping específico
  // por site, a IA é boa em extrair de qualquer estrutura.
  let pageText;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    });
    if (!response.ok) {
      throw Object.assign(
        new Error(`Falha ao acessar URL (status ${response.status}).`),
        { status: 422, code: 'URL_FETCH_FAILED' }
      );
    }
    const html = await response.text();
    // Strip tags simples — a IA lida bem com texto cru misturado
    pageText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50000); // limita pra não estourar contexto
  } catch (err) {
    if (err.code === 'URL_FETCH_FAILED') throw err;
    throw Object.assign(
      new Error('Não foi possível acessar essa URL.'),
      { status: 422, code: 'URL_FETCH_FAILED' }
    );
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: RECIPE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extraia a receita do conteúdo abaixo (página web). Se a página tem várias receitas, extraia a principal.\n\nURL: ${url}\n\nConteúdo:\n${pageText}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: RECIPE_SCHEMA,
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw Object.assign(new Error('Resposta vazia da IA.'), {
      status: 502,
      code: 'AI_EMPTY_RESPONSE',
    });
  }
  return JSON.parse(content);
}

export default router;
