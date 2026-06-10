// Persistência da hidratação POR DIA (copos de 250ml).
// Mesma arquitetura do meals-by-date: Record<YYYY-MM-DD, number>.
// Antes (até 2026-06-10) water era um número global no state — registrar
// água em qualquer dia somava no mesmo contador, vazando entre dias.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/water-by-date';

export type WaterByDate = Record<string, number>;

export async function loadWaterByDate(): Promise<WaterByDate> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WaterByDate) : {};
  } catch (err) {
    console.warn('[storage] falha ao ler water-by-date:', err);
    return {};
  }
}

export async function saveWaterByDate(byDate: WaterByDate): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(byDate));
}
