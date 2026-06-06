// onboarding-screens-b.jsx — Onboarding screens 9-17

// ─── 9. DESIRED WEIGHT ──────────────────────────────────────────
function ObDesiredWeight({ theme, form, setForm }) {
  const goal = form.goal;
  const val = form.weightGoal || (goal === 'gain' ? (form.weight || 65) + 5 : (form.weight || 65) - 5);
  const ctx = goal === 'gain' ? 'Ganhar peso' : 'Perder peso';
  const invalid = goal === 'lose' && val >= (form.weight || 65);
  return (
    <div>
      <QTitle theme={theme}>Qual seu peso desejado?</QTitle>
      <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: theme.textMuted }}>{ctx}</div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 48, fontWeight: 800, color: theme.text, letterSpacing: -1, marginTop: 4 }}>{val.toFixed(1).replace('.', ',')} <span style={{ fontSize: 22, color: theme.textMuted }}>kg</span></div>
      </div>
      <div style={{ padding: '20px 0 0' }}>
        <Ruler min={30} max={200} value={val} onChange={v => setForm({ ...form, weightGoal: v })} theme={theme} />
      </div>
      {invalid && (
        <div style={{ padding: '14px 24px 0', textAlign: 'center', fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted }}>
          Pra perder peso, escolha um valor menor que seu peso atual.
        </div>
      )}
    </div>
  );
}

// ─── 10. SPEED ──────────────────────────────────────────────────
function ObSpeed({ theme, form, setForm }) {
  const goal = form.goal;
  const rate = form.weeklyRate || 0.8;
  return (
    <div>
      <QTitle theme={theme}>Em qual ritmo?</QTitle>
      <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: theme.textMuted, fontWeight: 600 }}>{goal === 'gain' ? 'Ganho de peso por semana' : 'Perda de peso por semana'}</div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 36, fontWeight: 800, color: theme.text, letterSpacing: -0.5, marginTop: 4 }}>{rate.toFixed(1).replace('.', ',')} kg</div>
      </div>
      <div style={{ padding: '24px 24px 0' }}>
        <AnimalSlider value={rate} onChange={v => setForm({ ...form, weeklyRate: v })} theme={theme} />
      </div>
    </div>
  );
}

// ─── 11. PROJECTION (editorial) ─────────────────────────────────
function ObProjection({ theme, form, mounted }) {
  const name = (form.name || '').trim();
  const rate = form.weeklyRate || 0.8;
  const proj = (rate * (30 / 7)).toFixed(1).replace('.', ',');
  const verb = form.goal === 'gain' ? 'ganhar' : 'perder';
  return (
    <div style={{ padding: '12px 24px 0' }}>
      <h1 style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: 28, color: theme.text, lineHeight: 1.2, animation: 'ob-up 280ms ease-out both' }}>
        {name ? `Você consegue, ${name}.` : 'Você consegue!'}
      </h1>
      <div style={{ marginTop: 24, background: theme.bgSubtle, borderRadius: 20, padding: 24, animation: 'ob-up 400ms ease-out both', animationDelay: '200ms' }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 600, color: theme.textMuted }}>Sua projeção</div>
        <div style={{ marginTop: 16 }}>
          <ProjectionChart theme={theme} active={mounted} />
        </div>
        <div style={{ marginTop: 16, fontFamily: FONT_HEAD, fontSize: 17, fontWeight: 600, color: theme.text, lineHeight: 1.4, opacity: mounted ? 1 : 0, transition: 'opacity 600ms 1000ms' }}>
          Em 30 dias você pode {verb} até <span style={{ color: theme.primary, fontWeight: 800 }}>{proj} kg</span>
        </div>
      </div>
    </div>
  );
}

