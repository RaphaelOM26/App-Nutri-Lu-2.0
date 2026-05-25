// screens-progress.jsx — Progress (Weight/Macros/Photos), Chat IA Lu, Profile, Planner

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROGRESS — with weight/macros/photos tabs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProgressScreen({ theme, state, nav }) {
  const [tab, setTab] = React.useState('weight');
  const tabs = [
    { id: 'weight', label: 'Peso' },
    { id: 'macros', label: 'Macros' },
    { id: 'photos', label: 'Fotos' },
    { id: 'habits', label: 'Hábitos' },
  ];
  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      <ScreenHeader
        title="Progresso"
        large
        theme={theme}
        right={[<LuBtn key="lu" theme={theme} onClick={() => nav('chatLu')} />, <IconBtn key="cal" icon={Icon.calendar} theme={theme} />, <IconBtn key="m" icon={Icon.more} theme={theme} />]}
      />

      {/* Streak + badges */}
      <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 10 }}>
        <Card theme={theme} pad={16} radius={20} style={{ background: theme.primarySoft }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 30, fontWeight: 800, color: theme.primaryDeep, letterSpacing: -0.4 }}>12</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.primaryDeep, fontWeight: 600 }}>dias seguidos</div>
            </div>
            <Icon.flame size={36} color={theme.primaryDeep} stroke={1.5} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {['S','T','Q','Q','S','S','D'].map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11, margin: '0 auto',
                  background: i < 6 ? theme.primaryDeep : 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i < 6 && <Icon.check size={12} color="#fff" stroke={3} />}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: theme.primaryDeep, marginTop: 3, fontWeight: 700 }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card theme={theme} pad={16} radius={20}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 30, fontWeight: 800, color: theme.text, letterSpacing: -0.4 }}>7</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>conquistas</div>
            </div>
            <div style={{ position: 'relative', width: 38, height: 38 }}>
              <Icon.award size={38} color={theme.fatsGold} stroke={1.5} />
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 12 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: 12, border: `2px solid ${theme.bgElev}`,
                background: [theme.fatsGold, theme.primaryDeep, theme.proteinPink, theme.carbsBlue][i],
                marginLeft: i > 0 ? -8 : 0,
              }} />
            ))}
            <div style={{
              width: 24, height: 24, borderRadius: 12, border: `2px solid ${theme.bgElev}`,
              background: theme.bgSubtle, marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_HEAD, fontSize: 9, fontWeight: 800, color: theme.textMuted,
            }}>+3</div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px 14px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} theme={theme}>{t.label}</Chip>)}
        </div>
      </div>

      {tab === 'weight' && <WeightTab theme={theme} />}
      {tab === 'macros' && <MacrosTab theme={theme} />}
      {tab === 'photos' && <PhotosTab theme={theme} />}
      {tab === 'habits' && <HabitsTab theme={theme} />}
    </div>
  );
}

