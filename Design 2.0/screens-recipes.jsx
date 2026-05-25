// screens-recipes.jsx — Recipes (My, Discover), Detail, Import, Pantry

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RECIPES — Library with tabs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RecipesScreen({ theme, state, nav }) {
  const [tab, setTab] = React.useState('mine');
  const [filter, setFilter] = React.useState('all');

  const tabs = [
    { id: 'mine', label: 'Minhas' },
    { id: 'discover', label: 'Descobrir' },
    { id: 'collections', label: 'Coleções' },
    { id: 'pantry', label: 'Despensa' },
  ];

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      <ScreenHeader
        title="Receitas"
        large
        theme={theme}
        right={[
          <LuBtn key="lu" theme={theme} onClick={() => nav('chatLu')} />,
          <IconBtn key="s" icon={Icon.search} theme={theme} />,
          <IconBtn key="add" icon={Icon.plus} theme={theme} onClick={() => nav('importRecipe')} variant="filled" />,
        ]}
      />

      {/* Tab strip */}
      <div style={{ padding: '0 16px 14px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} theme={theme}>{t.label}</Chip>
          ))}
        </div>
      </div>

      {tab === 'mine' && <MyRecipes theme={theme} state={state} nav={nav} filter={filter} setFilter={setFilter} />}
      {tab === 'discover' && <DiscoverRecipes theme={theme} state={state} nav={nav} />}
      {tab === 'collections' && <Collections theme={theme} />}
      {tab === 'pantry' && <PantryView theme={theme} state={state} nav={nav} />}
    </div>
  );
}

