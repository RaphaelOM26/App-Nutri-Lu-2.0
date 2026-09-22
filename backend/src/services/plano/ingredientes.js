// Do ingrediente COMO O LIVRO ESCREVE ("Frango cozido e desfiado", "Arroz
// integral cozido", "Cacau 100%") pro item COMO SE COMPRA ("Peito de frango",
// "Arroz integral" em peso cru, "Cacau em pó"), com seção do mercado e a
// unidade de compra (~5 un, 2 bandejas, 7 potes).
//
// Tudo por DICIONÁRIO, nunca por IA (regra do projeto): o mesmo nome dá sempre
// o mesmo resultado, e alergia continua casando por texto. Os pesos médios por
// unidade vêm da tabela de medidas caseiras (IBGE/TACO), arredondados; o "~"
// avisa que é média. Decisões do Raphael em 22/09/2026 (A–F em
// docs/whatsapp-bot.md, seção "Lista de compras").
//
// O livro PR tem 456 nomes distintos de ingrediente; este arquivo cobre o que
// aparece e cai num padrão. Nome fora do dicionário passa pelo tratamento
// genérico (tira preparo, arruma caixa) e vai pra Mercearia em gramas — nunca
// some da lista.

import { normalizar } from './receitas.js';

// ─── Limpeza do nome ──────────────────────────────────────────────────────

const PREFIXO_MEDIDA = /^[\d½¼¾.,/ ]+(x[íi]cara|colher|colheres|unidade|unidades|fatia|fatias|pote|potes|copo|copos)?(\s*\([^)]*\))?\s*(de\s+)?/i;
/** Não vai pro carrinho. */
export const IGNORAR = /^(agua|gelo|sal|refeicao livre|prato livre|a gosto)(\s|$)/;
/** "cozido", "hidratado", "pronto" no nome = o livro pesou PRONTO; a compra é em cru. */
const INDICA_PRONTO = /\b(cozid[oa]s?|hidratad[oa]s?|pront[oa]s?)\b/;
// Palavras de preparo que saem do nome. "em pó" e "em lata" NÃO saem: são
// produtos diferentes (leite em pó, atum em lata) — tratados nos sinônimos.
const PREPARO = /\b(grelhad[oa]s?|assad[oa]s?|cozid[oa]s?|refogad[oa]s?|ralad[oa]s?|desfiad[oa]s?|drenad[oa]s?|hidratad[oa]s?|pront[oa]s?|firme|fresc[oa]s?|picad[oa]s?|fatiad[oa]s?|moid[oa]s?|cortad[oa]s?|batid[oa]s?|amassad[oa]s?|descascad[oa]s?|light|sem sal|sem pele|sem osso|sem vagem|sem casca|sem acucar|100%|em tiras|em cubos|em flocos|em rodelas|em pedacos|em fatias|inteir[oa]s?|maduro|madura|e)\b/g;

/**
 * Sinônimos e produtos: [regex sobre o nome normalizado, nome de compra].
 * Ordem importa (o primeiro que casa vence). Só entra aqui o que o tratamento
 * genérico erraria.
 */
