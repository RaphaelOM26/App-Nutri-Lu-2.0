// Estado em memória do status (feito/pendente) das refeições do plano.
// Compartilhado entre telas (Semana ↔ Refeição) via subscription simples, pra
// "Marcar como feito" refletir no ✓ e no progresso da semana na hora.
// Fase 1: só memória (zera ao recarregar). Fase 4: persiste + agenda.

import { useEffect, useReducer } from 'react';
import type { PlanMealStatus } from './mealPlan';

const overrides: Record<string, PlanMealStatus> = {};
const listeners = new Set<() => void>();

/** Status atual da refeição (override do usuário OU o do plano). */
export function getMealStatus(id: string, fallback: PlanMealStatus): PlanMealStatus {
  return overrides[id] ?? fallback;
}

/** Alterna feito ↔ pendente e avisa quem está ouvindo. */
export function toggleMealStatus(id: string, fallback: PlanMealStatus): PlanMealStatus {
  const cur = overrides[id] ?? fallback;
  const next: PlanMealStatus = cur === 'done' ? 'pending' : 'done';
  overrides[id] = next;
  listeners.forEach((l) => l());
  return next;
}

/** Hook: re-renderiza a tela quando qualquer status muda. */
export function usePlanStatuses(): void {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
}
