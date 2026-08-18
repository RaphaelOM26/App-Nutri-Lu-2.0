// Comunidade de receitas (feature #3 da v1.0).
//
// POST   /community/recipes        (auth)  — publica uma receita no feed
// GET    /community/recipes        (anon+) — feed paginado (sort=recent|top)
// POST   /community/recipes/:id/rate (auth) — avalia 1-5 estrelas (re-avaliar = update)
// DELETE /community/recipes/:id    (auth)  — despublica a própria receita (soft delete)
// POST   /community/recipes/:id/report (auth) — denuncia conteúdo ofensivo
// POST   /community/users/:id/block  (auth)  — bloqueia um autor (some do meu feed)
// DELETE /community/users/:id/block  (auth)  — desfaz o bloqueio
// GET    /community/blocks           (auth)  — lista quem eu bloqueei
// GET    /community/leaderboard      (anon+) — rank da semana por estrelas recebidas
//
// Decisões de produto (Raphael, 2026-07-07): publica DIRETO no feed (sem fila
// de aprovação); a escolha público/privado acontece no app na hora de salvar a
// receita importada. is_removed existe como válvula de moderação manual.

import { Router } from 'express';
import { getPool } from '../db.js';
import { requireAuth, optionalAuth } from '../services/auth.js';

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Foto base64: cap generoso (as geradas por IA em qualidade média ficam bem
// abaixo disso). Evita alguém entupir o banco com fotos de 10MB.
const MAX_IMAGE_CHARS = 1_500_000; // ~1.1MB de imagem real
// Payload (receita em JSON): receita real fica em dezenas de KB; o cap folgado
// cobre até uma imagem base64 embutida por engano, mas barra abuso de MBs
// (o express.json aceita 15mb global — sem este cap, dava pra inflar o banco).
const MAX_PAYLOAD_CHARS = 2_000_000;
const MAX_SOURCE_URL_CHARS = 2048;

// Motivos de denúncia — lista FECHADA de propósito. Texto livre viraria um
// canal paralelo de abuso (e de dado pessoal) que ninguém lê; o motivo aqui
// serve só pra triagem manual depois.
const REPORT_REASONS = new Set(['ofensivo', 'spam', 'perigoso', 'plagio', 'outro']);

// Denúncias DISTINTAS que escondem a receita sozinhas. 3 é deliberado: alto o
// bastante pra uma pessoa sozinha não derrubar conteúdo alheio, baixo o
// bastante pra sumir rápido num beta de ~20 pessoas. is_removed é soft delete
// — dá pra reverter no banco se a denúncia for injusta.
const AUTO_HIDE_REPORTS = 3;

router.post('/recipes', requireAuth, async (req, res, next) => {
  try {
    const { title, payload, image_data_url: imageDataUrl, source_url: sourceUrl } = req.body || {};
    if (!title?.trim() || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ error: 'title e payload são obrigatórios', code: 'BAD_REQUEST' });
    }
    // Shape mínimo da receita: o app renderiza payload.ingredients/.steps com
    // .map() direto — payload sem esses arrays crasharia a tela de TODOS os
    // leitores do feed. Valida na entrada, não na leitura.
    if (!Array.isArray(payload.ingredients) || !Array.isArray(payload.steps)) {
      return res.status(400).json({ error: 'payload precisa de ingredients e steps', code: 'BAD_REQUEST' });
    }
    if (imageDataUrl && imageDataUrl.length > MAX_IMAGE_CHARS) {
      return res.status(413).json({ error: 'Foto grande demais — reduza a qualidade', code: 'IMAGE_TOO_LARGE' });
    }
    if (JSON.stringify(payload).length > MAX_PAYLOAD_CHARS) {
      return res.status(413).json({ error: 'Receita grande demais', code: 'PAYLOAD_TOO_LARGE' });
    }
    if (sourceUrl && sourceUrl.length > MAX_SOURCE_URL_CHARS) {
      return res.status(400).json({ error: 'source_url inválida', code: 'BAD_REQUEST' });
    }

    const { rows } = await getPool().query(
      `INSERT INTO community_recipes (user_id, title, payload, image_data_url, source_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [req.user.userId, title.trim().slice(0, 120), payload, imageDataUrl || null, sourceUrl || null]
    );
    res.status(201).json({ id: rows[0].id, created_at: rows[0].created_at });
  } catch (e) {
    // 23505 = violação do índice único (user_id, title) ativo — mesma receita
    // publicada 2x (duplo-toque ou re-import). Vira 409 amigável, não 500.
    if (e?.code === '23505') {
      return res.status(409).json({ error: 'Você já publicou esta receita', code: 'ALREADY_PUBLISHED' });
    }
    next(e);
  }
});

router.get('/recipes', optionalAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const sort = req.query.sort === 'top' ? 'top' : 'recent';

    // Agregação de estrelas por LATERAL: média e contagem por receita, mais a
    // avaliação do próprio requester quando logado (my_stars).
    const orderBy =
      sort === 'top'
        ? 'r.avg_stars DESC NULLS LAST, r.rating_count DESC, cr.created_at DESC'
        : 'cr.created_at DESC';

    const { rows } = await getPool().query(
      `SELECT
         cr.id, cr.title, cr.payload, cr.image_data_url, cr.source_url, cr.created_at,
         u.display_name AS author_name, cr.user_id AS author_id,
         cr.user_id = $3 AS is_mine,
         r.avg_stars, r.rating_count, my.stars AS my_stars
       FROM community_recipes cr
       JOIN users u ON u.id = cr.user_id
       LEFT JOIN LATERAL (
         SELECT ROUND(AVG(stars)::numeric, 1) AS avg_stars, COUNT(*)::int AS rating_count
         FROM recipe_ratings WHERE recipe_id = cr.id
       ) r ON TRUE
       LEFT JOIN recipe_ratings my ON my.recipe_id = cr.id AND my.user_id = $3
       WHERE cr.is_removed = FALSE
         -- Moderação (App Store 1.2): a receita some do feed de quem bloqueou
         -- o autor e de quem já a denunciou — denunciar precisa fazer o
         -- conteúdo sumir NA HORA pra quem denunciou, antes mesmo do corte
         -- automático. Com $3 = NULL (visitante anônimo) as comparações dão
         -- NULL, o NOT EXISTS vira TRUE e nada é filtrado — que é o correto.
         AND NOT EXISTS (
           SELECT 1 FROM user_blocks b
            WHERE b.blocker_user_id = $3 AND b.blocked_user_id = cr.user_id
         )
         AND NOT EXISTS (
           SELECT 1 FROM recipe_reports rr
            WHERE rr.recipe_id = cr.id AND rr.reporter_user_id = $3
         )
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      [limit + 1, offset, req.user?.userId || null]
    );

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((r) => ({
      id: r.id,
      title: r.title,
      payload: r.payload,
      imageDataUrl: r.image_data_url,
      sourceUrl: r.source_url,
      createdAt: r.created_at,
      authorName: r.author_name,
      authorId: r.author_id,
      isMine: r.is_mine,
      avgStars: r.avg_stars != null ? Number(r.avg_stars) : null,
      ratingCount: r.rating_count || 0,
      myStars: r.my_stars || null,
    }));
    res.json({ items, hasMore, nextOffset: offset + items.length });
  } catch (e) {
    next(e);
  }
});

