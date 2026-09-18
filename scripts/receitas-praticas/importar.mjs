// Importa o livro das receitas PRÁTICAS (PR) pro formato que a área de
// membros consome, gerando web/src/data/receitasPraticas.ts no repo
// nutri-lu-membros.
//
//   node scripts/receitas-praticas/importar.mjs             → gera o arquivo
//   node scripts/receitas-praticas/importar.mjs --relatorio → só o diagnóstico
//
// Fonte: Conteúdo/Receitas simples Nutri Lu - completa.xlsx (481 receitas),
// que sai do completar-planilha.mjs. Rode aquele antes deste quando os docs
// mudarem.
//
// A diferença pro importador do livro NL: aqui a planilha NÃO tem a coluna de
// restrições. Elas são DEDUZIDAS da lista de ingredientes, por dicionário —
// não por IA. O ingrediente vem com peso e nome explícito ("Queijo minas: 25 g"),
// então a dedução é sobre um fato verificável, não sobre um palpite.
//
// ⚠️ Regra de segurança que vale mais que a cobertura: quando um ingrediente
// é ambíguo pra uma restrição (aveia por contaminação cruzada, granola,
// industrializado), a tag daquela receita entra como CONDICIONAL, nunca como
// afirmação. E ingrediente que o dicionário não conhece derruba a afirmação
// inteira — melhor perder uma receita no filtro do que servir glúten pra quem
// não pode.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('../extract-pdf/node_modules/xlsx');

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PLANILHA = path.join(RAIZ, 'Conteúdo', 'Receitas simples Nutri Lu - completa.xlsx');
// O livro é consumido pela área de membros, que mora no outro repositório.
// Mesmo caminho relativo que o seed-demo.mjs já usa pras fotos.
const DESTINO = path.resolve(RAIZ, '..', 'Nutri Lu Membros', 'web', 'src', 'data', 'receitasPraticas.ts');
const RELATORIO = path.join(RAIZ, 'Conteúdo', 'relatorio-import-praticas.md');

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const texto = (v) => String(v ?? '').trim();
const num = (v) => { const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };

// ─── Refeições ─────────────────────────────────────────────────────────────
const REFEICAO = { 'cafe da manha': 'breakfast', almoco: 'lunch', 'lanche da tarde': 'snack', jantar: 'dinner' };

// ─── Dicionário de ingredientes ────────────────────────────────────────────
// Cada lista casa por SUBSTRING no nome normalizado do ingrediente. As
// exceções são checadas antes e desarmam o casamento (leite DE COCO não é
// laticínio; macarrão DE ARROZ não é trigo).
const LACTEOS = ['leite', 'queijo', 'muçarela', 'mucarela', 'ricota', 'cottage', 'requeijao', 'requeijão', 'cream cheese', 'parmesao', 'parmesão', 'iogurte', 'coalhada', 'whey', 'gorgonzola', 'feta', 'manteiga', 'nata', 'creme de leite'];
const LACTEOS_EXCECAO = ['leite de coco'];

const GLUTEN = ['trigo', 'pao', 'pão', 'macarrao', 'macarrão', 'massa', 'espaguete', 'penne', 'nhoque', 'torrada', 'wrap', 'tortilla', 'esfiha', 'quibe', 'cevadinha', 'cevada', 'centeio', 'cuscuz marroquino', 'farinha de trigo', 'biscoito', 'bolacha'];
const GLUTEN_EXCECAO = ['macarrao de arroz', 'macarrão de arroz', 'tortilhas de milho', 'tortilha de milho', 'pao de queijo', 'pão de queijo'];
// Ambíguos: NÃO afirmam glúten, mas impedem afirmar "sem glúten".
const GLUTEN_AMBIGUO = ['aveia', 'granola', 'farelo de aveia', 'flocos de milho', 'flocos de arroz', 'cuscuz'];

const CARNE = ['carne', 'patinho', 'lombo', 'frango', 'peito de peru', 'presunto', 'coxa', 'coracao', 'coração', 'moela', 'peixe', 'tilapia', 'tilápia', 'salmao', 'salmão', 'bacalhau', 'atum', 'sardinha', 'camarao', 'camarão', 'hamburguer', 'hambúrguer', 'almondega', 'almôndega', 'bife', 'suino', 'suíno'];
const OVO = ['ovo', 'ovos', 'clara', 'claras'];
const MEL = ['mel'];
const MEL_EXCECAO = ['melao', 'melão', 'melancia'];

