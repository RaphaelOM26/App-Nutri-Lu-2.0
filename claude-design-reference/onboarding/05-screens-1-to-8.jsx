// onboarding-screens-a.jsx — Onboarding screens 1-8

// ─── 1. WELCOME HERO ────────────────────────────────────────────
function ObWelcome({ theme, onNext, safeTop, safeBottom }) {
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 2), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg }}>
      {/* Phone mockup */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: safeTop }}>
        <div style={{
          width: 200, height: 400, borderRadius: 34, background: '#1B1B1B', padding: 8,
          boxShadow: '0 30px 60px rgba(27,27,27,0.22)', position: 'relative',
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 26, overflow: 'hidden', position: 'relative', background: '#000' }}>
            {/* Frame A — camera */}
            <div style={{ position: 'absolute', inset: 0, opacity: frame === 0 ? 1 : 0, transition: 'opacity 700ms' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=800&fit=crop&auto=format&q=70)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.85)' }} />
              <div style={{ position: 'absolute', top: '32%', left: '50%', transform: 'translateX(-50%)', width: 120, height: 120 }}>
                {['tl','tr','bl','br'].map(c => (
                  <div key={c} style={{ position: 'absolute', width: 18, height: 18,
                    ...(c==='tl'&&{top:0,left:0,borderTop:'2.5px solid #fff',borderLeft:'2.5px solid #fff',borderRadius:'8px 0 0 0'}),
                    ...(c==='tr'&&{top:0,right:0,borderTop:'2.5px solid #fff',borderRight:'2.5px solid #fff',borderRadius:'0 8px 0 0'}),
                    ...(c==='bl'&&{bottom:0,left:0,borderBottom:'2.5px solid #fff',borderLeft:'2.5px solid #fff',borderRadius:'0 0 0 8px'}),
                    ...(c==='br'&&{bottom:0,right:0,borderBottom:'2.5px solid #fff',borderRight:'2.5px solid #fff',borderRadius:'0 0 8px 0'}),
                  }} />
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 100, padding: '6px 16px', fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 700, color: '#1B1B1B' }}>Foto</div>
            </div>
            {/* Frame B — home */}
            <div style={{ position: 'absolute', inset: 0, opacity: frame === 1 ? 1 : 0, transition: 'opacity 700ms', background: theme.bg, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <ConcentricRings size={120} kcal={0.46} p={0.6} c={0.5} f={0.4} theme={theme} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>1739</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted }}>kcal restantes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Text */}
      <div style={{ padding: '0 24px', textAlign: 'center', paddingBottom: 8 }}>
        <h1 style={{ margin: 0, fontFamily: FONT_SERIF, fontSize: 38, color: theme.text, lineHeight: 1.1, animation: 'ob-up 280ms ease-out both' }}>Foto. Macros. Pronto.</h1>
        <p style={{ margin: '12px auto 0', maxWidth: 280, fontFamily: FONT_HEAD, fontSize: 16, color: theme.textMuted, lineHeight: 1.4, animation: 'ob-up 280ms ease-out both', animationDelay: '80ms' }}>Acompanhe seus macros sem esforço</p>
      </div>
      <div style={{ padding: `18px 24px ${safeBottom}px`, animation: 'ob-up 280ms ease-out both', animationDelay: '600ms' }}>
        <button onClick={onNext} style={{ width: '100%', height: 56, borderRadius: 28, border: 'none', background: theme.primary, color: '#fff', fontFamily: FONT_HEAD, fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 24px ${theme.primary}44` }}>Começar</button>
      </div>
    </div>
  );
}

// ─── 2. NAME + PHOTO ────────────────────────────────────────────
function ObName({ theme, form, setForm, onNext }) {
  const name = form.name || '';
  return (
    <div>
      <QTitle theme={theme} sub="Vou usar pra deixar tudo mais pessoal.">Como devo te chamar?</QTitle>
      <div style={{ padding: '28px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', animation: 'ob-pop 400ms ease-out both' }}>
          <div style={{
            width: 120, height: 120, borderRadius: 60, background: theme.bgSubtle,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            {name.trim() ? (
              <span style={{ fontFamily: FONT_HEAD, fontSize: 48, fontWeight: 800, color: theme.primary }}>{name.trim()[0].toUpperCase()}</span>
            ) : (
              <Icon.camera size={36} color={theme.textFaint} stroke={1.75} />
            )}
          </div>
          <div style={{ position: 'absolute', bottom: 4, right: 4, width: 34, height: 34, borderRadius: 17, background: theme.primary, border: `3px solid ${theme.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.plus size={16} color="#fff" stroke={2.5} />
          </div>
        </div>
        <input value={name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" autoCapitalize="words" style={{
          width: '100%', height: 56, borderRadius: 16, background: theme.bgElev,
          border: `1px solid ${theme.border}`, padding: '0 18px', outline: 'none',
          fontFamily: FONT_HEAD, fontSize: 17, fontWeight: 600, color: theme.text, boxSizing: 'border-box',
          animation: 'ob-up 280ms ease-out both', animationDelay: '200ms',
        }} />
      </div>
    </div>
  );
}

