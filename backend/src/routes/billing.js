// Acesso pago.
//
// GET  /billing/me      (auth) — esta conta tem acesso? o app usa pra decidir
//                                se mostra o conteúdo ou a tela de ativação
// POST /billing/redeem  (auth) — vincula um código de acesso à conta
//
// A ingestão do webhook da plataforma de venda ainda NÃO está aqui: depende de
// confirmar o formato exato do payload e, principalmente, de como validar a
// assinatura — sem essa validação qualquer um POSTa "compra aprovada" e ganha
// acesso vitalício de graça. Até lá, concessão manual pelo script
// scripts/conceder-acesso.mjs.

import { Router } from 'express';
import { requireAuth } from '../services/auth.js';
import { temAcesso, resgatarCodigo } from '../services/billing.js';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const info = await temAcesso(req.user.userId);
    res.json(info);
  } catch (e) {
    next(e);
  }
});

// Limite de tentativas por conta. Com 31^12 combinações a força bruta já é
// inviável, mas o teto transforma inviável em impossível e custa quase nada.
const TENTATIVAS_MAX = 10;
const JANELA_MS = 10 * 60 * 1000;
const tentativas = new Map();

function excedeuTentativas(userId) {
  const agora = Date.now();
  const registro = tentativas.get(userId);
  if (!registro || agora - registro.desde > JANELA_MS) {
    tentativas.set(userId, { desde: agora, n: 1 });
    return false;
  }
  registro.n += 1;
  return registro.n > TENTATIVAS_MAX;
}

router.post('/redeem', requireAuth, async (req, res, next) => {
  try {
    if (excedeuTentativas(req.user.userId)) {
      return res.status(429).json({
        error: 'Muitas tentativas. Aguarde alguns minutos.',
        code: 'RATE_LIMITED',
      });
    }

    const resultado = await resgatarCodigo(req.body?.code, req.user.userId);
    if (resultado.ok) {
      const info = await temAcesso(req.user.userId);
      return res.json({ ok: true, ...info });
    }

    // Mensagens diferentes por motivo — "código inválido" pra tudo faz o
    // comprador legítimo achar que digitou errado quando na verdade alguém já
    // usou o código dele, que é uma conversa completamente diferente.
    const mensagens = {
      FORMATO_INVALIDO: 'Esse código não parece completo. Confira e tente de novo.',
      NAO_ENCONTRADO: 'Não encontrei esse código.',
      JA_USADO: 'Esse código já foi usado em outra conta.',
    };
    res.status(400).json({
      error: mensagens[resultado.motivo] || 'Código inválido.',
      code: resultado.motivo,
    });
  } catch (e) {
    next(e);
  }
});

// Concessão de acesso para DESENVOLVIMENTO. Só existe quando ALLOW_DEV_LOGIN=1,
// a mesma flag que libera o login fake — as duas juntas permitem testar o fluxo
// completo pela API sem acesso ao banco. Nunca ligar em produção com clientes.
if (process.env.ALLOW_DEV_LOGIN === '1') {
  const { registrarCompra } = await import('../services/billing.js');

  router.post('/dev-grant', async (req, res, next) => {
    try {
      const meses = Number(req.body?.meses ?? 3);
      const validoAte = new Date();
      validoAte.setMonth(validoAte.getMonth() + meses);
      const r = await registrarCompra({
        source: 'cortesia',
        externalId: req.body?.external_id || `dev-${Date.now()}`,
        email: req.body?.email || null,
        validoAte,
      });
      res.json({ ...r, validoAte });
    } catch (e) {
      next(e);
    }
  });

  console.warn('[acesso] ⚠ ALLOW_DEV_LOGIN=1 — rota POST /billing/dev-grant ATIVA');
}

export default router;
