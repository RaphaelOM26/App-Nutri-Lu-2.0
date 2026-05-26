// Consolida os 4 JSONs de fast food em um único módulo TS Food[] compatível
// com o schema do AppContext. Gera mobile/src/data/fastfood.ts.

import { readFile, writeFile } from 'node:fs/promises';

const OUT_TS = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/mobile/src/data/fastfood.ts';

function firstKeyword(name) {
  return name.split(/[,\-()]/)[0].trim().toLowerCase().split(/\s+/)[0] || 'food';
}

function toFood(prefix, brand, item) {
  // Limpa nome: remove ® e ™
  let cleanName = item.name.replace(/[®™*]/g, '').replace(/\s+/g, ' ').trim();
  // Domino's só lista "Mediterrânica", "Funghi", etc. — sem a palavra "pizza".
  // Prefixar "Pizza " quando a porção é "1 fatia" (são as pizzas; resto são sobremesas/acompanhamentos).
  if (brand === "Domino's" && /^1\s*fatia$/i.test(item.portion) && !/^pizza\b/i.test(cleanName)) {
    cleanName = `Pizza ${cleanName}`;
  }
  return {
    id: `${prefix}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${Math.round(item.kcal)}`,
    name: cleanName,
    brand,
    portion: item.portion,
    kcal: Math.round(item.kcal),
    p: Math.round((item.p ?? 0) * 10) / 10,
    c: Math.round((item.c ?? 0) * 10) / 10,
    f: Math.round((item.f ?? 0) * 10) / 10,
    q: firstKeyword(cleanName),
    fav: false,
  };
}

const sources = [
  { json: './bk.json', prefix: 'bk', brand: "Burger King" },
  { json: './subway.json', prefix: 'sub', brand: 'Subway' },
  { json: './dominos.json', prefix: 'dom', brand: "Domino's" },
  { json: './mcdonalds.json', prefix: 'mc', brand: "McDonald's" },
];

const all = [];
for (const s of sources) {
  const arr = JSON.parse(await readFile(s.json, 'utf-8'));
  const mapped = arr.map(it => toFood(s.prefix, s.brand, it));
  all.push(...mapped);
  console.log(`${s.brand.padEnd(15)} → ${mapped.length} produtos`);
}

// Dedup por id (caso houvesse duplicatas dentro de um mesmo PDF — improvável mas seguro)
const seen = new Set();
const deduped = all.filter(f => { if (seen.has(f.id)) return false; seen.add(f.id); return true; });

console.log(`\nTotal: ${deduped.length} produtos (${all.length - deduped.length} duplicatas removidas)`);

const ts = `// Auto-gerado por scripts/extract-pdf/merge-fastfood.mjs — NÃO EDITE À MÃO.
// Fontes: tabelas nutricionais oficiais de Burger King, Subway, Domino's e McDonald's.
// Valores por porção comercial (varia: 1 unidade, 1 fatia, 1 sub, etc.) — NÃO por 100g.
// ${deduped.length} produtos.

import type { Food } from './mockData';

export const FASTFOOD_FOODS: Food[] = ${JSON.stringify(deduped, null, 2)};
`;
await writeFile(OUT_TS, ts);
console.log(`\nTS salvo: ${OUT_TS}`);