router.post('/recipes/:id/rate', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const stars = parseInt(req.body?.stars, 10);
    if (!UUID_RE.test(id)) {
      return res.status(404).json({ error: 'Receita não encontrada', code: 'NOT_FOUND' });
    }
    if (!(stars >= 1 && stars <= 5)) {
      return res.status(400).json({ error: 'stars deve ser 1 a 5', code: 'BAD_REQUEST' });
    }

    const { rows } = await getPool().query(
      'SELECT user_id FROM community_recipes WHERE id = $1 AND is_removed = FALSE',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Receita não encontrada', code: 'NOT_FOUND' });
    // Auto-avaliação distorceria o futuro rank semanal — bloqueia na origem.
    if (rows[0].user_id === req.user.userId) {
      return res.status(403).json({ error: 'Você não pode avaliar a própria receita', code: 'SELF_RATING' });
    }

    await getPool().query(
      `INSERT INTO recipe_ratings (recipe_id, user_id, stars)
       VALUES ($1, $2, $3)
       ON CONFLICT (recipe_id, user_id)
       DO UPDATE SET stars = EXCLUDED.stars, updated_at = NOW()`,
      [id, req.user.userId, stars]
    );

    const { rows: agg } = await getPool().query(
      `SELECT ROUND(AVG(stars)::numeric, 1) AS avg_stars, COUNT(*)::int AS rating_count
       FROM recipe_ratings WHERE recipe_id = $1`,
      [id]
    );
    res.json({ avgStars: Number(agg[0].avg_stars), ratingCount: agg[0].rating_count, myStars: stars });
  } catch (e) {
    next(e);
  }
});

