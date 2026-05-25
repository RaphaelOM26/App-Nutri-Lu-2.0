// app.jsx — Nutri Lu root: state, navigation, dual device frames, tweaks

// ─── Default tweaks (persisted via host) ─────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "palette": "sage",
  "ringStyle": "concentric",
  "density": "airy",
  "fabPulse": true,
  "showAndroid": true,
  "showIos": true
}/*EDITMODE-END*/;

// ─── Initial state (shared across both devices) ──────────────────
const initialState = () => ({
  screen: 'home',
  history: [],
  params: {},
  water: 5,
  dailyMacros: {
    kcal: { value: 1248, target: 2200 },
    p: { value: 86, target: 135 },
    c: { value: 132, target: 240 },
    f: { value: 38, target: 70 },
  },
  meals: [
    {
      id: 'breakfast', name: 'Café da manhã', q: 'breakfast,bread,coffee',
      iconSrc: 'https://images.unsplash.com/photo-1568051243847-b6319fad107c?w=180&h=180&fit=crop&auto=format&q=70',
      time: '07:30', color: '#EACBD1', kcal: 412,
      items: [
        { id: 1, q: 'oats,bowl', name: 'Aveia com banana', portion: '1 tigela · 80g', kcal: 310, p: 11, c: 56, f: 6 },
        { id: 2, q: 'coffee,milk', name: 'Café com leite', portion: '1 xícara', kcal: 102, p: 6, c: 9, f: 4 },
      ],
    },
    {
      id: 'lunch', name: 'Almoço', q: 'chicken,rice,bowl', time: '12:30', color: '#D6E0CF', kcal: 638,
      items: [
        { id: 3, q: 'rice,brown', name: 'Arroz integral', portion: '120g', kcal: 144, p: 3, c: 30, f: 1 },
        { id: 4, q: 'chicken,grilled', name: 'Frango grelhado', portion: '150g', kcal: 247, p: 46, c: 0, f: 5 },
        { id: 5, q: 'salad,green', name: 'Salada verde', portion: '1 prato', kcal: 60, p: 2, c: 7, f: 2 },
        { id: 6, q: 'broccoli,steamed', name: 'Brócolis', portion: '100g', kcal: 35, p: 3, c: 7, f: 0 },
      ],
    },
    {
      id: 'snack', name: 'Lanche', q: 'apple,red', time: '16:00', color: '#D4E0EE', kcal: 198,
      items: [
        { id: 7, q: 'apple,red', name: 'Maçã', portion: '1 unidade', kcal: 95, p: 0, c: 25, f: 0 },
        { id: 8, q: 'almond,nuts', name: 'Amêndoas', portion: '20g', kcal: 103, p: 4, c: 4, f: 9 },
      ],
    },
    {
      id: 'dinner', name: 'Jantar', q: 'salmon,vegetables', time: '19:30', color: '#C0CFE6', kcal: 0,
      items: [],
    },
  ],
  recipes: [
    { id: 'r1', name: 'Frango grelhado com arroz integral', q: 'chicken,rice,bowl', time: '25min', kcal: 480, tag: 'Almoço', servings: 2 },
    { id: 'r2', name: 'Salada de quinoa e abacate', q: 'quinoa,avocado,salad', time: '15min', kcal: 380, tag: 'Almoço', servings: 2 },
    { id: 'r3', name: 'Bowl de aveia com frutas vermelhas', q: 'oats,berries,bowl', time: '8min', kcal: 320, tag: 'Café', servings: 1 },
    { id: 'r4', name: 'Salmão ao forno com legumes', q: 'salmon,vegetables,roasted', time: '30min', kcal: 540, tag: 'Jantar', servings: 2 },
    { id: 'r5', name: 'Panqueca proteica de banana', q: 'pancake,banana', time: '10min', kcal: 290, tag: 'Café', servings: 1 },
    { id: 'r6', name: 'Wrap de frango e vegetais', q: 'wrap,chicken', time: '12min', kcal: 410, tag: 'Lanche', servings: 1 },
    { id: 'r7', name: 'Sopa de lentilha', q: 'lentil,soup', time: '40min', kcal: 320, tag: 'Jantar', servings: 4 },
    { id: 'r8', name: 'Smoothie verde detox', q: 'smoothie,green', time: '5min', kcal: 220, tag: 'Café', servings: 1 },
  ],
  foodDB: [
    { id: 'f1', name: 'Pão francês', brand: 'Padaria', portion: '1 unid · 50g', kcal: 135, p: 4, c: 25, f: 1, q: 'french,bread', fav: false },
    { id: 'f2', name: 'Iogurte natural desnatado', brand: 'Nestlé', portion: '170g', kcal: 84, p: 14, c: 7, f: 0, q: 'yogurt,natural', fav: true },
    { id: 'f3', name: 'Banana prata', brand: 'Genérico', portion: '100g', kcal: 89, p: 1, c: 23, f: 0, q: 'banana', fav: false },
    { id: 'f4', name: 'Whey protein chocolate', brand: 'Growth', portion: '30g · 1 scoop', kcal: 120, p: 24, c: 3, f: 1, q: 'whey,protein', fav: true },
    { id: 'f5', name: 'Aveia em flocos', brand: 'Quaker', portion: '40g', kcal: 156, p: 6, c: 27, f: 3, q: 'oats,bowl', fav: false },
    { id: 'f6', name: 'Ovo cozido', brand: 'Genérico', portion: '1 unidade · 50g', kcal: 78, p: 6, c: 1, f: 5, q: 'egg,boiled', fav: false },
    { id: 'f7', name: 'Filé de salmão', brand: 'Genérico', portion: '100g', kcal: 208, p: 20, c: 0, f: 13, q: 'salmon,fillet', fav: false },
  ],
});

