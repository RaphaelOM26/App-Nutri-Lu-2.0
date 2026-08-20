#!/usr/bin/env node
// Relatório de uso da OpenAI: o que cada feature consome e quem consome.
//
//   node scripts/relatorio-uso.mjs                # últimos 30 dias
//   node scripts/relatorio-uso.mjs --dias 7
//   node scripts/relatorio-uso.mjs --dias 1 --usuarios
//
// Os TOKENS vêm do banco (medição). O DINHEIRO só aparece se você informar os
// preços, porque preço não é medição — é dado do painel da OpenAI, muda sem
// aviso e varia por modelo. Número de custo chutado dentro do código viraria
// decisão de precificação errada com cara de fato.
//
// Preços via variável de ambiente PRECOS_OPENAI, em dólar:
//   • texto: por 1 MILHÃO de tokens (é como a OpenAI publica)
//   • imagem: por imagem gerada
//
//   PRECOS_OPENAI='{"gpt-5.4":{"in":1.25,"cached":0.125,"out":10},
//                   "gpt-5.4-mini":{"in":0.25,"cached":0.025,"out":2},
//                   "gpt-image-1":{"imagem":0.043}}'
//
// Sem PRECOS_OPENAI o relatório sai só com os tokens — que já respondem
// "qual feature consome mais" e "quem consome demais".

import 'dotenv/config';
import { getPool } from '../src/db.js';

const arg = (nome, padrao) => {
  const i = process.argv.indexOf(nome);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
};
const dias = Number(arg('--dias', 30));
const mostrarUsuarios = process.argv.includes('--usuarios');

let precos = null;
try {
  if (process.env.PRECOS_OPENAI) precos = JSON.parse(process.env.PRECOS_OPENAI);
} catch {
  console.error('⚠ PRECOS_OPENAI não é um JSON válido — seguindo só com tokens.\n');
}

// Custo de uma linha agregada. Token em cache é cobrado à parte e bem mais
// barato; sem descontá-lo do input a conta sai inflada, e os system prompts
// daqui são grandes e repetidos (justamente o que mais cacheia).
function custo({ modelo, input, cached, output, imagens }) {
  const p = precos?.[modelo];
  if (!p) return null;
  const naoCacheado = Math.max(0, (input || 0) - (cached || 0));
  return (
    (naoCacheado / 1e6) * (p.in || 0) +
    ((cached || 0) / 1e6) * (p.cached ?? p.in ?? 0) +
    ((output || 0) / 1e6) * (p.out || 0) +
    (imagens || 0) * (p.imagem || 0)
  );
}

const usd = (v) => (v == null ? '—' : '$' + v.toFixed(v < 1 ? 4 : 2));
const num = (v) => (v == null ? '—' : Number(v).toLocaleString('pt-BR'));

const pool = getPool();

const { rows } = await pool.query(
  `SELECT rota, modelo, tipo,
          COUNT(*)                          AS chamadas,
          COUNT(*) FILTER (WHERE NOT ok)    AS falhas,
          SUM(input_tokens)                 AS input,
          SUM(cached_tokens)                AS cached,
          SUM(output_tokens)                AS output,
          SUM(imagens)                      AS imagens,
          ROUND(AVG(ms))                    AS ms_medio
     FROM ai_usage
    WHERE criado_em > NOW() - ($1 || ' days')::INTERVAL
    GROUP BY rota, modelo, tipo
    ORDER BY COUNT(*) DESC`,
  [String(dias)],
);

console.log(`\n═══ Uso da OpenAI — últimos ${dias} dia(s) ═══\n`);

if (!rows.length) {
  console.log('Nenhuma chamada registrada no período.');
  console.log('(Se o backend acabou de subir com a contabilidade, é esperado.)\n');
  await pool.end();
  process.exit(0);
}

let totalCusto = 0;
let algumSemPreco = false;

for (const r of rows) {
  const n = Number(r.chamadas);
  const c = custo({
    modelo: r.modelo,
    input: Number(r.input || 0),
    cached: Number(r.cached || 0),
    output: Number(r.output || 0),
    imagens: Number(r.imagens || 0),
  });
  if (c == null) algumSemPreco = true;
  else totalCusto += c;

  console.log(`${r.rota}  [${r.modelo || 'modelo desconhecido'}]`);
  console.log(`  chamadas ....... ${num(n)}${Number(r.falhas) ? `  (${r.falhas} falharam)` : ''}`);
  if (r.tipo === 'imagem') {
    console.log(`  imagens ........ ${num(r.imagens)}`);
  } else {
    const cachePct = Number(r.input) ? Math.round((Number(r.cached || 0) / Number(r.input)) * 100) : 0;
    console.log(`  tokens entrada . ${num(r.input)}  (${cachePct}% em cache)`);
    console.log(`  tokens saída ... ${num(r.output)}`);
  }
  console.log(`  latência média . ${num(r.ms_medio)} ms`);
  if (c != null) {
    console.log(`  custo .......... ${usd(c)}   →  ${usd(c / n)} por chamada`);
  }
  console.log('');
}

if (precos) {
  console.log('───────────────────────────────────');
  console.log(`TOTAL no período: ${usd(totalCusto)}`);
  if (algumSemPreco) {
    console.log('⚠ Há modelos sem preço em PRECOS_OPENAI — o total está INCOMPLETO.');
  }
  console.log('Preços informados por você, não medidos pelo app.');
} else {
  console.log('───────────────────────────────────');
  console.log('Sem custo em dólar: defina PRECOS_OPENAI pra converter (ver topo do arquivo).');
}

if (mostrarUsuarios) {
  const { rows: tops } = await pool.query(
    `SELECT COALESCE(user_id::TEXT, 'anônimo/' || COALESCE(device_id, 'sem id')) AS quem,
            COUNT(*) AS chamadas,
            SUM(COALESCE(input_tokens,0) + COALESCE(output_tokens,0)) AS tokens,
            SUM(COALESCE(imagens,0)) AS imagens
       FROM ai_usage
      WHERE criado_em > NOW() - ($1 || ' days')::INTERVAL
      GROUP BY 1
      ORDER BY 3 DESC NULLS LAST
      LIMIT 10`,
    [String(dias)],
  );
  console.log(`\n═══ Quem mais consumiu (top 10) ═══\n`);
  for (const t of tops) {
    console.log(`${t.quem}`);
    console.log(`  ${num(t.chamadas)} chamadas · ${num(t.tokens)} tokens · ${num(t.imagens)} imagens`);
  }
}

console.log('');
await pool.end();
