// Pool de conexões Postgres + bootstrap idempotente do schema.
//
// Por que pool: Postgres não escala criando uma conexão nova por request — pool
// reusa conexões TCP e regula concorrência. pg.Pool default = 10 conexões, que
// dá folga absurda pro nosso volume de beta (~20 users × poucos requests/min).
//
// Por que SSL com rejectUnauthorized:false: Railway usa cert auto-assinado interno.
// Sem essa flag, o cliente recusa o handshake. Em produção real consideraríamos
// pin do cert, mas pro beta interno (single tenant) é seguro.
//
// Bootstrap idempotente: roda o CREATE TABLE IF NOT EXISTS no boot do servidor.
// Garante que o schema existe sem precisar de migration tool separada.

import pg from 'pg';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada — provisione Postgres no Railway');
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });
  pool.on('error', (err) => console.error('[db] pool error:', err));
  return pool;
}

// Cria as tabelas se ainda não existem. Idempotente — pode rodar toda vez no boot.
export async function initSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS day_snapshots (
      device_id TEXT NOT NULL,
      date TEXT NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (device_id, date)
    );
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_day_snapshots_device_date
      ON day_snapshots(device_id, date DESC);
  `);
  console.log('[db] schema inicializado (day_snapshots OK)');
}
