// Persistência de configurações simples do perfil (peso meta + lembretes).
// Quando subir o backend (Sem 1-2 do plano de 30d), isso migra pra Supabase.

import AsyncStorage from '@react-native-async-storage/async-storage';

const GOAL_KEY = '@nutri-lu/weight-goal';
const REMINDERS_KEY = '@nutri-lu/reminders';
const MACRO_TARGETS_KEY = '@nutri-lu/macro-targets';
const PROFILE_PHOTO_KEY = '@nutri-lu/profile-photo';
const MEAL_REMINDERS_KEY = '@nutri-lu/meal-reminders';
const SILENCE_ALL_KEY = '@nutri-lu/silence-all';
const THEME_PREF_KEY = '@nutri-lu/theme-pref';

// ─── Preferência de tema ──
export type ThemePref = 'system' | 'light' | 'dark';

export async function loadThemePref(): Promise<ThemePref | null> {
  try {
    const raw = await AsyncStorage.getItem(THEME_PREF_KEY);
    if (raw === 'system' || raw === 'light' || raw === 'dark') return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveThemePref(pref: ThemePref): Promise<void> {
  await AsyncStorage.setItem(THEME_PREF_KEY, pref);
}

export type WeighReminderConfig = {
  /** Lembrete diário de pesagem ativo. */
  enabled: boolean;
  /** Hora do lembrete em formato HH:MM (24h). */
  time: string;
};

export const DEFAULT_REMINDER: WeighReminderConfig = {
  enabled: false,
  time: '07:00',
};

export async function loadWeightGoal(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(GOAL_KEY);
    if (!raw) return null;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveWeightGoal(kg: number): Promise<void> {
  await AsyncStorage.setItem(GOAL_KEY, String(kg));
}

export async function loadReminder(): Promise<WeighReminderConfig> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!raw) return DEFAULT_REMINDER;
    return { ...DEFAULT_REMINDER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDER;
  }
}

export async function saveReminder(cfg: WeighReminderConfig): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(cfg));
}

export type MacroTargets = {
  kcal: number;
  p: number;
  c: number;
  f: number;
};

export async function loadMacroTargets(): Promise<MacroTargets | null> {
  try {
    const raw = await AsyncStorage.getItem(MACRO_TARGETS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MacroTargets;
  } catch {
    return null;
  }
}

export async function saveMacroTargets(targets: MacroTargets): Promise<void> {
  await AsyncStorage.setItem(MACRO_TARGETS_KEY, JSON.stringify(targets));
}

// Foto de perfil (URI local do file:// retornado por expo-image-picker/camera).
export async function loadProfilePhoto(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
  } catch {
    return null;
  }
}

export async function saveProfilePhoto(uri: string | null): Promise<void> {
  if (uri == null) {
    await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
  } else {
    await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
  }
}

// ─── Lembretes de refeições ──
// Map mealId → enabled. O horário é o `time` da própria meal no AppContext.
export type MealReminders = Record<string, boolean>;

export async function loadMealReminders(): Promise<MealReminders> {
  try {
    const raw = await AsyncStorage.getItem(MEAL_REMINDERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MealReminders;
  } catch {
    return {};
  }
}

export async function saveMealReminders(cfg: MealReminders): Promise<void> {
  await AsyncStorage.setItem(MEAL_REMINDERS_KEY, JSON.stringify(cfg));
}

// ─── Silenciar tudo (master switch) ──
export async function loadSilenceAll(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SILENCE_ALL_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function saveSilenceAll(silenced: boolean): Promise<void> {
  await AsyncStorage.setItem(SILENCE_ALL_KEY, String(silenced));
}