function MyRecipes({ theme, state, nav, filter, setFilter }) {
  const filters = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const fLabels = { all: 'Todas', breakfast: 'Café', lunch: 'Almoço', dinner: 'Jantar', snack: 'Lanche', dessert: 'Sobremesa' };
  return (
    <div>
      <div style={{ padding: '0 16px 14px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.map(f => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)} theme={theme}>{fLabels[f]}</Chip>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {state.recipes.map(r => (
          <button key={r.id} onClick={() => nav('recipeDetail', { recipe: r })} style={{
            background: theme.bgElev, border: 'none', borderRadius: 18, padding: 0,
            display: 'flex', flexDirection: 'column', cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
            boxShadow: theme.dark ? 'none' : '0 1px 3px rgba(27,27,27,0.05)',
          }}>
            <div style={{ position: 'relative' }}>
              <FoodImg q={r.q} w="100%" h={120} style={{ borderRadius: '18px 18px 0 0', width: '100%' }} />
              <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(255,255,255,0.92)', width: 28, height: 28, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.heartFill size={14} color={theme.proteinPink} />
              </div>
              <div style={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                padding: '3px 8px', borderRadius: 100,
                fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon.clock size={10} color="#fff" /> {r.time}
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text, lineHeight: 1.25 }}>{r.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>{r.kcal} kcal · {r.tag}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textFaint }}>{r.servings} porç.</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiscoverRecipes({ theme, state, nav }) {
  return (
    <div>
      {/* Hero — for your goals */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card theme={theme} pad={0} radius={22} style={{ overflow: 'hidden' }}>
          <FoodImg q="bowl,protein,colorful" w="100%" h={160} style={{ borderRadius: 0, width: '100%' }} />
          <div style={{ padding: 18 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.primaryDeep, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Para suas metas</div>
            <h3 style={{ margin: '4px 0 4px', fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 800, color: theme.text, letterSpacing: -0.2 }}>Bowls com 30g+ de proteína</h3>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted }}>Selecionados com base nos seus macros restantes hoje</div>
          </div>
        </Card>
      </div>

      <SectionHeader title="Em alta esta semana" theme={theme} size="sm" />
      <div style={{ padding: '0 16px 4px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {state.recipes.slice(0, 5).map(r => (
          <button key={r.id} onClick={() => nav('recipeDetail', { recipe: r })} style={{
            flexShrink: 0, width: 150, background: theme.bgElev, border: 'none', borderRadius: 16, padding: 0,
            cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
          }}>
            <FoodImg q={r.q} w={150} h={110} style={{ borderRadius: '16px 16px 0 0' }} />
            <div style={{ padding: 10 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: theme.text, lineHeight: 1.25, height: 30, overflow: 'hidden' }}>{r.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, marginTop: 4 }}>{r.kcal} kcal</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <SectionHeader title="Combina com seu humor" theme={theme} size="sm" />
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginLeft: -16, marginRight: -16 }}>
          {state.recipes.slice(3, 5).map(r => (
            <Card key={r.id} theme={theme} pad={0} radius={16} style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <FoodImg q={r.q} w="100%" h={100} style={{ borderRadius: 0, width: '100%' }} />
              <div style={{ padding: 10 }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 12, fontWeight: 700, color: theme.text }}>{r.name}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{r.kcal} kcal · {r.time}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Collections({ theme }) {
  const cols = [
    { name: 'Café proteico', count: 8, q: 'breakfast,eggs' },
    { name: 'Pré-treino', count: 5, q: 'smoothie,oats' },
    { name: 'Jantar leve', count: 12, q: 'salad,dinner' },
    { name: 'Receitas da vó', count: 6, q: 'brazilian,homemade' },
  ];
  return (
    <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <button style={{
        background: theme.bgElev, border: `1.5px dashed ${theme.borderStrong}`, borderRadius: 18,
        padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        minHeight: 160,
      }}>
        <Icon.plus size={26} color={theme.textMuted} stroke={2} />
        <span style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.textMuted }}>Nova coleção</span>
      </button>
      {cols.map(c => (
        <Card key={c.name} theme={theme} pad={0} radius={18} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: 110, gap: 1, background: theme.border }}>
            {[1,2,3,4].map(i => <FoodImg key={i} q={`${c.q},${i}`} w="100%" h="100%" style={{ borderRadius: 0, width: '100%', height: '100%' }} />)}
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text }}>{c.name}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{c.count} receitas</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PantryView({ theme, state, nav }) {
  const groups = [
    { name: 'Hortifruti', items: [
      { name: 'Tomate', qty: '4 un', exp: '2 dias', warn: true },
      { name: 'Alface', qty: '1 maço', exp: '4 dias' },
      { name: 'Cenoura', qty: '500g', exp: '8 dias' },
    ]},
    { name: 'Proteínas', items: [
      { name: 'Peito de frango', qty: '600g', exp: '3 dias' },
      { name: 'Ovos', qty: '8 un', exp: '15 dias' },
    ]},
    { name: 'Grãos & Massas', items: [
      { name: 'Arroz integral', qty: '1 kg' },
      { name: 'Lentilha', qty: '500g' },
    ]},
  ];
  return (
    <div style={{ padding: '0 16px 0' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Btn variant="secondary" size="md" theme={theme} icon={Icon.plus} style={{ flex: 1 }} onClick={() => {}}>Adicionar</Btn>
        <Btn variant="outline" size="md" theme={theme} icon={Icon.camera} style={{ flex: 1 }} onClick={() => nav('camera')}>Foto da geladeira</Btn>
      </div>
      <Card theme={theme} pad={14} radius={16} style={{ marginBottom: 14, background: theme.primarySoft }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon.sparkle size={22} color={theme.primaryDeep} stroke={2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.primaryDeep }}>14 receitas cabem na sua despensa</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.primaryDeep, opacity: 0.8, marginTop: 2 }}>Ver sugestões com o que você já tem</div>
          </div>
          <Icon.forward size={18} color={theme.primaryDeep} />
        </div>
      </Card>
      {groups.map(g => (
        <div key={g.name} style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{g.name}</div>
          <Card theme={theme} pad={0} radius={16}>
            {g.items.map((it, i) => (
              <div key={it.name} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < g.items.length - 1 ? `1px solid ${theme.border}` : 'none',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: it.warn ? '#E59A5B' : theme.primary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: theme.text }}>{it.name}</div>
                  {it.exp && <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: it.warn ? '#C77642' : theme.textMuted, marginTop: 1 }}>Vence em {it.exp}</div>}
                </div>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text }}>{it.qty}</div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RECIPE DETAIL — parallax header
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RecipeDetailScreen({ theme, state, nav, params }) {
  const recipe = params?.recipe || state.recipes[0];
  const [tab, setTab] = React.useState('ingredients');
  const [servings, setServings] = React.useState(recipe.servings || 2);
  const scale = servings / (recipe.servings || 2);

  const [ingredients, setIngredients] = React.useState([
    { name: 'Peito de frango', qty: '300g', status: 'pantry' },
    { name: 'Arroz integral', qty: '1 xícara', status: 'pantry' },
    { name: 'Brócolis', qty: '200g', status: 'list' },
    { name: 'Azeite', qty: '2 colheres', status: null },
    { name: 'Alho', qty: '3 dentes', status: 'pantry' },
    { name: 'Limão', qty: '1 unidade', status: 'list' },
  ]);
  const setStatus = (idx, status) => setIngredients(prev => prev.map((it, i) => i === idx ? { ...it, status: it.status === status ? null : status } : it));
  const inListCount = ingredients.filter(i => i.status === 'list').length;
  const inPantryCount = ingredients.filter(i => i.status === 'pantry').length;

  const steps = [
    'Tempere o frango com sal, pimenta e suco de meio limão. Deixe descansar 10 minutos.',
    'Cozinhe o arroz integral em água fervente por 25 minutos, escorra e reserve.',
    'Em uma frigideira, doure o alho no azeite, adicione o brócolis e refogue por 4 minutos.',
    'Grelhe o frango por 6-7 minutos de cada lado. Sirva sobre o arroz com o brócolis.',
  ];

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 110 }}>
      {/* Parallax hero */}
      <div style={{ position: 'relative', height: 260 }}>
        <FoodImg q={recipe.q} w="100%" h={260} style={{ borderRadius: 0, width: '100%', height: 260 }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(27,27,27,0.5) 100%)',
        }} />
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => nav.back()} style={{
            width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.92)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon.back size={18} color="#1B1B1B" />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {[Icon.heartFill, Icon.bookmark, Icon.more].map((IconC, i) => (
              <button key={i} style={{
                width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.92)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconC size={16} color={i === 0 ? theme.proteinPink : '#1B1B1B'} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Title overlap card */}
      <div style={{ marginTop: -32, padding: '0 16px', position: 'relative', zIndex: 2 }}>
        <Card theme={theme} pad={20} radius={24}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {['Almoço', 'Alto em proteína', 'Sem glúten'].map(t => (
              <span key={t} style={{
                padding: '4px 10px', background: theme.bgSubtle, borderRadius: 100,
                fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: theme.text,
              }}>{t}</span>
            ))}
          </div>
          <h1 style={{ margin: 0, fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: -0.4, lineHeight: 1.15 }}>
            {recipe.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${theme.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>TEMPO</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 800, color: theme.text, marginTop: 2 }}>{recipe.time}</div>
            </div>
            <div style={{ width: 1, height: 30, background: theme.border }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>NÍVEL</div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 800, color: theme.text, marginTop: 2 }}>Fácil</div>
            </div>
            <div style={{ width: 1, height: 30, background: theme.border }} />
            <div style={{ flex: 1.4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>PORÇÕES</div>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 800, color: theme.text, marginTop: 2 }}>{servings}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setServings(Math.max(1, servings - 1))} style={{ width: 24, height: 24, borderRadius: 12, background: theme.bgSubtle, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: FONT_HEAD, fontWeight: 800, color: theme.text }}>−</span>
                </button>
                <button onClick={() => setServings(servings + 1)} style={{ width: 24, height: 24, borderRadius: 12, background: theme.bgSubtle, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: FONT_HEAD, fontWeight: 800, color: theme.text }}>+</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Nutrition */}
      <div style={{ padding: '14px 16px 0' }}>
        <Card theme={theme} pad={16} radius={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <MacroRing size={70} stroke={8} value={(recipe.kcal*scale)/2200} color={theme.primary} theme={theme}
              inner={<><div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: theme.text }}>{Math.round(recipe.kcal * scale)}</div>
                     <div style={{ fontFamily: FONT_BODY, fontSize: 9, color: theme.textMuted, marginTop: -2 }}>kcal</div></>} />
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[{ k: 'P', v: Math.round(38*scale), c: theme.proteinPink },
                { k: 'C', v: Math.round(45*scale), c: theme.carbsBlue },
                { k: 'G', v: Math.round(12*scale), c: theme.fatsGold }].map(m => (
                <div key={m.k} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800, color: theme.text }}>{m.v}g</div>
                  <div style={{ width: 22, height: 3, background: m.c, borderRadius: 2, margin: '4px auto' }} />
                  <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>{m.k}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', gap: 6 }}>
        {[
          { id: 'ingredients', label: 'Ingredientes' },
          { id: 'steps', label: 'Modo de preparo' },
          { id: 'notes', label: 'Notas' },
        ].map(t => (
          <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} theme={theme}>{t.label}</Chip>
        ))}
      </div>

      {tab === 'ingredients' && (
        <div style={{ padding: '4px 16px' }}>
          {/* Summary header with actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 10px' }}>
            <div style={{ display: 'flex', gap: 6, fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>
              <span style={{ color: theme.primaryDeep, fontWeight: 700 }}>{inPantryCount} na despensa</span>
              <span>·</span>
              <span style={{ color: theme.text, fontWeight: 700 }}>{inListCount} na lista</span>
            </div>
            <button onClick={() => setIngredients(prev => prev.map(it => it.status ? it : { ...it, status: 'list' }))} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: theme.primaryDeep,
              display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>
              <Icon.cart size={14} color={theme.primaryDeep} stroke={2} />
              + à lista
            </button>
          </div>
          <Card theme={theme} pad={0} radius={18}>
            {ingredients.map((ing, i) => {
              const inPantry = ing.status === 'pantry';
              const inList = ing.status === 'list';
              return (
                <div key={ing.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderBottom: i < ingredients.length - 1 ? `1px solid ${theme.border}` : 'none',
                }}>
                  {/* Pantry checkbox */}
                  <button onClick={() => setStatus(i, 'pantry')} style={{
                    width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${inPantry ? theme.primary : theme.borderStrong}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: inPantry ? theme.primary : 'transparent',
                    cursor: 'pointer', padding: 0,
                  }} title="Tenho na despensa">
                    {inPantry && <Icon.check size={14} color="#fff" stroke={3} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: theme.text,
                      textDecoration: inPantry ? 'line-through' : 'none',
                      textDecorationColor: theme.textMuted,
                      opacity: inPantry ? 0.55 : 1,
                    }}>{ing.name}</div>
                    {inPantry && <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.primaryDeep, fontWeight: 700, marginTop: 1 }}>Já tem na despensa</div>}
                    {inList && <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.text, fontWeight: 700, marginTop: 1 }}>Na lista de compras</div>}
                    {!ing.status && <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.textMuted, marginTop: 1 }}>Não marcado</div>}
                  </div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.text, opacity: inPantry ? 0.55 : 1 }}>{ing.qty}</div>
                  {/* Cart toggle */}
                  <button onClick={() => setStatus(i, 'list')} style={{
                    width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                    background: inList ? theme.text : theme.bgSubtle,
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0,
                  }} title="Adicionar à lista de compras">
                    <Icon.cart size={15} color={inList ? theme.bg : theme.textMuted} stroke={2} />
                  </button>
                </div>
              );
            })}
          </Card>

          {/* Floating list indicator */}
          {inListCount > 0 && (
            <div style={{ marginTop: 14 }}>
              <button onClick={() => nav('shoppingList')} style={{
                width: '100%', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
              }}>
                <Card theme={theme} pad={14} radius={16} style={{ background: theme.bgSubtle }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, background: theme.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon.cart size={18} color={theme.bg} stroke={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 800, color: theme.text }}>
                        Ver lista de compras
                      </div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                        {inListCount} {inListCount === 1 ? 'item' : 'itens'} desta receita
                      </div>
                    </div>
                    <Icon.forward size={16} color={theme.textMuted} />
                  </div>
                </Card>
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'steps' && (
        <div style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => (
            <Card key={i} theme={theme} pad={14} radius={16}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14, background: theme.primarySoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 13, color: theme.primaryDeep,
                }}>{i + 1}</div>
                <div style={{ flex: 1, fontFamily: FONT_BODY, fontSize: 14, color: theme.text, lineHeight: 1.5 }}>{s}</div>
              </div>
            </Card>
          ))}
          <Btn variant="secondary" size="md" theme={theme} icon={Icon.clock} onClick={() => {}} style={{ alignSelf: 'flex-start', marginTop: 4 }}>Modo cozinhar</Btn>
        </div>
      )}

      {tab === 'notes' && (
        <div style={{ padding: '4px 16px' }}>
          <Card theme={theme} pad={16} radius={16}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: theme.text, lineHeight: 1.5 }}>
              Da última vez fiquei sem brócolis e usei couve. Ficou ótimo. Diminuir o tempo do frango em 1 min.
            </div>
            <div style={{ marginTop: 8, fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted }}>Feita 3× · última: 12 mai</div>
          </Card>
        </div>
      )}

      {/* Sticky action */}
      <div style={{
        position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 10,
        display: 'flex', gap: 8,
      }}>
        <Btn variant="outline" size="lg" theme={theme} style={{ flex: 1 }} icon={Icon.calendar} onClick={() => {}}>Planejar</Btn>
        <Btn variant="primary" size="lg" theme={theme} style={{ flex: 1.4 }} icon={Icon.plus} onClick={() => nav('diary')}>Ao diário</Btn>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPORT RECIPE — selection of method
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ImportRecipeScreen({ theme, nav }) {
  const methods = [
    { icon: Icon.link, title: 'Importar de um link', sub: 'Instagram, TikTok, YouTube, blog', tint: theme.accentBlue, color: '#4F6791' },
    { icon: Icon.camera, title: 'Foto de receita', sub: 'OCR de livros, papel ou print', tint: theme.accentPink, color: '#8E5E66' },
    { icon: Icon.video, title: 'Vídeo de receita', sub: 'Transcrição + IA extrai ingredientes', tint: theme.primarySoft, color: theme.primaryDeep },
    { icon: Icon.pen, title: 'Criar do zero', sub: 'Editor manual completo', tint: theme.accentIce, color: '#5B7090' },
  ];
  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 32 }}>
      <ScreenHeader
        title="Nova receita"
        large
        sub="Escolha como você quer começar"
        theme={theme}
        left={[<IconBtn key="back" icon={Icon.close} theme={theme} onClick={() => nav.back()} />]}
      />
      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {methods.map(m => {
          const IconC = m.icon;
          return (
            <button key={m.title} style={{
              background: theme.bgElev, border: 'none', borderRadius: 20, padding: 16,
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left',
              boxShadow: theme.dark ? 'none' : '0 1px 2px rgba(27,27,27,0.04)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: m.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <IconC size={24} color={m.color} stroke={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 800, color: theme.text }}>{m.title}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{m.sub}</div>
              </div>
              <Icon.forward size={18} color={theme.textFaint} />
            </button>
          );
        })}
      </div>

      {/* Link paste field */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 }}>Cole o link aqui</div>
        <Card theme={theme} pad={14} radius={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.link size={18} color={theme.textMuted} />
            <input placeholder="https://instagram.com/p/…" style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: FONT_BODY, fontSize: 14, color: theme.text,
            }} />
            <Btn variant="primary" size="md" theme={theme} icon={Icon.sparkle} onClick={() => {}}>Importar</Btn>
          </div>
        </Card>
        <div style={{ marginTop: 12, padding: '12px 14px', background: theme.accentIce, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.sparkle size={16} color="#4F6791" />
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: '#2D3F5C', lineHeight: 1.4 }}>
            Lu extrai ingredientes, modo de preparo e calcula nutrição automaticamente.
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHOPPING LIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ShoppingListScreen({ theme, nav }) {
  const [items, setItems] = React.useState([
    { id: 1, name: 'Brócolis', qty: '1 cabeça', cat: 'Hortifruti', checked: false, inPantry: false },
    { id: 2, name: 'Limão', qty: '4 unidades', cat: 'Hortifruti', checked: false, inPantry: false },
    { id: 3, name: 'Tomate', qty: '6 unidades', cat: 'Hortifruti', checked: true, inPantry: false },
    { id: 4, name: 'Alface americana', qty: '1 maço', cat: 'Hortifruti', checked: false, inPantry: false },
    { id: 5, name: 'Salmão fresco', qty: '500g', cat: 'Proteínas', checked: false, inPantry: false },
    { id: 6, name: 'Iogurte natural', qty: '4 potes', cat: 'Laticínios', checked: true, inPantry: false },
    { id: 7, name: 'Queijo cottage', qty: '200g', cat: 'Laticínios', checked: false, inPantry: false },
    { id: 8, name: 'Quinoa', qty: '500g', cat: 'Grãos', checked: false, inPantry: true },
    { id: 9, name: 'Aveia em flocos', qty: '1 kg', cat: 'Grãos', checked: false, inPantry: false },
    { id: 10, name: 'Páprica defumada', qty: '1 pote', cat: 'Temperos', checked: false, inPantry: false },
    { id: 11, name: 'Manjericão fresco', qty: '1 maço', cat: 'Temperos', checked: false, inPantry: false },
  ]);
  const [marketMode, setMarketMode] = React.useState(false);

  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const remove = (id) => setItems(items.filter(i => i.id !== id));
  const togglePantry = (id) => setItems(items.map(i => i.id === id ? { ...i, inPantry: !i.inPantry, checked: !i.inPantry } : i));

  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  const remaining = total - checked;
  const pct = total ? Math.round((checked / total) * 100) : 0;

  const byCategory = items.reduce((acc, it) => {
    (acc[it.cat] = acc[it.cat] || []).push(it);
    return acc;
  }, {});
  const categoryOrder = ['Hortifruti', 'Proteínas', 'Laticínios', 'Grãos', 'Temperos', 'Outros'];
  const categoryIcons = { Hortifruti: '🥦', Proteínas: '🐟', Laticínios: '🧀', Grãos: '🌾', Temperos: '🌿', Outros: '🛒' };

  if (marketMode) {
    return <MarketMode theme={theme} items={items} toggle={toggle} onExit={() => setMarketMode(false)} />;
  }

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 100 }}>
      <ScreenHeader
        title="Lista de compras"
        large
        sub={`${remaining} ${remaining === 1 ? 'item restante' : 'itens restantes'}`}
        theme={theme}
        left={[<IconBtn key="back" icon={Icon.back} theme={theme} onClick={() => nav.back()} />]}
        right={[
          <IconBtn key="add" icon={Icon.plus} theme={theme} />,
          <IconBtn key="more" icon={Icon.more} theme={theme} />,
        ]}
      />

      {/* Progress card */}
      <div style={{ padding: '0 16px 14px' }}>
        <Card theme={theme} pad={16} radius={20}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: -0.4, lineHeight: 1 }}>
                {checked}<span style={{ fontSize: 16, color: theme.textMuted, fontWeight: 600 }}> / {total}</span>
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 4 }}>itens comprados</div>
            </div>
            <span style={{
              background: theme.primarySoft, color: theme.primaryDeep,
              padding: '4px 12px', borderRadius: 100, fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700,
            }}>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: theme.ringTrack, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: theme.primary, borderRadius: 100, transition: 'width 600ms cubic-bezier(.2,.8,.2,1)' }} />
          </div>
        </Card>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
        <Btn variant="primary" size="md" theme={theme} icon={Icon.cart} style={{ flex: 1 }} onClick={() => setMarketMode(true)}>
          Modo mercado
        </Btn>
        <Btn variant="outline" size="md" theme={theme} icon={Icon.send} style={{ flex: 1 }} onClick={() => {}}>
          Compartilhar
        </Btn>
      </div>

      {/* Grouped list */}
      <div style={{ padding: '0 16px' }}>
        {categoryOrder.filter(c => byCategory[c]).map(cat => {
          const list = byCategory[cat];
          const remaining = list.filter(i => !i.checked).length;
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 4px 8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{categoryIcons[cat]}</span>
                  <span style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 800, color: theme.text, letterSpacing: 0.2 }}>{cat}</span>
                </div>
                <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>{remaining} de {list.length}</span>
              </div>
              <Card theme={theme} pad={0} radius={16}>
                {list.map((it, i) => (
                  <div key={it.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderBottom: i < list.length - 1 ? `1px solid ${theme.border}` : 'none',
                  }}>
                    <button onClick={() => toggle(it.id)} style={{
                      width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${it.checked ? theme.primary : theme.borderStrong}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: it.checked ? theme.primary : 'transparent',
                      cursor: 'pointer', padding: 0,
                    }}>
                      {it.checked && <Icon.check size={14} color="#fff" stroke={3} />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
                        color: it.checked ? theme.textMuted : theme.text,
                        textDecoration: it.checked ? 'line-through' : 'none',
                      }}>{it.name}</div>
                      {it.inPantry && <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: theme.primaryDeep, fontWeight: 700, marginTop: 1 }}>
                        Já na despensa
                      </div>}
                    </div>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.textMuted }}>{it.qty}</div>
                    <button onClick={() => togglePantry(it.id)} style={{
                      width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                      background: it.inPantry ? theme.primarySoft : 'transparent',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }} title="Marcar como na despensa">
                      <Icon.pantry size={14} color={it.inPantry ? theme.primaryDeep : theme.textFaint} stroke={2} />
                    </button>
                  </div>
                ))}
              </Card>
            </div>
          );
        })}

        {/* Add custom */}
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '14px', background: 'transparent',
          border: `1.5px dashed ${theme.borderStrong}`, borderRadius: 16,
          fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: theme.textMuted,
          cursor: 'pointer',
        }}>
          <Icon.plus size={16} color={theme.textMuted} stroke={2} />
          Adicionar item manualmente
        </button>
      </div>
    </div>
  );
}

