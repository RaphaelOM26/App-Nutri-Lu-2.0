// Persistência de favoritos e recentes de receitas via AsyncStorage.
// Aceita IDs do livro da nutri (`NL-001`) e de receitas salvas pelo usuário
// (`rcp_...`).

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = '@nutri-lu/recipe-favorites';
const RECENT_KEY = '@nutri-lu/recipe-recents';

export const MAX_RECIPE_RECENTS = 20;

// Aparelhos que rodaram versões anteriores guardam ids de um acervo de receitas
// que não existe mais. Eram inofensivos — nada os desreferencia — mas ficariam
// para sempre no armazenamento apontando para o vazio. O filtro abaixo os
// descarta na primeira leitura, e a gravação seguinte persiste a lista limpa.
const ID_DESCONTINUADO = /^r\d+$/;
const limpar = (ids: string[]) => ids.filter((id) => !ID_DESCONTINUADO.test(id));

export async function loadFavoriteRecipes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const guardados = JSON.parse(raw) as string[];
    const validos = limpar(guardados);
    // Regrava só se algo foi descartado, pra não escrever à toa a cada boot.
    if (validos.length !== guardados.length) {
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(validos)).catch(() => {});
    }
    return validos;
  } catch (err) {
    console.warn('[storage] falha ao ler favoritos de receitas:', err);
    return [];
  }
}

export async function saveFavoriteRecipes(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

export async function loadRecentRecipes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const guardados = JSON.parse(raw) as string[];
    const validos = limpar(guardados);
    if (validos.length !== guardados.length) {
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(validos)).catch(() => {});
    }
    return validos;
  } catch (err) {
    console.warn('[storage] falha ao ler recentes de receitas:', err);
    return [];
  }
}

export async function saveRecentRecipes(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(ids));
}
