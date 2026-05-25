// Helpers compartilhados de refeição.

export type MealId = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export const MEAL_LABELS: Record<MealId, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar',
};

export const MEAL_ORDER: MealId[] = ['breakfast', 'lunch', 'snack', 'dinner'];

/** Adivinha a refeição mais provável baseado na hora atual. */
export function guessMealByTime(date = new Date()): MealId {
  const h = date.getHours();
  if (h < 10) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 18) return 'snack';
  return 'dinner';
}

export function mealLabel(id: string | undefined): string {
  if (!id) return 'Refeição';
  return MEAL_LABELS[id as MealId] || 'Refeição';
}

/** Remove acentos pra busca tolerante (ex: "açaí" → "acai", "Café" → "Cafe"). */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
