// Persistência da lista de compras via AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nutri-lu/shopping-list';

export type ShoppingListItem = {
  /** ID estável — ex: 'recipe-r1-2' (recipeId + ingredient index) ou 'manual-<random>'. */
  id: string;
  name: string;
  qty: string;
  cat: string;
  checked: boolean;
  inPantry: boolean;
  /** Título da receita de origem (opcional, pra contexto). */
  sourceRecipeTitle?: string;
};

export async function loadShoppingList(): Promise<ShoppingListItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ShoppingListItem[];
  } catch (err) {
    console.warn('[storage] falha ao ler lista de compras:', err);
    return [];
  }
}

export async function saveShoppingList(items: ShoppingListItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── Categorização automática ────────────────────────────────────
// Mapeia o nome do ingrediente para uma categoria do supermercado.
// Heurística simples — palavras-chave em PT-BR.

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Hortifruti: [
    'tomate', 'alface', 'cenoura', 'brócolis', 'brocolis', 'couve', 'espinafre',
    'limão', 'limao', 'maçã', 'maca', 'banana', 'laranja', 'mamão', 'mamao',
    'abacate', 'pepino', 'cebola', 'pimentão', 'pimentao', 'batata', 'beterraba',
    'rúcula', 'rucula', 'agrião', 'agriao', 'tomate-cereja', 'manjericão', 'manjericao',
    'salsa', 'coentro', 'cebolinha', 'gengibre', 'pimenta', 'morango', 'uva',
    'melancia', 'melão', 'melao', 'abacaxi', 'mandioca', 'mandioquinha',
  ],
  Proteínas: [
    'frango', 'peito de frango', 'salmão', 'salmao', 'peixe', 'carne', 'bovina',
    'porco', 'ovos', 'ovo', 'tilápia', 'tilapia', 'atum', 'sardinha', 'camarão',
    'camarao', 'pernil', 'linguiça', 'linguica', 'bacon', 'presunto', 'mortadela',
    'tofu', 'grão-de-bico', 'grao-de-bico', 'feijão', 'feijao', 'lentilha',
  ],
  Laticínios: [
    'leite', 'iogurte', 'queijo', 'requeijão', 'requeijao', 'creme de leite',
    'manteiga', 'margarina', 'cottage', 'ricota', 'mussarela', 'muçarela',
    'parmesão', 'parmesao', 'gorgonzola',
  ],
  Grãos: [
    'arroz', 'aveia', 'quinoa', 'macarrão', 'macarrao', 'massa', 'farinha',
    'pão', 'pao', 'cuscuz', 'milho', 'fubá', 'fuba', 'tapioca', 'cevada',
    'centeio',
  ],
  Temperos: [
    'sal', 'azeite', 'óleo', 'oleo', 'vinagre', 'mostarda', 'ketchup',
    'maionese', 'shoyu', 'molho', 'orégano', 'oregano', 'alecrim', 'tomilho',
    'cominho', 'colorau', 'páprica', 'paprica', 'curry', 'açafrão', 'acafrao',
    'alho',
  ],
};

export function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return 'Outros';
}
