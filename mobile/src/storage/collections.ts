// Persistência de coleções de receitas via AsyncStorage.
// Coleção = grupo nomeado de receitas (mesmas IDs aceitas em recipePrefs).

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/collections';
const SEEDED_KEY = '@nutri-lu/collections-seeded';

export type RecipeCollection = {
  id: string;
  name: string;
  /** IDs de receitas (seed `r1`/`r2` ou saved `rcp_...`) */
  recipeIds: string[];
  /** Query do Unsplash usada quando a coleção não tem fotos próprias (preview do card) */
  coverQuery?: string;
  createdAt: number;
};

/** Coleções padrão semeadas só na primeira vez que o usuário abre o app. */
export const SEED_COLLECTIONS: RecipeCollection[] = [
  { id: 'col_breakfast', name: 'Café proteico', recipeIds: ['r3', 'r5'], coverQuery: 'breakfast,eggs', createdAt: 0 },
  { id: 'col_preworkout', name: 'Pré-treino', recipeIds: ['r3', 'r8'], coverQuery: 'smoothie,oats', createdAt: 0 },
  { id: 'col_lightdinner', name: 'Jantar leve', recipeIds: ['r2', 'r4', 'r7'], coverQuery: 'salad,dinner', createdAt: 0 },
  { id: 'col_brazilian', name: 'Receitas da vó', recipeIds: ['r1', 'r4'], coverQuery: 'brazilian,homemade', createdAt: 0 },
];

export async function loadCollections(): Promise<RecipeCollection[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RecipeCollection[];
    // Primeira vez: semeia
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_COLLECTIONS));
      await AsyncStorage.setItem(SEEDED_KEY, '1');
      return SEED_COLLECTIONS;
    }
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
