// Harness de teste de precisão da Foto IA (#4).
// Roda um conjunto de fotos pela MESMA configuração do endpoint /analyze-food
// (prompt + schema atuais em src/services/openai.js) e imprime as estimativas.
// Com um expected.json (peso real do prato e, desde 25/09/2026, o peso de CADA
// item) calcula o erro do total, a taxa de identificação e o erro por item —
// é assim que medimos "melhorou ou não" ANTES de publicar.
//
// Uso (no diretório backend/):
//   node scripts/test-analyze-food.mjs [pasta] [--rodadas N] [--json saida.json]
//   OPENAI_FOOD_MODEL=gpt-5.4 node scripts/test-analyze-food.mjs   (outro modelo)
//
// expected.json:
//   { "prato.jpg": { "grams": 346, "items": [ { "name": "abóbora", "grams": 123,
//                     "alias": ["abobora", "moranga"] }, ... ] } }
//   `alias` são pedaços (sem acento, minúsculo) que o nome dado pelo modelo
//   precisa conter pra contar como "identificou". Sem `items`, só o total.
//
// Cada foto custa 1 chamada de visão na OpenAI. Usa a OPENAI_API_KEY do .env.
// NÃO afeta produção — só roda local.

import 'dotenv/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { openai, FOOD_MODEL as MODEL, FOOD_SYSTEM_PROMPT, FOOD_ANALYSIS_SCHEMA } from '../src/services/openai.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (nome, padrao) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : padrao; };
const DIR = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--rodadas' && args[args.indexOf(a) - 1] !== '--json') || join(__dirname, 'food-test');
const RODADAS = Math.max(1, parseInt(opt('--rodadas', '1'), 10) || 1);
const SAIDA = opt('--json', null);
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

async function analyze(imgPath) {
  const buf = await readFile(imgPath);
  const ext = extname(imgPath).toLowerCase();
  const dataUrl = `data:${MIME[ext] || 'image/jpeg'};base64,${buf.toString('base64')}`;
  const t0 = Date.now();
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
  const u = completion.usage || {};
  return {
    r: JSON.parse(completion.choices[0]?.message?.content || '{}'),
    ms: Date.now() - t0,
    tokens: { in: u.prompt_tokens || 0, out: u.completion_tokens || 0, reasoning: u.completion_tokens_details?.reasoning_tokens || 0 },
  };
}

const pct = (estimate, real) => (real ? Math.round((Math.abs(estimate - real) / real) * 100) : null);
const media = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Casa os itens esperados com os itens do modelo pelo alias. Cada item do
 * modelo só casa uma vez; se dois casam, fica o de gramatura mais próxima.
 * Devolve { casados: [{esperado, item, erro}], perdidos: [esperado], sobras: [item] }.
 */
function casarItens(esperados, itens) {
  const livres = itens.map((it, i) => ({ ...it, _i: i, _n: norm(it.name) }));
  const casados = [], perdidos = [];
  for (const e of esperados) {
    const aliases = (e.alias || [norm(e.name)]).map(norm);
    const cand = livres.filter((it) => aliases.some((a) => it._n.includes(a)));
    if (!cand.length) { perdidos.push(e); continue; }
    cand.sort((a, b) => Math.abs(a.portion_grams - e.grams) - Math.abs(b.portion_grams - e.grams));
    const it = cand[0];
    livres.splice(livres.indexOf(it), 1);
    casados.push({ esperado: e, item: it, erro: pct(it.portion_grams, e.grams) });
  }
  return { casados, perdidos, sobras: livres };
}

