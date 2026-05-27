// Dump completo de texto de cada PDF de receita.
// Produz um JSON com `{ totalPages, pages: [{ pageNum, lines: [string] }] }`
// pra eu (Claude) processar cada PDF estruturando as receitas em TypeScript.

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename } from 'node:path';

// Path com glob — robusto pra nomes com acento (Unicode encoding varies on Windows)
import { glob } from 'node:fs/promises';
const PDF_PATHS = [];
for await (const entry of glob('C:/Users/Usuário/Desktop/Receitas/*.pdf')) {
  PDF_PATHS.push(entry);
}

const OUT_DIR = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/scripts/extract-pdf/dumps';
await mkdir(OUT_DIR, { recursive: true });

for (const PDF_PATH of PDF_PATHS) {
  const fileBase = basename(PDF_PATH)
    .replace(/\.\.?pdf$/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
  const outPath = `${OUT_DIR}/${fileBase}.json`;
  console.log(`\n=== Processando: ${basename(PDF_PATH)} ===`);

  let data;
  try {
    data = new Uint8Array(await readFile(PDF_PATH));
  } catch (e) {
    console.error(`  ❌ Não consegui ler: ${e.message}`);
    continue;
  }

  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  console.log(`  Total páginas: ${doc.numPages}`);

  const pages = [];
  for (let pNum = 1; pNum <= doc.numPages; pNum++) {
    const page = await doc.getPage(pNum);
    const tc = await page.getTextContent();
    // Agrupa por linha (y aproximado) e ordena por x
    const rows = new Map();
    for (const it of tc.items) {
      if (!it.str.trim()) continue;
      const y = Math.round(it.transform[5]);
      const x = it.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push({ x, str: it.str });
    }
    const ys = [...rows.keys()].sort((a, b) => b - a);
    const lines = ys.map((y) =>
      rows.get(y).sort((a, b) => a.x - b.x).map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim(),
    ).filter((l) => l.length > 0);
    pages.push({ pageNum: pNum, lines });
  }

  await writeFile(outPath, JSON.stringify({ source: basename(PDF_PATH), totalPages: doc.numPages, pages }, null, 2), 'utf-8');
  console.log(`  ✓ Dump salvo em ${outPath}`);
}

console.log('\n=== Tudo processado ===');
