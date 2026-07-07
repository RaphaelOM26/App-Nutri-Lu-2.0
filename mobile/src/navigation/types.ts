// Tipos das rotas — usados pra inferir params no `useRoute()` e `navigation.navigate()`.

import type { Recipe, Food } from '../data/mockData';
import type { ExtractedRecipe, FoodAnalysis } from '../api/client';
import type { SavedRecipe } from '../storage/recipes';

// Tabs (bottom tab navigator)
export type TabParamList = {
  Home: undefined;
  Diary: undefined;
  Recipes: undefined;
  // Plano alimentar premium (feature paga) — aba própria no menu inferior.
  Plan: undefined;
  Progress: undefined;
  Profile: undefined;
};

// Stack do onboarding (rodado quando onboardedAt == null).
// Na Fase A só tem Welcome como placeholder. Fase B expande pras 16 telas reais.
// Tela "Projection" foi dropada em 2026-06-05 após validação do protótipo
// Claude Design — ver ONBOARDING_SPEC.md §5 nota da Tela 11.
export type OnboardingStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Gender: undefined;
  BirthDate: undefined;
  HeightWeight: undefined;
  Activity: undefined;
  LuExplains: undefined;
  Goal: undefined;
  DesiredWeight: undefined;
  Speed: undefined;
  Barriers: undefined;
  Motivations: undefined;
  Notifications: undefined;
  Ceremony: undefined;
  Generating: undefined;
  PlanReady: undefined;
};

// Root stack (contém as tabs + telas modais fullscreen)
export type RootStackParamList = {
  Tabs: undefined;
  // Diário
  AddFood: { mealId?: string };
  FoodDetail: { food: Food; mealId?: string };
  // Câmera & IA — mealId opcional flui da origem (AddFood/Diary/etc.)
  Camera: { mode?: 'food' | 'recipe' | 'pantry'; mealId?: string };
  CameraLoading: { imageBase64: string; mode: 'food' | 'recipe' | 'pantry'; mealId?: string };
  CameraResult: { analysis: FoodAnalysis; imageDataUrl: string; mode?: 'food' | 'pantry'; mealId?: string };
  Voice: { mealId?: string };
  Barcode: { mealId?: string };
  // Receitas
  ImportRecipe: undefined;
  RecipeDetail: {
    recipe?: Recipe;
    saved?: SavedRecipe;
    extracted?: ExtractedRecipe & { sourceUrl?: string; imageDataUrl?: string };
    /**
     * Contexto quando aberta do feed da comunidade (junto de `extracted` com o
     * payload da receita pública): habilita a UI de avaliação por estrelas.
     * Sem isso a tela se comporta como sempre.
     */
    community?: {
      id: string;
      authorName: string;
      avgStars: number | null;
      ratingCount: number;
      myStars: number | null;
      isMine: boolean;
    };
  };
  /** Tela de receitas curadas da Lu. collectionId opcional filtra por coleção. */
  LuRecipes: { collectionId?: string };
  // Chat + planner + lista
  ChatLu: undefined;
  Planner: undefined;
  ShoppingList: undefined;
  // Resumo da jornada (compartilhável)
  JourneySummary: undefined;
  // Convidar amigos
  InviteFriends: undefined;
  // Plano alimentar premium (feature paga, v1.0) — fluxo Dark Luxe.
  // PlanWeek é a ABA (TabParamList.Plan); estas são telas push por cima.
  PlanMeal: { mealId: string };
  PlanRecipe: { mealId: string };
  PlanReminders: undefined;
};
