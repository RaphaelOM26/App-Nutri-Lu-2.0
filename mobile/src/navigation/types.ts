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
  Barriers: undefined;
  Motivations: undefined;
  Notifications: undefined;
  Ceremony: undefined;
  // Anamnese — as 8 perguntas não clínicas, entre a cerimônia e a estimativa.
  AnamneseIntroComida: undefined;
  AnamnesePreferencias: undefined;
  AnamneseIntroRotina: undefined;
  AnamneseDiaNormal: undefined;
  AnamneseLimitacoes: undefined;
  AnamneseIntroCorpo: undefined;
  AnamneseFomeDoces: undefined;
  AnamneseAguaSono: undefined;
  Estimate: undefined;
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
    /** Código NL-### do livro da nutri — usado pela sugestão da Lu, que só
     *  carrega o id e deixa a tela buscar a receita completa. */
    nutriId?: string;
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
      /** Id do autor — habilita bloquear quem publicou. */
      authorId: string;
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
  // Ativação do acompanhamento. `codigo` chega pelo link da mensagem e só
  // pré-preenche o campo — o resgate continua sendo um toque da pessoa.
  Access: { codigo?: string } | undefined;
  // Plano alimentar premium (feature paga, v1.0) — fluxo Dark Luxe.
  // PlanWeek é a ABA (TabParamList.Plan); estas são telas push por cima.
  PlanMeal: { mealId: string };
  PlanRecipe: { mealId: string };
  PlanReminders: undefined;
};

// Registra o RootStackParamList como o tipo global de navegação.
// É o que faz o `linking` do NavigationContainer casar com as rotas reais —
// sem isso o React Navigation usa um RootParamList vazio e recusa a config.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
