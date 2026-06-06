// Persistência de pesagens via AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/weight-entries';

export type WeightEntry = {
  id: string;
  date: number; // timestamp em ms
  kg: number; // ex: 85.2
};

export async function loadWeightEntries(): Promise<WeightEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as WeightEntry[];
    // Mais recente primeiro
    return arr.sort((a, b) => b.date - a.date);
  } catch (err) {
    console.warn('[storage] falha ao ler pesagens:', err);
    return [];
  }
}

export async function saveWeightEntries(entries: WeightEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function newEntryId(): string {
  return `we_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
