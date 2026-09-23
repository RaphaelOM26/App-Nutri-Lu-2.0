// A Luna (IA) num lugar só: a rota /chat da web e o bot de WhatsApp chamam
// a MESMA função, com o mesmo prompt, o mesmo formato de resposta e a mesma
// regra dura de saúde. Canal novo não pode virar persona nova.
//
// Nomes decididos em 17/09/2026: a IA é a LUNA; a profissional é a NUTRI
// LUCIANA. A Luna nunca se apresenta como nutricionista.

import { getPool } from '../db.js';
import { openai, MODEL } from './openai.js';
import { motivoClinico } from './triagem.js';
import { montarDia } from './diario.js';
import { primeiroNome, nomeDe } from '../utils/nomes.js';

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

COMO CHAMAR ELA PELO NOME:
- O nome está no contexto, em "Chame ela de". Use SÓ esse nome, nunca o nome completo, e nunca invente um apelido.
- Use o nome quando ele significa alguma coisa: na sua PRIMEIRA fala da conversa, quando elogia ou incentiva, e quando a notícia é ruim (ela passou da meta, bateu num limite, algo deu errado).
- NÃO repita o nome em toda mensagem nem duas vezes na mesma mensagem. Uma sequência de respostas curtas com o nome em todas soa robô, e no WhatsApp soa disparo automático.
- Se o contexto não trouxer nome, escreva a frase sem nome nenhum. Nunca use "você aí", "querida", "amiga" ou parecidos pra tapar o buraco.

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

// No WhatsApp o livro de receitas não está no servidor (mora no bundle da
// web), então a lista vai vazia e a Luna manda a pessoa pra tela Receitas.
// Restrição e alergia continuam sendo filtro em CÓDIGO: sem lista, sem sugestão.
const CANAL_WHATSAPP = `Você está respondendo pelo WhatsApp.
- Ainda mais curto: no máximo 2 parágrafos pequenos. Sem títulos, sem listas longas.
- Negrito é com UM asterisco de cada lado (*assim*), nunca dois.
- Aqui você NÃO sugere receita específica: a lista "Receitas disponíveis" vem vazia. Se ela pedir receita, diga que as receitas ficam na tela Receitas da área de membros, já filtradas pras restrições dela.
- Ela registra refeição aqui mesmo mandando FOTO do prato ou ÁUDIO contando o que comeu; pede "macros" pra ver o resumo do dia; "o que como hoje" pra ver o plano; "atendente" pra falar com uma pessoa do time.`;

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

export const RESPOSTA_SAUDE = 'Essa pergunta envolve saúde, e isso é com a Nutri Luciana, não comigo. Quer que eu mande a sua pergunta pra ela? Ela responde pessoalmente, em até 2 dias úteis.';

