// Persistência local de receitas extraídas via AsyncStorage.
// As receitas seed (mockData.INITIAL_RECIPES) ficam sempre disponíveis;
// aqui guardamos apenas as criadas/importadas pelo usuário.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExtractedRecipe } from '../api/client';

const STORAGE_KEY = '@nutri-lu/saved-recipes';

export type SavedRecipe = ExtractedRecipe & {
  id: string;
  savedAt: number;
  source: 'image' | 'url' | 'video' | 'manual';
  imageDataUrl?: string; // foto original (opcional, base64 com prefixo data:)
  sourceUrl?: string; // URL original se vier de link
};

export async function loadRecipes(): Promise<SavedRecipe[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedRecipe[];
  } catch (err) {
    console.warn('[storage] falha ao ler receitas:', err);
    return [];
  }
}

export async function saveRecipe(recipe: SavedRecipe): Promise<void> {
  const existing = await loadRecipes();
  // upsert: se o id já existir, substitui; senão, adiciona no início
  const idx = existing.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) {
    existing[idx] = recipe;
  } else {
    existing.unshift(recipe);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export async function deleteRecipe(id: string): Promise<void> {
  const existing = await loadRecipes();
  const filtered = existing.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearAllRecipes(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Gera um ID único pra nova receita. */
export function newRecipeId(): string {
  return `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
