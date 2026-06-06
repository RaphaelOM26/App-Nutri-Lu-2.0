// theme.jsx — Nutri Lu palette, fonts, tweakable tokens

const PALETTES = {
  sage: {
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
  },
  vivid: {
    primary: '#22C55E',
    primaryDeep: '#15803D',
    primarySoft: '#BBF7D0',
    accentPink: '#FCA5A5',
    accentBlue: '#93C5FD',
    accentIce: '#DBEAFE',
    proteinPink: '#EF4444',
    carbsBlue: '#F59E0B',
    fatsGold: '#8B5CF6',
    waterIce: '#60A5FA',
  },
};

function getTheme(t) {
  const p = PALETTES[t.palette] || PALETTES.sage;
  const dark = !!t.dark;
  return {
    ...p,
    dark,
    bg: dark ? '#101212' : '#F6F6F6',
    bgElev: dark ? '#1A1D1C' : '#FFFFFF',
    bgSubtle: dark ? '#1F2422' : '#EEF0EC',
    text: dark ? '#F4F5F3' : '#1B1B1B',
    textMuted: dark ? 'rgba(244,245,243,0.62)' : 'rgba(27,27,27,0.58)',
    textFaint: dark ? 'rgba(244,245,243,0.34)' : 'rgba(27,27,27,0.32)',
    border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(27,27,27,0.07)',
    borderStrong: dark ? 'rgba(255,255,255,0.16)' : 'rgba(27,27,27,0.14)',
    ringTrack: dark ? 'rgba(255,255,255,0.08)' : 'rgba(27,27,27,0.06)',
    warning: '#E59A5B',
    warningSoft: dark ? '#3a2c1d' : '#F5C8A0',
    warningDeep: dark ? '#E7A86E' : '#C77642',
    ringStyle: t.ringStyle || 'concentric',
    journeyStyle: t.journeyStyle || 'editorial',
    density: t.density || 'airy',
    fabPulse: t.fabPulse !== false,
  };
}

const FONT_HEAD = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const FONT_BODY = '"Nunito Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const FONT_SERIF = '"DM Serif Display", Georgia, "Times New Roman", serif';

// Inject Google fonts once
(function injectFonts() {
  if (document.getElementById('nl-fonts')) return;
  const link = document.createElement('link');
  link.id = 'nl-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700&family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500;1,600&family=DM+Serif+Display:ital@0;1&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    body, html { font-family: ${FONT_BODY}; }
    *::-webkit-scrollbar { width: 0; height: 0; }
    @keyframes nl-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    @keyframes nl-pulse-ring {
      0% { opacity: 0.7; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.8); }
    }
    @keyframes nl-ring-fill {
      from { stroke-dashoffset: var(--total); }
      to { stroke-dashoffset: var(--target); }
    }
    @keyframes nl-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nl-scan {
      0%, 100% { transform: translateY(0); opacity: 0.6; }
      50% { transform: translateY(280px); opacity: 1; }
    }
    @keyframes nl-mic {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.8; }
    }
    @keyframes nl-spin { to { transform: rotate(360deg); } }
    @keyframes ob-slide-in {
      from { opacity: 0; transform: translateX(28px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes ob-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ob-pop {
      0% { opacity: 0; transform: scale(0.8); }
      60% { opacity: 1; transform: scale(1.08); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes ob-heart {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    @keyframes ob-rotate { to { transform: rotate(360deg); } }
    @keyframes ob-hare {
      0%, 70%, 100% { transform: translateY(0); }
      85% { transform: translateY(-8px); }
    }
    @keyframes ob-sloth {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    @keyframes ob-jaguar {
      0%, 100% { transform: translateX(-4px); }
      50% { transform: translateX(4px); }
    }
    @keyframes ob-float {
      0%, 100% { transform: translateY(0); opacity: 0.5; }
      50% { transform: translateY(-10px); opacity: 1; }
    }
    @keyframes ob-pulse-soft {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes ob-draw {
      to { stroke-dashoffset: 0; }
    }
  `;
  document.head.appendChild(style);
})();

Object.assign(window, { PALETTES, getTheme, FONT_HEAD, FONT_BODY, FONT_SERIF });
