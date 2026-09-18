// O livro de receitas PRÁTICAS (PR) no servidor.
//
// Até 18/09/2026 o livro só existia no bundle da web: o rascunho do plano era
// montado no navegador da Luciana. A aprovação em lote precisa gerar o plano
// SEM ninguém na tela, então o livro veio pra cá (backend/data, gerado pelo
// scripts/receitas-praticas/importar.mjs junto com o .ts da web: mesma
// fonte, nunca editar à mão).
//
// Regra que não muda de lado: o plano sai SÓ deste livro. O livro da
// nutricionista (NL, elaborado) fica na biblioteca da web.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ARQUIVO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'data', 'receitas-praticas.json');

/** @type {Array<{id:string,name:string,tipo:string,meals:string[],tags:string[],ingredients:{name:string}[],macros:{kcal:number,p:number,c:number,f:number}}>} */
export const PRATICAS = JSON.parse(readFileSync(ARQUIVO, 'utf8'));
export const PRATICA_POR_CODIGO = new Map(PRATICAS.map((r) => [r.id, r]));

export function normalizar(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Nome + ingredientes, normalizados: é o "texto" onde os dicionários procuram. */
const textoCache = new WeakMap();
export function textoDa(r) {
  let t = textoCache.get(r);
  if (t == null) { t = ` ${normalizar(`${r.name} ${r.ingredients.map((i) => i.name).join(' ')}`)} `; textoCache.set(r, t); }
  return t;
}

/** Uma receita vira um item do plano: macros por porção × porções (igual à web). */
export function receitaComoItem(r, porcoes = 1) {
  const m = r.macros;
  const x = (v) => Math.round(v * porcoes * 10) / 10;
  return { name: r.name, portion: porcoes === 1 ? '1 porção' : `${String(porcoes).replace('.', ',')} ${porcoes < 1 ? 'porção' : 'porções'}`, code: r.id, kcal: x(m.kcal), p: x(m.p), c: x(m.c), f: x(m.f) };
}
