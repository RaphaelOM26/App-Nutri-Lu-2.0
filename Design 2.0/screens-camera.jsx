// screens-camera.jsx — Foto IA Camera, Loading, Result, Voice, Barcode

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAMERA — Foto IA capture
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CameraScreen({ theme, nav, frame }) {
  const [mode, setMode] = React.useState('food'); // food | barcode | label | gallery
  const safeTop = frame === 'ios' ? 50 : 0;
  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 760, background: '#1B1B1B', overflow: 'hidden' }}>
      {/* Live preview placeholder */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=840&h=1760&fit=crop&auto=format&q=70)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.7) contrast(1.05)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(27,27,27,0.5) 0%, rgba(27,27,27,0) 30%, rgba(27,27,27,0) 60%, rgba(27,27,27,0.85) 100%)' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16 + safeTop, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 5 }}>
        <button onClick={() => nav.back()} style={{
          width: 40, height: 40, borderRadius: 20, background: 'rgba(0,0,0,0.4)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', cursor: 'pointer',
        }}>
          <Icon.close size={20} color="#fff" />
        </button>
        <div style={{
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          borderRadius: 100, padding: '8px 14px',
          fontFamily: FONT_BODY, fontSize: 12, color: '#fff', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon.sparkle size={14} color="#fff" /> 3 de ∞ hoje
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 20, background: 'rgba(0,0,0,0.4)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', cursor: 'pointer',
        }}>
          <Icon.flashOff size={20} color="#fff" />
        </button>
      </div>

      {/* Mira frame */}
      <div style={{
        position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)',
        width: 240, height: 240,
      }}>
        {['tl','tr','bl','br'].map(c => (
          <div key={c} style={{
            position: 'absolute', width: 28, height: 28,
            ...(c === 'tl' && { top: 0, left: 0, borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '12px 0 0 0' }),
            ...(c === 'tr' && { top: 0, right: 0, borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 12px 0 0' }),
            ...(c === 'bl' && { bottom: 0, left: 0, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 12px' }),
            ...(c === 'br' && { bottom: 0, right: 0, borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 12px 0' }),
          }} />
        ))}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #97AF8F, transparent)',
          animation: 'nl-scan 2.4s ease-in-out infinite',
        }} />
      </div>

      {/* Tip */}
      <div style={{
        position: 'absolute', top: '54%', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
        borderRadius: 100, padding: '8px 14px', whiteSpace: 'nowrap',
        fontFamily: FONT_BODY, fontSize: 12, color: '#fff',
      }}>
        Foto de cima funciona melhor
      </div>

      {/* Mode chips */}
      <div style={{
        position: 'absolute', bottom: 140, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 8, padding: '0 16px',
      }}>
        {[
          { id: 'food', label: 'Foto IA', icon: Icon.sparkle },
          { id: 'barcode', label: 'Código', icon: Icon.barcode },
          { id: 'label', label: 'Rótulo', icon: Icon.list },
          { id: 'gallery', label: 'Galeria', icon: Icon.gallery },
        ].map(m => {
          const IconC = m.icon;
          const isA = mode === m.id;
          return (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              background: isA ? '#fff' : 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(12px)',
              border: 'none', borderRadius: 14, padding: '10px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: 'pointer', minWidth: 64,
            }}>
              <IconC size={18} color={isA ? '#1B1B1B' : '#fff'} stroke={isA ? 2 : 1.75} />
              <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, color: isA ? '#1B1B1B' : '#fff' }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shutter */}
      <div style={{
        position: 'absolute', bottom: 50, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
      }}>
        <div style={{ width: 44 }} />
        <button onClick={() => nav('cameraLoading')} style={{
          width: 80, height: 80, borderRadius: 40,
          background: '#fff', border: '4px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: '#fff', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.08)' }} />
        </button>
        <button style={{
          width: 44, height: 44, borderRadius: 22,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Icon.gallery size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAMERA LOADING — analyzing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CameraLoadingScreen({ theme, nav }) {
  React.useEffect(() => {
    const t = setTimeout(() => nav('cameraResult'), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 760, background: '#1B1B1B', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=840&h=1760&fit=crop&auto=format&q=70)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.6) blur(3px)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,27,27,0.5)' }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
      }}>
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <svg width="100" height="100" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.15)" strokeWidth="4" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="#97AF8F" strokeWidth="4" fill="none"
              strokeDasharray="264" strokeDashoffset="180" strokeLinecap="round"
              style={{ animation: 'nl-spin 1.4s linear infinite', transformOrigin: 'center' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.sparkle size={28} color="#97AF8F" stroke={2} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>Analisando seu prato</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Identificando ingredientes e porções…</div>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAMERA RESULT — with bounding boxes + items
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CameraResultScreen({ theme, state, nav, frame }) {
  const safeTop = frame === 'ios' ? 50 : 0;
  const [items, setItems] = React.useState([
    { id: 1, name: 'Arroz integral', portion: '120g', kcal: 144, p: 3, c: 30, f: 1, conf: 'alto', amount: 1, bbox: { top: '38%', left: '15%', w: 38, h: 25 } },
    { id: 2, name: 'Peito de frango grelhado', portion: '110g', kcal: 182, p: 34, c: 0, f: 4, conf: 'alto', amount: 1, bbox: { top: '32%', left: '50%', w: 36, h: 22 } },
    { id: 3, name: 'Brócolis no vapor', portion: '80g', kcal: 28, p: 2, c: 5, f: 0, conf: 'médio', amount: 1, bbox: { top: '20%', left: '55%', w: 30, h: 18 } },
  ]);

  const adjust = (id, delta) => {
    setItems(items.map(it => {
      if (it.id !== id) return it;
      const a = Math.max(0.5, Math.min(2, it.amount + delta));
      return { ...it, amount: a };
    }));
  };

  const total = items.reduce((acc, it) => ({
    kcal: acc.kcal + Math.round(it.kcal * it.amount),
    p: acc.p + Math.round(it.p * it.amount),
    c: acc.c + Math.round(it.c * it.amount),
    f: acc.f + Math.round(it.f * it.amount),
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 130 }}>
      {/* Image with bounding boxes */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=840&h=1200&fit=crop&auto=format&q=70)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        {items.map(it => (
          <div key={it.id} style={{
            position: 'absolute',
            top: it.bbox.top, left: it.bbox.left,
            width: `${it.bbox.w}%`, height: `${it.bbox.h}%`,
            border: '2px solid #97AF8F', borderRadius: 8,
            boxShadow: '0 0 0 2px rgba(151,175,143,0.25)',
            animation: 'nl-fade-in 600ms ease-out both',
          }}>
            <div style={{
              position: 'absolute', top: -22, left: -2,
              background: '#97AF8F', color: '#fff',
              fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700,
              padding: '3px 7px', borderRadius: 6, whiteSpace: 'nowrap',
            }}>{it.id}</div>
          </div>
        ))}
        <div style={{ position: 'absolute', top: 16 + safeTop, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 5 }}>
          <button onClick={() => nav.back()} style={{
            width: 36, height: 36, borderRadius: 18, background: 'rgba(0,0,0,0.45)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <Icon.close size={18} color="#fff" />
          </button>
          <div style={{
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)',
            padding: '6px 12px', borderRadius: 100, color: '#fff',
            fontFamily: FONT_BODY, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: '#97AF8F' }} /> Confiança alta
          </div>
        </div>
      </div>

      {/* Items list */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: -0.3 }}>Encontramos {items.length} itens</h2>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: theme.primaryDeep }}>+ Adicionar</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(it => (
            <Card key={it.id} theme={theme} pad={14} radius={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 13, background: theme.primary, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 12,
                }}>{it.id}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text }}>{it.name}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                    {Math.round(parseInt(it.portion) * it.amount)}g · {Math.round(it.kcal * it.amount)} kcal
                  </div>
                </div>
                <Icon.trash size={16} color={theme.textFaint} />
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 12, background: theme.bgSubtle, padding: 4, borderRadius: 12 }}>
                {[
                  { id: -0.5, label: 'Menos' },
                  { id: 0, label: 'Igual' },
                  { id: 0.5, label: 'Mais' },
                ].map((opt, i) => {
                  const isA = (opt.id === -0.5 && it.amount < 1) || (opt.id === 0 && it.amount === 1) || (opt.id === 0.5 && it.amount > 1);
                  return (
                    <button key={opt.label} onClick={() => {
                      const target = opt.id === -0.5 ? 0.7 : opt.id === 0.5 ? 1.3 : 1;
                      setItems(items.map(x => x.id === it.id ? { ...x, amount: target } : x));
                    }} style={{
                      flex: 1, border: 'none', background: isA ? theme.bgElev : 'transparent',
                      borderRadius: 10, padding: '8px 0', cursor: 'pointer',
                      fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700,
                      color: isA ? theme.text : theme.textMuted,
                      boxShadow: isA ? '0 1px 3px rgba(27,27,27,0.06)' : 'none',
                    }}>{opt.label}</button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Total + save */}
      <div style={{
        position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 10,
        background: theme.bgElev, borderRadius: 24, padding: 14,
        boxShadow: '0 -2px 24px rgba(27,27,27,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 800, color: theme.text, letterSpacing: -0.3 }}>{total.kcal} kcal</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: theme.textMuted }}>P {total.p}g · C {total.c}g · G {total.f}g</div>
          </div>
          <Btn variant="primary" size="md" theme={theme} onClick={() => { state.addToMeal('lunch', items, total); nav('diary'); }}>Salvar no diário</Btn>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VOICE INPUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function VoiceScreen({ theme, nav }) {
  const [phase, setPhase] = React.useState('listening'); // listening | thinking | result
  const [transcript, setTranscript] = React.useState('');
  const lines = [
    'Comi um',
    'Comi um pão francês',
    'Comi um pão francês com',
    'Comi um pão francês com manteiga',
    'Comi um pão francês com manteiga e um café',
    'Comi um pão francês com manteiga e um café com leite.',
  ];
  React.useEffect(() => {
    let i = 0;
    const tick = setInterval(() => {
      setTranscript(lines[i]);
      i++;
      if (i >= lines.length) {
        clearInterval(tick);
        setTimeout(() => setPhase('thinking'), 500);
        setTimeout(() => setPhase('result'), 2000);
      }
    }, 400);
    return () => clearInterval(tick);
  }, []);

  return (
    <div style={{ minHeight: '100%', background: theme.bg, paddingBottom: 32 }}>
      <ScreenHeader
        title="Diga o que comeu"
        theme={theme}
        left={[<IconBtn key="back" icon={Icon.close} theme={theme} onClick={() => nav.back()} />]}
      />

      {phase !== 'result' && (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 70,
              background: theme.primary, opacity: 0.18,
              animation: 'nl-pulse 1.6s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 14, borderRadius: 56,
              background: theme.primarySoft, opacity: 0.8,
              animation: 'nl-pulse 1.6s ease-in-out infinite 0.2s',
            }} />
            <div style={{
              width: 80, height: 80, borderRadius: 40, background: theme.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2,
            }}>
              <Icon.mic size={32} color={theme.bg} stroke={2} />
            </div>
          </div>
          <div style={{ textAlign: 'center', minHeight: 80 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 700, color: theme.text, lineHeight: 1.35 }}>
              {transcript || 'Ouvindo…'}
            </div>
            {phase === 'thinking' && <div style={{ marginTop: 12, fontFamily: FONT_BODY, fontSize: 13, color: theme.textMuted }}>Lu está identificando os itens…</div>}
          </div>
          {/* Visualizer bars */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[12, 24, 18, 32, 22, 38, 26, 18, 30, 14].map((h, i) => (
              <div key={i} style={{
                width: 4, height: h, borderRadius: 4,
                background: theme.primary,
                animation: `nl-pulse 0.8s ease-in-out infinite ${i * 0.08}s`,
              }} />
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div style={{ padding: '0 16px' }}>
          <Card theme={theme} pad={16} radius={18} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Você disse</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 16, fontWeight: 700, color: theme.text, marginTop: 6 }}>
              "Comi um pão francês com manteiga e um café com leite."
            </div>
          </Card>
          <SectionHeader title="3 itens identificados" theme={theme} size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Pão francês', portion: '1 unidade (50g)', kcal: 135 },
              { name: 'Manteiga', portion: '1 colher (10g)', kcal: 72 },
              { name: 'Café com leite', portion: '1 xícara (180ml)', kcal: 78 },
            ].map((it, i) => (
              <Card key={i} theme={theme} pad={14} radius={16}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text }}>{it.name}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{it.portion}</div>
                  </div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: theme.text }}>{it.kcal} kcal</div>
                  <Icon.edit size={16} color={theme.textFaint} />
                </div>
              </Card>
            ))}
          </div>
          <div style={{ padding: '20px 0 0' }}>
            <Btn variant="primary" full size="lg" theme={theme} onClick={() => nav('diary')}>Adicionar ao Café da manhã</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BARCODE SCANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function BarcodeScreen({ theme, nav, frame }) {
  const safeTop = frame === 'ios' ? 50 : 0;
  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 760, background: '#0E0F0F', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=840&h=1760&fit=crop&auto=format&q=70)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.55) blur(1px)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center 38%, transparent 0%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16 + safeTop, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 5 }}>
        <button onClick={() => nav.back()} style={{
          width: 40, height: 40, borderRadius: 20, background: 'rgba(0,0,0,0.4)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <Icon.close size={20} color="#fff" />
        </button>
        <div style={{
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          padding: '8px 14px', borderRadius: 100,
          fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 700, color: '#fff',
        }}>Código de barras</div>
        <button style={{
          width: 40, height: 40, borderRadius: 20, background: 'rgba(0,0,0,0.4)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <Icon.flash size={20} color="#fff" />
        </button>
      </div>

      {/* Scan zone */}
      <div style={{
        position: 'absolute', top: '32%', left: '50%', transform: 'translateX(-50%)',
        width: 260, height: 140, borderRadius: 16,
      }}>
        {['tl','tr','bl','br'].map(c => (
          <div key={c} style={{
            position: 'absolute', width: 28, height: 28,
            ...(c === 'tl' && { top: 0, left: 0, borderTop: '3px solid #97AF8F', borderLeft: '3px solid #97AF8F', borderRadius: '12px 0 0 0' }),
            ...(c === 'tr' && { top: 0, right: 0, borderTop: '3px solid #97AF8F', borderRight: '3px solid #97AF8F', borderRadius: '0 12px 0 0' }),
            ...(c === 'bl' && { bottom: 0, left: 0, borderBottom: '3px solid #97AF8F', borderLeft: '3px solid #97AF8F', borderRadius: '0 0 0 12px' }),
            ...(c === 'br' && { bottom: 0, right: 0, borderBottom: '3px solid #97AF8F', borderRight: '3px solid #97AF8F', borderRadius: '0 0 12px 0' }),
          }} />
        ))}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 16,
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #EACBD1, transparent)',
            animation: 'nl-scan 1.8s ease-in-out infinite', boxShadow: '0 0 12px #EACBD1',
          }} />
        </div>
      </div>

      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, textAlign: 'center', marginTop: 30,
        fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(255,255,255,0.85)', padding: '0 32px', lineHeight: 1.5,
      }}>
        Centralize o código de barras<br />dentro da moldura
      </div>

      {/* Manual entry */}
      <div style={{ position: 'absolute', bottom: 50, left: 16, right: 16, display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => nav('foodDetail')} style={{
          background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 100,
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          fontFamily: FONT_HEAD, fontSize: 14, fontWeight: 700, color: '#1B1B1B',
        }}>
          <Icon.edit size={16} /> Digitar manualmente
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CameraScreen, CameraLoadingScreen, CameraResultScreen, VoiceScreen, BarcodeScreen });
