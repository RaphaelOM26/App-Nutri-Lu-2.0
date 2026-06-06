// Persistência de coleções de receitas via AsyncStorage.
// Coleção = grupo nomeado de receitas (mesmas IDs aceitas em recipePrefs).

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/collections';

export type RecipeCollection = {
  id: string;
  name: string;
  /** IDs de receitas (seed `r1`/`r2` ou saved `rcp_...`) */
  recipeIds: string[];
  /** Query do Unsplash usada quando a coleção não tem fotos próprias (preview do card) */
  coverQuery?: string;
  createdAt: number;
};

export async function loadCollections(): Promise<RecipeCollection[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RecipeCollection[];
    return [];
  } catch (err) {
    console.warn('[storage] falha ao ler coleções:', err);
    return [];
  }
}

export async function saveCollections(cols: RecipeCollection[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
}

export function newCollectionId(): string {
  return `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
