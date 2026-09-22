// Login por LINK MÁGICO, mandado pela Luna no WhatsApp (decisão do Raphael,
// 22/09/2026). O número dela já está vinculado à conta (provado por código),
// então o WhatsApp é um canal autenticado do mesmo nível do e-mail: o link
// abre a área de membros já logada, sem código e sem senha.
//
// Segurança:
//   - token aleatório de 32 bytes, guardado só como hash SHA-256;
//   - vale 10 minutos e UMA vez (used_at); amarrado ao user_id;
//   - só nasce em resposta a uma mensagem dela (janela aberta), nunca em
//     disparo da empresa;
//   - a página troca o token por sessão só depois de um toque em "Entrar"
//     (POST), então robô de prévia de link (GET) não consome o acesso;
//   - o destino é um caminho relativo da área de membros, nunca URL externa.
// O risco que sobra é o do próprio WhatsApp: celular dela desbloqueado.

import crypto from 'node:crypto';
import { getPool } from '../db.js';

const VALIDADE_MIN = 10;
const MEMBROS = (process.env.MEMBROS_URL || 'https://nutrilualves.com.br/membros').replace(/\/$/, '');

const hash = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
const TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/;

/** Caminho dentro da área de membros ("/lista?ws=..."); qualquer outra coisa vira "/". */
export function destinoSeguro(caminho) {
  const s = String(caminho || '').trim();
  if (!s.startsWith('/') || s.startsWith('//') || /[\s\\]/.test(s) || s.length > 200) return '/';
  return s;
}

/** Cria o link pra este usuário abrir `caminho` já logado. Devolve a URL completa. */
export async function criarLink(userId, caminho = '/') {
  const token = crypto.randomBytes(32).toString('base64url');
  const destino = destinoSeguro(caminho);
  await getPool().query(
    `INSERT INTO login_links (user_id, token_hash, destino, expires_at)
     VALUES ($1, $2, $3, NOW() + ($4 || ' minutes')::interval)`,
    [userId, hash(token), destino, String(VALIDADE_MIN)],
  );
  return `${MEMBROS}/entrar?t=${token}&para=${encodeURIComponent(destino)}`;
}

/**
 * Troca o token por um usuário, uma vez só. Devolve { ok, user, destino } ou
 * { ok: false, motivo: 'FORMATO_INVALIDO' | 'NAO_ENCONTRADO' | 'EXPIRADO' | 'USADO' }.
 * A marcação de uso é atômica (UPDATE ... WHERE used_at IS NULL): duas trocas
 * simultâneas do mesmo link, só uma passa.
 */
export async function trocarLink(tokenBruto) {
  const token = String(tokenBruto || '').trim();
  if (!TOKEN_RE.test(token)) return { ok: false, motivo: 'FORMATO_INVALIDO' };
  const pool = getPool();
  const { rows: [l] } = await pool.query(
    `SELECT id, user_id, destino, expires_at, used_at FROM login_links WHERE token_hash = $1`, [hash(token)]);
  if (!l) return { ok: false, motivo: 'NAO_ENCONTRADO' };
  if (l.used_at) return { ok: false, motivo: 'USADO' };
  if (new Date(l.expires_at).getTime() < Date.now()) return { ok: false, motivo: 'EXPIRADO' };
  const { rowCount } = await pool.query(`UPDATE login_links SET used_at = NOW() WHERE id = $1 AND used_at IS NULL`, [l.id]);
  if (!rowCount) return { ok: false, motivo: 'USADO' };
  const { rows: [user] } = await pool.query(`SELECT id, display_name, email, role FROM users WHERE id = $1`, [l.user_id]);
  if (!user) return { ok: false, motivo: 'NAO_ENCONTRADO' };
  return { ok: true, user, destino: l.destino };
}

/** Limpeza: links vencidos há mais de 1 dia (chamado junto com limparCodigosAntigos). */
export async function limparLinksAntigos() {
  await getPool().query(`DELETE FROM login_links WHERE expires_at < NOW() - INTERVAL '1 day'`);
}
