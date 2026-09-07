// Estimativa calórica e de macros, pela metodologia da nutricionista.
//
// MÉTODO: Harris-Benedict revisada. TMB → GET (× fator de atividade) → meta
// (× fator do objetivo). Decisão dela em 07/09, quando perguntamos qual seguir
// nos casos em que a fórmula de bolso e o Harris-Benedict discordam.
//
// ⚠️ A fórmula de bolso (peso × 20-35 kcal/kg) foi DESCARTADA como método. Ela
// tinha dois defeitos medidos: acima de ~105 kg entregava mais calorias que o
// gasto estimado — "emagrecimento" com superávit — e em paciente leve produzia
// déficit de até 47%, muito além dos 25% que o material dela autoriza.
//
// ⚠️ O g/kg de proteína e gordura incide sobre o PESO IDEAL, não o atual.
// Também decisão dela, e é o que torna o plano possível: sobre o peso atual,
// uma paciente de 130 kg receberia 208 g de proteína e 104 g de gordura, que
// sozinhos consomem 1.768 das 1.908 kcal da meta e deixam 35 g de carboidrato
// no dia. Sobre o peso ideal, sobram 241 g.
//
// CONSEQUÊNCIA CONHECIDA: com peso ideal o carboidrato resultante costuma ficar
// ACIMA da faixa de referência de 2-3 g/kg. Não é erro — é o outro lado da
// escolha. Por isso `carboForaDaFaixa` é informação para o painel, nunca alerta:
// aviso que dispara em quase toda paciente vira ruído e some justo no caso grave.
//
// REGRA QUE NÃO MUDA: o app estima em FAIXA. Quem transforma faixa em meta é a
// nutricionista, na aprovação do plano.

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
export type AlertaEstimativa = 'ABAIXO_DO_PISO' | 'DEFICIT_EXCESSIVO';

export type Estimativa = {
  /** Faixa calórica, das pontas de déficit/superávit que o material dela prevê. */
  kcal: Faixa;
  /**
   * Ponto de trabalho: o padrão automático que ela definiu por objetivo.
   * Existe porque o anel do diário precisa de UM alvo — não dá pra desenhar
   * progresso contra uma faixa. É rotulado como referência, nunca como meta.
   */
  kcalRef: number;
  /** Faixas de macro em gramas/dia, sobre o PESO IDEAL. */
  p: Faixa;
  c: Faixa;
  f: Faixa;
  waterL: number;
  conferencia: {
    bmr: number;
    /** Gasto energético total: TMB × fator de atividade. */
    get: number;
    /** Peso ideal usado como base do g/kg. */
    pesoIdeal: number;
    /** % aplicado sobre o GET pra chegar na kcalRef. Negativo = déficit. */
    ajustePct: number;
    alertas: AlertaEstimativa[];
  };
};

// ─── Objetivo: o que se aplica sobre o GET ─────────────────────────────────
// Material dela: emagrecimento GET × 0,80 (déficit padrão de 20%, faixa de 10 a
// 25%); manutenção GET, com faixa operacional de ±5%; ganho GET × 1,10
// (superávit padrão de 10%, faixa de 5 a 15%).
const FATOR_OBJETIVO: Record<GoalType, { padrao: number; min: number; max: number }> = {
  lose: { padrao: 0.80, min: 0.75, max: 0.90 },
  maintain: { padrao: 1.00, min: 0.95, max: 1.05 },
  gain: { padrao: 1.10, min: 1.05, max: 1.15 },
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

// Cinco níveis, como na tabela dela.
const FATOR_ATIVIDADE: Record<ActivityLevel, number> = {
  sedentary: 1.20,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.90,
};

export const KCAL_POR_G = { p: 4, c: 4, f: 9 } as const;

const AGUA_ML_POR_KG = 35;

/**
 * IMC usado pra calcular o peso ideal.
 * 22 é o meio da faixa de eutrofia e o valor mais usado na prática clínica.
 * ⚠️ CONFIRMAR com a nutricionista — ela disse "peso ideal" sem especificar a
 * fórmula, e trocar este número muda proteína e gordura de todo mundo.
 */
export const IMC_PESO_IDEAL = 22;

/** Piso calórico por sexo, definido por ela em 07/09.
 *  'other' usa o piso feminino: é o público do produto, e o piso só ACENDE
 *  ALERTA — nunca corrige o valor em silêncio. */
const PISO_KCAL: Record<Gender, number> = { female: 1200, male: 1500, other: 1200 };

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
  return (mulher + homem) / 2;
}