// ─── Reducer for the app state ──────────────────────────────────
function useAppState() {
  const [s, setS] = React.useState(initialState());
  const nav = (screen, params = {}) => setS(p => ({ ...p, screen, params, history: [...p.history, p.screen] }));
  nav.back = () => setS(p => {
    const prev = p.history[p.history.length - 1] || 'home';
    return { ...p, screen: prev, history: p.history.slice(0, -1), params: {} };
  });
  const addWater = () => setS(p => ({ ...p, water: Math.min(8, p.water + 1) }));
  const addToMeal = (mealId, items, total) => setS(p => {
    const meals = p.meals.map(m => {
      if (m.id !== mealId) return m;
      const newItems = [...m.items, ...items.map(it => ({
        id: Date.now() + Math.random(),
        q: 'food',
        name: it.name, portion: `${Math.round(parseInt(it.portion) * it.amount)}g`,
        kcal: Math.round(it.kcal * it.amount), p: Math.round(it.p * it.amount), c: Math.round(it.c * it.amount), f: Math.round(it.f * it.amount),
      }))];
      return { ...m, items: newItems, kcal: m.kcal + total.kcal };
    });
    return {
      ...p, meals,
      dailyMacros: {
        kcal: { ...p.dailyMacros.kcal, value: p.dailyMacros.kcal.value + total.kcal },
        p: { ...p.dailyMacros.p, value: p.dailyMacros.p.value + total.p },
        c: { ...p.dailyMacros.c, value: p.dailyMacros.c.value + total.c },
        f: { ...p.dailyMacros.f, value: p.dailyMacros.f.value + total.f },
      },
    };
  });
  return { ...s, nav, addWater, addToMeal, setScreen: (sc) => nav(sc) };
}