const SINONIMOS = [
  [/leite em po/, 'Leite em pó desnatado'],
  [/leite de coco/, 'Leite de coco'],
  [/^leite\b/, 'Leite semidesnatado'],
  [/^ovos?\b/, 'Ovos'],
  [/^claras?\b/, 'Claras de ovo'],
  [/iogurte (natural )?proteico|iogurte grego proteico/, 'Iogurte proteico'],
  [/iogurte natural|iogurte integral/, 'Iogurte natural'],
  [/^iogurte\b/, 'Iogurte natural'],
  [/^ricota\b/, 'Ricota'],
  [/^cottage\b|queijo cottage/, 'Cottage'],
  [/mucarela|mussarela/, 'Muçarela'],
  [/queijo minas/, 'Queijo minas'],
  [/queijo (tipo )?feta/, 'Queijo feta'],
  [/^requeijao/, 'Requeijão light'],
  [/^coalhada/, 'Coalhada'],
  [/farelo de aveia/, 'Farelo de aveia'],
  [/^aveia\b/, 'Aveia em flocos'],
  [/^cacau\b|chocolate em po/, 'Cacau em pó'],
  [/^chia\b|semente de chia|sementes de chia/, 'Chia'],
  [/^linhaca/, 'Linhaça'],
  [/pasta de amendoim/, 'Pasta de amendoim'],
  [/^amendoim/, 'Amendoim'],
  [/^amendoas?\b/, 'Amêndoas'],
  [/^nozes|^noz\b/, 'Nozes'],
  [/^avelas?\b/, 'Avelãs'],
  [/^castanhas?[- ]de[- ]caju/, 'Castanha de caju'],
  [/^castanhas?([- ]do[- ]para)?\b/, 'Castanha-do-pará'],
  [/^pistache/, 'Pistache'],
  [/^mel\b/, 'Mel'],
  [/^azeite/, 'Azeite'],
  [/oleo de gergelim/, 'Óleo de gergelim'],
  [/^shoyu|molho de soja/, 'Shoyu light'],
  [/^canela/, 'Canela em pó'],
  [/^oregano/, 'Orégano'],
  [/^paprica/, 'Páprica'],
  [/^curry/, 'Curry'],
  [/^cominho/, 'Cominho'],
  [/^acafrao|curcuma/, 'Cúrcuma'],
  [/^ervas? (finas|secas)?|^tempero/, 'Ervas secas'],
  [/limao e (ervas|paprica|pimenta)|^limao\b|suco de limao|raspas de limao/, 'Limão'],
  [/suco e raspas de laranja|raspas de laranja|^laranja\b/, 'Laranja'],
  [/sementes de roma|^roma\b/, 'Romã'],
  [/^alho\b|dente de alho|dentes de alho/, 'Alho'],
  [/^cebola\b/, 'Cebola'],
  [/cebolinha/, 'Cebolinha'],
  [/^salsa\b|salsinha/, 'Salsinha'],
  [/^coentro/, 'Coentro'],
  [/^hortela/, 'Hortelã'],
  [/^gengibre/, 'Gengibre'],
  [/tomate cereja|tomate-cereja|tomatinho/, 'Tomate-cereja'],
  [/molho de tomate|passata|polpa de tomate/, 'Molho de tomate'],
  [/^tomate\b/, 'Tomate'],
  [/folhas verdes|mix de folhas|^alface|^folhas\b/, 'Folhas verdes'],
  [/^rucula/, 'Rúcula'],
  [/^espinafre/, 'Espinafre'],
  [/^couve\b(?!-?flor)/, 'Couve'],
  [/couve-?flor/, 'Couve-flor'],
  [/^brocolis/, 'Brócolis'],
  [/^repolho/, 'Repolho'],
  [/^abobrinha/, 'Abobrinha'],
  [/^abobora/, 'Abóbora'],
  [/^berinjela/, 'Berinjela'],
  [/^cenoura/, 'Cenoura'],
  [/^beterraba/, 'Beterraba'],
  [/^pepino/, 'Pepino'],
  [/^pimentao/, 'Pimentão'],
  [/cogumelo|champignon|shimeji|shitake/, 'Cogumelos'],
  [/batata doce|batata-doce/, 'Batata-doce'],
  [/^batata\b/, 'Batata'],
  [/^mandioca|^aipim|^macaxeira/, 'Mandioca'],
  [/^inhame/, 'Inhame'],
  [/^banana/, 'Banana'],
  [/^maca\b/, 'Maçã'],
  [/^pera\b/, 'Pera'],
  [/^mamao/, 'Mamão papaia'],
  [/^melao/, 'Melão'],
  [/^melancia/, 'Melancia'],
  [/^abacaxi/, 'Abacaxi'],
  [/^manga\b/, 'Manga'],
  [/^morango/, 'Morangos'],
  [/^uva/, 'Uva'],
  [/^kiwi/, 'Kiwi'],
  [/^pessego/, 'Pêssego'],
  [/^figo/, 'Figo'],
  [/^abacate/, 'Abacate'],
  [/frutas vermelhas|^mirtilo|^framboesa|^amora/, 'Frutas vermelhas (congeladas)'],
  [/fruta da estacao|^fruta\b/, 'Fruta da estação'],
  [/^ervilha/, 'Ervilha (congelada)'],
  [/^edamame/, 'Edamame (congelado)'],
  [/^milho\b/, 'Milho'],
  [/^atum/, 'Atum em lata'],
  [/^sardinha/, 'Sardinha em lata'],
  [/^salmao/, 'Salmão'],
  [/peixe branco|^tilapia|^merluza|^pescada|^linguado/, 'Peixe branco (tilápia)'],
  [/^camarao/, 'Camarão'],
  [/peito de frango|frango|sobrecoxa|coxa de frango/, 'Peito de frango'],
  [/peito de peru|^peru\b/, 'Peito de peru'],
  [/almondegas? de patinho|patinho moido|carne moida/, 'Patinho moído'],
  [/^patinho|^musculo|^acem|carne magra|^carne\b|^alcatra|^coxao/, 'Carne magra (patinho)'],
  [/^lombo/, 'Lombo suíno'],
  [/file mignon/, 'Filé mignon'],
  [/^presunto|blanquet/, 'Peito de peru fatiado'],
  [/arroz integral/, 'Arroz integral'],
  [/^arroz\b/, 'Arroz'],
  [/feijao preto/, 'Feijão preto'],
  [/^feijao/, 'Feijão carioca'],
  [/^lentilha/, 'Lentilha'],
  [/grao de bico|grao-de-bico/, 'Grão-de-bico'],
  [/^quinoa/, 'Quinoa'],
  [/cuscuz marroquino/, 'Cuscuz marroquino'],
  [/^cuscuz/, 'Cuscuz de milho (flocão)'],
  [/^polenta|^fuba/, 'Polenta (fubá)'],
  [/^espaguete|^macarrao|^penne|^fusilli|^parafuso|^massa\b|^talharim/, 'Macarrão integral'],
  [/goma de tapioca|^tapioca/, 'Goma de tapioca'],
  [/pao integral|pao de forma/, 'Pão integral'],
  [/pao frances/, 'Pão francês'],
  [/^torrada/, 'Torradas integrais'],
  [/^wrap|rap10|rap 10/, 'Wrap integral'],
  [/^granola/, 'Granola'],
  [/^whey/, 'Whey protein'],
];

