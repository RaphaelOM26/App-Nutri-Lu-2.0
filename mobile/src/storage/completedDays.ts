// Persiste dias "completados" pelo usuário (botão Completar dia).
// Salva dayKeys (YYYY-MM-DD). Dia completado = locked nas refeições.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/completed-days';

export async function loadCompletedDays(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function saveCompletedDays(days: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(days));
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
