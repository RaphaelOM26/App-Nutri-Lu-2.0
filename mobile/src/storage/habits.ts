// Persistência de hábitos do usuário. Cada hábito tem:
//  - id, nome
//  - horário do lembrete (opcional)
//  - histórico de dias concluídos (YYYY-MM-DD)

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/habits';

export type Habit = {
  id: string;
  name: string;
  /** Horário do lembrete diário em HH:MM (24h). undefined = sem lembrete. */
  reminderTime?: string;
  /** Lista de dayKeys (YYYY-MM-DD) em que o hábito foi marcado como concluído. */
  completedDays: string[];
};

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Calcula streak atual: dias consecutivos retrocedendo a partir de hoje (ou ontem se hoje não feito). */
export function calcStreak(completedDays: string[]): number {
  if (!completedDays.length) return 0;
  const set = new Set(completedDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Se hoje não está concluído, começa a contar a partir de ontem (sem zerar)
  let cursor = new Date(today);
  if (!set.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(dayKey(cursor))) return 0;
  }

  let n = 0;
  while (set.has(dayKey(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function newHabitId(): string {
  return `hb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// Seed inicial pra demo (idêntico ao mock antigo, com IDs estáveis e dias concluídos
// retroativos pra refletir streaks visíveis no app).
function seedCompletedDays(days: number): string[] {
  const out: string[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    out.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return out;
}

export const SEED_HABITS: Habit[] = [
  { id: 'hb_seed_sleep', name: 'Dormir 8h', reminderTime: '22:30', completedDays: seedCompletedDays(9) },
  { id: 'hb_seed_water', name: 'Beber 2L de água', reminderTime: '10:00', completedDays: seedCompletedDays(12) },
  { id: 'hb_seed_clean', name: 'Sem ultraprocessados', completedDays: seedCompletedDays(4).slice(1) /* sem hoje */ },
  { id: 'hb_seed_walk', name: 'Caminhada 30min', reminderTime: '18:00', completedDays: seedCompletedDays(7) },
];
