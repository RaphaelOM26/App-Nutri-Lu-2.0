// Seed de conquistas (mock no MVP). Backend gera/destrava em produção.

import type { IconName } from '../components/Icons';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  /** Cor de destaque do ícone — chave do theme. */
  tone: 'primary' | 'protein' | 'carbs' | 'fats' | 'water' | 'warning';
  /** Data de desbloqueio (timestamp). Pra MVP, datas hardcoded recentes. */
  unlockedAt: number;
};

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-week',
    title: 'Primeira semana',
    description: '7 dias seguidos registrando refeições',
    icon: 'flame',
    tone: 'warning',
    unlockedAt: NOW - 5 * DAY,
  },
  {
    id: 'protein-pro',
    title: 'Proteína em dia',
    description: '5 dias seguidos batendo meta de proteína',
    icon: 'flag',
    tone: 'protein',
    unlockedAt: NOW - 3 * DAY,
  },
  {
    id: 'hydration-hero',
    title: 'Hidratação no ponto',
    description: 'Bateu a meta de 2L de água por 3 dias',
    icon: 'water',
    tone: 'water',
    unlockedAt: NOW - 2 * DAY,
  },
  {
    id: 'recipe-explorer',
    title: 'Explorador de receitas',
    description: 'Importou ou salvou 5 receitas',
    icon: 'recipe',
    tone: 'primary',
    unlockedAt: NOW - 4 * DAY,
  },
  {
    id: 'photo-pioneer',
    title: 'Câmera ligada',
    description: 'Usou Foto IA pela primeira vez',
    icon: 'camera',
    tone: 'carbs',
    unlockedAt: NOW - 8 * DAY,
  },
  {
    id: 'weight-tracker',
    title: 'No caminho da meta',
    description: '4 pesagens semanais registradas',
    icon: 'scale',
    tone: 'fats',
    unlockedAt: NOW - 1 * DAY,
  },
  {
    id: 'streak-12',
    title: '12 dias de constância',
    description: 'Você mantém o registro há quase 2 semanas!',
    icon: 'flame',
    tone: 'warning',
    unlockedAt: NOW - 1 * DAY,
  },
];

export function formatUnlockedDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - ts) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
