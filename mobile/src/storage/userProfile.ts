// Persistência de configurações simples do perfil (peso meta + lembretes + dados do onboarding).
// Quando subir o backend (Sem 1-2 do plano de 30d), isso migra pra Supabase.

import AsyncStorage from '@react-native-async-storage/async-storage';

const GOAL_KEY = '@nutri-lu/weight-goal';
const REMINDERS_KEY = '@nutri-lu/reminders';
const MACRO_TARGETS_KEY = '@nutri-lu/macro-targets';
const PROFILE_PHOTO_KEY = '@nutri-lu/profile-photo';
const MEAL_REMINDERS_KEY = '@nutri-lu/meal-reminders';
const SILENCE_ALL_KEY = '@nutri-lu/silence-all';
const THEME_PREF_KEY = '@nutri-lu/theme-pref';
// ─── Onboarding ──
const NAME_KEY = '@nutri-lu/name';
const GENDER_KEY = '@nutri-lu/gender';
const BIRTH_DATE_KEY = '@nutri-lu/birth-date';
const HEIGHT_KEY = '@nutri-lu/height-cm';
const ACTIVITY_LEVEL_KEY = '@nutri-lu/activity-level';
const GOAL_TYPE_KEY = '@nutri-lu/goal';
const WEEKLY_RATE_KEY = '@nutri-lu/weekly-rate';
const BARRIERS_KEY = '@nutri-lu/barriers';
const MOTIVATIONS_KEY = '@nutri-lu/motivations';
const ONBOARDED_AT_KEY = '@nutri-lu/onboarded-at';

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

// ─── Onboarding ────────────────────────────────────────────────
// Tipos sentinela: null = ainda não respondeu. Useful pra detectar perfis pré-onboarding.

export type Gender = 'female' | 'male' | 'other';
export type ActivityLevel = 'sedentary' | 'moderate' | 'athlete';
export type GoalType = 'lose' | 'maintain' | 'gain';

// Nome do usuário (default exibido quando vazio: "você")
export async function loadName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export async function saveName(name: string | null): Promise<void> {
  if (name == null || name.trim().length === 0) {
    await AsyncStorage.removeItem(NAME_KEY);
  } else {
    await AsyncStorage.setItem(NAME_KEY, name.trim());
  }
}

export async function loadGender(): Promise<Gender | null> {
  try {
    const raw = await AsyncStorage.getItem(GENDER_KEY);
    if (raw === 'female' || raw === 'male' || raw === 'other') return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveGender(gender: Gender | null): Promise<void> {
  if (gender == null) {
    await AsyncStorage.removeItem(GENDER_KEY);
  } else {
    await AsyncStorage.setItem(GENDER_KEY, gender);
  }
}

// Data de nascimento como timestamp (ms). Usar Date.getTime() pra serializar.
export async function loadBirthDate(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(BIRTH_DATE_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveBirthDate(ts: number | null): Promise<void> {
  if (ts == null) {
    await AsyncStorage.removeItem(BIRTH_DATE_KEY);
  } else {
    await AsyncStorage.setItem(BIRTH_DATE_KEY, String(ts));
  }
}

// Altura em cm (inteiro). Persistido separado do peso porque peso vive em weightEntries.
export async function loadHeight(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(HEIGHT_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveHeight(cm: number | null): Promise<void> {
  if (cm == null) {
    await AsyncStorage.removeItem(HEIGHT_KEY);
  } else {
    await AsyncStorage.setItem(HEIGHT_KEY, String(Math.round(cm)));
  }
}

export async function loadActivityLevel(): Promise<ActivityLevel | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_LEVEL_KEY);
    if (raw === 'sedentary' || raw === 'moderate' || raw === 'athlete') return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveActivityLevel(level: ActivityLevel | null): Promise<void> {
  if (level == null) {
    await AsyncStorage.removeItem(ACTIVITY_LEVEL_KEY);
  } else {
    await AsyncStorage.setItem(ACTIVITY_LEVEL_KEY, level);
  }
}

export async function loadGoalType(): Promise<GoalType | null> {
  try {
    const raw = await AsyncStorage.getItem(GOAL_TYPE_KEY);
    if (raw === 'lose' || raw === 'maintain' || raw === 'gain') return raw;
    return null;
  } catch {
    return null;
  }
}

export async function saveGoalType(goal: GoalType | null): Promise<void> {
  if (goal == null) {
    await AsyncStorage.removeItem(GOAL_TYPE_KEY);
  } else {
    await AsyncStorage.setItem(GOAL_TYPE_KEY, goal);
  }
}

// Ritmo semanal em kg (0.1 a 1.5). Aplicado como déficit (lose) ou superávit (gain).
export async function loadWeeklyRate(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(WEEKLY_RATE_KEY);
    if (!raw) return null;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveWeeklyRate(kg: number | null): Promise<void> {
  if (kg == null) {
    await AsyncStorage.removeItem(WEEKLY_RATE_KEY);
  } else {
    await AsyncStorage.setItem(WEEKLY_RATE_KEY, String(kg));
  }
}

// Barreiras (multi-select). Array de IDs estáveis: 'consistency' | 'unhealthy_food' | 'no_support' | 'busy' | 'no_inspiration'
export async function loadBarriers(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BARRIERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function saveBarriers(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(BARRIERS_KEY, JSON.stringify(ids));
}

// Motivações (multi-select). Array de IDs: 'eat_better' | 'energy' | 'motivation' | 'body'
export async function loadMotivations(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(MOTIVATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function saveMotivations(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(MOTIVATIONS_KEY, JSON.stringify(ids));
}

// onboardedAt: timestamp de quando o user concluiu o onboarding. null = nunca fez.
// App.tsx usa isso pra rotear: null → OnboardingNavigator, número → Tabs.
export async function loadOnboardedAt(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDED_AT_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveOnboardedAt(ts: number | null): Promise<void> {
  if (ts == null) {
    await AsyncStorage.removeItem(ONBOARDED_AT_KEY);
  } else {
    await AsyncStorage.setItem(ONBOARDED_AT_KEY, String(ts));
  }
}
