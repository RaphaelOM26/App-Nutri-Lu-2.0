// Confirmação da foto pela conversa (decisão do Raphael, 25/09/2026).
//
// A paciente não pesa comida, então a Luna NUNCA pergunta em gramas. Depois
// que a foto vira registro, o código decide se vale perguntar alguma coisa, e
// o quê, do mais fácil de responder pro mais específico:
//
//   1. INGREDIENTE em dúvida → dois botões ("abóbora ou batata-doce?").
//      Só quando há sinal: confiança baixa, nome hesitante ("abóbora/batata-
//      doce"), ou o plano daquela refeição tem o OUTRO lado do par.
//   2. PORÇÃO contra o PLANO → três botões (menos / igual / mais que o plano).
//      Só quando a refeição da foto difere >25% da refeição do plano naquele
//      horário. A porção do plano é conhecida, então a resposta vira número
//      sem a pessoa estimar nada.
//   Silêncio = está certo. Foto parecida com o plano registra em silêncio.
//
// A correção por TEXTO ("eram 3 colheres", "era batata-doce") mora no bot
// (ação corrigir_refeicao da conversa) e usa as mesmas funções daqui. Toda
// correção vira memória da paciente (client_profiles.data.correcoes_foto) e
// entra como "pista" nas próximas fotos dela. Nada clínico passa por aqui.

import { getPool } from '../../db.js';
import { norm } from '../dashboard.js';
import { normalizarItens, planoDaData, diaDoPlano } from '../diario.js';

// ─── Pares de ingredientes que a foto confunde ────────────────────────────
// Macros por 100 g do alimento COZIDO (TACO, arredondado). Só o que a medição
// de 25/09 mostrou confundir de verdade e muda caloria: abóbora × batata-doce
// (o caso que disparou tudo), batata × mandioca, frango × carne desfiada.
const M = (kcal, p, c, f) => ({ kcal, p, c, f });
export const PARES = [
  {
    a: { slug: 'abobora', nome: 'Abóbora', re: /\b(abobora|moranga|cabotia|cabotcha|jerimum)\b/, por100: M(48, 1.4, 10.8, 0.7) },
    b: { slug: 'batata-doce', nome: 'Batata-doce', re: /batata[ -]?doce/, por100: M(77, 0.6, 18.4, 0.1) },
  },
  {
    a: { slug: 'batata', nome: 'Batata', re: /\bbatata\b(?![ -]?doce)/, por100: M(52, 1.2, 11.9, 0) },
    b: { slug: 'mandioca', nome: 'Mandioca', re: /\b(mandioca|aipim|macaxeira)\b/, por100: M(125, 0.6, 30.1, 0.3) },
  },
  {
    a: { slug: 'frango', nome: 'Frango desfiado', re: /\bfrango\b/, por100: M(159, 32, 0, 3.2) },
    b: { slug: 'carne', nome: 'Carne desfiada', re: /\bcarne\b(?! mo[ií]da)/, por100: M(219, 32, 0, 9.7) },
  },
];

/** Lado do par a que um nome (normalizado) pertence: { par, lado: 'a'|'b' } ou null. */
export function parDoNome(nomeNorm) {
  for (const par of PARES) {
    if (par.b.re.test(nomeNorm)) return { par, lado: 'b' };
    if (par.a.re.test(nomeNorm)) return { par, lado: 'a' };
  }
  return null;
}

/** Membro do par pelo slug do botão ("abobora") ou por um nome escrito ("era batata doce"). */
export function membroDoPar(chave) {
  const k = norm(String(chave || ''));
  for (const par of PARES) for (const lado of ['a', 'b']) if (par[lado].slug === k) return par[lado];
  const achou = parDoNome(k);
  return achou ? achou.par[achou.lado] : null;
}

/** Como a Luna fala da porção: medida caseira quando existe, senão o que houver. */
export const medidaDe = (item) => String(item?.medida || item?.portion || '').trim();

// ─── Decidir o que perguntar ──────────────────────────────────────────────

