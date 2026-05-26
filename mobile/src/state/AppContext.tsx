// Estado global da app via Context + useReducer.
// Porte do `useAppState()` em Design 2.0/app.jsx, mas usando react-navigation
// para a parte de telas (não precisamos mais de screen/history/params no state).

import React, { createContext, useContext, useEffect, useReducer } from 'react';
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
  SEED_WEIGHT_ENTRIES,
  type WeightEntry,
} from '../storage/weightEntries';
import {
  loadFavorites,
  saveFavorites,
  loadRecents,
  saveRecents,
  MAX_RECENTS,
} from '../storage/foodPrefs';
import { loadReadIds, saveReadIds } from '../storage/notifications';
import { seedNotifications, type AppNotification } from '../data/notifications';
import { loadCompletedDays, saveCompletedDays, todayKey } from '../storage/completedDays';

// ─── Tipos ───────────────────────────────────────────────────────
// "Hoje" usa a data REAL do dispositivo. Mock de macros/refeições continua o
// mesmo pro dia atual; dias passados mostram empty state (até ter backend).
export const TODAY = new Date().getDate();
export const TODAY_MONTH = new Date().getMonth() + 1; // 1-12
export const TODAY_YEAR = new Date().getFullYear();

type State = {
  water: number;
  dailyMacros: DailyMacros;
  meals: Meal[];
  recipes: Recipe[]; // receitas seed (mock)
  savedRecipes: SavedRecipe[]; // receitas extraídas/salvas pelo usuário
  foodDB: Food[];
  /** IDs de alimentos favoritados (Food.id). Persistido. */
  favoriteFoodIds: string[];
  /** IDs de alimentos vistos recentemente, mais recente primeiro (cap em MAX_RECENTS). Persistido. */
  recentFoodIds: string[];
  /** Notificações das últimas 24h (mock no MVP — backend depois). */
  notifications: AppNotification[];
  /** IDs de notificações que o user já leu (persistido). */
  readNotificationIds: string[];
  /** dayKeys (YYYY-MM-DD) de dias que o usuário marcou como completos. */
  completedDays: string[];
  shoppingList: ShoppingListItem[];
  weightEntries: WeightEntry[];
  weightGoalKg: number;
  // estado de loading da hidratação inicial do AsyncStorage
  hydrated: boolean;
  // Dia visualizado pelas telas com DateStrip (Home + Diary compartilham)
  selectedDay: number;
};

type Action =
  | { type: 'ADD_WATER' }
  | { type: 'REMOVE_WATER' }
  | { type: 'REPLACE_DAY'; mealsItems: Record<string, NewMealItemInput[]> }
  | { type: 'ADD_TO_MEAL'; mealId: string; items: NewMealItemInput[]; total: { kcal: number; p: number; c: number; f: number } }
  | { type: 'SET_SAVED_RECIPES'; recipes: SavedRecipe[] }
  | { type: 'ADD_SAVED_RECIPE'; recipe: SavedRecipe }
  | { type: 'REMOVE_SAVED_RECIPE'; id: string }
  | { type: 'SET_SELECTED_DAY'; day: number }
  | { type: 'SET_SHOPPING_LIST'; items: ShoppingListItem[] }
  | { type: 'UPSERT_SHOPPING_ITEM'; item: ShoppingListItem }
  | { type: 'REMOVE_SHOPPING_ITEM'; id: string }
  | { type: 'TOGGLE_SHOPPING_CHECKED'; id: string }
  | { type: 'TOGGLE_SHOPPING_PANTRY'; id: string }
  | { type: 'CLEAR_SHOPPING_LIST' }
  | { type: 'SET_WEIGHT_ENTRIES'; entries: WeightEntry[] }
  | { type: 'ADD_WEIGHT_ENTRY'; entry: WeightEntry }
  | { type: 'REMOVE_WEIGHT_ENTRY'; id: string }
  | { type: 'SET_FAVORITE_FOODS'; ids: string[] }
  | { type: 'TOGGLE_FAVORITE_FOOD'; id: string }
  | { type: 'SET_RECENT_FOODS'; ids: string[] }
  | { type: 'ADD_RECENT_FOOD'; id: string }
  | { type: 'SET_READ_NOTIFICATIONS'; ids: string[] }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_COMPLETED_DAYS'; days: string[] }
  | { type: 'COMPLETE_DAY'; dayKey: string }
  | { type: 'UNCOMPLETE_DAY'; dayKey: string }
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
  dailyMacros: INITIAL_MACROS,
  meals: INITIAL_MEALS,
  recipes: INITIAL_RECIPES,
  savedRecipes: [],
  foodDB: FOOD_DB,
  favoriteFoodIds: [],
  recentFoodIds: [],
  notifications: seedNotifications(),
  readNotificationIds: [],
  completedDays: [],
  shoppingList: [],
  weightEntries: [],
  weightGoalKg: 82.0,
  hydrated: false,
  selectedDay: TODAY,
};