/** Peso ideal pelo IMC de referência. Base do g/kg de proteína e gordura. */
export function pesoIdeal(heightCm: number): number {
  const m = heightCm / 100;
  return IMC_PESO_IDEAL * m * m;
}

const arred = (v: number, passo: number) => Math.round(v / passo) * passo;
const faixa = (base: number, gkg: Faixa): Faixa => ({
  min: Math.round(base * gkg.min),
  max: Math.round(base * gkg.max),
});

/**
 * Estimativa inicial mostrada no fim do onboarding e usada como semente no
 * painel da nutricionista. Tudo em faixa, de propósito.
 *
 * ⚠️ As respostas da anamnese NÃO entram aqui. Foi decisão dela em 07/09: a
 * anamnese vem antes da estimativa na ordem das telas, mas não altera o número.
 * Ela muda o PLANO, não a conta.
 */
export function estimar(profile: MacroProfile, now: number = Date.now()): Estimativa {
  const { weightKg, goal, activityLevel, heightCm } = profile;

  const idade = ageFromBirthDate(profile.birthDate, now);
  const bmr = tmbHarrisBenedict({
    gender: profile.gender,
    weightKg,
    heightCm,
    ageYears: idade,
  });
  const get = bmr * FATOR_ATIVIDADE[activityLevel];

  const fator = FATOR_OBJETIVO[goal];
  const kcalRef = get * fator.padrao;

  const base = pesoIdeal(heightCm);
  const piso = PISO_KCAL[profile.gender];
  const deficitPct = ((get - kcalRef) / get) * 100;

  const alertas: AlertaEstimativa[] = [];
  if (kcalRef < piso) alertas.push('ABAIXO_DO_PISO');
  if (goal === 'lose' && deficitPct > DEFICIT_MAXIMO_PCT) alertas.push('DEFICIT_EXCESSIVO');

  return {
    kcal: { min: arred(get * fator.min, 50), max: arred(get * fator.max, 50) },
    kcalRef: arred(kcalRef, 50),
    p: faixa(base, PROTEINA_G_KG[goal]),
    c: faixa(base, CARBO_G_KG[goal]),
    f: faixa(base, GORDURA_G_KG[goal]),
    waterL: Math.round((weightKg * AGUA_ML_POR_KG) / 100) / 10,
    conferencia: {
      bmr: Math.round(bmr),
      get: Math.round(get),
      pesoIdeal: Math.round(base * 10) / 10,
      ajustePct: Math.round((fator.padrao - 1) * 1000) / 10,
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
  /** Carboidrato resultante em g/kg do peso ideal. */
  carboGkg: number;
  /** Informativo para o painel, NÃO alerta — com peso ideal, sair da faixa é o
   *  comportamento esperado na maioria dos casos. */
  carboForaDaFaixa: boolean;
};

/**
 * Transforma uma meta calórica em gramas, na ordem que o material dela define:
 * proteína primeiro, gordura no PISO da faixa, carboidrato completa o que sobra.
 *
 * O g/kg incide sobre o peso ideal (derivado da altura), não sobre o atual.
 * Usado pelo painel. O app da paciente não chama isto antes da aprovação —
 * antes dela não existe meta, só faixa.
 */
export function distribuirMacros(params: {
  kcal: number;
  heightCm: number;
  goal: GoalType;
  proteinaGkg?: number;
  gorduraGkg?: number;
}): MetasDefinidas {
  const { kcal, heightCm, goal } = params;
  const base = pesoIdeal(heightCm);
  const pGkg = params.proteinaGkg ?? PROTEINA_G_KG[goal].min;
  const fGkg = params.gorduraGkg ?? GORDURA_G_KG[goal].min;

  const p = Math.round(base * pGkg);
  const f = Math.round(base * fGkg);
  const sobra = kcal - p * KCAL_POR_G.p - f * KCAL_POR_G.f;
  const c = Math.max(0, Math.round(sobra / KCAL_POR_G.c));

  const carboGkg = base > 0 ? c / base : 0;
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