const HESITANTE = /\/| ou /;
const LIMIAR_PLANO = 0.25;

/**
 * Pura (sem banco): dado o registro que acabou de nascer da foto e a refeição
 * do plano naquele horário, diz o que perguntar. No máximo UMA pergunta:
 * ingrediente vence porção (muda caloria e a resposta é mais fácil).
 *
 * @param {{ itens: object[], confidence?: string, refeicaoDoPlano?: object|null, kcal: number }} x
 * @returns {{ ingrediente: null | { idx: number, par: object, atual: 'a'|'b' }, plano: null | { direcao: 'acima'|'abaixo', meal: object } }}
 */
export function perguntasAposFoto({ itens, confidence, refeicaoDoPlano, kcal }) {
  const saida = { ingrediente: null, plano: null };
  const textoDoPlano = refeicaoDoPlano ? norm([refeicaoDoPlano.name, ...(refeicaoDoPlano.items || []).map((i) => i.name)].join(' ')) : '';
  for (let idx = 0; idx < (itens || []).length; idx++) {
    const n = norm(itens[idx].name);
    const achou = parDoNome(n);
    if (!achou) continue;
    const outro = achou.par[achou.lado === 'a' ? 'b' : 'a'];
    const sinal = confidence === 'low' || HESITANTE.test(n) || (textoDoPlano && outro.re.test(textoDoPlano) && !achou.par[achou.lado].re.test(textoDoPlano));
    if (sinal) { saida.ingrediente = { idx, par: achou.par, atual: achou.lado }; break; }
  }
  if (saida.ingrediente) return saida;
  const meta = Number(refeicaoDoPlano?.kcal) || 0;
  if (meta > 0 && Number.isFinite(kcal)) {
    const dif = (kcal - meta) / meta;
    if (Math.abs(dif) > LIMIAR_PLANO) saida.plano = { direcao: dif > 0 ? 'acima' : 'abaixo', meal: refeicaoDoPlano };
  }
  return saida;
}

/** A refeição do plano publicado pra aquela data e horário (com a troca da cliente aplicada), ou null. */
export async function refeicaoDoPlanoDe(userId, date, slot) {
  const plano = await planoDaData(userId, date);
  const dia = diaDoPlano(plano, date);
  return dia?.meals?.find((m) => m.slot === slot) || null;
}

// ─── Aplicar a resposta ───────────────────────────────────────────────────

const soma = (itens) => (itens || []).reduce((s, i) => s + (Number(i.kcal) || 0), 0);
const FRACAO = { 0.75: '¾', 1.25: '1¼' };

function itensDoPlano(meal) {
  const base = Array.isArray(meal.items) && meal.items.length
    ? meal.items
    : [{ name: meal.name, portion: '1 porção', kcal: meal.kcal, p: meal.p, c: meal.c, f: meal.f, ...(meal.code ? { code: meal.code } : {}) }];
  return base.map((i) => ({ name: i.name, portion: i.portion || '', grams: i.grams ?? null, kcal: Number(i.kcal) || 0, p: Number(i.p) || 0, c: Number(i.c) || 0, f: Number(i.f) || 0, ...(i.code ? { code: i.code } : {}), ...(i.medida ? { medida: i.medida } : {}) }));
}

function escalar(itens, fator) {
  return itens.map((i) => {
    const grams = i.grams != null ? Math.round(i.grams * fator) : null;
    const porcaoTxt = /porç/.test(i.portion || '') ? `${FRACAO[fator] || fator} porção` : grams != null ? `${grams} g` : i.portion;
    return { ...i, grams, portion: porcaoTxt, ...(i.medida ? { medida: `${fator < 1 ? 'um pouco menos de' : 'um pouco mais de'} ${i.medida}` } : {}), kcal: i.kcal * fator, p: i.p * fator, c: i.c * fator, f: i.f * fator };
  });
}

