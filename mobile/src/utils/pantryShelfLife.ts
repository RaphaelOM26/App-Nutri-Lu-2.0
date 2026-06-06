// Estimativa local de validade pra itens identificados na foto da despensa.
//
// V0.1 — heurística por keyword no nome (frutas perecíveis x duráveis, proteínas
// frescas x processadas, grãos secos sem validade na despensa).
//
// V0.2 — substituir por chamada batch ao backend /shelf-life com prompt do tipo
// "pra cada alimento desta lista, retorne quantos dias dura refrigerado em média".
// Endpoint ainda não existe — task 30 documenta a feature pra implementar
// quando subir o backend de v0.2.

/** Dias estimados até vencer (ou null = não vence rápido, dispensa não-perecível). */
export function estimateShelfLifeDays(name: string): number | null {
  const n = name.toLowerCase().trim();

  // ─── Grãos secos / dispensa não-perecível (não precisa de data) ──
  const NON_PERISHABLE = [
    'arroz', 'feijão', 'feijao', 'lentilha', 'grão de bico', 'grao de bico',
    'aveia', 'farinha', 'açúcar', 'acucar', 'sal', 'massa', 'macarrão', 'macarrao',
    'biscoito', 'bolacha', 'café', 'cafe', 'cacau', 'chá', 'cha', 'fubá', 'fuba',
    'cuscuz', 'azeite', 'óleo', 'oleo', 'vinagre', 'mel',
  ];
  if (NON_PERISHABLE.some((w) => n.includes(w))) return null;

  // ─── Perecíveis curtos (3-5 dias) — verduras folhosas, carnes frescas ──
  const SHORT_LIFE = {
    days: 3,
    keywords: [
      'alface', 'rúcula', 'rucula', 'agrião', 'agriao', 'salsa', 'cebolinha',
      'manjericão', 'manjericao', 'espinafre', 'couve',
      'peixe', 'salmão', 'salmao', 'tilápia', 'tilapia', 'camarão', 'camarao',
      'frango', 'peito', 'coxa', 'sobrecoxa',
    ],
  };
  if (SHORT_LIFE.keywords.some((w) => n.includes(w))) return SHORT_LIFE.days;

  // ─── Perecíveis médios (5-7 dias) — frutas/legumes macios, leite ──
  const MEDIUM_LIFE = {
    days: 5,
    keywords: [
      'tomate', 'pepino', 'abobrinha', 'berinjela', 'pimentão', 'pimentao',
      'morango', 'amora', 'framboesa', 'mirtilo',
      'banana', 'mamão', 'mamao', 'manga', 'abacaxi',
      'leite', 'iogurte', 'creme de leite', 'requeijão', 'requeijao', 'ricota',
      'queijo fresco', 'queijo minas',
      'pão', 'pao',
    ],
  };
  if (MEDIUM_LIFE.keywords.some((w) => n.includes(w))) return MEDIUM_LIFE.days;

  // ─── Perecíveis longos (10-14 dias) — raízes, frutas firmes, queijos curados ──
  const LONG_LIFE = {
    days: 14,
    keywords: [
      'cenoura', 'beterraba', 'batata', 'inhame', 'mandioca', 'cebola', 'alho',
      'maçã', 'maca ', 'pera', 'uva', 'laranja', 'limão', 'limao', 'kiwi',
      'queijo prato', 'queijo mussarela', 'parmesão', 'parmesao',
      'manteiga', 'margarina',
      'linguiça', 'linguica', 'presunto', 'salsicha',
    ],
  };
  if (LONG_LIFE.keywords.some((w) => n.includes(w))) return LONG_LIFE.days;

  // ─── Muito longos (21+ dias) — ovos, alguns ultraprocessados ──
  if (n.includes('ovo')) return 21;

  // Default: 7 dias — placeholder seguro pra alimentos não-categorizados.
  // Quando a IA real subir, isso será substituído por estimativa precisa.
  return 7;
}

/** Formata Date.now() + N dias como ISO YYYY-MM-DD pra encaixar no campo PantryItem.expiresAt. */
export function shelfLifeToExpiresAt(days: number | null, now: number = Date.now()): string | undefined {
  if (days == null) return undefined;
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
