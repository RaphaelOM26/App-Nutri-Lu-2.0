#!/usr/bin/env node
// Backup rodando NO Railway, guardado FORA do Railway.
//
// É o que o serviço agendado executa. O destino é um repositório PRIVADO do
// GitHub, gravado pela API — sem git, sem clone, um PUT e pronto.
//
// Por que o GitHub e não um bucket: ele já tem conta, é de graça, o arquivo é
// pequeno (KB), e cada backup vira um commit — ou seja, histórico e data de
// cada cópia saem de brinde. Se um dia o dump passar de alguns MB por dia,
// troque por S3/R2; a única parte que muda é a função `enviar`.
//
// ⚠️ O repositório TEM que ser privado. O dump traz e-mail de cliente, compra e
// o conteúdo da comunidade. O script recusa rodar se o repo for público.
//
// Variáveis (no serviço do Railway):
//   DATABASE_URL        — referência ao Postgres
//   BACKUP_REPO         — "usuario/repositorio-privado"
//   BACKUP_TOKEN        — token do GitHub com permissão de conteúdo nesse repo
//   BACKUP_MANTER       — quantos arquivos manter (padrão 30)

import { getPool } from '../src/db.js';
import { gerarDump, nomeDoArquivo } from '../src/services/backup.js';

const REPO = process.env.BACKUP_REPO;
const TOKEN = process.env.BACKUP_TOKEN;
const MANTER = Number(process.env.BACKUP_MANTER || 30);
const PASTA = 'backups';

const api = async (caminho, opcoes = {}) => {
  const r = await fetch(`https://api.github.com${caminho}`, {
    ...opcoes,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'nutri-lu-backup',
      ...(opcoes.headers || {}),
    },
  });
  if (!r.ok && r.status !== 404) {
    throw new Error(`GitHub ${r.status} em ${caminho}: ${(await r.text()).slice(0, 200)}`);
  }
  return r.status === 404 ? null : r.json();
};

/** Apaga os mais antigos, mantendo os N mais recentes. */
async function rotacionar() {
  const lista = await api(`/repos/${REPO}/contents/${PASTA}`);
  if (!Array.isArray(lista)) return 0;
  const antigos = lista
    .filter((f) => f.name.endsWith('.json.gz'))
    .sort((a, b) => b.name.localeCompare(a.name))
    .slice(MANTER);
  for (const f of antigos) {
    await api(`/repos/${REPO}/contents/${PASTA}/${f.name}`, {
      method: 'DELETE',
      body: JSON.stringify({ message: `rotação: remove ${f.name}`, sha: f.sha }),
    });
  }
  return antigos.length;
}

async function main() {
  for (const [nome, valor] of [['BACKUP_REPO', REPO], ['BACKUP_TOKEN', TOKEN]]) {
    if (!valor) {
      console.error(`${nome} ausente — configure no serviço do Railway.`);
      process.exit(1);
    }
  }

  // Um dump em repositório público seria vazamento de dado de cliente. Melhor
  // falhar barulhento agora do que descobrir depois.
  const repo = await api(`/repos/${REPO}`);
  if (!repo) throw new Error(`repositório ${REPO} não encontrado — confira o nome e a permissão do token`);
  if (!repo.private) throw new Error(`${REPO} é PÚBLICO. Backup só vai pra repositório privado.`);

  const pool = getPool();
  const { conteudo, resumo } = await gerarDump(pool, (l) => console.log(l));
  await pool.end();

  const arquivo = nomeDoArquivo();
  await api(`/repos/${REPO}/contents/${PASTA}/${arquivo}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `backup ${arquivo} — ${resumo}`,
      content: conteudo.toString('base64'),
    }),
  });

  const apagados = await rotacionar();
  console.log(`\nok — ${resumo}`);
  console.log(`     ${REPO}/${PASTA}/${arquivo}${apagados ? ` (${apagados} antigo(s) removido(s))` : ''}`);
}

main().catch((e) => {
  console.error('backup remoto falhou:', e.message);
  process.exit(1);
});