// Constrói o contexto do dia a partir do payload do cliente.
function buildContextMessage(ctx) {
  if (!ctx) return null;
  const parts = [];
  if (ctx.profile) {
    // O nome vem tratado (primeiro nome, caixa arrumada) do `nomes.js`: aqui
    // só entra o que a Luna pode dizer em voz alta. Sem nome, a linha some —
    // e o prompt manda escrever a frase sem nome nenhum.
    const nome = primeiroNome(ctx.profile.name);
    if (nome) parts.push(`Chame ela de: ${nome}`);
    parts.push(
      `Perfil: objetivo "${ctx.profile.goal || 'não definido'}", ` +
        `${ctx.profile.weightKg || '?'}kg → meta ${ctx.profile.goalWeightKg || '?'}kg.`,
    );
  }
  if (ctx.macros) {
    const { kcal, p, c, f } = ctx.macros;
    parts.push(
      kcal?.target
        ? `Macros de hoje (consumido / meta): ${kcal?.value}kcal/${kcal?.target}kcal · ` +
            `Proteína ${p?.value}g/${p?.target}g · Carbs ${c?.value}g/${c?.target}g · Gordura ${f?.value}g/${f?.target}g.`
        : `Consumido hoje: ${kcal?.value}kcal · Proteína ${p?.value}g · Carbs ${c?.value}g · Gordura ${f?.value}g (sem meta do plano ainda).`,
    );
  }
  // Sem plano publicado, a referência é a faixa provisória do onboarding
  // (fórmula de bolso). Vai como FAIXA: a Luna não escolhe um número dentro dela.
  const e = ctx.estimativa;
  if (e?.kcal) {
    const fx = (f, un) => `${f[0]} a ${f[1]}${un}`;
    parts.push(
      `Ainda não há plano publicado pela Nutri Luciana. Referência PROVISÓRIA (faixa por dia, calculada no cadastro): ` +
        `${fx(e.kcal, ' kcal')} · Proteína ${fx(e.p, ' g')} · Carbs ${fx(e.c, ' g')} · Gordura ${fx(e.f, ' g')}. ` +
        `Se ela perguntar quanto ainda pode comer, calcule o que falta até a faixa (em faixa, ex.: "faltam 400 a 700 kcal") ` +
        `a partir do consumido e diga que é provisório até a Nutri Luciana publicar o plano.`,
    );
  }
  if (Array.isArray(ctx.meals) && ctx.meals.length) {
    const lines = ctx.meals.map((m) => {
      const items = (m.items || []).map((it) => `${it.name} (${it.portion}, ${it.kcal}kcal)`).join('; ');
      return `- ${m.name}: ${items || 'nada registrado ainda'}`;
    });
    parts.push(`Refeições de hoje:\n${lines.join('\n')}`);
  }
  if (Array.isArray(ctx.planoHoje) && ctx.planoHoje.length) {
    parts.push(`Plano de hoje (montado pela Nutri Luciana):\n${ctx.planoHoje.map((l) => `- ${l}`).join('\n')}`);
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

/**
 * A próxima fala da Luna.
 *
 * @param {{ messages: {role: 'lu'|'user', text: string}[], context?: object, canal?: 'web'|'whatsapp' }} p
 * @returns {Promise<{ reply: string, receitas: string[], encaminhar: boolean, clinico?: boolean }>}
 */
export async function responderLuna({ messages, context, canal = 'web' }) {
  // Regra dura, no código: assunto de saúde nunca é respondido pela Luna,
  // nem chega ao modelo. Vai pra Nutri Luciana. (Também economiza a chamada.)
  const ultima = [...messages].reverse().find((m) => m.role !== 'lu');
  if (ultima && motivoClinico(String(ultima.text || ''))) {
    return { reply: RESPOSTA_SAUDE, receitas: [], encaminhar: true, clinico: true };
  }

  const chatMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
  if (canal === 'whatsapp') chatMessages.push({ role: 'system', content: CANAL_WHATSAPP });
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

  return { reply: String(dados.reply || '').trim(), receitas, encaminhar: dados.encaminhar === true };
}

const ROTULO_SLOT = { cafe: 'Café da manhã', lanche_manha: 'Lanche da manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da tarde', jantar: 'Jantar', ceia: 'Ceia' };

/**
 * O mesmo contexto que o navegador monta pra /chat, montado no SERVIDOR (o
 * WhatsApp não tem navegador). Só perfil NÃO clínico e o dia: a anamnese
 * clínica não é lida aqui nem em montarDia.
 */
export async function contextoDoServidor(userId, date) {
  const [dia, { rows: [u] }, { rows: [perf] }] = await Promise.all([
    montarDia(userId, date),
    getPool().query(`SELECT apelido, display_name FROM users WHERE id = $1`, [userId]),
    getPool().query(`SELECT data FROM client_profiles WHERE user_id = $1`, [userId]),
  ]);
  const p = perf?.data || {};
  const t = dia.targets || {};
  return {
    profile: { name: nomeDe(u) || undefined, goal: p.objetivo, weightKg: dia.peso?.kg, goalWeightKg: p.meta_kg },
    macros: {
      kcal: { value: dia.consumido.kcal, target: t.kcal ?? 0 }, p: { value: dia.consumido.p, target: t.p ?? 0 },
      c: { value: dia.consumido.c, target: t.c ?? 0 }, f: { value: dia.consumido.f, target: t.f ?? 0 },
    },
    estimativa: !t.kcal && dia.estimativa?.kcal ? dia.estimativa : null,
    meals: dia.entries.map((e) => ({ name: ROTULO_SLOT[e.slot] || e.slot, items: (e.items || []).map((i) => ({ name: i.name, portion: i.portion, kcal: i.kcal })) })),
    planoHoje: (dia.plano?.dia?.meals || []).map((m) => `${ROTULO_SLOT[m.slot] || m.slot}${m.time ? ` (${m.time})` : ''}: ${m.name}${m.subs ? ` · substituições: ${m.subs}` : ''}`),
    water: Math.round((dia.water_ml || 0) / 250),
    restricoes: Array.isArray(p.restricoes) ? p.restricoes : [],
    alergias: typeof p.alergias === 'string' ? p.alergias : '',
    recipes: [],
  };
}
