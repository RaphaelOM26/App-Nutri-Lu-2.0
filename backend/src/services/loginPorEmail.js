// Login por e-mail com código de uso único.
//
// Por que e-mail, e não Google/Apple, na área web: a venda é pela Hotmart, e o
// que a Hotmart nos dá da compradora é o E-MAIL. Se ela entra com o mesmo
// e-mail que usou na compra, o acesso casa sozinho (ver services/billing.js →
// temAcesso), sem código de resgate e sem depender de ela ter conta Google.
//
// Fluxo:
//   1. POST /auth/email/request { email }  → gera código de 6 dígitos, guarda o
//      HASH (nunca o código) com validade de 10 min, manda por e-mail.
//   2. POST /auth/email/verify { email, code } → confere, marca como usado,
//      cria/reusa o usuário (provider 'email', sub = e-mail) e emite a sessão.
//
// Proteções: 5 tentativas por código, 1 pedido por minuto por e-mail, e a
// resposta do request é igual exista ou não a compra — não entrega quem é
// cliente pra quem está sondando.

import crypto from 'node:crypto';
import { getPool } from '../db.js';
import { normalizarEmail } from './billing.js';

const VALIDADE_MIN = 10;
const TENTATIVAS_MAX = 5;
const INTERVALO_MIN_MS = 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email) {
  return typeof email === 'string' && EMAIL_RE.test(email) && email.length <= 254;
}

function hashCodigo(email, codigo) {
  // HMAC com o segredo do servidor: um dump da tabela não permite reconstruir
  // códigos vivos (6 dígitos são poucos pra um hash simples).
  const chave = process.env.JWT_SECRET || 'sem-segredo';
  return crypto.createHmac('sha256', chave).update(`${email}:${codigo}`).digest('hex');
}

function sortearCodigo() {
  // randomInt é uniforme; zero à esquerda é permitido (o código é texto).
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

/**
 * Gera e registra um código novo. Devolve o código EM CLARO só pra quem envia
 * o e-mail (e pro log em dev) — ele não é guardado.
 */
export async function criarCodigo(emailBruto) {
  const email = normalizarEmail(emailBruto);
  const p = getPool();

  const { rows: ultimo } = await p.query(
    'SELECT created_at FROM login_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
    [email],
  );
  if (ultimo[0] && Date.now() - new Date(ultimo[0].created_at).getTime() < INTERVALO_MIN_MS) {
    throw Object.assign(new Error('Acabei de mandar um código. Confere a caixa de entrada e o spam, ou espera um minuto.'), {
      status: 429,
      code: 'RATE_LIMITED',
    });
  }

  // Um código vivo por e-mail: o anterior morre quando sai um novo, senão a
  // pessoa que pediu duas vezes fica com dois válidos.
  await p.query('UPDATE login_codes SET used_at = NOW() WHERE email = $1 AND used_at IS NULL', [email]);

  const codigo = sortearCodigo();
  await p.query(
    `INSERT INTO login_codes (email, code_hash, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
    [email, hashCodigo(email, codigo), String(VALIDADE_MIN)],
  );
  return { email, codigo, validadeMin: VALIDADE_MIN };
}

/**
 * Confere o código. Sucesso consome o código (used_at); erro conta tentativa.
 * Devolve { ok, motivo? }.
 */
export async function conferirCodigo(emailBruto, codigoBruto) {
  const email = normalizarEmail(emailBruto);
  const codigo = String(codigoBruto || '').replace(/\D/g, '');
  if (codigo.length !== 6) return { ok: false, motivo: 'FORMATO_INVALIDO' };

  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, code_hash, expires_at, attempts
       FROM login_codes
      WHERE email = $1 AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1`,
    [email],
  );
  const vivo = rows[0];
  if (!vivo) return { ok: false, motivo: 'NAO_ENCONTRADO' };
  if (new Date(vivo.expires_at).getTime() < Date.now()) return { ok: false, motivo: 'EXPIRADO' };
  if (vivo.attempts >= TENTATIVAS_MAX) return { ok: false, motivo: 'MUITAS_TENTATIVAS' };

  const esperado = Buffer.from(vivo.code_hash);
  const recebido = Buffer.from(hashCodigo(email, codigo));
  const bate = esperado.length === recebido.length && crypto.timingSafeEqual(esperado, recebido);

  if (!bate) {
    await p.query('UPDATE login_codes SET attempts = attempts + 1 WHERE id = $1', [vivo.id]);
    return { ok: false, motivo: 'CODIGO_ERRADO', restantes: TENTATIVAS_MAX - vivo.attempts - 1 };
  }

  // UPDATE condicional: dois verifies simultâneos com o mesmo código só
  // passam um — o segundo não encontra a linha ainda não usada.
  const { rowCount } = await p.query(
    'UPDATE login_codes SET used_at = NOW() WHERE id = $1 AND used_at IS NULL',
    [vivo.id],
  );
  if (rowCount === 0) return { ok: false, motivo: 'NAO_ENCONTRADO' };
  return { ok: true, email };
}

/** Faxina: códigos com mais de um dia não servem pra nada. */
export async function limparCodigosAntigos() {
  try {
    await getPool().query(`DELETE FROM login_codes WHERE created_at < NOW() - INTERVAL '1 day'`);
  } catch (e) {
    console.warn('[login] faxina de códigos falhou:', e.message);
  }
}
