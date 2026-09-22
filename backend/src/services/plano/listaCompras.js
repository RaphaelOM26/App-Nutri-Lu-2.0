// Lista de compras de uma semana do plano, no servidor — a ÚNICA fonte: a
// área de membros lê daqui (GET /me/lista-compras) e a Luna manda o texto no
// WhatsApp. Duas formas:
//   geral   → o que comprar, por seção do mercado, quantidades somadas na
//             semana, unidade de compra + peso ("Tomate — ~5 un (560 g)")
//   por dia → o que separar em cada dia, nome + quantidade
// (a forma "por refeição" saiu em 22/09/2026: era lista de preparo, não de
// compra, e a tela Meu plano já mostra as refeições do dia).
//
// O ingrediente vem como o livro escreve; `ingredientes.js` transforma no
// item como se compra (sinônimos, preparo fora, grãos em peso cru, seção e
// unidade). Só o livro PR está no servidor: item solto (TACO/texto livre)
// entra com as gramas que tiver, ou vai pra "Também no plano" com a porção
// escrita.

import { PRATICA_POR_CODIGO } from './receitas.js';
import { planoResumido } from '../diario.js';
import { inicioDaSemana, somarDias, diaDaSemana, dataBR } from '../../utils/datas.js';
import { getPool } from '../../db.js';
import { canonico, gramasCruas, emPesoCru, secaoDe, unidadeDe, SECOES } from './ingredientes.js';

const DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

/** Ingredientes de uma refeição já como itens de compra. */
function ingredientesDe(meal) {
  const out = [];
  for (const it of meal.items || []) {
    const r = it.code ? PRATICA_POR_CODIGO.get(it.code) : null;
    if (r) {
      for (const ing of r.ingredients) {
        const c = canonico(ing.name);
        if (c.ignorar) continue;
        const q = Number(String(ing.quantity || '').replace(',', '.')) || 0;
        out.push({ nome: c.nome, g: ing.unit === 'g' ? gramasCruas(c.nome, q, c.pronto) : 0, ml: ing.unit === 'ml' ? q : 0, pesoCru: c.pronto && emPesoCru(c.nome), secao: secaoDe(c.nome) });
      }
      continue;
    }
    const c = canonico(it.name);
    if (c.ignorar) continue;
    const g = Number(it.grams) || 0;
    if (g) out.push({ nome: c.nome, g: gramasCruas(c.nome, g, c.pronto), ml: 0, pesoCru: c.pronto && emPesoCru(c.nome), secao: secaoDe(c.nome) });
    // Sem gramas (TACO por medida, texto livre): não dá pra somar — fica com a porção escrita.
    else out.push({ nome: it.name, g: 0, ml: 0, pesoCru: false, secao: 'outros', porcao: it.portion || '' });
  }
  return out;
}

const dias = (plano) => (planoResumido(plano)?.dias || []).filter((d) => d.meals?.length);

/** Soma itens iguais: [{ nome, g, ml, vezes, secao, principal, secundario }]. */
function somar(itens) {
  const mapa = new Map();
  for (const i of itens) {
    const k = `${i.secao}:${i.nome.toLowerCase()}`;
    const cur = mapa.get(k) || { nome: i.nome, g: 0, ml: 0, vezes: 0, secao: i.secao, pesoCru: false, porcoes: new Set() };
    cur.g += i.g; cur.ml += i.ml; cur.vezes += 1; cur.pesoCru = cur.pesoCru || i.pesoCru;
    if (i.porcao) cur.porcoes.add(i.porcao);
    mapa.set(k, cur);
  }
  return [...mapa.values()].map((i) => {
    let principal, secundario;
    if (i.secao === 'despensa') { principal = ''; secundario = ''; }            // decisão B: despensa sem gramas
    else if (i.secao === 'outros') { principal = [...i.porcoes].slice(0, 2).join(', '); secundario = i.vezes > 1 ? `${i.vezes}×` : ''; }
    else ({ principal, secundario } = unidadeDe(i));
    return { nome: i.nome, g: i.g, ml: i.ml, vezes: i.vezes, secao: i.secao, principal, secundario };
  }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Geral: seções do mercado, cada uma com os itens somados na semana. */
export function listaGeral(plano) {
  const itens = somar(dias(plano).flatMap((d) => d.meals.flatMap(ingredientesDe)));
  return SECOES.map((s) => ({ ...s, itens: itens.filter((i) => i.secao === s.id) })).filter((s) => s.itens.length);
}

/** Por dia: [{ weekday, date, itens }] — o que separar no dia (temperos de despensa ficam de fora). */
export function listaPorDia(plano) {
  return dias(plano).map((d) => ({ weekday: d.weekday, date: d.date, itens: somar(d.meals.flatMap(ingredientesDe)).filter((i) => i.secao !== 'despensa') }));
}

/** Cardápio resumido pra folha impressa: [{ weekday, date, refeicoes: [café, almoço, jantar] }]. */
const PRINCIPAIS = ['cafe', 'almoco', 'jantar'];
/** O livro escreve alguns nomes em CAIXA ALTA; na folha vai tudo em frase. */
const emFrase = (nome) => { const s = String(nome || '').trim(); return s && s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s; };
export function cardapioDe(plano) {
  return dias(plano).map((d) => ({
    weekday: d.weekday, date: d.date,
    refeicoes: PRINCIPAIS.map((slot) => emFrase(d.meals.find((m) => m.slot === slot)?.name)).filter(Boolean),
  }));
}

/**
 * Tudo que a folha (web e PDF) precisa, num objeto só. `u` é a linha de
 * users (apelido, display_name). É o JSON de GET /me/lista-compras.
 */
export function dadosDaLista(plano, u, { proxima = false, nome = '' } = {}) {
  return {
    week_start: plano.week_start,
    week_index: plano.week_index ?? null,
    week_total: plano.week_total ?? null,
    proxima,
    nome,
    cardapio: cardapioDe(plano),
    secoes: listaGeral(plano),
    dias: listaPorDia(plano),
    texto: textosLista(plano, 'geral', nome).join('\n\n'),
  };
}

const linha = (i) => `• ${i.nome}${i.principal ? ` — ${i.principal}` : ''}${i.secundario ? ` (${i.secundario})` : ''}`;
const periodo = (ws) => `${ws.slice(8, 10)}/${ws.slice(5, 7)} a ${somarDias(ws, 6).slice(8, 10)}/${somarDias(ws, 6).slice(5, 7)}`;
const cabecalho = (plano, nome) => `🛒 *Lista de compras${nome ? ` de ${nome}` : ''}*\nSemana de ${periodo(plano.week_start)} · plano da Nutri Luciana`;
const NOTA = '_Unidade é o que você compra; o peso, o que as receitas usam. "~" é média por unidade._';

/** Textos pro WhatsApp. Pode devolver mais de uma mensagem (limite de 4.000 caracteres). */
export function textosLista(plano, modo, nome) {
  let corpo;
  if (modo === 'dia') {
    corpo = listaPorDia(plano).map((d) => `*${DIAS[d.weekday]}*\n${d.itens.map(linha).join('\n') || '—'}`).join('\n\n');
  } else {
    corpo = listaGeral(plano).map((s) => `*${s.emoji} ${s.titulo}*\n${s.itens.map(linha).join('\n')}`).join('\n\n');
  }
  const texto = `${cabecalho(plano, nome)}\n${modo === 'dia' ? '' : `${NOTA}\n`}\n${corpo || '(a semana não tem receitas do livro)'}`;
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
