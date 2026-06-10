// Persistência das refeições do usuário.
//
// Dois conceitos separados:
//
// 1. TEMPLATE (`@nutri-lu/meals-template`) — config compartilhada entre dias:
//    id, name, time, color, iconSrc. SEM items, SEM kcal. É o "esqueleto" que
//    cada dia herda. Renomear "Almoço" pra "Refeição pós-treino" muda em todo
//    dia que ainda não tinha snapshot próprio.
//
// 2. POR DIA (`@nutri-lu/meals-by-date`) — Record<YYYY-MM-DD, Meal[]>: para
//    cada dia em que o user registrou algo, guarda as meals COM items.
//    Source of truth pro histórico local. Backend serve como espelho/recovery.
//
// Migração legacy: até 2026-06-08 existia `@nutri-lu/meals-config` (Meal[]
// plano sem data). Na primeira leitura nova-versão, se a chave legacy existir,
// extrai o template e joga os items todos como sendo de "hoje" no by-date.
// Trade-off aceitável: user perde a noção de em que dia exatamente registrou
// (já estava confuso de qualquer jeito por causa do bug), mas não perde dados.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Meal } from '../data/mockData';

const LEGACY_KEY = '@nutri-lu/meals-config';
const TEMPLATE_KEY = '@nutri-lu/meals-template';
const BY_DATE_KEY = '@nutri-lu/meals-by-date';

export type MealsByDate = Record<string, Meal[]>;

/**
 * Carrega o template (config-only) das refeições. Retorna null se nunca foi
 * salvo — AppContext deve cair no INITIAL_MEALS.
 */
export async function loadMealsTemplate(): Promise<Meal[] | null> {
  try {
    const raw = await AsyncStorage.getItem(TEMPLATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Meal[];
  } catch (err) {
    console.warn('[storage] falha ao ler template de refeições:', err);
    return null;
  }
}

export async function saveMealsTemplate(template: Meal[]): Promise<void> {
  // Persiste apenas a "casca" — id/name/time/color/iconSrc/q. Items/kcal são
  // por-dia e não pertencem ao template.
  const sanitized = template.map((m) => ({
    ...m,
    items: [],
    kcal: 0,
  }));
  await AsyncStorage.setItem(TEMPLATE_KEY, JSON.stringify(sanitized));
}

/**
 * Carrega o mapa data→meals. Faz migração transparente da chave legacy se
 * encontrar `@nutri-lu/meals-config` antigo (Meal[] plano sem data) e não
 * tiver ainda a nova chave.
 */
export async function loadMealsByDate(): Promise<MealsByDate> {
  try {
    const raw = await AsyncStorage.getItem(BY_DATE_KEY);
    if (raw) return JSON.parse(raw) as MealsByDate;
    // Migração: chave nova não existe — tenta legacy.
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) return {};
    const legacy = JSON.parse(legacyRaw) as Meal[];
    // Heurística de migração: items que estavam "vazando" como hoje viram um
    // snapshot fixo de hoje. Backend (saveDaySnapshot) já tem o snapshot real
    // com a data certa — esse fallback só protege quem nunca chegou a syncar.
    const today = todayKeyInternal();
    const migrated: MealsByDate = legacy.some((m) => m.items.length > 0)
      ? { [today]: legacy }
      : {};
    await AsyncStorage.setItem(BY_DATE_KEY, JSON.stringify(migrated));
    // A config legacy (refeições renomeadas/adicionadas/horários) também vira
    // o TEMPLATE — sem isso, user com refeições customizadas voltaria pro
    // default em todos os outros dias. Só escreve se o template novo ainda
    // não existir (não sobrescreve config pós-migração).
    const existingTemplate = await AsyncStorage.getItem(TEMPLATE_KEY);
    if (!existingTemplate && legacy.length > 0) {
      const template = legacy.map((m) => ({ ...m, items: [], kcal: 0 }));
      await AsyncStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
    }
    await AsyncStorage.removeItem(LEGACY_KEY);
    return migrated;
  } catch (err) {
    console.warn('[storage] falha ao ler meals-by-date (ou migrar legacy):', err);
    return {};
  }
}

export async function saveMealsByDate(byDate: MealsByDate): Promise<void> {
  await AsyncStorage.setItem(BY_DATE_KEY, JSON.stringify(byDate));
}

