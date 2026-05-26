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

const HOUR = 60 * 60 * 1000;

/** Gera o seed das últimas 24h relativo ao Date.now() do momento da chamada. */
export function seedNotifications(now: number = Date.now()): AppNotification[] {
  return [
    {
      id: 'seed-1',
      category: 'meal',
      title: 'Hora do café da manhã',
      body: 'Bom dia! Que tal registrar o seu café?',
      ts: now - 1 * HOUR,
      icon: 'diary',
      tone: 'primary',
    },
    {
      id: 'seed-2',
      category: 'hydration',
      title: 'Beba água e registre',
      body: 'Comece o dia hidratada — 250ml já fazem diferença.',
      ts: now - 2 * HOUR,
      icon: 'water',
      tone: 'water',
    },
    {
      id: 'seed-3',
      category: 'goal',
      title: 'Proteína em dia',
      body: 'Você já bateu 86g de proteína hoje (64% da meta). Continue assim!',
      ts: now - 4 * HOUR,
      icon: 'flag',
      tone: 'protein',
    },
    {
      id: 'seed-4',
      category: 'achievement',
      title: 'Nova conquista desbloqueada',
      body: '5 dias seguidos batendo a meta de proteína 🏅',
      ts: now - 8 * HOUR,
      icon: 'award',
      tone: 'primary',
    },
    {
      id: 'seed-5',
      category: 'hydration',
      title: 'Faltam 750ml pra sua meta',
      body: 'Você está em 1250ml de 2000ml. Que tal mais um copo?',
      ts: now - 12 * HOUR,
      icon: 'water',
      tone: 'water',
    },
    {
      id: 'seed-6',
      category: 'streak',
      title: 'Streak de 12 dias mantido 🔥',
      body: 'Que constância! Você já está há 12 dias registrando suas refeições.',
      ts: now - 17 * HOUR,
      icon: 'flame',
      tone: 'warning',
    },
    {
      id: 'seed-7',
      category: 'insight',
      title: 'Insight da Lu',
      body: 'Sua proteína esta semana está 18% acima da média. Excelente trabalho!',
      ts: now - 20 * HOUR,
      icon: 'sparkle',
      tone: 'info',
    },
    {
      id: 'seed-8',
      category: 'recipe',
      title: 'Sugestão de receita',
      body: 'Wrap de frango e vegetais — 410 kcal, alto em proteína. Perfeito pro almoço!',
      ts: now - 23 * HOUR,
      icon: 'recipe',
      tone: 'primary',
    },
  ];
}

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
