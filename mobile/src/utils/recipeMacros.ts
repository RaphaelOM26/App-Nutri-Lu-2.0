// Estimativa grosseira de macros pra receitas que não têm valores nutricionais.
// Heurística: pra cada ingrediente, faz match por substring no foodDB e converte
// a quantidade pra gramas. NÃO É preciso — é placeholder até o backend extrair
// macros via Lu. Confidence indica quão confiável é a estimativa.

import type { Food } from '../data/mockData';
import type { Ingredient } from '../api/client';

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
