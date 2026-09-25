// A IA que transforma foto ou áudio em refeição. Um código só pros dois
// canais: as rotas HTTP (/analyze-food, /transcribe-meal) e o bot de WhatsApp.
// A precisão da foto foi MEDIDA com este prompt e este modelo (ver
// services/openai.js); canal novo não pode virar prompt novo.

import { openai, MODEL, FOOD_MODEL, FOOD_ANALYSIS_SCHEMA, FOOD_SYSTEM_PROMPT, MEAL_VOICE_SCHEMA, MEAL_VOICE_PROMPT } from './openai.js';
import { sanitizeText } from '../utils/recipeSanity.js';

const erroIA = () => Object.assign(new Error('Resposta vazia da IA.'), { status: 502, code: 'AI_EMPTY_RESPONSE' });

/**
 * @param {string} dataUrl  imagem como data URL (data:image/jpeg;base64,...)
 * @param {{ pistas?: string[] }} [opts]  frases sobre ESTE prato ou sobre a
 *   pessoa (legenda da foto, correções que ela já fez): entram como "Pistas da
 *   pessoa" e valem mais que a impressão visual. Nunca dado clínico.
 */
export async function analisarPrato(dataUrl, { pistas = [] } = {}) {
  const limpas = (Array.isArray(pistas) ? pistas : []).map((p) => sanitizeText(String(p || '')).trim().slice(0, 200)).filter(Boolean).slice(0, 8);
  const texto = 'Identifique os alimentos neste prato e estime os macros conforme o schema.'
    + (limpas.length ? `\n\nPistas da pessoa:\n${limpas.map((p) => `- ${p}`).join('\n')}` : '');
  const completion = await openai.chat.completions.create({
    model: FOOD_MODEL,
    messages: [
      { role: 'system', content: FOOD_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: texto },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    response_format: { type: 'json_schema', json_schema: FOOD_ANALYSIS_SCHEMA },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw erroIA();
  return JSON.parse(content);
}

const MIME_AUDIO = { m4a: 'audio/m4a', mp3: 'audio/mpeg', mp4: 'audio/mp4', wav: 'audio/wav', webm: 'audio/webm', ogg: 'audio/ogg' };

/** Whisper em PT-BR. Devolve '' quando não entendeu nada. */
export async function transcrever(buffer, ext = 'm4a') {
  const e = String(ext).toLowerCase();
  // OpenAI SDK aceita File-like — usamos toFile do helper.
  const { toFile } = await import('openai/uploads');
  const audioFile = await toFile(buffer, `audio.${e}`, { type: MIME_AUDIO[e] || 'audio/m4a' });
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'pt',
    // prompt curto guia o vocabulário de domínio
    prompt: 'Transcrição de uma pessoa relatando o que comeu numa refeição. Vocabulário comum: arroz, feijão, frango, ovo, salada, banana, café, leite, pão, tapioca, batata, brócolis, salmão, atum, aveia, granola.',
  });
  return (transcription.text || '').trim();
}

/** Estrutura o que a pessoa DISSE que comeu em itens + macros + mealType. */
export async function estruturarRefeicaoFalada(transcript) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: MEAL_VOICE_PROMPT },
      { role: 'user', content: `Transcrição do que o usuário disse:\n\n"${transcript}"\n\nEstruture em items de refeição com macros estimados.` },
    ],
    response_format: { type: 'json_schema', json_schema: MEAL_VOICE_SCHEMA },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw erroIA();
  return JSON.parse(content);
}

/** Itens da IA (portion_grams, protein_g…) → formato do diário (grams, p, c, f). */
export function itensDoDiario(itensIA) {
  const n = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);
  // sanitizeText: o modelo às vezes injeta um pedaço em árabe/CJK no nome
  // ("pão الفرنسي", visto em 23/09) — mesmo filtro da importação de receita.
  return (Array.isArray(itensIA) ? itensIA : []).map((it) => {
    // `portion` segue em gramas (é o que a área de membros edita); `medida` é
    // a medida caseira que a Luna mostra no WhatsApp. Só entra se veio limpa.
    const medida = sanitizeText(String(it.medida_caseira || '')).trim().slice(0, 60);
    return {
      name: (sanitizeText(String(it.name || '')) || 'Item').slice(0, 120),
      portion: `${Math.round(n(it.portion_grams))} g`,
      grams: n(it.portion_grams),
      ...(medida && !/\d\s*g\b/.test(medida) ? { medida } : {}),
      kcal: n(it.kcal), p: n(it.protein_g), c: n(it.carbs_g), f: n(it.fat_g),
    };
  });
}
