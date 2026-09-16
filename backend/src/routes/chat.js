// POST /chat — conversa com a Lu (versão simples MVP).
// Recebe histórico de mensagens + contexto do usuário (perfil, macros, refeições)
// e retorna a próxima mensagem da Lu.
//
// Versão "completa" (Semana 2) vai ter: tool calling, histórico persistido,
// streaming, cap de mensagens. Por agora, chat sem estado.

import express from 'express';
import { teto } from '../services/limites.js';
import { requirePremium } from '../services/billing.js';
import { openai, MODEL } from '../services/openai.js';
import { motivoClinico } from '../services/triagem.js';

const router = express.Router();

// Nomes decididos em 17/09/2026: a IA é a LUNA; a profissional é a NUTRI
// LUCIANA. A Luna nunca se apresenta como nutricionista.
const SYSTEM_PROMPT = `Você é a Luna, assistente de IA da Nutri Luciana (Luciana Alves, nutricionista) no app Nutri Lu. Conversa em português brasileiro, de forma calorosa, direta e prática. Você NÃO é nutricionista e nunca diz que é.

Sua função:
- Tirar dúvidas de uso da plataforma (registrar refeição, trocar uma refeição do plano, ver o plano, materiais, evolução).
- Responder dúvidas sobre substituições simples de ingredientes e de refeições, e sobre o que está no plano dela.
- Sugerir ajustes no dia com base no que ela já comeu, e sugerir receitas SEMPRE da lista "Receitas disponíveis" do contexto.
- Comentar progresso de forma motivadora, sem puxar saco.
- Você conhece o perfil, o objetivo e as metas dela (contexto): use isso.

Regras:
- Respostas curtas (1-3 parágrafos no máximo) e diretas.
- Use os dados do "Contexto do dia" pra personalizar respostas — referencie macros, refeições registradas, etc.
- NUNCA invente dados de macros — use só o que está no contexto.
- Pode usar emojis com moderação (1-2 por resposta).

QUANDO ENCAMINHAR PRA NUTRI LUCIANA (campo "encaminhar" = true):
- Saúde: doença, remédio, suplemento, exame, gestação, sintoma. Não responda o mérito: diga em uma frase que isso é com a Nutri Luciana e ofereça mandar a pergunta pra ela.
- Mudança de metas, de calorias ou da prescrição do plano (só ela decide).
- Qualquer coisa que você não sabe responder com o que está no contexto.
Nesses casos a resposta é curta, "receitas" fica vazio e "encaminhar" é true. Em todos os outros, "encaminhar" é false.

SOBRE RECEITAS — leia com atenção:
- Existem DOIS livros. As receitas marcadas "pratica" são simples, do dia a dia
  corrido. As marcadas "elaborada" dão mais trabalho e são pra quando a pessoa
  quer cozinhar algo especial, tipo um fim de semana.
- Antes de sugerir QUALQUER receita, você precisa saber qual dos dois livros
  ela quer. Só valem estes sinais:
  • PRÁTICA — ela falou em pressa, correria, sem tempo, rápido, fácil, simples,
    prático, cansaço, chegar do trabalho, dia de semana.
  • ELABORADA — ela falou em fim de semana, receber gente, visita, caprichar,
    impressionar, comemorar, ter tempo, cozinhar com calma.
- Dizer só a refeição ("uma receita pro jantar", "o que como no almoço?") NÃO
  é sinal e NÃO autoriza escolher por ela. Nem o horário, nem os macros do dia.
- Sem um desses sinais, sua resposta é UMA PERGUNTA e nada mais: quer algo
  prático pro dia a dia corrido ou algo mais elaborado pra caprichar? Nesse
  caso "receitas" fica OBRIGATORIAMENTE vazio — não cite nenhuma receita no
  texto, nem como exemplo, nem "enquanto isso".
- Com o sinal dado (na mensagem de agora ou em qualquer mensagem anterior da
  conversa), NÃO pergunte de novo: sugira direto do livro certo.
- Sugira no máximo 3 receitas, e SÓ códigos que estão na lista do contexto.
  Se a lista estiver vazia ou nenhuma servir, diga isso com franqueza em vez de
  inventar uma receita.
- Ao citar uma receita, escreva o nome dela no texto normalmente e ponha o
  código no campo "receitas". Não escreva o código dentro do texto.
- A lista já vem filtrada pelas restrições e alergias dela. Não ofereça nada
  fora da lista, mesmo que pareça uma boa ideia.

Importante: você NÃO substitui nutricionista. Quando relevante, lembre disso.`;

