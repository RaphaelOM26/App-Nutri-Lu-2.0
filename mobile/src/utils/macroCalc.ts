// Estimativa calórica e de macros, pela metodologia da nutricionista.
//
// REGRA CENTRAL: o app estima em FAIXA, nunca em número fechado. Quem
// transforma faixa em meta é a nutricionista, na aprovação do plano. Isso não é
// cautela decorativa — é o que o material dela manda fazer:
//
//   "Os valores em g/kg devem funcionar como faixas de referência, e não como
//    distribuição automática obrigatória."
//
// Escolher o meio da faixa seria a distribuição automática que ela proibiu.
//
// MÉTODO: fórmula de bolso (peso × fator kcal/kg). Harris-Benedict revisada
// roda junto, mas SÓ como verificador silencioso — nunca entra no cálculo dos
// macros. Motivo medido: as regras de g/kg são lineares no peso e a fórmula de
// bolso também, então elas compõem; Harris-Benedict não é linear, e numa
// paciente de 130 kg a meta dele (1.908 kcal) menos proteína e gordura por
// g/kg deixaria 9 g de carboidrato no dia.

import type { Gender, ActivityLevel, GoalType } from '../storage/userProfile';

/** Faixa de referência. O app exibe as duas pontas; nunca elege um valor. */
export type Faixa = { min: number; max: number };

export type MacroProfile = {
  gender: Gender;
  /** Timestamp ms da data de nascimento. */
  birthDate: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
};

/** Motivo pelo qual a estimativa merece o olhar da nutricionista. */
export type AlertaEstimativa =
  | 'META_ACIMA_DO_GASTO'
  | 'DEFICIT_EXCESSIVO'
  | 'ABAIXO_DO_PISO';

export type Estimativa = {
  /** Faixa calórica da fórmula de bolso, arredondada a 50 kcal. */
  kcal: Faixa;
  /**
   * Ponto de trabalho dentro da faixa, arredondado a 50 kcal. Existe porque o
   * anel do diário precisa de UM alvo — não dá pra desenhar progresso contra
   * uma faixa. É rotulado como referência na interface, nunca como meta.
   */
  kcalRef: number;
  /** Faixas de macro em gramas/dia, direto das faixas g/kg do material dela. */
  p: Faixa;
  c: Faixa;
  f: Faixa;
  waterL: number;
  /** Verificação silenciosa. Não aparece pra paciente; alimenta o painel. */
  conferencia: {
    bmr: number;
    /** Gasto energético total por Harris-Benedict × fator de atividade. */
    get: number;
    /** % de déficit da kcalRef contra o GET. Negativo = superávit. */
    deficitPct: number;
    alertas: AlertaEstimativa[];
  };
};

// ─── Fatores por objetivo (material da nutricionista) ──────────────────────
const KCAL_POR_KG: Record<GoalType, Faixa> = {
  lose: { min: 20, max: 25 },
  maintain: { min: 25, max: 30 },
  gain: { min: 30, max: 35 },
};

const PROTEINA_G_KG: Record<GoalType, Faixa> = {
  lose: { min: 1.6, max: 2.0 },
  maintain: { min: 1.4, max: 1.8 },
  gain: { min: 1.6, max: 2.2 },
};

const GORDURA_G_KG: Record<GoalType, Faixa> = {
  lose: { min: 0.8, max: 1.0 },
  maintain: { min: 0.8, max: 1.2 },
  gain: { min: 0.8, max: 1.2 },
};

/** Faixa de referência do carboidrato. Serve pra CONFERIR, não pra impor: na
 *  ordem dela o carboidrato é o que sobra depois de proteína e gordura. */
export const CARBO_G_KG: Record<GoalType, Faixa> = {
  lose: { min: 2.0, max: 3.0 },
  maintain: { min: 3.0, max: 4.0 },
  gain: { min: 3.0, max: 5.0 },
};

// ─── Atividade física ──────────────────────────────────────────────────────
// Cinco níveis, como na tabela dela. A versão anterior do app tinha três e não
// oferecia "sedentário" de verdade: quem marcava a opção mais baixa recebia
// 1,375, que é o fator de levemente ativo — inflando a meta de quem menos gasta.
const FATOR_ATIVIDADE: Record<ActivityLevel, number> = {
  sedentary: 1.20,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.90,
};

/** Onde cada nível cai dentro da faixa kcal/kg: sedentária no piso, extrema no
 *  teto. É assim que a atividade entra na fórmula de bolso, que sozinha só
 *  enxerga peso e objetivo. */
const POSICAO_NA_FAIXA: Record<ActivityLevel, number> = {
  sedentary: 0,
  light: 0.25,
  moderate: 0.5,
  very: 0.75,
  extreme: 1,
};

export const KCAL_POR_G = { p: 4, c: 4, f: 9 } as const;

const AGUA_ML_POR_KG = 35;

/** Piso provisório. Substituir pelo número que a nutricionista definir — até lá
 *  ele só ACENDE ALERTA, nunca corrige o valor em silêncio. */
export const PISO_KCAL_PROVISORIO = 1200;

/** Déficit acima disto é sinalizado. O material dela limita a 25%, "apenas
 *  quando definido pelo profissional". */
const DEFICIT_MAXIMO_PCT = 25;