/**
 * @param {string} bruto nome como está na receita
 * @returns {{ nome: string, pronto: boolean, ignorar: boolean }}
 */
export function canonico(bruto) {
  const limpo = String(bruto || '').replace(PREFIXO_MEDIDA, '').trim() || String(bruto || '');
  const n = normalizar(limpo);
  if (!n || IGNORAR.test(n)) return { nome: limpo, pronto: false, ignorar: true };
  const pronto = INDICA_PRONTO.test(n);
  for (const [re, nome] of SINONIMOS) if (re.test(n)) return { nome, pronto, ignorar: false };
  // Genérico: tira preparo, junta espaços, capitaliza.
  const semPreparo = n.replace(PREPARO, ' ').replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
  const base = semPreparo || n;
  // Recupera acentos/caixa do original quando o genérico não mexeu em nada.
  const nome = base === n ? limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase() : base.charAt(0).toUpperCase() + base.slice(1);
  return { nome, pronto, ignorar: false };
}

// ─── Peso pronto → cru ────────────────────────────────────────────────────

/** Fator cru/pronto dos grãos (o livro pesa cozido; a compra é crua). */
const FATOR_CRU = {
  'Arroz': 0.4, 'Arroz integral': 0.4, 'Feijão carioca': 0.4, 'Feijão preto': 0.4, 'Lentilha': 0.4,
  'Grão-de-bico': 0.45, 'Macarrão integral': 0.45, 'Cuscuz marroquino': 0.65, 'Cuscuz de milho (flocão)': 0.6,
  'Polenta (fubá)': 0.25, 'Quinoa': 0.35, 'Goma de tapioca': 1,
};
/** Gramas a comprar a partir do que a receita pesou. */
export function gramasCruas(nome, gramas, pronto) {
  const f = FATOR_CRU[nome];
  return pronto && f ? Math.round(gramas * f) : gramas;
}
export const emPesoCru = (nome) => nome in FATOR_CRU && FATOR_CRU[nome] !== 1;

