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

  // ─── Área de membros web (15/09/2026) ───────────────────────────────────
  //
  // Até aqui o servidor só conhecia a pessoa pela comunidade e pela compra; o
  // diário vivia no aparelho (AsyncStorage) com uma cópia anônima por
  // device_id. A área web e o bot de WhatsApp precisam ler e gravar o MESMO
  // diário, ligado à cliente — então tudo abaixo é chaveado por users.id.
  //
  // Datas são TEXT 'YYYY-MM-DD' de propósito, igual a day_snapshots: o dia da
  // cliente é o dia civil dela, e TIMESTAMPTZ misturaria fuso do servidor.
  {
    id: '002-login-por-email',
    descricao: 'Login por e-mail com código de uso único',
    sql: `
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_provider_check;
      ALTER TABLE users ADD CONSTRAINT users_provider_check
        CHECK (provider IN ('apple', 'google', 'dev', 'email'));

      CREATE TABLE IF NOT EXISTS login_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_login_codes_email
        ON login_codes(email, created_at DESC);
    `,
  },
  {
    id: '003-diario-por-cliente',
    descricao: 'Refeições registradas, água, peso, medidas e fotos por cliente',
    sql: `
      CREATE TABLE IF NOT EXISTS meal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        slot TEXT NOT NULL,
        source TEXT NOT NULL
          CHECK (source IN ('manual', 'taco', 'receita', 'plano', 'foto', 'audio', 'whatsapp')),
        items JSONB NOT NULL DEFAULT '[]',
        kcal NUMERIC NOT NULL DEFAULT 0,
        p NUMERIC NOT NULL DEFAULT 0,
        c NUMERIC NOT NULL DEFAULT 0,
        f NUMERIC NOT NULL DEFAULT 0,
        photo_key TEXT,
        confidence TEXT,
        note TEXT,
        logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date
        ON meal_entries(user_id, date);

      CREATE TABLE IF NOT EXISTS water_log (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        ml INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, date)
      );

      CREATE TABLE IF NOT EXISTS weight_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        kg NUMERIC(5,2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, date)
      );

      CREATE TABLE IF NOT EXISTS body_measures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        measures JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, date)
      );

      CREATE TABLE IF NOT EXISTS progress_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        photo_key TEXT NOT NULL,
        weight_kg NUMERIC(5,2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_progress_photos_user
        ON progress_photos(user_id, date DESC);
    `,
  },
  {
    id: '004-plano-suplementos-perfil',
    descricao: 'Plano alimentar por semana, suplementos, perfil e recados',
    sql: `
      CREATE TABLE IF NOT EXISTS meal_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        week_start TEXT NOT NULL,
        week_index INTEGER,
        week_total INTEGER,
        targets JSONB NOT NULL DEFAULT '{}',
        note TEXT,
        days JSONB NOT NULL DEFAULT '[]',
        overrides JSONB NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'ativo'
          CHECK (status IN ('rascunho', 'ativo', 'encerrado')),
        created_by TEXT NOT NULL DEFAULT 'nutri',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, week_start)
      );

      CREATE TABLE IF NOT EXISTS supplements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        dose TEXT,
        time TEXT,
        with_meal TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        sort INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_supplements_user ON supplements(user_id);

      CREATE TABLE IF NOT EXISTS supplement_intake (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        supplement_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
        taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, date, supplement_id)
      );

      CREATE TABLE IF NOT EXISTS client_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS lu_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind TEXT NOT NULL CHECK (kind IN ('recado', 'pergunta', 'resposta')),
        author TEXT NOT NULL CHECK (author IN ('nutri', 'cliente')),
        text TEXT NOT NULL,
        reply_to UUID REFERENCES lu_messages(id) ON DELETE SET NULL,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_lu_messages_user
        ON lu_messages(user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('video', 'pdf')),
        url TEXT NOT NULL,
        meta JSONB NOT NULL DEFAULT '{}',
        sort INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
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
