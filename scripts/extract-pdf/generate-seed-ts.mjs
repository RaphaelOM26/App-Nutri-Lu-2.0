// Lê o JSON estruturado e gera o arquivo TS final:
//   mobile/src/data/seedRecipes.ts
//
// Faz:
//   - Parse string → { quantity, unit, name } pra Ingredient[]
//   - Gera imageQuery (EN) baseado no título via heurística
//   - Estima category (Café/Almoço/Jantar/Lanche/Sobremesa) por keywords
//   - Estima time pelo número de passos (10/20/30/40min)
//   - IDs sequenciais r1...rN

import { readFile, writeFile } from 'node:fs/promises';

const INPUT = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/scripts/extract-pdf/dumps/recipes-structured.json';
const OUTPUT = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/mobile/src/data/seedRecipes.ts';

// ─── Parse de ingrediente: string → { quantity, unit, name } ─────
// Não é perfeito (PDF é caótico), mas suficiente pra UI mostrar.
function parseIngredient(line) {
  const trimmed = line.trim();
  // Match: número(opt. fração) + unidade + nome
  // Exemplos:
  //   "300g de frango"           → { quantity: '300', unit: 'g', name: 'frango' }
  //   "1 colher de sopa de mel"  → { quantity: '1', unit: 'colher de sopa', name: 'mel' }
  //   "2 xícaras de chá de leite"→ { quantity: '2', unit: 'xícaras de chá', name: 'leite' }
  //   "1/2 banana"               → { quantity: '1/2', unit: '', name: 'banana' }
  //   "Sal a gosto"              → { quantity: '', unit: '', name: 'Sal a gosto' }
  //   "Pimenta do reino"         → { quantity: '', unit: '', name: 'Pimenta do reino' }
  const qtyMatch = trimmed.match(/^(\d+(?:[,.]\d+)?(?:\s*\/\s*\d+)?|\d+\/\d+|[½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*(.*)$/);
  if (!qtyMatch) {
    return { quantity: '', unit: '', name: trimmed };
  }
  const quantity = qtyMatch[1].trim();
  let rest = qtyMatch[2].trim();

  // Unidade padrão (capture até "de" final)
  const unitMatch = rest.match(/^(g|kg|ml|l|unidades?|unid\.?|un|fatias?|colher\s+de\s+sopa|colher\s+de\s+chá|colher\s+de\s+sobremesa|colheres\s+de\s+sopa|colheres\s+de\s+chá|colheres|colher|xícaras?\s+de\s+chá|xícaras?|xíc\.?|copo|copos|pitadas?|pitada|porções?|porção|dente|dentes|maço|maços|punhado|gotas?|gota|lata|latas|caixas?|caixa|pacote|pacotes|pedaços?|pedaço)\s*(?:\(\s*[^)]*\s*\))?\s*(?:de\s+)?(.*)$/i);
  if (unitMatch) {
    return { quantity, unit: unitMatch[1].trim(), name: (unitMatch[2] || '').trim() || rest };
  }
  // Sem unidade reconhecida — chuta unit="" e usa o resto como nome
  return { quantity, unit: '', name: rest };
}

// ─── imageQuery em inglês baseada no título ─────────────────────
// Mesmo mapeamento que está no prompt do backend (mantém consistência).
const TITLE_TO_QUERY = [
  // ===== bebidas =====
  // NOTA: removido "green" das queries — token mapeava pra salada verde no FOOD_IMG_MAP.
  { match: /(suco|detox)/i, q: 'juice,detox,refreshing,glass' },
  { match: /(vitamina|smoothie|batida|shake)/i, q: 'smoothie,fruit,glass,food photography' },
  { match: /(sorvete|gelado|picol[ée])/i, q: 'cream,scoop,frozen,dessert' },
  { match: /(ch[áa])/i, q: 'tea,cup,herbal,warm' },
  { match: /(caf[ée])/i, q: 'coffee,latte,cup,morning' },

  // ===== sobremesas =====
  { match: /(pudim)/i, q: 'flan,caramel,dessert,brazilian' },
  { match: /(mousse)/i, q: 'mousse,chocolate,dessert' },
  { match: /(cheesecake)/i, q: 'cheesecake,berry,dessert,slice' },
  { match: /(brownie)/i, q: 'brownie,chocolate,fudge,square' },
  { match: /(cookie|biscoito|sequilho)/i, q: 'cookie,biscuit,homemade,baked' },
  { match: /(brigadeiro)/i, q: 'brigadeiro,chocolate truffle,brazilian' },
  { match: /(beijinho)/i, q: 'coconut truffle,brazilian,white' },
  { match: /(petit\s*gateau)/i, q: 'lava cake,chocolate,molten,dessert' },
  { match: /(panqueca)/i, q: 'pancake,stack,syrup,breakfast' },

  // ===== massas / pães =====
  { match: /(bolo)/i, q: 'cake,slice,homemade,baked' },
  { match: /(p[ãa]o\s+de\s+queijo)/i, q: 'brazilian cheese bread,pao de queijo' },
  { match: /(p[ãa]o)/i, q: 'bread,artisan,sliced,bakery' },
  { match: /(tapioca)/i, q: 'tapioca,brazilian,filled,crepe' },
  { match: /(pizza)/i, q: 'pizza,slice,cheese,oven' },
  { match: /(lasanha)/i, q: 'lasagna,baked,layered,italian' },
  { match: /(risoto)/i, q: 'risotto,creamy,plate,italian' },
  { match: /(macarr[ãa]o|espaguete|massa|talharim|penne)/i, q: 'pasta,plate,italian,food photography' },
  { match: /(nhoque)/i, q: 'gnocchi,potato,plate,italian' },
  { match: /(crepe|crepioca)/i, q: 'crepe,thin,filled,plate' },
  { match: /(waffle)/i, q: 'waffle,golden,syrup,breakfast' },
  { match: /(mu+ffin|cupcake)/i, q: 'muffin,baked,top,sweet' },
  { match: /(rap\s*10|wrap)/i, q: 'wrap,filled,rolled,lunch' },

  // ===== saladas / molhos =====
  { match: /(molho)/i, q: 'sauce,dressing,bowl,ingredients' },
  { match: /(salada)/i, q: 'salad,fresh,bowl,colorful' },

  // ===== sopas =====
  { match: /(sopa|caldo)/i, q: 'soup,bowl,steaming,brazilian' },

  // ===== proteínas =====
  { match: /(strogonoff|estrogonofe)/i, q: 'stroganoff,creamy,brazilian,rustic' },
  { match: /(parmegiana|parmegianna|parmigiana)/i, q: 'parmigiana,breaded,sauce,plate' },
  { match: /(frango)/i, q: 'chicken,grilled,plate,protein' },
  { match: /(carne\s+moida|carne\s+moída|hamb[úu]rguer)/i, q: 'ground beef,burger,plate' },
  { match: /(salm[ãa]o|peixe|til[áa]pia|atum)/i, q: 'fish,grilled,salmon,plate' },
  { match: /(camar[ãa]o)/i, q: 'shrimp,grilled,plate,seafood' },
  { match: /(carne|bife|fil[ée]|picanha|costela)/i, q: 'steak,grilled,plate,beef' },
  { match: /(ovo|omelete|frittata)/i, q: 'eggs,omelette,plate,breakfast' },
  { match: /(quibe)/i, q: 'kibbeh,meatball,brazilian,lebanese' },
  { match: /(almondega|alm[ôo]ndega)/i, q: 'meatball,plate,sauce' },
  { match: /(espetinho|espetin)/i, q: 'skewer,grilled,brazilian' },

  // ===== petiscos / snacks =====
  { match: /(coxinha)/i, q: 'coxinha,brazilian,fried,golden' },
  { match: /(croquete)/i, q: 'croquette,fried,golden,snack' },
  { match: /(bolinho)/i, q: 'fritter,ball,brazilian,snack' },
  { match: /(pastel|empad[a]?|empadinha)/i, q: 'pastry,brazilian,golden,baked' },
  { match: /(salgadinho|salgado)/i, q: 'savory pastry,snack,brazilian' },
  { match: /(brusqueta|bruschetta)/i, q: 'bruschetta,toast,topping,italian' },
  { match: /(fondue)/i, q: 'fondue,cheese,bread,dip' },
  { match: /(chips|crocante)/i, q: 'chips,crispy,snack,bowl' },
  { match: /(guacamole)/i, q: 'guacamole,avocado,bowl,dip' },
  { match: /(pat[êe])/i, q: 'pate,spread,bowl,bread' },

  // ===== acompanhamentos =====
  { match: /(polenta)/i, q: 'polenta,creamy,plate,italian' },
  { match: /(arroz)/i, q: 'rice,plate,brazilian' },
  { match: /(batata\s+doce)/i, q: 'sweet potato,roasted,plate' },
  { match: /(batata)/i, q: 'potato,roasted,plate' },
  { match: /(mandioca)/i, q: 'cassava,brazilian,plate' },
  { match: /(berinjela)/i, q: 'eggplant,roasted,plate' },
  { match: /(abobrinha)/i, q: 'zucchini,grilled,plate' },
  { match: /(milho)/i, q: 'corn,plate,kernels' },

  // ===== outras frutas =====
  { match: /(banana)/i, q: 'banana,fruit,plate,smoothie' },
  { match: /(morango)/i, q: 'strawberry,fresh,bowl' },
  { match: /(abacate)/i, q: 'avocado,plate,green' },
];

function pickImageQuery(title) {
  const lower = title.toLowerCase();
  for (const rule of TITLE_TO_QUERY) {
    if (rule.match.test(lower)) return rule.q;
  }
  // Fallback: usar o título "limpo" como query (sem garantia de bater)
  return 'food,plate,homemade,brazilian';
}

// ─── Categorização (tag) ───────────────────────────────────────
function pickCategory(title, collectionId) {
  const lower = title.toLowerCase();
  // Por coleção
  if (collectionId === 'lu-sobremesas') return 'Sobremesa';
  if (collectionId === 'lu-bolos') return 'Sobremesa';
  if (collectionId === 'lu-vitaminas') return 'Lanche';
  if (collectionId === 'lu-petiscos') return 'Lanche';
  if (collectionId === 'lu-saladas') return 'Almoço';
  if (collectionId === 'lu-detox') return 'Lanche';
  // Por palavra-chave no título
  if (/(café\s+da\s+manhã|panqueca|crepioca|aveia|tapioca|smoothie|vitamina|waffle|granola)/i.test(lower)) return 'Café';
  if (/(jantar|sopa|caldo)/i.test(lower)) return 'Jantar';
  if (/(lanche|salgadinho|petisco|wrap|sanduíche)/i.test(lower)) return 'Lanche';
  if (/(sobremesa|bolo|pudim|mousse|brigadeiro|brownie|cookie|biscoito|cheesecake|gateau)/i.test(lower)) return 'Sobremesa';
  return 'Almoço'; // default
}

// ─── Tempo estimado pelo número de passos ──────────────────────
function pickTime(steps) {
  if (steps.length <= 3) return '10min';
  if (steps.length <= 6) return '20min';
  if (steps.length <= 9) return '30min';
  return '40min';
}

// ─── Escapa string pra TS literal (template string seguro) ─────
function ts(s) {
  return '`' + String(s).replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
}

// ─── Main ──────────────────────────────────────────────────────
const raw = JSON.parse(await readFile(INPUT, 'utf-8'));
const recipes = raw.map((r, idx) => {
  const id = `r${idx + 1}`;
  const ingredients = r.ingredients.map(parseIngredient);
  const time = pickTime(r.steps);
  const tag = pickCategory(r.title, r.collectionId);
  const q = pickImageQuery(r.title);
  return {
    id,
    name: r.title,
    q,
    time,
    kcal: r.kcal || 0,
    tag,
    servings: r.servings || 1,
    ingredients,
    steps: r.steps,
    collectionId: r.collectionId,
  };
});

// Distribuição em coleções (recipeIds por coleção)
const colIds = {};
for (const r of recipes) {
  (colIds[r.collectionId] = colIds[r.collectionId] || []).push(r.id);
}

// Gera o arquivo TS
let out = `// AUTO-GENERATED — Não edite manualmente.
// Fonte: scripts/extract-pdf/generate-seed-ts.mjs (rode pra regenerar)
// Total: ${recipes.length} receitas curadas, anonimizadas dos PDFs originais.

import type { Ingredient } from '../api/client';

export type SeedRecipe = {
  /** ID estável (r1, r2, ...) */
  id: string;
  /** Nome em PT-BR */
  name: string;
  /** Query Unsplash em inglês */
  q: string;
  /** Tempo estimado pelo nº de passos (10/20/30/40min) */
  time: string;
  /** Kcal aproximado da receita inteira (NÃO por porção em muitos casos) */
  kcal: number;
  /** Café | Almoço | Jantar | Lanche | Sobremesa */
  tag: string;
  /** Porções (1 quando não foi possível extrair) */
  servings: number;
  /** Ingredientes parseados (quantity + unit + name) */
  ingredients: Ingredient[];
  /** Modo de preparo (já quebrado em passos) */
  steps: string[];
  /** ID da coleção da Lu (lu-saudaveis, lu-bolos, lu-saladas, etc.) */
  collectionId: string;
};

export const SEED_RECIPES: SeedRecipe[] = [
`;

for (const r of recipes) {
  out += `  {
    id: '${r.id}',
    name: ${ts(r.name)},
    q: ${ts(r.q)},
    time: '${r.time}',
    kcal: ${r.kcal},
    tag: '${r.tag}',
    servings: ${r.servings},
    ingredients: [
${r.ingredients.map((i) => `      { quantity: ${ts(i.quantity)}, unit: ${ts(i.unit)}, name: ${ts(i.name)} }`).join(',\n')}
    ],
    steps: [
${r.steps.map((s) => `      ${ts(s)}`).join(',\n')}
    ],
    collectionId: '${r.collectionId}',
  },
`;
}

out += `];

/** Mapa rápido por id pra lookup do RecipeDetail. */
export const SEED_RECIPES_BY_ID: Record<string, SeedRecipe> = Object.fromEntries(
  SEED_RECIPES.map((r) => [r.id, r]),
);

/** IDs de receitas por coleção da Lu (usado em luCollections.recipeIds). */
export const RECIPE_IDS_BY_COLLECTION: Record<string, string[]> = ${JSON.stringify(colIds, null, 2)};
`;

await writeFile(OUTPUT, out, 'utf-8');
console.log(`✓ Gerado: ${OUTPUT}`);
console.log(`  ${recipes.length} receitas`);
console.log(`  Tamanho: ${(out.length / 1024).toFixed(1)} KB`);
console.log(`  Distribuição:`);
for (const [k, v] of Object.entries(colIds)) console.log(`    ${k}: ${v.length}`);
