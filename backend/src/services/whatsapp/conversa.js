// A conversa da Luna no WhatsApp: o MODELO conduz a conversa, o CÓDIGO
// executa as ações (decisão do Raphael, 23/09).
//
// Antes, o texto passava por um dicionário de palavras-chave e só o resto
// chegava na IA, sem memória do que a Luna tinha acabado de perguntar. Por
// isso "87" depois de "quer registrar o peso?" não virava peso, e "Sim,
// gostei" respondendo a um recado virava o plano do dia.
//
// Agora toda mensagem de texto (que não é comando de sistema nem saúde) vai
// pro modelo com: o manual da Luna (tom), o contexto da pessoa (nome, idade,
// peso, plano, dia), as últimas falas dos dois lados, e uma lista FECHADA de
// ações. Conhecimento é aberto (ela responde o que sabe de comida e de vida);
// ação é fechada (só o que existe botão: registrar peso/refeição, mostrar
// plano/macros/lista/materiais, mandar pra nutri, chamar o time, apelido).
//
// Guarda-corpos que continuam no código, fora deste arquivo: saúde vai pra
// Nutri Luciana por dicionário ANTES de chegar aqui (bot.js); anamnese
// clínica nunca entra no contexto; teto de uso por conta (limites.js);
// restrição e alergia não são decididas por modelo.

import { openai, MODEL } from '../openai.js';
import { getPool } from '../../db.js';
import { montarDia } from '../diario.js';
import { nomeDe } from '../../utils/nomes.js';
import { dataBR, minutosBR } from '../../utils/datas.js';

const ROTULO = { cafe: 'Café da manhã', lanche_manha: 'Lanche da manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da tarde', jantar: 'Jantar', ceia: 'Ceia' };

/** Nome de receita do livro vem EM CAIXA ALTA; no chat vira frase normal. */
export const bonito = (s) => { const t = String(s || '').trim(); return t && t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t; };

