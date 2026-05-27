// Tipos das rotas — usados pra inferir params no `useRoute()` e `navigation.navigate()`.

import type { Recipe, Food } from '../data/mockData';
import type { ExtractedRecipe, FoodAnalysis } from '../api/client';
import type { SavedRecipe } from '../storage/recipes';

// Tabs (bottom tab navigator)
export type TabParamList = {
  Home: undefined;
  Diary: undefined;
  Recipes: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Root stack (contém as tabs + telas modais fullscreen)
export type RootStackParamList = {
  Tabs: undefined;
  // Diário
  AddFood: { mealId?: string };
  FoodDetail: { food: Food; mealId?: string };
  // Câmera & IA — mealId opcional flui da origem (AddFood/Diary/etc.)
  Camera: { mode?: 'food' | 'recipe'; mealId?: string };
  CameraLoading: { imageBase64: string; mode: 'food' | 'recipe'; mealId?: string };
  CameraResult: { analysis: FoodAnalysis; imageDataUrl: string; mealId?: string };
  Voice: { mealId?: string };
  Barcode: { mealId?: string };
  // Receitas
  ImportRecipe: undefined;
  RecipeDetail: { recipe?: Recipe; saved?: SavedRecipe; extracted?: ExtractedRecipe & { sourceUrl?: string; imageDataUrl?: string } };
  /** Tela de receitas curadas da Lu. collectionId opcional filtra por coleção. */
  LuRecipes: { collectionId?: string };
  // Chat + planner + lista
  ChatLu: undefined;
  Planner: undefined;
  ShoppingList: undefined;
};
