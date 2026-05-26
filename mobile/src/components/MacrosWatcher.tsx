// Watcher invisível que monitora macros do dia e dispara toast quando algum
// passa do target. Usa Set local pra não repetir o toast — quando o macro
// volta a ficar dentro, a flag é resetada.

import React, { useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

type MacroKey = 'kcal' | 'p' | 'c' | 'f';
const MACRO_LABEL: Record<MacroKey, string> = {
  kcal: 'caloria',
  p: 'proteína',
  c: 'carboidrato',
  f: 'gordura',
};

export const MacrosWatcher: React.FC = () => {
  const { dailyMacros, isToday } = useApp();
  const toast = useToast();
  const alerted = useRef<Set<MacroKey>>(new Set());

  useEffect(() => {
    if (!isToday) return;
    const checks: Array<[MacroKey, number, number]> = [
      ['kcal', dailyMacros.kcal.value, dailyMacros.kcal.target],
      ['p',    dailyMacros.p.value,    dailyMacros.p.target],
      ['c',    dailyMacros.c.value,    dailyMacros.c.target],
      ['f',    dailyMacros.f.value,    dailyMacros.f.target],
    ];

    for (const [key, value, target] of checks) {
      const over = value > target;
      if (over && !alerted.current.has(key)) {
        alerted.current.add(key);
        const diff = value - target;
        const unit = key === 'kcal' ? ' kcal' : 'g';
        toast(`Limite de ${MACRO_LABEL[key]} ultrapassado · +${diff}${unit}`, 'info');
      } else if (!over && alerted.current.has(key)) {
        // Voltou pra dentro — permite alertar de novo se estourar de novo
        alerted.current.delete(key);
      }
    }
  }, [dailyMacros.kcal.value, dailyMacros.p.value, dailyMacros.c.value, dailyMacros.f.value, isToday, toast,
    dailyMacros.kcal.target, dailyMacros.p.target, dailyMacros.c.target, dailyMacros.f.target,
  ]);

  return null;
};
