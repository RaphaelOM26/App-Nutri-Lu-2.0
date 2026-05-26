// Renderiza páginas específicas do PDF como imagens PNG (alta resolução).
// Saída em ./pages/page-NN.png.

import { Poppler } from 'node-poppler';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const PDF_PATH = process.env.PDF_PATH || 'C:/Users/Usuário/Desktop/Macros/tabela-de-macros - sonia-tucunduva.pdf';
const OUT_DIR = 'C:/tmp/nutri-pdf-pages';
const PAGES = process.argv.slice(2).map(Number);
if (PAGES.length === 0) {
  console.error('Uso: node render-pages.mjs <pageNum> [pageNum...]');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const poppler = new Poppler();

for (const p of PAGES) {
  const outPath = `${OUT_DIR}/page-${String(p).padStart(3, '0')}`;
  const opts = {
    firstPageToConvert: p,
    lastPageToConvert: p,
    pngFile: true,
    resolutionXAxis: Number(process.env.DPI || 200),
    resolutionYAxis: Number(process.env.DPI || 200),
  };
  await poppler.pdfToCairo(PDF_PATH, outPath, opts);
  console.log(`Rendered page ${p} → ${outPath}-*.png`);
}
