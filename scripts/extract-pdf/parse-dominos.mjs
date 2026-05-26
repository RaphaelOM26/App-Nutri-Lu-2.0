// Extrator do PDF do Domino's. 1 página, 19 colunas por linha.
// Estrutura: Nome | Porção_venda (Xg) | [9 valores POR 100g] | Porção_consumo (1 fatia) | [9 valores POR PORÇÃO]
// Usamos os valores POR PORÇÃO (1 fatia) — mais útil pro usuário.
// Por porção: kcal | kJ | prot | hidratos | açúcares | lípidos | saturados | sal

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const PDF = 'C:/Users/Usuário/Desktop/Macros/nutricional dominos.pdf';
const data = new Uint8Array(await readFile(PDF));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

function num(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d+(?:[.,]\d+)?)/);
  return m ? Number(m[1].replace(',', '.').replace(/\s/g, '')) : null;
}

const products = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const items = tc.items.map(i => ({ x: i.transform[4], y: i.transform[5], s: i.str.trim() })).filter(i => i.s);

  const lines = new Map();
  for (const it of items) {
    const y = Math.round(it.y);
    if (!lines.has(y)) lines.set(y, []);
    lines.get(y).push(it);
  }

  for (const [y, lineItems] of [...lines.entries()].sort((a, b) => b[0] - a[0])) {
    const sorted = lineItems.sort((a, b) => a.x - b.x);
    const strs = sorted.map(i => i.s);

    // Pular headers e categorias
    if (strs.length < 10) continue;
    // Primeira coluna precisa ser nome (não numérico)
    if (/^\d/.test(strs[0])) continue;
    // Segunda coluna precisa ser porção (Xg) ou Xg sem espaço
    if (!/^\d+\s*g$/i.test(strs[1])) continue;

    const name = strs[0];
    const portionVenda = strs[1];

    // Coluna [10] deve ser "1 fatia" ou "1 pasta" etc
    const portionConsumo = strs[10] || null;
    if (!portionConsumo || /\d+\s*g$/i.test(portionConsumo)) {
      // formato inesperado, pular
      continue;
    }

    // Valores POR PORÇÃO (índices 11-18)
    const kcal = num(strs[11]);
    const prot = num(strs[13]);
    const carb = num(strs[14]);
    const fat = num(strs[16]);

    if (kcal === null) continue;

    products.push({
      name,
      portion: portionConsumo,
      portionVenda,
      kcal,
      p: prot,
      c: carb,
      f: fat,
    });
  }
}

console.log(`Domino's: ${products.length} produtos`);
console.log('\nAmostra:');
products.slice(0, 12).forEach(p => console.log(`  ${p.name.slice(0, 38).padEnd(38)} | ${p.portion.padEnd(10)} | ${String(p.kcal).padStart(4)} kcal | P${p.p} C${p.c} F${p.f}`));

await writeFile('./dominos.json', JSON.stringify(products, null, 2));
console.log('\nJSON: ./dominos.json');
