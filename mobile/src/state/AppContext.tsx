// Estado global da app via Context + useReducer.
// Porte do `useAppState()` em Design 2.0/app.jsx, mas usando react-navigation
// para a parte de telas (não precisamos mais de screen/history/params no state).

import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { Alert } from 'react-native';
import {
  INITIAL_MACROS,
  INITIAL_MEALS,
  INITIAL_RECIPES,
  INITIAL_FOOD_DB,
  INITIAL_WATER,
  type DailyMacros,
  type Meal,
  type MealItem,
  type Recipe,
  type Food,
} from '../data/mockData';
import { TACO_FOODS } from '../data/taco';
import { FASTFOOD_FOODS } from '../data/fastfood';

// Base de alimentos: TACO oficial (591) + Fast Food de marcas (334) + 54 marcas/preparações do mock.
// TACO vem primeiro como fonte autoritativa; fast food em seguida pra busca por marca;
// mock antigo no fim como fallback de marcas comerciais (pão, leite, etc.) que TACO não tem.
const FOOD_DB: Food[] = [...TACO_FOODS, ...FASTFOOD_FOODS, ...INITIAL_FOOD_DB];
import {
  loadRecipes,
  saveRecipe,
  deleteRecipe as deleteRecipeStorage,
  type SavedRecipe,
} from '../storage/recipes';
import {
  loadShoppingList,
  saveShoppingList,
  type ShoppingListItem,
} from '../storage/shoppingList';
import {
  loadWeightEntries,
  saveWeightEntries,
  newEntryId,
  type WeightEntry,
} from '../storage/weightEntries';
import {
  loadWeightGoal,
  saveWeightGoal,
  loadMacroTargets,
  saveMacroTargets,
  loadProfilePhoto,
  saveProfilePhoto,
  loadMealReminders,
  saveMealReminders,
  loadReminder,
  loadSilenceAll,
  saveSilenceAll,
  loadName,
  saveName,
  loadGender,
  saveGender,
  loadBirthDate,
  saveBirthDate,
  loadHeight,
  saveHeight,
  loadActivityLevel,
  saveActivityLevel,
  loadGoalType,
  saveGoalType,
  loadWeeklyRate,
  saveWeeklyRate,
  loadBarriers,
  saveBarriers,
  loadMotivations,
  saveMotivations,
  loadOnboardedAt,
  saveOnboardedAt,
  type MacroTargets,
  type MealReminders,
  type Gender,
  type ActivityLevel,
  type GoalType,
} from '../storage/userProfile';
import {
  loadProgressPhotos,
  saveProgressPhotos,
  newPhotoId,
  type ProgressPhoto,
} from '../storage/progressPhotos';
import {
  loadHabits,
  saveHabits,
  newHabitId,
  dayKey,
  type Habit,
} from '../storage/habits';
import {
  loadFavorites,
  saveFavorites,
  loadRecents,
  saveRecents,
  MAX_RECENTS,
} from '../storage/foodPrefs';
import {
  loadFavoriteRecipes,
  saveFavoriteRecipes,
  loadRecentRecipes,
  saveRecentRecipes,
  MAX_RECIPE_RECENTS,
} from '../storage/recipePrefs';
import {
  loadCollections,
  saveCollections,
  newCollectionId,
  type RecipeCollection,
} from '../storage/collections';
import {
  loadPantry,
  savePantry,
  newPantryId,
  type PantryItem,
} from '../storage/pantry';
import {
  loadMealsTemplate,
  saveMealsTemplate,
  loadMealsByDate,
  saveMealsByDate,
  newMealId,
  pickMealColor,
  pickMealImageForName,
  type MealsByDate,
} from '../storage/mealsConfig';
import { loadReadIds, saveReadIds } from '../storage/notifications';
import { type AppNotification } from '../data/notifications';
import { loadCompletedDays, saveCompletedDays, todayKey } from '../storage/completedDays';
import { getDeviceId } from '../storage/deviceId';
import { saveDaySnapshot, getDaySnapshot, type DaySnapshotPayload } from '../api/client';
import {
  reconcileDailyReminders,
  hasNotificationPermission,
  habitNotifId,
  mealNotifId,
  WEIGH_NOTIF_ID,
  type DailyReminderSpec,
} from '../utils/notifications';

// ─── Tipos ───────────────────────────────────────────────────────
// "Hoje" usa a data REAL do dispositivo. Mock de macros/refeições continua o
// mesmo pro dia atual; dias passados mostram empty state (até ter backend).
export const TODAY = new Date().getDate();
export const TODAY_MONTH = new Date().getMonth() + 1; // 1-12
export const TODAY_YEAR = new Date().getFullYear();

type State = {
  water: number;
  /**
   * Items registrados por dia (YYYY-MM-DD → Meal[]). Source of truth pro
   * histórico local. Dia sem entry no map = dia sem registro (mostra empty
   * state ou puxa do backend).
   */
  mealsByDate: MealsByDate;
  /**
   * Config compartilhada das refeições (id, name, time, color, iconSrc). Items
   * ficam zerados aqui — só descreve a estrutura. Renomear "Almoço" muda em
   * todos os dias que herdam o template (= todos exceto os já snapshotados).
   */
  mealsTemplate: Meal[];
  /** YYYY-MM-DD do dia que as telas com DateStrip estão visualizando. */
  selectedDateKey: string;
  /** Targets de macros (vêm do onboarding via macroTargets storage). */
  macroTargets: { kcal: number; p: number; c: number; f: number };
  recipes: Recipe[]; // receitas seed (mock)
  savedRecipes: SavedRecipe[]; // receitas extraídas/salvas pelo usuário
  foodDB: Food[];
  /** IDs de alimentos favoritados (Food.id). Persistido. */
  favoriteFoodIds: string[];
  /** IDs de alimentos vistos recentemente, mais recente primeiro (cap em MAX_RECENTS). Persistido. */
  recentFoodIds: string[];
  /** IDs de receitas favoritadas (seed `r1`/`r2` ou saved `rcp_...`). Persistido. */
  favoriteRecipeIds: string[];
  /** IDs de receitas vistas recentemente, mais recente primeiro (cap em MAX_RECIPE_RECENTS). Persistido. */
  recentRecipeIds: string[];
  /** Coleções nomeadas de receitas. Persistido. */
  collections: RecipeCollection[];
  /** Itens na despensa do usuário. Persistido. */
  pantry: PantryItem[];
  /** Notificações das últimas 24h (mock no MVP — backend depois). */
  notifications: AppNotification[];
  /** IDs de notificações que o user já leu (persistido). */
  readNotificationIds: string[];
  /** dayKeys (YYYY-MM-DD) de dias que o usuário marcou como completos. */
  completedDays: string[];
  shoppingList: ShoppingListItem[];
  weightEntries: WeightEntry[];
  weightGoalKg: number;
  /** Fotos de progresso (antes/depois). Mais recente primeiro. Persistido. */
  progressPhotos: ProgressPhoto[];
  /** Hábitos do usuário com histórico e lembretes. Persistido. */
  habits: Habit[];
  /** URI local da foto de perfil. null = usa as iniciais. Persistido. */
  profilePhotoUri: string | null;
  /** Map mealId → enabled (lembrete por refeição). Persistido. */
  mealReminders: MealReminders;
  /** Silenciar TODAS as notificações (master switch). Persistido. */
  silenceAllNotifications: boolean;
  // ─── Onboarding ──
  /** Nome do user. null = ainda não respondeu. Fallback de display = 'você'. */
  name: string | null;
  /** Sexo biológico (pro cálculo de BMR). null = ainda não respondeu. */
  gender: Gender | null;
  /** Data de nascimento (timestamp ms). null = ainda não respondeu. */
  birthDate: number | null;
  /** Altura em cm. null = ainda não respondeu. */
  heightCm: number | null;
  /** Nível de atividade derivado de treinos/semana. null = ainda não respondeu. */
  activityLevel: ActivityLevel | null;
  /** Objetivo (perder/manter/ganhar). null = ainda não respondeu. */
  goal: GoalType | null;
  /** Ritmo semanal escolhido em kg. null = ainda não respondeu (ou goal=maintain). */
  weeklyRateKg: number | null;
  /** Barreiras escolhidas (multi-select). IDs estáveis. */
  barriers: string[];
  /** Motivações escolhidas (multi-select). IDs estáveis. */
  motivations: string[];
  /** Timestamp de quando o user concluiu o onboarding. null = nunca fez. */
  onboardedAt: number | null;
  // estado de loading da hidratação inicial do AsyncStorage
  hydrated: boolean;
};