async function main() {
  console.log(`\n🍽  Teste de precisão da Foto IA — modelo: ${MODEL} · rodadas: ${RODADAS}\n   Pasta: ${DIR}\n`);

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

  // Acumuladores do conjunto (todas as rodadas juntas) e por rodada (variação).
  const porRodada = [];
  const registros = [];
  for (let rodada = 1; rodada <= RODADAS; rodada++) {
    const acc = { total: [], item: [], identificados: 0, esperados: 0, sobras: 0, tokensIn: [], tokensOut: [], reasoning: [], ms: [] };
    if (RODADAS > 1) console.log(`━━━━━━━━━━━━━━━━━━━━ RODADA ${rodada} ━━━━━━━━━━━━━━━━━━━━\n`);
    for (const file of files) {
      const { r, ms, tokens } = await analyze(join(DIR, file));
      const itens = Array.isArray(r.items) ? r.items : [];
      const gramsTotal = itens.reduce((s, it) => s + (it.portion_grams || 0), 0);
      acc.tokensIn.push(tokens.in); acc.tokensOut.push(tokens.out); acc.reasoning.push(tokens.reasoning); acc.ms.push(ms);
      console.log(`── ${file} ─────────────────────────────`);
      console.log(`   escala: ${r.scale_reference || '—'}`);
      for (const it of itens) {
        const u = it.unit_count != null ? `${it.unit_count} un · ` : '';
        console.log(`   • ${it.name}: ${u}${Math.round(it.portion_grams)}g${it.medida_caseira ? ` (${it.medida_caseira})` : ''} · ${Math.round(it.kcal)}kcal  ⟨${it.size_estimate || ''}⟩`);
      }
      console.log(`   TOTAL: ${Math.round(gramsTotal)}g · ${Math.round(r.total?.kcal || 0)}kcal · confiança ${r.confidence} · ${(ms / 1000).toFixed(1)}s · tokens ${tokens.in}+${tokens.out}${tokens.reasoning ? ` (${tokens.reasoning} raciocínio)` : ''}`);

      const exp = expected[file];
      const reg = { rodada, file, modelo: MODEL, gramsTotal: Math.round(gramsTotal), kcal: Math.round(r.total?.kcal || 0), confianca: r.confidence, ms, tokens, itens: itens.map((it) => ({ name: it.name, grams: Math.round(it.portion_grams), kcal: Math.round(it.kcal) })) };
      if (exp) {
        const eg = pct(gramsTotal, exp.grams);
        if (eg != null) { acc.total.push(eg); reg.erroTotal = eg; }
        const partes = [];
        if (eg != null) partes.push(`total ${eg}% (real ${exp.grams}g)`);
        if (Array.isArray(exp.items) && exp.items.length) {
          const { casados, perdidos, sobras } = casarItens(exp.items, itens);
          acc.esperados += exp.items.length; acc.identificados += casados.length; acc.sobras += sobras.length;
          for (const c of casados) acc.item.push(c.erro);
          reg.itensEsperados = exp.items.length; reg.identificados = casados.length; reg.sobras = sobras.map((s) => s.name);
          reg.porItem = casados.map((c) => ({ esperado: c.esperado.name, real: c.esperado.grams, modelo: c.item.name, estimado: Math.round(c.item.portion_grams), erro: c.erro }));
          reg.perdidos = perdidos.map((p) => p.name);
          partes.push(`identificou ${casados.length}/${exp.items.length}`);
          if (casados.length) partes.push(`erro por item ${media(casados.map((c) => c.erro))}%`);
          console.log(`   ⮕ ERRO: ${partes.join(' · ')}`);
          for (const c of casados) console.log(`      ${c.erro <= 25 ? '✔' : '✘'} ${c.esperado.name}: real ${c.esperado.grams}g → "${c.item.name}" ${Math.round(c.item.portion_grams)}g (${c.erro}%)`);
          for (const p of perdidos) console.log(`      ✘ ${p.name} (${p.grams}g): NÃO identificou`);
          for (const s of sobras) console.log(`      ⚠ item a mais: "${s.name}" ${Math.round(s.portion_grams)}g`);
        } else if (partes.length) {
          console.log(`   ⮕ ERRO: ${partes.join(' · ')}`);
        }
      }
      registros.push(reg);
      console.log('');
    }
    porRodada.push(acc);
  }

  // ── Resumo ──────────────────────────────────────────────────────────────
  const juntar = (k) => porRodada.flatMap((a) => a[k]);
  const somar = (k) => porRodada.reduce((s, a) => s + a[k], 0);
  const resumo = {
    modelo: MODEL, rodadas: RODADAS, fotos: files.length,
    erroTotalMedio: media(juntar('total')),
    erroTotalPorRodada: porRodada.map((a) => media(a.total)),
    identificacao: somar('esperados') ? Math.round((somar('identificados') / somar('esperados')) * 100) : null,
    identificados: somar('identificados'), esperados: somar('esperados'), itensAMais: somar('sobras'),
    erroItemMedio: media(juntar('item')),
    itensDentroDe25: juntar('item').length ? Math.round((juntar('item').filter((e) => e <= 25).length / juntar('item').length) * 100) : null,
    tokensInMedio: media(juntar('tokensIn')), tokensOutMedio: media(juntar('tokensOut')), raciocinioMedio: media(juntar('reasoning')),
    segundosMedio: media(juntar('ms')) != null ? +(media(juntar('ms')) / 1000).toFixed(1) : null,
  };
  console.log('═══════════════════════ RESUMO ═══════════════════════');
  console.log(`   modelo ${resumo.modelo} · ${resumo.fotos} fotos × ${resumo.rodadas} rodada(s)`);
  if (resumo.erroTotalMedio != null) console.log(`   erro do TOTAL: ${resumo.erroTotalMedio}% médio (por rodada: ${resumo.erroTotalPorRodada.join('% / ')}%)  — meta < 20%`);
  if (resumo.identificacao != null) {
    console.log(`   identificação: ${resumo.identificacao}% (${resumo.identificados}/${resumo.esperados} itens) · itens a mais: ${resumo.itensAMais}`);
    console.log(`   erro POR ITEM (dos identificados): ${resumo.erroItemMedio}% médio · ${resumo.itensDentroDe25}% dos itens dentro de ±25%`);
  }
  console.log(`   tokens por foto: ${resumo.tokensInMedio} entrada + ${resumo.tokensOutMedio} saída${resumo.raciocinioMedio ? ` (${resumo.raciocinioMedio} de raciocínio)` : ''} · ${resumo.segundosMedio}s por foto`);
  console.log('══════════════════════════════════════════════════════\n');

  if (SAIDA) {
    await writeFile(SAIDA, JSON.stringify({ resumo, registros }, null, 2));
    console.log(`   (detalhe gravado em ${SAIDA})\n`);
  }
}

main().catch((e) => {
  console.error('Falhou:', e.message);
  process.exit(1);
});
