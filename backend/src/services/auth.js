// Autenticação social (Sign in with Apple / Google) → sessão própria via JWT.
//
// Fluxo: o app faz o login NATIVO com Apple/Google e recebe um identity token
// (JWT assinado por eles). Aqui validamos esse token contra as chaves públicas
// (JWKS) do provedor — assinatura, emissor e audience — e extraímos o `sub`,
// o identificador estável da pessoa naquele provedor. Nunca confiamos em
// campos soltos vindos do app: só no que está DENTRO do token verificado.
//
// Depois emitimos um JWT NOSSO (HS256 com JWT_SECRET) de longa duração — é ele
// que o app guarda e manda em Authorization: Bearer nas rotas da comunidade.
// Assim a verificação cara (JWKS remoto) acontece só no login, não a cada request.

import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import { getPool } from '../db.js';

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID || 'com.nutrilu.app';
// Google aceita mais de um client id (Web/Android/iOS) — env separada por vírgula
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const SESSION_DAYS = 180;

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw Object.assign(new Error('JWT_SECRET não configurado no servidor'), { status: 500 });
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

// Valida o identity token do provedor e retorna { sub, email }.
export async function verifyProviderToken(provider, identityToken) {
  try {
    if (provider === 'apple') {
      const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: APPLE_BUNDLE_ID,
      });
      return { sub: payload.sub, email: payload.email || null };
    }
    if (provider === 'google') {
      if (GOOGLE_CLIENT_IDS.length === 0) {
        // status 500 explícito: sem ele o catch abaixo mascararia erro de CONFIG
        // como 401 "token inválido" (e vazaria o nome da env pro cliente).
        throw Object.assign(new Error('Login Google indisponível no momento'), {
          status: 500,
          code: 'SERVER_MISCONFIGURED',
        });
      }
      const { payload } = await jwtVerify(identityToken, GOOGLE_JWKS, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: GOOGLE_CLIENT_IDS,
      });
      return { sub: payload.sub, email: payload.email || null, name: payload.name || null };
    }
  } catch (e) {
    if (e.status) throw e;
    throw Object.assign(new Error(`Token de identidade inválido (${provider}): ${e.message}`), {
      status: 401,
      code: 'INVALID_IDENTITY_TOKEN',
    });
  }
  throw Object.assign(new Error(`Provider desconhecido: ${provider}`), { status: 400 });
}

// Upsert do usuário pela chave (provider, provider_sub). display_name só é
// definido na criação (Apple manda o nome UMA vez, no primeiro login) — updates
// posteriores preservam o nome já salvo, mas preenchem email/device_id se vierem.
export async function upsertUser({ provider, sub, displayName, email, deviceId }) {
  const p = getPool();
  const { rows } = await p.query(
    `INSERT INTO users (provider, provider_sub, display_name, email, device_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (provider, provider_sub) DO UPDATE SET
       email = COALESCE(users.email, EXCLUDED.email),
       device_id = COALESCE(EXCLUDED.device_id, users.device_id)
     RETURNING id, provider, display_name, email`,
    [provider, sub, displayName, email, deviceId || null]
  );
  return rows[0];
}

export async function issueSessionToken(user) {
  return new SignJWT({ name: user.display_name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(jwtSecret());
}

async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ['HS256'] });
  return { userId: payload.sub, name: payload.name };
}

// Middleware: exige Bearer token válido; põe req.user = { userId, name }.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Login necessário', code: 'AUTH_REQUIRED' });
  }
  verifySessionToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => res.status(401).json({ error: 'Sessão expirada — entre de novo', code: 'AUTH_EXPIRED' }));
}

// Middleware: tenta autenticar mas segue sem user se não houver/for inválido.
// Usado no feed: anônimo vê tudo; logado vê também a própria avaliação.
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  verifySessionToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => next());
}
