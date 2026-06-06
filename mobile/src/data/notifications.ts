// Tipos e seed de notificações (mock no MVP).
// Backend real virá depois — neste momento popula o painel pra UX testar.

import type { IconName } from '../components/Icons';

export type NotificationCategory =
  | 'meal'        // Lembretes de refeição (café, almoço, lanche, jantar)
  | 'hydration'   // Lembretes de água
  | 'goal'        // Meta calórica/macros (atingida, excedida, distante)
  | 'streak'      // Sequência (em risco, mantida)
  | 'achievement' // Conquistas desbloqueadas
  | 'insight'     // Insight semanal da Lu
  | 'recipe'      // Sugestão de receita
  | 'weight'      // Lembrete de pesagem
  | 'system';     // Lembrete genérico (registrou nada hoje, etc)

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Timestamp absoluto (Date.now()). */
  ts: number;
  /** Ícone (do mapa em Icons.tsx). */
  icon: IconName;
  /** Cor de destaque do ícone — token do theme (resolvido no componente). */
  tone: 'primary' | 'water' | 'protein' | 'carbs' | 'fats' | 'warning' | 'info';
};

/** Formata "há Xh" ou "há Xmin" pra exibir em listas. */
export function formatRelativeTime(ts: number, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - ts);
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}
