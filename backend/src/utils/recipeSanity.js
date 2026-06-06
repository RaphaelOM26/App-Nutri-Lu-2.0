// Sanity check determinístico do campo `servings` retornado pela IA.
//
// Problema: GPT-5.4-mini ocasionalmente retorna servings=1 mesmo pra receitas
// que claramente alimentam 4+ pessoas (caso real: Fettuccine Alfredo com
// 500g de pasta + 400g de frango + 1 xícara de creme veio com servings=1
// e mostrou 3578 kcal/porção no frontend).
//
// Solução: estimar grosseiramente as calorias TOTAIS dos ingredientes a partir
// de tabela de densidade calórica por categoria + parser de quantidades. Se o
// resultado por porção declarada > 1500 kcal, recalcula servings baseado em
// 750 kcal/porção (referência de refeição principal completa).
//
// Heurística é PROPOSITALMENTE conservadora — prefere SUBESTIMAR kcal/g pra
// não falsamente inflar servings (que prejudicaria receitas legítimas de
// 1 porção como smoothie ou salada individual).

// Calorias por grama por categoria de ingrediente.
// Usar prefixos lowercase do nome do ingrediente — match por includes.
// Ordem importa: termos mais específicos primeiro.
const KCAL_PER_GRAM = [
  // Gorduras puras (muito calóricas)
  ['azeite', 9],
  ['óleo', 9],
  ['oleo', 9],
  ['manteiga', 7.2],
  ['banha', 9],
  // Carbs secos densos
  ['açúcar', 4],
  ['acucar', 4],
  ['mel', 3],
  ['farinha', 3.6],
  ['amido', 3.7],
  ['fubá', 3.6],
  ['fuba', 3.6],
  ['aveia', 3.8],
  ['pasta', 3.5], // pasta seca (espaguete, fettuccine, etc.)
  ['macarrão', 3.5],
  ['macarrao', 3.5],
  ['espaguete', 3.5],
  ['fettuccine', 3.5],
  ['penne', 3.5],
  ['talharim', 3.5],
  ['lasanha', 3.5], // massa
  ['arroz', 3.5],
  ['quinoa', 3.7],
  ['cuscuz', 3.5],
  // Leguminosas secas
  ['feijão', 3.4],
  ['feijao', 3.4],
  ['lentilha', 3.5],
  ['grão-de-bico', 3.6],
  ['grao-de-bico', 3.6],
  ['ervilha', 0.8], // cozida, não seca
  // Proteínas animais
  ['frango', 1.7],
  ['peito de frango', 1.7],
  ['carne', 2.5],
  ['picanha', 2.5],
  ['costela', 3],
  ['linguiça', 3.4],
  ['linguica', 3.4],
  ['bacon', 5],
  ['peixe', 1.5],
  ['salmão', 2.1],
  ['salmao', 2.1],
  ['atum', 1.4],
  ['camarão', 1],
  ['camarao', 1],
  ['ovo', 1.4],
  ['ovos', 1.4],
  // Laticínios
  ['queijo parmesão', 4.3],
  ['queijo parmesao', 4.3],
  ['parmesão', 4.3],
  ['parmesao', 4.3],
  ['queijo mussarela', 3],
  ['queijo', 3.5],
  ['ricota', 1.7],
  ['cream cheese', 3.4],
  ['requeijão', 2.6],
  ['requeijao', 2.6],
  ['creme de leite', 3.3],
  ['creme', 3.3],
  ['leite condensado', 3.2],
  ['leite', 0.6],
  ['iogurte', 0.6],
  // Pão e similares
  ['pão', 2.7],
  ['pao', 2.7],
  ['tapioca', 3.5],
  ['biscoito', 4],
  ['bolacha', 4],
  // Chocolate / doces
  ['chocolate', 5.5],
  ['cacau', 4],
  ['nutella', 5.4],
  ['leite em pó', 4.9],
  ['leite em po', 4.9],
  // Castanhas (muito calóricas)
  ['amêndoa', 5.8],
  ['amendoa', 5.8],
  ['castanha', 6],
  ['nozes', 6.5],
  ['amendoim', 5.7],
  ['pasta de amendoim', 5.9],
  // Vegetais/frutas (default 0.5 — leve)
  // (cai no fallback)
];

