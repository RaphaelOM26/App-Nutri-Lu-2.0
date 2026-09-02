// Importa o livro de receitas da nutri (planilha em Conteúdo/) para o formato
// que o app consome, gerando mobile/src/data/nutriRecipes.ts.
//
//   node scripts/fotos/importar-receitas.mjs            → gera o arquivo
//   node scripts/fotos/importar-receitas.mjs --relatorio → só o diagnóstico
//
// Por que um importador e não uma planilha normalizada: a nutri continua
// escrevendo do jeito dela ("Rica em proteínas", "Almoço ou jantar",
// `Sem glúten*`) e é o código que normaliza. Assim ela não precisa aprender
// esquema novo, e quando adicionar a receita 154 basta rodar de novo.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('../extract-pdf/node_modules/xlsx');

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '../..');
const PLANILHA = path.join(RAIZ, 'Conteúdo', 'Receitas nutri Lu.xlsx');
const DESTINO = path.join(RAIZ, 'mobile', 'src', 'data', 'nutriRecipes.ts');

const avisos = [];
const aviso = (id, msg) => avisos.push(`${id}: ${msg}`);

// ─── Refeições ─────────────────────────────────────────────────────────────
// A planilha usa 27 termos onde o app tem 6 categorias. O mapa abaixo faz a
// tradução; termo que não é horário (Molho, Bebida, Acompanhamento) devolve
// null de propósito — ele descreve o TIPO do prato, não quando se come.
const REFEICAO_PARA_CATEGORIA = {
  'café da manhã': 'breakfast',
  brunch: 'breakfast',
  almoço: 'lunch',
  'almoço rápido': 'lunch',
  jantar: 'dinner',
  'jantar leve': 'dinner',
  'jantar rápido': 'dinner',
  lanche: 'snack',
  ceia: 'snack',
  petisco: 'snack',
  aperitivo: 'snack',
  'pré-treino': 'snack',
  'pós-treino': 'snack',
  'pré ou pós-treino': 'snack',
  sobremesa: 'dessert',
  // Termos que apareceram no lote de 407 (ago/2026). "Ao longo do dia" e
  // "Bebida noturna" descrevem QUANDO se come, então mapeiam; "Fim de semana"
  // sozinho não é horário e continua fora de propósito.
  'ao longo do dia': 'snack',
  'bebida noturna': 'snack',
  'petisco de fim de semana': 'snack',
  'sobremesa de fim de semana': 'dessert',
};

// ─── Tags ──────────────────────────────────────────────────────────────────
// Só 6 sobrevivem (decisão do Raphael). O resto vira palavra-chave de busca.
// A forma CONDICIONAL (asterisco, "Pode ser…") é uma tag à parte: prometer
// "sem glúten" numa receita que depende de farinha certificada é promessa que
// a receita não cumpre.
const TAGS = [
  { tag: 'Vegetariana', re: /vegetarian/i },
  { tag: 'Vegana', re: /vegan[oa]/i },
  { tag: 'Sem glúten', re: /sem gl[úu]ten/i },
  { tag: 'Sem lactose', re: /sem lactose/i },
  { tag: 'Rico em proteínas', re: /ric[oa] em proteínas|fonte de proteínas/i },
  { tag: 'Rico em fibras', re: /ric[oa] em fibras|fonte de fibras/i },
];
const EH_CONDICIONAL = /\*|^pode ser|desde que|quando prepara/i;

// Veganas confirmadas por varredura de ingredientes (nenhum item animal).
// As 3 com industrializado ambíguo entram como condicional — o rótulo do
// produto decide, e isso a planilha não sabe.
const VEGANAS = ['NL-006', 'NL-008', 'NL-104', 'NL-105', 'NL-106', 'NL-107', 'NL-108', 'NL-110'];
const VEGANAS_CONDICIONAIS = ['NL-061', 'NL-070', 'NL-093'];

