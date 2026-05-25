// components.jsx — Shared Nutri Lu UI

// ─── Macro ring (3 styles) ──────────────────────────────────────
function MacroRing({ value = 0.62, size = 140, stroke = 12, color = '#97AF8F', track, theme, kcal, label, sub, inner }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, Math.max(0, value)));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track || theme.ringTrack} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} fill="none"
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {inner}
      </div>
    </div>
  );
}

// 3 concentric rings (kcal + 3 macros)
function ConcentricRings({ kcal = 0.6, p = 0.7, c = 0.5, f = 0.4, size = 200, theme }) {
  const stroke = 12;
  const rings = [
    { r: (size - stroke) / 2, v: kcal, color: theme.primary },
    { r: (size - stroke) / 2 - 18, v: p, color: theme.proteinPink },
    { r: (size - stroke) / 2 - 36, v: c, color: theme.carbsBlue },
    { r: (size - stroke) / 2 - 54, v: f, color: theme.fatsGold },
  ];
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.r;
        return (
          <g key={i}>
            <circle cx={size/2} cy={size/2} r={ring.r} stroke={theme.ringTrack} strokeWidth={stroke} fill="none" />
            <circle cx={size/2} cy={size/2} r={ring.r} stroke={ring.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - ring.v)} fill="none"
              style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)' }} />
          </g>
        );
      })}
    </svg>
  );
}

