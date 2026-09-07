// Migrações de schema, aplicadas em ordem no boot.
//
// Por que existe: o bootstrap do db.js é `CREATE TABLE IF NOT EXISTS`, que sabe
// criar tabela nova e NÃO sabe alterar coluna existente. Enquanto só se
// acrescentava tabela isso bastou. Agora vêm coluna nova em `purchases`,
// contador mensal, planos e anamnese — e improvisar `ALTER TABLE` na mão com
// produção no ar é como se perde dado.
//
// COMO USAR: acrescente um item NO FIM da lista, com id novo. Nunca edite nem
// remova um item já aplicado — o registro em `schema_migrations` diz que ele
// rodou, e mudar o texto não faz o banco voltar atrás.
//
// Cada migração roda dentro de uma transação: ou entra inteira, ou não entra.

export const MIGRACOES = [
  {
    id: '001-uso-mensal',
    descricao: 'Contador mensal de uso das rotas pagas',
    sql: `
      CREATE TABLE IF NOT EXISTS uso_mensal (
        chave TEXT NOT NULL,
        competencia TEXT NOT NULL,
        n INTEGER NOT NULL DEFAULT 0,
        atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (chave, competencia)
      );
      CREATE INDEX IF NOT EXISTS idx_uso_mensal_competencia
        ON uso_mensal(competencia);
    `,
  },
];

/**
 * Aplica as migrações que ainda não rodaram. Idempotente.
 *
 * Roda depois do initSchema: as tabelas base existem primeiro, as alterações
 * vêm por cima.
 */
export async function aplicarMigracoes(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      aplicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT id FROM schema_migrations');
  const jaAplicadas = new Set(rows.map((r) => r.id));

  for (const m of MIGRACOES) {
    if (jaAplicadas.has(m.id)) continue;
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(m.sql);
      await cliente.query('INSERT INTO schema_migrations (id) VALUES ($1)', [m.id]);
      await cliente.query('COMMIT');
      console.log(`[migração] ${m.id} — ${m.descricao}`);
    } catch (e) {
      await cliente.query('ROLLBACK');
      // Migração que falha derruba o boot de propósito: subir a aplicação com
      // schema pela metade é pior que não subir.
      throw new Error(`migração ${m.id} falhou: ${e.message}`);
    } finally {
      cliente.release();
    }
  }
}