type Action =
  | { type: 'ADD_WATER' }
  | { type: 'REMOVE_WATER' }
  | { type: 'REPLACE_DAY'; mealsItems: Record<string, NewMealItemInput[]> }
  | { type: 'RESTORE_DAY_FROM_SNAPSHOT'; payload: DaySnapshotPayload }
  | { type: 'ADD_TO_MEAL'; mealId: string; items: NewMealItemInput[]; total: { kcal: number; p: number; c: number; f: number } }
  | { type: 'SET_SAVED_RECIPES'; recipes: SavedRecipe[] }
  | { type: 'ADD_SAVED_RECIPE'; recipe: SavedRecipe }
  | { type: 'REMOVE_SAVED_RECIPE'; id: string }
  | { type: 'SET_SHOPPING_LIST'; items: ShoppingListItem[] }
  | { type: 'UPSERT_SHOPPING_ITEM'; item: ShoppingListItem }
  | { type: 'REMOVE_SHOPPING_ITEM'; id: string }
  | { type: 'TOGGLE_SHOPPING_CHECKED'; id: string }
  | { type: 'TOGGLE_SHOPPING_PANTRY'; id: string }
  | { type: 'CLEAR_SHOPPING_LIST' }
  | { type: 'SET_WEIGHT_GOAL'; kg: number }
  | { type: 'SET_MACRO_TARGETS'; targets: MacroTargets }
  | { type: 'SET_PROFILE_PHOTO'; uri: string | null }
  | { type: 'SET_MEAL_REMINDERS'; cfg: MealReminders }
  | { type: 'SET_SILENCE_ALL'; silenced: boolean }
  | { type: 'SET_PROGRESS_PHOTOS'; photos: ProgressPhoto[] }
  | { type: 'ADD_PROGRESS_PHOTO'; photo: ProgressPhoto }
  | { type: 'REMOVE_PROGRESS_PHOTO'; id: string }
  | { type: 'SET_HABITS'; habits: Habit[] }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; id: string; patch: Partial<Pick<Habit, 'name' | 'reminderTime'>> }
  | { type: 'REMOVE_HABIT'; id: string }
  | { type: 'TOGGLE_HABIT_TODAY'; id: string; dayKey: string }
  | { type: 'SET_WEIGHT_ENTRIES'; entries: WeightEntry[] }
  | { type: 'ADD_WEIGHT_ENTRY'; entry: WeightEntry }
  | { type: 'REMOVE_WEIGHT_ENTRY'; id: string }
  | { type: 'SET_FAVORITE_FOODS'; ids: string[] }
  | { type: 'TOGGLE_FAVORITE_FOOD'; id: string }
  | { type: 'SET_RECENT_FOODS'; ids: string[] }
  | { type: 'ADD_RECENT_FOOD'; id: string }
  | { type: 'SET_FAVORITE_RECIPES'; ids: string[] }
  | { type: 'TOGGLE_FAVORITE_RECIPE'; id: string }
  | { type: 'SET_RECENT_RECIPES'; ids: string[] }
  | { type: 'ADD_RECENT_RECIPE'; id: string }
  | { type: 'SET_COLLECTIONS'; collections: RecipeCollection[] }
  | { type: 'CREATE_COLLECTION'; name: string; recipeIds: string[] }
  | { type: 'DELETE_COLLECTION'; id: string }
  | { type: 'RENAME_COLLECTION'; id: string; name: string }
  | { type: 'ADD_RECIPE_TO_COLLECTION'; collectionId: string; recipeId: string }
  | { type: 'REMOVE_RECIPE_FROM_COLLECTION'; collectionId: string; recipeId: string }
  | { type: 'SET_PANTRY'; items: PantryItem[] }
  | { type: 'ADD_PANTRY_ITEM'; item: PantryItem }
  | { type: 'REMOVE_PANTRY_ITEM'; id: string }
  | { type: 'CLEAR_PANTRY' }
  | { type: 'HYDRATE_MEALS'; byDate: MealsByDate; template: Meal[] }
  | { type: 'SET_SELECTED_DATE'; dateKey: string }
  | { type: 'SET_MEALS_FOR_DATE'; dateKey: string; meals: Meal[] }
  | { type: 'ADD_MEAL'; meal: Meal }
  | { type: 'UPDATE_MEAL'; id: string; name?: string; time?: string }
  | { type: 'REMOVE_MEAL'; id: string }
  | { type: 'SET_READ_NOTIFICATIONS'; ids: string[] }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_COMPLETED_DAYS'; days: string[] }
  | { type: 'COMPLETE_DAY'; dayKey: string }
  | { type: 'UNCOMPLETE_DAY'; dayKey: string }
  | { type: 'SET_NAME'; name: string | null }
  | { type: 'SET_GENDER'; gender: Gender | null }
  | { type: 'SET_BIRTH_DATE'; ts: number | null }
  | { type: 'SET_HEIGHT'; cm: number | null }
  | { type: 'SET_ACTIVITY_LEVEL'; level: ActivityLevel | null }
  | { type: 'SET_GOAL'; goal: GoalType | null }
  | { type: 'SET_WEEKLY_RATE'; kg: number | null }
  | { type: 'SET_BARRIERS'; ids: string[] }
  | { type: 'SET_MOTIVATIONS'; ids: string[] }
  | { type: 'SET_ONBOARDED_AT'; ts: number | null }
  | { type: 'HYDRATED' };

type NewMealItemInput = {
  name: string;
  portion: string; // ex: "100g"
  amount: number; // multiplicador
  kcal: number;
  p: number;
  c: number;
  f: number;
};

const INITIAL_STATE: State = {
  water: INITIAL_WATER,
  mealsByDate: {},
  mealsTemplate: INITIAL_MEALS,
  selectedDateKey: todayKey(),
  macroTargets: {
    kcal: INITIAL_MACROS.kcal.target,
    p: INITIAL_MACROS.p.target,
    c: INITIAL_MACROS.c.target,
    f: INITIAL_MACROS.f.target,
  },
  recipes: INITIAL_RECIPES,
  savedRecipes: [],
  foodDB: FOOD_DB,
  favoriteFoodIds: [],
  recentFoodIds: [],
  favoriteRecipeIds: [],
  recentRecipeIds: [],
  collections: [],
  pantry: [],
  notifications: [], // user começa sem notificações — futuras virão do backend
  readNotificationIds: [],
  completedDays: [],
  shoppingList: [],
  weightEntries: [],
  weightGoalKg: 82.0,
  progressPhotos: [],
  habits: [],
  profilePhotoUri: null,
  mealReminders: {},
  silenceAllNotifications: false,
  // ─── Onboarding ──
  name: null,
  gender: null,
  birthDate: null,
  heightCm: null,
  activityLevel: null,
  goal: null,
  weeklyRateKg: null,
  barriers: [],
  motivations: [],
  onboardedAt: null,
  hydrated: false,
};

