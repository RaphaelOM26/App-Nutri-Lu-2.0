// Theme tokens — porte direto do `Design 2.0/theme.jsx`.
// Paleta `sage` (default), com variantes light/dark seguindo o sistema.

import { useColorScheme } from 'react-native';

// ─── Paleta base (sage) ──────────────────────────────────────────
export const PALETTE = {
  primary: '#97AF8F',
  primaryDeep: '#6F8C68',
  primarySoft: '#D6E0CF',
  accentPink: '#EACBD1',
  accentBlue: '#C0CFE6',
  accentIce: '#D4E0EE',
  proteinPink: '#E5A6B0',
  carbsBlue: '#A8BFE0',
  fatsGold: '#D6C28A',
  waterIce: '#B5D2E5',
  // Cores fixas para estados especiais
  warning: '#E59A5B',
  warningDeep: '#C77642',
  insightText: '#2D3F5C',
  insightAccent: '#4F6791',
} as const;

// ─── Tokens por modo (claro / escuro) ────────────────────────────
export type Theme = typeof PALETTE & {
  dark: boolean;
  bg: string;
  bgElev: string;
  bgSubtle: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  ringTrack: string;
  shadow: string;
};

const LIGHT: Theme = {
  ...PALETTE,
  dark: false,
  bg: '#F6F6F6',
  bgElev: '#FFFFFF',
  bgSubtle: '#EEF0EC',
  text: '#1B1B1B',
  textMuted: 'rgba(27,27,27,0.58)',
  textFaint: 'rgba(27,27,27,0.32)',
  border: 'rgba(27,27,27,0.07)',
  borderStrong: 'rgba(27,27,27,0.14)',
  ringTrack: 'rgba(27,27,27,0.06)',
  shadow: 'rgba(27,27,27,0.08)',
};

const DARK: Theme = {
  ...PALETTE,
  dark: true,
  bg: '#101212',
  bgElev: '#1A1D1C',
  bgSubtle: '#1F2422',
  text: '#F4F5F3',
  textMuted: 'rgba(244,245,243,0.62)',
  textFaint: 'rgba(244,245,243,0.34)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  ringTrack: 'rgba(255,255,255,0.08)',
  shadow: 'rgba(0,0,0,0.5)',
};

// Hook que retorna o tema apropriado seguindo o sistema do device.
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}

// ─── Tipografia ──────────────────────────────────────────────────
export const FONT = {
  // Headings — Plus Jakarta Sans (pesos disponíveis via @expo-google-fonts/plus-jakarta-sans)
  head: 'PlusJakartaSans_700Bold',
  headExtra: 'PlusJakartaSans_800ExtraBold',
  // Body — Nunito Sans
  body: 'NunitoSans_400Regular',
  bodyMedium: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
} as const;

// Escala de tipografia (mesma do protótipo: 32/24/20/18/16/14/12)
export const TYPE_SCALE = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySm: 14,
  caption: 12,
  tiny: 10,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ─── Radius ──────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
  full: 999,
} as const;
