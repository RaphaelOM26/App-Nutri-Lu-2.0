// onboarding.jsx — Nutri Lu onboarding flow orchestrator

function OnboardingFlow({ theme, frame, onComplete }) {
  const [idx, setIdx] = React.useState(0);
  const [form, setForm] = React.useState({
    name: '', gender: null, birthDate: { d: 1, m: 0, y: 2000 },
    height: 165, weight: 65, activityLevel: null, goal: null,
    weightGoal: null, weeklyRate: 0.8, barriers: [], motivations: [],
  });
  const [mountTick, setMountTick] = React.useState(0);

  const safeTop = frame === 'ios' ? 50 : 14;
  const safeBottom = frame === 'ios' ? 30 : 24;

  // Conditional skip: "maintain" goal skips desired-weight (8) and speed (9)
  const skipped = (i) => form.goal === 'maintain' && (i === 8 || i === 9);

  const next = () => {
    setIdx(prev => {
      let n = prev + 1;
      while (skipped(n)) n++;
      return Math.min(16, n);
    });
    setMountTick(t => t + 1);
  };
  const back = () => {
    setIdx(prev => {
      let n = prev - 1;
      while (skipped(n)) n--;
      return Math.max(0, n);
    });
    setMountTick(t => t + 1);
  };

  // mounted flag for chart/animation screens
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, [mountTick]);

  // ── CTA config per screen ──
  const name2 = (form.name || '').trim();
  const validWeight = !(form.goal === 'lose' && (form.weightGoal || (form.weight - 5)) >= form.weight);
  const cta = {
    1: { label: 'Continuar', disabled: name2.length < 2 },
    2: { label: 'Continuar', disabled: !form.gender },
    3: { label: 'Continuar', disabled: false },
    4: { label: 'Continuar', disabled: false },
    5: { label: 'Continuar', disabled: !form.activityLevel },
    6: { label: 'Continuar', disabled: false },
    7: { label: 'Continuar', disabled: !form.goal },
    8: { label: 'Continuar', disabled: !validWeight },
    9: { label: 'Continuar', disabled: false },
    10: { label: 'Continuar', disabled: false },
    11: { label: 'Continuar', disabled: (form.barriers || []).length === 0 },
    12: { label: 'Continuar', disabled: (form.motivations || []).length === 0 },
    13: { label: 'Permitir', disabled: false, secondary: 'Agora não' },
    14: { label: 'Vamos lá!', disabled: false },
  };

  // header visible on screens index 1..14 (telas 2-15)
  const showHeader = idx >= 1 && idx <= 14;
  const showCTA = cta[idx] !== undefined;
  const totalSteps = 16;
  const step = idx; // idx 1 → 1/16 ... idx 14 → 14/16

  const screens = {
    0: <ObWelcome theme={theme} onNext={next} safeTop={safeTop} safeBottom={safeBottom} />,
    1: <ObName theme={theme} form={form} setForm={setForm} />,
    2: <ObGender theme={theme} form={form} setForm={setForm} />,
    3: <ObBirth theme={theme} form={form} setForm={setForm} />,
    4: <ObBody theme={theme} form={form} setForm={setForm} />,
    5: <ObTraining theme={theme} form={form} setForm={setForm} />,
    6: <ObLuExplains theme={theme} />,
    7: <ObGoal theme={theme} form={form} setForm={setForm} />,
    8: <ObDesiredWeight theme={theme} form={form} setForm={setForm} />,
    9: <ObSpeed theme={theme} form={form} setForm={setForm} />,
    10: <ObProjection theme={theme} form={form} mounted={mounted} />,
    11: <ObBarriers theme={theme} form={form} setForm={setForm} />,
    12: <ObMotivations theme={theme} form={form} setForm={setForm} />,
    13: <ObNotifications theme={theme} />,
    14: <ObCeremony theme={theme} form={form} />,
    15: <ObGenerating theme={theme} onDone={next} safeBottom={safeBottom} />,
    16: <ObPlanReady theme={theme} form={form} onFinish={() => { try { console.log('Onboarding form:', form); } catch(e){} onComplete && onComplete(); }} safeBottom={safeBottom} safeTop={safeTop} />,
  };

  const isFullBleed = idx === 0 || idx === 15 || idx === 16;
  const bottomPad = showCTA ? safeBottom + 80 : 0;

  return (
    <div data-screen-label="onboarding" style={{ position: 'relative', height: '100%', background: theme.bg, overflow: 'hidden' }}>
      {showHeader && (
        <ProgressHeader step={step} total={totalSteps} onBack={back} canBack={idx > 1} theme={theme} safeTop={safeTop} />
      )}
      <div key={mountTick} style={{
        height: '100%', overflowY: 'auto', overflowX: 'hidden',
        paddingTop: isFullBleed ? 0 : (showHeader ? 8 : safeTop),
        paddingBottom: bottomPad,
        animation: !isFullBleed ? 'ob-slide-in 300ms ease-out both' : 'none',
        boxSizing: 'border-box',
      }}>
        {screens[idx]}
      </div>
      {showCTA && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30 }}>
          {cta[idx].secondary ? (
            <div style={{ padding: `18px 24px ${safeBottom}px`, background: `linear-gradient(transparent, ${theme.bg} 30%)` }}>
              <button onClick={next} style={{ width: '100%', height: 56, borderRadius: 28, border: 'none', background: theme.primary, color: '#fff', fontFamily: FONT_HEAD, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px ${theme.primary}44` }}>{cta[idx].label}</button>
              <button onClick={next} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, color: theme.textMuted, textDecoration: 'underline' }}>{cta[idx].secondary}</button>
            </div>
          ) : (
            <CTAFooter label={cta[idx].label} onPress={next} disabled={cta[idx].disabled} theme={theme} safeBottom={safeBottom} />
          )}
        </div>
      )}
    </div>
  );
}

window.OnboardingFlow = OnboardingFlow;
