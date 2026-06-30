// POST /generate-recipe-image
// Body: { title: string, imageQuery?: string, ingredients?: string[] }
// Resposta: { image: string }  — data URL (data:image/jpeg;base64,...)
//
// Gera uma foto de "food photography" da receita via API de imagens da OpenAI.
// Usado pela RecipeDetail quando o usuário escolhe "Gerar com a Lu (IA)".
// Cada chamada (inclusive "gerar novamente") é uma geração paga na OpenAI.
//
// Modelo e qualidade são configuráveis por env pra não travar numa versão:
//   OPENAI_IMAGE_MODEL   (default 'gpt-image-1')
//   OPENAI_IMAGE_QUALITY (default 'medium' — low|medium|high)
// Pedimos JPEG comprimido pra manter o base64 pequeno (vai pro AsyncStorage
// do app — imagem grande infla o storage local).

import { Router } from 'express';
import { openai } from '../services/openai.js';

const router = Router();

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium';

// Monta o prompt de food photography. Em inglês porque modelos de imagem
// respondem melhor — mesma lógica do imageQuery (que já é em inglês).
function buildPrompt({ title, imageQuery, ingredients }) {
  const subject = imageQuery?.trim() || title?.trim() || 'a plated dish';
  const ingredientHint =
    Array.isArray(ingredients) && ingredients.length
      ? ` Key ingredients: ${ingredients.slice(0, 6).join(', ')}.`
      : '';
  return (
    `Professional food photography of "${title}". ${subject}.` +
    ingredientHint +
    ' Rustic homemade plating on a neutral background, natural soft light,' +
    ' appetizing, shallow depth of field, 45-degree angle. Realistic photo,' +
    ' no text, no watermark, no hands, no cutlery brand.'
  );
}

router.post('/', async (req, res, next) => {
  try {
    const { title, imageQuery, ingredients } = req.body || {};
    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        error: 'Body deve conter { title } da receita.',
        code: 'BAD_REQUEST',
      });
    }

    const prompt = buildPrompt({ title, imageQuery, ingredients });
    console.log(`[generate-recipe-image] gerando "${title}" (model=${IMAGE_MODEL}, q=${IMAGE_QUALITY})`);

    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: '1024x1024',
      quality: IMAGE_QUALITY,
      output_format: 'jpeg',
      output_compression: 80,
      n: 1,
    });

    const first = result?.data?.[0];
    // gpt-image-1 devolve b64_json; alguns modelos (dall-e-3) podem devolver url.
    let dataUrl;
    if (first?.b64_json) {
      dataUrl = `data:image/jpeg;base64,${first.b64_json}`;
    } else if (first?.url) {
      // Baixa e converte pra base64 — a URL da OpenAI expira em ~1h, então o
      // app precisa do conteúdo pra persistir.
      const imgRes = await fetch(first.url);
      if (!imgRes.ok) throw Object.assign(new Error('Falha ao baixar imagem gerada.'), { status: 502, code: 'IMAGE_FETCH_FAILED' });
      const buf = Buffer.from(await imgRes.arrayBuffer());
      dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
    } else {
      throw Object.assign(new Error('A IA não retornou imagem.'), { status: 502, code: 'IMAGE_EMPTY_RESPONSE' });
    }

    res.json({ image: dataUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