// Helper local pra evitar dep circular com completedDays.ts (que importa daqui
// indiretamente via outros módulos). Mesma fórmula do todayKey() do app.
function todayKeyInternal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function newMealId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// Paleta pra refeições custom (rotaciona)
export const MEAL_COLORS = ['#EACBD1', '#D6E0CF', '#D4E0EE', '#C0CFE6', '#F1E0CB', '#E2D1E8'];

// Helper pra montar URL do Unsplash a partir do ID da foto.
// `crop=center` centraliza literalmente (bom pra fotos com objeto central, ex: shake);
// `crop=entropy` deixa o CDN escolher o foco (bom pra pratos cheios).
const MEAL_IMG = (id: string, crop: 'entropy' | 'center' = 'entropy') =>
  `https://images.unsplash.com/photo-${id}?w=240&h=240&fit=crop&crop=${crop}&auto=format&q=75`;

// Imagens default pra refeições custom (rotaciona quando nome não bate palavra-chave)
const DEFAULT_MEAL_IMAGES = [
  MEAL_IMG('1495474472287-4d71bcdd2085'), // café preto + pão
  MEAL_IMG('1567620905732-2d1ec7ab7445'), // panqueca / prato proteico
  MEAL_IMG('1528735602780-2552fd46c7af'), // sanduíche lateral
  MEAL_IMG('1467003909585-2f8a72700288'), // jantar com proteína
];

// Mapeia palavras-chave no nome da refeição → foto temática.
// Match por substring case-insensitive; primeira regra que casa vence.
// Mantém ordem de especificidade (treino vem antes de "lanche" porque
// pessoas escrevem "lanche pré-treino" às vezes).
type NameRule = { keywords: string[]; photoId: string; crop?: 'entropy' | 'center' };
const NAME_TO_IMAGE: NameRule[] = [
  // Pré/pós treino — smoothie rosa em copo de vidro + scoop ao lado.
  // Foto escolhida pelo Raphael:
  // https://unsplash.com/pt-br/fotografias/liquido-rosa-em-vidro-transparente-C05u9Xh37to
  {
    keywords: [
      'pre-treino', 'pré-treino', 'pre treino', 'pré treino',
      'pos-treino', 'pós-treino', 'pos treino', 'pós treino',
      'treino', 'shake', 'whey', 'protein', 'proteico', 'proteína',
    ],
    photoId: '1579722821273-0f6c7d44362f',
    crop: 'entropy',
  },
  // Vitamina / smoothie isolado
  { keywords: ['vitamina', 'smoothie', 'batida'], photoId: '1502741224143-90386d7f8c82', crop: 'center' },
  // Suco verde / detox
  { keywords: ['suco', 'detox', 'verde'], photoId: '1622597467836-f3285f2131b8', crop: 'center' },
  // Café da manhã
  { keywords: ['café da manhã', 'cafe da manha', 'breakfast', 'café'], photoId: '1495474472287-4d71bcdd2085' },
  // Almoço
  { keywords: ['almoço', 'almoco', 'lunch'], photoId: '1567620905732-2d1ec7ab7445' },
  // Lanche / merenda
  { keywords: ['lanche', 'merenda', 'snack'], photoId: '1528735602780-2552fd46c7af' },
  // Jantar
  { keywords: ['jantar', 'dinner', 'janta'], photoId: '1467003909585-2f8a72700288' },
  // Ceia / antes de dormir — chá ou algo leve
  { keywords: ['ceia', 'antes de dormir', 'noturno', 'chá', 'cha'], photoId: '1597481499750-3e6b22637e12' },
  // Brunch
  { keywords: ['brunch'], photoId: '1525351484163-7529414344d8' },
  // Sobremesa
  { keywords: ['sobremesa', 'doce', 'dessert'], photoId: '1551024601-bec78aea704b' },
];

export function pickMealColor(index: number): string {
  return MEAL_COLORS[index % MEAL_COLORS.length];
}

export function pickMealImage(index: number): string {
  return DEFAULT_MEAL_IMAGES[index % DEFAULT_MEAL_IMAGES.length];
}

/**
 * Tenta achar uma imagem temática pra o nome da refeição.
 * Se nenhuma palavra-chave bate, cai na rotação default.
 */
export function pickMealImageForName(name: string, fallbackIndex: number): string {
  const lower = name.toLowerCase().trim();
  for (const rule of NAME_TO_IMAGE) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return MEAL_IMG(rule.photoId, rule.crop);
    }
  }
  return pickMealImage(fallbackIndex);
}
