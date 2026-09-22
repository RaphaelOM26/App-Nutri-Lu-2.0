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
  {
    id: '005-anamnese-clinica',
    descricao: 'Anamnese clínica (dado de saúde) em tabela própria, fora do perfil',
    // Fica separada de client_profiles de propósito: nenhuma rota de leitura
    // geral (/me/dia, /me/perfil) devolve isto, e nada daqui entra em prompt
    // de IA nem no bot do WhatsApp. Só a cliente (dona) e o painel da
    // nutricionista leem. Base legal: tutela da saúde por profissional de
    // saúde, com consentimento explícito registrado em consentimento_em.
    sql: `
      CREATE TABLE IF NOT EXISTS anamnese_clinica (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL DEFAULT '{}',
        consentimento_em TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },

  // ─── Painel da Luciana (16/09/2026) ───────────────────────────────────────
  //
  // `users.role` é o papel da pessoa: 'cliente' (padrão), 'nutri' (a
  // Luciana, vê tudo) ou 'admin' (sócios: dashboard e lista, sem anamnese
  // clínica individual). Fica no BANCO e é lido a cada pedido — não vai pro
  // JWT, porque as sessões duram 180 dias e um papel dentro do token não
  // poderia ser revogado. Só o script scripts/definir-papel.mjs muda isso.
  //
  // `painel_cache` guarda a síntese de persona gerada por IA (1x/dia) e
  // qualquer outro agregado caro. O texto clínico NÃO passa por IA: o
  // dashboard classifica por dicionário, na hora (services/dashboard.js).
  //
  // `materials.file_key`: PDF guardado no R2 (a URL assinada nasce na leitura).
  {
    id: '006-painel-papeis',
    descricao: 'Papel do usuário (nutri/admin), cache do painel, PDF no R2, published_at do plano',
    sql: `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'cliente';
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('cliente', 'nutri', 'admin'));

      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

      ALTER TABLE materials ADD COLUMN IF NOT EXISTS file_key TEXT;

      CREATE TABLE IF NOT EXISTS painel_cache (
        chave TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        gerado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_lu_messages_perguntas
        ON lu_messages(created_at DESC) WHERE kind = 'pergunta';
      CREATE INDEX IF NOT EXISTS idx_meal_entries_user_logged
        ON meal_entries(user_id, logged_at DESC);
    `,
  },

  // ─── Triagem das dúvidas pela Luna (17/09/2026) ───────────────────────────
  // Cada pergunta ganha uma triagem ('ia' = rascunho pronto pra Luciana
  // aprovar; 'nutri' = precisa dela) e o rascunho em si. Só ADD COLUMN.
  {
    id: '007-triagem-duvidas',
    descricao: 'Triagem e rascunho da Luna nas perguntas pra nutricionista',
    sql: `
      ALTER TABLE lu_messages ADD COLUMN IF NOT EXISTS triagem TEXT;
      ALTER TABLE lu_messages DROP CONSTRAINT IF EXISTS lu_messages_triagem_check;
      ALTER TABLE lu_messages ADD CONSTRAINT lu_messages_triagem_check CHECK (triagem IS NULL OR triagem IN ('ia', 'nutri'));
      ALTER TABLE lu_messages ADD COLUMN IF NOT EXISTS rascunho TEXT;
      ALTER TABLE lu_messages ADD COLUMN IF NOT EXISTS rascunho_motivo TEXT;
      ALTER TABLE lu_messages ADD COLUMN IF NOT EXISTS rascunho_em TIMESTAMPTZ;
    `,
  },

  // ─── Bot de WhatsApp (17/09/2026) ─────────────────────────────────────────
  //
  // Um número só (Cloud API da Meta) atende todas as pacientes: Luna, registro
  // por foto/áudio e o time de suporte. Quatro tabelas:
  //
  //  whatsapp_contatos   quem fala com o número. `user_id` nulo = número que
  //                      ainda não provou de quem é (o vínculo nasce da
  //                      paciente mandando um código gerado na área de
  //                      membros). `ultima_msg_cliente_em` é a JANELA de 24 h da
  //                      Meta: dentro dela a resposta é livre e grátis; fora,
  //                      só modelo aprovado. `atendimento = 'humano'` cala a
  //                      Luna e põe a conversa na fila do painel.
  //  whatsapp_codigos    código de vínculo, 30 min, uso único.
  //  whatsapp_mensagens  o histórico (entrada e saída). `wa_message_id` único
  //                      é a trava contra webhook repetido (a Meta reenvia por
  //                      até 7 dias). `clinico` = fala de saúde por DICIONÁRIO:
  //                      o papel suporte não lê. `sessao_humana` = chegou/saiu
  //                      durante atendimento humano: é o que o suporte enxerga.
  //  whatsapp_fila       trabalho pendente. O webhook só grava e responde 200;
  //                      quem chama IA e a Meta é o trabalhador em segundo
  //                      plano (services/whatsapp/fila.js). `chave` = contato:
  //                      as mensagens de UMA pessoa saem em ordem, as de
  //                      pessoas diferentes correm em paralelo.
  //
  // Fila e mensagens ficam FORA do backup diário (services/backup.js): crescem
  // com o volume (10 mil pacientes ≈ 120 mil linhas/dia) e não são
  // insubstituíveis. O vínculo (contatos) entra.
  {
    id: '008-whatsapp',
    descricao: 'Bot de WhatsApp: contatos, vínculo por código, histórico, fila e papel suporte',
    sql: `
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('cliente', 'nutri', 'admin', 'suporte'));

      CREATE TABLE IF NOT EXISTS whatsapp_contatos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wa_id TEXT NOT NULL UNIQUE,
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        nome_perfil TEXT,
        vinculado_em TIMESTAMPTZ,
        ultima_msg_cliente_em TIMESTAMPTZ,
        atendimento TEXT NOT NULL DEFAULT 'luna' CHECK (atendimento IN ('luna', 'humano')),
        fila TEXT CHECK (fila IS NULL OR fila IN ('suporte', 'comercial')),
        atendente_id UUID REFERENCES users(id) ON DELETE SET NULL,
        atendimento_desde TIMESTAMPTZ,
        aguardando_equipe BOOLEAN NOT NULL DEFAULT FALSE,
        opt_out_em TIMESTAMPTZ,
        ultimo_aviso_em TIMESTAMPTZ,
        estado JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_wa_contatos_atendimento
        ON whatsapp_contatos(fila, aguardando_equipe DESC, atendimento_desde) WHERE atendimento = 'humano';

      CREATE TABLE IF NOT EXISTS whatsapp_codigos (
        code TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_wa_codigos_user ON whatsapp_codigos(user_id);

      CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contato_id UUID NOT NULL REFERENCES whatsapp_contatos(id) ON DELETE CASCADE,
        direcao TEXT NOT NULL CHECK (direcao IN ('in', 'out')),
        wa_message_id TEXT UNIQUE,
        tipo TEXT NOT NULL DEFAULT 'text',
        texto TEXT,
        media_key TEXT,
        media_mime TEXT,
        autor TEXT NOT NULL CHECK (autor IN ('cliente', 'luna', 'sistema', 'equipe')),
        autor_id UUID REFERENCES users(id) ON DELETE SET NULL,
        clinico BOOLEAN NOT NULL DEFAULT FALSE,
        sessao_humana BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'recebida',
        erro TEXT,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_wa_mensagens_contato ON whatsapp_mensagens(contato_id, criado_em DESC);
      CREATE INDEX IF NOT EXISTS idx_wa_mensagens_retencao ON whatsapp_mensagens(criado_em);
      CREATE INDEX IF NOT EXISTS idx_wa_mensagens_janela ON whatsapp_mensagens(contato_id) WHERE status = 'aguardando_janela';

      CREATE TABLE IF NOT EXISTS whatsapp_fila (
        id BIGSERIAL PRIMARY KEY,
        tipo TEXT NOT NULL,
        chave TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'feito', 'falhou')),
        tentativas INTEGER NOT NULL DEFAULT 0,
        disponivel_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        travado_ate TIMESTAMPTZ,
        erro TEXT,
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        feito_em TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_wa_fila_aberta ON whatsapp_fila(chave, id) WHERE status IN ('pendente', 'processando');
      CREATE INDEX IF NOT EXISTS idx_wa_fila_feita ON whatsapp_fila(feito_em) WHERE status IN ('feito', 'falhou');

      -- Recado/resposta da Nutri Luciana já entregue no WhatsApp (nulo = ainda não).
      ALTER TABLE lu_messages ADD COLUMN IF NOT EXISTS wa_entregue_em TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_lu_messages_wa_pendente
        ON lu_messages(user_id, created_at) WHERE author = 'nutri' AND wa_entregue_em IS NULL;
    `,
  },

  // ─── Boas-vindas pelo WhatsApp a partir da compra (17/09/2026) ────────────
  // A Hotmart manda o telefone do checkout junto com a compra aprovada. Cada
  // compra vira no máximo UM convite (purchase_id único): um modelo aprovado
  // com o botão "Começar". O telefone do checkout NÃO vincula nada sozinho (pode
  // estar errado, ser de quem pagou): o vínculo só acontece quando a pessoa
  // toca no botão, e `wa_id` guarda o identificador canônico que a Meta
  // devolveu no envio, que é o mesmo que chega na resposta dela.
  // Tudo desta função mora em services/whatsapp/convites.js e liga/desliga por
  // WHATSAPP_BOAS_VINDAS — ver docs/whatsapp-bot.md.
  {
    id: '009-whatsapp-convites',
    descricao: 'Convite de boas-vindas pelo WhatsApp a partir da compra na Hotmart',
    sql: `
      CREATE TABLE IF NOT EXISTS whatsapp_convites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        purchase_id UUID NOT NULL UNIQUE REFERENCES purchases(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        nome TEXT,
        telefone TEXT NOT NULL,
        wa_id TEXT,
        status TEXT NOT NULL DEFAULT 'pendente'
          CHECK (status IN ('pendente', 'enviado', 'aceito', 'falhou', 'ignorado')),
        motivo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        enviado_em TIMESTAMPTZ,
        aceito_em TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_wa_convites_wa_id ON whatsapp_convites(wa_id) WHERE status = 'enviado';
    `,
  },
  // A área de membros mostra "a Luna já te escreveu no número X" pelo e-mail
  // da conta (GET /me/whatsapp), a cada abertura do Perfil e do onboarding.
  {
    id: '010-whatsapp-convites-email',
    descricao: 'Índice do convite pendente por e-mail',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_wa_convites_email ON whatsapp_convites(email) WHERE status = 'enviado';
    `,
  },
  // Aprovação em lote (18/09/2026, services/lote): o sistema gera o rascunho
  // do mês e registra se cabe no lote e por quê não; a Luciana aprova de 10
  // em 10 com amostra, ou um a um. Tudo fica registrado (quem, quando, como,
  // com que versão das regras).
  {
    id: '011-aprovacao-em-lote',
    descricao: 'Rascunhos gerados pelo sistema, elegibilidade, lotes e registro da aprovação',
    sql: `
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS elegivel_lote BOOLEAN;
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS motivos_revisao JSONB NOT NULL DEFAULT '[]';
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS perfil_chave TEXT;
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS regras_versao TEXT;
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS gerado_em TIMESTAMPTZ;
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS alterado_pela_nutri BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS aprovacao TEXT CHECK (aprovacao IN ('individual', 'lote'));
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS lote_id UUID;
      CREATE INDEX IF NOT EXISTS idx_meal_plans_sistema ON meal_plans(created_by, status, week_index) WHERE created_by = 'sistema';
      CREATE INDEX IF NOT EXISTS idx_meal_plans_calibracao ON meal_plans(perfil_chave, created_by, status) WHERE created_by = 'sistema' AND week_index = 1;

      CREATE TABLE IF NOT EXISTS planos_lotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        criado_por UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        perfil_chave TEXT NOT NULL,
        regras_versao TEXT NOT NULL,
        membros JSONB NOT NULL,          -- [{ user_id, inicio }]
        amostra JSONB NOT NULL,          -- user_ids sorteados
        conferidos JSONB NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'aprovado', 'travado', 'cancelado')),
        motivo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fechado_em TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_planos_lotes_abertos ON planos_lotes(criado_por) WHERE status = 'aberto';
    `,
  },
  // Sino de notificações da paciente (18/09/2026): plano publicado, recado,
  // resposta, mensagem do time e o insight semanal da Luna. Uma linha por
  // aviso; o sino lê as não lidas (índice parcial) e marca ao abrir.
  {
    id: '012-notificacoes',
    descricao: 'Notificações da área de membros (sino)',
    sql: `
      CREATE TABLE IF NOT EXISTS notificacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo TEXT NOT NULL CHECK (tipo IN ('plano', 'recado', 'resposta', 'equipe', 'insight')),
        titulo TEXT NOT NULL,
        texto TEXT,
        link TEXT,
        ref_id TEXT,
        lida_em TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notif_nao_lidas ON notificacoes(user_id) WHERE lida_em IS NULL;
      CREATE INDEX IF NOT EXISTS idx_notif_recentes ON notificacoes(user_id, created_at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_ref ON notificacoes(user_id, tipo, ref_id) WHERE ref_id IS NOT NULL;
    `,
  },
  // Como ela quer ser chamada (21/09/2026). Fica SEPARADO de display_name de
  // propósito: display_name é o nome da compra — é por ele que a Luciana acha
  // a paciente no painel e que a gente bate com a Hotmart. `apelido` é
  // preferência dela, confirmada no primeiro contato do WhatsApp ou digitada
  // no Perfil, e vale nos dois canais (Luna da web, bot, modelos, e-mail).
  {
    id: '013-apelido',
    descricao: 'Como a paciente prefere ser chamada',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS apelido TEXT;`,
  },
  {
    id: '014-login-links',
    descricao: 'Links mágicos de login mandados pela Luna (uso único, 10 min)',
    sql: `
      CREATE TABLE IF NOT EXISTS login_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        destino TEXT NOT NULL DEFAULT '/',
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_login_links_expira ON login_links(expires_at);
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
