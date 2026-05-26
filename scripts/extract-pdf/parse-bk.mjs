// Extrator do PDF nutricional do BK.
// Layout: 2 colunas horizontais por página (esquerda + direita).
// Cada linha contém: nome | porção (Xg) | kcal | kJ | carb | açúcar tot | açúcar add | prot | gord tot | gord sat | gord trans | fibra | sódio
//
// Estratégia:
// 1. Agrupar items por Y (com tolerância de ±3) → cada Y = uma "linha visual"
// 2. Pra cada linha, separar items em 2 grupos por X (split no X médio da página, ~570 unit)
// 3. Pra cada grupo, montar string normalizada e parsear via regex robusta

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const PDF = 'C:/Users/Usuário/Desktop/Macros/TABELA_NUTRICIONAL_BK_2025.pdf';
const data = new Uint8Array(await readFile(PDF));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

// Regex pra extrair valor numérico (com vírgula decimal e parêntese opcional de %)
// Ex: "717 (36%)" → 717. "5*" → 5. "47" → 47.  "13,5" → 13.5
function num(s) {
  if (s === null || s === undefined) return null;
  const m = String(s).match(/^(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  return Number(m[1].replace('.', '').replace(',', '.'));
  // Note: "1.369" no PDF significa 1369 (separador de milhar PT-BR), por isso tiro o ponto.
}

// Agrupa items por linha (Y com tolerância)
function groupByLine(items, tol = 3) {
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const lines = [];
  for (const it of sorted) {
    const line = lines.find(l => Math.abs(l.y - it.y) <= tol);
    if (line) line.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }
  return lines.map(l => ({ ...l, items: l.items.sort((a, b) => a.x - b.x) }));
}

// Concatena strings adjacentes (próximas) na mesma linha pra reconstituir nomes quebrados
function concatRuns(items, gapX = 5) {
  const out = [];
  let buf = null;
  for (const it of items) {
    if (!buf) { buf = { ...it }; continue; }
    const gap = it.x - (buf.x + estimateWidth(buf.s));
    if (gap < gapX && !/^\d/.test(it.s)) {
      buf.s += it.s;
    } else {
      out.push(buf);
      buf = { ...it };
    }
  }
  if (buf) out.push(buf);
  return out;
}
function estimateWidth(s) { return s.length * 5; } // estimate, doesn't have to be precise

// Identifica se uma string parece um valor numérico
const NUM_RE = /^[\d.,]+(\s*\([^)]+\))?\*?$/;
const PORTION_RE = /^\d+(?:[.,]\d+)?\s*g$/i;

function isValue(s) { return NUM_RE.test(s.trim()) || /^0\*$/.test(s.trim()) || /^tr$/i.test(s.trim()); }

const allProducts = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const items = tc.items
    .map(i => ({ x: i.transform[4], y: i.transform[5], s: i.str.trim() }))
    .filter(i => i.s && i.s !== '|' && !/^\s+$/.test(i.s));

  const lines = groupByLine(items);

  // Descobrir o X médio da página (split entre esquerda e direita).
  // Pra BK landscape, ~570-580 é o meio.
  const maxX = Math.max(...items.map(i => i.x));
  const splitX = maxX / 2;

  for (const line of lines) {
    // Pra cada lado (esquerda < splitX, direita ≥ splitX), processa separadamente
    for (const side of ['left', 'right']) {
      const sideItems = line.items.filter(it => side === 'left' ? it.x < splitX : it.x >= splitX);
      if (sideItems.length < 4) continue; // linha precisa ter nome + ao menos alguns valores

      // Acha o índice do PRIMEIRO valor (porção, ex: "325 g" ou "28 g")
      const portionIdx = sideItems.findIndex(it => PORTION_RE.test(it.s));
      if (portionIdx === -1) continue; // sem porção, não é linha de produto

      // Nome = concat de items[0..portionIdx-1]
      const nameItems = sideItems.slice(0, portionIdx);
      const name = nameItems.map(i => i.s).join(' ').replace(/\s+/g, ' ').trim();
      if (!name || name.length < 2) continue;

      // Valores = items[portionIdx..portionIdx+12]
      const valItems = sideItems.slice(portionIdx, portionIdx + 13);
      if (valItems.length < 8) continue;

      const portion = valItems[0].s;
      const kcal = num(valItems[1]?.s);
      // Posições (baseadas na análise manual da pp 1):
      //   [0]=porção [1]=kcal [2]=kJ [3]=carb [4]=açúcar tot [5]=açúcar add
      //   [6]=prot [7]=gord tot [8]=gord sat [9]=gord trans [10]=fibra [11]=sódio
      const carb = num(valItems[3]?.s);
      const prot = num(valItems[6]?.s);
      const fat = num(valItems[7]?.s);
      const fiber = num(valItems[10]?.s);
      const sodium = num(valItems[11]?.s);

      if (kcal === null || kcal === 0) continue; // ignore lines sem kcal real

      allProducts.push({
        name,
        portion,
        kcal,
        p: prot,
        c: carb,
        f: fat,
        fiber,
        sodium_mg: sodium,
        page: p,
        side,
      });
    }
  }
}

console.log(`Produtos extraídos: ${allProducts.length}`);
console.log('\nAmostra:');
allProducts.slice(0, 15).forEach(p => console.log(`  ${p.name.slice(0, 40).padEnd(40)} | ${String(p.portion).padEnd(8)} | ${String(p.kcal).padStart(4)} kcal | P${p.p} C${p.c} F${p.f}`));

// Salva JSON
await writeFile('./bk.json', JSON.stringify(allProducts, null, 2));
console.log(`\nJSON salvo: ./bk.json`);