// ─── Tipo de prato ─────────────────────────────────────────────────────────
// Mesma inferência usada no gerador de fotos — os nomes da planilha são
// regulares o bastante. Cuidado: `\b` depois de letra acentuada nunca casa em
// JS ("á" não é caractere de palavra), por isso `\s` no chá.
function inferirTipo(nome, refeicaoBruta) {
  const almocoOuJantar = /almoço|jantar/i.test(refeicaoBruta);
  if (/^chá\s/i.test(nome)) return 'bebida';
  // Refresco, vitamina e água saborizada são bebida igual ao chá — pro app não
  // importa se é quente ou gelada (o gerador de fotos é que separa as duas).
  if (/^(refresco|suco|limonada|vitamina|smoothie|shake)\s/i.test(nome)) return 'bebida';
  if (/^(água|agua) saborizada\s/i.test(nome)) return 'bebida';
  if (/^molho\b/i.test(nome)) return 'molho';
  if (/^salada\b/i.test(nome)) return 'salada';
  if (/^(sopa|creme)\b/i.test(nome)) return almocoOuJantar ? 'sopa' : 'sobremesa';
  if (/^(mingau|overnight|baked oats)\b/i.test(nome)) return 'mingau';
  if (/^(pudim|flan|sorvete|mousse)\b/i.test(nome)) return 'sobremesa';
  if (/^bolo\b/i.test(nome)) return 'bolo';
  if (/sobremesa/i.test(refeicaoBruta)) return 'sobremesa';
  if (/petisco|aperitivo/i.test(refeicaoBruta)) return 'petisco';
  return 'prato';
}

// ─── Utilidades de texto ───────────────────────────────────────────────────
const vazio = (v) => v == null || String(v).trim() === '' || String(v).trim().toLowerCase() === 'null';
const texto = (v) => (vazio(v) ? '' : String(v).trim());
const num = (v) => (vazio(v) ? null : Number(String(v).replace(',', '.')));
const partes = (v) => texto(v).split(/[•;|]/).map((x) => x.trim()).filter(Boolean);

/**
 * Converte uma linha de ingrediente da planilha em { quantity, unit, name }.
 *
 * A planilha escreve "1 xícara (chá) de manga madura em cubos (165 g)". O peso
 * entre parênteses no FIM é o número que a nutri pesou — usá-lo como quantidade
 * torna a soma de gramas exata, em vez de deixar o parseToGrams do app adivinhar
 * ("1 xícara = 200 g" fixo, o que transformaria 15 g de salsa em 50 g).
 */
function parseIngrediente(linha) {
  // Peso entre parênteses em QUALQUER posição da linha, tolerando "aproximadamente"
  // e faixas ("30 a 60 ml" → usa o piso, que é o conservador pro cálculo).
  // Exigir que estivesse no fim perdia "1 pote de Cottage (200 g) ou 200 g de
  // ricota"; não aceitar o advérbio perdia "(aproximadamente 340 g)".
  const m = linha.match(
    /\(\s*(?:aproximadamente|cerca de|~)?\s*(\d+(?:[.,]\d+)?)(?:\s*a\s*\d+(?:[.,]\d+)?)?\s*(g|ml|kg|l)\s*\)/i,
  );
  if (m) {
    const nome = (linha.slice(0, m.index) + linha.slice(m.index + m[0].length))
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/^[,;]|[,;]$/g, '')
      .trim();
    return { quantity: m[1].replace(',', '.'), unit: m[2].toLowerCase(), name: nome };
  }
  // "200 g de aveia" — peso no começo, sem parênteses.
  const inicio = linha.match(/^(\d+(?:[.,]\d+)?)\s*(g|ml|kg|l)\s+(?:de\s+)?(.+)$/i);
  if (inicio) {
    return { quantity: inicio[1].replace(',', '.'), unit: inicio[2].toLowerCase(), name: inicio[3].trim() };
  }
  // Sem peso: tempero a gosto, folha pra decorar. Fica sem quantidade — e o
  // cálculo do app trata como 0, que é o correto pra sal e pimenta.
  return { quantity: '', unit: '', name: linha };
}

/**
 * Linha que é TÍTULO de seção ("Massa", "Recheio"), não ingrediente.
 *
 * Um parêntese desqualifica: "Orégano (opcional)" e "Hortelã picada (opcional)"
 * são ingredientes de verdade e a primeira versão deste heurístico os
 * descartava junto com os títulos.
 */
