// Harness de teste de precisão da Foto IA (#4).
// Roda um conjunto de fotos pela MESMA configuração do endpoint /analyze-food
// (prompt + schema atuais em src/services/openai.js) e imprime as estimativas.
// Se houver um expected.json com o peso/kcal reais, calcula o ERRO — é assim
// que medimos "melhorou ou não" ANTES de publicar pros 20.
//
// Uso (no diretório backend/):
//   1. Coloque fotos em scripts/food-test/  (jpg/png)
//   2. (opcional) crie scripts/food-test/expected.json com o ground truth:
//        { "cebolas.jpg": { "grams": 485 }, "prato.jpg": { "kcal": 650 } }
//   3. node scripts/test-analyze-food.mjs
//
// Cada foto custa ~1 chamada de visão na OpenAI (~US$0.01). Usa a OPENAI_API_KEY
// do .env. NÃO afeta produção — só roda local.

import 'dotenv/config';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { openai, FOOD_MODEL as MODEL, FOOD_SYSTEM_PROMPT, FOOD_ANALYSIS_SCHEMA } from '../src/services/openai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = process.argv[2] || join(__dirname, 'food-test');
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

async function analyze(imgPath) {
  const buf = await readFile(imgPath);
  const ext = extname(imgPath).toLowerCase();
  const dataUrl = `data:${MIME[ext] || 'image/jpeg'};base64,${buf.toString('base64')}`;
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: FOOD_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Identifique os alimentos neste prato e estime os macros conforme o schema.' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    response_format: { type: 'json_schema', json_schema: FOOD_ANALYSIS_SCHEMA },
  });
  return JSON.parse(completion.choices[0]?.message?.content || '{}');
}

function pct(estimate, real) {
  if (!real) return null;
  return Math.round((Math.abs(estimate - real) / real) * 100);
}

async function main() {
  console.log(`\n🍽  Teste de precisão da Foto IA — modelo: ${MODEL}\n   Pasta: ${DIR}\n`);

  let expected = {};
  try {
    expected = JSON.parse(await readFile(join(DIR, 'expected.json'), 'utf8'));
  } catch {
    console.log('   (sem expected.json — só vou imprimir as estimativas, sem calcular erro)\n');
  }

  let files;
  try {
    files = (await readdir(DIR)).filter((f) => MIME[extname(f).toLowerCase()]);
  } catch {
    console.error(`❌ Não achei a pasta ${DIR}. Crie-a e ponha fotos (jpg/png) lá.`);
    process.exit(1);
  }
  if (files.length === 0) {
    console.error(`❌ Nenhuma imagem em ${DIR}. Ponha fotos de comida (jpg/png).`);
    process.exit(1);
  }

  const errors = [];
  for (const file of files) {
    const r = await analyze(join(DIR, file));
    const gramsTotal = (r.items || []).reduce((s, it) => s + (it.portion_grams || 0), 0);
    console.log(`── ${file} ─────────────────────────────`);
    console.log(`   escala: ${r.scale_reference || '—'}`);
    for (const it of r.items || []) {
      const u = it.unit_count != null ? `${it.unit_count} un · ` : '';
      console.log(`   • ${it.name}: ${u}${Math.round(it.portion_grams)}g · ${Math.round(it.kcal)}kcal  ⟨${it.size_estimate || ''}⟩`);
    }
    console.log(`   TOTAL: ${Math.round(gramsTotal)}g · ${Math.round(r.total?.kcal || 0)}kcal · confiança ${r.confidence}`);

    const exp = expected[file];
    if (exp) {
      const eg = pct(gramsTotal, exp.grams);
      const ek = pct(r.total?.kcal || 0, exp.kcal);
      const parts = [];
      if (eg != null) { parts.push(`gramas ${eg}% (real ${exp.grams}g)`); errors.push(eg); }
      if (ek != null) { parts.push(`kcal ${ek}% (real ${exp.kcal})`); errors.push(ek); }
      console.log(`   ⮕ ERRO: ${parts.join(' · ')}`);
    }
    console.log('');
  }

  if (errors.length) {
    const avg = Math.round(errors.reduce((a, b) => a + b, 0) / errors.length);
    console.log(`═══ ERRO MÉDIO: ${avg}%  (meta: < 20%) ═══\n`);
  }
}

main().catch((e) => {
  console.error('Falhou:', e.message);
  process.exit(1);
});
