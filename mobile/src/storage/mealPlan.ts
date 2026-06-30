// Modelo de dados do PLANO ALIMENTAR (feature paga, v1.0) + plano de exemplo
// pra Fase 1 (telas funcionando sem PDF ainda).
//
// Arquitetura acordada (2026-06-30):
//  - RECEITA (compartilhada, codificada NL-xxxx: foto/preparo/macros) ≠
//    PLANO (por-paciente: quais códigos, dias/horários, porções).
//  - O PlanMeal referencia uma receita por `code` (catálogo) OU carrega um
//    `freeText` (válvula de escape pra item fora do catálogo).
// Na Fase 1 os dados da receita vêm inline no exemplo; na Fase 2 virão do
// livro base codificado.

export type PlanMealStatus = 'pending' | 'done';

export type PlanFood = { name: string; qty: string };

export type PlanMeal = {
  id: string;
  time: string; // "12:30"
  name: string; // "Almoço"
  code?: string; // "NL-0123" — receita do catálogo
  freeText?: string; // válvula de escape (item livre)
  dish: string; // nome do prato exibido
  foods: PlanFood[];
  kcal: number;
  p: number;
  c: number;
  f: number;
  prepTime?: string; // "25 min"
  steps?: string[]; // modo de preparo (vem do catálogo via code)
  status: PlanMealStatus;
};

export type PlanDay = {
  weekday: number; // 1=Seg ... 7=Dom (padrão BR)
  dayLabel: string; // "8"
  meals: PlanMeal[];
};

export type MealPlan = {
  id: string;
  monthLabel: string; // "Junho"
  nutritionist: { name: string; crn: string; initial: string };
  weekIndex: number; // 2
  weekTotal: number; // 4
  weekRange: string; // "8 — 14 de junho"
  todayWeekday: number; // 1=Seg
  days: PlanDay[];
};

export const WEEKDAY_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
export const WEEKDAY_LONG = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

// ─── Plano de exemplo (Fase 1) ───────────────────────────────────
// Segunda-feira tem o detalhamento completo; demais dias repetem o conjunto.
const MONDAY_MEALS: PlanMeal[] = [
  {
    id: 'm-cafe',
    time: '07:00',
    name: 'Café da manhã',
    code: 'NL-0007',
    dish: 'Ovos mexidos com pão integral',
    foods: [
      { name: 'Ovos mexidos', qty: '2 un' },
      { name: 'Pão integral', qty: '1 fatia' },
      { name: 'Mamão', qty: '1 fatia' },
    ],
    kcal: 320,
    p: 18,
    c: 34,
    f: 12,
    prepTime: '10 min',
    steps: [
      'Bata os ovos com uma pitada de sal.',
      'Cozinhe em fogo baixo, mexendo até ficar cremoso.',
      'Sirva com o pão integral e o mamão ao lado.',
    ],
    status: 'done',
  },
  {
    id: 'm-lanche1',
    time: '10:00',
    name: 'Lanche da manhã',
    code: 'NL-0021',
    dish: 'Iogurte natural com granola',
    foods: [
      { name: 'Iogurte natural', qty: '1 pote' },
      { name: 'Granola', qty: '2 col. sopa' },
    ],
    kcal: 180,
    p: 10,
    c: 24,
    f: 5,
    prepTime: '2 min',
    steps: ['Misture o iogurte com a granola e sirva.'],
    status: 'done',
  },
  {
    id: 'm-almoco',
    time: '12:30',
    name: 'Almoço',
    code: 'NL-0123',
    dish: 'Salmão grelhado com quinoa',
    foods: [
      { name: 'Salmão grelhado', qty: '120 g' },
      { name: 'Quinoa', qty: '4 col. sopa' },
      { name: 'Legumes no vapor', qty: '1 porção' },
      { name: 'Salada verde', qty: 'à vontade' },
    ],
    kcal: 480,
    p: 38,
    c: 30,
    f: 22,
    prepTime: '25 min',
    steps: [
      'Tempere o salmão com sal, limão e ervas.',
      'Grelhe 4 min de cada lado, até dourar.',
      'Cozinhe a quinoa conforme a embalagem.',
      'Sirva com os legumes e as folhas frescas.',
    ],
    status: 'pending',
  },
  {
    id: 'm-lanche2',
    time: '16:00',
    name: 'Lanche da tarde',
    freeText: 'Fruta + castanhas (livre)',
    dish: 'Fruta + castanhas',
    foods: [
      { name: 'Fruta da estação', qty: '1 un' },
      { name: 'Castanhas', qty: '1 punhado' },
    ],
    kcal: 210,
    p: 5,
    c: 22,
    f: 13,
    status: 'pending',
  },
  {
    id: 'm-jantar',
    time: '20:00',
    name: 'Jantar',
    code: 'NL-0088',
    dish: 'Omelete de legumes',
    foods: [
      { name: 'Omelete de legumes', qty: '2 ovos' },
      { name: 'Salada verde', qty: 'à vontade' },
    ],
    kcal: 290,
    p: 20,
    c: 12,
    f: 18,
    prepTime: '15 min',
    steps: [
      'Refogue os legumes picados.',
      'Bata os ovos, despeje sobre os legumes e dobre a omelete.',
      'Sirva com a salada.',
    ],
    status: 'pending',
  },
];

