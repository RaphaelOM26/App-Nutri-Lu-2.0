// Persistência de favoritos e recentes do foodDB via AsyncStorage.
// Guardamos apenas IDs (string) — o objeto Food completo vem do FOOD_DB em runtime.

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = '@nutri-lu/food-favorites';
const RECENT_KEY = '@nutri-lu/food-recents';

export const MAX_RECENTS = 30;

export async function loadFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (err) {
    console.warn('[storage] falha ao ler favoritos:', err);
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

export async function loadRecents(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (err) {
    console.warn('[storage] falha ao ler recentes:', err);
    return [];
  }
}

export async function saveRecents(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(ids));
}
