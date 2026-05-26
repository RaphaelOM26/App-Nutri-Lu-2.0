// Para uma página + X específico (com tolerância), imprime todos os items
// próximos a esse X, organizados por Y desc. Usado pra inspecionar uma coluna
// de alimento e descobrir quais valores correspondem a quais nutrientes.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';

const PDF_PATH = 'C:/Users/Usuário/Desktop/Macros/tabela-de-macros - sonia-tucunduva.pdf';
const PAGE = Number(process.argv[2]);
const X = Number(process.argv[3]);
const TOL = Number(process.argv[4] || 8);

const data = new Uint8Array(await readFile(PDF_PATH));
const doc = await getDocument({ data, useSystemFonts: true }).promise;
const page = await doc.getPage(PAGE);
const tc = await page.getTextContent();

const items = tc.items
  .map(i => ({ x: i.transform[4], y: i.transform[5], s: i.str }))
  .filter(i => Math.abs(i.x - X) <= TOL)
  .sort((a, b) => b.y - a.y);

console.log(`Page ${PAGE}, column x≈${X} (±${TOL}), ${items.length} items:`);
for (const it of items) {
  if (it.s.trim()) console.log(`  y=${it.y.toFixed(1).padStart(6)}  x=${it.x.toFixed(1)}  "${it.s}"`);
}
