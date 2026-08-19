// Estimativa grosseira de macros pra receitas que não têm valores nutricionais.
// Heurística: pra cada ingrediente, faz match por substring no foodDB e converte
// a quantidade pra gramas. NÃO É preciso — é placeholder até o backend extrair
// macros via Lu. Confidence indica quão confiável é a estimativa.

import type { Food } from '../data/mockData';
import type { Ingredient } from '../api/client';
import type { NutriRecipe } from '../data/nutriRecipes';
import type { MealCategory } from '../api/client';

export type EstimatedMacros = {
  kcal: number;
  p: number;
  c: number;
  f: number;
  /** Fração de ingredientes que bateu no foodDB (0..1). */
  matchRatio: number;
  matchedCount: number;
  totalCount: number;
};

/** Converte "1 xícara" / "200g" / "3 dentes" / etc → estimativa em gramas. */
export function parseToGrams(quantity: string | undefined, unit: string | undefined): number {
  const n = parseFloat((quantity || '').replace(',', '.')) || 0;
  if (!n) return 0;
  const u = (unit || '').toLowerCase().trim();
  if (u.includes('xíc') || u.includes('xic')) return n * 200;
  if (u.includes('colher de sopa') || u.includes('colheres de sopa') || u === 'colheres' || u === 'colher') return n * 15;
  if (u.includes('colher de chá') || u.includes('colher de cha') || u.includes('colheres de chá') || u.includes('colheres de cha')) return n * 5;
  if (u === 'kg' || u.includes('quilo')) return n * 1000;
  if (u === 'g' || u.includes('gram')) return n;
  if (u === 'l' || u.includes('litro')) return n * 1000;
  if (u === 'ml') return n;
  if (u.includes('dente')) return n * 5;
  if (u.includes('unidade') || u === 'un' || u === 'unid' || u === 'unid.') return n * 50;
  if (u.includes('fatia')) return n * 30;
  if (u.includes('maço')) return n * 100;
  if (u.includes('pitada')) return 1;
  // fallback: assume "1 unidade média ~100g"
  return n * 100;
}

/** Extrai kcal/macros por 100g do food, se a portion permitir normalização. */
function foodPer100g(f: Food): { kcal: number; p: number; c: number; f: number } | null {
  const m = f.portion.match(/(\d+)\s*g/i);
  if (!m) return null;
  const portionG = parseInt(m[1], 10);
  if (!portionG) return null;
  const k = 100 / portionG;
  return { kcal: f.kcal * k, p: f.p * k, c: f.c * k, f: f.f * k };
}

const STOPWORDS = new Set(['de', 'do', 'da', 'dos', 'das', 'em', 'com', 'sem', 'a', 'o', 'e', 'ou']);

/** Acha o food cujo nome melhor casa com o ingrediente (substring de palavra). */
function findFoodMatch(ingredientName: string, foodDB: Food[]): Food | null {
  const ingLower = ingredientName.toLowerCase().trim();
  if (!ingLower) return null;

  // Pra ranking simples: pega palavras significativas do ingrediente
  const words = ingLower
    .split(/\s+/)
    .map((w) => w.replace(/[^a-záàâãéêíóôõúç]/gi, ''))
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));

  if (words.length === 0) return null;

  // Procura primeiro match exato; se não, parcial
  let best: { food: Food; score: number } | null = null;
  for (const f of foodDB) {
    const fLower = f.name.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (fLower.includes(w)) score += 2;
    }
    if (fLower.includes(ingLower)) score += 3;
    if (ingLower.includes(fLower)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { food: f, score };
  }
  return best?.food ?? null;
}

/** Estimativa total de macros pra uma lista de ingredientes. */
export function estimateRecipeMacros(ingredients: Ingredient[], foodDB: Food[]): EstimatedMacros {
  let kcal = 0, p = 0, c = 0, f = 0;
  let matched = 0;
  for (const ing of ingredients) {
    const food = findFoodMatch(ing.name, foodDB);
    if (!food) continue;
    const per100 = foodPer100g(food);
    if (!per100) continue;
    const grams = parseToGrams(ing.quantity, ing.unit);
    if (!grams) continue;
    const factor = grams / 100;
    kcal += per100.kcal * factor;
    p += per100.p * factor;
    c += per100.c * factor;
    f += per100.f * factor;
    matched++;
  }
  return {
    kcal: Math.round(kcal),
    p: Math.round(p),
    c: Math.round(c),
    f: Math.round(f),
    matchRatio: ingredients.length ? matched / ingredients.length : 0,
    matchedCount: matched,
    totalCount: ingredients.length,
  };
}

// ─── Sugestão de receita por macros restantes ───────────────────

export type RecipeFitCandidate = {
  recipe: NutriRecipe;
  perServing: { kcal: number; p: number; c: number; f: number };
  /** Score: quanto MENOR, melhor o encaixe. */
  score: number;
};

export type MealContext = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'any';

/**
 * Deriva o contexto da refeição com base no horário do dia.
 * Janelas com sobreposição (almoço/lanche, jantar/lanche) porque sugestões válidas
 * podem cair em mais de um — o caller usa só pra filtrar tags, não pra excluir.
 */
