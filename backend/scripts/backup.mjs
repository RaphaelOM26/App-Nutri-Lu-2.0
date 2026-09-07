#!/usr/bin/env node
// Backup do banco de produção numa pasta local — o caminho da máquina dele.
//
//   node --env-file=.env scripts/backup.mjs
//   node --env-file=.env scripts/backup.mjs --destino "D:/Backups/NutriLu"
//   node --env-file=.env scripts/backup.mjs --manter 30
//
// Agendado pelo Windows via scripts/agendar-backup.ps1. O irmão dele é o
// scripts/backup-remoto.mjs, que roda no Railway e guarda no GitHub privado —
// os dois usam o MESMO gerador (src/services/backup.js), então tabela nova
// entra nos dois de uma vez.
//
// Por que JSON e não pg_dump: a máquina onde isto roda não tem cliente do
// Postgres instalado, e a restauração por query parametrizada elimina a classe
// inteira de bugs de escape que um dump SQL escrito à mão traria.
//
// ⚠️ O destino tem que ficar FORA do Railway. Cópia no mesmo provedor que o
// original não é backup — é a mesma falha, duas vezes.

import fs from 'node:fs';
import path from 'node:path';
import { getPool } from '../src/db.js';
import { gerarDump, nomeDoArquivo } from '../src/services/backup.js';

const arg = (nome, padrao) => {
  const i = process.argv.indexOf(nome);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
};

const DESTINO = arg('--destino', process.env.BACKUP_DIR || './backups');
const MANTER = Number(arg('--manter', process.env.BACKUP_MANTER || 14));

/** Apaga os mais antigos, mantendo os N mais recentes. */
function rotacionar(dir, manter) {
  const antigos = fs
    .readdirSync(dir)
    .filter((f) => /^nutrilu_.*\.json\.gz$/.test(f))
    .sort()
    .reverse()
    .slice(manter);
  for (const f of antigos) fs.unlinkSync(path.join(dir, f));
  return antigos.length;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL ausente. Rode com: node --env-file=.env scripts/backup.mjs');
    process.exit(1);
  }

  fs.mkdirSync(DESTINO, { recursive: true });
  const pool = getPool();
  const { conteudo, resumo } = await gerarDump(pool, (l) => console.log(l));
  await pool.end();

  const arquivo = path.join(DESTINO, nomeDoArquivo());
  fs.writeFileSync(arquivo, conteudo);
  const apagados = rotacionar(DESTINO, MANTER);

  console.log(`\nok — ${resumo}`);
  console.log(`     ${arquivo}`);
  console.log(`     verificado lendo de volta${apagados ? `, ${apagados} backup(s) antigo(s) apagado(s)` : ''}`);
}

main().catch((e) => {
  console.error('backup falhou:', e.message);
  process.exit(1);
});