const contem = (nome, lista, excecoes = []) => {
  const n = norm(nome);
  if (excecoes.some((e) => n.includes(norm(e)))) return false;
  return lista.some((t) => n.includes(norm(t)));
};

/** Ingrediente que o dicionário reconhece de alguma forma (pra medir cobertura). */
const NEUTROS = ['arroz', 'feijao', 'batata', 'mandioca', 'inhame', 'abobora', 'abobrinha', 'cenoura', 'tomate', 'alface', 'folha', 'salada', 'rucula', 'agriao', 'repolho', 'couve', 'brocolis', 'pepino', 'cebola', 'alho', 'pimentao', 'beterraba', 'chuchu', 'quiabo', 'vagem', 'berinjela', 'palmito', 'milho', 'ervilha', 'lentilha', 'grao-de-bico', 'grao de bico', 'edamame', 'quinoa', 'polenta', 'fuba', 'tapioca', 'goma', 'crepioca', 'banana', 'maca', 'mamao', 'manga', 'morango', 'uva', 'pera', 'pessego', 'laranja', 'tangerina', 'kiwi', 'abacaxi', 'abacate', 'melao', 'melancia', 'figo', 'fruta', 'romã', 'roma', 'chia', 'linhaca', 'gergelim', 'castanha', 'amendoa', 'amendoim', 'nozes', 'avela', 'pistache', 'semente', 'coco', 'cacau', 'cafe', 'azeite', 'oleo', 'vinagre', 'shoyu', 'mostarda', 'tahine', 'homus', 'hummus', 'sal', 'pimenta', 'oregano', 'manjericao', 'salsa', 'salsinha', 'cebolinha', 'cheiro-verde', 'hortela', 'tomilho', 'cominho', 'paprica', 'curry', 'gengibre', 'canela', 'cúrcuma', 'curcuma', 'acafrao', 'açafrão', 'ervas', 'limao', 'baunilha', 'fermento', 'agua', 'caldo', 'gelo', 'gelatina', 'tofu', 'cogumelo', 'alcachofra', 'azeitona', 'rabanete', 'radicchio', 'endivia', 'escarola', 'funcho', 'salsao', 'alho-poro', 'espinafre', 'couve-flor', 'couve-de-bruxelas', 'batata-doce', 'batata-baroa', 'mandioquinha', 'cevadinha', 'tomate seco', 'vinagrete', 'molho', 'granola', 'aveia', 'farelo', 'flocos', 'pasta de amendoim', 'leite de coco', 'za\'atar', 'zaatar', 'ervilha-torta', 'passas', 'maracuja', 'maracujá', 'polpa', 'suco', 'raspas', 'mix de legumes', 'legumes', 'tortilhas', 'wrap10', 'trigo'];
const conhecido = (nome) => contem(nome, [...LACTEOS, ...GLUTEN, ...GLUTEN_AMBIGUO, ...CARNE, ...OVO, ...MEL, ...NEUTROS]);

// ─── Receitas com erro de conteúdo na origem ───────────────────────────────
// Quatro preparações doces listam "Tomate" onde quase certamente era "Ovo":
// trocando um pelo outro, a soma dos ingredientes passa a bater com os macros
// declarados (PR-082: 236→299 kcal contra 305 declarados; proteína 16→22
// contra 23). O erro está nos docs de origem, não na importação.
//
// Decisão do Raphael em 16/09: sair do livro até a nutricionista confirmar.
// São 4 de 481 e o risco não compensa — com ovo, a PR-057 deixaria de ser
// vegana e um plano vegano receberia ovo escondido.
//
// ⚠️ Isto NÃO conserta o doc, que é onde o erro mora. Quando ela confirmar,
// troque `fora: true` por `trocar: { de: 'Tomate', para: 'Ovo' }` na linha
// correspondente e a receita volta já corrigida — por isso a lista guarda o
// ingrediente e o motivo, em vez de ser só uma lista de ids.
const PROBLEMAS = {
  'PR-057': { ingrediente: 'Tomate', fora: true },
  'PR-066': { ingrediente: 'Tomate', fora: true },
  'PR-082': { ingrediente: 'Tomate', fora: true },
  'PR-100': { ingrediente: 'Tomate', fora: true },
};

