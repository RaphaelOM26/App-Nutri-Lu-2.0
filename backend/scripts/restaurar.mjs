#!/usr/bin/env node
// Restauração a partir de um backup gerado por scripts/backup.mjs.
//
//   node --env-file=.env scripts/restaurar.mjs backups/nutrilu_2026-09-03_1420.json.gz
//        → só mostra o que faria (simulação)
//
//   node --env-file=.env scripts/restaurar.mjs <arquivo> --confirmar
//        → restaura, recusando qualquer tabela que já tenha linhas
//
//   node --env-file=.env scripts/restaurar.mjs <arquivo> --confirmar --sobrescrever
//        → APAGA e regrava. Só num banco que você quer mesmo substituir.
//
// Este script existe porque backup sem restauração testada é um arquivo, não um
// backup. O dia de descobrir que a restauração não funciona não pode ser o dia
// do desastre — rode uma vez contra um banco vazio de teste e durma melhor.
//
// Roda tudo em UMA transação: ou entra completo, ou não entra nada.

import fs from 'node:fs';
import zlib from 'node:zlib';
import { getPool } from '../src/db.js';

const ARQUIVO = process.argv[2];
const CONFIRMAR = process.argv.includes('--confirmar');
const SOBRESCREVER = process.argv.includes('--sobrescrever');

/**
 * Ordena as tabelas para que nenhuma entre antes daquela de quem ela depende.
 * Sem isso, inserir `community_recipes` antes de `users` estoura a chave
 * estrangeira — e a ordem alfabética acerta isso por acaso, não por desenho.
 */
async function ordenarPorDependencia(pool, tabelas) {
  const { rows } = await pool.query(`
    SELECT c.conrelid::regclass::text AS filha,
           c.confrelid::regclass::text AS pai
      FROM pg_constraint c
     WHERE c.contype = 'f'
  `);
  const deps = new Map(tabelas.map((t) => [t, new Set()]));
  for (const { filha, pai } of rows) {
    // Auto-referência (ex: users.device_id) não cria ordem entre tabelas.
    if (filha === pai) continue;
    if (deps.has(filha) && deps.has(pai)) deps.get(filha).add(pai);
  }

  const ordenadas = [];
  const restantes = new Set(tabelas);
  while (restantes.size) {
    const prontas = [...restantes].filter((t) => [...deps.get(t)].every((p) => ordenadas.includes(p)));
    if (prontas.length === 0) {
      // Ciclo de FK: devolve o resto na ordem original e deixa o banco reclamar
      // com uma mensagem melhor que a minha.
      ordenadas.push(...restantes);
      break;
    }
    for (const t of prontas) {
      ordenadas.push(t);
      restantes.delete(t);
    }
  }
  return ordenadas;
}

async function main() {
  if (!ARQUIVO || !fs.existsSync(ARQUIVO)) {
    console.error('uso: node --env-file=.env scripts/restaurar.mjs <arquivo.json.gz> [--confirmar] [--sobrescrever]');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ausente.');
    process.exit(1);
  }

  const dump = JSON.parse(zlib.gunzipSync(fs.readFileSync(ARQUIVO)).toString());
  const pool = getPool();
  const tabelas = await ordenarPorDependencia(pool, Object.keys(dump.tabelas));

  console.log(`backup de ${dump.gerado_em}`);
  console.log(`banco de destino: ${(process.env.DATABASE_URL.split('@')[1] || '').split('/')[0] || '(oculto)'}\n`);

  // Fotografia do destino antes de tocar em nada.
  const ocupadas = [];
  for (const t of tabelas) {
    let atuais = 0;
    try {
      atuais = Number((await pool.query(`SELECT count(*)::int AS n FROM "${t}"`)).rows[0].n);
    } catch {
      console.log(`  ${t.padEnd(20)} tabela não existe no destino — será pulada`);
      continue;
    }
    const doBackup = dump.tabelas[t].length;
    console.log(`  ${t.padEnd(20)} destino ${String(atuais).padStart(6)}  ←  backup ${String(doBackup).padStart(6)}`);
    if (atuais > 0) ocupadas.push(t);
  }

  if (!CONFIRMAR) {
    console.log('\nsimulação — nada foi alterado. Reveja os números e rode de novo com --confirmar.');
    await pool.end();
    return;
  }
  if (ocupadas.length && !SOBRESCREVER) {
    console.error(`\nRECUSADO: já existem linhas em ${ocupadas.join(', ')}.`);
    console.error('Restaurar por cima duplicaria ou estouraria chave. Use --sobrescrever se é isso mesmo que você quer.');
    process.exit(1);
  }

  const cliente = await pool.connect();
  let inseridas = 0;
  try {
    await cliente.query('BEGIN');
    if (SOBRESCREVER) {
      // Ordem inversa da dependência: filha some antes da mãe.
      for (const t of [...tabelas].reverse()) {
        try {
          await cliente.query(`DELETE FROM "${t}"`);
        } catch { /* tabela inexistente no destino */ }
      }
    }
    for (const t of tabelas) {
      const linhas = dump.tabelas[t];
      if (!linhas?.length) continue;
      const colunas = Object.keys(linhas[0]);
      const lista = colunas.map((c) => `"${c}"`).join(', ');
      const marcadores = colunas.map((_, i) => `$${i + 1}`).join(', ');
      for (const linha of linhas) {
        await cliente.query(
          `INSERT INTO "${t}" (${lista}) VALUES (${marcadores})`,
          colunas.map((c) => linha[c]),
        );
        inseridas++;
      }
    }
    await cliente.query('COMMIT');
  } catch (e) {
    await cliente.query('ROLLBACK');
    console.error(`\nfalhou e nada foi gravado (rollback): ${e.message}`);
    process.exit(1);
  } finally {
    cliente.release();
  }

  console.log(`\nok — ${inseridas} linha(s) restauradas em ${tabelas.length} tabela(s).`);
  await pool.end();
}

main().catch((e) => {
  console.error('restauração falhou:', e.message);
  process.exit(1);
});
