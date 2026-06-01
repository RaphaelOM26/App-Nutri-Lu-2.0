// Definição do Context isolada pra evitar ciclo entre theme/index.ts e
// theme/ThemeContext.tsx. Usa tipo "any" pra Theme pra evitar import circular.

import { createContext } from 'react';

type Ctx = {
  pref: 'system' | 'light' | 'dark';
  setPref: (p: 'system' | 'light' | 'dark') => void;
  theme: any;
};

export const ThemeContext = createContext<Ctx | null>(null);
