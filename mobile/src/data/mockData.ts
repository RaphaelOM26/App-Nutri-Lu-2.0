// Dados iniciais — porte do `initialState()` em Design 2.0/app.jsx.
// Em produção isso virá do backend; no MVP fica como seed local.

export type MacroValue = { value: number; target: number };

export type DailyMacros = {
  kcal: MacroValue;
  p: MacroValue;
  c: MacroValue;
  f: MacroValue;
};

export type MealItem = {
  id: number | string;
  q: string;
  name: string;
  portion: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
};

export type Meal = {
  id: string;
  name: string;
  q: string;
  iconSrc?: string;
  time: string;
  color: string;
  kcal: number;
  items: MealItem[];
};

export type Recipe = {
  id: string;
  name: string;
  q: string;
  time: string;
  kcal: number;
  tag: string;
  servings: number;
};

export type Food = {
  id: string;
  name: string;
  brand: string;
  portion: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  q: string;
  fav: boolean;
};

export const INITIAL_MACROS: DailyMacros = {
  kcal: { value: 1248, target: 2200 },
  p: { value: 86, target: 135 },
  c: { value: 132, target: 240 },
  f: { value: 38, target: 70 },
};

export const INITIAL_WATER = 5; // copos de 250ml (meta 8)

// Ícones das refeições — URLs Unsplash escolhidas pra dar uma vista lateral
// padronizada (não top-down). crop=entropy ajuda no enquadramento.
const MEAL_IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=180&h=180&fit=crop&crop=entropy&auto=format&q=70`;

export const INITIAL_MEALS: Meal[] = [
  {
    id: 'breakfast',
    name: 'Café da manhã',
    q: 'breakfast,bread,coffee',
    // Café preto + pão vista lateral
    iconSrc: MEAL_IMG('1495474472287-4d71bcdd2085'),
    time: '07:30',
    color: '#EACBD1',
    kcal: 412,
    items: [
      { id: 1, q: 'oats,bowl', name: 'Aveia com banana', portion: '1 tigela · 80g', kcal: 310, p: 11, c: 56, f: 6 },
      { id: 2, q: 'coffee,milk', name: 'Café com leite', portion: '1 xícara', kcal: 102, p: 6, c: 9, f: 4 },
    ],
  },
  {
    id: 'lunch',
    name: 'Almoço',
    q: 'chicken,rice,bowl',
    iconSrc: MEAL_IMG('1567620905732-2d1ec7ab7445'),
    time: '12:30',
    color: '#D6E0CF',
    kcal: 638,
    items: [
      { id: 3, q: 'rice,brown', name: 'Arroz integral', portion: '120g', kcal: 144, p: 3, c: 30, f: 1 },
      { id: 4, q: 'chicken,grilled', name: 'Frango grelhado', portion: '150g', kcal: 247, p: 46, c: 0, f: 5 },
      { id: 5, q: 'salad,green', name: 'Salada verde', portion: '1 prato', kcal: 60, p: 2, c: 7, f: 2 },
      { id: 6, q: 'broccoli,steamed', name: 'Brócolis', portion: '100g', kcal: 35, p: 3, c: 7, f: 0 },
    ],
  },
  {
    id: 'snack',
    name: 'Lanche',
    q: 'sandwich,bread',
    // Sanduíche de pão de forma vista lateral
    iconSrc: MEAL_IMG('1528735602780-2552fd46c7af'),
    time: '16:00',
    color: '#D4E0EE',
    kcal: 198,
    items: [
      { id: 7, q: 'apple,red', name: 'Maçã', portion: '1 unidade', kcal: 95, p: 0, c: 25, f: 0 },
      { id: 8, q: 'almond,nuts', name: 'Amêndoas', portion: '20g', kcal: 103, p: 4, c: 4, f: 9 },
    ],
  },
  {
    id: 'dinner',
    name: 'Jantar',
    q: 'salmon,vegetables',
    // Prato com proteína + acompanhamentos, vista lateral
    iconSrc: MEAL_IMG('1467003909585-2f8a72700288'),
    time: '19:30',
    color: '#C0CFE6',
    kcal: 0,
    items: [],
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  { id: 'r1', name: 'Frango grelhado com arroz integral', q: 'chicken,rice,bowl', time: '25min', kcal: 480, tag: 'Almoço', servings: 2 },
  { id: 'r2', name: 'Salada de quinoa e abacate', q: 'quinoa,avocado,salad', time: '15min', kcal: 380, tag: 'Almoço', servings: 2 },
  { id: 'r3', name: 'Bowl de aveia com frutas vermelhas', q: 'oats,berries,bowl', time: '8min', kcal: 320, tag: 'Café', servings: 1 },
  { id: 'r4', name: 'Salmão ao forno com legumes', q: 'salmon,vegetables,roasted', time: '30min', kcal: 540, tag: 'Jantar', servings: 2 },
  { id: 'r5', name: 'Panqueca proteica de banana', q: 'pancake,banana', time: '10min', kcal: 290, tag: 'Café', servings: 1 },
  { id: 'r6', name: 'Wrap de frango e vegetais', q: 'wrap,chicken', time: '12min', kcal: 410, tag: 'Lanche', servings: 1 },
  { id: 'r7', name: 'Sopa de lentilha', q: 'lentil,soup', time: '40min', kcal: 320, tag: 'Jantar', servings: 4 },
  { id: 'r8', name: 'Smoothie verde detox', q: 'smoothie,green', time: '5min', kcal: 220, tag: 'Café', servings: 1 },
];

// Base alimentar simplificada (~50 itens comuns BR). Valores aproximados — TACO/USDA.
// Em produção viria de uma API real (TACO, OpenFoodFacts) ou da OpenAI como fallback.
export const INITIAL_FOOD_DB: Food[] = [
  // ─── Pães e padaria ─────────────────────────
  { id: 'f1', name: 'Pão francês', brand: 'Padaria', portion: '1 unid · 50g', kcal: 135, p: 4, c: 25, f: 1, q: 'french,bread', fav: false },
  { id: 'f2', name: 'Pão de forma integral', brand: 'Wickbold', portion: '2 fatias · 50g', kcal: 130, p: 6, c: 24, f: 2, q: 'bread', fav: false },
  { id: 'f3', name: 'Tapioca pronta', brand: 'Genérico', portion: '1 unid · 60g', kcal: 162, p: 0, c: 40, f: 0, q: 'tapioca', fav: false },
  // ─── Carnes e proteínas ─────────────────────
  { id: 'f10', name: 'Carne bovina (patinho)', brand: 'Genérico', portion: '100g', kcal: 219, p: 30, c: 0, f: 10, q: 'chicken,grilled', fav: false },
  { id: 'f11', name: 'Carne bovina (acém)', brand: 'Genérico', portion: '100g', kcal: 247, p: 27, c: 0, f: 15, q: 'chicken,grilled', fav: false },
  { id: 'f12', name: 'Picanha grelhada', brand: 'Genérico', portion: '100g', kcal: 280, p: 27, c: 0, f: 19, q: 'chicken,grilled', fav: false },
  { id: 'f13', name: 'Estrogonofe de carne', brand: 'Caseiro', portion: '100g', kcal: 161, p: 12, c: 6, f: 10, q: 'chicken,grilled', fav: false },
  { id: 'f14', name: 'Frango grelhado (peito)', brand: 'Genérico', portion: '100g', kcal: 165, p: 31, c: 0, f: 4, q: 'chicken,grilled', fav: false },
  { id: 'f15', name: 'Coxa de frango assada', brand: 'Genérico', portion: '100g', kcal: 211, p: 25, c: 0, f: 12, q: 'chicken,grilled', fav: false },
  { id: 'f16', name: 'Linguiça calabresa', brand: 'Sadia', portion: '100g', kcal: 296, p: 13, c: 1, f: 26, q: 'chicken,grilled', fav: false },
  { id: 'f17', name: 'Pernil suíno assado', brand: 'Genérico', portion: '100g', kcal: 230, p: 26, c: 0, f: 14, q: 'chicken,grilled', fav: false },
  { id: 'f18', name: 'Filé de salmão', brand: 'Genérico', portion: '100g', kcal: 208, p: 20, c: 0, f: 13, q: 'salmon,fillet', fav: false },
  { id: 'f19', name: 'Tilápia grelhada', brand: 'Genérico', portion: '100g', kcal: 128, p: 26, c: 0, f: 3, q: 'salmon,fillet', fav: false },
  { id: 'f20', name: 'Atum em água', brand: 'Gomes da Costa', portion: '100g', kcal: 116, p: 26, c: 0, f: 1, q: 'salmon,fillet', fav: false },
  { id: 'f21', name: 'Sardinha em óleo', brand: 'Gomes da Costa', portion: '100g', kcal: 208, p: 25, c: 0, f: 11, q: 'salmon,fillet', fav: false },
  { id: 'f22', name: 'Camarão cozido', brand: 'Genérico', portion: '100g', kcal: 99, p: 24, c: 0, f: 0, q: 'salmon,fillet', fav: false },
  { id: 'f23', name: 'Ovo cozido', brand: 'Genérico', portion: '1 unidade · 50g', kcal: 78, p: 6, c: 1, f: 5, q: 'egg,boiled', fav: false },
  { id: 'f24', name: 'Ovo mexido', brand: 'Caseiro', portion: '100g', kcal: 154, p: 11, c: 1, f: 12, q: 'egg,boiled', fav: false },
  // ─── Carboidratos ──────────────────────────
  { id: 'f30', name: 'Arroz branco cozido', brand: 'Caseiro', portion: '100g', kcal: 130, p: 3, c: 28, f: 0, q: 'rice', fav: false },
  { id: 'f31', name: 'Arroz integral cozido', brand: 'Caseiro', portion: '100g', kcal: 124, p: 3, c: 25, f: 1, q: 'rice,brown', fav: false },
  { id: 'f32', name: 'Macarrão cozido', brand: 'Caseiro', portion: '100g', kcal: 158, p: 6, c: 31, f: 1, q: 'rice', fav: false },
  { id: 'f33', name: 'Macarrão à bolonhesa', brand: 'Caseiro', portion: '1 prato · 350g', kcal: 580, p: 28, c: 75, f: 18, q: 'rice', fav: false },
  { id: 'f34', name: 'Batata cozida', brand: 'Caseiro', portion: '100g', kcal: 87, p: 2, c: 20, f: 0, q: 'rice', fav: false },
  { id: 'f35', name: 'Batata frita', brand: 'Caseiro', portion: '100g', kcal: 312, p: 4, c: 41, f: 15, q: 'rice', fav: false },
  { id: 'f36', name: 'Batata palha', brand: 'Yoki', portion: '100g', kcal: 540, p: 4, c: 50, f: 35, q: 'rice', fav: false },
  { id: 'f37', name: 'Mandioca cozida', brand: 'Caseiro', portion: '100g', kcal: 125, p: 1, c: 30, f: 0, q: 'rice', fav: false },
  { id: 'f38', name: 'Inhame cozido', brand: 'Caseiro', portion: '100g', kcal: 116, p: 2, c: 27, f: 0, q: 'rice', fav: false },
  { id: 'f39', name: 'Polenta', brand: 'Caseiro', portion: '100g', kcal: 87, p: 2, c: 19, f: 0, q: 'rice', fav: false },
  { id: 'f40', name: 'Aveia em flocos', brand: 'Quaker', portion: '40g', kcal: 156, p: 6, c: 27, f: 3, q: 'oats,bowl', fav: false },
  { id: 'f41', name: 'Pizza margherita', brand: 'Caseiro', portion: '1 fatia · 100g', kcal: 250, p: 11, c: 30, f: 10, q: 'rice', fav: false },
  // ─── Frutas ────────────────────────────────
  { id: 'f50', name: 'Banana prata', brand: 'Genérico', portion: '100g', kcal: 89, p: 1, c: 23, f: 0, q: 'banana', fav: false },
  { id: 'f51', name: 'Maçã', brand: 'Genérico', portion: '100g', kcal: 52, p: 0, c: 14, f: 0, q: 'apple,red', fav: false },
  { id: 'f52', name: 'Laranja', brand: 'Genérico', portion: '100g', kcal: 47, p: 1, c: 12, f: 0, q: 'apple,red', fav: false },
  { id: 'f53', name: 'Mamão papaya', brand: 'Genérico', portion: '100g', kcal: 43, p: 0, c: 11, f: 0, q: 'apple,red', fav: false },
  { id: 'f54', name: 'Abacate', brand: 'Genérico', portion: '100g', kcal: 160, p: 2, c: 9, f: 15, q: 'avocado', fav: false },
  { id: 'f55', name: 'Morango', brand: 'Genérico', portion: '100g', kcal: 33, p: 1, c: 8, f: 0, q: 'berries', fav: false },
  { id: 'f56', name: 'Manga', brand: 'Genérico', portion: '100g', kcal: 60, p: 1, c: 15, f: 0, q: 'apple,red', fav: false },
  // ─── Vegetais / saladas ────────────────────
  { id: 'f60', name: 'Brócolis cozido', brand: 'Caseiro', portion: '100g', kcal: 35, p: 3, c: 7, f: 0, q: 'broccoli,steamed', fav: false },
  { id: 'f61', name: 'Tomate', brand: 'Genérico', portion: '100g', kcal: 18, p: 1, c: 4, f: 0, q: 'salad', fav: false },
  { id: 'f62', name: 'Alface americana', brand: 'Genérico', portion: '100g', kcal: 15, p: 1, c: 3, f: 0, q: 'salad,green', fav: false },
  { id: 'f63', name: 'Cenoura cozida', brand: 'Caseiro', portion: '100g', kcal: 35, p: 1, c: 8, f: 0, q: 'salad', fav: false },
  { id: 'f64', name: 'Couve refogada', brand: 'Caseiro', portion: '100g', kcal: 35, p: 3, c: 7, f: 0, q: 'salad,green', fav: false },
  { id: 'f65', name: 'Beterraba cozida', brand: 'Caseiro', portion: '100g', kcal: 44, p: 2, c: 10, f: 0, q: 'salad', fav: false },
  { id: 'f66', name: 'Feijão preto cozido', brand: 'Caseiro', portion: '100g', kcal: 132, p: 9, c: 24, f: 0, q: 'rice,brown', fav: false },
  { id: 'f67', name: 'Feijão carioca cozido', brand: 'Caseiro', portion: '100g', kcal: 76, p: 5, c: 14, f: 0, q: 'rice,brown', fav: false },
  // ─── Laticínios ────────────────────────────
  { id: 'f70', name: 'Iogurte natural desnatado', brand: 'Nestlé', portion: '170g', kcal: 84, p: 14, c: 7, f: 0, q: 'yogurt,natural', fav: true },
  { id: 'f71', name: 'Leite integral', brand: 'Italac', portion: '200ml', kcal: 120, p: 6, c: 9, f: 6, q: 'milk', fav: false },
  { id: 'f72', name: 'Leite desnatado', brand: 'Italac', portion: '200ml', kcal: 70, p: 7, c: 10, f: 0, q: 'milk', fav: false },
  { id: 'f73', name: 'Queijo mussarela', brand: 'Tirolez', portion: '50g', kcal: 140, p: 12, c: 1, f: 10, q: 'yogurt,natural', fav: false },
  { id: 'f74', name: 'Queijo cottage', brand: 'Vigor', portion: '100g', kcal: 98, p: 11, c: 3, f: 4, q: 'yogurt,natural', fav: false },
  // ─── Suplementos / shakes ──────────────────
  { id: 'f80', name: 'Whey protein chocolate', brand: 'Growth', portion: '30g · 1 scoop', kcal: 120, p: 24, c: 3, f: 1, q: 'whey,protein', fav: true },
  { id: 'f81', name: 'Whey protein baunilha', brand: 'Growth', portion: '30g · 1 scoop', kcal: 118, p: 24, c: 2, f: 1, q: 'whey,protein', fav: false },
  // ─── Doces & snacks ────────────────────────
  { id: 'f90', name: 'Chocolate ao leite', brand: 'Lacta', portion: '30g · 1 barrinha', kcal: 150, p: 2, c: 18, f: 9, q: 'apple,red', fav: false },
  { id: 'f91', name: 'Brigadeiro', brand: 'Caseiro', portion: '1 unidade · 20g', kcal: 96, p: 1, c: 17, f: 3, q: 'apple,red', fav: false },
  { id: 'f92', name: 'Açaí na tigela', brand: 'Genérico', portion: '300g', kcal: 350, p: 4, c: 50, f: 12, q: 'berries', fav: false },
  // ─── Bebidas ───────────────────────────────
  { id: 'f95', name: 'Café com leite', brand: 'Caseiro', portion: '1 xícara · 200ml', kcal: 78, p: 4, c: 7, f: 4, q: 'coffee,milk', fav: false },
  { id: 'f96', name: 'Café preto', brand: 'Caseiro', portion: '1 xícara · 60ml', kcal: 2, p: 0, c: 0, f: 0, q: 'coffee', fav: false },
  { id: 'f97', name: 'Suco de laranja natural', brand: 'Caseiro', portion: '200ml', kcal: 90, p: 1, c: 21, f: 0, q: 'apple,red', fav: false },
  { id: 'f98', name: 'Coca-Cola', brand: 'Coca-Cola', portion: '1 lata · 350ml', kcal: 140, p: 0, c: 39, f: 0, q: 'apple,red', fav: false },
];

// ─── Mapa de fotos do Unsplash (porte do components.jsx) ─────────
const FOOD_IMG_MAP: Record<string, string> = {
  default: '1490645935967-10de6ba17061',
  bowl: '1546069901-ba9599a7e63c',
  oats: '1517686469429-8bdb88b9f907',
  breakfast: '1525351484163-7529414344d8',
  coffee: '1495474472287-4d71bcdd2085',
  milk: '1502741224143-90386d7f8c82',
  rice: '1518779578993-ec3579fee39f',
  brown: '1518779578993-ec3579fee39f',
  chicken: '1532550907401-a500c9a57435',
  grilled: '1532550907401-a500c9a57435',
  salad: '1512621776951-a57141f2eefd',
  green: '1505253716362-afaea1d3d1af',
  broccoli: '1584270354949-c26b0d5b4a0c',
  steamed: '1584270354949-c26b0d5b4a0c',
  apple: '1568702846914-96b305d2aaeb',
  red: '1568702846914-96b305d2aaeb',
  almond: '1508061253366-f7da158b6d46',
  nuts: '1508061253366-f7da158b6d46',
  quinoa: '1505253758473-96b7015fcd40',
  avocado: '1559054663-e8d23213f55c',
  berries: '1488477181946-6428a0291777',
  salmon: '1467003909585-2f8a72700288',
  vegetables: '1540420773420-3366772f4999',
  roasted: '1467003909585-2f8a72700288',
  pancake: '1528207776546-365bb710ee93',
  banana: '1571771894821-ce9b6c11b08e',
  wrap: '1565299624946-b28f40a0ae38',
  lentil: '1547592180-85f173990554',
  soup: '1547592180-85f173990554',
  smoothie: '1502741224143-90386d7f8c82',
  protein: '1490645935967-10de6ba17061',
  colorful: '1543353071-873f17a7a088',
  yogurt: '1488477181946-6428a0291777',
  egg: '1482049016688-2d3e1b311543',
  boiled: '1482049016688-2d3e1b311543',
  whey: '1593095948071-474c5cc2989d',
  bread: '1509440159596-0249088772ff',
  french: '1509440159596-0249088772ff',
  natural: '1488477181946-6428a0291777',
  fillet: '1467003909585-2f8a72700288',
  food: '1490645935967-10de6ba17061',
  dinner: '1467003909585-2f8a72700288',
  package: '1542838132-92c53300491e',
  grocery: '1542838132-92c53300491e',
  product: '1542838132-92c53300491e',
  person: '1571019613454-1cb2f99b2d8b',
  silhouette: '1571019613454-1cb2f99b2d8b',
  fitness: '1571019613454-1cb2f99b2d8b',
  homemade: '1547592180-85f173990554',
  brazilian: '1547592180-85f173990554',
  eggs: '1482049016688-2d3e1b311543',
};

/** Resolve a URL do Unsplash a partir de tokens (ex: "chicken,rice,bowl"). */
export function unsplashUrl(q: string | undefined, w = 400, h = 400): string {
  const tokens = (q || 'default').toLowerCase().split(/[,\s]+/);
  let id: string | null = null;
  for (const t of tokens) {
    if (FOOD_IMG_MAP[t]) {
      id = FOOD_IMG_MAP[t];
      break;
    }
  }
  if (!id) id = FOOD_IMG_MAP.default;
  return `https://images.unsplash.com/photo-${id}?w=${w * 2}&h=${h * 2}&fit=crop&auto=format&q=70`;
}