export function mealContextFromHour(hour: number): MealContext {
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 23) return 'dinner';
  return 'any';
}

// Mapeia contexto (horário) → categorias de refeição aceitáveis.
// ESTRITO de propósito: café da manhã não é sugerido no almoço e vice-versa
// (pedido do Raphael, 2026-08-19). O jantar aceita prato de almoço porque a
// nutri marca a mesma receita nos dois, mas o contrário não vale pra lanche.
//
// Antes isso comparava um único `tag` em texto ("Almoço") vindo da extração
// de PDF. As 153 do livro trazem `meals: MealCategory[]` atribuído pela
// própria nutricionista, então virou teste de interseção.
const CATEGORIAS_POR_CONTEXTO: Record<MealContext, MealCategory[]> = {
  breakfast: ['breakfast'],
  lunch: ['lunch'],
  snack: ['snack', 'dessert'],
  dinner: ['dinner', 'lunch'],
  // 'any' não libera geral: receita SEM refeição (molho, acompanhamento) nunca
  // pode ser sugerida como refeição, em nenhum horário.
  any: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
};

// Limites de kcal por porção — sanidade, não curadoria.
//
// A faixa antiga era bem mais apertada (lanche 50-250) porque servia de muleta
// contra o `tag` extraído de PDF, que errava: um "Suco Detox de 702 kcal"
// aparecia marcado como lanche. Nas 153 do livro quem atribui a refeição é a
// nutricionista, então esse policiamento deixou de ser necessário — e estava
// cobrando caro: os lanches dela têm MEDIANA de 285 kcal, e o teto de 250
// deixava de fora 50 das 58 receitas de lanche.
//
// Quem faz o casamento fino com o que sobrou no dia é o score, não este corte.
const KCAL_RANGE_BY_CONTEXT: Record<MealContext, [number, number]> = {
  breakfast: [100, 600],
  lunch: [200, 900],
  snack: [50, 400],
  dinner: [200, 900],
  any: [50, 900],
};

/**
 * Ranqueia receitas pela proximidade aos macros restantes E pelo contexto da
 * refeição (horário), com randomização leve pra variedade entre sessões.
 *
 * Heurística (lower=better):
 *  - Filtra por tag estrita por horário (almoço só aceita refeições principais)
 *  - Filtra por kcal/porção do contexto (snack max 250 kcal)
 *  - Rejeita receitas com matchRatio < 0.5 (antes era 0.3 — muito permissivo)
 *  - Recompensa proteína próxima ao restante (peso 2x)
 *  - Penaliza estourar macros do dia
 *
 * Pra variedade: pega top 3×topN ranqueados, embaralha (Fisher-Yates seedado pela
 * hora) e retorna topN. Cada vez que user abre a sugestão em horários diferentes,
 * vê opções diferentes dentro do tier de qualidade. Antes era determinístico:
 * mesma entrada → mesmos 6 candidatos sempre.
 */
export function pickRecipesForRemainingMacros(
  recipes: NutriRecipe[],
  remaining: { kcal: number; p: number; c: number; f: number },
  topN = 5,
  context: MealContext = 'any',
): RecipeFitCandidate[] {
  const [kMin, kMax] = KCAL_RANGE_BY_CONTEXT[context];
  const targetK = Math.max(kMin, Math.min(remaining.kcal, kMax));
  const targetP = Math.max(8, Math.min(remaining.p, 40));
  const aceitas = CATEGORIAS_POR_CONTEXTO[context];

  const scored: RecipeFitCandidate[] = [];
  for (const r of recipes) {
    // Sem refeição = não é refeição (molho, acompanhamento). Fora, sempre.
    if (r.meals.length === 0) continue;
    if (!r.meals.some((m) => aceitas.includes(m))) continue;

    // Macros MEDIDOS pela nutri, já por porção — não há o que estimar nem
    // dividir pelo rendimento, que é de onde vinha metade do erro antes.
    const per = {
      kcal: Math.round(r.macros.kcal),
      p: Math.round(r.macros.p),
      c: Math.round(r.macros.c),
      f: Math.round(r.macros.f),
    };
    if (per.kcal < kMin || per.kcal > kMax) continue;

    const fitK = Math.abs(per.kcal - targetK);
    const fitP = Math.abs(per.p - targetP) * 2;
    const overK = Math.max(0, per.kcal - remaining.kcal) * 2;
    const overP = Math.max(0, per.p - remaining.p);
    const overC = Math.max(0, per.c - remaining.c) * 0.5;
    const overF = Math.max(0, per.f - remaining.f) * 1.5;
    const score = fitK + fitP + overK + overP + overC + overF;
    scored.push({ recipe: r, perServing: per, score });
  }
  scored.sort((a, b) => a.score - b.score);

  // Top pool 3× maior que o necessário — embaralhamos pra dar variedade.
  // Sem seed determinístico (Math.random) — cada chamada produz ordem diferente.
  const pool = scored.slice(0, topN * 3);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, topN);
}
