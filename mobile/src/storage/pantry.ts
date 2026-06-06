// Persistência da despensa do usuário via AsyncStorage.
// Despensa = lista de ingredientes que o usuário tem em casa.
// Usada pra (a) saber quais ingredientes da receita já estão disponíveis e
// (b) sugerir receitas que cabem no que o usuário já tem.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/pantry';

export type PantryItem = {
  id: string;
  name: string;
  qty: string;
  cat: string;
  /** Data ISO (YYYY-MM-DD) de validade — opcional. */
  expiresAt?: string;
  addedAt: number;
};

export async function loadPantry(): Promise<PantryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PantryItem[];
    return [];
  } catch (err) {
    console.warn('[storage] falha ao ler despensa:', err);
    return [];
  }
}

export async function savePantry(items: PantryItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function newPantryId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Dias restantes até a validade (ou null se sem data). Negativo = vencido. */
export function daysUntilExpiry(item: PantryItem): number | null {
  if (!item.expiresAt) return null;
  const exp = new Date(item.expiresAt + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - today.getTime()) / 86400000);
}