// ─── 12. BARRIERS (multi) ───────────────────────────────────────
function ObBarriers({ theme, form, setForm }) {
  const opts = [
    { id: 'constancy', label: 'Falta de constância', icon: Icon.chart },
    { id: 'food', label: 'Alimentação ruim', icon: Icon.recipe },
    { id: 'support', label: 'Falta de apoio', icon: Icon.user },
    { id: 'schedule', label: 'Agenda corrida', icon: Icon.calendar },
    { id: 'ideas', label: 'Falta de ideias de refeição', icon: Icon.apple },
  ];
  const sel = form.barriers || [];
  const toggle = (id) => setForm({ ...form, barriers: sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id] });
  return (
    <div>
      <QTitle theme={theme} sub="Pode marcar quantos fizerem sentido.">O que tá te impedindo?</QTitle>
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opts.map((o, i) => <OptionCard key={o.id} label={o.label} icon={o.icon} multi selected={sel.includes(o.id)} onClick={() => toggle(o.id)} theme={theme} delay={i * 60} />)}
      </div>
    </div>
  );
}

// ─── 13. MOTIVATIONS (multi) ────────────────────────────────────
function ObMotivations({ theme, form, setForm }) {
  const opts = [
    { id: 'live', label: 'Comer e viver melhor', icon: Icon.apple },
    { id: 'energy', label: 'Mais energia e disposição', icon: Icon.flame },
    { id: 'consistency', label: 'Manter motivação e constância', icon: Icon.award },
    { id: 'body', label: 'Me sentir bem com meu corpo', icon: Icon.heart },
  ];
  const sel = form.motivations || [];
  const toggle = (id) => setForm({ ...form, motivations: sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id] });
  return (
    <div>
      <QTitle theme={theme} sub="Pode marcar quantos fizerem sentido.">O que você quer alcançar?</QTitle>
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {opts.map((o, i) => <OptionCard key={o.id} label={o.label} icon={o.icon} multi selected={sel.includes(o.id)} onClick={() => toggle(o.id)} theme={theme} delay={i * 60} />)}
      </div>
    </div>
  );
}

// ─── 14. NOTIFICATIONS ──────────────────────────────────────────
function ObNotifications({ theme }) {
  const cards = [
    { title: 'Hora do almoço', sub: 'Lembrete de refeição', time: '12:30' },
    { title: 'Hidratação', sub: 'Falta beber 800 ml hoje', time: '18:00' },
    { title: 'Insight da Lu', sub: 'Vi seus macros — tem uma dica pra você', time: '21:00' },
  ];
  return (
    <div>
      <QTitle theme={theme} sub="Lembretes leves nos horários certos.">Posso te lembrar?</QTitle>
      <div style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: theme.bgElev, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 4px 16px rgba(27,27,27,0.06)',
            animation: `ob-up 360ms ease-out both${i === 0 ? ', ob-pulse-soft 2.5s ease-in-out infinite' : ''}`,
            animationDelay: `${i * 100}ms${i === 0 ? ', 600ms' : ''}`,
          }}>
            <LuAvatar size={32} theme={theme} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text }}>{c.title}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 1 }}>{c.sub}</div>
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textFaint, fontWeight: 600 }}>{c.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 15. CEREMONY ───────────────────────────────────────────────
function ObCeremony({ theme, form }) {
  const name = (form.name || '').trim();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 110, padding: 8, background: `linear-gradient(135deg, ${theme.accentPink}, ${theme.accentBlue})`, animation: 'ob-rotate 12s linear infinite' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 102, background: theme.dark ? '#16191b' : '#FAF7F2' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, color: theme.primary, animation: 'ob-heart 1.2s ease-in-out infinite' }}>
          <Icon.heartFill size={64} color={theme.primary} />
        </div>
        {[0,1,2,3,4,5].map(i => {
          const ang = (i / 6) * Math.PI * 2;
          return <div key={i} style={{
            position: 'absolute', width: 6, height: 6, borderRadius: 3, background: theme.primary,
            left: `calc(50% + ${Math.cos(ang) * 92}px)`, top: `calc(50% + ${Math.sin(ang) * 92}px)`,
            animation: `ob-float ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s`,
          }} />;
        })}
      </div>
      <div style={{ marginTop: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '0 12px' }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 25, color: theme.text, lineHeight: 1.35, paddingBottom: 4, animation: 'ob-up 400ms ease-out both' }}>{name ? `Tudo pronto, ${name}.` : 'Tudo pronto.'}</div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 16, color: theme.textMuted, lineHeight: 1.5, animation: 'ob-up 400ms ease-out both', animationDelay: '120ms' }}>Valeu pela confiança 💚</div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 16, color: theme.textMuted, lineHeight: 1.5, animation: 'ob-up 400ms ease-out both', animationDelay: '200ms' }}>Vou montar seu plano agora.</div>
      </div>
    </div>
  );
}

