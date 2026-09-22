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
//
// SEM LOGIN, DE PROPÓSITO: o app roda anônimo por padrão e este é o diário do
// celular. Exigir sessão aqui apagaria o histórico de quem nunca logou. E fica
// fora do `exigirChaveDoApp` pelo motivo escrito no index.js. Então a rota é a
// única do backend aberta a qualquer origem — e por isso precisa dos SEUS
// freios (revisão de segurança de 22/09/2026):
//   - device_id só no formato que o app gera (kill de spam sem custo)
//   - teto de device_id NOVOS por IP por dia: um install legítimo cria um;
//     quem cria centenas está enchendo o disco
//   - teto de gravações por device por dia: o auto-save tem debounce de 3s,
//     um dia real fica bem abaixo disso
//   - payload de 64 KB: um dia de refeições tem poucos KB
// Contadores em memória, por instância (limites.js). Não é proteção DDoS —
// isso é da borda (Cloudflare); é o freio pra não virar custo.

import express from 'express';
import { getPool } from '../db.js';
import { contarNaMemoria } from '../services/limites.js';

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// O que `generateUuidLike()` do app produz, e tolerância pra id antigo: 8 a 64
// chars de [A-Za-z0-9_-]. Mais estrito que isso (só UUID) arriscaria apagar o
// diário de um install antigo com id em outro formato.
const DEVICE_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const PAYLOAD_MAX = 64 * 1024;
const DEVICES_NOVOS_POR_IP_DIA = 50;
const GRAVACOES_POR_DEVICE_DIA = 2000;

function validateInputs(deviceId, date) {
  if (!deviceId || typeof deviceId !== 'string' || !DEVICE_ID_RE.test(deviceId)) {
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
    // Cap de tamanho: um dia de refeições legítimo tem poucos KB. Sem o cap,
    // um cliente bugado/malicioso podia gravar dezenas de KB por snapshot e
    // inflar o Postgres (express.json aceita até 15mb por causa das fotos
    // base64 de OUTRAS rotas — aqui não há razão pra payload grande).
    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > PAYLOAD_MAX) {
      return res.status(413).json({ error: 'payload grande demais (max 64KB)', code: 'PAYLOAD_TOO_LARGE' });
    }
    if (contarNaMemoria(`snapshot:dev:${device_id}`, GRAVACOES_POR_DEVICE_DIA).estourou) {
      return res.status(429).json({ error: 'Muitas gravações hoje. Tenta de novo amanhã.', code: 'RATE_LIMITED' });
    }

    const pool = getPool();
    // Device novo (nenhuma linha ainda) conta no teto do IP. Uma consulta por
    // chave primária; o app grava o mesmo device o dia inteiro, então quase
    // sempre já existe.
    const { rowCount: jaExiste } = await pool.query(`SELECT 1 FROM day_snapshots WHERE device_id = $1 LIMIT 1`, [device_id]);
    if (!jaExiste && contarNaMemoria(`snapshot:novos:${req.ip}`, DEVICES_NOVOS_POR_IP_DIA).estourou) {
      return res.status(429).json({ error: 'Muitos aparelhos novos deste endereço hoje.', code: 'RATE_LIMITED' });
    }
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
