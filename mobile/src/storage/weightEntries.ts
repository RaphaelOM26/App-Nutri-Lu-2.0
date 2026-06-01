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

// ─── Seed inicial: histórico realista de emagrecimento ──
// Pessoa começou em ~92kg há 1 ano e está em ~84,8kg hoje.
// Primeiros ~11 meses: pesagem semanal (uma entrada por semana).
// Últimos 30 dias: pesagem DIÁRIA com flutuações típicas
// (picos de água/sal, rebotes de fim de semana, tendência leve de queda).
const DAY = 24 * 60 * 60 * 1000;

function generateSeedHistory(): WeightEntry[] {
  const out: WeightEntry[] = [];
  const now = Date.now();

  // ── Parte 1: 48 semanas atrás → 5 semanas atrás (pesagem semanal) ──
  // De 92,0kg até ~86,2kg (perda gradual ao longo de ~11 meses)
  const weeklyStartKg = 92.0;
  const weeklyEndKg = 86.2;
  const weeklyCount = 44; // 44 entradas semanais (cobrindo do mês 12 ao mês ~1)
  const weeklyNoise = [
    +0.3, -0.4, +0.6, -0.2, -0.5, +0.4, -0.3, +0.7, -0.6, -0.2,
    +0.5, -0.4, +0.3, -0.7, +0.4, -0.3, +0.6, -0.5, -0.2, +0.3,
    -0.4, +0.5, -0.6, +0.3, -0.4, +0.7, -0.2, +0.4, -0.5, -0.3,
    +0.6, -0.4, +0.3, -0.5, +0.4, -0.6, +0.3, -0.2, +0.5, -0.4,
    +0.3, -0.5, +0.4, -0.3,
  ];
  for (let w = 0; w < weeklyCount; w++) {
    // Semanal começa em -48 semanas e termina em -5 semanas
    const weeksAgo = 48 - w;
    const date = now - weeksAgo * 7 * DAY;
    const trend = weeklyStartKg - ((weeklyStartKg - weeklyEndKg) * w) / (weeklyCount - 1);
    const kg = Math.round((trend + weeklyNoise[w]) * 10) / 10;
    out.push({ id: `we_seed_w${w}`, date, kg });
  }

  // ── Parte 2: últimos 30 dias (pesagem DIÁRIA) ──
  // De ~87,0kg (30 dias atrás) até 84,8kg (hoje) — perda de ~2,2kg no mês.
  // Padrão realista com VARIAÇÕES MAIS FORTES pra estressar o layout do gráfico:
  // picos de água/sal de fim de semana (+0,6 a +1,2kg), quedas pós-jejum,
  // platôs de retenção e rebotes.
  const dailyStartKg = 87.0;
  const dailyEndKg = 84.8;
  const dailyCount = 30;
  // Ruído determinístico (kg) — picos maiores. Fim de semana costuma vir positivo.
  const dailyNoise = [
    +0.30, +0.80, +0.60, -0.20, -0.40, +0.70, +1.00,  // sem 1 (-29 a -23): pico de domingo
    +0.30, -0.30, -0.50, -0.70, -0.30, +0.50, +0.90,  // sem 2 (-22 a -16): queda na semana, sobe sáb-dom
    +0.20, -0.40, -0.80, -0.60, -0.20, +0.40, +0.70,  // sem 3 (-15 a -9): drop mais forte no meio
    +0.10, -0.50, -0.90, -0.50, -0.10, +0.60, +0.80,  // sem 4 (-8 a -2): mínimo histórico no dia -24
    +0.20, -0.40,                                      // últimos 2 (-1, hoje)
  ];
  for (let d = 0; d < dailyCount; d++) {
    const daysAgo = dailyCount - 1 - d; // d=0 → 29 dias atrás; d=29 → hoje
    const date = now - daysAgo * DAY;
    const trend = dailyStartKg - ((dailyStartKg - dailyEndKg) * d) / (dailyCount - 1);
    const kg = Math.round((trend + dailyNoise[d]) * 10) / 10;
    out.push({ id: `we_seed_d${d}`, date, kg });
  }

  return out.sort((a, b) => b.date - a.date);
}

export const SEED_WEIGHT_ENTRIES: WeightEntry[] = generateSeedHistory();
