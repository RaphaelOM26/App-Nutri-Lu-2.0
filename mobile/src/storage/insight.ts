// Cache do insight da Lu por "estado" do dia (hash dos macros/refeições/água).
// Regenera quando o estado muda, não em ciclo fixo. Persiste pra evitar chamada
// desnecessária em remounts (ex: navegar pra outra tab e voltar).

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/daily-insight';

export type CachedInsight = {
  text: string;
  /** Hash do estado em que esse insight foi gerado. */
  stateHash: string;
  /** Tom da mensagem (good/alert) — usado pra colorir o card. */
  tone?: 'good' | 'alert';
};

/** Gera um hash determinístico dos dados que afetam o insight. */
export function makeStateHash(input: {
  kcal: number;
  p: number;
  c: number;
  f: number;
  water: number;
  mealsRegistered: number;
}): string {
  return [input.kcal, input.p, input.c, input.f, input.water, input.mealsRegistered].join('-');
}

export async function loadInsight(): Promise<CachedInsight | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CachedInsight) : null;
  } catch (err) {
    console.warn('[storage] falha ao ler insight:', err);
    return null;
  }
}

export async function saveInsight(c: CachedInsight): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(c));
}
