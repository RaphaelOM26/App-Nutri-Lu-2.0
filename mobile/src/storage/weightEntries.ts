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

// ─── Seed inicial: 1 ano de pesagens semanais (jornada realista de emagrecimento) ──
// Pessoa começou em ~92kg há 1 ano, perdeu até ~85kg com oscilações típicas
// (plateaus, picos de fim-de-semana, recuperações). Útil pra testar o gráfico
// em todos os períodos (7D / 30D / 90D / 1A / Tudo).
const DAY = 24 * 60 * 60 * 1000;

function generateYearOfWeighIns(): WeightEntry[] {
  const out: WeightEntry[] = [];
  const startKg = 92.0;
  const endKg = 85.2;
  const weeks = 52;
  const now = Date.now();

  // Ruído determinístico por semana — sempre mesmo padrão entre re-renders
  const noiseSeed = [
    +0.3, -0.4, +0.6, -0.2, -0.5, +0.4, -0.3, +0.7, -0.6, -0.2,
    +0.5, -0.4, +0.3, -0.7, +0.4, -0.3, +0.6, -0.5, -0.2, +0.3,
    -0.4, +0.5, -0.6, +0.3, -0.4, +0.7, -0.2, +0.4, -0.5, -0.3,
    +0.6, -0.4, +0.3, -0.5, +0.4, -0.6, +0.3, -0.2, +0.5, -0.4,
    +0.3, -0.5, +0.6, -0.4, +0.3, -0.5, +0.4, -0.3, +0.5, -0.2,
    +0.3, -0.4,
  ];

  for (let w = 0; w < weeks; w++) {
    // Pesagem 1x por semana, na manhã do mesmo dia (ex: domingo)
    const date = now - (weeks - 1 - w) * 7 * DAY;
    // Tendência linear descendente + ruído ± até 0.7kg
    const trendKg = startKg - ((startKg - endKg) * w) / (weeks - 1);
    const kg = Math.round((trendKg + noiseSeed[w]) * 10) / 10;
    out.push({ id: `we_seed_w${w}`, date, kg });
  }

  // Adiciona algumas pesagens extras nas últimas 2 semanas pra simular "registro mais frequente recente"
  const recent = [
    { id: 'we_seed_r1', date: now - 1 * DAY, kg: 85.2 },
    { id: 'we_seed_r2', date: now - 3 * DAY, kg: 85.5 },
    { id: 'we_seed_r3', date: now - 6 * DAY, kg: 85.6 },
    { id: 'we_seed_r4', date: now - 8 * DAY, kg: 85.8 },
    { id: 'we_seed_r5', date: now - 11 * DAY, kg: 85.9 },
  ];
  out.push(...recent);
  return out.sort((a, b) => b.date - a.date);
}

export const SEED_WEIGHT_ENTRIES: WeightEntry[] = generateYearOfWeighIns();
