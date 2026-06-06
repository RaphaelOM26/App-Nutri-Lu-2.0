// ID anônimo do dispositivo — usado pra associar snapshots de dia no backend
// sem precisar de auth. Gerado no 1º launch, persistido em AsyncStorage.
//
// Trade-off conhecido: reinstalar o app gera um deviceId novo, perdendo o
// histórico anterior. Pro beta fechado de 20 amigos é aceitável; quando
// houver auth real (v0.2), substituímos por user.id do Clerk/Supabase.
//
// Formato: v4 UUID-like — random hex em 5 grupos (8-4-4-4-12). Não é
// criptograficamente forte (usa Math.random), mas o espaço de chaves é
// suficiente pra evitar colisões em qualquer escala plausível.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/device-id';

let cached: string | null = null;

function generateUuidLike(): string {
  const hex = (n: number) =>
    Math.floor(Math.random() * 16 ** n)
      .toString(16)
      .padStart(n, '0');
  return `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(8)}${hex(4)}`;
}

/** Retorna o deviceId atual, gerando + persistindo se for o 1º launch. */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing && existing.length >= 8) {
      cached = existing;
      return existing;
    }
  } catch {
    // ignore — vai gerar novo abaixo
  }
  const id = generateUuidLike();
  cached = id;
  try {
    await AsyncStorage.setItem(KEY, id);
  } catch {
    // ignore — id ainda funciona em memória nesta sessão
  }
  return id;
}
