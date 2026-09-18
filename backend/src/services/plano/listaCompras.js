// Lista de compras de uma semana do plano, no servidor: a mesma conta de
// web/src/lib/listaCompras.ts (ingredientes das receitas do livro que estão
// na semana, com as trocas da cliente já aplicadas), em três formas:
//   geral       → cada ingrediente uma vez, somando quantas vezes aparece
//   por dia     → dia a dia, nome + quantidade
//   por refeição→ refeição a refeição, nome + quantidade
// e o texto pronto pro WhatsApp (a Luna manda quando ela pede "lista de
// compras", ou quando ela clica em "Receber pela Luna" na área de membros).
//
// Só o livro PR está no servidor. Receita do livro da nutricionista (NL) que
// a Luciana tenha posto à mão entra pelo NOME, sem os ingredientes.

import { PRATICA_POR_CODIGO, normalizar } from './receitas.js';
import { planoResumido } from '../diario.js';
import { inicioDaSemana, somarDias, diaDaSemana, dataBR } from '../../utils/datas.js';
import { getPool } from '../../db.js';

const PREFIXO_MEDIDA = /^[\d½¼¾.,/ ]+(x[íi]cara|colher|colheres|unidade|unidades|fatia|fatias|pote|potes|copo|copos)?(\s*\([^)]*\))?\s*(de\s+)?/i;
const IGNORAR = /^(agua|gelo|sal)(\s|$)/;
const DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const ROTULO = { cafe: 'Café da manhã', lanche_manha: 'Lanche da manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da tarde', jantar: 'Jantar', ceia: 'Ceia' };

/** Ingredientes de uma refeição: [{ nome, qtd }]. Item sem receita entra pelo nome. */
function ingredientesDe(meal) {
  const out = [];
  for (const it of meal.items || []) {
    const r = it.code ? PRATICA_POR_CODIGO.get(it.code) : null;
    if (r) {
      for (const ing of r.ingredients) {
        const nome = ing.name.replace(PREFIXO_MEDIDA, '').trim() || ing.name;
        if (IGNORAR.test(normalizar(nome))) continue;
        out.push({ nome, qtd: ing.quantity ? `${ing.quantity} ${ing.unit || ''}`.trim() : '' });
      }
    } else if (!IGNORAR.test(normalizar(it.name))) out.push({ nome: it.name, qtd: it.portion || '' });
  }
  return out;
}

const dias = (plano) => (planoResumido(plano)?.dias || []).filter((d) => d.meals?.length);

/** Geral: cada item uma vez, ordenado, com quantas vezes aparece e as quantidades. */
export function listaGeral(plano) {
  const mapa = new Map();
  for (const d of dias(plano)) for (const m of d.meals) for (const ing of ingredientesDe(m)) {
    const k = normalizar(ing.nome);
    const cur = mapa.get(k) || { nome: ing.nome, vezes: 0, qtd: [] };
    cur.vezes += 1; if (ing.qtd) cur.qtd.push(ing.qtd); mapa.set(k, cur);
  }
  return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Por dia: [{ weekday, date, itens: [{ nome, qtd }] }], repetidos do mesmo dia somados nas quantidades. */
export function listaPorDia(plano) {
  return dias(plano).map((d) => {
    const mapa = new Map();
    for (const m of d.meals) for (const ing of ingredientesDe(m)) {
      const k = normalizar(ing.nome); const cur = mapa.get(k) || { nome: ing.nome, qtd: [] };
      if (ing.qtd) cur.qtd.push(ing.qtd); mapa.set(k, cur);
    }
    return { weekday: d.weekday, date: d.date, itens: [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')) };
  });
}

/** Por refeição: [{ weekday, date, refeicoes: [{ slot, nome, itens }] }]. */
export function listaPorRefeicao(plano) {
  return dias(plano).map((d) => ({ weekday: d.weekday, date: d.date, refeicoes: d.meals.map((m) => ({ slot: m.slot, nome: m.name, itens: ingredientesDe(m) })) }));
}

const linha = (i) => `• ${i.nome}${i.vezes > 1 ? ` (${i.vezes}×)` : ''}${i.qtd?.length ? ` — ${[...new Set(i.qtd)].slice(0, 2).join(', ')}` : ''}`;
const cabecalho = (plano, nome) => `🛒 *Lista de compras${nome ? ` de ${nome}` : ''}*\nSemana de ${plano.week_start.slice(8, 10)}/${plano.week_start.slice(5, 7)} a ${somarDias(plano.week_start, 6).slice(8, 10)}/${somarDias(plano.week_start, 6).slice(5, 7)} · plano da Nutri Luciana`;

/** Textos pro WhatsApp. Pode devolver mais de uma mensagem (limite de 4.000 caracteres). */
export function textosLista(plano, modo, nome) {
  let corpo;
  if (modo === 'dia') corpo = listaPorDia(plano).map((d) => `*${DIAS[d.weekday]}*\n${d.itens.map(linha).join('\n') || '—'}`).join('\n\n');
  else if (modo === 'refeicao') corpo = listaPorRefeicao(plano).map((d) => `*${DIAS[d.weekday]}*\n${d.refeicoes.map((r) => `_${ROTULO[r.slot] || r.slot}: ${r.nome}_\n${r.itens.map(linha).join('\n') || '—'}`).join('\n')}`).join('\n\n');
  else corpo = listaGeral(plano).map(linha).join('\n');
  const texto = `${cabecalho(plano, nome)}\n\n${corpo || '(a semana não tem receitas do livro)'}`;
  const partes = []; let resto = texto;
  while (resto.length > 3800) { let corte = resto.lastIndexOf('\n\n', 3800); if (corte < 500) corte = resto.lastIndexOf('\n', 3800); if (corte < 500) corte = 3800; partes.push(resto.slice(0, corte)); resto = resto.slice(corte).trimStart(); }
  partes.push(resto);
  return partes;
}

/**
 * De qual semana é "a lista de compras" hoje: de sexta a domingo, a da semana
 * que vem (se o plano dela já existe); senão a desta semana. Mesma regra da
 * tela Meu plano.
 */
export async function planoDaLista(userId, weekStart = null) {
  const pool = getPool();
  const buscar = async (ws) => (await pool.query(`SELECT * FROM meal_plans WHERE user_id = $1 AND week_start = $2 AND status = 'ativo' LIMIT 1`, [userId, ws])).rows[0] || null;
  if (weekStart) return { plano: await buscar(weekStart), proxima: false };
  const hoje = dataBR(); const atual = inicioDaSemana(hoje);
  if (diaDaSemana(hoje) >= 5) { const p = await buscar(somarDias(atual, 7)); if (p) return { plano: p, proxima: true }; }
  return { plano: await buscar(atual), proxima: false };
}
