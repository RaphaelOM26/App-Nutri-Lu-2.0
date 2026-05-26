// Histórico mock dos últimos dias pra alimentar a heatmap do calendário.
// Gera dados pros dias passados (1 até hoje-1) do mês atual com variação
// realista de aderência à meta. Backend real virá depois.

export type DailySummary = {
  day: number;        // dia do mês (1-31)
  month: number;      // 1-12 (sempre 5/maio no MVP)
  year: number;       // sempre 2026 no MVP
  kcal: number;       // total consumido
  kcalTarget: number; // meta do dia (2200 pra Larissa)
  p: number; pTarget: number;
  c: number; cTarget: number;
  f: number; fTarget: number;
};

const TARGETS = { kcal: 2200, p: 135, c: 240, f: 70 };

// Padrão de aderência: alguns dias bons, alguns médios, 2-3 baixos. Determinístico
// (mesmo dia sempre vira mesmo valor — usuário não vê números "dançando" entre sessões).
const ADHERENCE_SEED = [
  0.85, 0.92, 0.78, 1.02, 0.65,
  0.40, 1.15, 0.88, 0.95, 0.72,
  0.55, 0.98, 0.89, 0.93, 1.08,
  0.45, 0.82, 0.97, 0.90, 0.65,
  0.78, 0.92, 0.99, 0.83, 0.91,
  0.62, 1.05, 0.87, 0.94, 0.79, 0.88,
];

const TODAY = new Date().getDate();
const TODAY_MONTH = new Date().getMonth() + 1;
const TODAY_YEAR = new Date().getFullYear();

export function getDailySummary(day: number, month = TODAY_MONTH, year = TODAY_YEAR): DailySummary | null {
  // Só gera mock pra dias PASSADOS do mês atual. Dia de hoje vem do state real;
  // dias futuros ficam null (não aconteceram).
  if (day < 1 || day >= TODAY) return null;
  const adherence = ADHERENCE_SEED[(day - 1) % ADHERENCE_SEED.length];
  return {
    day, month, year,
    kcal: Math.round(TARGETS.kcal * adherence),
    kcalTarget: TARGETS.kcal,
    p: Math.round(TARGETS.p * (adherence * 0.95)),
    pTarget: TARGETS.p,
    c: Math.round(TARGETS.c * adherence),
    cTarget: TARGETS.c,
    f: Math.round(TARGETS.f * (adherence * 1.05)),
    fTarget: TARGETS.f,
  };
}

/** Retorna a lista de summaries do mês inteiro (dias 1-31 ou 1-30). */
export function getMonthSummaries(month = TODAY_MONTH, year = TODAY_YEAR): Array<DailySummary | null> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const out: Array<DailySummary | null> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    out.push(getDailySummary(d, month, year));
  }
  return out;
}

/** Classifica a aderência em um bucket (afeta a cor da célula no calendário). */
export function adherenceBucket(consumed: number, target: number): 'empty' | 'low' | 'mid' | 'good' | 'great' | 'over' {
  if (!consumed || consumed === 0) return 'empty';
  const r = consumed / target;
  if (r > 1.10) return 'over';
  if (r >= 0.90) return 'great';
  if (r >= 0.70) return 'good';
  if (r >= 0.40) return 'mid';
  return 'low';
}
