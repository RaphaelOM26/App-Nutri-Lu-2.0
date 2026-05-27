// Coleções curadas pela Nutri Lu (diferentes das coleções pessoais do user em /storage/collections.ts).
// Aparecem no carrossel "Coleção da Nutri Lu" da tab Descobrir.
// Os recipeIds vêm de seedRecipes.RECIPE_IDS_BY_COLLECTION (auto-gerado dos PDFs).

import { RECIPE_IDS_BY_COLLECTION } from './seedRecipes';

export type LuCollection = {
  id: string;
  name: string;
  description: string;
  /** Cor de fundo do card (hex direto pra não depender de theme runtime) */
  bgColor: string;
  /** Cor do texto sobre bgColor */
  textColor: string;
  /** Photo ID do Unsplash pra capa do card */
  photoId: string;
  /** IDs de receitas seed que pertencem a essa coleção */
  recipeIds: string[];
};

// Photo helper consistente com o resto do app
const COVER = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=entropy&auto=format&q=75`;

export const LU_COLLECTIONS: LuCollection[] = [
  {
    id: 'lu-saudaveis',
    name: '+100 Receitas saudáveis.',
    description: 'Variedade pra todo dia da semana',
    bgColor: '#DCE6D2', // verde da marca soft
    textColor: '#1B1B1B',
    photoId: '1490645935967-10de6ba17061', // bowl proteico colorido
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-saudaveis'] || [],
  },
  {
    id: 'lu-detox',
    name: 'Sucos detox',
    description: 'Receitas refrescantes pra desintoxicar',
    bgColor: '#C8DCC7', // verde mais saturado
    textColor: '#1B1B1B',
    photoId: '1622597467836-f3285f2131b8', // suco verde detox
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-detox'] || [],
  },
  {
    id: 'lu-bolos',
    name: 'Bolos e brownies',
    description: 'Massas e doces fit',
    bgColor: '#EACBD1', // rosa pastel
    textColor: '#1B1B1B',
    photoId: '1606313564200-e75d5e30476c', // brownie de chocolate
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-bolos'] || [],
  },
  {
    id: 'lu-vitaminas',
    name: 'Vitaminas e sorvetes',
    description: 'Geladinhos e refrescantes',
    bgColor: '#D4E0EE', // azul gelo
    textColor: '#1B1B1B',
    photoId: '1579722821273-0f6c7d44362f', // smoothie rosa em copo
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-vitaminas'] || [],
  },
  {
    id: 'lu-saladas',
    name: 'Saladas e molhos',
    description: 'Folhas, vegetais e dressings',
    bgColor: '#D6E0CF', // verde claro
    textColor: '#1B1B1B',
    photoId: '1512621776951-a57141f2eefd', // salada colorida
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-saladas'] || [],
  },
  {
    id: 'lu-petiscos',
    name: 'Petiscos',
    description: 'Snacks pra reuniões e lanches',
    bgColor: '#F1E0CB', // areia/dourado
    textColor: '#1B1B1B',
    photoId: '1541544741938-0af808871cc0', // mix de petiscos
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-petiscos'] || [],
  },
  {
    id: 'lu-sobremesas',
    name: 'Sobremesas',
    description: 'Doces saudáveis',
    bgColor: '#E2D1E8', // lilás suave
    textColor: '#1B1B1B',
    photoId: '1551024601-bec78aea704b', // sobremesa elegante
    recipeIds: RECIPE_IDS_BY_COLLECTION['lu-sobremesas'] || [],
  },
];

export function getLuCollection(id: string): LuCollection | undefined {
  return LU_COLLECTIONS.find((c) => c.id === id);
}

export function getCoverUrl(c: LuCollection): string {
  return COVER(c.photoId);
}
