// Exploração: ler N páginas do PDF e dump text items com posição,
// pra entender o layout antes de escrever o parser definitivo.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';

const PDF_PATH = 'C:/Users/Usuário/Desktop/Macros/tabela-de-macros - sonia-tucunduva.pdf';
const PAGES = process.argv.slice(2).map(Number);
if (PAGES.length === 0) {
  console.error('Uso: node explore.mjs <pageNum> [pageNum...]');
  process.exit(1);
}

const data = new Uint8Array(await readFile(PDF_PATH));
const doc = await getDocument({ data, useSystemFonts: true }).promise;
console.log(`Total pages: ${doc.numPages}`);

for (const pNum of PAGES) {
  if (pNum < 1 || pNum > doc.numPages) { console.log(`-- pp${pNum}: fora do range`); continue; }
  const page = await doc.getPage(pNum);
  const tc = await page.getTextContent();
  console.log(`\n=== Page ${pNum} (${tc.items.length} items) ===`);
  // Agrupar por y aproximado (linhas)
  const rows = new Map();
  for (const it of tc.items) {
    const y = Math.round(it.transform[5]);
    const x = it.transform[4];
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push({ x, str: it.str });
  }
  // Imprimir em ordem de y desc (top→bottom)
  const ys = [...rows.keys()].sort((a, b) => b - a);
  for (const y of ys) {
    const items = rows.get(y).sort((a, b) => a.x - b.x);
    const line = items.map(i => `[${i.x.toFixed(0)}]${i.str}`).join(' ');
    console.log(`y=${y.toString().padStart(4)}  ${line}`);
  }
}