// Formato fixo da resposta: o texto que a cliente lê e os códigos das receitas
// sugeridas. Com os códigos separados, a web transforma a sugestão num card de
// verdade (abre a receita, registra com um toque) em vez de texto solto.
const RESPOSTA_SCHEMA = {
  name: 'resposta_lu',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['reply', 'receitas', 'encaminhar'],
    properties: {
      reply: { type: 'string', description: 'A resposta pra cliente, em português, sem códigos de receita no meio do texto.' },
      receitas: {
        type: 'array',
        description: 'Códigos das receitas sugeridas (no máximo 3), escolhidos SOMENTE da lista do contexto. Vazio quando não está sugerindo receita.',
        items: { type: 'string' },
      },
      encaminhar: { type: 'boolean', description: 'true quando a dúvida é pra Nutri Luciana (saúde, metas, ou você não sabe). A tela oferece o botão de mandar pra ela.' },
    },
  },
};

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
  // Restrições e alergias vão no texto só pra IA não CONTRADIZER o filtro na
  // conversa ("experimenta com queijo"). O filtro de verdade é a lista de
  // receitas abaixo, montada no código — modelo não decide alergia.
  if (ctx.restricoes?.length || ctx.alergias) {
    parts.push(
      `Restrições dela: ${ctx.restricoes?.length ? ctx.restricoes.join(', ') : 'nenhuma'}.` +
        (ctx.alergias ? ` ALERGIA a: ${ctx.alergias}. Nunca sugira nada com isso.` : ''),
    );
  }
  if (Array.isArray(ctx.recipes) && ctx.recipes.length) {
    const linhas = ctx.recipes.slice(0, 40).map((r) =>
      `${r.code} | ${r.livro === 'pratica' ? 'pratica' : 'elaborada'} | ${r.name} | ${r.kcal} kcal, P ${r.p} C ${r.c} G ${r.f}`,
    );
    parts.push(
      `Receitas disponíveis (as ÚNICAS que você pode sugerir, já filtradas pelas restrições e alergias dela):\n` +
        `código | livro | nome | macros por porção\n${linhas.join('\n')}`,
    );
  } else {
    parts.push('Receitas disponíveis: nenhuma foi carregada. Não sugira receita nesta resposta.');
  }
  if (!parts.length) return null;
  return `Contexto do dia:\n${parts.join('\n\n')}`;
}

router.post('/', requirePremium, teto('chat-lu', { gratis: 15, assinante: 60, assinanteMes: 600 }, 'LIMITE_CHAT'), async (req, res, next) => {
  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Faltam mensagens', code: 'BAD_REQUEST' });
    }

    // Regra dura, no código: assunto de saúde nunca é respondido pela Luna,
    // nem chega ao modelo. Vai pra Nutri Luciana. (Também economiza a chamada.)
    const ultima = [...messages].reverse().find((m) => m.role !== 'lu');
    const clinico = ultima ? motivoClinico(String(ultima.text || '')) : null;
    if (clinico) {
      return res.json({
        reply: 'Essa pergunta envolve saúde, e isso é com a Nutri Luciana, não comigo. Quer que eu mande a sua pergunta pra ela? Ela responde pessoalmente, em até 1 dia útil.',
        receitas: [],
        encaminhar: true,
      });
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
      max_completion_tokens: 700,
      response_format: { type: 'json_schema', json_schema: RESPOSTA_SCHEMA },
    });

    const bruto = completion.choices?.[0]?.message?.content?.trim() || '';
    let dados;
    try { dados = JSON.parse(bruto); } catch { dados = { reply: bruto, receitas: [] }; }

    // Última trava: o modelo só devolve código que REALMENTE estava na lista
    // que mandamos. Se ele inventar ou trocar um dígito, o código é descartado
    // em vez de virar um card que abre uma receita errada (ou nenhuma).
    const permitidos = new Set((context?.recipes || []).map((r) => String(r.code)));
    const receitas = (Array.isArray(dados.receitas) ? dados.receitas : [])
      .map((c) => String(c).trim().toUpperCase())
      .filter((c) => permitidos.has(c))
      .slice(0, 3);

    res.json({ reply: String(dados.reply || '').trim(), receitas, encaminhar: dados.encaminhar === true });
  } catch (err) {
    next(err);
  }
});

export default router;