// ─── Tipo de prato (mesma inferência do livro NL) ──────────────────────────
function inferirTipo(nome, refeicao) {
  const n = norm(nome);
  const almocoOuJantar = /almoco|jantar/.test(norm(refeicao));
  if (/^(vitamina|smoothie|shake)\s/.test(n)) return 'bebida';
  if (/^cha\s/.test(n)) return 'bebida';
  if (/^salada\b/.test(n)) return 'salada';
  if (/^(sopa|caldo)\b/.test(n)) return 'sopa';
  if (/^creme\b/.test(n)) return almocoOuJantar ? 'sopa' : 'sobremesa';
  if (/^(mingau|overnight|aveia dormida)\b/.test(n)) return 'mingau';
  if (/^(pudim|mousse|sorvete|gelatina|creme gelado)\b/.test(n)) return 'sobremesa';
  if (/^bolo\b/.test(n)) return 'bolo';
  return 'prato';
}

// ─── Ingredientes ──────────────────────────────────────────────────────────
// Formatos da planilha (medidos): "Nome: 160 g", "Nome: 160 g — 1 pote",
// "Ovo: 1 unidade média — cerca de 50 g sem casca", "Canela: a gosto".
// O peso em GRAMAS é o que importa: é dele que sai a soma do diário.
function parseIngrediente(linha) {
  const i = linha.indexOf(':');
  if (i < 0) return { quantity: '', unit: '', name: linha.trim() };
  const name = linha.slice(0, i).trim();
  const resto = linha.slice(i + 1).trim();
  // Peso em g/ml em qualquer posição do resto; "cerca de" e "aproximadamente" toleradas.
  const m = resto.match(/(?:cerca de|aproximadamente|~)?\s*(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  if (m) return { quantity: m[1].replace(',', '.'), unit: m[2].toLowerCase(), name };
  return { quantity: '', unit: '', name };
}

// ─── Importação ────────────────────────────────────────────────────────────
const todasLinhas = XLSX.utils.sheet_to_json(XLSX.readFile(PLANILHA).Sheets['Receitas PR'], { defval: '' });
const avisos = [];
const desconhecidos = new Map();
const removidas = [];

// Receitas com erro de conteúdo saem antes de qualquer processamento: não
// entram no arquivo, não entram no plano, não entram na busca.
const linhas = todasLinhas.filter((r) => {
  const p = PROBLEMAS[texto(r.ID)];
  if (!p?.fora) return true;
  removidas.push(`${texto(r.ID)} ${texto(r['Nome da receita'])} — "${p.ingrediente}" numa preparação doce; os macros batem se for ovo`);
  return false;
});

const receitas = linhas.map((r) => {
  const id = texto(r.ID);
  const nome = texto(r['Nome da receita']);
  const refeicaoBruta = texto(r['Refeição(ões)']);
  const meal = REFEICAO[norm(refeicaoBruta)];
  if (!meal) avisos.push(`${id}: refeição não mapeada ("${refeicaoBruta}")`);

  const brutos = texto(r['Ingredientes padronizados']).split('\n').map((x) => x.trim()).filter(Boolean);
  const ingredients = brutos.map(parseIngrediente);
  const nomes = ingredients.map((x) => x.name);

  // Restrições deduzidas. Cada uma tem 3 estados: afirmada, condicional, ausente.
  const tags = [];
  const tagsCondicionais = [];
  const ressalvas = [];

  const naoConhecidos = nomes.filter((n) => !conhecido(n));
  for (const n of naoConhecidos) desconhecidos.set(n, (desconhecidos.get(n) || 0) + 1);
  const suspeita = PROBLEMAS[id] && !PROBLEMAS[id].fora ? PROBLEMAS[id].ingrediente : null;
  const tudoConhecido = naoConhecidos.length === 0 && !suspeita;
  if (suspeita) {
    avisos.push(`${id}: "${suspeita}" a confirmar — restrições rebaixadas pra condicional`);
  }

  const temLactose = nomes.some((n) => contem(n, LACTEOS, LACTEOS_EXCECAO));
  const temGluten = nomes.some((n) => contem(n, GLUTEN, GLUTEN_EXCECAO));
  const glutenAmbiguo = nomes.some((n) => contem(n, GLUTEN_AMBIGUO));
  const temCarne = nomes.some((n) => contem(n, CARNE));
  const temOvo = nomes.some((n) => contem(n, OVO));
  const temMel = nomes.some((n) => contem(n, MEL, MEL_EXCECAO));

  const por = (cond, tag, motivo) => {
    if (!cond) return;
    if (tudoConhecido) tags.push(tag);
    else { tagsCondicionais.push(tag); if (motivo) ressalvas.push(motivo); }
  };
  por(!temLactose, 'Sem lactose', null);
  if (!temGluten && glutenAmbiguo) {
    tagsCondicionais.push('Sem glúten');
    ressalvas.push('Leva aveia ou granola: sem glúten só com produto certificado.');
  } else {
    por(!temGluten, 'Sem glúten', null);
  }
  por(!temCarne, 'Vegetariana', null);
  por(!temCarne && !temOvo && !temLactose && !temMel, 'Vegana', null);
  if (naoConhecidos.length) ressalvas.push(`Restrições não confirmadas: ingrediente fora do dicionário (${naoConhecidos.join(', ')}).`);
  if (suspeita) ressalvas.push(`Ingrediente a confirmar com a nutricionista ("${suspeita}"): as restrições desta receita não estão afirmadas.`);

  const macros = {
    kcal: num(r['Calorias (kcal/porção)']) ?? 0,
    p: num(r['Proteínas (g/porção)']) ?? 0,
    c: num(r['Carboidratos (g/porção)']) ?? 0,
    f: num(r['Gorduras (g/porção)']) ?? 0,
  };
  const fibra = num(r['Fibras (g/porção)']);
  if (fibra != null) macros.fiber = fibra;
  if (!macros.kcal) avisos.push(`${id}: sem kcal — não entra no plano`);

  return {
    id,
    name: nome,
    tipo: inferirTipo(nome, refeicaoBruta),
    meals: meal ? [meal] : [],
    tags,
    tagsCondicionais,
    ressalvas,
    // A planilha não traz tempo nem dificuldade. Inventar seria pior que
    // deixar vazio: o card sabe exibir "—".
    time: '—',
    servings: 1,
    ingredients,
    steps: texto(r['Modo de preparo']).split('\n').map((x) => x.trim()).filter(Boolean),
    macros,
    ...(texto(r['Substituições']) ? { substituicoes: texto(r['Substituições']) } : {}),
  };
});

// ─── Relatório ─────────────────────────────────────────────────────────────
const conta = (f) => receitas.filter(f).length;
const porTag = {};
for (const r of receitas) { for (const t of r.tags) porTag[t] = porTag[t] || [0, 0]; for (const t of r.tagsCondicionais) porTag[t] = porTag[t] || [0, 0]; }
for (const r of receitas) { for (const t of r.tags) porTag[t][0]++; for (const t of r.tagsCondicionais) porTag[t][1]++; }
const porMeal = {};
for (const r of receitas) for (const m of r.meals) porMeal[m] = (porMeal[m] || 0) + 1;
const porTipo = {};
for (const r of receitas) porTipo[r.tipo] = (porTipo[r.tipo] || 0) + 1;

const md = [
  `# Importação das receitas práticas (${new Date().toISOString().slice(0, 10)})`, '',
  `- Receitas: **${receitas.length}** (${removidas.length} fora por erro de conteúdo na origem)`,
  `- Sem kcal: ${conta((r) => !r.macros.kcal)} · sem refeição: ${conta((r) => !r.meals.length)} · sem ingrediente: ${conta((r) => !r.ingredients.length)} · sem preparo: ${conta((r) => !r.steps.length)}`,
  `- Ingredientes: ${receitas.reduce((a, r) => a + r.ingredients.length, 0)} (${receitas.reduce((a, r) => a + r.ingredients.filter((i) => !i.quantity).length, 0)} sem peso = tempero a gosto)`,
  `- Por refeição: ${Object.entries(porMeal).map(([k, v]) => `${k}=${v}`).join(' · ')}`,
  `- Por tipo: ${Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' · ')}`,
  `- Receitas com ingrediente fora do dicionário: **${conta((r) => r.ressalvas.some((x) => x.includes('fora do dicionário')))}**`, '',
  '## Restrições deduzidas dos ingredientes', '',
  '| Restrição | Afirmada | Condicional |', '|---|---|---|',
  ...Object.entries(porTag).sort((a, b) => b[1][0] - a[1][0]).map(([t, [a, c]]) => `| ${t} | ${a} | ${c} |`), '',
  '> Afirmada = todos os ingredientes reconhecidos e nenhum ambíguo.',
  '> Condicional = tem aveia/granola (contaminação cruzada) ou ingrediente desconhecido.',
  '> A dedução é por dicionário sobre a lista de ingredientes, nunca por IA.', '',
  '## Ingredientes fora do dicionário',
  ...(desconhecidos.size ? [...desconhecidos.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => `- ${n} (${c}x)`) : ['- nenhum']), '',
  '## Fora do livro — erro de conteúdo a corrigir NO DOC de origem',
  ...(removidas.length ? removidas.map((x) => `- ${x}`) : ['- nenhuma']), '',
  '> Corrigir o doc devolve a receita na próxima importação. Enquanto o doc',
  '> não mudar, ela fica fora do app mas continua errada no material impresso.', '',
  '## Avisos', ...(avisos.length ? avisos.map((a) => `- ${a}`) : ['- nenhum']), '',
].join('\n');
fs.writeFileSync(RELATORIO, md);
console.log(md.split('\n').slice(0, 20).join('\n'));

if (process.argv.includes('--relatorio')) { console.log(`\nrelatório: ${RELATORIO}`); process.exit(0); }

// ─── Geração ───────────────────────────────────────────────────────────────
const conteudo = `// AUTO-GERADO por scripts/receitas-praticas/importar.mjs no repo do app.
// Fonte: Conteúdo/Receitas simples Nutri Lu - completa.xlsx — NÃO EDITE À MÃO.
//
// O SEGUNDO livro: receitas práticas do dia a dia (códigos PR). É daqui que
// saem as sugestões do gerador de plano e as trocas de refeição da cliente.
// O livro da nutricionista (NL, 407 receitas) fica pra quem quer cozinhar
// algo mais elaborado e NÃO entra nessas duas coisas.
//
// ⚠️ As restrições foram DEDUZIDAS da lista de ingredientes por dicionário
// (nunca por IA). \`tags\` = afirmada, todos os ingredientes reconhecidos;
// \`tagsCondicionais\` = depende do rótulo (aveia, granola). O filtro do plano
// usa só \`tags\`.
//
// ${receitas.length} receitas. Rode o script de novo quando a planilha mudar.

import type { NutriRecipe } from './nutriRecipes';

export const RECEITAS_PRATICAS: NutriRecipe[] = ${JSON.stringify(receitas, null, 2)};

export const PRATICAS_POR_CODIGO: Record<string, NutriRecipe> = Object.fromEntries(
  RECEITAS_PRATICAS.map((r) => [r.id, r]),
);
`;
fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
fs.writeFileSync(DESTINO, conteudo);
console.log(`\n✔ ${receitas.length} receitas → ${DESTINO}`);

// O servidor também precisa do livro (aprovação em lote: o gerador roda lá).
// Só o que o gerador usa: sem passos, conservação e substituições.
const DESTINO_JSON = path.resolve(RAIZ, 'backend', 'data', 'receitas-praticas.json');
fs.mkdirSync(path.dirname(DESTINO_JSON), { recursive: true });
fs.writeFileSync(DESTINO_JSON, JSON.stringify(receitas.map((r) => ({
  id: r.id, name: r.name, tipo: r.tipo, meals: r.meals, tags: r.tags, time: r.time, servings: r.servings,
  ingredients: r.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit })), macros: r.macros,
}))));
console.log(`✔ livro pro servidor → ${DESTINO_JSON}`);
console.log(`  relatório: ${RELATORIO}`);