function WeightTab({ theme }) {
  const data = [88.0, 87.6, 87.5, 87.2, 87.0, 86.8, 86.4, 86.5, 86.2, 85.8, 85.6, 85.5, 85.2];
  const min = 84, max = 89;
  const W = 320, H = 140;
  const stepX = W / (data.length - 1);
  const yFor = v => H - ((v - min) / (max - min)) * H;
  const points = data.map((v, i) => `${i * stepX},${yFor(v)}`).join(' ');
  return (
    <div style={{ padding: '0 16px' }}>
      <Card theme={theme} pad={20} radius={22} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Atual</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 36, fontWeight: 800, color: theme.text, letterSpacing: -0.6, lineHeight: 1 }}>
              85,2<span style={{ fontSize: 16, color: theme.textMuted, fontWeight: 600 }}> kg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <Icon.trendDown size={14} color={theme.primaryDeep} />
              <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.primaryDeep, fontWeight: 700 }}>-2,8kg em 90 dias</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>Meta</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: theme.text }}>82,0 kg</div>
            <Icon.flag size={14} color={theme.textMuted} />
          </div>
        </div>
        <svg width="100%" viewBox={`0 -10 ${W} ${H + 24}`} style={{ marginTop: 8 }}>
          {/* gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => (
            <line key={t} x1="0" x2={W} y1={t * H} y2={t * H} stroke={theme.border} strokeWidth="0.5" strokeDasharray="2 4" />
          ))}
          {/* area */}
          <polygon points={`0,${H} ${points} ${W},${H}`} fill={theme.primary} opacity="0.12" />
          {/* line */}
          <polyline points={points} fill="none" stroke={theme.primary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* current point */}
          <circle cx={(data.length - 1) * stepX} cy={yFor(data[data.length - 1])} r="5" fill={theme.bg} stroke={theme.primary} strokeWidth="2.5" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {['Jan','Fev','Mar','Abr'].map(m => <span key={m} style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textFaint, fontWeight: 600 }}>{m}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
          {['7D','30D','90D','1A','Tudo'].map((p, i) => (
            <button key={p} style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              background: i === 2 ? theme.text : 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
              color: i === 2 ? theme.bg : theme.textMuted,
            }}>{p}</button>
          ))}
        </div>
      </Card>

      <SectionHeader title="Registros recentes" theme={theme} size="sm" action="+ Adicionar" onAction={() => {}} />
      <Card theme={theme} pad={0} radius={16}>
        {[
          { date: 'Hoje, 25 mai', val: '85,2 kg', d: -0.3 },
          { date: '23 mai', val: '85,5 kg', d: -0.1 },
          { date: '21 mai', val: '85,6 kg', d: -0.2 },
          { date: '19 mai', val: '85,8 kg', d: -0.4 },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '14px 16px',
            borderBottom: i < 3 ? `1px solid ${theme.border}` : 'none',
          }}>
            <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 13, color: theme.text, fontWeight: 600 }}>{r.date}</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 800, color: theme.text, marginRight: 10 }}>{r.val}</div>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.primaryDeep, fontWeight: 700 }}>{r.d}kg</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function MacrosTab({ theme }) {
  // Targets: P 135g · C 240g · G 70g
  const targets = { p: 135, c: 240, f: 70 };
  const days = [
    { d: 'S', p: 110, c: 180, f: 60 },
    { d: 'T', p: 125, c: 220, f: 55 },
    { d: 'Q', p: 95, c: 165, f: 70 },
    { d: 'Q', p: 130, c: 195, f: 62 },
    { d: 'S', p: 118, c: 175, f: 58 },
    { d: 'S', p: 105, c: 240, f: 75 },
    { d: 'D', p: 145, c: 150, f: 50 },
  ];
  // Compute weekly average % per macro
  const avgPct = {
    p: Math.round(days.reduce((a, x) => a + x.p, 0) / days.length / targets.p * 100),
    c: Math.round(days.reduce((a, x) => a + x.c, 0) / days.length / targets.c * 100),
    f: Math.round(days.reduce((a, x) => a + x.f, 0) / days.length / targets.f * 100),
  };
  const macroDefs = [
    { k: 'p', label: 'Proteína', color: theme.proteinPink, target: targets.p, avg: avgPct.p },
    { k: 'c', label: 'Carbo', color: theme.carbsBlue, target: targets.c, avg: avgPct.c },
    { k: 'f', label: 'Gordura', color: theme.fatsGold, target: targets.f, avg: avgPct.f },
  ];
  return (
    <div style={{ padding: '0 16px' }}>
      <Card theme={theme} pad={18} radius={22} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Esta semana</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: -0.3, marginTop: 2 }}>% da meta por dia</div>
          </div>
          <div style={{ background: theme.primarySoft, padding: '4px 10px', borderRadius: 100, fontFamily: FONT_BODY, fontSize: 11, color: theme.primaryDeep, fontWeight: 700 }}>97% meta</div>
        </div>

        {/* Per-day grouped bars: each macro = own bar, height = % of goal (100% = top of chart) */}
        <div style={{ position: 'relative', display: 'flex', gap: 12, alignItems: 'stretch', height: 140, marginBottom: 10, paddingTop: 14 }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            {/* 100% goal line — spans only the bars area */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 0,
              borderTop: `1.5px dashed ${theme.borderStrong}`, pointerEvents: 'none',
            }} />
            {days.map((d, i) => {
              const pcts = { p: (d.p / targets.p) * 100, c: (d.c / targets.c) * 100, f: (d.f / targets.f) * 100 };
              const isToday = i === 6;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 112, width: '100%', gap: 1.5 }}>
                    {['p', 'c', 'f'].map(k => {
                      const raw = pcts[k];
                      const capped = Math.min(100, raw);
                      const def = macroDefs.find(m => m.k === k);
                      const over = raw > 100;
                      return (
                        <div key={k} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                          <div style={{
                            width: '100%', height: `${capped}%`,
                            background: def.color, borderRadius: '2px 2px 0 0',
                            opacity: isToday ? 1 : 0.85,
                            transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
                            position: 'relative',
                          }}>
                            {over && (
                              <div style={{
                                position: 'absolute', top: -4, left: 0, right: 0, height: 2.5,
                                background: theme.primaryDeep, borderRadius: 2,
                              }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: isToday ? theme.text : theme.textMuted, fontWeight: isToday ? 800 : 600 }}>{d.d}</span>
                </div>
              );
            })}
          </div>
          {/* Right-side label column */}
          <div style={{ width: 52, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <div style={{
              padding: '2px 0', fontFamily: FONT_BODY, fontSize: 9, fontWeight: 700,
              color: theme.textMuted, whiteSpace: 'nowrap', letterSpacing: 0.2,
            }}>meta 100%</div>
          </div>
        </div>

        {/* Legend with weekly avg per macro */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, paddingTop: 14, borderTop: `1px solid ${theme.border}` }}>
          {macroDefs.map(m => {
            const onGoal = m.avg >= 95 && m.avg <= 110;
            return (
              <div key={m.k} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: m.color }} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>{m.label}</span>
                </div>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 800, color: theme.text, marginTop: 4, letterSpacing: -0.3 }}>{m.avg}%</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 9, fontWeight: 700, color: onGoal ? theme.primaryDeep : theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {onGoal ? 'na meta' : m.avg < 95 ? 'abaixo' : 'acima'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's detailed breakdown */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${theme.border}` }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Domingo · hoje</div>
          {macroDefs.map(m => {
            const today = days[days.length - 1];
            const val = today[m.k];
            const pct = Math.round((val / m.target) * 100);
            return (
              <div key={m.k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 60, fontFamily: FONT_BODY, fontSize: 11, color: theme.text, fontWeight: 600 }}>{m.label}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 100, background: theme.ringTrack, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, background: m.color, borderRadius: 100 }} />
                  {pct > 100 && (
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, background: theme.primaryDeep, borderRadius: '0 100px 100px 0' }} />
                  )}
                </div>
                <span style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 800, color: theme.text, minWidth: 38, textAlign: 'right' }}>{pct}%</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, minWidth: 60, textAlign: 'right' }}>{val}/{m.target}g</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Heatmap */}
      <Card theme={theme} pad={18} radius={22}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 12 }}>Consistência · 12 semanas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          {Array.from({ length: 7 * 12 }).map((_, i) => {
            const v = Math.random();
            const op = v < 0.2 ? 0.08 : v < 0.4 ? 0.3 : v < 0.7 ? 0.6 : 0.95;
            return <div key={i} style={{ aspectRatio: '1', borderRadius: 3, background: theme.primary, opacity: op }} />;
          })}
        </div>
      </Card>
    </div>
  );
}

