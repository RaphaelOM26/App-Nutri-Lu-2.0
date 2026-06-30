// Sistema de design "Dark Luxe" — exclusivo da área PAGA (plano alimentar).
// É um conjunto de tokens SEPARADO do tema light/dark do resto do app: mantém
// só a cor base sage, mas veste a área premium de verde-carvão + ouro.
// Tipografia continua Plus Jakarta Sans (FONT do tema), sem serifa.
//
// Aprovado por mockup em 2026-06-30 (direção "Dark Luxe sem serifa").

export const PREMIUM = {
  // Superfícies (3 camadas tonais, planas — profundidade sem sombra/brilho)
  bg: '#12201A',
  card: '#1B2922',
  cardRaised: '#22332B',

  // Ouro — só como traço/moldura/selo, nunca em bloco grande
  gold: '#D6C28A',
  goldDeep: '#B89A4E',
  onGold: '#2A2410', // texto sobre ouro

  // Texto
  cream: '#ECEFE6',
  creamSoft: '#C9D3C2',
  sage: '#9DB596',
  sageFaint: '#4A5A50',

  // Fios e bordas
  hair: 'rgba(214,194,138,0.16)', // fio dourado discreto
  hairFaint: 'rgba(255,255,255,0.08)',
  goldBorder: 'rgba(214,194,138,0.45)',

  // Macros (mesmas cores oficiais do app)
  protein: '#E5A6B0',
  carbs: '#A8BFE0',
  fats: '#D6C28A',
} as const;