// Market mode — large items, optimized for the supermarket
function MarketMode({ theme, items, toggle, onExit }) {
  const remaining = items.filter(i => !i.checked);
  const done = items.filter(i => i.checked);
  return (
    <div style={{ minHeight: '100%', background: '#1B1B1B', color: '#fff', paddingBottom: 80 }}>
      <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onExit} style={{
          width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.08)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.close size={20} color="#fff" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Modo mercado</div>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 800 }}>{remaining.length} pra pegar</div>
        </div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '0 16px' }}>
        {remaining.map(it => (
          <button key={it.id} onClick={() => toggle(it.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '18px 20px',
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 18,
            marginBottom: 10, cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, border: `2px solid rgba(255,255,255,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{it.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{it.qty} · {it.cat}</div>
            </div>
          </button>
        ))}
        {done.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '0 4px 10px' }}>
              No carrinho · {done.length}
            </div>
            {done.map(it => (
              <button key={it.id} onClick={() => toggle(it.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px',
                background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', opacity: 0.5,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, background: theme.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon.check size={14} color="#fff" stroke={3} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 700, color: '#fff',
                    textDecoration: 'line-through',
                  }}>{it.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { RecipesScreen, RecipeDetailScreen, ImportRecipeScreen, ShoppingListScreen });
