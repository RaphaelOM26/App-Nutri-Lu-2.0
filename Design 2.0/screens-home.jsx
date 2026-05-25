// screens-home.jsx — Dashboard, Diary, Add Food, Food Detail

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DashboardScreen({ theme, state, nav }) {
  const dense = theme.density === 'dense';
  const macros = state.dailyMacros;
  const kcalUsed = macros.kcal.value;
  const kcalTarget = macros.kcal.target;
  const kcalRemaining = Math.max(0, kcalTarget - kcalUsed);
  const ringStyle = theme.ringStyle;

  const macroData = [
    { key: 'P', label: 'Proteína', val: macros.p.value, target: macros.p.target, color: theme.proteinPink },
    { key: 'C', label: 'Carbo', val: macros.c.value, target: macros.c.target, color: theme.carbsBlue },
    { key: 'G', label: 'Gordura', val: macros.f.value, target: macros.f.target, color: theme.fatsGold },
  ];

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 19,
            background: theme.primarySoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.primaryDeep, fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 14,
          }}>LS</div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted }}>Boa tarde,</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: theme.text }}>Larissa</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: theme.bgElev, borderRadius: 100,
            padding: '6px 12px', boxShadow: theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)',
          }}>
            <Icon.flame size={14} color="#E59A5B" />
            <span style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text }}>12</span>
          </div>
          <IconBtn icon={Icon.bell} theme={theme} />
          <LuBtn theme={theme} onClick={() => nav('chatLu')} />
        </div>
      </div>

      {/* Date strip */}
      <DateStrip selected={25} theme={theme} />

      {/* Main ring card */}
      <div style={{ padding: '4px 16px 14px' }}>
        <Card theme={theme} pad={dense ? 18 : 22} radius={26}>
          {ringStyle === 'concentric' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 38, fontWeight: 800, color: theme.text, lineHeight: 1, letterSpacing: -1 }}>
                  {kcalRemaining}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>kcal restantes</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', fontFamily: FONT_BODY, fontSize: 11 }}>
                  <span style={{ color: theme.textMuted }}><span style={{ color: theme.text, fontWeight: 700 }}>{kcalUsed}</span> · consumido</span>
                  <span style={{ width: 1, height: 10, background: theme.border }} />
                  <span style={{ color: theme.textMuted }}><span style={{ color: theme.text, fontWeight: 700 }}>{kcalTarget}</span> · meta</span>
                </div>
              </div>
              <ConcentricRings
                size={140}
                kcal={kcalUsed / kcalTarget}
                p={macros.p.value / macros.p.target}
                c={macros.c.value / macros.c.target}
                f={macros.f.value / macros.f.target}
                theme={theme}
              />
            </div>
          )}
          {ringStyle === 'concentric' && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { c: theme.primary, label: 'kcal', val: `${kcalUsed}/${kcalTarget}` },
                { c: theme.proteinPink, label: 'Proteína', val: `${macros.p.value}/${macros.p.target}g` },
                { c: theme.carbsBlue, label: 'Carbs', val: `${macros.c.value}/${macros.c.target}g` },
                { c: theme.fatsGold, label: 'Gordura', val: `${macros.f.value}/${macros.f.target}g` },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: m.c, flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT_BODY, fontSize: 10.5, color: theme.textMuted, fontWeight: 600, letterSpacing: '0.01em' }}>{m.label}</span>
                  </div>
                  <span style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: theme.text, paddingLeft: 13 }}>{m.val}</span>
                </div>
              ))}
            </div>
          )}

          {ringStyle === 'separate' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 38, fontWeight: 800, color: theme.text, lineHeight: 1, letterSpacing: -1 }}>{kcalRemaining}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>kcal restantes</div>
                </div>
                <MacroRing value={kcalUsed/kcalTarget} size={88} stroke={9} color={theme.primary} theme={theme}
                  inner={<><Icon.flame size={20} color={theme.primaryDeep} /></>} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {macroData.map(m => (
                  <div key={m.key} style={{ flex: 1, background: theme.bgSubtle, borderRadius: 18, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <MacroRing value={m.val/m.target} size={56} stroke={6} color={m.color} theme={theme}
                      inner={<span style={{ fontFamily: FONT_HEAD, fontSize: 11, fontWeight: 800, color: theme.text }}>{m.val}</span>} />
                    <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ringStyle === 'bars' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 38, fontWeight: 800, color: theme.text, lineHeight: 1, letterSpacing: -1 }}>{kcalRemaining}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>kcal restantes</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text }}>{Math.round(kcalUsed/kcalTarget*100)}%</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted }}>do dia</div>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 100, background: theme.ringTrack, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(kcalUsed/kcalTarget)*100}%`, background: theme.primary, borderRadius: 100, transition: 'width 900ms' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {macroData.map(m => (
                  <MacroBar key={m.key} value={m.val/m.target} color={m.color} label={m.label} val={m.val} target={m.target} theme={theme} />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Meals today */}
      <SectionHeader title="Refeições de hoje" action="Ver tudo" onAction={() => nav('diary')} theme={theme} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.meals.slice(0, 3).map(meal => <MealCard key={meal.id} meal={meal} theme={theme} onAdd={() => nav('addFood', { meal: meal.id })} />)}
      </div>

      {/* Water */}
      <div style={{ padding: '16px 16px 0' }}>
        <Card theme={theme} pad={16} radius={22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Hidratação</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: theme.text, marginTop: 4 }}>{state.water * 250}ml <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 600 }}>/ 2000ml</span></div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2,3,4,5,6,7].map(i => (
                <div key={i} style={{
                  width: 14, height: 28, borderRadius: 4,
                  background: i < state.water ? theme.waterIce : theme.ringTrack,
                  transition: 'background 300ms',
                }} />
              ))}
            </div>
            <IconBtn icon={Icon.plus} theme={theme} variant="filled" onClick={() => state.addWater()} />
          </div>
        </Card>
      </div>

      {/* Insight */}
      <div style={{ padding: '14px 16px 0' }}>
        <Card theme={theme} pad={18} radius={22} style={{ background: theme.accentIce, color: theme.text }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.sparkle size={20} color="#4F6791" stroke={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: '#4F6791', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Insight de Lu</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 700, color: '#2D3F5C', marginTop: 4, lineHeight: 1.35 }}>
                Sua proteína está 18% acima da média da semana. Bom trabalho.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Meal card for dashboard + diary
function MealCard({ meal, theme, onAdd, expanded: expandedProp, defaultExpanded = false }) {
  const [open, setOpen] = React.useState(defaultExpanded);
  // If expanded prop is provided, use controlled mode; otherwise use local state
  const isOpen = expandedProp !== undefined ? expandedProp : open;
  const toggleable = expandedProp === undefined;
  const hasItems = meal.items.length > 0;
  return (
    <Card theme={theme} pad={14} radius={20}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <FoodImg q={meal.q} src={meal.iconSrc} w={42} h={42} style={{ borderRadius: 14, flexShrink: 0, boxShadow: `inset 0 0 0 2px ${meal.color || theme.primarySoft}` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 700, color: theme.text }}>{meal.name}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>{meal.time}</div>
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
            {meal.items.length === 0 ? 'Nada registrado ainda' : `${meal.items.length} ${meal.items.length === 1 ? 'item' : 'itens'} · ${meal.kcal} kcal`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {toggleable && hasItems && (
            <button onClick={() => setOpen(!isOpen)} aria-label={isOpen ? 'Recolher' : 'Expandir'} style={{
              width: 38, height: 38, borderRadius: 19,
              background: theme.bgElev, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms',
              }}>
                <path d="M3 5l4 4 4-4" stroke={theme.text} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <IconBtn icon={Icon.plus} theme={theme} onClick={onAdd} />
        </div>
      </div>
      {isOpen && meal.items.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meal.items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FoodImg q={item.q} w={36} h={36} style={{ borderRadius: 10 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted }}>{item.portion}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text }}>{item.kcal} kcal</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted }}>P {item.p} · C {item.c} · G {item.f}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function DiaryScreen({ theme, state, nav }) {
  const macros = state.dailyMacros;
  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      <ScreenHeader
        title="Diário"
        large
        sub="Segunda, 25 de maio"
        theme={theme}
        right={[
          <LuBtn key="lu" theme={theme} onClick={() => nav('chatLu')} />,
          <IconBtn key="cal" icon={Icon.calendar} theme={theme} />,
          <IconBtn key="more" icon={Icon.more} theme={theme} />,
        ]}
      />
      <DateStrip selected={25} theme={theme} />

      {/* Sticky summary */}
      <div style={{ padding: '6px 16px 14px', position: 'sticky', top: 0, zIndex: 5, background: theme.bg }}>
        <Card theme={theme} pad={14} radius={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MacroRing value={macros.kcal.value/macros.kcal.target} size={56} stroke={6} color={theme.primary} theme={theme}
              inner={<span style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 800, color: theme.text }}>{Math.round(macros.kcal.value/macros.kcal.target*100)}%</span>} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <MacroBar value={macros.p.value/macros.p.target} color={theme.proteinPink} label="P" val={macros.p.value} target={macros.p.target} theme={theme} />
              <MacroBar value={macros.c.value/macros.c.target} color={theme.carbsBlue} label="C" val={macros.c.value} target={macros.c.target} theme={theme} />
              <MacroBar value={macros.f.value/macros.f.target} color={theme.fatsGold} label="G" val={macros.f.value} target={macros.f.target} theme={theme} />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card theme={theme} pad={14} radius={22}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { icon: Icon.camera, label: 'Foto IA', to: 'camera', tint: theme.primarySoft, color: theme.primaryDeep },
              { icon: Icon.search, label: 'Buscar', to: 'addFood', tint: theme.accentPink, color: '#8E5E66' },
              { icon: Icon.barcode, label: 'Código', to: 'barcode', tint: theme.accentBlue, color: '#4F6791' },
              { icon: Icon.mic, label: 'Voz', to: 'voice', tint: theme.accentIce, color: '#5B7090' },
            ].map(a => {
              const IconC = a.icon;
              return (
                <button key={a.label} onClick={() => nav(a.to)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: a.tint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconC size={22} color={a.color} stroke={2} />
                  </div>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, color: theme.text }}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.meals.map(meal => <MealCard key={meal.id} meal={meal} theme={theme} onAdd={() => nav('addFood', { meal: meal.id })} defaultExpanded />)}
      </div>

      {/* Notes */}
      <div style={{ padding: '14px 16px 0' }}>
        <Card theme={theme} pad={16} radius={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text }}>Notas do dia</div>
            <Icon.edit size={16} color={theme.textMuted} />
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>
            Acordei com energia. Almoço pesado, sono à tarde. Treino de pernas pesou.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Energia: 7/10', 'Sono: 7h', 'Treino: pernas'].map(t => (
              <span key={t} style={{
                padding: '4px 10px', background: theme.bgSubtle, borderRadius: 100,
                fontFamily: FONT_BODY, fontSize: 11, color: theme.text, fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ padding: 16 }}>
        <Btn variant="primary" full size="lg" theme={theme} icon={Icon.check} onClick={() => {}}>Completar dia</Btn>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADD FOOD (sheet style screen)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AddFoodScreen({ theme, state, nav }) {
  const [tab, setTab] = React.useState('search');
  const [query, setQuery] = React.useState('');
  const tabs = [
    { id: 'search', label: 'Buscar' },
    { id: 'recent', label: 'Recentes' },
    { id: 'fav', label: 'Favoritos' },
    { id: 'mine', label: 'Meus' },
    { id: 'recipes', label: 'Receitas' },
    { id: 'meals', label: 'Refeições' },
  ];
  const results = state.foodDB.filter(f =>
    !query || f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 32 }}>
      <ScreenHeader
        title="Adicionar a Almoço"
        theme={theme}
        left={[<IconBtn key="back" icon={Icon.close} theme={theme} onClick={() => nav.back()} />]}
        right={[<IconBtn key="bc" icon={Icon.barcode} theme={theme} onClick={() => nav('barcode')} />]}
      />

      {/* Search input */}
      <div style={{ padding: '4px 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: theme.bgElev, borderRadius: 16, padding: '12px 14px',
          boxShadow: theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)',
        }}>
          <Icon.search size={18} color={theme.textMuted} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busque por alimento, marca…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: FONT_BODY, fontSize: 14, color: theme.text,
            }}
          />
          <button onClick={() => nav('voice')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon.mic size={18} color={theme.primaryDeep} stroke={2} />
          </button>
          <button onClick={() => nav('camera')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon.camera size={18} color={theme.primaryDeep} stroke={2} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px 12px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} theme={theme}>{t.label}</Chip>
          ))}
        </div>
      </div>

      <SectionHeader title={tab === 'search' ? 'Resultados' : tab === 'recent' ? 'Recentes' : 'Favoritos'} theme={theme} size="sm" />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map(food => (
          <button key={food.id} onClick={() => nav('foodDetail', { food })} style={{
            background: theme.bgElev, border: 'none', borderRadius: 18, padding: 14,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
            boxShadow: theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)',
          }}>
            <FoodImg q={food.q} w={44} h={44} style={{ borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 700, color: theme.text }}>{food.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{food.brand} · {food.portion}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 800, color: theme.text }}>{food.kcal}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted }}>kcal</div>
            </div>
            <Icon.star size={18} color={food.fav ? theme.primary : theme.textFaint} stroke={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FOOD DETAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FoodDetailScreen({ theme, state, nav, params }) {
  const food = params?.food || state.foodDB[0];
  const [qty, setQty] = React.useState(100);
  const [unit, setUnit] = React.useState('g');
  const factor = qty / 100;
  const kcal = Math.round(food.kcal * factor);
  const p = Math.round(food.p * factor);
  const c = Math.round(food.c * factor);
  const f = Math.round(food.f * factor);
  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 100 }}>
      <ScreenHeader
        title={food.name}
        theme={theme}
        left={[<IconBtn key="back" icon={Icon.back} theme={theme} onClick={() => nav.back()} />]}
        right={[<IconBtn key="fav" icon={Icon.heart} theme={theme} />, <IconBtn key="more" icon={Icon.more} theme={theme} />]}
      />

      <div style={{ padding: '0 16px' }}>
        <FoodImg q={food.q} w="100%" h={180} style={{ borderRadius: 24, width: '100%' }} />
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{food.brand}</div>
        <h1 style={{ margin: '4px 0 0', fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: -0.4 }}>{food.name}</h1>
      </div>

      {/* Portion selector */}
      <div style={{ padding: '16px 16px 0' }}>
        <Card theme={theme} pad={16} radius={20}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Porção</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <input type="number" value={qty} onChange={e => setQty(parseInt(e.target.value || '0'))} style={{
              flex: 1, border: 'none', outline: 'none', background: theme.bgSubtle, borderRadius: 12,
              padding: '12px 14px', fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 700, color: theme.text,
            }} />
            <select value={unit} onChange={e => setUnit(e.target.value)} style={{
              background: theme.bgSubtle, border: 'none', borderRadius: 12, padding: '12px 14px',
              fontFamily: FONT_BODY, fontSize: 14, color: theme.text, fontWeight: 600,
            }}>
              <option value="g">gramas</option>
              <option value="ml">ml</option>
              <option value="un">unidade</option>
              <option value="xíc">xícara</option>
              <option value="col">colher</option>
            </select>
          </div>
          <input type="range" min="10" max="500" value={qty} onChange={e => setQty(parseInt(e.target.value))} style={{
            width: '100%', marginTop: 12, accentColor: theme.primary,
          }} />
        </Card>
      </div>

      {/* Nutrition values */}
      <div style={{ padding: '14px 16px 0' }}>
        <Card theme={theme} pad={18} radius={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 32, fontWeight: 800, color: theme.text, letterSpacing: -0.5 }}>{kcal}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted }}>kcal · {qty}{unit}</div>
            </div>
            <MacroRing size={60} stroke={6} value={kcal/2200} color={theme.primary} theme={theme}
              inner={<Icon.flame size={20} color={theme.primaryDeep} />} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[{ k: 'Proteína', v: p, color: theme.proteinPink },
              { k: 'Carbo', v: c, color: theme.carbsBlue },
              { k: 'Gordura', v: f, color: theme.fatsGold }].map(m => (
              <div key={m.k} style={{ background: theme.bgSubtle, borderRadius: 14, padding: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 800, color: theme.text }}>{m.v}<span style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted }}>g</span></div>
                <div style={{ width: 24, height: 3, background: m.color, borderRadius: 2, margin: '6px auto 4px' }} />
                <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>{m.k}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom action */}
      <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 10 }}>
        <Btn variant="primary" full size="lg" theme={theme} onClick={() => nav.back()}>Adicionar · {kcal} kcal</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, DiaryScreen, AddFoodScreen, FoodDetailScreen, MealCard });
