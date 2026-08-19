// Coleções da aba Descobrir, derivadas das 153 receitas do livro da nutri.
//
// Antes eram 7 coleções herdadas da extração dos PDFs (lu-saudaveis, lu-bolos,
// lu-detox…) com listas de ids fixas. Agora cada coleção é uma REGRA sobre as
// receitas: quando a nutri adicionar a receita 154, ela entra sozinha na
// coleção certa — ninguém precisa lembrar de atualizar uma lista.
//
// A capa é a foto de uma receita da própria coleção, não uma imagem de banco.

import { NUTRI_RECIPES, type NutriRecipe } from './nutriRecipes';
import { fotoDaReceita } from './nutriPhotos';

export type LuCollection = {
  id: string;
  name: string;
  description: string;
  /** Cor de fundo do card (hex direto pra não depender de theme runtime) */
  bgColor: string;
  /** Cor do texto sobre bgColor */
  textColor: string;
  /** Foto de capa — asset empacotado (require) de uma receita da coleção. */
  cover?: number;
  /** IDs das receitas que pertencem a essa coleção. */
  recipeIds: string[];
};

type Regra = {
  id: string;
  name: string;
  description: string;
  bgColor: string;
  onde: (r: NutriRecipe) => boolean;
};

// Ordem pensada pro carrossel: primeiro por momento do dia (que é como a pessoa
// procura receita), depois por tipo de prato, e por último as restrições.
const REGRAS: Regra[] = [
  {
    id: 'lu-cafe',
    name: 'Café da manhã',
    description: 'Pra começar o dia',
    bgColor: '#F0E2C8',
    onde: (r) => r.meals.includes('breakfast'),
  },
  {
    id: 'lu-principais',
    name: 'Almoço e jantar',
    description: 'Refeições completas do livro',
    bgColor: '#DCE6D2',
    onde: (r) => r.meals.includes('lunch') || r.meals.includes('dinner'),
  },
  {
    id: 'lu-lanches',
    name: 'Lanches',
    description: 'Entre uma refeição e outra',
    bgColor: '#D4E0EE',
    onde: (r) => r.meals.includes('snack'),
  },
  {
    id: 'lu-saladas',
    name: 'Saladas',
    description: 'Pra acompanhar ou fazer a refeição',
    bgColor: '#CFE0CC',
    onde: (r) => r.tipo === 'salada',
  },
  {
    id: 'lu-sopas',
    name: 'Sopas e cremes',
    description: 'Quentinhas e reconfortantes',
    bgColor: '#E6D6C2',
    onde: (r) => r.tipo === 'sopa',
  },
  {
    id: 'lu-molhos',
    name: 'Molhos',
    description: 'Pra transformar uma salada simples',
    bgColor: '#EFDCC4',
    onde: (r) => r.tipo === 'molho',
  },
  {
    id: 'lu-bebidas',
    name: 'Chás e bebidas',
    description: 'Sem açúcar e sem cafeína',
    bgColor: '#DCE4D6',
    onde: (r) => r.tipo === 'bebida',
  },
  {
    id: 'lu-doces',
    name: 'Doces e sobremesas',
    description: 'Sem sair da linha',
    bgColor: '#EACBD1',
    onde: (r) => r.tipo === 'sobremesa' || r.tipo === 'bolo' || r.tipo === 'mingau',
  },
  {
    id: 'lu-proteina',
    name: 'Ricas em proteína',
    description: 'Pra saciedade e massa magra',
    bgColor: '#E0D3E8',
    onde: (r) => r.tags.includes('Rico em proteínas'),
  },
  {
    id: 'lu-vegetarianas',
    name: 'Vegetarianas',
    description: 'Sem carne, sem perder proteína',
    bgColor: '#D2E4D8',
    onde: (r) => r.tags.includes('Vegetariana'),
  },
  {
    id: 'lu-sem-gluten',
    name: 'Sem glúten',
    description: 'Receitas sem trigo na composição',
    bgColor: '#E8DFD0',
    // Só as ABSOLUTAS. A tag condicional depende do rótulo do produto, e uma
    // coleção chamada "Sem glúten" não pode conter receita que talvez tenha.
    onde: (r) => r.tags.includes('Sem glúten'),
  },
];

export const LU_COLLECTIONS: LuCollection[] = REGRAS.map((regra) => {
  const receitas = NUTRI_RECIPES.filter(regra.onde);
  return {
    id: regra.id,
    name: regra.name,
    description: regra.description,
    bgColor: regra.bgColor,
    textColor: '#1B1B1B',
    // Capa = primeira receita da coleção que tenha foto.
    cover: receitas.map((r) => fotoDaReceita(r.id)).find((f) => f !== undefined),
    recipeIds: receitas.map((r) => r.id),
  };
  // Coleção vazia não vira card — evita "Sopas e cremes (0)" no carrossel se
  // um dia o filtro deixar de casar com os dados.
}).filter((c) => c.recipeIds.length > 0);

/** Busca uma coleção pelo id. Usada pela tela que lista uma coleção só. */
export function getLuCollection(id: string): LuCollection | null {
  return LU_COLLECTIONS.find((c) => c.id === id) ?? null;
}
