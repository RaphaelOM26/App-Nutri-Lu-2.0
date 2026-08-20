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

  // ── Moderação de conteúdo (exigência da App Store 1.2, apps com UGC) ──────
  // A Apple exige, pra qualquer app com conteúdo gerado por usuário: (a) um
  // jeito de DENUNCIAR conteúdo ofensivo, (b) um jeito de BLOQUEAR quem abusa,
  // e (c) remoção do conteúdo denunciado. Sem isso a review reprova.
  //
  // recipe_reports: PK composto (receita, denunciante) = cada pessoa denuncia
  // a mesma receita no máximo uma vez — impede inflar a contagem sozinho e faz
  // o "denunciar de novo" ser inofensivo. CASCADE porque denúncia não faz
  // sentido sem a receita nem sem quem denunciou.
  await p.query(`
    CREATE TABLE IF NOT EXISTS recipe_reports (
      recipe_id UUID NOT NULL REFERENCES community_recipes(id) ON DELETE CASCADE,
      reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (recipe_id, reporter_user_id)
    );
  `);

  // user_blocks: bloqueio de MÃO ÚNICA — quem bloqueia deixa de ver o outro no
  // feed; o bloqueado não é avisado e continua enxergando o feed dele normal
  // (avisar transformaria o bloqueio em confronto). O CHECK impede o caso
  // degenerado de alguém bloquear a si mesmo e sumir do próprio feed.
  await p.query(`
    CREATE TABLE IF NOT EXISTS user_blocks (
      blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (blocker_user_id, blocked_user_id),
      CHECK (blocker_user_id <> blocked_user_id)
    );
  `);

  // ── Acesso pago (v1.0) ───────────────────────────────────────────────────
  // O app é BÔNUS do acompanhamento da nutricionista, vendido fora das lojas.
  // Por isso o direito de acesso não nasce de uma compra in-app: nasce de um
  // registro aqui, alimentado pelo webhook da plataforma de venda (ou por
  // cortesia manual).
  //
  // `purchases` guarda O QUE a plataforma nos contou. `source` deixa a porta
  // aberta pra compra in-app no futuro sem reescrever nada — muda a origem,
  // não a pergunta que o app faz.
  //
  // NUNCA existe um campo `premium` no usuário: o acesso é DERIVADO desta
  // tabela a cada consulta. Guardar o direito em dois lugares garante que um
  // deles fica desatualizado no dia do reembolso.
  await p.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL CHECK (source IN ('hotmart', 'cortesia', 'apple_iap', 'google_play')),
      external_id TEXT,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'ativa'
        CHECK (status IN ('ativa', 'reembolsada', 'cancelada', 'expirada')),
      valido_ate TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Idempotência do webhook: a plataforma reenvia o evento quando não recebe
  // confirmação. Sem isto, o mesmo pagamento vira duas compras e dois códigos.
  await p.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_origem
      ON purchases(source, external_id) WHERE external_id IS NOT NULL;
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_purchases_email
      ON purchases(email) WHERE email IS NOT NULL;
  `);

  // access_codes: caminho de EXCEÇÃO. O normal é o e-mail verificado pelo
  // provedor de login bater com o da compra e liberar sozinho. O código existe
  // pra quem usou "Ocultar meu e-mail" da Apple, comprou com outro endereço ou
  // ganhou de presente.
  //
  // ON DELETE SET NULL de propósito: se a pessoa excluir a conta e voltar
  // depois, o código dela volta a valer. Fosse CASCADE, ela perderia o acesso
  // comprado junto com a conta.
  await p.query(`
    CREATE TABLE IF NOT EXISTS access_codes (
      code TEXT PRIMARY KEY,
      purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      redeemed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      redeemed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);


  // ai_usage: uma linha por chamada à OpenAI. Existe porque o gasto
  // recorrente do app é a IA e o painel da OpenAI só mostra o total — não
  // diz qual feature nem qual pessoa consumiu. Guarda TOKENS, nunca dólares:
  // preço muda e não pertence ao banco (ver services/uso.js).
  //
  // ON DELETE SET NULL no user_id: excluir a conta apaga o vínculo com a
  // pessoa, mas o custo já gasto continua contando no total do mês — do
  // contrário o relatório encolheria sozinho a cada exclusão de conta.
  await p.query(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rota TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('chat', 'imagem', 'transcricao')),
      modelo TEXT,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      device_id TEXT,
      input_tokens INTEGER,
      output_tokens INTEGER,
      cached_tokens INTEGER,
      reasoning_tokens INTEGER,
      total_tokens INTEGER,
      imagens INTEGER,
      ms INTEGER,
      ok BOOLEAN NOT NULL DEFAULT TRUE,
      erro TEXT
    );
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_ai_usage_rota_dia
      ON ai_usage(rota, criado_em DESC);
  `);
  await p.query(`
    CREATE INDEX IF NOT EXISTS idx_ai_usage_user
      ON ai_usage(user_id, criado_em DESC) WHERE user_id IS NOT NULL;
  `);
  console.log('[db] schema inicializado (day_snapshots + comunidade + moderação + acesso + uso OK)');
}
