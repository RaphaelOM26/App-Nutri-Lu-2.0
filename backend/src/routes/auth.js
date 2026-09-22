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
// DELETE /auth/me — exclusão de conta (App Store 5.1.1(v)): apaga o usuário, as
//   receitas que ele publicou e todas as avaliações envolvidas. Irreversível.
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
import { criarCodigo, conferirCodigo, emailValido } from '../services/loginPorEmail.js';
import { trocarLink } from '../services/loginPorLink.js';
import { enviarCodigoLogin } from '../services/email.js';

const router = Router();

// ─── Login por e-mail (área de membros web) ──────────────────────────────
//
// POST /auth/email/request { email }
//   → { ok: true }  (sempre, exista ou não cliente com esse e-mail)
// POST /auth/email/verify  { email, code }
//   → { token, user }
//
// Por que não dizer "e-mail não cadastrado": a lista de clientes da nutri não
// é pública. Quem não comprou recebe o código do mesmo jeito e, ao entrar, vê
// a tela de ativação em vez do plano — o acesso é decidido por temAcesso().

const pedidosPorIp = new Map();
function ipExcedeu(ip) {
  const agora = Date.now();
  const r = pedidosPorIp.get(ip);
  if (!r || agora - r.desde > 60 * 60 * 1000) {
    pedidosPorIp.set(ip, { desde: agora, n: 1 });
    return false;
  }
  r.n += 1;
  return r.n > 30;
}

router.post('/email/request', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!emailValido(email)) {
      return res.status(400).json({ error: 'Digite um e-mail válido.', code: 'BAD_REQUEST' });
    }
    if (ipExcedeu(req.ip)) {
      return res.status(429).json({ error: 'Muitos pedidos. Tente mais tarde.', code: 'RATE_LIMITED' });
    }
    const { codigo } = await criarCodigo(email);
    const { rows } = await getPool().query(
      `SELECT display_name FROM users WHERE provider = 'email' AND provider_sub = $1`,
      [email],
    );
    const envio = await enviarCodigoLogin({ para: email, codigo, nome: rows[0]?.display_name });
    // Em dev sem SMTP o código volta na resposta pra dar pra testar o fluxo
    // inteiro sem caixa de e-mail. Em produção nunca: exigiria SMTP ausente E
    // ALLOW_DEV_LOGIN ligado ao mesmo tempo.
    res.json({ ok: true, ...(envio.dev ? { dev_code: codigo } : {}) });
  } catch (e) {
    next(e);
  }
});

// POST /auth/link — link mágico mandado pela Luna no WhatsApp (uso único,
// 10 min). A página troca o token por sessão só depois de um toque em
// "Entrar", por isso é POST: prévia de link (GET) não consome o acesso.
router.post('/link', async (req, res, next) => {
  try {
    if (ipExcedeu(req.ip)) {
      return res.status(429).json({ error: 'Muitos pedidos. Tente mais tarde.', code: 'RATE_LIMITED' });
    }
    const r = await trocarLink(req.body?.t);
    if (!r.ok) {
      const mensagens = {
        FORMATO_INVALIDO: 'Esse link não é válido.',
        NAO_ENCONTRADO: 'Esse link não é válido. Pede outro pra Luna.',
        EXPIRADO: 'Esse link venceu (vale 10 minutos). Pede outro pra Luna.',
        USADO: 'Esse link já foi usado. Pede outro pra Luna.',
      };
      return res.status(r.motivo === 'FORMATO_INVALIDO' ? 400 : 410).json({ error: mensagens[r.motivo], code: r.motivo });
    }
    const token = await issueSessionToken(r.user);
    res.json({ token, user: { id: r.user.id, displayName: r.user.display_name, email: r.user.email, role: r.user.role || 'cliente' }, destino: r.destino });
  } catch (e) {
    next(e);
  }
});

