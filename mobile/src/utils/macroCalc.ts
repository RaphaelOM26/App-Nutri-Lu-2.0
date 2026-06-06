// Cálculo de metas calóricas e macros a partir do perfil do onboarding.
//
// BMR via Mifflin-St Jeor (mais preciso e usado clinicamente desde 2005).
// TDEE = BMR × fator de atividade.
// Calorias alvo = TDEE ± déficit/superávit, baseado no ritmo semanal escolhido.
// Macros split padrão 30P/40C/30G (% das kcal). Hidratação ~35ml/kg.

import type { Gender, ActivityLevel, GoalType } from '../storage/userProfile';

export type MacroProfile = {
  /** Sexo biológico. Pra 'other', usa média entre female e male. */
  gender: Gender;
  /** Timestamp ms da data de nascimento. */
  birthDate: number;
  /** Altura em cm (inteiro). */
  heightCm: number;
  /** Peso atual em kg (float). */
  weightKg: number;
  /** Nível de atividade derivado de treinos/semana. */
  activityLevel: ActivityLevel;
  /** Objetivo (perder/manter/ganhar). */
  goal: GoalType;
  /** Ritmo semanal escolhido em kg (0.1 a 1.5). Ignorado se goal='maintain'. */
  weeklyRateKg: number;
};

export type ComputedTargets = {
  /** Calorias diárias (kcal, arredondado pro múltiplo de 10 mais próximo). */
  kcal: number;
  /** Proteína em gramas (arredondado). */
  p: number;
  /** Carboidratos em gramas (arredondado). */
  c: number;
  /** Gordura em gramas (arredondado). */
  f: number;
  /** Hidratação alvo em litros (arredondado a 0.1). */
  waterL: number;
  /** BMR calculado (uso interno e debug). */
  bmr: number;
  /** TDEE calculado (uso interno e debug). */
  tdee: number;
};

// 1 kg de gordura corporal ≈ 7700 kcal (regra clínica clássica).
const KCAL_PER_KG = 7700;

// Fator de atividade por nível (multiplicador sobre BMR pra chegar no TDEE).
// Valores médios da literatura: Harris-Benedict / Mifflin-St Jeor.
const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.375, // 0-2 treinos/semana — atividade leve
  moderate: 1.55,   // 3-5 treinos/semana — atividade moderada
  athlete: 1.725,   // 6+ treinos/semana — atividade intensa
};

// Split padrão de macros (% das calorias). 30/40/30 funciona bem pra maioria dos perfis.
const PROTEIN_PCT = 0.30;
const CARBS_PCT = 0.40;
const FAT_PCT = 0.30;

// Calorias por grama de cada macro.
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;

// Hidratação alvo (ml por kg de peso corporal).
const WATER_ML_PER_KG = 35;

/**
 * Calcula a idade em anos a partir do timestamp de nascimento.
 * Considera ano bissexto e mês/dia exato (não só ano - ano).
 */
export function ageFromBirthDate(birthDate: number, now: number = Date.now()): number {
  const birth = new Date(birthDate);
  const today = new Date(now);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * BMR via Mifflin-St Jeor (1990, revisada 2005).
 *
 * Female: 10*W + 6.25*H - 5*A - 161
 * Male:   10*W + 6.25*H - 5*A + 5
 * Other:  média dos dois acima
 */
export function computeBMR(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const { gender, weightKg: W, heightCm: H, ageYears: A } = params;
  const base = 10 * W + 6.25 * H - 5 * A;
  if (gender === 'female') return base - 161;
  if (gender === 'male') return base + 5;
  // 'other' — média dos dois pra não favorecer nenhum estimativa
  return base + (5 + -161) / 2; // = base - 78
}

/**
 * Calcula todos os targets do user a partir do perfil completo.
 * Retorna kcal/p/c/f/waterL prontos pra salvar no AppContext.
 */
export function computeMacros(profile: MacroProfile, now: number = Date.now()): ComputedTargets {
  const ageYears = ageFromBirthDate(profile.birthDate, now);
  const bmr = computeBMR({
    gender: profile.gender,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    ageYears,
  });

  const tdee = bmr * ACTIVITY_FACTOR[profile.activityLevel];

  // Déficit/superávit calórico diário a partir do ritmo semanal.
  // 1 kg de gordura ≈ 7700 kcal → déficit diário = (rate * 7700) / 7
  let kcalAdjustment = 0;
  if (profile.goal === 'lose') {
    kcalAdjustment = -(profile.weeklyRateKg * KCAL_PER_KG) / 7;
  } else if (profile.goal === 'gain') {
    kcalAdjustment = (profile.weeklyRateKg * KCAL_PER_KG) / 7;
  }

  // Calorias alvo (arredondado pro múltiplo de 10 mais próximo pra ficar legível)
  const rawKcal = tdee + kcalAdjustment;
  const kcal = Math.max(1200, Math.round(rawKcal / 10) * 10); // safety floor: 1200 kcal (recomendação OMS)

  // Macros em gramas
  const p = Math.round((kcal * PROTEIN_PCT) / KCAL_PER_G_PROTEIN);
  const c = Math.round((kcal * CARBS_PCT) / KCAL_PER_G_CARBS);
  const f = Math.round((kcal * FAT_PCT) / KCAL_PER_G_FAT);

  // Hidratação em litros, arredondada a 0.1L pra ficar amigável
  const waterMl = profile.weightKg * WATER_ML_PER_KG;
  const waterL = Math.round(waterMl / 100) / 10; // 2345ml → 2.3L

  return { kcal, p, c, f, waterL, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

/**
 * Estima quantos dias o user vai levar pra atingir a meta no ritmo escolhido.
 * Retorna 0 se goal='maintain' ou se já atingiu.
 */
export function daysToReachGoal(params: {
  currentWeightKg: number;
  targetWeightKg: number;
  weeklyRateKg: number;
  goal: GoalType;
}): number {
  if (params.goal === 'maintain') return 0;
  const delta = Math.abs(params.targetWeightKg - params.currentWeightKg);
  if (delta < 0.1) return 0;
  if (params.weeklyRateKg <= 0) return 0;
  return Math.ceil((delta / params.weeklyRateKg) * 7);
}

/**
 * Formata uma data futura como "28 de junho" (BR, mês por extenso minúsculo).
 * Usado na pill de meta na tela 17.
 */
export function formatGoalDate(daysFromNow: number, now: number = Date.now()): string {
  const target = new Date(now + daysFromNow * 24 * 60 * 60 * 1000);
  const day = target.getDate();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${day} de ${months[target.getMonth()]}`;
}