// ─── 16. GENERATING ─────────────────────────────────────────────
function ObGenerating({ theme, onDone, safeBottom }) {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    let start = null, raf;
    const dur = 4000;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 400);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const subs = ['Calculando seu metabolismo basal…', 'Definindo suas metas de macros…', 'Selecionando receitas pro seu perfil…', 'Configurando seus lembretes…', 'Quase lá…'];
  const sub = subs[Math.min(4, Math.floor(pct / 20))];
  const checks = [
    { label: 'Calorias', at: 20 }, { label: 'Carboidratos', at: 40 }, { label: 'Proteína', at: 60 }, { label: 'Gordura', at: 80 }, { label: 'Hidratação', at: 95 },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `0 24px ${safeBottom}px` }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 64, fontWeight: 800, color: theme.text, letterSpacing: -2 }}>{pct}%</div>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 22, color: theme.text, marginTop: 6 }}>Tô preparando tudo pra você</div>
        <div style={{ height: 6, borderRadius: 999, background: theme.bgSubtle, overflow: 'hidden', margin: '20px 0 12px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${theme.accentPink}, ${theme.accentBlue})`, borderRadius: 999 }} />
        </div>
        <div key={sub} style={{ fontFamily: FONT_BODY, fontSize: 14, color: theme.textMuted, animation: 'ob-up 400ms ease-out both' }}>{sub}</div>
      </div>
      <div style={{ marginTop: 28, background: theme.bgSubtle, borderRadius: 16, padding: 20 }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 12 }}>Recomendação diária pra você</div>
        {checks.map((c, i) => {
          const done = pct >= c.at;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                background: done ? theme.primary : 'transparent',
                border: done ? 'none' : `2px solid ${theme.borderStrong}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: done ? 'ob-pop 300ms ease-out' : 'none',
              }}>
                {done && <Icon.check size={14} color="#fff" stroke={3} />}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: done ? theme.text : theme.textMuted }}>{c.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 17. PLAN READY (payoff) ────────────────────────────────────
function ObPlanReady({ theme, form, onFinish, safeBottom, safeTop }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);
  const name = (form.name || '').trim();
  const rate = form.weeklyRate || 0.8;
  const cur = form.weight || 65;
  const goalW = form.weightGoal || (cur - 5);
  const diff = Math.abs(cur - goalW);
  const daysNeeded = Math.round((diff / rate) * 7);
  const targetDate = fmtDatePt(addDays(new Date(2026, 5, 5), daysNeeded));

  // macro formula
  const bmr = 1500;
  const factor = form.activityLevel === 'high' ? 1.6 : form.activityLevel === 'mid' ? 1.45 : 1.3;
  const adj = form.goal === 'lose' ? -400 : form.goal === 'gain' ? 350 : 0;
  const kcal = Math.round((bmr * factor + adj) / 10) * 10;
  const carbs = Math.round((kcal * 0.4) / 4);
  const protein = Math.round((kcal * 0.3) / 4);
  const water = ((cur * 35) / 1000).toFixed(1).replace('.', ',');

  const cards = [
    { icon: Icon.flame, val: kcal, unit: 'Kcal', color: theme.primary, decimals: 0 },
    { icon: Icon.wheat, val: carbs, unit: 'Carbs', suffix: 'g', color: theme.carbsBlue, decimals: 0 },
    { icon: Icon.drumstick, val: protein, unit: 'Prot', suffix: 'g', color: theme.proteinPink, decimals: 0 },
    { icon: Icon.droplet, val: parseFloat(water.replace(',', '.')), unit: 'Água', suffix: 'L', color: theme.waterIce, decimals: 1 },
  ];

  return (
    <div style={{ minHeight: '100%', paddingBottom: safeBottom + 80, paddingTop: safeTop + 12 }}>
      <div style={{ padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: theme.primary, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ob-pop 600ms cubic-bezier(.2,1.4,.4,1) both' }}>
          <Icon.check size={40} color="#fff" stroke={3} />
        </div>
        <h1 style={{ margin: '20px 0 0', fontFamily: FONT_SERIF, fontSize: 26, color: theme.text, lineHeight: 1.2, animation: 'ob-up 400ms ease-out both', animationDelay: '200ms' }}>
          {name ? `Pronto, ${name}! Seu plano tá feito` : 'Pronto! Seu plano tá feito'}
        </h1>
        <div style={{ display: 'inline-block', marginTop: 16, background: theme.bgSubtle, borderRadius: 999, padding: '12px 24px', fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text, animation: 'ob-up 400ms ease-out both', animationDelay: '400ms' }}>
          Pode {form.goal === 'gain' ? 'ganhar' : 'perder'} {diff.toFixed(1).replace('.', ',')} kg até {targetDate}
        </div>
      </div>

      <div style={{ margin: '28px 24px 0', background: theme.bgSubtle, borderRadius: 20, padding: 20, animation: 'ob-up 400ms ease-out both', animationDelay: '600ms' }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 700, color: theme.text }}>Recomendação diária</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: theme.textMuted, marginTop: 2 }}>Você pode editar a qualquer momento</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          {cards.map((c, i) => <PlanMiniCard key={i} card={c} theme={theme} active={mounted} delay={600 + i * 100} />)}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `0 24px ${safeBottom}px`, paddingTop: 16, background: `linear-gradient(transparent, ${theme.bg} 40%)` }}>
        <button onClick={onFinish} style={{ width: '100%', height: 56, borderRadius: 28, border: 'none', background: theme.primary, color: '#fff', fontFamily: FONT_HEAD, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px ${theme.primary}44`, animation: 'ob-pop 500ms ease-out both', animationDelay: '900ms' }}>Bora começar!</button>
      </div>
    </div>
  );
}

function PlanMiniCard({ card, theme, active, delay }) {
  const v = useCountUp(card.val, active, 800);
  const IconC = card.icon;
  const display = card.decimals === 1 ? v.toFixed(1).replace('.', ',') : Math.round(v);
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div style={{ background: theme.bgElev, borderRadius: 16, padding: 16, position: 'relative', animation: 'ob-up 400ms ease-out both', animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <IconC size={16} color={card.color} stroke={2} />
        <span style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: theme.textMuted }}>{card.unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: 60, height: 60 }}>
          <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="30" cy="30" r={r} fill="none" stroke={theme.ringTrack} strokeWidth="5" />
            <circle cx="30" cy="30" r={r} fill="none" stroke={card.color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={active ? circ * 0.25 : circ} style={{ transition: 'stroke-dashoffset 800ms ease-out' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: theme.text }}>{display}{card.suffix || ''}</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 12 }}>
        <Icon.edit size={14} color={theme.textFaint} />
      </div>
    </div>
  );
}

Object.assign(window, { ObDesiredWeight, ObSpeed, ObProjection, ObBarriers, ObMotivations, ObNotifications, ObCeremony, ObGenerating, ObPlanReady });
