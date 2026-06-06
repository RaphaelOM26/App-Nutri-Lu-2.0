// Snapshot diário de refeições por device_id (anônimo) + data (YYYY-MM-DD).
//
// POST /day-snapshot  body { device_id, date, payload }  → upsert
// GET  /day-snapshot?device_id=...&date=YYYY-MM-DD       → 200 payload | 404
//
// Auto-save no app dispara POST a cada mudança em meals/macros/water (debounce 3s).
// "Copiar dia anterior" do Diário dispara GET com date=ontem.
//
// Validação: device_id e date obrigatórios; date strict YYYY-MM-DD pra evitar
// poluição (alguém mandando "2026/06/06" criaria entrada duplicada).

import express from 'express';
import { getPool } from '../db.js';

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateInputs(deviceId, date) {
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 8) {
    return 'device_id ausente ou inválido';
  }
  if (!date || !DATE_RE.test(date)) {
    return 'date precisa estar no formato YYYY-MM-DD';
  }
  return null;
}

// Salva (upsert) o snapshot do dia. Body: { device_id, date, payload }.
// payload é JSONB livre — o cliente decide a estrutura.
router.post('/', async (req, res, next) => {
  try {
    const { device_id, date, payload } = req.body || {};
    const err = validateInputs(device_id, date);
    if (err) return res.status(400).json({ error: err, code: 'BAD_REQUEST' });
    if (payload === undefined || payload === null) {
      return res.status(400).json({ error: 'payload obrigatório', code: 'BAD_REQUEST' });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO day_snapshots (device_id, date, payload, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (device_id, date)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();`,
      [device_id, date, payload],
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Busca o snapshot do dia. Query: device_id, date. 404 se não existe.
router.get('/', async (req, res, next) => {
  try {
    const { device_id, date } = req.query;
    const err = validateInputs(device_id, date);
    if (err) return res.status(400).json({ error: err, code: 'BAD_REQUEST' });

    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT payload, updated_at FROM day_snapshots
       WHERE device_id = $1 AND date = $2;`,
      [device_id, date],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Snapshot não encontrado', code: 'NOT_FOUND' });
    }
    res.json({ payload: rows[0].payload, updated_at: rows[0].updated_at });
  } catch (e) {
    next(e);
  }
});

export default router;
