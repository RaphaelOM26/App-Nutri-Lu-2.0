// POST /insight — gera um insight curto da Lu pro card da Home.
// Recebe o mesmo contexto do /chat (perfil + macros + refeições + hidratação)
// e retorna 1-2 frases motivadoras/práticas baseadas nos dados do dia.

import express from 'express';
import { openai, MODEL } from '../services/openai.js';

const router = express.Router();

// O cliente envia tone='alert' ou 'good'. Em alert, NUNCA comemoramos —
// apontamos os excessos com cuidado. Em good, podemos parabenizar.
const SYSTEM_PROMPT_GOOD = `Você é a Lu, nutricionista IA. Gere UM insight curto e positivo/neutro baseado nos dados do dia.

Regras:
- 1 a 2 frases, direta. Pode usar 1 emoji.
- Foque em UMA dimensão (proteína, calorias, hidratação ou consistência).
- Se bateu uma meta, comemore com moderação. Se está perto, encoraje.
- Se está abaixo em algo importante (ex: proteína < 40%), aponte como ajustar SEM dramatizar.
- Use os números do contexto. NUNCA invente dados.
- Sem perguntas, sem "olá", sem markdown. Só o texto.`;

const SYSTEM_PROMPT_ALERT = `Você é a Lu, nutricionista IA. O dia do usuário tem EXCESSO(S) que precisam de atenção. Gere um alerta CUIDADOSO e construtivo.

Regras:
- 1 a 2 frases, direta. NÃO use emojis comemorativos (🎉 👏 💪). Pode usar ⚠️ se fizer sentido.
- NUNCA dê parabéns. NUNCA elogie um dia em que houve excesso significativo.
- Aponte ESPECIFICAMENTE os macros que estouraram, com os números reais.
- Quando o objetivo é "Perder peso", lembre brevemente que excesso de calorias atrapalha.
- Tom: empático mas honesto. Sem dramatizar, sem julgar.
- Use os números do contexto. NUNCA invente.
- Sem perguntas, sem "olá", sem markdown. Só o texto do insight.`;

function buildContextMessage(ctx) {
  if (!ctx) return null;
  const parts = [];
  if (ctx.macros) {
    const { kcal, p, c, f } = ctx.macros;
    parts.push(
      `Macros (consumido/meta): ${kcal?.value}/${kcal?.target}kcal · ` +
        `P ${p?.value}/${p?.target}g · C ${c?.value}/${c?.target}g · G ${f?.value}/${f?.target}g.`,
    );
  }
  if (ctx.water != null) {
    parts.push(`Hidratação: ${ctx.water * 250}ml de 2000ml meta.`);
  }
  if (Array.isArray(ctx.meals) && ctx.meals.length) {
    const registered = ctx.meals.filter((m) => (m.items || []).length > 0).length;
    parts.push(`Refeições registradas hoje: ${registered} de ${ctx.meals.length}.`);
  }
  if (ctx.profile?.goal) parts.push(`Objetivo: ${ctx.profile.goal}.`);
  if (!parts.length) return null;
  return `Dados do dia:\n${parts.join('\n')}`;
}

router.post('/', async (req, res, next) => {
  try {
    const { context } = req.body || {};
    const tone = context?.tone === 'alert' ? 'alert' : 'good';
    const ctxMsg = buildContextMessage(context);
    const systemPrompt = tone === 'alert' ? SYSTEM_PROMPT_ALERT : SYSTEM_PROMPT_GOOD;
    const messages = [{ role: 'system', content: systemPrompt }];
    if (ctxMsg) messages.push({ role: 'user', content: ctxMsg });
    else messages.push({ role: 'user', content: 'Sem dados ainda — dê um insight motivador genérico curto.' });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.8,
      max_completion_tokens: 120,
    });

    const text = completion.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || '';
    res.json({ text, tone });
  } catch (err) {
    next(err);
  }
});

export default router;
