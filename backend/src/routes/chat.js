// POST /chat — conversa com a Lu (versão simples MVP).
// Recebe histórico de mensagens + contexto do usuário (perfil, macros, refeições)
// e retorna a próxima mensagem da Lu.
//
// Versão "completa" (Semana 2) vai ter: tool calling, histórico persistido,
// streaming, cap de mensagens. Por agora, chat sem estado.

import express from 'express';
import { openai, MODEL } from '../services/openai.js';

const router = express.Router();

const SYSTEM_PROMPT = `Você é a Lu, nutricionista IA do app Nutri Lu. Conversa em português brasileiro, de forma calorosa, direta e prática.

Sua função:
- Responder dúvidas sobre nutrição, dieta, refeições e progresso.
- Sugerir ajustes nos macros do dia com base nos dados que o usuário já comeu.
- Recomendar receitas ou alimentos quando fizer sentido.
- Comentar progresso de forma motivadora, mas sem puxar saco.

Regras:
- Respostas curtas (1-3 parágrafos no máximo) e diretas.
- Use os dados do "Contexto do dia" pra personalizar respostas — referencie macros, refeições registradas, etc.
- Quando o usuário perguntar algo que dependa de dados que você não tem (peso, alergias), peça que ele preencha o perfil.
- NUNCA invente dados de macros — use só o que está no contexto.
- Se receber pergunta que pareça saúde séria (ex: "tenho diabetes, posso comer X?"), recomende consultar nutricionista de verdade.
- Pode usar emojis com moderação (1-2 por resposta).

Importante: você NÃO substitui nutricionista. Quando relevante, lembre disso.`;

// Constrói o contexto do dia a partir do payload do cliente.
function buildContextMessage(ctx) {
  if (!ctx) return null;
  const parts = [];
  if (ctx.profile) {
    parts.push(
      `Perfil: ${ctx.profile.name || 'Usuária'}, objetivo "${ctx.profile.goal || 'não definido'}", ` +
        `${ctx.profile.weightKg || '?'}kg → meta ${ctx.profile.goalWeightKg || '?'}kg.`,
    );
  }
  if (ctx.macros) {
    const { kcal, p, c, f } = ctx.macros;
    parts.push(
      `Macros de hoje (consumido / meta): ${kcal?.value}kcal/${kcal?.target}kcal · ` +
        `Proteína ${p?.value}g/${p?.target}g · Carbs ${c?.value}g/${c?.target}g · Gordura ${f?.value}g/${f?.target}g.`,
    );
  }
  if (Array.isArray(ctx.meals) && ctx.meals.length) {
    const lines = ctx.meals.map((m) => {
      const items = (m.items || []).map((it) => `${it.name} (${it.portion}, ${it.kcal}kcal)`).join('; ');
      return `- ${m.name}: ${items || 'nada registrado ainda'}`;
    });
    parts.push(`Refeições de hoje:\n${lines.join('\n')}`);
  }
  if (ctx.water != null) {
    parts.push(`Hidratação: ${ctx.water * 250}ml / 2000ml (meta diária).`);
  }
  if (!parts.length) return null;
  return `Contexto do dia:\n${parts.join('\n\n')}`;
}

router.post('/', async (req, res, next) => {
  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Faltam mensagens', code: 'BAD_REQUEST' });
    }

    const chatMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
    const ctxMsg = buildContextMessage(context);
    if (ctxMsg) chatMessages.push({ role: 'system', content: ctxMsg });
    for (const m of messages) {
      const role = m.role === 'lu' ? 'assistant' : 'user';
      chatMessages.push({ role, content: String(m.text ?? '') });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: chatMessages,
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '';
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;