// ─── Seções do mercado ────────────────────────────────────────────────────

export const SECOES = [
  { id: 'hortifruti', titulo: 'Hortifruti', emoji: '🥬' },
  { id: 'acougue', titulo: 'Açougue e peixaria', emoji: '🍗' },
  { id: 'laticinios', titulo: 'Ovos e laticínios', emoji: '🥚' },
  { id: 'mercearia', titulo: 'Mercearia', emoji: '🛒' },
  { id: 'despensa', titulo: 'Despensa · confere se tem', emoji: '🧂' },
  { id: 'outros', titulo: 'Também no plano', emoji: '🍽️' },
];

// Ordem importa: o específico antes do genérico ("leite de coco" é despensa,
// "molho de tomate" é mercearia, "atum em lata" é mercearia).
const REGRAS_SECAO = [
  ['despensa', /azeite|oleo|vinagre|shoyu|^mel$|canela|cacau|oregano|paprica|curry|cominho|curcuma|\bpimenta\b|ervas|^alho$|gengibre|adocante|acucar|essencia|fermento|amido|chia|linhaca|gergelim|castanha|amendoa|\bnoz|avela|pistache|amendoim|whey|^cafe|^cha\b|leite de coco|mostarda|ketchup|tempero|caldo|granola/],
  ['mercearia', /em lata|molho de tomate|^pao|torrada|wrap|tapioca|aveia|farinha|farelo|arroz|feijao|lentilha|grao-de-bico|macarrao|cuscuz|polenta|quinoa|^milho|biscoito|cereal|congelad|conserva|azeitona|palmito|leite em po|requeijao/],
  ['acougue', /frango|peru|carne|patinho|lombo|file|salmao|peixe|camarao|bife|costela|linguica|sardinha|atum/],
  ['laticinios', /^ovos|claras|iogurte|leite|cottage|mucarela|queijo|ricota|manteiga|creme de leite|kefir|coalhada/],
  ['hortifruti', /tomate|cenoura|abobrinha|abobora|pepino|folhas|rucula|espinafre|couve|brocolis|cebola|cebolinha|salsinha|coentro|hortela|limao|laranja|banana|maca|pera|morango|mamao|melao|melancia|abacaxi|manga|uva|kiwi|pessego|figo|abacate|roma|fruta|pimentao|cogumelo|beterraba|batata|mandioca|inhame|berinjela|repolho|chuchu|vagem|quiabo|jilo|acelga|agriao|aipo|salsao|nabo|rabanete|ervilha|edamame|alho-poro|aspargo|palmito|tangerina|goiaba|ameixa|caqui|acai|coco/],
];
export function secaoDe(nome) {
  const n = normalizar(nome);
  for (const [id, re] of REGRAS_SECAO) if (re.test(n)) return id;
  return 'mercearia';
}

// ─── Unidade de compra ────────────────────────────────────────────────────
// peso = gramas (ou ml) por unidade · rotulo/plural · aprox = média (mostra "~")
// fracao = item grande que se compra inteiro (¼, ½, ¾, 1…)
// arredonda: 'cima' pra embalagem (não dá pra comprar meia lata); 'perto' pra fruta/legume
// apoio = a unidade é só ajuda; o principal continua em gramas (carnes)