// ─── 3. GENDER ──────────────────────────────────────────────────
function ObGender({ theme, form, setForm }) {
  const opts = [{ id: 'f', label: 'Feminino' }, { id: 'm', label: 'Masculino' }, { id: 'o', label: 'Outro / Prefiro não dizer' }];
  return (
    <div>
      <QTitle theme={theme} sub="Vamos usar pra calibrar seu plano personalizado.">Qual seu gênero?</QTitle>
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {opts.map((o, i) => <OptionCard key={o.id} label={o.label} selected={form.gender === o.id} onClick={() => setForm({ ...form, gender: o.id })} theme={theme} delay={i * 80} />)}
      </div>
    </div>
  );
}

// ─── 4. BIRTH DATE ──────────────────────────────────────────────
function ObBirth({ theme, form, setForm }) {
  const b = form.birthDate || { d: 1, m: 0, y: 2000 };
  const set = (patch) => setForm({ ...form, birthDate: { ...b, ...patch } });
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 71 }, (_, i) => 1940 + i);
  const monthIdx = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div>
      <QTitle theme={theme} sub="Sua idade entra no cálculo das suas metas diárias.">Quando você nasceu?</QTitle>
      <div style={{ padding: '20px 16px 0', display: 'flex', gap: 6 }}>
        <WheelPicker items={monthIdx} value={b.m} onChange={v => set({ m: v })} fmt={i => MESES[i].slice(0,3).replace(/^./, c => c.toUpperCase())} theme={theme} label="Mês" />
        <WheelPicker items={days} value={b.d} onChange={v => set({ d: v })} theme={theme} label="Dia" />
        <WheelPicker items={years} value={b.y} onChange={v => set({ y: v })} theme={theme} label="Ano" />
      </div>
    </div>
  );
}

// ─── 5. HEIGHT & WEIGHT ─────────────────────────────────────────
function ObBody({ theme, form, setForm }) {
  const heights = Array.from({ length: 81 }, (_, i) => 140 + i);
  const weights = Array.from({ length: 166 }, (_, i) => 35 + i);
  return (
    <div>
      <QTitle theme={theme} sub="Vamos usar pra calcular suas metas diárias.">Sua altura e peso atual</QTitle>
      <div style={{ padding: '20px 24px 0', display: 'flex', gap: 16 }}>
        <WheelPicker items={heights} value={form.height || 165} onChange={v => setForm({ ...form, height: v })} fmt={x => `${x} cm`} theme={theme} label="Altura" />
        <WheelPicker items={weights} value={form.weight || 65} onChange={v => setForm({ ...form, weight: v })} fmt={x => `${x} kg`} theme={theme} label="Peso" />
      </div>
    </div>
  );
}

// ─── 6. TRAINING FREQUENCY ──────────────────────────────────────
function ObTraining({ theme, form, setForm }) {
  const opts = [
    { id: 'low', label: '0 – 2', sub: 'De vez em quando', icon: Icon.flag },
    { id: 'mid', label: '3 – 5', sub: 'Algumas vezes por semana', icon: Icon.flame },
    { id: 'high', label: '6+', sub: 'Atleta dedicado', icon: Icon.award },
  ];
  return (
    <div>
      <QTitle theme={theme} sub="Vamos usar pra calibrar seu plano.">Quantos treinos por semana?</QTitle>
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {opts.map((o, i) => <OptionCard key={o.id} label={o.label} sub={o.sub} icon={o.icon} selected={form.activityLevel === o.id} onClick={() => setForm({ ...form, activityLevel: o.id })} theme={theme} delay={i * 80} />)}
      </div>
    </div>
  );
}

// ─── 7. LU EXPLAINS (editorial) ─────────────────────────────────
function ObLuExplains({ theme }) {
  return (
    <div style={{ padding: '12px 24px 0' }}>
      <div style={{ animation: 'ob-pop 500ms ease-out both' }}>
        <LuAvatar size={56} theme={theme} pose="greeting" />
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 28, lineHeight: 1.25, color: theme.text }}>
          <div style={{ animation: 'ob-up 400ms ease-out both' }}>Pessoas que acompanham o que comem têm</div>
          <div style={{ color: theme.primary, animation: 'ob-pop 600ms ease-out both', animationDelay: '200ms', display: 'inline-block' }}>2x mais chance</div>
          <div style={{ animation: 'ob-up 400ms ease-out both', animationDelay: '400ms' }}>de bater suas metas.</div>
        </div>
        <p style={{ marginTop: 20, fontFamily: FONT_HEAD, fontSize: 16, color: theme.textMuted, lineHeight: 1.5, animation: 'ob-up 400ms ease-out both', animationDelay: '600ms' }}>
          Junto comigo, vai ser muito mais fácil.
        </p>
      </div>
    </div>
  );
}

// ─── 8. GOAL ────────────────────────────────────────────────────
function ObGoal({ theme, form, setForm }) {
  const opts = [{ id: 'lose', label: 'Perder peso' }, { id: 'maintain', label: 'Manter peso' }, { id: 'gain', label: 'Ganhar peso' }];
  return (
    <div>
      <QTitle theme={theme} sub="Vou usar pra gerar um plano calórico personalizado.">Qual seu objetivo?</QTitle>
      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {opts.map((o, i) => <OptionCard key={o.id} label={o.label} selected={form.goal === o.id} onClick={() => setForm({ ...form, goal: o.id })} theme={theme} delay={i * 80} />)}
      </div>
    </div>
  );
}

Object.assign(window, { ObWelcome, ObName, ObGender, ObBirth, ObBody, ObTraining, ObLuExplains, ObGoal });