router.delete('/recipes/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) {
      return res.status(404).json({ error: 'Receita não encontrada', code: 'NOT_FOUND' });
    }
    const { rowCount } = await getPool().query(
      'UPDATE community_recipes SET is_removed = TRUE WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Receita não encontrada', code: 'NOT_FOUND' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Denúncia de conteúdo (App Store 1.2). Idempotente por (receita, denunciante):
// denunciar duas vezes só atualiza o motivo, não conta dobrado.
router.post('/recipes/:id/report', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || 'outro');
    if (!UUID_RE.test(id)) {
      return res.status(404).json({ error: 'Receita não encontrada', code: 'NOT_FOUND' });
    }
    if (!REPORT_REASONS.has(reason)) {
      return res.status(400).json({ error: 'Motivo inválido', code: 'BAD_REQUEST' });
    }

    const { rows } = await getPool().query(
      'SELECT user_id FROM community_recipes WHERE id = $1 AND is_removed = FALSE',
      [id]
    );
    // Já removida conta como sucesso: o objetivo de quem denuncia (o conteúdo
    // sair do ar) já está cumprido, e um 404 aqui pareceria erro do app.
    if (!rows[0]) return res.json({ ok: true, hidden: true });

    await getPool().query(
      `INSERT INTO recipe_reports (recipe_id, reporter_user_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (recipe_id, reporter_user_id)
       DO UPDATE SET reason = EXCLUDED.reason`,
      [id, req.user.userId, reason]
    );

    const { rows: cnt } = await getPool().query(
      'SELECT COUNT(*)::int AS n FROM recipe_reports WHERE recipe_id = $1',
      [id]
    );
    let hidden = false;
    if (cnt[0].n >= AUTO_HIDE_REPORTS) {
      await getPool().query('UPDATE community_recipes SET is_removed = TRUE WHERE id = $1', [id]);
      hidden = true;
      console.warn(
        `[moderação] receita ${id} escondida automaticamente (${cnt[0].n} denúncias)`
      );
    }
    res.json({ ok: true, hidden });
  } catch (e) {
    next(e);
  }
});

