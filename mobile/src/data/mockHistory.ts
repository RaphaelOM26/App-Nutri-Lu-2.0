// Helpers de histórico diário pra heatmap do calendário.
// App começa SEM histórico — todos os dias retornam null até backend subir.
// Quando o serviço de histórico estiver online, getDailySummary vai consultar ele.

export type DailySummary = {
  day: number;        // dia do mês (1-31)
  month: number;      // 1-12
  year: number;
  kcal: number;       // total consumido
  kcalTarget: number; // meta de kcal do dia (vem do perfil do user)
  p: number; pTarget: number;
  c: number; cTarget: number;
  f: number; fTarget: number;
};

const TODAY_MONTH = new Date().getMonth() + 1;
const TODAY_YEAR = new Date().getFullYear();

export function getDailySummary(_day: number, _month = TODAY_MONTH, _year = TODAY_YEAR): DailySummary | null {
  // Sempre null por enquanto — backend de histórico ainda não existe.
  return null;
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