// Macro bar (alternative style)
function MacroBar({ value, color, label, val, target, theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: FONT_BODY, color: theme.textMuted }}>
        <span style={{ fontWeight: 600, color: theme.text }}>{label}</span>
        <span><span style={{ color: theme.text, fontWeight: 600 }}>{val}</span>/{target}g</span>
      </div>
      <div style={{ height: 6, borderRadius: 100, background: theme.ringTrack, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, value * 100)}%`, background: color, borderRadius: 100, transition: 'width 900ms cubic-bezier(.2,.8,.2,1)' }} />
      </div>
    </div>
  );
}

// ─── Tab bar with floating FAB ─────────────────────────────────
function TabBar({ active, onChange, onFab, theme, frame = 'ios' }) {
  const tabs = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'diary', label: 'Diário', icon: 'diary' },
    { id: 'recipes', label: 'Receitas', icon: 'recipe' },
    { id: 'progress', label: 'Progresso', icon: 'chart' },
    { id: 'profile', label: 'Eu', icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: frame === 'ios' ? 24 : 34,
      display: 'flex', justifyContent: 'center', padding: '0 12px', zIndex: 20, pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative', flex: 1, maxWidth: 360,
        background: theme.bgElev,
        borderRadius: 28, padding: '8px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        boxShadow: theme.dark
          ? '0 14px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 14px 40px rgba(27,27,27,0.10), 0 0 0 1px rgba(27,27,27,0.04)',
        pointerEvents: 'auto',
      }}>
        {tabs.map(tab => {
          const isActive = active === tab.id;
          const IconComp = Icon[tab.icon];
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '6px 0', borderRadius: 16,
              color: isActive ? theme.text : theme.textMuted,
            }}>
              <div style={{
                width: 36, height: 28, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? theme.primarySoft : 'transparent',
                transition: 'background 200ms',
              }}>
                <IconComp size={20} stroke={isActive ? 2 : 1.75} color={isActive ? theme.primaryDeep : theme.textMuted} />
              </div>
              <span style={{
                fontFamily: FONT_BODY, fontSize: 10, fontWeight: isActive ? 700 : 500,
                letterSpacing: 0.2,
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* FAB */}
      <Fab onClick={onFab} theme={theme} />
    </div>
  );
}

function Fab({ onClick, theme }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 24, bottom: 4,
      width: 60, height: 60, borderRadius: 30,
      background: theme.text, color: theme.bg,
      border: 'none', cursor: 'pointer', pointerEvents: 'auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 12px 30px rgba(27,27,27,0.32)',
      animation: theme.fabPulse ? 'nl-pulse 2.4s ease-in-out infinite' : 'none',
      zIndex: 22,
    }}>
      <Icon.camera size={26} color={theme.bg} stroke={2} />
      {theme.fabPulse && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 30,
          background: theme.primary, opacity: 0.4,
          animation: 'nl-pulse-ring 2.4s ease-out infinite',
          zIndex: -1,
        }} />
      )}
    </button>
  );
}

// ─── Date strip (horizontal week picker) ───────────────────────
function DateStrip({ selected = 25, onSelect, theme }) {
  const days = ['Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter'];
  const nums = [20, 21, 22, 23, 24, 25, 26];
  return (
    <div style={{ display: 'flex', gap: 4, padding: '8px 14px', justifyContent: 'space-between' }}>
      {nums.map((n, i) => {
        const isToday = n === selected;
        return (
          <button key={n} onClick={() => onSelect && onSelect(n)} style={{
            flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0',
          }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600, letterSpacing: 0.4 }}>{days[i]}</span>
            <div style={{
              width: 34, height: 34, borderRadius: 17,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isToday ? theme.text : 'transparent',
              border: isToday ? 'none' : `1.5px dashed ${theme.borderStrong}`,
              color: isToday ? theme.bg : theme.text,
              fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700,
            }}>{n}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Card primitive ────────────────────────────────────────────
function Card({ children, style = {}, theme, pad = 20, radius = 22, elev = 1 }) {
  return (
    <div style={{
      background: theme.bgElev,
      borderRadius: radius,
      padding: pad,
      boxShadow: elev ? (theme.dark
        ? '0 1px 0 rgba(255,255,255,0.03)'
        : '0 1px 2px rgba(27,27,27,0.04), 0 1px 0 rgba(27,27,27,0.02)') : 'none',
      border: theme.dark ? '1px solid rgba(255,255,255,0.04)' : 'none',
      ...style,
    }}>{children}</div>
  );
}

// ─── Button ────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'lg', onClick, theme, icon: IconC, style = {}, full = false, disabled }) {
  const h = size === 'lg' ? 52 : size === 'md' ? 44 : 36;
  const styles = {
    primary: { bg: theme.text, color: theme.bg },
    secondary: { bg: theme.primarySoft, color: theme.primaryDeep },
    outline: { bg: 'transparent', color: theme.text, border: `1.5px solid ${theme.borderStrong}` },
    ghost: { bg: 'transparent', color: theme.text },
    accent: { bg: theme.primary, color: '#fff' },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: h, padding: '0 22px',
      width: full ? '100%' : undefined,
      background: s.bg, color: s.color,
      border: s.border || 'none',
      borderRadius: h / 2,
      fontFamily: FONT_HEAD, fontSize: size === 'lg' ? 15 : 14, fontWeight: 700, letterSpacing: 0.2,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'transform 150ms', ...style,
    }}>
      {IconC && <IconC size={18} color={s.color} stroke={2} />}
      {children}
    </button>
  );
}

// ─── Chip ──────────────────────────────────────────────────────
function Chip({ children, active, onClick, theme, icon: IconC }) {
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 14px',
      background: active ? theme.text : theme.bgElev,
      color: active ? theme.bg : theme.text,
      border: active ? 'none' : `1px solid ${theme.border}`,
      borderRadius: 16,
      fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {IconC && <IconC size={14} stroke={2} />}
      {children}
    </button>
  );
}

// ─── Image placeholder via Unsplash (curated IDs by keyword) ────
const FOOD_IMG_MAP = {
  default: '1490645935967-10de6ba17061',
  bowl: '1546069901-ba9599a7e63c',
  oats: '1517686469429-8bdb88b9f907',
  breakfast: '1525351484163-7529414344d8',
  coffee: '1495474472287-4d71bcdd2085',
  milk: '1502741224143-90386d7f8c82',
  rice: '1518779578993-ec3579fee39f',
  brown: '1518779578993-ec3579fee39f',
  chicken: '1532550907401-a500c9a57435',
  grilled: '1532550907401-a500c9a57435',
  salad: '1512621776951-a57141f2eefd',
  green: '1505253716362-afaea1d3d1af',
  broccoli: '1584270354949-c26b0d5b4a0c',
  steamed: '1584270354949-c26b0d5b4a0c',
  apple: '1568702846914-96b305d2aaeb',
  red: '1568702846914-96b305d2aaeb',
  almond: '1508061253366-f7da158b6d46',
  nuts: '1508061253366-f7da158b6d46',
  quinoa: '1505253758473-96b7015fcd40',
  avocado: '1559054663-e8d23213f55c',
  berries: '1488477181946-6428a0291777',
  salmon: '1467003909585-2f8a72700288',
  vegetables: '1540420773420-3366772f4999',
  roasted: '1467003909585-2f8a72700288',
  pancake: '1528207776546-365bb710ee93',
  banana: '1571771894821-ce9b6c11b08e',
  wrap: '1565299624946-b28f40a0ae38',
  lentil: '1547592180-85f173990554',
  soup: '1547592180-85f173990554',
  smoothie: '1502741224143-90386d7f8c82',
  protein: '1490645935967-10de6ba17061',
  colorful: '1543353071-873f17a7a088',
  yogurt: '1488477181946-6428a0291777',
  egg: '1482049016688-2d3e1b311543',
  boiled: '1482049016688-2d3e1b311543',
  whey: '1593095948071-474c5cc2989d',
  bread: '1509440159596-0249088772ff',
  french: '1509440159596-0249088772ff',
  natural: '1488477181946-6428a0291777',
  fillet: '1467003909585-2f8a72700288',
  pancake_banana: '1528207776546-365bb710ee93',
  food: '1490645935967-10de6ba17061',
  dinner: '1467003909585-2f8a72700288',
  package: '1542838132-92c53300491e',
  grocery: '1542838132-92c53300491e',
  product: '1542838132-92c53300491e',
  person: '1571019613454-1cb2f99b2d8b',
  silhouette: '1571019613454-1cb2f99b2d8b',
  fitness: '1571019613454-1cb2f99b2d8b',
  homemade: '1547592180-85f173990554',
  brazilian: '1547592180-85f173990554',
  smoothie_green: '1502741224143-90386d7f8c82',
  eggs: '1482049016688-2d3e1b311543',
  top: '1490645935967-10de6ba17061',
};

function unsplashUrl(q, w, h) {
  const tokens = (q || 'default').toLowerCase().split(/[,\s]+/);
  let id = null;
  for (const t of tokens) {
    if (FOOD_IMG_MAP[t]) { id = FOOD_IMG_MAP[t]; break; }
  }
  if (!id) id = FOOD_IMG_MAP.default;
  const wPx = typeof w === 'number' ? w : 400;
  const hPx = typeof h === 'number' ? h : 400;
  return `https://images.unsplash.com/photo-${id}?w=${wPx * 2}&h=${hPx * 2}&fit=crop&auto=format&q=70`;
}

