// Persistência da despensa do usuário via AsyncStorage.
// Despensa = lista de ingredientes que o usuário tem em casa.
// Usada pra (a) saber quais ingredientes da receita já estão disponíveis e
// (b) sugerir receitas que cabem no que o usuário já tem.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/pantry';
const SEEDED_KEY = '@nutri-lu/pantry-seeded';

export type PantryItem = {
  id: string;
  name: string;
  qty: string;
  cat: string;
  /** Data ISO (YYYY-MM-DD) de validade — opcional. */
  expiresAt?: string;
  addedAt: number;
};

/** Despensa inicial pra demo na primeira abertura. */
export const SEED_PANTRY: PantryItem[] = [
  { id: 'p_seed_1', name: 'Tomate', qty: '4 un', cat: 'Hortifruti', expiresAt: addDaysISO(2), addedAt: 0 },
  { id: 'p_seed_2', name: 'Alface', qty: '1 maço', cat: 'Hortifruti', expiresAt: addDaysISO(4), addedAt: 0 },
  { id: 'p_seed_3', name: 'Cenoura', qty: '500g', cat: 'Hortifruti', expiresAt: addDaysISO(8), addedAt: 0 },
  { id: 'p_seed_4', name: 'Peito de frango', qty: '600g', cat: 'Proteínas', expiresAt: addDaysISO(3), addedAt: 0 },
  { id: 'p_seed_5', name: 'Ovos', qty: '8 un', cat: 'Proteínas', expiresAt: addDaysISO(15), addedAt: 0 },
  { id: 'p_seed_6', name: 'Arroz integral', qty: '1 kg', cat: 'Grãos', addedAt: 0 },
  { id: 'p_seed_7', name: 'Lentilha', qty: '500g', cat: 'Grãos', addedAt: 0 },
];

function addDaysISO(d: number): string {
  const now = new Date();
  now.setDate(now.getDate() + d);
  return now.toISOString().slice(0, 10);
}

export async function loadPantry(): Promise<PantryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PantryItem[];
    // Primeira vez: semeia pra ter conteúdo demo
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PANTRY));
      await AsyncStorage.setItem(SEEDED_KEY, '1');
      return SEED_PANTRY;
    }
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
