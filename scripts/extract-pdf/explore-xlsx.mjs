// Explora estrutura do XLSX da TACO: lista sheets, mostra header + amostra de linhas.

import XLSX from 'xlsx';

const PATH = 'C:/Users/Usuário/Desktop/Macros/Taco-4a-Edicao.xlsx';
const wb = XLSX.readFile(PATH);

console.log('Sheets:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const sheet = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  console.log(`\n=== Sheet "${name}" (${rows.length} rows) ===`);
  // Mostra primeiras 8 linhas
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const r = rows[i] || [];
    console.log(`row ${String(i).padStart(3)}: [${r.length}] ${JSON.stringify(r).slice(0, 250)}`);
  }
  // Mostra também uma linha do meio
  if (rows.length > 20) {
    console.log(`...`);
    const mid = Math.floor(rows.length / 2);
    console.log(`row ${mid}: ${JSON.stringify(rows[mid]).slice(0, 250)}`);
  }
}