// ─── Screen router ───────────────────────────────────────────────
function ScreenRouter({ state, theme, frame }) {
  const props = { theme, state, nav: state.nav, params: state.params, frame };
  switch (state.screen) {
    case 'home': return <DashboardScreen {...props} />;
    case 'diary': return <DiaryScreen {...props} />;
    case 'addFood': return <AddFoodScreen {...props} />;
    case 'foodDetail': return <FoodDetailScreen {...props} />;
    case 'camera': return <CameraScreen {...props} />;
    case 'cameraLoading': return <CameraLoadingScreen {...props} />;
    case 'cameraResult': return <CameraResultScreen {...props} />;
    case 'voice': return <VoiceScreen {...props} />;
    case 'barcode': return <BarcodeScreen {...props} />;
    case 'recipes': return <RecipesScreen {...props} />;
    case 'recipeDetail': return <RecipeDetailScreen {...props} />;
    case 'importRecipe': return <ImportRecipeScreen {...props} />;
    case 'progress': return <ProgressScreen {...props} />;
    case 'profile': return <ProfileScreen {...props} />;
    case 'planner': return <PlannerScreen {...props} />;
    case 'shoppingList': return <ShoppingListScreen {...props} />;
    case 'chatLu': return <ChatLuScreen {...props} />;
    default: return <DashboardScreen {...props} />;
  }
}

// Screens that hide the bottom tab bar (modal-like)
const FULLSCREEN_SCREENS = new Set(['camera', 'cameraLoading', 'cameraResult', 'barcode', 'voice', 'addFood', 'foodDetail', 'importRecipe', 'recipeDetail', 'chatLu', 'shoppingList']);

// ─── App container with frame (handles tab bar) ─────────────────
function AppContainer({ state, theme, frame }) {
  const showTabBar = !FULLSCREEN_SCREENS.has(state.screen);
  // iOS status bar floats absolute; pad content so it doesn't collide.
  // Camera/barcode screens stay full-bleed (they handle their own top spacing).
  const fullBleed = ['camera', 'cameraLoading', 'cameraResult', 'barcode'].includes(state.screen);
  const topPad = fullBleed ? 0 : (frame === 'ios' ? 50 : 0);
  return (
    <div data-screen-label={state.screen} style={{
      position: 'relative', height: '100%',
      background: theme.bg, color: theme.text, fontFamily: FONT_BODY,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        flex: 1, minHeight: 0,
        overflowY: 'auto', overflowX: 'hidden',
        paddingTop: topPad,
      }}>
        <ScreenRouter state={state} theme={theme} frame={frame} />
      </div>
      {showTabBar && <TabBar
        active={
          state.screen === 'home' ? 'home' :
          state.screen === 'diary' ? 'diary' :
          state.screen === 'recipes' ? 'recipes' :
          state.screen === 'progress' ? 'progress' :
          state.screen === 'profile' ? 'profile' : null
        }
        onChange={(t) => state.nav(t)}
        onFab={() => state.nav('camera')}
        theme={theme}
        frame={frame}
      />}
    </div>
  );
}

// ─── Tweaks panel content ───────────────────────────────────────
function NLTweaks({ t, setTweak }) {
  return (
    <>
      <TweakSection label="Aparência">
        <TweakRadio label="Tema" value={t.dark ? 'dark' : 'light'} onChange={(v) => setTweak('dark', v === 'dark')}
          options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }]} />
        <TweakRadio label="Paleta" value={t.palette} onChange={(v) => setTweak('palette', v)}
          options={[{ value: 'sage', label: 'Sage' }, { value: 'vivid', label: 'Vivo' }]} />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakSelect label="Estilo dos anéis" value={t.ringStyle} onChange={(v) => setTweak('ringStyle', v)}
          options={[
            { value: 'concentric', label: 'Concêntricos (anéis)' },
            { value: 'separate', label: 'Separados (mini anéis)' },
            { value: 'bars', label: 'Barras lineares' },
          ]} />
        <TweakRadio label="Densidade" value={t.density} onChange={(v) => setTweak('density', v)}
          options={[{ value: 'airy', label: 'Arejada' }, { value: 'dense', label: 'Densa' }]} />
        <TweakToggle label="FAB pulsante" value={t.fabPulse} onChange={(v) => setTweak('fabPulse', v)} />
      </TweakSection>
      <TweakSection label="Devices">
        <TweakToggle label="Mostrar iOS" value={t.showIos} onChange={(v) => setTweak('showIos', v)} />
        <TweakToggle label="Mostrar Android" value={t.showAndroid} onChange={(v) => setTweak('showAndroid', v)} />
      </TweakSection>
    </>
  );
}

