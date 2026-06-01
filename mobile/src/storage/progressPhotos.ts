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

// ─── Seed mock pra testar layout de antes/depois ──
// Imagens Unsplash de fitness/wellness — neutras, com proporção retrato.
// Datas relativas a "agora": a primeira fica ~340 dias atrás (combina com o
// startEntry da seed de pesagens) e a segunda fica em "hoje".
const DAY = 24 * 60 * 60 * 1000;

const SEED_BEFORE_URI =
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=900&fit=crop&q=70&auto=format';
const SEED_AFTER_URI =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=900&fit=crop&q=70&auto=format';

export function buildSeedProgressPhotos(): ProgressPhoto[] {
  const now = Date.now();
  return [
    { id: 'pp_seed_before', date: now - 340 * DAY, weightKg: 92.3, uri: SEED_BEFORE_URI },
    { id: 'pp_seed_after', date: now, weightKg: 84.4, uri: SEED_AFTER_URI },
  ];
}