// ─── Helpers de derivação por data ──────────────────────────────
// O state guarda mealsByDate (por dia) e mealsTemplate (config). Tudo que
// "as telas veem" é derivado dessas duas fontes + selectedDateKey.

const cloneTemplate = (template: Meal[]): Meal[] =>
  template.map((m) => ({ ...m, items: [], kcal: 0 }));

/** Refeições do dia (do snapshot do dia, ou template vazio se nunca registrou). */
function mealsForDate(state: State, dateKey: string): Meal[] {
  return state.mealsByDate[dateKey] ?? cloneTemplate(state.mealsTemplate);
}

/** Soma kcal/macros dos items de uma lista de meals. */
function sumMacros(meals: Meal[]): { kcal: number; p: number; c: number; f: number } {
  return meals.reduce(
    (acc, m) => {
      for (const it of m.items) {
        acc.kcal += it.kcal;
        acc.p += it.p;
        acc.c += it.c;
        acc.f += it.f;
      }
      return acc;
    },
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
}

/** Reconstroi um DailyMacros com targets atuais + valores do dia. */
function macrosForDate(state: State, dateKey: string): DailyMacros {
  const sum = sumMacros(mealsForDate(state, dateKey));
  return {
    kcal: { value: sum.kcal, target: state.macroTargets.kcal },
    p: { value: sum.p, target: state.macroTargets.p },
    c: { value: sum.c, target: state.macroTargets.c },
    f: { value: sum.f, target: state.macroTargets.f },
  };
}

const MONTHS_BR_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAY_BR = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** Formata YYYY-MM-DD em "Sábado, 6 de jun" pra usar no Alert. */
function formatDateKeyBR(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  return `${WEEKDAY_BR[date.getDay()]}, ${d} de ${MONTHS_BR_SHORT[m - 1]}`;
}

// ─── Reducer ─────────────────────────────────────────────────────
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_WATER':
      // Sem limite — 8 copos (2000ml) é só a meta diária; o usuário pode beber mais.
      return { ...state, water: state.water + 1 };

    case 'REMOVE_WATER':
      // Pra desfazer cliques acidentais. Nunca vai abaixo de 0.
      return { ...state, water: Math.max(0, state.water - 1) };

    case 'REPLACE_DAY': {
      // Substitui completamente os items de cada refeição NO DIA SELECIONADO.
      // Recalcula totais; armazena em mealsByDate[selectedDateKey].
      const base = mealsForDate(state, state.selectedDateKey);
      const newMeals = base.map((meal) => {
        const items = action.mealsItems[meal.id] || [];
        const mealItems: MealItem[] = items.map((it, idx) => ({
          id: Date.now() + idx + Math.random(),
          q: 'food',
          name: it.name,
          portion: `${Math.round(parseInt(it.portion, 10) * it.amount)}g`,
          kcal: Math.round(it.kcal * it.amount),
          p: Math.round(it.p * it.amount),
          c: Math.round(it.c * it.amount),
          f: Math.round(it.f * it.amount),
        }));
        return { ...meal, items: mealItems, kcal: mealItems.reduce((s, x) => s + x.kcal, 0) };
      });
      return {
        ...state,
        mealsByDate: { ...state.mealsByDate, [state.selectedDateKey]: newMeals },
      };
    }

    case 'RESTORE_DAY_FROM_SNAPSHOT': {
      // Restaura o dia selecionado a partir de payload do backend. Diferente do
      // REPLACE_DAY: items já vêm com kcal/macros computados. Mantém metadata
      // (name/time/color) do template — só items + water são substituídos.
      const base = mealsForDate(state, state.selectedDateKey);
      const newMeals = base.map((meal) => {
        const snap = action.payload.meals.find((m) => m.id === meal.id);
        if (!snap) return { ...meal, items: [], kcal: 0 };
        const items: MealItem[] = snap.items.map((it, idx) => ({
          id: Date.now() + idx + Math.random(),
          q: 'food',
          name: it.name,
          portion: it.portion,
          kcal: it.kcal,
          p: it.p,
          c: it.c,
          f: it.f,
        }));
        return { ...meal, items, kcal: items.reduce((s, x) => s + x.kcal, 0) };
      });
      return {
        ...state,
        mealsByDate: { ...state.mealsByDate, [state.selectedDateKey]: newMeals },
        water: action.payload.water,
      };
    }

    case 'ADD_TO_MEAL': {
      const { mealId, items } = action;
      const base = mealsForDate(state, state.selectedDateKey);
      const newMeals = base.map((m) => {
        if (m.id !== mealId) return m;
        const newItems: MealItem[] = [
          ...m.items,
          ...items.map((it) => ({
            id: Date.now() + Math.random(),
            q: 'food',
            name: it.name,
            portion: `${Math.round(parseInt(it.portion, 10) * it.amount)}g`,
            kcal: Math.round(it.kcal * it.amount),
            p: Math.round(it.p * it.amount),
            c: Math.round(it.c * it.amount),
            f: Math.round(it.f * it.amount),
          })),
        ];
        return { ...m, items: newItems, kcal: newItems.reduce((s, it) => s + it.kcal, 0) };
      });
      return {
        ...state,
        mealsByDate: { ...state.mealsByDate, [state.selectedDateKey]: newMeals },
      };
    }

    case 'SET_SAVED_RECIPES':
      return { ...state, savedRecipes: action.recipes };

    case 'ADD_SAVED_RECIPE': {
      // upsert pelo id
      const idx = state.savedRecipes.findIndex((r) => r.id === action.recipe.id);
      const next = [...state.savedRecipes];
      if (idx >= 0) next[idx] = action.recipe;
      else next.unshift(action.recipe);
      return { ...state, savedRecipes: next };
    }

    case 'REMOVE_SAVED_RECIPE':
      return { ...state, savedRecipes: state.savedRecipes.filter((r) => r.id !== action.id) };

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDateKey: action.dateKey };

    case 'SET_MEALS_FOR_DATE':
      return {
        ...state,
        mealsByDate: { ...state.mealsByDate, [action.dateKey]: action.meals },
      };

    case 'SET_SHOPPING_LIST':
      return { ...state, shoppingList: action.items };

    case 'UPSERT_SHOPPING_ITEM': {
      const idx = state.shoppingList.findIndex((i) => i.id === action.item.id);
      const next = [...state.shoppingList];
      if (idx >= 0) next[idx] = action.item;
      else next.push(action.item);
      return { ...state, shoppingList: next };
    }

    case 'REMOVE_SHOPPING_ITEM':
      return { ...state, shoppingList: state.shoppingList.filter((i) => i.id !== action.id) };

    case 'TOGGLE_SHOPPING_CHECKED':
      return {
        ...state,
        shoppingList: state.shoppingList.map((i) =>
          i.id === action.id ? { ...i, checked: !i.checked } : i,
        ),
      };

    case 'TOGGLE_SHOPPING_PANTRY':
      return {
        ...state,
        shoppingList: state.shoppingList.map((i) =>
          i.id === action.id ? { ...i, inPantry: !i.inPantry, checked: !i.inPantry } : i,
        ),
      };

    case 'CLEAR_SHOPPING_LIST':
      return { ...state, shoppingList: [] };

    case 'SET_WEIGHT_GOAL':
      return { ...state, weightGoalKg: action.kg };

    case 'SET_MACRO_TARGETS':
      return { ...state, macroTargets: action.targets };

    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhotoUri: action.uri };

    case 'SET_MEAL_REMINDERS':
      return { ...state, mealReminders: action.cfg };

    case 'SET_SILENCE_ALL':
      return { ...state, silenceAllNotifications: action.silenced };

    case 'SET_PROGRESS_PHOTOS':
      return { ...state, progressPhotos: action.photos };

    case 'ADD_PROGRESS_PHOTO': {
      const next = [action.photo, ...state.progressPhotos].sort((a, b) => b.date - a.date);
      return { ...state, progressPhotos: next };
    }

    case 'REMOVE_PROGRESS_PHOTO':
      return { ...state, progressPhotos: state.progressPhotos.filter((p) => p.id !== action.id) };

    case 'SET_HABITS':
      return { ...state, habits: action.habits };

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.id ? { ...h, ...action.patch } : h)),
      };

    case 'REMOVE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };

    case 'TOGGLE_HABIT_TODAY':
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.id) return h;
          const isDone = h.completedDays.includes(action.dayKey);
          return {
            ...h,
            completedDays: isDone
              ? h.completedDays.filter((k) => k !== action.dayKey)
              : [...h.completedDays, action.dayKey],
          };
        }),
      };

    case 'SET_WEIGHT_ENTRIES':
      return { ...state, weightEntries: action.entries };

    case 'ADD_WEIGHT_ENTRY': {
      const next = [action.entry, ...state.weightEntries].sort((a, b) => b.date - a.date);
      return { ...state, weightEntries: next };
    }

    case 'REMOVE_WEIGHT_ENTRY':
      return { ...state, weightEntries: state.weightEntries.filter((e) => e.id !== action.id) };

    case 'SET_FAVORITE_FOODS':
      return { ...state, favoriteFoodIds: action.ids };

    case 'TOGGLE_FAVORITE_FOOD': {
      const exists = state.favoriteFoodIds.includes(action.id);
      const next = exists
        ? state.favoriteFoodIds.filter((id) => id !== action.id)
        : [action.id, ...state.favoriteFoodIds];
      return { ...state, favoriteFoodIds: next };
    }

    case 'SET_RECENT_FOODS':
      return { ...state, recentFoodIds: action.ids };

    case 'ADD_RECENT_FOOD': {
      // Move pro topo se já existir; senão adiciona; corta em MAX_RECENTS.
      const filtered = state.recentFoodIds.filter((id) => id !== action.id);
      return { ...state, recentFoodIds: [action.id, ...filtered].slice(0, MAX_RECENTS) };
    }

    case 'SET_FAVORITE_RECIPES':
      return { ...state, favoriteRecipeIds: action.ids };

    case 'TOGGLE_FAVORITE_RECIPE': {
      const exists = state.favoriteRecipeIds.includes(action.id);
      const next = exists
        ? state.favoriteRecipeIds.filter((id) => id !== action.id)
        : [action.id, ...state.favoriteRecipeIds];
      return { ...state, favoriteRecipeIds: next };
    }

    case 'SET_RECENT_RECIPES':
      return { ...state, recentRecipeIds: action.ids };

    case 'ADD_RECENT_RECIPE': {
      const filtered = state.recentRecipeIds.filter((id) => id !== action.id);
      return { ...state, recentRecipeIds: [action.id, ...filtered].slice(0, MAX_RECIPE_RECENTS) };
    }

    case 'SET_COLLECTIONS':
      return { ...state, collections: action.collections };

    case 'CREATE_COLLECTION':
      return {
        ...state,
        collections: [
          { id: newCollectionId(), name: action.name, recipeIds: action.recipeIds, createdAt: Date.now() },
          ...state.collections,
        ],
      };

    case 'DELETE_COLLECTION':
      return { ...state, collections: state.collections.filter((c) => c.id !== action.id) };

    case 'RENAME_COLLECTION':
      return {
        ...state,
        collections: state.collections.map((c) => (c.id === action.id ? { ...c, name: action.name } : c)),
      };

    case 'ADD_RECIPE_TO_COLLECTION':
      return {
        ...state,
        collections: state.collections.map((c) =>
          c.id === action.collectionId && !c.recipeIds.includes(action.recipeId)
            ? { ...c, recipeIds: [...c.recipeIds, action.recipeId] }
            : c,
        ),
      };

    case 'REMOVE_RECIPE_FROM_COLLECTION':
      return {
        ...state,
        collections: state.collections.map((c) =>
          c.id === action.collectionId ? { ...c, recipeIds: c.recipeIds.filter((id) => id !== action.recipeId) } : c,
        ),
      };

    case 'SET_PANTRY':
      return { ...state, pantry: action.items };

    case 'ADD_PANTRY_ITEM': {
      // upsert por nome (case-insensitive) — atualiza qty se já existir
      const lower = action.item.name.toLowerCase().trim();
      const idx = state.pantry.findIndex((it) => it.name.toLowerCase().trim() === lower);
      const next = [...state.pantry];
      if (idx >= 0) next[idx] = { ...next[idx], qty: action.item.qty, expiresAt: action.item.expiresAt ?? next[idx].expiresAt };
      else next.unshift(action.item);
      return { ...state, pantry: next };
    }

    case 'REMOVE_PANTRY_ITEM':
      return { ...state, pantry: state.pantry.filter((it) => it.id !== action.id) };

    case 'CLEAR_PANTRY':
      return { ...state, pantry: [] };

    case 'HYDRATE_MEALS': {
      // Carrega snapshots por data + template do AsyncStorage no boot.
      // Macros e meals visíveis ficam derivados em runtime via mealsForDate().
      return {
        ...state,
        mealsByDate: action.byDate,
        mealsTemplate: action.template,
      };
    }

    case 'ADD_MEAL':
      // Adiciona ao template, ordenando por horário (HH:MM). Refeições
      // pré-existentes em mealsByDate preservam sua config histórica.
      return {
        ...state,
        mealsTemplate: [...state.mealsTemplate, action.meal].sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
      };

    case 'UPDATE_MEAL': {
      // Renomeia/muda horário no template. Dias com snapshot existente
      // mantêm a config que tinham na época — preserva histórico fiel.
      const template = state.mealsTemplate.map((m, idx) => {
        if (m.id !== action.id) return m;
        const nextName = action.name ?? m.name;
        const nextIcon = action.name && action.name !== m.name
          ? pickMealImageForName(nextName, idx)
          : m.iconSrc;
        return { ...m, name: nextName, time: action.time ?? m.time, iconSrc: nextIcon };
      });
      return {
        ...state,
        mealsTemplate: template.sort((a, b) => a.time.localeCompare(b.time)),
      };
    }

    case 'REMOVE_MEAL': {
      // Remove do template. Dias com snapshot preservam — mas item órfão fica
      // (sem matching no template); displayedMeals usa o snapshot inteiro, então
      // continua aparecendo no dia em que foi registrado. Decisão consciente:
      // não corromper histórico ao mudar config futura.
      return {
        ...state,
        mealsTemplate: state.mealsTemplate.filter((m) => m.id !== action.id),
      };
    }

    case 'SET_READ_NOTIFICATIONS':
      return { ...state, readNotificationIds: action.ids };

    case 'MARK_NOTIFICATION_READ': {
      if (state.readNotificationIds.includes(action.id)) return state;
      return { ...state, readNotificationIds: [...state.readNotificationIds, action.id] };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, readNotificationIds: state.notifications.map((n) => n.id) };

    case 'SET_COMPLETED_DAYS':
      return { ...state, completedDays: action.days };

    case 'COMPLETE_DAY':
      if (state.completedDays.includes(action.dayKey)) return state;
      return { ...state, completedDays: [...state.completedDays, action.dayKey] };

    case 'UNCOMPLETE_DAY':
      return { ...state, completedDays: state.completedDays.filter((d) => d !== action.dayKey) };

    // ─── Onboarding ──────────────────────────────────────────────
    case 'SET_NAME':
      return { ...state, name: action.name };

    case 'SET_GENDER':
      return { ...state, gender: action.gender };

    case 'SET_BIRTH_DATE':
      return { ...state, birthDate: action.ts };

    case 'SET_HEIGHT':
      return { ...state, heightCm: action.cm };

    case 'SET_ACTIVITY_LEVEL':
      return { ...state, activityLevel: action.level };

    case 'SET_GOAL':
      return { ...state, goal: action.goal };

    case 'SET_WEEKLY_RATE':
      return { ...state, weeklyRateKg: action.kg };

    case 'SET_BARRIERS':
      return { ...state, barriers: action.ids };

    case 'SET_MOTIVATIONS':
      return { ...state, motivations: action.ids };

    case 'SET_ONBOARDED_AT':
      return { ...state, onboardedAt: action.ts };

    case 'HYDRATED':
      return { ...state, hydrated: true };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────
