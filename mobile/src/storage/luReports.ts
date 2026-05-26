// Reports locais de respostas ruins da Lu. Backend coleta na Sem 2.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/lu-reports';

export type LuReport = {
  id: string;
  ts: number;
  messageText: string;
  reason?: string;
};

export async function loadReports(): Promise<LuReport[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LuReport[]) : [];
  } catch {
    return [];
  }
}

export async function addReport(r: LuReport): Promise<void> {
  const existing = await loadReports();
  await AsyncStorage.setItem(KEY, JSON.stringify([r, ...existing].slice(0, 100)));
}
