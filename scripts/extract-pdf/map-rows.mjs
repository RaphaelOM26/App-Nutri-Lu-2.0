// Mapeia as faixas Y dos nutrientes na pagina.
// Procura labels "(kcal)", "(g)", "Energia", "Carb", "G. Total", "Prot", "Fibr Tot"
// e reporta o Y de cada label + Y dos valores mais próximos.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';

const PDF_PATH = 'C:/Users/Usuário/Desktop/Macros/tabela-de-macros - sonia-tucunduva.pdf';
const PAGES = process.argv.slice(2).map(Number);
const data = new Uint8Array(await readFile(PDF_PATH));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

for (const p of PAGES) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  console.log(`\n=== Page ${p} ===`);
  // Labels que importam
  const labels = ['Energia', 'Carb', 'G. Total', 'G.Total', 'Prot', 'Fibr Tot', 'Fibr', '(kcal)', '(g)', '(mg)', '(mcg)', 'Col', 'G. Poli', 'G. Mono', 'G. Sat', 'Sat'];
  // Achar todos os labels (X grande pois ficam à direita da tabela, ou X pequeno se estão à esquerda)
  for (const it of tc.items) {
    const s = it.str.trim();
    if (labels.includes(s)) {
      const x = Math.round(it.transform[4]);
      const y = Math.round(it.transform[5]);
      console.log(`  "${s}" @ x=${x} y=${y}`);
    }
  }
}
