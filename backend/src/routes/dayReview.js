// POST /day-review — análise do dia completo pela Lu.
// Mais longa e estruturada que o /insight: resumo + oportunidades de melhoria
// + comentário final. Disparada quando o usuário toca "Completar dia".

import express from 'express';
import { openai, MODEL } from '../services/openai.js';

const router = express.Router();

const SYSTEM_PROMPT = `Você é a Lu, nutricionista IA do app Nutri Lu. O usuário está fechando o dia e quer uma análise breve, prática e motivadora do que consumiu hoje.

Estrutura da resposta (use markdown, com negrito **texto** e bullets "- "):

**Resumo do dia**
1 ou 2 frases curtas comentando aderência geral: bateu/passou/ficou abaixo da meta, e como ficou a distribuição de macros.

**Oportunidades de melhoria**
2 ou 3 bullets BEM ESPECÍFICOS, baseados nos números do contexto. Ex: "Proteína fechou em 64% — incluir uma fonte no lanche da tarde (ovo, iogurte, frango) ajuda a alcançar." Não invente dados.

**Fechamento**
1 frase curta, motivadora, sem ser puxa-saco. Pode usar 1 emoji.

Regras:
- Resposta TOTAL: máximo 8 linhas.
- NÃO invente alimentos que o usuário não comeu — use só o que está no contexto.
- Se algum macro está zero (ex: dia vazio), comente que ainda dá tempo de registrar.
- NÃO faça perguntas. É uma análise, não conversa.
- Tom: direta, calorosa, prática. Nunca lecionando.`;

function buildContextMessage(ctx) {
  if (!ctx) return 'Sem dados do dia.';
  const parts = [];
  if (ctx.profile) {
    parts.push(`Objetivo: ${ctx.profile.goal || 'não definido'}. Peso ${ctx.profile.weightKg}kg → meta ${ctx.profile.goalWeightKg}kg.`);
  }
  if (ctx.macros) {
    const { kcal, p, c, f } = ctx.macros;
    parts.push(`Macros (consumido/meta): ${kcal?.value}/${kcal?.target}kcal · P ${p?.value}/${p?.target}g · C ${c?.value}/${c?.target}g · G ${f?.value}/${f?.target}g.`);
  }
  if (Array.isArray(ctx.meals)) {
    const lines = ctx.meals.map((m) => {
      const items = (m.items || []).map((it) => `${it.name} (${it.kcal}kcal)`).join('; ');
      return `- ${m.name}: ${items || 'vazio'}`;
    });
    parts.push(`Refeições do dia:\n${lines.join('\n')}`);
  }
  if (ctx.water != null) parts.push(`Hidratação: ${ctx.water * 250}ml de 2000ml meta.`);
  return `Dados do dia que está sendo fechado:\n${parts.join('\n\n')}`;
}

router.post('/', async (req, res, next) => {
  try {
    const { context } = req.body || {};
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildContextMessage(context) },
    ];
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_completion_tokens: 600,
    });
    const text = completion.choices?.[0]?.message?.content?.trim() || '';
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

export default router;