const DEFAULT_KCAL_PER_GRAM = 0.5;

// Calorias por porção de referência pra UMA refeição principal.
// Valor conservador médio entre snack (300) e refeição grande (1000).
const KCAL_PER_PORTION_TYPICAL = 750;

// Acima desse limite por porção declarada, recalculamos.
// 1500 kcal é absurdo pra UMA porção de qualquer prato razoável.
const KCAL_PER_PORTION_MAX = 1500;

// Converte quantidade + unidade pra gramas. Cópia simplificada da heurística
// do frontend (mobile/src/utils/recipeMacros.ts). Mantida em sync manual —
// se mudar uma, atualizar a outra.
function parseToGrams(quantity, unit) {
  const n = parseFloat(String(quantity || '').replace(',', '.'));
  if (!n || Number.isNaN(n)) return 0;
  const u = String(unit || '').toLowerCase().trim();
  if (u.includes('xíc') || u.includes('xic')) return n * 200;
  if (u.includes('colher de sopa') || u.includes('colheres de sopa') || u === 'colheres' || u === 'colher') return n * 15;
  if (u.includes('colher de chá') || u.includes('colher de cha') || u.includes('colheres de chá') || u.includes('colheres de cha')) return n * 5;
  if (u === 'kg' || u.includes('quilo')) return n * 1000;
  if (u === 'g' || u.includes('gram')) return n;
  if (u === 'l' || u.includes('litro')) return n * 1000;
  if (u === 'ml') return n;
  if (u.includes('dente')) return n * 5;
  if (u.includes('unidade') || u === 'un' || u === 'unid' || u === 'unid.') return n * 80;
  if (u.includes('fatia')) return n * 30;
  if (u.includes('maço')) return n * 100;
  if (u.includes('pitada')) return 1;
  // fallback: assume "1 unidade média ~80g"
  return n * 80;
}

function guessKcalPerGram(name) {
  const lower = String(name || '').toLowerCase();
  if (!lower) return DEFAULT_KCAL_PER_GRAM;
  for (const [key, val] of KCAL_PER_GRAM) {
    if (lower.includes(key)) return val;
  }
  return DEFAULT_KCAL_PER_GRAM;
}

/** Estima as kcal totais somando ingrediente por ingrediente. */
export function estimateTotalKcal(ingredients) {
  if (!Array.isArray(ingredients)) return 0;
  let total = 0;
  for (const ing of ingredients) {
    const grams = parseToGrams(ing.quantity, ing.unit);
    if (!grams) continue;
    const kcalG = guessKcalPerGram(ing.name);
    total += grams * kcalG;
  }
  return Math.round(total);
}

/**
 * Reconcilia servings: usa o valor da IA SE parece razoável, senão recalcula.
 * Retorna sempre >=1.
 *
 *  - servings=0 (IA não soube): infere pela estimativa total
 *  - servings>=1 mas kcal/porção declarada > 1500: recalcula
 *  - caso contrário: mantém o que IA disse
 */
export function reconcileServings(declaredServings, ingredients) {
  const totalKcal = estimateTotalKcal(ingredients);
  const declared = Number.isFinite(declaredServings) ? declaredServings : 0;

  // Sem dados suficientes pra estimar — confia no que a IA disse (com floor 1)
  if (totalKcal === 0) return Math.max(1, declared || 1);

  // IA não soube → infere
  if (declared <= 0) {
    return Math.max(1, Math.round(totalKcal / KCAL_PER_PORTION_TYPICAL));
  }

  // IA disse N porções, mas kcal/porção tá absurdo → recalcula
  const kcalPerPortion = totalKcal / declared;
  if (kcalPerPortion > KCAL_PER_PORTION_MAX) {
    const recalc = Math.round(totalKcal / KCAL_PER_PORTION_TYPICAL);
    // Garante que NUNCA diminua o servings que IA propôs (só aumenta)
    return Math.max(declared, recalc, 1);
  }

  // Tá ok, confia na IA
  return Math.max(1, declared);
}