// ─── Screen jumper strip ────────────────────────────────────────
function ScreenJumper({ state, theme }) {
  const screens = [
    { id: 'home', label: 'Dashboard' },
    { id: 'diary', label: 'Diário' },
    { id: 'addFood', label: 'Adicionar' },
    { id: 'camera', label: 'Foto IA' },
    { id: 'cameraResult', label: 'Resultado IA' },
    { id: 'voice', label: 'Voz' },
    { id: 'barcode', label: 'Código' },
    { id: 'recipes', label: 'Receitas' },
    { id: 'recipeDetail', label: 'Detalhe receita' },
    { id: 'importRecipe', label: 'Importar' },
    { id: 'planner', label: 'Planejador' },
    { id: 'shoppingList', label: 'Lista de compras' },
    { id: 'progress', label: 'Progresso' },
    { id: 'chatLu', label: 'Chat Lu' },
    { id: 'profile', label: 'Perfil' },
  ];
  return (
    <div style={{
      position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 80,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
      borderRadius: 100, padding: '6px',
      display: 'flex', gap: 4, overflowX: 'auto', maxWidth: '90vw',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
    }}>
      {screens.map(sc => {
        const active = state.screen === sc.id;
        return (
          <button key={sc.id} onClick={() => state.nav(sc.id)} style={{
            padding: '7px 14px', borderRadius: 100, border: 'none',
            background: active ? '#1B1B1B' : 'transparent',
            color: active ? '#fff' : '#1B1B1B',
            fontFamily: '"Plus Jakarta Sans", system-ui', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{sc.label}</button>
        );
      })}
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const state = useAppState();
  const theme = getTheme(tweaks);

  // Sync iOS dark mode tweak with body bg
  React.useEffect(() => {
    document.body.style.background = tweaks.dark ? '#0A0B0B' : '#EFEEEA';
  }, [tweaks.dark]);

  const showBoth = tweaks.showIos && tweaks.showAndroid;
  const phoneScale = showBoth ? 0.95 : 1;

  return (
    <div style={{
      minHeight: '100vh',
      padding: '80px 20px 40px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      background: tweaks.dark ? '#0A0B0B' : '#EFEEEA',
    }}>
      <ScreenJumper state={state} theme={theme} />

      <div style={{
        display: 'flex', gap: 40, alignItems: 'flex-start',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {tweaks.showIos && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <DeviceLabel label="iOS · iPhone" theme={theme} />
            <div style={{ transform: `scale(${phoneScale})`, transformOrigin: 'top center' }}>
              <IOSDevice width={390} height={844} dark={tweaks.dark}>
                <AppContainer state={state} theme={theme} frame="ios" />
              </IOSDevice>
            </div>
          </div>
        )}

        {tweaks.showAndroid && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <DeviceLabel label="Android · Pixel" theme={theme} />
            <div style={{ transform: `scale(${phoneScale})`, transformOrigin: 'top center' }}>
              <AndroidDevice width={390} height={844} dark={tweaks.dark}>
                <AppContainer state={state} theme={theme} frame="android" />
              </AndroidDevice>
            </div>
          </div>
        )}
      </div>

      <TweaksPanel title="Tweaks">
        <NLTweaks t={tweaks} setTweak={setTweak} />
      </TweaksPanel>
    </div>
  );
}

function DeviceLabel({ label, theme }) {
  return (
    <div style={{
      padding: '6px 14px', background: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(27,27,27,0.04)',
      borderRadius: 100, fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700,
      color: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(27,27,27,0.6)',
      letterSpacing: 0.4, textTransform: 'uppercase',
    }}>{label}</div>
  );
}

window.App = App;
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