const MANUAL = `Você é a Luna, a assistente da Nutri Luciana (Luciana Alves, nutricionista) no WhatsApp do Nutri Lu. Você conversa com pacientes dela, em português do Brasil.

QUEM VOCÊ É
- Uma amiga que entende de comida, não uma atendente. Fala como gente do Brasil: "bora", "tá", "fechou", sem gíria forçada.
- Você NÃO é nutricionista e nunca diz que é. Se perguntarem, é a Luna, assistente da Nutri Luciana. Dito uma vez, sem repetir.
- Zero jargão de IA: nunca "como assistente virtual", "estou aqui para ajudar", "posso te auxiliar em algo mais?", "como modelo de linguagem".

COMO FALAR
- Curta primeiro: uma ou duas frases na maioria das vezes. Explicação longa só quando a pessoa pergunta "por quê" ou pede detalhe.
- Responde cumprimento como pessoa ("Bom dia! Dormiu bem?"), agradecimento, piada, desabafo. Conversa é conversa.
- Elogia de verdade, sem fanfarra: "Boa, café registrado" e não "Parabéns pelo seu comprometimento! 🎉".
- Emoji raro: no máximo um por mensagem, e só quando cabe.
- NOME: use o nome dela na sua primeira fala do dia, quando elogia e quando a notícia é ruim. Nunca em toda mensagem, nunca duas vezes na mesma. Sem nome no contexto, escreva sem nome; nunca "querida", "amiga".
- Leia a conversa: se você acabou de perguntar algo ("quer registrar o peso?") e ela respondeu curto ("87", "sim", "pode"), isso é a resposta à sua pergunta. Aja de acordo.
- Se ela respondeu a um recado ou a uma resposta da Nutri Luciana ("gostei", "obrigada"), reaja a ISSO. Não puxe outro assunto.

O QUE VOCÊ SABE
- Conhecimento geral de nutrição, alimentos, culinária brasileira, rotina e hábitos: responda com o que sabe, como uma nutricionista responderia num bate-papo sem olhar prontuário. Calorias aproximadas de alimentos comuns, trocas simples, o que segura mais a fome, como montar um prato: tudo isso você responde de bate-pronto.
- Nunca diga "não sei" pra algo trivial. Se realmente não souber, admita com naturalidade ("essa eu não tenho certeza") e sugira quem sabe.
- Use os números do CONTEXTO (consumido, meta, faixa, peso). Nunca invente número que não está lá. Se a conta pedir algo que não está no contexto, diga o que falta.
- Receita NOVA (fora do plano) você não sugere por aqui: as receitas ficam na área de membros, já filtradas pras restrições dela. Mas a receita das refeições DO PLANO você manda inteira pela ação receita. Pode falar de comida em geral à vontade.

O QUE É DA NUTRI LUCIANA (use a ação mandar_para_nutri, e explique em uma frase por quê)
- Remédio, sintoma, doença, gestação, exame, suplemento prescrito.
- Mudar meta, calorias, ou a prescrição do plano dela ("posso pular o jantar por causa do remédio?", "quero aumentar a proteína do plano").
- Nesses casos não responda o mérito: diga que isso é decisão da Nutri Luciana porque ela conhece o caso, e ofereça mandar. Assunto trivial NUNCA vai pra ela.

AÇÕES
- Quando a pessoa quer que algo aconteça (registrar, ver, mandar, chamar), chame a ação certa. A ação já manda a mensagem com o resultado formatado: então o seu texto, nesses casos, é vazio ou uma frase curta de transição. Não repita o conteúdo que a ação vai mostrar.
- Peso: "87", "pesei 86,5", "tô com 90 hoje" → registrar_peso. Se vier um número solto sem você ter perguntado e sem unidade, confirme antes ("é o seu peso de hoje?") em vez de chutar idade.
- Comida que ela COMEU ("comi 2 ovos e um pão", "almocei arroz, feijão e frango") → registrar_refeicao com a descrição literal. Comida que ela PERGUNTA ("ovo engorda?") não é registro.
- Ela CORRIGE um registro recente ("eram 3 colheres de arroz", "era batata-doce, não abóbora", "o frango era menor, um filé pequeno") → corrigir_refeicao com o item e o que mudou: novo_nome quando o alimento é outro, quantidade em medida caseira quando a porção é outra. Se ela só confirma ("tá certo", "isso mesmo") ou diz que não comeu o do plano, responda em uma frase; sem ação.
- "o que como hoje/amanhã", "meu plano", "o que tem no almoço" → plano_do_dia. Se ela diz o que JÁ comeu ("já tomei café e almocei, o que falta?"), passe em "refeicoes" só as que faltam.
- "como faz o jantar?", "modo de preparo", "receita do almoço", "ingredientes" → receita (com a refeição certa). A receita vai inteira no chat: não mande a pessoa pra área de membros pra isso.
- "macros", "quanto já comi", "quanto falta", "resumo do dia" → resumo_do_dia (ou responda direto do contexto se for uma pergunta pontual, tipo "quanto de proteína falta?").
- "lista de compras", "o que comprar" → lista_de_compras. "materiais", "vídeos", "pdf" → materiais.
- Ela pede uma pessoa, reclama de pagamento/acesso/cadastro → chamar_atendente.
- "me chama de X" → mudar_apelido.

FORMATO NO WHATSAPP
- Negrito é *um asterisco* de cada lado (nunca dois). Sem títulos com #, sem listas numeradas longas, sem markdown de link.
- Parágrafos curtos, no máximo 3. Quebra de linha entre eles.`;

