// Extrator do PDF do Subway. Layout linear na pp 2.
// Colunas: Nome | Porção (Xg) | kcal | Carb (g) | Prot (g) | Gord total (g) | Gord sat | Gord trans | Fibras | Sódio (mg) | Sódio/100g

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const PDF = 'C:/Users/Usuário/Desktop/Macros/Tabela Nutricional- subway.pdf';
const data = new Uint8Array(await readFile(PDF));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const PORTION_RE = /^\d+(?:[.,]\d+)?\s*g$/i;
const KCAL_RE = /^(\d+(?:[.,]\d+)?)\s*kcal$/i;
const G_RE = /^(\d+(?:[.,]\d+)?)\s*g$/i;
const MG_RE = /^(\d+(?:[.,]\d+)?)\s*mg$/i;

function num(s, re) {
  if (!s) return null;
  const m = String(s).match(re);
  return m ? Number(m[1].replace(',', '.')) : null;
}

const products = [];
let currentCategory = '';

const page = await doc.getPage(2);
const tc = await page.getTextContent();
const items = tc.items.map(i => ({ x: i.transform[4], y: i.transform[5], s: i.str.trim() })).filter(i => i.s);

// Agrupa por Y (linha)
const lines = new Map();
for (const it of items) {
  const y = Math.round(it.y);
  if (!lines.has(y)) lines.set(y, []);
  lines.get(y).push(it);
}

for (const [y, lineItems] of [...lines.entries()].sort((a, b) => b[0] - a[0])) {
  const sorted = lineItems.sort((a, b) => a.x - b.x);
  const strs = sorted.map(i => i.s);

  // Header da categoria: primeira string em CAIXA ALTA seguida de "Porção" "Valor energético" etc
  if (strs.length > 5 && /^(SUBS|PROTEÍNAS|PÃES|MOLHOS|VEGETAIS|QUEIJOS|EXTRAS|BEBIDAS|SOBREMESAS|SNACKS)/i.test(strs[0])) {
    currentCategory = strs[0];
    continue;
  }
  // Pular outras linhas de header/notas
  if (strs.length < 6) continue;
  if (!PORTION_RE.test(strs[1])) continue; // segunda coluna precisa ser porção

  const name = strs[0];
  const portion = strs[1];
  const kcal = num(strs[2], KCAL_RE);
  if (kcal === null) continue;

  const carb = num(strs[3], G_RE);
  const prot = num(strs[4], G_RE);
  const fat = num(strs[5], G_RE);
  const fatSat = num(strs[6], G_RE);
  const fatTrans = num(strs[7], G_RE);
  const fiber = num(strs[8], G_RE);
  const sodium = num(strs[9], MG_RE);

  products.push({ name, category: currentCategory, portion, kcal, p: prot, c: carb, f: fat, fiber, sodium_mg: sodium });
}

console.log(`Subway: ${products.length} produtos`);
console.log('\nAmostra:');
products.slice(0, 10).forEach(p => console.log(`  ${p.name.slice(0, 35).padEnd(35)} | ${p.portion.padEnd(8)} | ${String(p.kcal).padStart(4)} kcal | P${p.p} C${p.c} F${p.f}`));

await writeFile('./subway.json', JSON.stringify(products, null, 2));
console.log('\nJSON: ./subway.json');
