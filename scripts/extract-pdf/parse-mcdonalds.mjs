// Extrator do PDF do McDonald's. 10 páginas, layout PT-PT.
// Ordem das colunas: Nome | Porção (Xg/Xml) | kJ | kcal | %DDR | PROT(g) | %DDR | HIDRATOS(g) | %DDR | AÇÚCARES(g) | %DDR | LÍPIDOS(g) | %DDR | SATURADOS(g) | %DDR | TRANS(g) | FIBRA(g) | SAL(g) | %DDR
// Pegamos: name, portion, kcal (idx 3), prot (idx 5), hidratos/carb (idx 7), lípidos/gord (idx 11)
//
// Algumas linhas têm nome quebrado em 2 Y adjacentes — unificar (gap ≤ 2).

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const PDF = 'C:/Users/Usuário/Desktop/Macros/Mc donalds.pdf';
const data = new Uint8Array(await readFile(PDF));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

function num(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d+(?:[.,]\d+)?)/);
  return m ? Number(m[1].replace(',', '.')) : null;
}

const PORTION_RE = /^\d+(?:[.,]\d+)?\s*(g|mL|ml)$/i;

const products = [];
let currentCategory = '';
let skipped = 0;

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const items = tc.items.map(i => ({ x: i.transform[4], y: i.transform[5], s: i.str.trim() })).filter(i => i.s);

  // Agrupa por Y
  const linesMap = new Map();
  for (const it of items) {
    const y = Math.round(it.y);
    if (!linesMap.has(y)) linesMap.set(y, []);
    linesMap.get(y).push(it);
  }
  const lines = [...linesMap.entries()].map(([y, its]) => ({ y, items: its.sort((a, b) => a.x - b.x) })).sort((a, b) => b.y - a.y);

  // Merge linhas com Y adjacentes (gap ≤ 2) — pra unificar nome+valores quando estão em Y diferentes
  const merged = [];
  for (const line of lines) {
    const last = merged[merged.length - 1];
    if (last && (last.y - line.y) <= 2) {
      last.items = [...last.items, ...line.items].sort((a, b) => a.x - b.x);
    } else {
      merged.push({ y: line.y, items: [...line.items] });
    }
  }

  for (const line of merged) {
    const strs = line.items.map(i => i.s);

    // Pular headers / metadata
    if (strs.length < 5) {
      // Linha curta — pode ser categoria
      const joined = strs.join(' ').trim();
      if (/^[A-ZÁÉÍÓÚÇ &]+$/.test(joined) && joined.length > 3 && joined.length < 60 && !joined.includes('DDR')) {
        currentCategory = joined;
      }
      continue;
    }

    // Achar o índice da porção (Xg ou XmL)
    const portionIdx = strs.findIndex(s => PORTION_RE.test(s));
    if (portionIdx === -1 || portionIdx === 0) continue;

    // Nome = strs[0..portionIdx-1]
    const name = strs.slice(0, portionIdx).join(' ').replace(/\s+/g, ' ').trim();
    if (!name || name.length < 2 || /^[A-Z]{2,}\b/.test(name) && /^[A-ZÁÉÍÓÚÇ ]+$/.test(name)) {
      // É um header de categoria (toda em maiúsculas), não produto
      if (/^[A-ZÁÉÍÓÚÇ &]+$/.test(name)) currentCategory = name;
      continue;
    }

    // Valores começam em strs[portionIdx]
    // [0]=porção [1]=kJ [2]=kcal [3]=%DDR [4]=prot [5]=%DDR [6]=hidratos [7]=%DDR
    // [8]=açúcares [9]=%DDR [10]=lípidos [11]=%DDR [12]=saturados [13]=%DDR [14]=trans [15]=fibra [16]=sal [17]=%DDR
    const vals = strs.slice(portionIdx);
    if (vals.length < 12) continue;

    const portion = vals[0];
    const kcal = num(vals[2]);
    const prot = num(vals[4]);
    const carb = num(vals[6]);
    const fat = num(vals[10]);

    if (kcal === null || kcal === 0) continue;

    products.push({ name, category: currentCategory, portion, kcal, p: prot, c: carb, f: fat, page: p });
  }
}

console.log(`McDonald's: ${products.length} produtos`);
console.log('\nAmostra (15 primeiros):');
products.slice(0, 15).forEach(p => console.log(`  ${p.name.slice(0, 38).padEnd(38)} | ${p.portion.padEnd(8)} | ${String(p.kcal).padStart(4)} kcal | P${p.p} C${p.c} F${p.f}`));
console.log('\nAmostra (10 últimos):');
products.slice(-10).forEach(p => console.log(`  ${p.name.slice(0, 38).padEnd(38)} | ${p.portion.padEnd(8)} | ${String(p.kcal).padStart(4)} kcal | P${p.p} C${p.c} F${p.f}`));

// Validação cruzada com produtos conhecidos
const validate = ['McCafé', 'Big Mac', 'McChicken', 'Quarteirão', 'Sundae', 'Batata'];
console.log('\nValidação:');
for (const v of validate) {
  const matches = products.filter(p => p.name.toLowerCase().includes(v.toLowerCase())).slice(0, 3);
  if (matches.length) matches.forEach(m => console.log(`  ✓ "${m.name}" → ${m.kcal} kcal, P${m.p} C${m.c} F${m.f}`));
  else console.log(`  - "${v}" sem matches`);
}

await writeFile('./mcdonalds.json', JSON.stringify(products, null, 2));
console.log('\nJSON: ./mcdonalds.json');