export function ageFromBirthDate(birthDate: number, now: number = Date.now()): number {
  const birth = new Date(birthDate);
  const today = new Date(now);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * TMB por Harris-Benedict revisada.
 *
 * Mulheres: 447,593 + (9,247 × peso) + (3,098 × altura) − (4,330 × idade)
 * Homens:   88,362 + (13,397 × peso) + (4,799 × altura) − (5,677 × idade)
 *
 * Só existe para conferir a estimativa. Nunca alimenta o cálculo de macros.
 */
export function tmbHarrisBenedict(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const { weightKg: W, heightCm: H, ageYears: A } = params;
  const mulher = 447.593 + 9.247 * W + 3.098 * H - 4.33 * A;
  const homem = 88.362 + 13.397 * W + 4.799 * H - 5.677 * A;
  if (params.gender === 'female') return mulher;
  if (params.gender === 'male') return homem;
  // 'other': média, pra não favorecer nenhuma das duas estimativas.
  return (mulher + homem) / 2;
}

const arred = (v: number, passo: number) => Math.round(v / passo) * passo;
const faixa = (peso: number, gkg: Faixa): Faixa => ({
  min: Math.round(peso * gkg.min),
  max: Math.round(peso * gkg.max),
});

/**
 * Estimativa inicial mostrada no fim do onboarding e usada como semente no
 * painel da nutricionista. Tudo em faixa, de propósito.
 */
export function estimar(profile: MacroProfile, now: number = Date.now()): Estimativa {
  const { weightKg, goal, activityLevel } = profile;

  const fator = KCAL_POR_KG[goal];
  const kcalMin = weightKg * fator.min;
  const kcalMax = weightKg * fator.max;
  const pos = POSICAO_NA_FAIXA[activityLevel];
  const kcalRef = kcalMin + (kcalMax - kcalMin) * pos;

  // Verificação silenciosa contra o gasto estimado.
  const idade = ageFromBirthDate(profile.birthDate, now);
  const bmr = tmbHarrisBenedict({
    gender: profile.gender,
    weightKg,
    heightCm: profile.heightCm,
    ageYears: idade,
  });
  const get = bmr * FATOR_ATIVIDADE[activityLevel];
  const deficitPct = ((get - kcalRef) / get) * 100;

  const alertas: AlertaEstimativa[] = [];
  // Acima de ~105 kg a fórmula de bolso ultrapassa o gasto e "emagrecimento"
  // vira superávit. Medido: mulher 130 kg sedentária → bolso 2.600 vs gasto 2.385.
  if (goal === 'lose' && deficitPct <= 0) alertas.push('META_ACIMA_DO_GASTO');
  if (goal === 'lose' && deficitPct > DEFICIT_MAXIMO_PCT) alertas.push('DEFICIT_EXCESSIVO');
  if (kcalRef < PISO_KCAL_PROVISORIO) alertas.push('ABAIXO_DO_PISO');

  return {
    kcal: { min: arred(kcalMin, 50), max: arred(kcalMax, 50) },
    kcalRef: arred(kcalRef, 50),
    p: faixa(weightKg, PROTEINA_G_KG[goal]),
    c: faixa(weightKg, CARBO_G_KG[goal]),
    f: faixa(weightKg, GORDURA_G_KG[goal]),
    waterL: Math.round((weightKg * AGUA_ML_POR_KG) / 100) / 10,
    conferencia: {
      bmr: Math.round(bmr),
      get: Math.round(get),
      deficitPct: Math.round(deficitPct * 10) / 10,
      alertas,
    },
  };
}

export type MetasDefinidas = {
  kcal: number;
  p: number;
  c: number;
  f: number;
  /** Soma real dos macros (4P + 4C + 9G). Confere contra kcal. */
  kcalConferida: number;
  /** Carboidrato resultante em g/kg, e se caiu fora da faixa de referência. */
  carboGkg: number;
  carboForaDaFaixa: boolean;
};

/**
 * Transforma uma meta calórica em gramas, na ordem que o material dela define:
 * proteína primeiro, gordura no PISO da faixa, carboidrato completa o que sobra.
 *
 * O carboidrato é RESULTADO, não entrada — por isso ele pode cair fora da faixa
 * de referência. Quando cai, devolvemos `carboForaDaFaixa` pra tela avisar em
 * vez de corrigir em silêncio: é sinal de meta apertada demais pro perfil.
 *
 * Usado pelo painel da nutricionista. O app da paciente não chama isto antes da
 * aprovação — antes dela não existe meta, só faixa.
 */
export function distribuirMacros(params: {
  kcal: number;
  weightKg: number;
  goal: GoalType;
  /** g/kg de proteína. Sem isto, usa o piso da faixa do objetivo. */
  proteinaGkg?: number;
  /** g/kg de gordura. Sem isto, usa o PISO — é o que o passo 3 dela pede. */
  gorduraGkg?: number;
}): MetasDefinidas {
  const { kcal, weightKg, goal } = params;
  const pGkg = params.proteinaGkg ?? PROTEINA_G_KG[goal].min;
  const fGkg = params.gorduraGkg ?? GORDURA_G_KG[goal].min;

  const p = Math.round(weightKg * pGkg);
  const f = Math.round(weightKg * fGkg);
  const sobra = kcal - p * KCAL_POR_G.p - f * KCAL_POR_G.f;
  const c = Math.max(0, Math.round(sobra / KCAL_POR_G.c));

  const carboGkg = weightKg > 0 ? c / weightKg : 0;
  const ref = CARBO_G_KG[goal];

  return {
    kcal,
    p,
    c,
    f,
    kcalConferida: p * KCAL_POR_G.p + c * KCAL_POR_G.c + f * KCAL_POR_G.f,
    carboGkg: Math.round(carboGkg * 100) / 100,
    carboForaDaFaixa: carboGkg < ref.min || carboGkg > ref.max,
  };
}

/** Formata uma faixa pra tela: "1.550 a 1.950". */
export function formatarFaixa(f: Faixa, unidade = ''): string {
  const n = (v: number) => v.toLocaleString('pt-BR');
  return `${n(f.min)} a ${n(f.max)}${unidade ? ` ${unidade}` : ''}`;
}
