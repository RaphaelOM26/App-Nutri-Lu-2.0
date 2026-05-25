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

// ─── Seed inicial (mostra dados pra usuário ter contexto na primeira abertura) ──
// Datas relativas a hoje (25 mai no MVP) — vai ser substituído quando user adicionar.
export const SEED_WEIGHT_ENTRIES: WeightEntry[] = [
  { id: 'we_seed_1', date: new Date('2026-05-25').getTime(), kg: 85.2 },
  { id: 'we_seed_2', date: new Date('2026-05-23').getTime(), kg: 85.5 },
  { id: 'we_seed_3', date: new Date('2026-05-21').getTime(), kg: 85.6 },
  { id: 'we_seed_4', date: new Date('2026-05-19').getTime(), kg: 85.8 },
];