/**
 * "Menos / igual / mais que o plano" → itens finais.
 *   igual → os itens do plano (é o que a nutri prescreveu, com código de receita).
 *   mais  → a foto, se ela já dizia mais que o plano; senão o plano × 1,25.
 *   menos → a foto, se ela já dizia menos; senão o plano × 0,75.
 * Assim a estimativa da foto só fica quando concorda com o que ela respondeu.
 */
export function aplicarPlano(meal, escolha, itensFoto) {
  const base = itensDoPlano(meal);
  const meta = soma(base);
  const foto = soma(itensFoto);
  if (escolha === 'igual') return base;
  if (escolha === 'mais') return foto > meta * (1 + LIMIAR_PLANO) ? itensFoto : escalar(base, 1.25);
  if (escolha === 'menos') return foto < meta * (1 - LIMIAR_PLANO) && foto > 0 ? itensFoto : escalar(base, 0.75);
  throw new Error(`escolha inválida: ${escolha}`);
}

/** Troca o ingrediente de um item pelo membro do par, recalculando pelas gramas. Sem gramas, só renomeia. */
export function itensComTroca(itens, idx, membro) {
  return itens.map((i, k) => {
    if (k !== idx) return i;
    const g = Number(i.grams);
    if (!(g > 0)) return { ...i, name: membro.nome };
    const f = g / 100;
    return { ...i, name: membro.nome, kcal: membro.por100.kcal * f, p: membro.por100.p * f, c: membro.por100.c * f, f: membro.por100.f * f };
  });
}

/** Grava os itens novos no registro (só o dela) e devolve a linha atualizada. */
export async function atualizarRegistro(entryId, userId, itens, nota) {
  const { itens: limpos, tot } = normalizarItens(itens);
  const { rows } = await getPool().query(
    `UPDATE meal_entries SET items = $3, kcal = $4, p = $5, c = $6, f = $7,
            note = LEFT(COALESCE(note, '') || CASE WHEN $8::text IS NULL THEN '' ELSE ' · ' || $8 END, 500)
      WHERE id = $1 AND user_id = $2
      RETURNING id, date, slot, items, kcal, p, c, f`,
    [entryId, userId, JSON.stringify(limpos), tot.kcal, tot.p, tot.c, tot.f, nota || null]);
  return rows[0] || null;
}

// ─── Memória da paciente ──────────────────────────────────────────────────
// Só o que ela mesma disse sobre comida: "isso é abóbora", "arroz são 3
// colheres". Vira pista nas próximas fotos. Nunca dado clínico.

const MAX_CORRECOES = 20;

export async function guardarCorrecao(userId, { tipo, item, de, para }) {
  const registro = { tipo, item: String(item || '').slice(0, 80), de: String(de || '').slice(0, 80), para: String(para || '').slice(0, 80), em: new Date().toISOString().slice(0, 10) };
  const { rows: [r] } = await getPool().query(`SELECT data->'correcoes_foto' AS c FROM client_profiles WHERE user_id = $1`, [userId]);
  const lista = [...(Array.isArray(r?.c) ? r.c : []), registro].slice(-MAX_CORRECOES);
  await getPool().query(
    `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()`,
    [userId, JSON.stringify({ correcoes_foto: lista })]);
  return lista;
}

/** Frases curtas pra IA da foto, a partir das correções dela (a mais recente de cada item, até 5). */
export async function pistasDaPaciente(userId) {
  const { rows: [r] } = await getPool().query(`SELECT data->'correcoes_foto' AS c FROM client_profiles WHERE user_id = $1`, [userId]);
  const lista = Array.isArray(r?.c) ? r.c : [];
  const vistos = new Set();
  const pistas = [];
  for (const c of [...lista].reverse()) {
    const chave = `${c.tipo}:${norm(c.item)}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    if (c.tipo === 'nome' && c.de && c.para) pistas.push(`O que parece "${c.de}" no prato dela costuma ser ${c.para}.`);
    else if (c.tipo === 'porcao' && c.item && c.para) pistas.push(`${c.item}: ela costuma comer ${c.para}.`);
    if (pistas.length >= 5) break;
  }
  return pistas;
}