const U = (peso, rotulo, plural, o = {}) => ({ peso, rotulo, plural, aprox: true, arredonda: 'perto', ...o });
const PACOTE = (peso, rotulo = 'pacote', plural = 'pacotes') => U(peso, rotulo, plural, { aprox: false, arredonda: 'cima' });
export const UNIDADES = {
  // hortifruti
  'Tomate': U(110, 'un', 'un'), 'Tomate-cereja': PACOTE(300, 'bandeja', 'bandejas'),
  'Abobrinha': U(200, 'un', 'un'), 'Cenoura': U(70, 'un', 'un'), 'Cebola': U(100, 'un', 'un'),
  'Pepino': U(120, 'un', 'un'), 'Pimentão': U(120, 'un', 'un'), 'Berinjela': U(250, 'un', 'un'),
  'Beterraba': U(120, 'un', 'un'), 'Batata': U(150, 'un', 'un'), 'Batata-doce': U(200, 'un', 'un'),
  'Chuchu': U(200, 'un', 'un'), 'Repolho': U(1000, 'un', 'un', { fracao: true }), 'Couve-flor': U(600, 'un', 'un', { fracao: true }),
  'Abóbora': U(1200, 'un', 'un', { fracao: true }), 'Brócolis': U(300, 'maço', 'maços', { fracao: true }),
  'Espinafre': U(100, 'maço', 'maços', { arredonda: 'cima' }), 'Folhas verdes': U(100, 'maço', 'maços', { arredonda: 'cima' }),
  'Rúcula': U(80, 'maço', 'maços', { arredonda: 'cima' }), 'Couve': U(150, 'maço', 'maços', { arredonda: 'cima' }),
  'Hortelã': U(30, 'maço', 'maços', { arredonda: 'cima' }), 'Salsinha': U(30, 'maço', 'maços', { arredonda: 'cima' }),
  'Cebolinha': U(30, 'maço', 'maços', { arredonda: 'cima' }), 'Coentro': U(30, 'maço', 'maços', { arredonda: 'cima' }),
  'Cogumelos': PACOTE(200, 'bandeja', 'bandejas'), 'Morangos': PACOTE(250, 'bandeja', 'bandejas'),
  'Uva': U(500, 'cacho', 'cachos'), 'Banana': U(90, 'un', 'un'), 'Maçã': U(130, 'un', 'un'), 'Pera': U(150, 'un', 'un'),
  'Pêssego': U(130, 'un', 'un'), 'Laranja': U(150, 'un', 'un'), 'Limão': U(60, 'un', 'un'), 'Kiwi': U(80, 'un', 'un'),
  'Manga': U(300, 'un', 'un'), 'Abacate': U(250, 'un', 'un'), 'Figo': U(60, 'un', 'un'), 'Romã': U(250, 'un', 'un'),
  'Mamão papaia': U(400, 'un', 'un'), 'Melão': U(1500, 'un', 'un', { fracao: true }), 'Melancia': U(200, 'fatia', 'fatias'),
  'Abacaxi': U(1200, 'un', 'un', { fracao: true }), 'Fruta da estação': U(120, 'un', 'un'),
  // ovos e laticínios
  'Ovos': U(50, 'un', 'un', { aprox: false, arredonda: 'cima' }), 'Claras de ovo': U(30, 'clara', 'claras', { arredonda: 'cima' }),
  'Iogurte proteico': PACOTE(150, 'pote', 'potes'), 'Iogurte natural': PACOTE(170, 'pote', 'potes'),
  'Leite semidesnatado': PACOTE(1000, 'caixa', 'caixas'), 'Coalhada': PACOTE(400, 'pote', 'potes'), 'Cottage': PACOTE(200, 'pote', 'potes'),
  'Ricota': U(250, 'peça', 'peças', { fracao: true }), 'Queijo minas': U(250, 'peça', 'peças', { fracao: true }),
  'Muçarela': U(15, 'fatia', 'fatias', { arredonda: 'cima' }), 'Requeijão light': PACOTE(200, 'pote', 'potes'),
  // mercearia
  'Pão integral': U(25, 'fatia', 'fatias', { aprox: false, arredonda: 'cima' }), 'Pão francês': U(50, 'un', 'un', { aprox: false, arredonda: 'cima' }),
  'Atum em lata': PACOTE(120, 'lata', 'latas'), 'Sardinha em lata': PACOTE(125, 'lata', 'latas'),
  'Molho de tomate': PACOTE(340, 'sachê', 'sachês'), 'Ervilha (congelada)': PACOTE(300), 'Edamame (congelado)': PACOTE(200),
  'Frutas vermelhas (congeladas)': PACOTE(200), 'Wrap integral': U(40, 'un', 'un', { aprox: false, arredonda: 'cima' }),
  'Torradas integrais': PACOTE(140), 'Cuscuz marroquino': PACOTE(500), 'Macarrão integral': PACOTE(500),
  'Polenta (fubá)': PACOTE(500), 'Goma de tapioca': PACOTE(500), 'Quinoa': PACOTE(250), 'Granola': PACOTE(250),
  // carnes: peso na frente, unidade só como apoio
  'Peito de frango': U(200, 'filé', 'filés', { apoio: true }), 'Peixe branco (tilápia)': U(130, 'filé', 'filés', { apoio: true }),
  'Salmão': U(150, 'posta', 'postas', { apoio: true }),
};