// Bloquear autor (App Store 1.2). Mão única e silencioso: o bloqueado não é
// notificado e segue vendo o feed dele normalmente.
router.post('/users/:id/block', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) {
      return res.status(404).json({ error: 'Usuário não encontrado', code: 'NOT_FOUND' });
    }
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Você não pode bloquear a si mesmo', code: 'BAD_REQUEST' });
    }
    const { rows } = await getPool().query('SELECT 1 FROM users WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado', code: 'NOT_FOUND' });

    await getPool().query(
      `INSERT INTO user_blocks (blocker_user_id, blocked_user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.userId, id]
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete('/users/:id/block', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) {
      return res.status(404).json({ error: 'Usuário não encontrado', code: 'NOT_FOUND' });
    }
    await getPool().query(
      'DELETE FROM user_blocks WHERE blocker_user_id = $1 AND blocked_user_id = $2',
      [req.user.userId, id]
    );
    // Sem 404 quando não havia bloqueio: o estado pedido (não bloqueado) é o
    // que vale, e a tela de gerenciar bloqueios pode estar desatualizada.
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Lista de bloqueados — alimenta a tela de gerenciar bloqueios. Sem ela o
// bloqueio seria porta só de ida, sem como desfazer pelo app.
router.get('/blocks', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `SELECT u.id, u.display_name
         FROM user_blocks b
         JOIN users u ON u.id = b.blocked_user_id
        WHERE b.blocker_user_id = $1
        ORDER BY b.created_at DESC`,
      [req.user.userId]
    );
    res.json({ items: rows.map((r) => ({ id: r.id, displayName: r.display_name })) });
  } catch (e) {
    next(e);
  }
});

// Rank semanal da comunidade (fase 2 da feature #3).
//
// Pontuação = SOMA DAS ESTRELAS que as receitas da pessoa receberam nesta
// semana (decisão do Raphael, 2026-08-18). Premia qualidade em vez de volume:
// uma receita que todo mundo ama vence dez medianas, e publicar em série não
// pontua sozinho. Como avaliar a própria receita já é bloqueado no /rate,
// não dá pra inflar o próprio placar.
//
// Recorte da semana: segunda→domingo no fuso de São Paulo. date_trunc('week')
// do Postgres já é ISO (começa na segunda), que é como a semana é contada no
// Brasil e como o resto do app (streak, calendário) já mostra.
//
// O rank é GLOBAL de propósito — não filtra quem o requester bloqueou. Um
// placar em que cada um vê posições diferentes deixa de ser placar; bloqueio
// serve pra não ver o CONTEÚDO da pessoa, e o feed já cuida disso.
router.get('/leaderboard', optionalAuth, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      `WITH week_points AS (
         SELECT cr.user_id,
                SUM(rt.stars)::int AS points,
                COUNT(*)::int      AS votes
           FROM recipe_ratings rt
           JOIN community_recipes cr
             ON cr.id = rt.recipe_id AND cr.is_removed = FALSE
          WHERE (rt.created_at AT TIME ZONE 'America/Sao_Paulo')
                >= date_trunc('week', (NOW() AT TIME ZONE 'America/Sao_Paulo'))
          GROUP BY cr.user_id
       ),
       ranked AS (
         SELECT wp.user_id, wp.points, wp.votes, u.display_name,
                (RANK() OVER (ORDER BY wp.points DESC, wp.votes DESC))::int AS rank_position
           FROM week_points wp
           JOIN users u ON u.id = wp.user_id
       )
       SELECT user_id, display_name, points, votes, rank_position
         FROM ranked
        WHERE rank_position <= 10 OR user_id = $1
        ORDER BY rank_position`,
      [req.user?.userId || null]
    );

    const top = rows
      .filter((r) => r.rank_position <= 10)
      .map((r) => ({
        userId: r.user_id,
        displayName: r.display_name,
        points: r.points,
        votes: r.votes,
        position: r.rank_position,
        isMe: r.user_id === (req.user?.userId || null),
      }));
    // "me" separado do top: se a pessoa está fora dos 10, o app ainda mostra
    // a linha dela no rodapé ("você está em 14º") em vez de nada.
    const mineRow = rows.find((r) => r.user_id === (req.user?.userId || null));
    const me = mineRow
      ? {
          userId: mineRow.user_id,
          displayName: mineRow.display_name,
          points: mineRow.points,
          votes: mineRow.votes,
          position: mineRow.rank_position,
          isMe: true,
        }
      : null;

    res.json({ top, me });
  } catch (e) {
    next(e);
  }
});

export default router;