router.post('/email/verify', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!emailValido(email)) {
      return res.status(400).json({ error: 'Digite um e-mail válido.', code: 'BAD_REQUEST' });
    }
    const r = await conferirCodigo(email, req.body?.code);
    if (!r.ok) {
      const mensagens = {
        FORMATO_INVALIDO: 'O código tem 6 números.',
        NAO_ENCONTRADO: 'Pede um código novo: esse não está mais valendo.',
        EXPIRADO: 'Esse código venceu. Pede um novo.',
        MUITAS_TENTATIVAS: 'Muitas tentativas com esse código. Pede um novo.',
        CODIGO_ERRADO: 'Código errado. Confere o e-mail e tenta de novo.',
      };
      return res.status(400).json({ error: mensagens[r.motivo] || 'Código inválido.', code: r.motivo });
    }
    const user = await upsertUser({
      provider: 'email',
      sub: email,
      // Sem nome informado fica vazio: o pedaço do e-mail não é nome, e o
      // onboarding pergunta como a pessoa quer ser chamada.
      displayName: (req.body?.display_name || '').trim().slice(0, 40),
      email,
      deviceId: req.body?.device_id,
    });
    const token = await issueSessionToken(user);
    // O papel (cliente/nutri/admin) vai junto pra web saber se mostra o
    // painel; a autorização de verdade é sempre do servidor (requirePapel).
    const { rows: papel } = await getPool().query('SELECT role FROM users WHERE id = $1', [user.id]);
    res.json({ token, user: { id: user.id, displayName: user.display_name, email: user.email, role: papel[0]?.role || 'cliente' } });
  } catch (e) {
    next(e);
  }
});

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
    // O papel (cliente/nutri/admin) vai junto pra web saber se mostra o
    // painel; a autorização de verdade é sempre do servidor (requirePapel).
    const { rows: papel } = await getPool().query('SELECT role FROM users WHERE id = $1', [user.id]);
    res.json({ token, user: { id: user.id, displayName: user.display_name, email: user.email, role: papel[0]?.role || 'cliente' } });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await getPool().query(
      'SELECT id, display_name, email, role FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Usuário não existe mais', code: 'AUTH_EXPIRED' });
    res.json({ user: { id: rows[0].id, displayName: rows[0].display_name, email: rows[0].email, role: rows[0].role || 'cliente' } });
  } catch (e) {
    next(e);
  }
});

// DELETE /auth/me — exclusão de conta.
//
// Exigência da App Store 5.1.1(v): todo app que permite CRIAR conta precisa
// permitir APAGÁ-LA de dentro do próprio app (não vale mandar e-mail pro
// suporte). Sem esta rota o app é reprovado na review da loja.
//
// Hard delete, em transação — a pessoa pediu pra sumir, não pra ficar oculta:
//   1. as avaliações que ela deu nas receitas dos outros;
//   2. as avaliações que os outros deram nas receitas dela;
//   3. as receitas que ela publicou na comunidade;
//   4. o registro do usuário.
// Ordem ditada pelas FKs: recipe_ratings → community_recipes → users.
//
// O diário de refeições NÃO é tocado: ele vive em day_snapshots, keyed por
// device_id (anônimo, existe desde antes de haver conta) e continua no
// aparelho. Sair da comunidade não é desinstalar o app — a UI deixa isso
// explícito na confirmação.
router.delete('/me', requireAuth, async (req, res, next) => {
  const client = await getPool().connect();
  try {
    const { userId } = req.user;
    await client.query('BEGIN');
    await client.query('DELETE FROM recipe_ratings WHERE user_id = $1', [userId]);
    await client.query(
      `DELETE FROM recipe_ratings
        WHERE recipe_id IN (SELECT id FROM community_recipes WHERE user_id = $1)`,
      [userId]
    );
    await client.query('DELETE FROM community_recipes WHERE user_id = $1', [userId]);
    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [userId]);
    await client.query('COMMIT');
    // rowCount 0 = a conta já não existia (duplo-toque no botão, ou exclusão
    // feita em outro aparelho com a mesma sessão). O estado desejado já é
    // verdade — responde ok em vez de 404, senão o app mostra erro à toa.
    res.json({ ok: true, deleted: rowCount > 0 });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
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
        // Aceita e-mail no dev pra dar pra exercitar o caminho principal do
        // acesso (o que casa e-mail verificado com a compra, sem código).
        // No login real quem fornece o e-mail é o provedor, nunca o cliente.
        email: req.body?.email || null,
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
