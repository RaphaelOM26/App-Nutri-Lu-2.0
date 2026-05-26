// Converte TACO 4ª edição (XLSX) em JSON limpo com macros essenciais.
// Schema final: { id, name, group, kcal, p (proteína g), c (carb g), f (gordura g), fiber (g) }, por 100g.
//
// Colunas do sheet "CMVCol taco3" (0-indexed):
//   0: Número do alimento
//   1: Descrição do alimento
//   2: Umidade (%)
//   3: Energia (kcal)
//   4: Energia (kJ)
//   5: Proteína (g)
//   6: Lipídeos (g) — gordura
//   7: Colesterol (mg)
//   8: Carboidrato (g)
//   9: Fibra alimentar (g)
//  10: Cinzas (g)

import XLSX from 'xlsx';
import { writeFile } from 'node:fs/promises';

const PATH = 'C:/Users/Usuário/Desktop/Macros/Taco-4a-Edicao.xlsx';
const OUT_JSON = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/scripts/extract-pdf/taco.json';
const OUT_TS = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/mobile/src/data/taco.ts';

const wb = XLSX.readFile(PATH);
const sheet = wb.Sheets['CMVCol taco3'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

// Função pra normalizar valores: número se possível, null se "NA" ou vazio
function num(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Math.round(v * 100) / 100; // 2 casas
  const s = String(v).trim();
  if (!s || s === 'NA' || s === 'Tr' || s === '*') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const foods = [];
let currentGroup = '';
let skippedNoEnergy = 0;
let groupsSeen = [];

for (let i = 3; i < rows.length; i++) {
  const r = rows[i];
  if (!r) continue;
  const id = r[0];
  const desc = r[1];

  // Linha vazia
  if (!desc || (typeof desc !== 'string')) continue;

  // Linha de grupo: id vazio, desc preenchido
  if (id === null || id === '' || id === undefined) {
    currentGroup = desc.trim();
    if (currentGroup && !groupsSeen.includes(currentGroup)) groupsSeen.push(currentGroup);
    continue;
  }

  // Linha de alimento
  const kcal = num(r[3]);
  if (kcal === null) { skippedNoEnergy++; continue; }

  foods.push({
    id: typeof id === 'number' ? id : Number(id),
    name: desc.trim(),
    group: currentGroup,
    kcal,
    p: num(r[5]),       // proteína g
    c: num(r[8]),       // carboidrato g
    f: num(r[6]),       // gordura g
    fiber: num(r[9]),   // fibra alimentar g
  });
}

console.log(`Alimentos extraídos: ${foods.length}`);
console.log(`Pulados (sem energia): ${skippedNoEnergy}`);
console.log(`Grupos encontrados (${groupsSeen.length}):`);
groupsSeen.forEach(g => console.log(`  - ${g}`));

// Amostras
console.log('\nAmostras (primeiros 3, últimos 3):');
foods.slice(0, 3).concat(foods.slice(-3)).forEach(f => console.log(`  ${String(f.id).padStart(3)} | ${f.name.slice(0, 50).padEnd(50)} | ${String(f.kcal).padStart(6)} kcal | P${f.p} C${f.c} F${f.f}`));

// Valida alguns conhecidos
const validate = ['Arroz, integral, cozido', 'Feijão, preto, cozido', 'Banana, prata, crua', 'Frango, peito, sem pele, grelhado'];
console.log('\nValidação cruzada:');
for (const target of validate) {
  const found = foods.find(f => f.name.toLowerCase().includes(target.toLowerCase().split(',')[0]) && (target.split(',').slice(1).every(part => f.name.toLowerCase().includes(part.trim().toLowerCase()))));
  if (found) console.log(`  ✓ "${found.name}" → ${found.kcal} kcal, P${found.p} C${found.c} F${found.f}`);
  else console.log(`  ✗ "${target}" — NÃO ACHADO`);
}

// Salva JSON
await writeFile(OUT_JSON, JSON.stringify(foods, null, 2));
console.log(`\nJSON salvo: ${OUT_JSON}`);

// Salva também como módulo TS no formato `Food[]` consumido pelo AppContext.
// Mapeia para o tipo Food existente (em mockData.ts) — sem precisar de adaptador em runtime.
function firstKeyword(name) {
  // Usa a primeira palavra significativa pra buscar imagem no Unsplash
  return name.split(',')[0].trim().toLowerCase().split(/\s+/)[0] || 'food';
}

const asFoodArr = foods.map(t => ({
  id: `taco-${t.id}`,
  name: t.name,
  brand: 'TACO',
  portion: '100g',
  kcal: Math.round(t.kcal),
  p: Math.round((t.p ?? 0) * 10) / 10,
  c: Math.round((t.c ?? 0) * 10) / 10,
  f: Math.round((t.f ?? 0) * 10) / 10,
  q: firstKeyword(t.name),
  fav: false,
}));

const tsContent = `// Auto-gerado por scripts/extract-pdf/taco-to-json.mjs — NÃO EDITE À MÃO.
// Fonte: TACO 4ª edição (NEPA/Unicamp, 2011). Valores por 100g de parte comestível.
// ${asFoodArr.length} alimentos.

import type { Food } from './mockData';

export const TACO_FOODS: Food[] = ${JSON.stringify(asFoodArr, null, 2)};
`;
await writeFile(OUT_TS, tsContent);
console.log(`TS salvo: ${OUT_TS} (${asFoodArr.length} alimentos)`);
