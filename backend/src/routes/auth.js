// Rotas de autenticação social.
//
// POST /auth/social — troca o identity token do provedor por uma sessão nossa.
//   body: { provider: 'apple'|'google', identity_token, display_name?, device_id? }
//   → { token, user: { id, displayName, email } }
//   display_name só é usado na CRIAÇÃO do usuário (a Apple manda o nome apenas
//   no primeiro login; o app captura e repassa aqui).
//
// GET /auth/me — valida a sessão atual e devolve o perfil (o app chama no boot
//   pra saber se o login guardado ainda vale).
//
// POST /auth/dev — login fake pra desenvolvimento local, SÓ existe quando
//   ALLOW_DEV_LOGIN=1 no env. Nunca ligar no Railway de produção.

import { Router } from 'express';
import {
  verifyProviderToken,
  upsertUser,
  issueSessionToken,
  requireAuth,
} from '../services/auth.js';
import { getPool } from '../db.js';

const router = Router();

router.post('/social', async (req, res, next) => {
  try {
    const { provider, identity_token: identityToken, display_name: displayName, device_id: deviceId } = req.body || {};
    if (!provider || !identityToken) {
      return res.status(400).json({ error: 'provider e identity_token são obrigatórios', code: 'BAD_REQUEST' });
    }

    const verified = await verifyProviderToken(provider, identityToken);
    // Nome: preferimos o que o provedor afirma dentro do token (Google);
    // Apple não põe nome no token, então usamos o display_name do body
    // (capturado pelo app no 1º login). Fallback: prefixo do email ou genérico.
    const name =
      (verified.name || '').trim() ||
      (displayName || '').trim() ||
      (verified.email ? verified.email.split('@')[0] : 'Membro Nutri Lu');

    const user = await upsertUser({
      provider,
      sub: verified.sub,
      displayName: name.slice(0, 40),
      email: verified.email,
      deviceId,
    });
    const token = await issueSessionToken(user);
    res.json({ token, user: { id: user.id, displayName: user.display_name, email: user.email } });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      'SELECT id, display_name, email FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Usuário não existe mais', code: 'AUTH_EXPIRED' });
    res.json({ user: { id: rows[0].id, displayName: rows[0].display_name, email: rows[0].email } });
  } catch (e) {
    next(e);
  }
});

// Login fake de desenvolvimento — cria/reusa um user 'dev' pelo nome informado.
if (process.env.ALLOW_DEV_LOGIN === '1') {
  router.post('/dev', async (req, res, next) => {
    try {
      const name = (req.body?.display_name || '').trim() || 'Dev Tester';
      const user = await upsertUser({
        provider: 'dev',
        sub: name.toLowerCase().replace(/\s+/g, '-'),
        displayName: name,
        email: null,
        deviceId: req.body?.device_id,
      });
      const token = await issueSessionToken(user);
      res.json({ token, user: { id: user.id, displayName: user.display_name, email: null } });
    } catch (e) {
      next(e);
    }
  });
  console.warn('[auth] ⚠ ALLOW_DEV_LOGIN=1 — rota POST /auth/dev ATIVA (nunca usar em produção)');
}

export default router;
