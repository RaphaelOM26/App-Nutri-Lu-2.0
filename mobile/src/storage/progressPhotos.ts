// Persistência de fotos de progresso (antes/depois).
// Armazena URIs locais retornadas pelo expo-image-picker — as fotos ficam
// no diretório de cache do app. Em produção, deveriam ser copiadas pro
// document directory pra não serem limpas pelo OS.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/progress-photos';

export type ProgressPhoto = {
  id: string;
  uri: string; // file:// URI local
  date: number; // timestamp ms
  weightKg?: number; // peso na data, se houver
};

export async function loadProgressPhotos(): Promise<ProgressPhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ProgressPhoto[];
    return arr.sort((a, b) => b.date - a.date);
  } catch {
    return [];
  }
}

export async function saveProgressPhotos(photos: ProgressPhoto[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

export function newPhotoId(): string {
  return `pp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