// Segundo cardápio — pra dias alternados terem conteúdo diferente (a troca de
// dia fica visível). Mesma estrutura do MENU_A.
const MENU_B: PlanMeal[] = [
  {
    id: 'm-cafe',
    time: '07:00',
    name: 'Café da manhã',
    code: 'NL-0012',
    dish: 'Tapioca com ovo',
    foods: [
      { name: 'Tapioca', qty: '1 un' },
      { name: 'Ovo', qty: '1 un' },
      { name: 'Queijo branco', qty: '1 fatia' },
    ],
    kcal: 300,
    p: 16,
    c: 38,
    f: 9,
    prepTime: '8 min',
    steps: ['Hidrate a goma e leve à frigideira.', 'Recheie com o ovo e o queijo e dobre.'],
    status: 'done',
  },
  {
    id: 'm-lanche1',
    time: '10:00',
    name: 'Lanche da manhã',
    code: 'NL-0034',
    dish: 'Vitamina de banana',
    foods: [
      { name: 'Banana', qty: '1 un' },
      { name: 'Leite', qty: '200 ml' },
      { name: 'Aveia', qty: '1 col. sopa' },
    ],
    kcal: 220,
    p: 9,
    c: 36,
    f: 4,
    prepTime: '3 min',
    steps: ['Bata tudo no liquidificador e sirva gelado.'],
    status: 'pending',
  },
  {
    id: 'm-almoco',
    time: '12:30',
    name: 'Almoço',
    code: 'NL-0145',
    dish: 'Frango com batata-doce',
    foods: [
      { name: 'Frango grelhado', qty: '130 g' },
      { name: 'Batata-doce', qty: '150 g' },
      { name: 'Brócolis', qty: '1 porção' },
    ],
    kcal: 450,
    p: 40,
    c: 42,
    f: 10,
    prepTime: '30 min',
    steps: [
      'Tempere e grelhe o frango.',
      'Asse a batata-doce em cubos.',
      'Cozinhe o brócolis no vapor e monte o prato.',
    ],
    status: 'pending',
  },
  {
    id: 'm-lanche2',
    time: '16:00',
    name: 'Lanche da tarde',
    freeText: 'Mix de castanhas (livre)',
    dish: 'Mix de castanhas',
    foods: [{ name: 'Castanhas variadas', qty: '1 punhado' }],
    kcal: 190,
    p: 6,
    c: 8,
    f: 16,
    status: 'pending',
  },
  {
    id: 'm-jantar',
    time: '20:00',
    name: 'Jantar',
    code: 'NL-0091',
    dish: 'Sopa de legumes',
    foods: [
      { name: 'Sopa de legumes', qty: '1 tigela' },
      { name: 'Frango desfiado', qty: '80 g' },
    ],
    kcal: 260,
    p: 22,
    c: 24,
    f: 7,
    prepTime: '25 min',
    steps: ['Refogue os legumes, adicione água e cozinhe.', 'Junte o frango desfiado e tempere.'],
    status: 'pending',
  },
];

// Monta um dia com ids ÚNICOS por dia (`${weekday}-${baseId}`) — assim o status
// "feito" de uma refeição não vaza pros outros dias.
function buildDay(weekday: number, dayLabel: string, menu: PlanMeal[]): PlanDay {
  return {
    weekday,
    dayLabel,
    meals: menu.map((m) => ({ ...m, id: `${weekday}-${m.id}` })),
  };
}

export const SAMPLE_PLAN: MealPlan = {
  id: 'plan-junho',
  monthLabel: 'Junho',
  nutritionist: { name: 'Dra. Marina Costa', crn: 'CRN 12345', initial: 'M' },
  weekIndex: 2,
  weekTotal: 4,
  weekRange: '8 — 14 de junho',
  todayWeekday: 1,
  days: [
    buildDay(1, '8', MONDAY_MEALS),
    buildDay(2, '9', MENU_B),
    buildDay(3, '10', MONDAY_MEALS),
    buildDay(4, '11', MENU_B),
    buildDay(5, '12', MONDAY_MEALS),
    buildDay(6, '13', MENU_B),
    buildDay(7, '14', MONDAY_MEALS),
  ],
};

/** Rótulos de cada semana do mês (pro seletor ‹ › funcionar com feedback). */
export const WEEK_RANGES = ['1 — 7 de junho', '8 — 14 de junho', '15 — 21 de junho', '22 — 28 de junho'];

/** Busca uma refeição do plano pelo id (usado pelas telas de detalhe). */
export function findPlanMeal(plan: MealPlan, mealId: string): PlanMeal | undefined {
  for (const day of plan.days) {
    const m = day.meals.find((x) => x.id === mealId);
    if (m) return m;
  }
  return undefined;
}