function PhotosTab({ theme }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <Card theme={theme} pad={0} radius={20} style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 280 }}>
          <FoodImg q="person,silhouette,fitness,1" w="100%" h="100%" style={{ width: '50%', height: '100%', borderRadius: 0, position: 'absolute', left: 0, top: 0 }} />
          <FoodImg q="person,silhouette,fitness,2" w="100%" h="100%" style={{ width: '50%', height: '100%', borderRadius: 0, position: 'absolute', right: 0, top: 0 }} />
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 100, fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: '#fff' }}>1 Mar</div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 100, fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: '#fff' }}>25 Mai</div>
          {/* slider divider */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: '#fff', transform: 'translateX(-1px)' }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 40, height: 40, borderRadius: 20, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            <span style={{ fontFamily: FONT_HEAD, fontWeight: 800, color: '#1B1B1B', fontSize: 18 }}>⇄</span>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: theme.text }}>Comparar antes e depois</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Arraste o divisor para comparar fotos</div>
        </div>
      </Card>
      <div style={{ marginTop: 14 }}>
        <SectionHeader title="Histórico" theme={theme} size="sm" action="Adicionar" />
        <div style={{ padding: '0 16px', marginLeft: -16, marginRight: -16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <FoodImg key={i} q={`person,fitness,${i}`} w="100%" h={110} style={{ borderRadius: 10, width: '100%' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HabitsTab({ theme }) {
  const habits = [
    { name: 'Dormir 8h', streak: 9, done: true },
    { name: 'Beber 2L de água', streak: 12, done: true },
    { name: 'Sem ultraprocessados', streak: 4, done: false },
    { name: 'Caminhada 30min', streak: 7, done: true },
  ];
  return (
    <div style={{ padding: '0 16px' }}>
      <Card theme={theme} pad={0} radius={18}>
        {habits.map((h, i) => (
          <div key={h.name} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
            borderBottom: i < habits.length - 1 ? `1px solid ${theme.border}` : 'none',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              background: h.done ? theme.primary : theme.bgSubtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {h.done && <Icon.check size={16} color="#fff" stroke={3} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: theme.text }}>{h.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Icon.flame size={12} color="#E59A5B" />
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>{h.streak} dias</span>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAT IA LU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ChatLuScreen({ theme, state, nav }) {
  const [messages, setMessages] = React.useState([
    { role: 'lu', text: 'Oi Larissa. Você tem 1.420 kcal restantes hoje e ainda precisa de 42g de proteína. Quer uma sugestão para o jantar?' },
    { role: 'user', text: 'Sim, algo rápido. Tô sem vontade de cozinhar muito.' },
    { role: 'lu', text: 'Achei 3 opções na sua despensa. Tudo pronto em 15 minutos:', recipes: true },
  ]);
  const [input, setInput] = React.useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { role: 'lu', text: 'Boa escolha. Vou adicionar 350g de salmão grelhado com legumes no seu diário do jantar. Confirma?' }]);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 160 }}>
      <ScreenHeader
        theme={theme}
        left={[<IconBtn key="b" icon={Icon.back} theme={theme} onClick={() => nav.back()} />]}
        right={[<IconBtn key="m" icon={Icon.more} theme={theme} />]}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16, background: theme.primarySoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.sparkle size={16} color={theme.primaryDeep} stroke={2} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: theme.text }}>Lu</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.primaryDeep, fontWeight: 600 }}>● Sua nutri IA</div>
            </div>
          </div>
        }
      />

      <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '12px 14px',
              background: m.role === 'user' ? theme.text : theme.bgElev,
              color: m.role === 'user' ? theme.bg : theme.text,
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontFamily: FONT_BODY, fontSize: 14, lineHeight: 1.45,
              boxShadow: m.role === 'lu' && !theme.dark ? '0 1px 2px rgba(27,27,27,0.04)' : 'none',
            }}>
              {m.text}
              {m.recipes && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {state.recipes.slice(0, 3).map(r => (
                    <button key={r.id} onClick={() => nav('recipeDetail', { recipe: r })} style={{
                      background: theme.bgSubtle, border: 'none', borderRadius: 14,
                      padding: 8, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left',
                    }}>
                      <FoodImg q={r.q} w={48} h={48} style={{ borderRadius: 10, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text }}>{r.name}</div>
                        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{r.kcal} kcal · {r.time}</div>
                      </div>
                      <Icon.forward size={14} color={theme.textFaint} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion chips + Input — pinned bottom */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ padding: '0 12px 10px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Cardápio de amanhã', 'Vontade de doce', 'Algo rápido', 'O que tenho na despensa?'].map(s => (
              <button key={s} onClick={() => setInput(s)} style={{
                background: theme.bgElev, border: `1px solid ${theme.border}`, borderRadius: 100,
                padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: theme.text,
              }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: theme.bgElev, borderRadius: 24, padding: '6px 6px 6px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: theme.dark ? 'none' : '0 4px 18px rgba(27,27,27,0.08), 0 0 0 1px rgba(27,27,27,0.04)',
          }}>
            <button style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
              <Icon.paperclip size={18} color={theme.textMuted} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Pergunte a Lu…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: FONT_BODY, fontSize: 14, color: theme.text, padding: '10px 0',
              }}
            />
            <button onClick={() => nav('voice')} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
              <Icon.mic size={18} color={theme.textMuted} />
            </button>
            <button onClick={send} style={{
              width: 36, height: 36, borderRadius: 18, background: theme.text, color: theme.bg,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.send size={16} color={theme.bg} />
            </button>
          </div>
          <div style={{ marginTop: 6, fontFamily: FONT_BODY, fontSize: 10, color: theme.textFaint, textAlign: 'center' }}>
            Lu não substitui consulta com nutricionista
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProfileScreen({ theme, state, nav }) {
  const items = [
    { icon: Icon.chart, label: 'Progresso & Métricas', to: 'progress' },
    { icon: Icon.ring, label: 'Metas e Macros' },
    { icon: Icon.bell, label: 'Notificações' },
    { icon: Icon.sparkle, label: 'Premium · grátis 7 dias', accent: true },
    { icon: Icon.settings, label: 'Configurações' },
    { icon: Icon.user, label: 'Convidar amigos' },
  ];
  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      <ScreenHeader title="Eu" large theme={theme} right={[<LuBtn key="lu" theme={theme} onClick={() => nav('chatLu')} />, <IconBtn key="b" icon={Icon.bell} theme={theme} />]} />

      {/* Profile card */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card theme={theme} pad={18} radius={22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32, background: theme.primarySoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 24, color: theme.primaryDeep,
            }}>LS</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 800, color: theme.text }}>Larissa Souza</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Perder peso · 85,2 / 82 kg</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span style={{ padding: '3px 8px', background: theme.primarySoft, color: theme.primaryDeep, borderRadius: 100, fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700 }}>● 12 dias</span>
                <span style={{ padding: '3px 8px', background: theme.bgSubtle, color: theme.text, borderRadius: 100, fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700 }}>7 conquistas</span>
              </div>
            </div>
            <IconBtn icon={Icon.edit} theme={theme} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
            {[
              { k: '85,2', s: 'kg atual' },
              { k: '2.200', s: 'kcal meta' },
              { k: '135g', s: 'proteína' },
            ].map(it => (
              <div key={it.s} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: theme.text }}>{it.k}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>{it.s}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px' }}>
        <Card theme={theme} pad={0} radius={20}>
          {items.map((it, i) => {
            const IconC = it.icon;
            return (
              <button key={it.label} onClick={() => it.to && nav(it.to)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', background: 'transparent', border: 'none',
                borderBottom: i < items.length - 1 ? `1px solid ${theme.border}` : 'none',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: it.accent ? theme.fatsGold : theme.bgSubtle,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconC size={18} color={it.accent ? '#fff' : theme.text} stroke={2} />
                </div>
                <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: theme.text }}>{it.label}</div>
                <Icon.forward size={16} color={theme.textFaint} />
              </button>
            );
          })}
        </Card>
      </div>

      {/* AI Chat shortcut */}
      <div style={{ padding: '14px 16px' }}>
        <Card theme={theme} pad={16} radius={20} style={{ background: theme.accentIce }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => nav('chatLu')}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.sparkle size={22} color="#4F6791" stroke={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: '#2D3F5C' }}>Falar com Lu</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: '#4F6791', marginTop: 2 }}>Sua nutricionista IA está online</div>
            </div>
            <Icon.forward size={18} color="#4F6791" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLANNER — weekly grid
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PlannerScreen({ theme, state, nav }) {
  const days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const meals = ['Café','Almoço','Jantar'];
  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      <ScreenHeader
        title="Planejador"
        large
        sub="Semana de 25 mai · 31 mai"
        theme={theme}
        right={[<IconBtn key="m" icon={Icon.more} theme={theme} />]}
      />

      {/* AI generate */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card theme={theme} pad={14} radius={18} style={{ background: theme.text, color: theme.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon.sparkle size={22} color={theme.bg} stroke={2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: theme.bg }}>Gerar plano com Lu</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.bg, opacity: 0.7, marginTop: 1 }}>Baseado em metas + despensa</div>
            </div>
            <Icon.forward size={18} color={theme.bg} />
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${days.length}, 110px)`, gap: 6 }}>
            <div />
            {days.map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '8px 0', fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: theme.text }}>{d}</div>
            ))}
            {meals.map((meal, mi) => (
              <React.Fragment key={meal}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 700, padding: '20px 4px 0', textTransform: 'uppercase', letterSpacing: 0.4 }}>{meal}</div>
                {days.map((d, di) => {
                  const filled = (mi + di) % 2 === 0;
                  const recipe = state.recipes[(mi + di) % state.recipes.length];
                  return (
                    <div key={d} style={{
                      background: filled ? theme.bgElev : 'transparent',
                      border: filled ? 'none' : `1.5px dashed ${theme.border}`,
                      borderRadius: 14, padding: 8, minHeight: 100,
                      display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer',
                    }}>
                      {filled ? (
                        <>
                          <FoodImg q={recipe.q} w="100%" h={48} style={{ borderRadius: 8, width: '100%' }} />
                          <div style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: theme.text, lineHeight: 1.2 }}>{recipe.name}</div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: theme.textMuted }}>{recipe.kcal} kcal</div>
                        </>
                      ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon.plus size={20} color={theme.textFaint} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', gap: 8 }}>
        <Btn variant="outline" size="lg" theme={theme} style={{ flex: 1 }} icon={Icon.cart} onClick={() => nav('shoppingList')}>Lista de compras</Btn>
        <Btn variant="primary" size="lg" theme={theme} style={{ flex: 1 }} icon={Icon.check}>Aplicar ao diário</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { ProgressScreen, ChatLuScreen, ProfileScreen, PlannerScreen });
