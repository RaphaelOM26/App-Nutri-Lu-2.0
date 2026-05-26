// Persistência só do que importa: IDs lidas. Lista de notifs é seed/derivada.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/notification-read-ids';

export async function loadReadIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch (err) {
    console.warn('[storage] falha ao ler notificações lidas:', err);
    return [];
  }
}

export async function saveReadIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(ids));
}
