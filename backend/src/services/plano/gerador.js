// Rascunho de plano por CÓDIGO (sem IA), no servidor. É a tradução fiel de
// web/src/lib/gerarPlano.ts (18/09/2026): mesmas fatias por refeição, mesma
// pontuação, mesmas três regras de comida brasileira (prioridade por
// refeição, "não abro mão" por dicionário, almoço e jantar no mesmo pool) e o
// MESMO filtro duro de restrição e alergia (`permitida`). Determinístico pra
// mesma semente. Se mudar uma regra aqui, mudar lá também.
//
// Quem chama: services/lote/gerar.js (aprovação em lote). A Luciana continua
// gerando no navegador quando quer; os dois caminhos dão o mesmo resultado
// pra mesma entrada.

import { PRATICAS, textoDa, receitaComoItem, normalizar } from './receitas.js';

export const SLOTS = ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'];
export const SLOT_HORA = { cafe: '07:00', lanche_manha: '10:00', almoco: '12:30', lanche_tarde: '16:00', jantar: '19:30', ceia: '21:30' };
export const SLOTS_PADRAO = ['cafe', 'almoco', 'lanche_tarde', 'jantar'];

const FATIA = { cafe: 0.22, lanche_manha: 0.08, almoco: 0.28, lanche_tarde: 0.12, jantar: 0.25, ceia: 0.05 };
const principal = (r) => (r.meals.includes('lunch') || r.meals.includes('dinner')) && r.tipo !== 'bebida';
const CATEGORIA = {
  cafe: (r) => r.meals.includes('breakfast'),
  lanche_manha: (r) => r.meals.includes('snack') || r.tipo === 'bebida',
  almoco: principal,
  lanche_tarde: (r) => r.meals.includes('snack'),
  jantar: principal,
  ceia: (r) => (r.meals.includes('snack') || r.tipo === 'bebida' || r.tipo === 'mingau') && r.macros.kcal <= 280,
};
const TAG_DA_RESTRICAO = { 'sem-gluten': ['Sem glúten'], 'sem-lactose': ['Sem lactose'], vegetariana: ['Vegetariana', 'Vegana'], vegana: ['Vegana'] };
export const RESTRICOES_CONHECIDAS = Object.keys(TAG_DA_RESTRICAO);
const PORCOES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function prng(semente) {
  let s = (semente >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

// ─── 1. Prioridade brasileira por refeição ────────────────────────────────
const FRUTAS = ['fruta', 'banana', 'maca', 'mamao', 'morango', 'manga', 'uva', 'abacaxi', 'melancia', 'laranja', 'pera', 'kiwi', 'melao', 'goiaba', 'ameixa', 'pessego', 'tangerina', 'mexerica', 'caqui', 'abacate'];
const GRUPOS_LEVES = [['iogurte'], FRUTAS, ['tapioca'], ['crepioca'], ['pao ', 'pao,', 'paes'], ['ovo']];
const GRUPOS_PRINCIPAIS = [
  ['arroz'], ['feijao'],
  ['carne', 'patinho', 'acem', 'musculo', 'alcatra', 'coxao', 'bife', 'lombo'],
  ['frango'],
  ['macarrao', 'espaguete', 'penne', 'parafuso', 'talharim', 'fusilli', 'lasanha'],
  ['sopa', 'caldo', 'canja'],
  ['legume', 'abobrinha', 'cenoura', 'brocolis', 'chuchu', 'abobora', 'couve', 'vagem', 'berinjela', 'beterraba', 'quiabo', 'repolho'],
  ['polenta'],
];
const PRIORIDADE = { cafe: GRUPOS_LEVES, lanche_manha: GRUPOS_LEVES, lanche_tarde: GRUPOS_LEVES, ceia: GRUPOS_LEVES, almoco: GRUPOS_PRINCIPAIS, jantar: GRUPOS_PRINCIPAIS };
const CARNE_VERMELHA = ['carne', 'patinho', 'acem', 'musculo', 'alcatra', 'coxao', 'bife'];
const LEVES = ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'];

function ajustePrioridade(r, slot) {
  const t = textoDa(r);
  let a = -0.15 * Math.min(3, PRIORIDADE[slot].filter((g) => g.some((x) => t.includes(x))).length);
  if (LEVES.includes(slot) && CARNE_VERMELHA.some((x) => t.includes(x)) && !t.includes('frango')) a += 0.25;
  if (slot === 'almoco' && !r.meals.includes('lunch')) a += 0.12;
  if (slot === 'jantar' && !r.meals.includes('dinner')) a += 0.12;
  return a;
}

// ─── 2. "Não abro mão": texto livre → pedidos ─────────────────────────────
const PISTAS_SLOT = [
  [/lanche da manha/g, ['lanche_manha']],
  [/lanche da tarde|\ba tarde\b|de tarde|\blanche\b|\blanches\b/g, ['lanche_tarde']],
  [/cafe da manha|de manha|pela manha|ao acordar|\bmanha\b|no cafe\b/g, ['cafe']],
  [/\balmoco\b|\balmocar\b/g, ['almoco']],
  [/\bjantar\b|\bjanta\b|a noite|de noite|\bnoite\b/g, ['jantar']],
  [/\bceia\b|antes de dormir/g, ['ceia']],
];
const SEPARADOR_PEDIDO = / e (?=(o|a|os|as|um|uma|no|na|nos|nas|de|do|da|ao|pelo|pela) )/;
const PISTAS_DIA = [
  [/fim de semana|final de semana|fins de semana|\bfds\b/g, [6, 7]],
  [/\bsegunda(-feira)?\b/g, [1]], [/\bterca(-feira)?\b/g, [2]], [/\bquarta(-feira)?\b/g, [3]], [/\bquinta(-feira)?\b/g, [4]], [/\bsexta(-feira)?\b/g, [5]], [/\bsabado\b/g, [6]], [/\bdomingo\b/g, [7]],
];
const PALAVRAS_VAZIAS = new Set(['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'um', 'uma', 'uns', 'umas', 'o', 'a', 'os', 'as', 'e', 'ou', 'com', 'sem', 'pelo', 'pela', 'para', 'pra', 'pro', 'ao', 'aos',
  'meu', 'minha', 'meus', 'minhas', 'todo', 'toda', 'todos', 'todas', 'dia', 'dias', 'sempre', 'menos', 'mais', 'depois', 'antes', 'quero', 'gosto', 'adoro', 'amo', 'preciso', 'comer', 'como', 'nao', 'abro', 'mao',
  'restricao', 'restricoes', 'pedacinho', 'pedaco', 'pouco', 'pouquinho', 'familia', 'amigos', 'amigas', 'treino', 'trabalho', 'fim', 'final', 'semana', 'vez', 'vezes', 'so', 'apenas', 'que', 'quando', 'tenho', 'ter', 'manter', 'mantenho', 'indispensavel', 'algo', 'alguma', 'coisa', 'algum', 'ser', 'sim', 'la', 'aqui', 'esse', 'essa', 'isso', 'minimo', 'ate', 'bem', 'muito', 'muita']);

const aparar = (s) => {
  const w = s.split(/\s+/).filter(Boolean);
  while (w.length && PALAVRAS_VAZIAS.has(w[0])) w.shift();
  while (w.length && PALAVRAS_VAZIAS.has(w[w.length - 1])) w.pop();
  return w.join(' ');
};

export function pedidosDe(texto) {
  const out = [];
  const brutos = (texto || '').split(/[,;\n.]| ou /).flatMap((b) => ` ${normalizar(b)} `.split(SEPARADOR_PEDIDO).filter((_, i) => i % 2 === 0));
  for (const bruto of brutos) {
    let s = ` ${bruto} `;
    if (s.trim().length < 3) continue;
    let slots = null; let dias = null;
    for (const [re, ss] of PISTAS_SLOT) { if (re.test(s)) { slots = [...new Set([...(slots || []), ...ss])]; s = s.replace(re, ' '); } re.lastIndex = 0; }
    for (const [re, dd] of PISTAS_DIA) { if (re.test(s)) { dias = [...new Set([...(dias || []), ...dd])].sort(); s = s.replace(re, ' '); } re.lastIndex = 0; }
    const termos = [...new Set(s.split(/ e | com |\//).map(aparar).filter((t) => t.length >= 3))];
    const anterior = out[out.length - 1];
    if (!termos.length) {
      if (anterior && (slots || dias)) {
        if (slots) anterior.slots = [...new Set([...(anterior.slots || []), ...slots])].sort((a, b) => SLOTS.indexOf(a) - SLOTS.indexOf(b));
        if (dias) anterior.dias = [...new Set([...(anterior.dias || []), ...dias])].sort();
      }
      continue;
    }
    out.push({ texto: bruto.trim(), termos, slots: slots?.sort((a, b) => SLOTS.indexOf(a) - SLOTS.indexOf(b)) || null, dias });
  }
  return out;
}

const pedidoVale = (p, slot, wd) => (!p.slots || p.slots.includes(slot)) && (!p.dias || wd == null || p.dias.includes(wd));
const pedidoBate = (p, texto) => p.termos.filter((t) => texto.includes(t)).length;

/**
 * "Não abro mão" é REGRA, não bônus (decisão do Raphael, 23/09): se um pedido
 * vale pra esta refeição/dia e existe receita permitida com todos os termos,
 * só essas entram na escolha, mesmo repetindo na semana. Sem receita que
 * case, cai na lista inteira. Mesma regra do lib/gerarPlano.ts da web.
 */
export function soComPedidos(cands, slot, wd, pedidos) {
  const valem = pedidos.filter((p) => pedidoVale(p, slot, wd));
  if (!valem.length) return cands;
  const casam = cands.filter((r) => { const t = textoDa(r); return valem.some((p) => pedidoBate(p, t) === p.termos.length); });
  return casam.length ? casam : cands;
}

function ajustePedidos(r, slot, wd, pedidos) {
  if (!pedidos.length) return 0;
  const t = textoDa(r); let a = 0;
  for (const p of pedidos) {
    if (!pedidoVale(p, slot, wd)) continue;
    const bat = pedidoBate(p, t);
    if (bat) a -= bat === p.termos.length ? 1 : (0.3 * bat) / p.termos.length;
  }
  return a;
}

// ─── Filtros duros ────────────────────────────────────────────────────────
export function termosNaoGosta(texto) {
  return (texto || '').split(/[,;\n]| e /).map((t) => normalizar(t)).filter((t) => t.length >= 3);
}

/** O que ela não gosta e, o que importa de verdade, a ALERGIA. Sempre no código. */
export function termosExcluidos(naoGosta, alergias) {
  return [...new Set([...termosNaoGosta(naoGosta), ...termosNaoGosta(alergias)])];
}

/** Restrição é filtro DURO (só tag afirmada) e `termos` tira o que ela não come. */
export function permitida(r, restricoes, termos) {
  const tags = (restricoes || []).filter((x) => x !== 'nenhuma').map((x) => TAG_DA_RESTRICAO[x]).filter(Boolean);
  for (const opcoes of tags) if (!opcoes.some((t) => r.tags.includes(t))) return false;
  if (termos.length) {
    const alvo = textoDa(r);
    if (termos.some((t) => alvo.includes(t))) return false;
  }
  return true;
}

export function candidatosPara(slot, restricoes, termos, pool = PRATICAS) {
  return pool.filter((r) => CATEGORIA[slot](r) && r.meals.length > 0 && permitida(r, restricoes, termos));
}

// ─── Pontuação e escolha ──────────────────────────────────────────────────
function pontuar(r, m, alvo, ctx) {
  const kcal = r.macros.kcal * m, p = r.macros.p * m, c = r.macros.c * m, f = r.macros.f * m;
  const base = alvo.kcal > 0 ? Math.abs(kcal - alvo.kcal) / alvo.kcal : 0;
  return base + (alvo.kcal > 0 ? 0.35 * Math.abs(p - alvo.p) / Math.max(20, alvo.p) : 0)
    + (alvo.c > 0 ? 0.25 * Math.max(0, c - alvo.c) / Math.max(20, alvo.c) : 0)
    + (alvo.f > 0 ? 0.3 * Math.max(0, f - alvo.f) / Math.max(10, alvo.f) : 0)
    + ajustePrioridade(r, ctx.slot) + ajustePedidos(r, ctx.slot, ctx.wd, ctx.pedidos)
    + (ctx.usadas.get(r.id) || 0) * 0.6 + (m !== 1 ? 0.08 : 0) + ctx.rnd() * 0.25;
}

function escolher(cands, alvo, ctx) {
  let melhor = null;
  for (const r of cands) for (const m of PORCOES) {
    const score = pontuar(r, m, alvo, ctx);
    if (!melhor || score < melhor.score) melhor = { r, m, score };
  }
  return melhor;
}

function alvoDoSlot(alvoDia, slots, slot, noPrato) {
  const somaFatias = slots.reduce((a, s) => a + FATIA[s], 0) || 1;
  const fatia = slots.includes(slot) ? FATIA[slot] / somaFatias : 0;
  const soma = (k) => noPrato.reduce((a, it) => a + it[k], 0);
  return { kcal: alvoDia.kcal * fatia - soma('kcal'), p: alvoDia.p * fatia - soma('p'), c: alvoDia.c * fatia - soma('c'), f: alvoDia.f * fatia - soma('f') };
}

/**
 * @param {{alvo:{kcal:number,p:number,c:number,f:number}, slots?:string[], restricoes:string[], naoGosta?:string, alergias?:string, indispensavel?:string, semente?:number}} op
 * @returns {{weekday:number, meals:{slot:string,time:string,name:string,code:string|null,items:object[]}[]}[]}
 */
export function gerarRascunho(op) {
  const rnd = prng(op.semente ?? 1);
  const termos = termosExcluidos(op.naoGosta, op.alergias);
  const pedidos = pedidosDe(op.indispensavel);
  const slots = op.slots?.length ? op.slots : SLOTS_PADRAO;
  const usadas = new Map();
  const pool = Object.fromEntries(slots.map((s) => [s, candidatosPara(s, op.restricoes, termos)]));
  const dias = [];
  for (let wd = 1; wd <= 7; wd++) {
    const meals = [];
    for (const slot of slots) {
      const alvo = alvoDoSlot(op.alvo, slots, slot, []);
      const cands = soComPedidos(pool[slot], slot, wd, pedidos);
      const melhor = cands.length && alvo.kcal >= 80 ? escolher(cands, alvo, { slot, wd, pedidos, usadas, rnd }) : null;
      if (!melhor) continue;
      usadas.set(melhor.r.id, (usadas.get(melhor.r.id) || 0) + 1);
      meals.push({ slot, time: SLOT_HORA[slot], name: melhor.r.name, code: melhor.r.id, items: [receitaComoItem(melhor.r, melhor.m)] });
    }
    dias.push({ weekday: wd, meals });
  }
  return dias;
}

/**
 * Ajuste fino das porções (SÓ no lote; o editor da web não faz isso, a
 * Luciana ajusta na mão): o rascunho sai com porções "redondas" e costuma
 * fechar o dia 5 a 10% abaixo da meta. Aqui, refeição a refeição, a porção
 * sobe ou desce um degrau enquanto isso aproximar o dia da meta de calorias,
 * sem passar de `tolerancia`. Não troca receita, não mexe em restrição.
 */
export function ajustarPorcoes(dias, alvo, tolerancia = 0.05) {
  const total = (meals) => meals.reduce((a, m) => a + m.items.reduce((b, it) => b + it.kcal, 0), 0);
  return dias.map((dia) => {
    let meals = dia.meals.map((m) => ({ ...m, items: m.items.map((it) => ({ ...it })) }));
    for (let passo = 0; passo < 6; passo++) {
      const atual = total(meals); const dist = Math.abs(atual - alvo.kcal);
      if (dist / alvo.kcal <= tolerancia * 0.6) break;
      let melhor = null;
      meals.forEach((m, mi) => m.items.forEach((it, ii) => {
        const r = it.code && PRATICAS.find((x) => x.id === it.code);
        if (!r || !r.macros.kcal) return;
        const atualM = Math.round((it.kcal / r.macros.kcal) * 4) / 4;
        for (const pm of PORCOES) {
          if (pm === atualM) continue;
          const novoTotal = atual - it.kcal + r.macros.kcal * pm;
          const d = Math.abs(novoTotal - alvo.kcal);
          if (d < dist && (!melhor || d < melhor.d)) melhor = { d, mi, ii, r, pm };
        }
      }));
      if (!melhor) break;
      meals[melhor.mi].items[melhor.ii] = receitaComoItem(melhor.r, melhor.pm);
    }
    return { ...dia, meals };
  });
}

export function somarDia(meals) {
  const t = meals.flatMap((m) => m.items).reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  return { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
}
