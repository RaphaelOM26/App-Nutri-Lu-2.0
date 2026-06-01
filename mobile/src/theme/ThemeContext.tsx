// Provider de tema com preferência override (system | light | dark).
// O `useTheme` (em theme/index.ts) resolve a partir da preferência + colorScheme.

import React, { useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT, DARK } from './index';
import { loadThemePref, saveThemePref, type ThemePref } from '../storage/userProfile';
import { ThemeContext } from './ThemeContextDef';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');
  const [hydrated, setHydrated] = useState(false);

  // Hidrata uma vez ao montar
  useEffect(() => {
    loadThemePref().then((p) => {
      if (p) setPrefState(p);
      setHydrated(true);
    });
  }, []);

  // Persiste quando muda
  useEffect(() => {
    if (!hydrated) return;
    saveThemePref(pref).catch(() => {});
  }, [pref, hydrated]);

  const effective = pref === 'system' ? scheme : pref;
  const theme = effective === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ pref, setPref: setPrefState, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useThemePref() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePref requires ThemeProvider');
  return ctx;
}
