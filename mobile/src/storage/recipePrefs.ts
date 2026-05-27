// Persistência de favoritos e recentes de receitas via AsyncStorage.
// Aceita IDs tanto de receitas seed (mockData.INITIAL_RECIPES, prefixo 'r')
// quanto de saved (storage/recipes.ts, prefixo 'rcp_').

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = '@nutri-lu/recipe-favorites';
const RECENT_KEY = '@nutri-lu/recipe-recents';

export const MAX_RECIPE_RECENTS = 20;

export async function loadFavoriteRecipes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (err) {
    console.warn('[storage] falha ao ler favoritos de receitas:', err);
    return [];
  }
}

export async function saveFavoriteRecipes(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

export async function loadRecentRecipes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (err) {
    console.warn('[storage] falha ao ler recentes de receitas:', err);
    return [];
  }
}

export async function saveRecentRecipes(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(ids));
}