const ehSecao = (linha) =>
  !/\d/.test(linha) &&
  !linha.includes('(') &&
  linha.split(/\s+/).length <= 3 &&
  !/gosto/i.test(linha);

/**
 * Linha que é NOTA de rodapé dentro da célula de ingredientes, não ingrediente.
 * A planilha embute frases como "Para a padronização da receita e o cálculo
 * nutricional, foi considerada…" no meio da lista — se entrassem, virariam um
 * item de receita com nome de parágrafo.
 */
const ehNota = (linha) =>
  /padroniza[çc][ãa]o|c[áa]lculo nutricional|foi considerad|observa[çc][ãa]o:/i.test(linha);

function main() {
  const wb = XLSX.readFile(PLANILHA);
  const linhas = XLSX.utils.sheet_to_json(wb.Sheets['Receitas_App'], { defval: null });

  const receitas = linhas.map((r) => {
    const id = texto(r['ID']);
    const nome = texto(r['Nome da receita']);
    const refeicaoBruta = texto(r['Refeição(ões)']);
    const catBruta = texto(r['Categorias / restrições']);

    // Refeições → categorias do app, sem repetir
    const meals = [];
    const naoMapeados = [];
    for (const termo of partes(refeicaoBruta.replace(/\s+ou\s+/gi, ' • ').replace(/\s+e\s+acompanhamentos/gi, ''))) {
      const cat = REFEICAO_PARA_CATEGORIA[termo.toLowerCase()];
      if (cat) {
        if (!meals.includes(cat)) meals.push(cat);
      } else naoMapeados.push(termo);
    }
    if (meals.length === 0) aviso(id, `sem refeição mapeável (planilha diz "${refeicaoBruta}")`);

    // Tags: absolutas e condicionais separadas
    const tags = [];
    const tagsCondicionais = [];
    for (const termo of partes(catBruta)) {
      for (const t of TAGS) {
        if (!t.re.test(termo)) continue;
        const alvo = EH_CONDICIONAL.test(termo) ? tagsCondicionais : tags;
        if (!alvo.includes(t.tag)) alvo.push(t.tag);
      }
    }
    if (VEGANAS.includes(id) && !tags.includes('Vegana')) tags.push('Vegana');
    if (VEGANAS_CONDICIONAIS.includes(id) && !tagsCondicionais.includes('Vegana')) tagsCondicionais.push('Vegana');
    // Uma tag não pode ser absoluta e condicional ao mesmo tempo — a absoluta ganha.
    const condicionaisLimpas = tagsCondicionais.filter((t) => !tags.includes(t));

    // Ressalvas: o texto do asterisco, que na planilha vaza colado na tag
    const ressalvas = partes(catBruta)
      .filter((t) => /desde que|quando prepara|utilizar|conferir|substituindo/i.test(t))
      .map((t) => t.replace(/^[^A-ZÀ-Ú]*/, '').trim());

    // Ingredientes
    const brutos = texto(r['Ingredientes padronizados']).split('\n').map((x) => x.trim()).filter(Boolean);
    const secoes = brutos.filter(ehSecao);
    const notas = brutos.filter(ehNota);
    const ingredients = brutos.filter((l) => !ehSecao(l) && !ehNota(l)).map(parseIngrediente);
    if (notas.length) aviso(id, `${notas.length} nota(s) de rodapé removida(s) dos ingredientes`);
    if (secoes.length) aviso(id, `${secoes.length} título(s) de seção descartado(s): ${secoes.join(', ')}`);
    const semPeso = ingredients.filter((i) => !i.quantity).length;

    const steps = texto(r['Modo de preparo']).split('\n').map((x) => x.trim()).filter(Boolean);

    // Rendimento → nº de porções
    const rend = texto(r['Rendimento']);
    const servings = Math.max(1, parseInt((rend.match(/(\d+)/) || [])[1] || '1', 10));

    // "Não informado" em 81 receitas do lote de 407. Sem isso o card exibiria
    // a frase inteira no lugar do tempo ("145 kcal · Não informado").
    const tempo = /não informado|nao informado/i.test(texto(r['Tempo de preparo']))
      ? ''
      : texto(r['Tempo de preparo']);
    const min = (tempo.match(/(\d+)/) || [])[1];

    // Macros medidos, por porção. Faltando vira 0: o app já trata ausente como
    // zero, e nos 15 chás isso é o valor real de qualquer forma.
    const kcal = num(r['Calorias (kcal/porção)']);
    if (kcal == null) aviso(id, 'sem kcal — receita não entra no plano alimentar');
    const macros = {
      kcal: kcal ?? 0,
      p: num(r['Proteínas (g/porção)']) ?? 0,
      c: num(r['Carboidratos (g/porção)']) ?? 0,
      f: num(r['Gorduras (g/porção)']) ?? 0,
      fiber: num(r['Fibras (g/porção)']) ?? undefined,
    };

    return {
      id,
      name: nome,
      tipo: inferirTipo(nome, refeicaoBruta),
      meals,
      tags,
      tagsCondicionais: condicionaisLimpas,
      ressalvas,
      time: min ? `${min}min` : tempo || '—',
      servings,
      ingredients,
      steps,
      macros,
      conservacao: texto(r['Conservação']) || undefined,
      substituicoes: texto(r['Substituições']) || undefined,
      _diag: { naoMapeados, semPeso, secoes: secoes.length },
    };
  });

  // ── Relatório ────────────────────────────────────────────────────────────
  const conta = (f) => receitas.reduce((a, r) => a + (f(r) ? 1 : 0), 0);
  console.log(`\n${receitas.length} receitas lidas`);
  console.log(`  sem refeição mapeável: ${conta((r) => r.meals.length === 0)}`);
  console.log(`  sem nenhuma tag:       ${conta((r) => r.tags.length === 0 && r.tagsCondicionais.length === 0)}`);
  console.log(`  sem kcal:              ${conta((r) => !r.macros.kcal)}`);
  console.log(`  com ressalva:          ${conta((r) => r.ressalvas.length > 0)}`);
  const porTipo = {};
  for (const r of receitas) porTipo[r.tipo] = (porTipo[r.tipo] || 0) + 1;
  console.log('  tipos:', Object.entries(porTipo).map(([k, v]) => `${k}=${v}`).join(' '));
  const porTag = {};
  for (const r of receitas) for (const t of [...r.tags, ...r.tagsCondicionais]) porTag[t] = (porTag[t] || 0) + 1;
  console.log('  tags: ', Object.entries(porTag).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' | '));
  const porMeal = {};
  for (const r of receitas) for (const m of r.meals) porMeal[m] = (porMeal[m] || 0) + 1;
  console.log('  meals: ', Object.entries(porMeal).map(([k, v]) => `${k}=${v}`).join(' '));
  const ingTotal = receitas.reduce((a, r) => a + r.ingredients.length, 0);
  const ingSemPeso = receitas.reduce((a, r) => a + r._diag.semPeso, 0);
  console.log(`  ingredientes: ${ingTotal} (${ingSemPeso} sem peso = temperos a gosto)`);

  if (process.argv.includes('--relatorio')) {
    console.log(`\n${avisos.length} avisos:`);
    for (const a of avisos.slice(0, 40)) console.log('   ' + a);
    if (avisos.length > 40) console.log(`   ... e mais ${avisos.length - 40}`);
    return;
  }

  // ── Geração do arquivo ───────────────────────────────────────────────────
  const limpo = receitas.map(({ _diag, ...r }) => r);
  const conteudo = `// AUTO-GERADO por scripts/fotos/importar-receitas.mjs — NÃO EDITE À MÃO.
// Fonte: Conteúdo/Receitas nutri Lu.xlsx (livro oficial da nutricionista).
// ${receitas.length} receitas. Rode o script de novo quando a planilha mudar.

import type { Ingredient, DeclaredMacros, MealCategory } from '../api/client';

/** Tipo de prato — define a coleção na aba Receitas e o enquadramento da foto. */
export type TipoPrato =
  | 'prato' | 'salada' | 'bebida' | 'molho' | 'sopa'
  | 'petisco' | 'mingau' | 'sobremesa' | 'bolo';

/** As 6 tags que sobreviveram da planilha (decisão de 2026-08-18). */
export type TagReceita =
  | 'Vegetariana' | 'Vegana' | 'Sem glúten'
  | 'Sem lactose' | 'Rico em proteínas' | 'Rico em fibras';

export type NutriRecipe = {
  /** Código do livro (NL-001…). NUNCA renumerar: é a chave do plano da nutri. */
  id: string;
  name: string;
  tipo: TipoPrato;
  /** Refeições em que cabe. Vazio = não é refeição (molho, acompanhamento). */
  meals: MealCategory[];
  /** Tags afirmadas sem ressalva. */
  tags: TagReceita[];
  /** Tags que dependem do rótulo do produto — exibir com ressalva, nunca como
   *  equivalentes às absolutas. */
  tagsCondicionais: TagReceita[];
  ressalvas: string[];
  time: string;
  /** Quantas porções a receita rende. */
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  /** Macros MEDIDOS pela nutri, por porção. */
  macros: DeclaredMacros;
  conservacao?: string;
  substituicoes?: string;
};

export const NUTRI_RECIPES: NutriRecipe[] = ${JSON.stringify(limpo, null, 2)};

export const NUTRI_RECIPES_BY_ID: Record<string, NutriRecipe> = Object.fromEntries(
  NUTRI_RECIPES.map((r) => [r.id, r]),
);
`;

  fs.writeFileSync(DESTINO, conteudo);
  const kb = Math.round(fs.statSync(DESTINO).size / 1024);
  console.log(`\ngerado: mobile/src/data/nutriRecipes.ts (${kb} KB)`);

  // ── Mapa de fotos ────────────────────────────────────────────────────────
  // O Metro (bundler do React Native) resolve require() em tempo de build e só
  // aceita caminho literal — não dá pra montar `require('...' + id + '.jpg')`.
  // Por isso o mapa é gerado com uma chamada escrita por extenso pra cada foto.
  const ASSETS = path.join(RAIZ, 'mobile', 'assets', 'receitas');
  const MAPA = path.join(RAIZ, 'mobile', 'src', 'data', 'nutriPhotos.ts');
  if (fs.existsSync(ASSETS)) {
    const comFoto = receitas.filter((r) => fs.existsSync(path.join(ASSETS, `${r.id}.jpg`)));
    const semFoto = receitas.length - comFoto.length;
    const linhasMapa = comFoto
      .map((r) => `  '${r.id}': require('../../assets/receitas/${r.id}.jpg'),`)
      .join('\n');
    fs.writeFileSync(
      MAPA,
      `// AUTO-GERADO por scripts/fotos/importar-receitas.mjs — NÃO EDITE À MÃO.
// Fotos das receitas do livro, geradas por scripts/fotos/gerar-fotos.mjs
// (estilo "mesa de casa") e reduzidas a 800px por scripts/fotos/redimensionar.ps1.
//
// Empacotadas com o app em vez de servidas por URL: o app é usado na hora da
// refeição, às vezes sem sinal, e assim a foto não depende de rede nem do
// backend estar de pé. São ~8 MB no bundle para as ${comFoto.length}.
//
// O Metro exige caminho literal no require(), então o mapa é escrito por
// extenso — não dá pra interpolar o id.

export const NUTRI_PHOTOS: Record<string, number> = {
${linhasMapa}
};

/** Foto da receita, ou undefined se ela ainda não tiver imagem gerada. */
export function fotoDaReceita(id: string): number | undefined {
  return NUTRI_PHOTOS[id];
}
`,
    );
    console.log(`gerado: mobile/src/data/nutriPhotos.ts (${comFoto.length} fotos${semFoto ? `, ${semFoto} receita(s) sem foto` : ''})`);
  } else {
    console.log('mobile/assets/receitas não existe — mapa de fotos não gerado');
  }

  console.log(`${avisos.length} avisos — rode com --relatorio pra ver`);
}

main();