// Empty placeholders pra dias diferentes de hoje (MVP — historico real vira com backend)
const EMPTY_MACROS: DailyMacros = {
  kcal: { value: 0, target: INITIAL_MACROS.kcal.target },
  p: { value: 0, target: INITIAL_MACROS.p.target },
  c: { value: 0, target: INITIAL_MACROS.c.target },
  f: { value: 0, target: INITIAL_MACROS.f.target },
};
const EMPTY_MEALS: Meal[] = INITIAL_MEALS.map((m) => ({ ...m, kcal: 0, items: [] }));

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
      // Substitui completamente os items de cada refeição. Recalcula totais.
      const totals = { kcal: 0, p: 0, c: 0, f: 0 };
      const newMeals = state.meals.map((meal) => {
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
        const mealKcal = mealItems.reduce((s, x) => s + x.kcal, 0);
        totals.kcal += mealKcal;
        totals.p += mealItems.reduce((s, x) => s + x.p, 0);
        totals.c += mealItems.reduce((s, x) => s + x.c, 0);
        totals.f += mealItems.reduce((s, x) => s + x.f, 0);
        return { ...meal, items: mealItems, kcal: mealKcal };
      });
      return {
        ...state,
        meals: newMeals,
        dailyMacros: {
          kcal: { ...state.dailyMacros.kcal, value: totals.kcal },
          p: { ...state.dailyMacros.p, value: totals.p },
          c: { ...state.dailyMacros.c, value: totals.c },
          f: { ...state.dailyMacros.f, value: totals.f },
        },
      };
    }

    case 'ADD_TO_MEAL': {
      const { mealId, items, total } = action;
      const meals = state.meals.map((m) => {
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
        return { ...m, items: newItems, kcal: m.kcal + total.kcal };
      });
      return {
        ...state,
        meals,
        dailyMacros: {
          kcal: { ...state.dailyMacros.kcal, value: state.dailyMacros.kcal.value + total.kcal },
          p: { ...state.dailyMacros.p, value: state.dailyMacros.p.value + total.p },
          c: { ...state.dailyMacros.c, value: state.dailyMacros.c.value + total.c },
          f: { ...state.dailyMacros.f, value: state.dailyMacros.f.value + total.f },
        },
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

    case 'SET_SELECTED_DAY':
      return { ...state, selectedDay: action.day };

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

    case 'HYDRATED':
      return { ...state, hydrated: true };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────
type AppContextValue = State & {
  addWater: () => void;
  removeWater: () => void;
  /** Substitui completamente as refeições do dia. Usado pelo "Copiar dia anterior". */
  replaceDay: (mealsItems: Record<string, NewMealItemInput[]>) => void;
  addToMeal: (mealId: string, items: NewMealItemInput[], total: { kcal: number; p: number; c: number; f: number }) => void;
  addSavedRecipe: (recipe: SavedRecipe) => Promise<void>;
  removeSavedRecipe: (id: string) => Promise<void>;
  setSelectedDay: (day: number) => void;
  // Shopping list actions
  upsertShoppingItem: (item: ShoppingListItem) => void;
  removeShoppingItem: (id: string) => void;
  toggleShoppingChecked: (id: string) => void;
  toggleShoppingPantry: (id: string) => void;
  clearShoppingList: () => void;
  // Weight tracking
  addWeightEntry: (kg: number, date?: number) => void;
  removeWeightEntry: (id: string) => void;
  // Favoritos e recentes de alimentos
  toggleFavoriteFood: (id: string) => void;
  addRecentFood: (id: string) => void;
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
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Em dev, expõe o dispatcher no window pra testes via preview_eval.
  // @ts-expect-error - __DEV__ é global do RN
  if (__DEV__ && typeof window !== 'undefined') (window as any).__appDispatch = dispatch;

  // Hidratação inicial: carrega receitas + lista de compras + pesagens + prefs de alimento
  useEffect(() => {
    (async () => {
      try {
        const [recipes, list, weights, favs, recents, readNotifs, completed] = await Promise.all([
          loadRecipes(),
          loadShoppingList(),
          loadWeightEntries(),
          loadFavorites(),
          loadRecents(),
          loadReadIds(),
          loadCompletedDays(),
        ]);
        dispatch({ type: 'SET_SAVED_RECIPES', recipes });
        dispatch({ type: 'SET_SHOPPING_LIST', items: list });
        // Se nunca registrou nada, usa seed pra demo
        dispatch({ type: 'SET_WEIGHT_ENTRIES', entries: weights.length > 0 ? weights : SEED_WEIGHT_ENTRIES });
        dispatch({ type: 'SET_FAVORITE_FOODS', ids: favs });
        dispatch({ type: 'SET_RECENT_FOODS', ids: recents });
        dispatch({ type: 'SET_READ_NOTIFICATIONS', ids: readNotifs });
        dispatch({ type: 'SET_COMPLETED_DAYS', days: completed });
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
    saveCompletedDays(state.completedDays).catch((err) =>
      console.warn('[app] falha ao persistir dias completos:', err),
    );
  }, [state.completedDays, state.hydrated]);

  const isToday = state.selectedDay === TODAY;
  const value: AppContextValue = {
    ...state,
    isToday,
    displayedMacros: isToday ? state.dailyMacros : EMPTY_MACROS,
    displayedMeals: isToday ? state.meals : EMPTY_MEALS,
    addWater: () => dispatch({ type: 'ADD_WATER' }),
    removeWater: () => dispatch({ type: 'REMOVE_WATER' }),
    replaceDay: (mealsItems) => dispatch({ type: 'REPLACE_DAY', mealsItems }),
    addToMeal: (mealId, items, total) => dispatch({ type: 'ADD_TO_MEAL', mealId, items, total }),
    addSavedRecipe: async (recipe) => {
      await saveRecipe(recipe);
      dispatch({ type: 'ADD_SAVED_RECIPE', recipe });
    },
    removeSavedRecipe: async (id) => {
      await deleteRecipeStorage(id);
      dispatch({ type: 'REMOVE_SAVED_RECIPE', id });
    },
    setSelectedDay: (day) => dispatch({ type: 'SET_SELECTED_DAY', day }),
    upsertShoppingItem: (item) => dispatch({ type: 'UPSERT_SHOPPING_ITEM', item }),
    removeShoppingItem: (id) => dispatch({ type: 'REMOVE_SHOPPING_ITEM', id }),
    toggleShoppingChecked: (id) => dispatch({ type: 'TOGGLE_SHOPPING_CHECKED', id }),
    toggleShoppingPantry: (id) => dispatch({ type: 'TOGGLE_SHOPPING_PANTRY', id }),
    clearShoppingList: () => dispatch({ type: 'CLEAR_SHOPPING_LIST' }),
    addWeightEntry: (kg, date) =>
      dispatch({ type: 'ADD_WEIGHT_ENTRY', entry: { id: newEntryId(), date: date ?? Date.now(), kg } }),
    removeWeightEntry: (id) => dispatch({ type: 'REMOVE_WEIGHT_ENTRY', id }),
    toggleFavoriteFood: (id) => dispatch({ type: 'TOGGLE_FAVORITE_FOOD', id }),
    addRecentFood: (id) => dispatch({ type: 'ADD_RECENT_FOOD', id }),
    markNotificationRead: (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', id }),
    markAllNotificationsRead: () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }),
    unreadNotificationsCount: state.notifications.filter(
      (n) => !state.readNotificationIds.includes(n.id),
    ).length,
    completeDay: (dayKey) => dispatch({ type: 'COMPLETE_DAY', dayKey }),
    uncompleteDay: (dayKey) => dispatch({ type: 'UNCOMPLETE_DAY', dayKey }),
    todayCompleted: state.completedDays.includes(todayKey()),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}

export type { SavedRecipe, NewMealItemInput, ShoppingListItem, WeightEntry };
