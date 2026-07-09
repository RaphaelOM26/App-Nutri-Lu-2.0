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

  // ── Comunidade de receitas (feature #3 da v1.0) ─────────────────────────
  // users: identidade real via Sign in with Apple/Google. provider_sub é o
  // "sub" estável do token de identidade — é ele que reconecta a mesma pessoa
  // entre sessões/reinstalações. device_id fica como ponte pro histórico
  // anônimo legado (day_snapshots).
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider TEXT NOT NULL CHECK (provider IN ('apple', 'google', 'dev')),
      provider_sub TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT,
      device_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (provider, provider_sub)
    );
  `);

  // community_recipes: a receita publicada é uma CÓPIA desnormalizada da
  // SavedRecipe do autor (payload JSONB com ingredientes/passos/macros/etc).
  // Cópia, não referência: edições locais posteriores do autor não mudam o
  // que a comunidade vê, e o feed não depende do device de ninguém.
  // is_removed = soft delete (despublicar / moderação) sem quebrar ratings.
  await p.query(`
    CREATE TABLE IF NOT EXISTS community_recipes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      payload JSONB NOT NULL,
      image_data_url TEXT,
      source_url TEXT,
      is_removed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_community_recipes_feed
      ON community_recipes(is_removed, created_at DESC);
  `);
  // Anti-duplicata: o mesmo user não publica 2x a mesma receita (por título)
  // enquanto a primeira estiver ativa. Parcial (WHERE) permite re-publicar
  // depois de despublicar. Violação vira 409 na rota.
  await p.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_community_recipes_user_title_active
      ON community_recipes(user_id, title) WHERE is_removed = FALSE;
  `);

  // recipe_ratings: 1 avaliação por (usuário, receita) — PK composto faz o
  // "avaliar de novo" virar UPDATE natural via ON CONFLICT.
  await p.query(`
    CREATE TABLE IF NOT EXISTS recipe_ratings (
      recipe_id UUID NOT NULL REFERENCES community_recipes(id),
      user_id UUID NOT NULL REFERENCES users(id),
      stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (recipe_id, user_id)
    );
  `);

  console.log('[db] schema inicializado (day_snapshots + comunidade OK)');
}