const fmtG = (g) => (g >= 1000 ? `${(g / 1000).toFixed(g % 1000 ? 1 : 0).replace('.', ',')} kg` : `${Math.round(g)} g`);
const fmtMl = (ml) => (ml >= 1000 ? `${(ml / 1000).toFixed(ml % 1000 ? 1 : 0).replace('.', ',')} L` : `${Math.round(ml)} ml`);
const fracaoTexto = (x) => {
  const q = Math.max(1, Math.round(x * 4)); // em quartos
  if (q >= 8) return `${Math.ceil(q / 4)}`;
  return { 1: '¼', 2: '½', 3: '¾', 4: '1', 5: '1¼', 6: '1½', 7: '1¾' }[q];
};

/**
 * Como a linha aparece: principal (o que se compra) e secundário (o que as
 * receitas usam). Ex.: { principal: '~5 un', secundario: '560 g' }.
 * @param {{ nome: string, g: number, ml: number, vezes: number, pesoCru?: boolean }} item
 */
export function unidadeDe(item) {
  const u = UNIDADES[item.nome];
  const peso = item.g || item.ml;
  const pesoTxt = item.g ? fmtG(item.g) : item.ml ? fmtMl(item.ml) : '';
  const cruTxt = pesoTxt && item.pesoCru ? `${pesoTxt} cru` : pesoTxt;
  if (!peso) {
    // Sem peso na receita ("suco de limão", "hortelã"): maço é sempre um;
    // fruta/legume, um por uso.
    if (u && /maço/.test(u.rotulo)) return { principal: `1 ${u.rotulo}`, secundario: '' };
    if (u) return { principal: `~${item.vezes} ${item.vezes > 1 ? u.plural : u.rotulo}`, secundario: '' };
    return { principal: item.vezes > 1 ? `${item.vezes}×` : '', secundario: '' };
  }
  if (!u) return { principal: cruTxt, secundario: '' };
  let n;
  if (u.fracao) n = fracaoTexto(peso / u.peso);
  else { const x = peso / u.peso; n = String(u.arredonda === 'cima' ? Math.ceil(x) : Math.max(1, Math.round(x))); }
  const rotulo = n === '1' || n === '¼' || n === '½' || n === '¾' ? u.rotulo : u.plural;
  const unTxt = `${u.aprox && !u.fracao ? '~' : ''}${n} ${rotulo}`;
  if (u.apoio) return { principal: cruTxt, secundario: unTxt };
  const cada = u.arredonda === 'cima' && !u.fracao && u.peso >= 100 && Number(n) > 1 ? ` · ${fmtG(u.peso)} cada` : '';
  return { principal: unTxt, secundario: cada ? `${cruTxt}${cada}` : cruTxt };
}
