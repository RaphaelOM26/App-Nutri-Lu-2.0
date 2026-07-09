// Modelo de dados do PLANO ALIMENTAR (feature paga, v1.0).
//
// Arquitetura acordada (2026-06-30):
//  - RECEITA (compartilhada, codificada NL-xxxx: foto/preparo/macros) ≠
//    PLANO (por-paciente: quais códigos, dias/horários, porções).
//  - O PlanMeal referencia uma receita por `code` (catálogo) OU carrega um
//    `freeText` (válvula de escape pra item fora do catálogo).

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

/**
 * Plano ativo do usuário. Fase 3 (import do PDF) passa a ler o plano importado
 * do storage; até lá não existe plano e as telas mostram o estado vazio.
 */
export function getActivePlan(): MealPlan | null {
  return null;
}

/** Busca uma refeição do plano pelo id (usado pelas telas de detalhe). */
export function findPlanMeal(plan: MealPlan, mealId: string): PlanMeal | undefined {
  for (const day of plan.days) {
    const m = day.meals.find((x) => x.id === mealId);
    if (m) return m;
  }
  return undefined;
}