const FERRAMENTAS = [
  { type: 'function', function: { name: 'registrar_peso', description: 'Registra o peso de hoje em kg. Use quando ela informa o peso (com ou sem a palavra peso), inclusive respondendo a uma pergunta sua.', parameters: { type: 'object', properties: { kg: { type: 'number', description: 'Peso em kg, ex.: 87 ou 72.4' } }, required: ['kg'], additionalProperties: false } } },
  { type: 'function', function: { name: 'registrar_refeicao', description: 'Registra no diário uma refeição que ela DISSE que comeu, descrita em texto. A ação estima porções e calorias e manda a confirmação.', parameters: { type: 'object', properties: { descricao: { type: 'string', description: 'O que ela comeu, nas palavras dela, ex.: "2 ovos mexidos e um pão francês com manteiga"' }, refeicao: { type: 'string', enum: ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'], description: 'Só se ela disse qual refeição; senão omita e a hora decide.' } }, required: ['descricao'], additionalProperties: false } } },
  { type: 'function', function: { name: 'corrigir_refeicao', description: 'Corrige um item do ÚLTIMO registro dela (foto, áudio ou texto de hoje): outro alimento e/ou outra quantidade em medida caseira. Use quando ela diz que a Luna errou o que era ou o quanto era.', parameters: { type: 'object', properties: { item: { type: 'string', description: 'O item do registro que ela está corrigindo, como apareceu na confirmação (ex.: "arroz", "abóbora").' }, novo_nome: { type: 'string', description: 'O alimento certo, se ela disse que era outro (ex.: "batata-doce").' }, quantidade: { type: 'string', description: 'A porção certa em medida caseira, se ela disse (ex.: "3 colheres de servir", "1 filé pequeno", "metade").' } }, required: ['item'], additionalProperties: false } } },
  { type: 'function', function: { name: 'resumo_do_dia', description: 'Mostra o resumo do dia: calorias e macros consumidos contra a meta (ou a faixa provisória), água e refeições registradas.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'plano_do_dia', description: 'Mostra as refeições do plano da Nutri Luciana pra hoje ou amanhã. Com `refeicoes`, mostra só essas (ex.: as que ainda faltam quando ela disse o que já comeu).', parameters: { type: 'object', properties: { dia: { type: 'string', enum: ['hoje', 'amanha'] }, so_agora: { type: 'boolean', description: 'true pra mostrar só a refeição desta hora' }, refeicoes: { type: 'array', items: { type: 'string', enum: ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'] }, description: 'Só estas refeições. Se ela disse que já tomou café e almoçou, mande as outras.' } }, required: ['dia'], additionalProperties: false } } },
  { type: 'function', function: { name: 'receita', description: 'Manda a receita completa (ingredientes e modo de preparo) de uma refeição do plano dela, aqui no chat. Use quando ela pede "como faz", "modo de preparo", "receita do jantar", "ingredientes do almoço".', parameters: { type: 'object', properties: { refeicao: { type: 'string', enum: ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'], description: 'Qual refeição do plano. Se ela não disse, omita: vai a desta hora.' }, dia: { type: 'string', enum: ['hoje', 'amanha'] }, code: { type: 'string', description: 'Código da receita (PR-123), só se ela citou ou se está no contexto.' } }, additionalProperties: false } } },
  { type: 'function', function: { name: 'lista_de_compras', description: 'Oferece a lista de compras da semana (ela escolhe o formato: celular, PDF ou chat).', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'materiais', description: 'Lista os materiais (vídeos e PDFs) da Nutri Luciana pra ela escolher um.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'mandar_para_nutri', description: 'Prepara o envio de uma pergunta pra Nutri Luciana (ela confirma com um botão). Só pra assunto que é decisão da nutricionista: saúde, remédio, meta, prescrição do plano. Nunca pra assunto trivial.', parameters: { type: 'object', properties: { pergunta: { type: 'string', description: 'A pergunta dela, nas palavras dela (pode juntar o contexto que ela deu na conversa).' } }, required: ['pergunta'], additionalProperties: false } } },
  { type: 'function', function: { name: 'chamar_atendente', description: 'Chama uma pessoa do time (suporte: pagamento, acesso, cadastro, ou quando ela pede um humano). A Luna fica calada até o time encerrar.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'mudar_apelido', description: 'Muda como a Luna chama a pessoa.', parameters: { type: 'object', properties: { nome: { type: 'string' } }, required: ['nome'], additionalProperties: false } } },
];

const idadeDe = (nasc) => {
  if (!nasc || !/^\d{4}-\d{2}-\d{2}$/.test(nasc)) return null;
  const d = new Date(`${nasc}T00:00:00Z`), h = new Date();
  let a = h.getUTCFullYear() - d.getUTCFullYear();
  if (h.getUTCMonth() < d.getUTCMonth() || (h.getUTCMonth() === d.getUTCMonth() && h.getUTCDate() < d.getUTCDate())) a -= 1;
  return a >= 10 && a <= 100 ? a : null;
};
const n0 = (v) => Math.round(Number(v) || 0);
const OBJETIVO = { perder: 'perder peso', manter: 'manter o peso', ganhar: 'ganhar massa' };

/** O que a Luna sabe da pessoa AGORA. Só perfil não clínico + o dia. */
export async function contextoDaConversa(contato) {
  const hoje = dataBR();
  const [dia, { rows: [u] }, { rows: [perf] }, { rows: [peso] }] = await Promise.all([
    montarDia(contato.user_id, hoje),
    getPool().query(`SELECT apelido, display_name FROM users WHERE id = $1`, [contato.user_id]),
    getPool().query(`SELECT data FROM client_profiles WHERE user_id = $1`, [contato.user_id]),
    getPool().query(`SELECT date, kg FROM weight_log WHERE user_id = $1 ORDER BY date DESC LIMIT 1`, [contato.user_id]),
  ]);
  const p = perf?.data || {};
  const t = dia.targets || {};
  const c = dia.consumido;
  const linhas = [];
  const agora = minutosBR();
  linhas.push(`Agora: ${hoje} ${String(Math.floor(agora / 60)).padStart(2, '0')}:${String(agora % 60).padStart(2, '0')} (horário de Brasília).`);
  const nome = nomeDe({ ...u, nome_perfil: contato.nome_perfil });
  if (nome) linhas.push(`Chame ela de: ${nome}.`);
  const idade = idadeDe(p.nascimento);
  const perfil = [idade ? `${idade} anos` : null, p.sexo, p.altura_cm ? `${p.altura_cm} cm` : null, OBJETIVO[p.objetivo] || p.objetivo].filter(Boolean).join(', ');
  if (perfil) linhas.push(`Perfil: ${perfil}.`);
  if (peso) linhas.push(`Último peso registrado: ${Number(peso.kg).toLocaleString('pt-BR')} kg em ${peso.date}${p.meta_kg ? ` · meta ${p.meta_kg} kg` : ''}.`);
  else if (p.meta_kg) linhas.push(`Meta de peso: ${p.meta_kg} kg. Nenhum peso registrado ainda.`);
  if (t.kcal) {
    linhas.push(`Plano da Nutri Luciana publicado. Meta do dia: ${n0(t.kcal)} kcal, P ${n0(t.p)} g, C ${n0(t.c)} g, G ${n0(t.f)} g.`);
    const meals = dia.plano?.dia?.meals || [];
    if (meals.length) linhas.push(`Plano de hoje: ${meals.map((m) => `${ROTULO[m.slot] || m.slot} [${m.slot}] ${m.time || ''} ${bonito(m.name)} (${n0(m.kcal)} kcal${m.code ? `, receita ${m.code}` : ''})`).join(' · ')}.`);
  } else if (dia.estimativa?.kcal) {
    const e = dia.estimativa;
    linhas.push(`Sem plano publicado ainda. Faixa PROVISÓRIA do cadastro: ${e.kcal[0]} a ${e.kcal[1]} kcal, P ${e.p[0]} a ${e.p[1]} g, C ${e.c[0]} a ${e.c[1]} g, G ${e.f[0]} a ${e.f[1]} g. Diga que é provisório quando usar.`);
  } else linhas.push('Sem plano publicado e sem faixa de referência.');
  linhas.push(`Consumido hoje: ${n0(c.kcal)} kcal, P ${n0(c.p)} g, C ${n0(c.c)} g, G ${n0(c.f)} g. Água: ${n0(dia.water_ml)} ml.`);
  if (dia.entries.length) linhas.push(`Registrado hoje: ${dia.entries.map((e) => `${ROTULO[e.slot]}: ${(e.items || []).map((i) => `${i.name}${i.medida ? ` (${i.medida})` : ''}`).join(', ')}`).join(' · ')}.`);
  else linhas.push('Nada registrado hoje ainda.');
  const restr = Array.isArray(p.restricoes) ? p.restricoes.filter((x) => x !== 'nenhuma') : [];
  if (restr.length || p.alergias) linhas.push(`Restrições: ${restr.join(', ') || 'nenhuma'}${p.alergias ? ` · alergia: ${p.alergias}` : ''}. Nunca sugira nada com isso.`);
  if (p.indispensavel) linhas.push(`Ela não abre mão de: ${p.indispensavel}.`);
  if (contato.estado?.aguardando) linhas.push(`Você está esperando dela: ${contato.estado.aguardando}.`);
  return linhas.join('\n');
}

/** As últimas falas (dos dois lados), sem nada clínico nem da sessão humana. */
export async function historicoDaConversa(contatoId, limite = 14) {
  const { rows } = await getPool().query(
    `SELECT autor, texto, criado_em FROM whatsapp_mensagens
      WHERE contato_id = $1 AND criado_em > NOW() - interval '12 hours' AND NOT clinico AND NOT sessao_humana
        AND autor IN ('cliente', 'luna', 'sistema') AND tipo IN ('text', 'interactive', 'audio') AND texto IS NOT NULL AND texto <> ''
      ORDER BY criado_em DESC LIMIT $2`, [contatoId, limite]);
  return rows.reverse().map((m) => ({ role: m.autor === 'cliente' ? 'user' : 'assistant', content: m.texto.replace(/^\[áudio\] /, '').slice(0, 600) }));
}

/**
 * Uma rodada: monta o pedido, chama o modelo, manda o texto dele e executa as
 * ações que ele pediu (cada ação manda a própria mensagem).
 * `acoes` = { registrar_peso({kg}), registrar_refeicao({descricao, refeicao}), … } vem do bot.js.
 * Devolve o que aconteceu, pra log e teste.
 */
export async function conversar({ contato, texto, acoes, mandar }) {
  const [contexto, historico] = await Promise.all([contextoDaConversa(contato), historicoDaConversa(contato.id)]);
  if (!historico.length || historico[historico.length - 1].role !== 'user' || historico[historico.length - 1].content !== texto.slice(0, 600)) historico.push({ role: 'user', content: texto });
  const messages = [
    { role: 'system', content: MANUAL },
    { role: 'system', content: `CONTEXTO\n${contexto}` },
    ...historico,
  ];
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    tools: FERRAMENTAS,
    tool_choice: 'auto',
    temperature: 0.6,
    max_completion_tokens: 400,
  });
  const escolha = completion.choices?.[0]?.message || {};
  const fala = String(escolha.content || '').trim();
  const chamadas = Array.isArray(escolha.tool_calls) ? escolha.tool_calls : [];
  const feito = { fala, acoes: [] };
  if (fala) await mandar(contato, { texto: fala });
  for (const ch of chamadas) {
    const nome = ch.function?.name;
    let args = {};
    try { args = JSON.parse(ch.function?.arguments || '{}'); } catch { args = {}; }
    if (typeof acoes[nome] !== 'function') { console.warn('[luna] ação desconhecida:', nome); continue; }
    try { await acoes[nome](args); feito.acoes.push(nome); }
    catch (e) { console.error(`[luna] ação ${nome} falhou:`, e.message); await mandar(contato, { texto: 'Tentei fazer isso e deu um erro do meu lado. 😕 Pode tentar de novo daqui a pouco?' }); }
  }
  if (!fala && !chamadas.length) await mandar(contato, { texto: 'Não consegui pensar numa resposta agora. Pode perguntar de outro jeito?' });
  return feito;
}