type AppContextValue = State & {
  /** Refeições do dia selecionado — alias retrocompatível de `displayedMeals`. */
  meals: Meal[];
  /** Macros do dia selecionado — alias retrocompatível de `displayedMacros`. */
  dailyMacros: DailyMacros;
  addWater: () => void;
  removeWater: () => void;
  /** Substitui completamente as refeições do dia selecionado. */
  replaceDay: (mealsItems: Record<string, NewMealItemInput[]>) => void;
  /** Restaura o dia a partir de um snapshot do backend (Copiar dia anterior). */
  restoreDayFromSnapshot: (payload: DaySnapshotPayload) => void;
  /**
   * Adiciona items na meal do dia SELECIONADO. Se for dia passado, mostra
   * Alert de confirmação. Retorna true se confirmou, false se cancelou.
   */
  addToMeal: (mealId: string, items: NewMealItemInput[], total: { kcal: number; p: number; c: number; f: number }) => Promise<boolean>;
  addSavedRecipe: (recipe: SavedRecipe) => Promise<void>;
  removeSavedRecipe: (id: string) => Promise<void>;
  /** Seleciona um dia por dateKey YYYY-MM-DD. */
  setSelectedDate: (dateKey: string) => void;
  // Shopping list actions
  upsertShoppingItem: (item: ShoppingListItem) => void;
  removeShoppingItem: (id: string) => void;
  toggleShoppingChecked: (id: string) => void;
  toggleShoppingPantry: (id: string) => void;
  clearShoppingList: () => void;
  // Weight tracking
  addWeightEntry: (kg: number, date?: number) => void;
  removeWeightEntry: (id: string) => void;
  setWeightGoal: (kg: number) => void;
  setMacroTargets: (targets: MacroTargets) => void;
  setProfilePhoto: (uri: string | null) => void;
  setMealReminders: (cfg: MealReminders) => void;
  setSilenceAllNotifications: (silenced: boolean) => void;
  addProgressPhoto: (uri: string, weightKg?: number) => void;
  removeProgressPhoto: (id: string) => void;
  addHabit: (name: string, reminderTime?: string) => Habit;
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'name' | 'reminderTime'>>) => void;
  removeHabit: (id: string) => void;
  toggleHabitToday: (id: string) => void;
  // Favoritos e recentes de alimentos
  toggleFavoriteFood: (id: string) => void;
  addRecentFood: (id: string) => void;
  // Favoritos e recentes de receitas
  toggleFavoriteRecipe: (id: string) => void;
  addRecentRecipe: (id: string) => void;
  // Coleções
  createCollection: (name: string, recipeIds: string[]) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addRecipeToCollection: (collectionId: string, recipeId: string) => void;
  removeRecipeFromCollection: (collectionId: string, recipeId: string) => void;
  // Despensa
  addPantryItem: (input: { name: string; qty: string; cat: string; expiresAt?: string }) => void;
  removePantryItem: (id: string) => void;
  clearPantry: () => void;
  /** True se o nome (substring case-insensitive) bate com algum item da despensa. */
  isInPantry: (name: string) => boolean;
  // Refeições configuráveis
  addMeal: (input: { name: string; time: string }) => void;
  updateMeal: (id: string, input: { name?: string; time?: string }) => void;
  removeMeal: (id: string) => void;
  // Notificações
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  /** Quantidade de notificações ainda não lidas. */
  unreadNotificationsCount: number;
  // Completar dia
  completeDay: (dayKey: string) => void;
  uncompleteDay: (dayKey: string) => void;
  /** true se HOJE já está marcado como completo. */
  todayCompleted: boolean;
  /** Macros do dia selecionado (today = real, outros = zero). */
  displayedMacros: DailyMacros;
  /** Refeições do dia selecionado (today = real, outros = vazias). */
  displayedMeals: Meal[];
  /** true se está visualizando hoje. */
  isToday: boolean;
  // ─── Setters do onboarding ──
  setName: (name: string | null) => void;
  setGender: (gender: Gender | null) => void;
  setBirthDate: (ts: number | null) => void;
  setHeight: (cm: number | null) => void;
  setActivityLevel: (level: ActivityLevel | null) => void;
  setGoal: (goal: GoalType | null) => void;
  setWeeklyRate: (kg: number | null) => void;
  setBarriers: (ids: string[]) => void;
  setMotivations: (ids: string[]) => void;
  setOnboardedAt: (ts: number | null) => void;
  /** true se o user já concluiu o onboarding (onboardedAt != null). */
  isOnboarded: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Em dev, expõe o dispatcher no window pra testes via preview_eval.
  if (__DEV__ && typeof window !== 'undefined') (window as any).__appDispatch = dispatch;

  // Hidratação inicial: carrega receitas + lista de compras + pesagens + prefs de alimento
  useEffect(() => {
    (async () => {
      try {
        const [
          recipes, list, weights, favs, recents, readNotifs, completed,
          favRecipes, recentRecipes, cols, pantry, mealsByDate, mealsTemplate, weightGoal,
          photos, habits, macroTargets, profilePhoto, mealReminders, silenceAll,
          // ─── Onboarding ──
          name, gender, birthDate, heightCm, activityLevel, goalType, weeklyRate,
          barriers, motivations, onboardedAt,
        ] = await Promise.all([
          loadRecipes(),
          loadShoppingList(),
          loadWeightEntries(),
          loadFavorites(),
          loadRecents(),
          loadReadIds(),
          loadCompletedDays(),
          loadFavoriteRecipes(),
          loadRecentRecipes(),
          loadCollections(),
          loadPantry(),
          loadMealsByDate(),
          loadMealsTemplate(),
          loadWeightGoal(),
          loadProgressPhotos(),
          loadHabits(),
          loadMacroTargets(),
          loadProfilePhoto(),
          loadMealReminders(),
          loadSilenceAll(),
          // ─── Onboarding ──
          loadName(),
          loadGender(),
          loadBirthDate(),
          loadHeight(),
          loadActivityLevel(),
          loadGoalType(),
          loadWeeklyRate(),
          loadBarriers(),
          loadMotivations(),
          loadOnboardedAt(),
        ]);
        dispatch({ type: 'SET_SAVED_RECIPES', recipes });
        dispatch({ type: 'SET_SHOPPING_LIST', items: list });
        // App começa SEM pesagens — primeira entrada é registrada na Tela 5 do onboarding.
        dispatch({ type: 'SET_WEIGHT_ENTRIES', entries: weights });
        dispatch({ type: 'SET_FAVORITE_FOODS', ids: favs });
        dispatch({ type: 'SET_RECENT_FOODS', ids: recents });
        dispatch({ type: 'SET_READ_NOTIFICATIONS', ids: readNotifs });
        dispatch({ type: 'SET_COMPLETED_DAYS', days: completed });
        dispatch({ type: 'SET_FAVORITE_RECIPES', ids: favRecipes });
        dispatch({ type: 'SET_RECENT_RECIPES', ids: recentRecipes });
        dispatch({ type: 'SET_COLLECTIONS', collections: cols });
        dispatch({ type: 'SET_PANTRY', items: pantry });
        // Hidrata snapshots por data + template. Se template salvo está vazio,
        // mantém o INITIAL_MEALS do INITIAL_STATE.
        dispatch({
          type: 'HYDRATE_MEALS',
          byDate: mealsByDate,
          template: mealsTemplate && mealsTemplate.length > 0 ? mealsTemplate : INITIAL_MEALS,
        });
        if (weightGoal != null) {
          dispatch({ type: 'SET_WEIGHT_GOAL', kg: weightGoal });
        }
        // App começa sem fotos de progresso — user adiciona conforme quiser.
        dispatch({ type: 'SET_PROGRESS_PHOTOS', photos });
        // App começa sem hábitos — user adiciona conforme quiser via Progresso > Hábitos.
        dispatch({ type: 'SET_HABITS', habits });
        if (macroTargets) {
          dispatch({ type: 'SET_MACRO_TARGETS', targets: macroTargets });
        }
        if (profilePhoto) {
          dispatch({ type: 'SET_PROFILE_PHOTO', uri: profilePhoto });
        }
        dispatch({ type: 'SET_MEAL_REMINDERS', cfg: mealReminders });
        dispatch({ type: 'SET_SILENCE_ALL', silenced: silenceAll });
        // ─── Onboarding ──
        dispatch({ type: 'SET_NAME', name });
        dispatch({ type: 'SET_GENDER', gender });
        dispatch({ type: 'SET_BIRTH_DATE', ts: birthDate });
        dispatch({ type: 'SET_HEIGHT', cm: heightCm });
        dispatch({ type: 'SET_ACTIVITY_LEVEL', level: activityLevel });
        dispatch({ type: 'SET_GOAL', goal: goalType });
        dispatch({ type: 'SET_WEEKLY_RATE', kg: weeklyRate });
        dispatch({ type: 'SET_BARRIERS', ids: barriers });
        dispatch({ type: 'SET_MOTIVATIONS', ids: motivations });
        dispatch({ type: 'SET_ONBOARDED_AT', ts: onboardedAt });
      } catch (err) {
        console.warn('[app] falha ao hidratar:', err);
      } finally {
        dispatch({ type: 'HYDRATED' });
      }
    })();
  }, []);

  // Persistência: shoppingList
  useEffect(() => {
    if (!state.hydrated) return;
    saveShoppingList(state.shoppingList).catch((err) =>
      console.warn('[app] falha ao persistir lista de compras:', err),
    );
  }, [state.shoppingList, state.hydrated]);

  // Persistência: pesagens
  useEffect(() => {
    if (!state.hydrated) return;
    saveWeightEntries(state.weightEntries).catch((err) =>
      console.warn('[app] falha ao persistir pesagens:', err),
    );
  }, [state.weightEntries, state.hydrated]);

  // Persistência: meta de peso
  useEffect(() => {
    if (!state.hydrated) return;
    saveWeightGoal(state.weightGoalKg).catch((err) =>
      console.warn('[app] falha ao persistir meta de peso:', err),
    );
  }, [state.weightGoalKg, state.hydrated]);

  // Persistência: targets de macros (kcal/p/c/f)
  useEffect(() => {
    if (!state.hydrated) return;
    saveMacroTargets(state.macroTargets).catch((err) =>
      console.warn('[app] falha ao persistir macro targets:', err),
    );
  }, [state.macroTargets, state.hydrated]);

  // Persistência: fotos de progresso
  useEffect(() => {
    if (!state.hydrated) return;
    saveProgressPhotos(state.progressPhotos).catch((err) =>
      console.warn('[app] falha ao persistir fotos:', err),
    );
  }, [state.progressPhotos, state.hydrated]);

  // Persistência: hábitos
  useEffect(() => {
    if (!state.hydrated) return;
    saveHabits(state.habits).catch((err) =>
      console.warn('[app] falha ao persistir hábitos:', err),
    );
  }, [state.habits, state.hydrated]);

  // Persistência: foto de perfil
  useEffect(() => {
    if (!state.hydrated) return;
    saveProfilePhoto(state.profilePhotoUri).catch((err) =>
      console.warn('[app] falha ao persistir foto de perfil:', err),
    );
  }, [state.profilePhotoUri, state.hydrated]);

  // Persistência: lembretes de refeições
  useEffect(() => {
    if (!state.hydrated) return;
    saveMealReminders(state.mealReminders).catch((err) =>
      console.warn('[app] falha ao persistir meal reminders:', err),
    );
  }, [state.mealReminders, state.hydrated]);

  // Persistência: silenciar tudo
  useEffect(() => {
    if (!state.hydrated) return;
    saveSilenceAll(state.silenceAllNotifications).catch((err) =>
      console.warn('[app] falha ao persistir silenceAll:', err),
    );
  }, [state.silenceAllNotifications, state.hydrated]);

  // Persistência: favoritos e recentes
  useEffect(() => {
    if (!state.hydrated) return;
    saveFavorites(state.favoriteFoodIds).catch((err) =>
      console.warn('[app] falha ao persistir favoritos:', err),
    );
  }, [state.favoriteFoodIds, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveRecents(state.recentFoodIds).catch((err) =>
      console.warn('[app] falha ao persistir recentes:', err),
    );
  }, [state.recentFoodIds, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveReadIds(state.readNotificationIds).catch((err) =>
      console.warn('[app] falha ao persistir notificações lidas:', err),
    );
  }, [state.readNotificationIds, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveFavoriteRecipes(state.favoriteRecipeIds).catch((err) =>
      console.warn('[app] falha ao persistir favoritos de receitas:', err),
    );
  }, [state.favoriteRecipeIds, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveRecentRecipes(state.recentRecipeIds).catch((err) =>
      console.warn('[app] falha ao persistir recentes de receitas:', err),
    );
  }, [state.recentRecipeIds, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveCollections(state.collections).catch((err) =>
      console.warn('[app] falha ao persistir coleções:', err),
    );
  }, [state.collections, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    savePantry(state.pantry).catch((err) =>
      console.warn('[app] falha ao persistir despensa:', err),
    );
  }, [state.pantry, state.hydrated]);

  // Persistência: template das refeições (config-only, sem items)
  useEffect(() => {
    if (!state.hydrated) return;
    saveMealsTemplate(state.mealsTemplate).catch((err) =>
      console.warn('[app] falha ao persistir template de refeições:', err),
    );
  }, [state.mealsTemplate, state.hydrated]);

  // Persistência: snapshots por data
  useEffect(() => {
    if (!state.hydrated) return;
    saveMealsByDate(state.mealsByDate).catch((err) =>
      console.warn('[app] falha ao persistir meals por data:', err),
    );
  }, [state.mealsByDate, state.hydrated]);

  // Auto-save do snapshot do dia ATUAL no backend (debounce 3s). Snapshot vai
  // sempre pra todayKey() — dias passados editados pelo user não disparam upload
  // nesse useEffect (são reflexivos: vieram do backend). Se um dia passado for
  // editado, o próximo sync por-dia (se implementado) cuida; por enquanto fica
  // só local.
  //
  // Falhas silenciosas (offline, backend down): logamos um warning mas não
  // mostramos toast — UX limpa, retry vai acontecer na próxima mudança.
  const saveSnapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    if (saveSnapshotTimerRef.current) clearTimeout(saveSnapshotTimerRef.current);
    saveSnapshotTimerRef.current = setTimeout(async () => {
      try {
        const deviceId = await getDeviceId();
        const today = todayKey();
        const todayMeals = mealsForDate(state, today);
        const todayMacros = sumMacros(todayMeals);
        const payload: DaySnapshotPayload = {
          meals: todayMeals.map((m) => ({
            id: m.id,
            items: m.items.map((it) => ({
              id: String(it.id),
              name: it.name,
              portion: it.portion,
              kcal: it.kcal,
              p: it.p,
              c: it.c,
              f: it.f,
            })),
          })),
          macros: todayMacros,
          water: state.water,
        };
        await saveDaySnapshot(deviceId, today, payload);
      } catch (err) {
        console.warn('[day-snapshot] falha no auto-save:', err);
      }
    }, 3000);
    return () => {
      if (saveSnapshotTimerRef.current) clearTimeout(saveSnapshotTimerRef.current);
    };
  }, [state.mealsByDate, state.water, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveCompletedDays(state.completedDays).catch((err) =>
      console.warn('[app] falha ao persistir dias completos:', err),
    );
  }, [state.completedDays, state.hydrated]);

  // Reconciliação dos lembretes agendados no OS (boot + mudanças de config).
  // Compara o que o sistema tem agendado com a config atual e corrige só as
  // diferenças. Recupera: alarmes perdidos (reinício automático do Samsung,
  // update de OS), horários desatualizados (mudar horário da refeição em
  // Configurar refeições não re-agendava a notificação) e órfãos (refeição
  // removida com lembrete ainda ativo). Debounce 2.5s evita churn durante a
  // sequência de dispatches da hidratação.
  const reconcileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    if (reconcileTimerRef.current) clearTimeout(reconcileTimerRef.current);
    reconcileTimerRef.current = setTimeout(async () => {
      try {
        // Sem permissão = nada a reconciliar (e NÃO pedimos prompt no boot).
        if (!(await hasNotificationPermission())) return;
        if (state.silenceAllNotifications) {
          await reconcileDailyReminders([]);
          return;
        }
        const weighCfg = await loadReminder();
        const expected: DailyReminderSpec[] = [];
        if (weighCfg.enabled) {
          expected.push({
            identifier: WEIGH_NOTIF_ID,
            title: 'Hora da pesagem 🥗',
            body: 'Suba na balança e registre seu peso.',
            time: weighCfg.time,
          });
        }
        for (const m of state.mealsTemplate) {
          if (state.mealReminders[m.id]) {
            expected.push({
              identifier: mealNotifId(m.id),
              title: `Hora de ${m.name} 🍽️`,
              body: 'Registre sua refeição pra manter o ritmo dos macros.',
              time: m.time,
            });
          }
        }
        for (const h of state.habits) {
          if (h.reminderTime) {
            expected.push({
              identifier: habitNotifId(h.id),
              title: `${h.name} 💪`,
              body: 'Bata seu hábito de hoje.',
              time: h.reminderTime,
            });
          }
        }
        await reconcileDailyReminders(expected);
      } catch (err) {
        console.warn('[notifications] reconcile no boot falhou:', err);
      }
    }, 2500);
    return () => {
      if (reconcileTimerRef.current) clearTimeout(reconcileTimerRef.current);
    };
  }, [state.hydrated, state.mealsTemplate, state.mealReminders, state.habits, state.silenceAllNotifications]);

  // Sync de dias passados: ao trocar pra um dia sem snapshot local, busca no
  // backend. Se houver snapshot lá, hidrata mealsByDate[dateKey]. Caso contrário
  // o dia continua vazio (empty state). Não fazemos isso pra todayKey() porque
  // o auto-save já está mantendo o backend espelhado.
  useEffect(() => {
    if (!state.hydrated) return;
    const dateKey = state.selectedDateKey;
    if (dateKey === todayKey()) return;
    if (state.mealsByDate[dateKey]) return; // já tem local — não busca de novo
    let cancelled = false;
    (async () => {
      try {
        const deviceId = await getDeviceId();
        const snap = await getDaySnapshot(deviceId, dateKey);
        if (cancelled || !snap) return;
        // Reconstrói meals usando o template atual como esqueleto e populando
        // items do snapshot (mesma lógica do RESTORE_DAY_FROM_SNAPSHOT, mas
        // aplicado a dateKey arbitrário em vez de selectedDateKey).
        const newMeals = state.mealsTemplate.map((meal) => {
          const m = snap.meals.find((sm) => sm.id === meal.id);
          if (!m) return { ...meal, items: [], kcal: 0 };
          const items = m.items.map((it, idx) => ({
            id: Date.now() + idx + Math.random(),
            q: 'food',
            name: it.name,
            portion: it.portion,
            kcal: it.kcal,
            p: it.p,
            c: it.c,
            f: it.f,
          }));
          return { ...meal, items, kcal: items.reduce((s, x) => s + x.kcal, 0) };
        });
        dispatch({ type: 'SET_MEALS_FOR_DATE', dateKey, meals: newMeals });
      } catch (err) {
        console.warn('[day-sync] falha ao buscar snapshot:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.selectedDateKey, state.hydrated, state.mealsByDate, state.mealsTemplate]);

  // ─── Persistência dos campos do onboarding ──
  useEffect(() => {
    if (!state.hydrated) return;
    saveName(state.name).catch((err) => console.warn('[app] falha ao persistir name:', err));
  }, [state.name, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveGender(state.gender).catch((err) => console.warn('[app] falha ao persistir gender:', err));
  }, [state.gender, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveBirthDate(state.birthDate).catch((err) => console.warn('[app] falha ao persistir birthDate:', err));
  }, [state.birthDate, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveHeight(state.heightCm).catch((err) => console.warn('[app] falha ao persistir heightCm:', err));
  }, [state.heightCm, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveActivityLevel(state.activityLevel).catch((err) => console.warn('[app] falha ao persistir activityLevel:', err));
  }, [state.activityLevel, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveGoalType(state.goal).catch((err) => console.warn('[app] falha ao persistir goal:', err));
  }, [state.goal, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveWeeklyRate(state.weeklyRateKg).catch((err) => console.warn('[app] falha ao persistir weeklyRate:', err));
  }, [state.weeklyRateKg, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveBarriers(state.barriers).catch((err) => console.warn('[app] falha ao persistir barriers:', err));
  }, [state.barriers, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveMotivations(state.motivations).catch((err) => console.warn('[app] falha ao persistir motivations:', err));
  }, [state.motivations, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveOnboardedAt(state.onboardedAt).catch((err) => console.warn('[app] falha ao persistir onboardedAt:', err));
  }, [state.onboardedAt, state.hydrated]);

  // ─── Derived ─────────────────────────────────────────────────
  // Meals/macros do dia selecionado: deriva de mealsByDate[selectedDateKey]
  // (ou template vazio). `meals` e `dailyMacros` ficam expostos como aliases
  // pra `displayedMeals`/`displayedMacros` — screens legacy que liam direto
  // continuam funcionando.
  const selectedMeals = mealsForDate(state, state.selectedDateKey);
  const selectedMacros = macrosForDate(state, state.selectedDateKey);
  const isToday = state.selectedDateKey === todayKey();
  const value: AppContextValue = {
    ...state,
    meals: selectedMeals,
    dailyMacros: selectedMacros,
    isToday,
    displayedMacros: selectedMacros,
    displayedMeals: selectedMeals,
    addWater: () => dispatch({ type: 'ADD_WATER' }),
    removeWater: () => dispatch({ type: 'REMOVE_WATER' }),
    replaceDay: (mealsItems) => dispatch({ type: 'REPLACE_DAY', mealsItems }),
    restoreDayFromSnapshot: (payload) => dispatch({ type: 'RESTORE_DAY_FROM_SNAPSHOT', payload }),
    addToMeal: (mealId, items, total) => {
      // Em hoje: dispatch direto, sem fricção.
      if (state.selectedDateKey === todayKey()) {
        dispatch({ type: 'ADD_TO_MEAL', mealId, items, total });
        return Promise.resolve(true);
      }
      // Fora de hoje: pede confirmação. Copy distinta pra passado (correção
      // retroativa) vs futuro (planejamento de refeição).
      const human = formatDateKeyBR(state.selectedDateKey);
      const isFuture = state.selectedDateKey > todayKey();
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          isFuture ? `Planejar pra ${human}?` : `Adicionar em ${human}?`,
          isFuture
            ? 'Essa refeição vai ser registrada numa data futura, como parte do seu plano alimentar.'
            : 'Você está vendo outro dia, não o de hoje. Quer mesmo registrar essa refeição nessa data?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            {
              text: isFuture ? 'Planejar' : 'Adicionar mesmo assim',
              onPress: () => {
                dispatch({ type: 'ADD_TO_MEAL', mealId, items, total });
                resolve(true);
              },
            },
          ],
          { cancelable: true, onDismiss: () => resolve(false) },
        );
      });
    },
    addSavedRecipe: async (recipe) => {
      await saveRecipe(recipe);
      dispatch({ type: 'ADD_SAVED_RECIPE', recipe });
    },
    removeSavedRecipe: async (id) => {
      await deleteRecipeStorage(id);
      dispatch({ type: 'REMOVE_SAVED_RECIPE', id });
    },
    setSelectedDate: (dateKey) => dispatch({ type: 'SET_SELECTED_DATE', dateKey }),
    upsertShoppingItem: (item) => dispatch({ type: 'UPSERT_SHOPPING_ITEM', item }),
    removeShoppingItem: (id) => dispatch({ type: 'REMOVE_SHOPPING_ITEM', id }),
    toggleShoppingChecked: (id) => dispatch({ type: 'TOGGLE_SHOPPING_CHECKED', id }),
    toggleShoppingPantry: (id) => dispatch({ type: 'TOGGLE_SHOPPING_PANTRY', id }),
    clearShoppingList: () => dispatch({ type: 'CLEAR_SHOPPING_LIST' }),
    addWeightEntry: (kg, date) =>
      dispatch({ type: 'ADD_WEIGHT_ENTRY', entry: { id: newEntryId(), date: date ?? Date.now(), kg } }),
    removeWeightEntry: (id) => dispatch({ type: 'REMOVE_WEIGHT_ENTRY', id }),
    setWeightGoal: (kg) => dispatch({ type: 'SET_WEIGHT_GOAL', kg }),
    setMacroTargets: (targets) => dispatch({ type: 'SET_MACRO_TARGETS', targets }),
    setProfilePhoto: (uri) => dispatch({ type: 'SET_PROFILE_PHOTO', uri }),
    setMealReminders: (cfg) => dispatch({ type: 'SET_MEAL_REMINDERS', cfg }),
    setSilenceAllNotifications: (silenced) => dispatch({ type: 'SET_SILENCE_ALL', silenced }),
    addProgressPhoto: (uri, weightKg) =>
      dispatch({ type: 'ADD_PROGRESS_PHOTO', photo: { id: newPhotoId(), date: Date.now(), uri, weightKg } }),
    removeProgressPhoto: (id) => dispatch({ type: 'REMOVE_PROGRESS_PHOTO', id }),
    addHabit: (name, reminderTime) => {
      const habit: Habit = { id: newHabitId(), name, reminderTime, completedDays: [] };
      dispatch({ type: 'ADD_HABIT', habit });
      return habit;
    },
    updateHabit: (id, patch) => dispatch({ type: 'UPDATE_HABIT', id, patch }),
    removeHabit: (id) => dispatch({ type: 'REMOVE_HABIT', id }),
    toggleHabitToday: (id) => dispatch({ type: 'TOGGLE_HABIT_TODAY', id, dayKey: dayKey() }),
    toggleFavoriteFood: (id) => dispatch({ type: 'TOGGLE_FAVORITE_FOOD', id }),
    addRecentFood: (id) => dispatch({ type: 'ADD_RECENT_FOOD', id }),
    toggleFavoriteRecipe: (id) => dispatch({ type: 'TOGGLE_FAVORITE_RECIPE', id }),
    addRecentRecipe: (id) => dispatch({ type: 'ADD_RECENT_RECIPE', id }),
    createCollection: (name, recipeIds) => dispatch({ type: 'CREATE_COLLECTION', name, recipeIds }),
    deleteCollection: (id) => dispatch({ type: 'DELETE_COLLECTION', id }),
    renameCollection: (id, name) => dispatch({ type: 'RENAME_COLLECTION', id, name }),
    addRecipeToCollection: (collectionId, recipeId) =>
      dispatch({ type: 'ADD_RECIPE_TO_COLLECTION', collectionId, recipeId }),
    removeRecipeFromCollection: (collectionId, recipeId) =>
      dispatch({ type: 'REMOVE_RECIPE_FROM_COLLECTION', collectionId, recipeId }),
    addPantryItem: (input) =>
      dispatch({
        type: 'ADD_PANTRY_ITEM',
        item: { id: newPantryId(), name: input.name, qty: input.qty, cat: input.cat, expiresAt: input.expiresAt, addedAt: Date.now() },
      }),
    removePantryItem: (id) => dispatch({ type: 'REMOVE_PANTRY_ITEM', id }),
    clearPantry: () => dispatch({ type: 'CLEAR_PANTRY' }),
    isInPantry: (name) => {
      const lower = name.toLowerCase().trim();
      return state.pantry.some((it) => lower.includes(it.name.toLowerCase().trim()) || it.name.toLowerCase().trim().includes(lower));
    },
    addMeal: (input) => {
      const idx = state.mealsTemplate.length;
      const id = newMealId();
      const meal: Meal = {
        id,
        name: input.name,
        q: input.name,
        iconSrc: pickMealImageForName(input.name, idx),
        time: input.time,
        color: pickMealColor(idx),
        kcal: 0,
        items: [],
      };
      dispatch({ type: 'ADD_MEAL', meal });
    },
    updateMeal: (id, input) => dispatch({ type: 'UPDATE_MEAL', id, ...input }),
    removeMeal: (id) => dispatch({ type: 'REMOVE_MEAL', id }),
    markNotificationRead: (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', id }),
    markAllNotificationsRead: () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }),
    unreadNotificationsCount: state.notifications.filter(
      (n) => !state.readNotificationIds.includes(n.id),
    ).length,
    completeDay: (dayKey) => dispatch({ type: 'COMPLETE_DAY', dayKey }),
    uncompleteDay: (dayKey) => dispatch({ type: 'UNCOMPLETE_DAY', dayKey }),
    todayCompleted: state.completedDays.includes(todayKey()),
    // ─── Onboarding ──
    setName: (name) => dispatch({ type: 'SET_NAME', name }),
    setGender: (gender) => dispatch({ type: 'SET_GENDER', gender }),
    setBirthDate: (ts) => dispatch({ type: 'SET_BIRTH_DATE', ts }),
    setHeight: (cm) => dispatch({ type: 'SET_HEIGHT', cm }),
    setActivityLevel: (level) => dispatch({ type: 'SET_ACTIVITY_LEVEL', level }),
    setGoal: (goal) => dispatch({ type: 'SET_GOAL', goal }),
    setWeeklyRate: (kg) => dispatch({ type: 'SET_WEEKLY_RATE', kg }),
    setBarriers: (ids) => dispatch({ type: 'SET_BARRIERS', ids }),
    setMotivations: (ids) => dispatch({ type: 'SET_MOTIVATIONS', ids }),
    setOnboardedAt: (ts) => dispatch({ type: 'SET_ONBOARDED_AT', ts }),
    isOnboarded: state.onboardedAt != null,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}

export type { SavedRecipe, NewMealItemInput, ShoppingListItem, WeightEntry };
