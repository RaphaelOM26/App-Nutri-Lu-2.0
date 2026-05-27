// Persistência da configuração de refeições do usuário.
// Salva o array completo de Meal[] no AsyncStorage. Items vivem aqui também
// (podem ser efêmeros em runtime — MVP sem histórico backend).

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Meal } from '../data/mockData';

const STORAGE_KEY = '@nutri-lu/meals-config';

export async function loadMealsConfig(): Promise<Meal[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Meal[];
  } catch (err) {
    console.warn('[storage] falha ao ler config de refeições:', err);
    return null;
  }
}

export async function saveMealsConfig(meals: Meal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
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
