// Geração do dump do banco. Compartilhada pelos dois caminhos de backup:
// o script local (scripts/backup.mjs, agendado na máquina) e o serviço
// agendado do Railway (scripts/backup-remoto.mjs).
//
// Existe como serviço, e não duplicada nos dois scripts, porque o dia que uma
// tabela nova entrar os dois precisam enxergá-la — e é exatamente o tipo de
// coisa que se atualiza num lugar e esquece no outro.

import zlib from 'node:zlib';

/**
 * Tabelas do app. DESCOBERTAS do catálogo, nunca listadas à mão: uma lista fixa
 * envelheceria em silêncio no dia que as tabelas de plano e anamnese entrarem,
 * e o backup seguiria "funcionando" sem elas.
 */
export async function listarTabelas(pool) {
  const { rows } = await pool.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
     ORDER BY table_name
  `);
  return rows.map((r) => r.table_name);
}

/**
 * Lê o banco inteiro e devolve o arquivo já comprimido, junto do resumo.
 *
 * Verifica antes de devolver: descomprime o que acabou de gerar e confere as
 * contagens. Backup que ninguém abriu é palpite — buffer truncado e gzip
 * corrompido não avisam na hora de gravar, avisam na hora de restaurar.
 *
 * @param {(linha: string) => void} [log] — recebe o progresso, se quiser mostrar.
 */
export async function gerarDump(pool, log = () => {}) {
  const tabelas = await listarTabelas(pool);
  if (tabelas.length === 0) {
    throw new Error('nenhuma tabela encontrada — banco vazio ou schema errado');
  }

  const dump = { gerado_em: new Date().toISOString(), tabelas: {} };
  const contagem = {};

  for (const t of tabelas) {
    // O nome vem do catálogo, não de entrada externa, e ainda assim vai entre
    // aspas duplas — identificador não é parametrizável em SQL.
    const { rows } = await pool.query(`SELECT * FROM "${t}"`);
    dump.tabelas[t] = rows;
    contagem[t] = rows.length;
    log(`  ${t.padEnd(20)} ${String(rows.length).padStart(6)} linha(s)`);
  }

  const conteudo = zlib.gzipSync(Buffer.from(JSON.stringify(dump)), { level: 9 });

  const lido = JSON.parse(zlib.gunzipSync(conteudo).toString());
  const divergentes = tabelas.filter((t) => (lido.tabelas[t]?.length ?? -1) !== contagem[t]);
  if (divergentes.length) {
    throw new Error(`verificação falhou em: ${divergentes.join(', ')}`);
  }

  const linhas = Object.values(contagem).reduce((a, b) => a + b, 0);
  return {
    conteudo,
    resumo: `${tabelas.length} tabelas, ${linhas} linhas, ${Math.round(conteudo.length / 1024)} KB`,
    contagem,
  };
}

/** Nome do arquivo: ordenável por nome, legível por gente. */
export function nomeDoArquivo(agora = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `nutrilu_${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}_${p(agora.getHours())}${p(agora.getMinutes())}.json.gz`;
}
