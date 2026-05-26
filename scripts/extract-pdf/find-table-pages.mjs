// Identifica quais páginas têm a tabela de macros via heurística mais robusta.
// 1. Conta items que parecem valores numéricos (1-4 dígitos + vírgula + 1-3 dígitos)
// 2. Conta items no topo (y > 800) que parecem nomes de alimentos (string > 3 chars)
// 3. Pagina de tabela = ≥50 valores numéricos E ≥5 nomes no topo

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';

const PDF_PATH = 'C:/Users/Usuário/Desktop/Macros/tabela-de-macros - sonia-tucunduva.pdf';
const data = new Uint8Array(await readFile(PDF_PATH));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

const NUM_RE = /^\d{1,4},\d{1,3}$/;
const NAME_RE = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇa-záàâãéêíóôõúç][a-záàâãéêíóôõúç\s\-]{2,}/;

const stats = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  let nums = 0, topNames = 0, hasGTotal = false, hasMn = false;
  for (const it of tc.items) {
    const s = it.str.trim();
    const y = it.transform[5];
    if (NUM_RE.test(s)) nums++;
    if (y > 800 && y < 830 && NAME_RE.test(s)) topNames++;
    if (s === 'G. Total' || s === 'G.Total') hasGTotal = true;
    if (s === 'Mn') hasMn = true;
  }
  stats.push({ p, nums, topNames, hasGTotal, hasMn });
}

const macroPages = stats.filter(s => s.hasGTotal).map(s => s.p);
const microPages = stats.filter(s => s.hasMn && !s.hasGTotal).map(s => s.p);
const tablePages = stats.filter(s => s.nums >= 50 && s.topNames >= 4).map(s => s.p);
const headerPages = stats.filter(s => s.topNames >= 4).map(s => s.p);

console.log(`Pages with "G. Total" label (${macroPages.length}):`, macroPages.join(','));
console.log(`Pages with "Mn" label only (${microPages.length}):`, microPages.join(','));
console.log(`\nPages with ≥50 numeric + ≥4 top names (${tablePages.length}):`);
console.log(tablePages.join(','));
console.log(`\nAll pages with ≥4 top names (${headerPages.length}):`);
console.log(headerPages.join(','));

console.log('\nFirst 20 pages stats:');
stats.slice(0, 20).forEach(s => console.log(`pp${String(s.p).padStart(3)} nums=${String(s.nums).padStart(3)} topNames=${String(s.topNames).padStart(2)} gTotal=${s.hasGTotal} Mn=${s.hasMn}`));