function FoodImg({ q = 'food', w = 200, h = 200, style = {}, src, alt = '' }) {
  const url = src || unsplashUrl(q, w, h);
  return (
    <div style={{
      width: w, height: h, borderRadius: 14, overflow: 'hidden',
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundColor: '#D6E0CF',
      ...style,
    }} role="img" aria-label={alt} />
  );
}

// ─── Section header ────────────────────────────────────────────
function SectionHeader({ title, action, onAction, theme, size = 'lg' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 20px', marginBottom: 12 }}>
      <h2 style={{
        margin: 0, fontFamily: FONT_HEAD,
        fontSize: size === 'lg' ? 20 : 16, fontWeight: 800,
        letterSpacing: -0.3, color: theme.text,
      }}>{title}</h2>
      {action && <button onClick={onAction} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: theme.primaryDeep,
      }}>{action}</button>}
    </div>
  );
}

// ─── Top bar (custom in-screen header) ─────────────────────────
function ScreenHeader({ title, left, right, theme, large = false, sub }) {
  return (
    <div style={{
      padding: large ? '8px 20px 8px' : '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        <div style={{ display: 'flex', gap: 8 }}>{left}</div>
        {!large && <div style={{
          fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 700, color: theme.text,
        }}>{title}</div>}
        <div style={{ display: 'flex', gap: 8 }}>{right}</div>
      </div>
      {large && (
        <div>
          <h1 style={{
            margin: 0, fontFamily: FONT_HEAD,
            fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: theme.text,
          }}>{title}</h1>
          {sub && <div style={{
            marginTop: 4, fontFamily: FONT_BODY, fontSize: 14, color: theme.textMuted,
          }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Circular icon button ──────────────────────────────────────
function IconBtn({ icon: IconC, onClick, theme, size = 38, variant = 'soft' }) {
  const bg = variant === 'soft' ? theme.bgElev : variant === 'filled' ? theme.text : 'transparent';
  const color = variant === 'filled' ? theme.bg : theme.text;
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2,
      background: bg,
      border: variant === 'outline' ? `1px solid ${theme.border}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color, boxShadow: variant === 'soft' ? (theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)') : 'none',
      flexShrink: 0,
    }}>
      <IconC size={18} stroke={2} color={color} />
    </button>
  );
}

// ─── Chat Lu shortcut button ────────────────────────────────────
function LuBtn({ onClick, theme, label = false }) {
  const ring = theme.primary;
  return (
    <button onClick={onClick} aria-label="Falar com Lu" style={{
      height: 38, padding: label ? '0 12px 0 4px' : 0,
      width: label ? 'auto' : 38,
      borderRadius: 19,
      background: theme.bgElev,
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 6,
      boxShadow: theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)',
      flexShrink: 0,
    }}>
      <span style={{
        width: 30, height: 30, borderRadius: 15,
        background: `radial-gradient(circle at 35% 30%, ${theme.primarySoft}, ${ring})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)`,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
        </svg>
      </span>
      {label && (
        <span style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text, letterSpacing: '-0.01em' }}>Lu</span>
      )}
    </button>
  );
}

Object.assign(window, {
  MacroRing, ConcentricRings, MacroBar, TabBar, Fab, DateStrip, Card, Btn, Chip, FoodImg, SectionHeader, ScreenHeader, IconBtn, LuBtn,
});
