// Comunidade de receitas (feature #3 da v1.0).
//
// POST   /community/recipes        (auth)  — publica uma receita no feed
// GET    /community/recipes        (anon+) — feed paginado (sort=recent|top)
// POST   /community/recipes/:id/rate (auth) — avalia 1-5 estrelas (re-avaliar = update)
// DELETE /community/recipes/:id    (auth)  — despublica a própria receita (soft delete)
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
         u.display_name AS author_name,
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

export default router;
