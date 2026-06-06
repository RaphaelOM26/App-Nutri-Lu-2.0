// onboarding-core.jsx — Nutri Lu onboarding flow root + shared controls

// ─── Shared chrome ──────────────────────────────────────────────
function ProgressHeader({ step, total, onBack, canBack, theme, safeTop }) {
  const pct = (step / total) * 100;
  return (
    <div style={{ padding: `${safeTop}px 24px 0`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <button onClick={canBack ? onBack : undefined} disabled={!canBack} style={{
        width: 44, height: 44, borderRadius: 22, flexShrink: 0,
        background: theme.bgSubtle, border: 'none',
        cursor: canBack ? 'pointer' : 'default', opacity: canBack ? 1 : 0.4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 120ms',
      }}>
        <Icon.back size={20} color={theme.text} />
      </button>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: theme.bgSubtle, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 999,
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.primaryDeep})`,
          transition: 'width 350ms cubic-bezier(.2,.8,.2,1)',
        }} />
      </div>
    </div>
  );
}

function CTAFooter({ label, onPress, disabled, theme, safeBottom, variant = 'primary' }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `0 24px ${safeBottom}px`, background: `linear-gradient(transparent, ${theme.bg} 30%)`, paddingTop: 18, zIndex: 30 }}>
      <button onClick={disabled ? undefined : onPress} disabled={disabled} style={{
        width: '100%', height: 56, borderRadius: 28, border: 'none',
        background: disabled ? theme.primarySoft : (variant === 'dark' ? theme.text : theme.primary),
        color: disabled ? theme.textFaint : (variant === 'dark' ? theme.bg : '#fff'),
        fontFamily: FONT_HEAD, fontSize: 17, fontWeight: 700, letterSpacing: 0.2,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 200ms, opacity 200ms',
        boxShadow: disabled ? 'none' : `0 8px 24px ${theme.primary}44`,
      }}>{label}</button>
    </div>
  );
}

function LuAvatar({ size = 56, theme, pose }) {
  // TODO: substituir por <LuAvatar pose="welcome|greeting|celebration|thinking" /> quando assets prontos
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0,
      background: `radial-gradient(circle at 38% 32%, ${theme.primarySoft}, ${theme.primary})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.10), inset 0 2px 0 rgba(255,255,255,0.4), 0 6px 16px ${theme.primary}33`,
    }}>
      <span style={{ fontFamily: FONT_SERIF, fontSize: size * 0.46, color: '#fff', lineHeight: 1 }}>L</span>
    </div>
  );
}

// ─── Option cards ───────────────────────────────────────────────
function OptionCard({ label, sub, selected, onClick, theme, icon: IconC, multi, delay = 0 }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      background: selected ? theme.primary : theme.bgSubtle,
      border: 'none', borderRadius: 16, padding: 20,
      display: 'flex', alignItems: 'center', gap: 14,
      transform: selected ? 'scale(1.02)' : 'scale(1)',
      boxShadow: selected ? `0 8px 22px ${theme.primary}40` : 'none',
      transition: 'background 200ms, transform 200ms, box-shadow 200ms',
      animation: `ob-up 360ms ease-out both`, animationDelay: `${delay}ms`,
    }}>
      {IconC && (
        <div style={{
          width: 44, height: 44, borderRadius: 22, flexShrink: 0,
          background: selected ? 'rgba(255,255,255,0.22)' : theme.bgElev,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconC size={22} color={selected ? '#fff' : theme.primaryDeep} stroke={2} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 700, color: selected ? '#fff' : theme.text }}>{label}</div>
        {sub && <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: selected ? 'rgba(255,255,255,0.82)' : theme.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {multi && (
        <div style={{
          width: 24, height: 24, borderRadius: 12, flexShrink: 0,
          border: `2px solid ${selected ? '#fff' : theme.borderStrong}`,
          background: selected ? '#fff' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <Icon.check size={14} color={theme.primary} stroke={3} />}
        </div>
      )}
    </button>
  );
}

// ─── Titles ─────────────────────────────────────────────────────
function QTitle({ children, sub, theme }) {
  return (
    <div style={{ padding: '24px 24px 0' }}>
      <h1 style={{ margin: 0, fontFamily: FONT_HEAD, fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5, lineHeight: 1.15, animation: 'ob-up 280ms ease-out both' }}>{children}</h1>
      {sub && <p style={{ margin: '8px 0 0', fontFamily: FONT_BODY, fontSize: 15, color: theme.textMuted, lineHeight: 1.4, animation: 'ob-up 280ms ease-out both', animationDelay: '80ms' }}>{sub}</p>}
    </div>
  );
}

// ─── Wheel picker ───────────────────────────────────────────────
function WheelPicker({ items, value, onChange, theme, label, fmt = (x) => x, width }) {
  const ref = React.useRef(null);
  const ITEM_H = 40;
  const initialIdx = Math.max(0, items.indexOf(value));
  const [centerIdx, setCenterIdx] = React.useState(initialIdx);
  const raf = React.useRef(null);
  const ready = React.useRef(false);

  React.useEffect(() => {
    const apply = () => { if (ref.current) ref.current.scrollTop = initialIdx * ITEM_H; };
    const timers = [requestAnimationFrame(apply)];
    const t1 = setTimeout(apply, 60);
    const t2 = setTimeout(() => { apply(); ready.current = true; }, 360);
    return () => { timers.forEach(cancelAnimationFrame); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleScroll = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const i = Math.round(ref.current.scrollTop / ITEM_H);
      const c = Math.max(0, Math.min(items.length - 1, i));
      setCenterIdx(c);
      if (ready.current && items[c] !== value) onChange(items[c]);
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {label && <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>}
      <div style={{ position: 'relative', width: width || '100%', height: ITEM_H * 7 }}>
        {/* center pill */}
        <div style={{
          position: 'absolute', top: ITEM_H * 3, left: 8, right: 8, height: ITEM_H,
          background: theme.primarySoft, borderRadius: 12, pointerEvents: 'none', zIndex: 0,
        }} />
        <div ref={ref} onScroll={handleScroll} style={{
          position: 'relative', zIndex: 1, height: '100%', overflowY: 'scroll',
          scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch',
          paddingTop: ITEM_H * 3, paddingBottom: ITEM_H * 3, boxSizing: 'border-box',
        }}>
          {items.map((it, i) => {
            const dist = Math.abs(i - centerIdx);
            const op = dist === 0 ? 1 : dist === 1 ? 0.85 : dist === 2 ? 0.58 : 0.32;
            return (
              <div key={i} onClick={() => { ref.current.scrollTo({ top: i * ITEM_H, behavior: 'smooth' }); }} style={{
                height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
                scrollSnapAlign: 'center', cursor: 'pointer', flexShrink: 0,
                fontFamily: FONT_HEAD, fontSize: dist === 0 ? 20 : 17,
                fontWeight: dist === 0 ? 800 : 600,
                color: dist === 0 ? theme.primaryDeep : theme.text, opacity: op,
                transition: 'font-size 120ms, opacity 120ms, color 120ms',
              }}>{fmt(it)}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal ruler (desired weight) ──────────────────────────
function Ruler({ min, max, value, onChange, theme }) {
  const ref = React.useRef(null);
  const STEP = 8; // px per kg
  const raf = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) ref.current.scrollLeft = (value - min) * STEP;
  }, []);

  const handleScroll = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const v = Math.round(ref.current.scrollLeft / STEP) + min;
      const c = Math.max(min, Math.min(max, v));
      if (c !== value) onChange(c);
    });
  };

  const ticks = [];
  for (let i = min; i <= max; i++) ticks.push(i);

  return (
    <div style={{ position: 'relative', width: '100%', height: 90 }}>
      {/* center indicator */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 2, height: 56, background: theme.primary, borderRadius: 2, zIndex: 3, boxShadow: `0 0 0 4px ${theme.primary}22` }} />
      <div ref={ref} onScroll={handleScroll} style={{
        position: 'absolute', inset: 0, overflowX: 'scroll', display: 'flex', alignItems: 'flex-start',
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ minWidth: '50%', flexShrink: 0 }} />
        {ticks.map(t => {
          const major = t % 5 === 0;
          return (
            <div key={t} style={{ width: STEP, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', scrollSnapAlign: 'center' }}>
              <div style={{ width: 2, height: major ? 40 : 22, background: major ? theme.text : theme.border, borderRadius: 2, marginTop: 10 }} />
              {major && <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, marginTop: 6 }}>{t}</div>}
            </div>
          );
        })}
        <div style={{ minWidth: '50%', flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ─── Animal speed slider ────────────────────────────────────────
function AnimalSlider({ value, onChange, theme }) {
  const min = 0.1, max = 1.5;
  const zone = value <= 0.3 ? 'slow' : value <= 1.0 ? 'mid' : 'fast';
  const animals = [
    { emoji: '🦥', label: 'Preguiça', zone: 'slow', anim: 'ob-sloth 2s ease-in-out infinite' },
    { emoji: '🐰', label: 'Lebre', zone: 'mid', anim: 'ob-hare 1.5s ease-in-out infinite' },
    { emoji: '🐆', label: 'Onça', zone: 'fast', anim: 'ob-jaguar 0.4s ease-in-out infinite' },
  ];
  const pillStyles = {
    slow: { bg: theme.bgSubtle, color: theme.text, text: 'Devagar e firme' },
    mid: { bg: theme.bgSubtle, color: theme.text, text: 'Recomendado' },
    fast: { bg: theme.warningSoft, color: theme.warningDeep, text: 'Cuidado: pode causar fadiga e perda de massa magra. A Lu não recomenda.' },
  };
  const pill = pillStyles[zone];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 70, marginBottom: 18 }}>
        {animals.map(a => {
          const active = a.zone === zone;
          return (
            <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                fontSize: active ? 40 : 30, lineHeight: 1,
                filter: active ? 'none' : 'grayscale(1)', opacity: active ? 1 : 0.4,
                transform: active ? 'scale(1.15)' : 'scale(1)',
                animation: active ? a.anim : 'none',
                transition: 'opacity 250ms, transform 250ms, font-size 250ms',
              }}>{a.emoji}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: active ? 700 : 600, color: active ? (zone === 'fast' ? theme.warningDeep : theme.primaryDeep) : theme.textFaint }}>{a.label}</div>
            </div>
          );
        })}
      </div>
      <input type="range" min={min} max={max} step={0.05} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{
        width: '100%', accentColor: zone === 'fast' ? theme.warning : theme.primary, height: 6,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted }}>
        <span>0,1 kg</span><span>0,8 kg</span><span>1,5 kg</span>
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: pill.bg, color: pill.color, borderRadius: 14, padding: '12px 18px',
          fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, textAlign: 'center', maxWidth: 300,
          transition: 'background 250ms, color 250ms', lineHeight: 1.4,
        }}>{pill.text}</div>
      </div>
    </div>
  );
}

// ─── Projection chart ───────────────────────────────────────────
function ProjectionChart({ theme, active }) {
  const W = 280, H = 130;
  // curve rising left-bottom → right-top
  const pts = [[0, 110], [70, 92], [140, 64], [210, 36], [280, 14]];
  const d = `M ${pts.map(p => p.join(' ')).join(' L ')}`;
  const marks = [{ x: 70, y: 92, l: '3 dias' }, { x: 140, y: 64, l: '7 dias' }, { x: 280, y: 14, l: '30 dias' }];
  const len = 360;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 24}`}>
      <defs>
        <linearGradient id="ob-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.22" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 280 ${H} L 0 ${H} Z`} fill="url(#ob-fill)" opacity={active ? 1 : 0} style={{ transition: 'opacity 600ms 600ms' }} />
      <path d={d} fill="none" stroke={theme.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={active ? 0 : len}
        style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.65,0,.35,1)' }} />
      {marks.map((m, i) => (
        <g key={i} style={{ opacity: active ? 1 : 0, transition: `opacity 300ms ${600 + i * 260}ms` }}>
          <circle cx={m.x} cy={m.y} r="5" fill={theme.bg} stroke={theme.primary} strokeWidth="2.5" />
          <text x={m.x} y={H + 16} fontSize="10" fontFamily={FONT_BODY} fontWeight="600" fill={theme.textMuted} textAnchor={i === 2 ? 'end' : 'middle'}>{m.l}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Count-up hook ──────────────────────────────────────────────
function useCountUp(target, active, dur = 800) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    let start = null;
    let raf;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return v;
}

// ─── Helpers ────────────────────────────────────────────────────
const fmtKg = (n) => `${n.toFixed(1).replace('.', ',')} kg`;
function addDays(date, days) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d;
}
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function fmtDatePt(date) {
  return `${date.getDate()} de ${MESES[date.getMonth()]}`;
}

Object.assign(window, {
  ProgressHeader, CTAFooter, LuAvatar, OptionCard, QTitle, WheelPicker, Ruler, AnimalSlider, ProjectionChart,
  useCountUp, fmtKg, addDays, fmtDatePt, MESES,
});
