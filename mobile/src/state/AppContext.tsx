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

// ─── Tipos ───────────────────────────────────────────────────────
// "Hoje" no MVP é o dia 25 (alinhado com a data do mock).
// Dias diferentes de 25 mostram empty state — historico real virá com backend.
export const TODAY = 25;

type State = {
  water: number;
  dailyMacros: DailyMacros;
  meals: Meal[];
  recipes: Recipe[]; // receitas seed (mock)
  savedRecipes: SavedRecipe[]; // receitas extraídas/salvas pelo usuário
  foodDB: Food[];
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
  foodDB: INITIAL_FOOD_DB,
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
      return { ...state, water: Math.min(8, state.water + 1) };

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

    case 'HYDRATED':
      return { ...state, hydrated: true };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────
type AppContextValue = State & {
  addWater: () => void;
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

  // Hidratação inicial: carrega receitas + lista de compras + pesagens do AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const [recipes, list, weights] = await Promise.all([
          loadRecipes(),
          loadShoppingList(),
          loadWeightEntries(),
        ]);
        dispatch({ type: 'SET_SAVED_RECIPES', recipes });
        dispatch({ type: 'SET_SHOPPING_LIST', items: list });
        // Se nunca registrou nada, usa seed pra demo
        dispatch({ type: 'SET_WEIGHT_ENTRIES', entries: weights.length > 0 ? weights : SEED_WEIGHT_ENTRIES });
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

  const isToday = state.selectedDay === TODAY;
  const value: AppContextValue = {
    ...state,
    isToday,
    displayedMacros: isToday ? state.dailyMacros : EMPTY_MACROS,
    displayedMeals: isToday ? state.meals : EMPTY_MEALS,
    addWater: () => dispatch({ type: 'ADD_WATER' }),
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}

export type { SavedRecipe, NewMealItemInput, ShoppingListItem, WeightEntry };
