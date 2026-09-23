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
import { validar } from '../utils/validar.js';
import * as S from '../schemas/outros.js';

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

router.post('/redeem', requireAuth, validar(S.resgatarCodigo), async (req, res, next) => {
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

// ─── Webhook da Hotmart ──────────────────────────────────────────────────
//
// POST /billing/hotmart — a Hotmart chama aqui a cada evento da venda.
//
// Validação: a Hotmart manda o "hottok" (token secreto da conta) no cabeçalho
// X-HOTMART-HOTTOK (webhook 2.0) ou no corpo (1.0). Sem ele bater com
// HOTMART_HOTTOK, o evento é ignorado com 401 — é isso que impede alguém de
// POSTar "compra aprovada" e ganhar acesso.
//
// O que vira acesso: PURCHASE_APPROVED e PURCHASE_COMPLETE. O que derruba:
// PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, PURCHASE_CANCELED,
// SUBSCRIPTION_CANCELLATION. Qualquer outro evento responde 200 e não faz nada
// (a Hotmart reenvia o que não recebe 2xx).
//
// Validade: HOTMART_MESES_ACESSO (padrão 4) contados da aprovação. Assinatura
// recorrente renova a cada PURCHASE_APPROVED novo da mesma assinatura.

import { registrarCompra, atualizarStatusCompra } from '../services/billing.js';
import { convidarCompradora } from '../services/whatsapp/convites.js';

const EVENTOS_ATIVAM = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const EVENTOS_DERRUBAM = {
  PURCHASE_REFUNDED: 'reembolsada',
  PURCHASE_CHARGEBACK: 'reembolsada',
  PURCHASE_CANCELED: 'cancelada',
  SUBSCRIPTION_CANCELLATION: 'cancelada',
  PURCHASE_EXPIRED: 'expirada',
};

router.post('/hotmart', async (req, res, next) => {
  try {
    const esperado = process.env.HOTMART_HOTTOK;
    if (!esperado) {
      console.warn('[hotmart] HOTMART_HOTTOK ausente — webhook ignorado');
      return res.status(503).json({ error: 'Webhook não configurado', code: 'SERVER_MISCONFIGURED' });
    }
    const recebido = req.get('x-hotmart-hottok') || req.body?.hottok;
    if (!recebido || String(recebido) !== esperado) {
      return res.status(401).json({ error: 'Não autorizado', code: 'HOTTOK_INVALIDO' });
    }

    const body = req.body || {};
    const evento = String(body.event || body.status || '').toUpperCase();
    const data = body.data || body;
    const email = data.buyer?.email || body.email || null;
    const transacao = data.purchase?.transaction || body.transaction || null;
    if (!transacao) return res.status(200).json({ ok: true, ignorado: 'sem transação' });

    if (EVENTOS_ATIVAM.has(evento)) {
      const meses = Number(process.env.HOTMART_MESES_ACESSO || 4);
      const validoAte = new Date();
      validoAte.setMonth(validoAte.getMonth() + meses);
      const r = await registrarCompra({ source: 'hotmart', externalId: transacao, email, validoAte });
      console.log(`[hotmart] ${evento} ${transacao} → compra ${r.purchaseId}${r.novo ? ' (nova)' : ''}`);
      // Boas-vindas pelo WhatsApp (só compra NOVA, só com WHATSAPP_BOAS_VINDAS=1).
      // É o ÚNICO ponto de contato desta rota com a função: tirar esta chamada,
      // ou desligar a variável, e a venda segue liberando acesso igual. O
      // telefone é o do checkout (2.0: DDD em checkout_phone_code).
      if (r.novo) {
        convidarCompradora({
          purchaseId: r.purchaseId, email, nome: data.buyer?.first_name || data.buyer?.name || null,
          ddd: data.buyer?.checkout_phone_code, telefone: data.buyer?.checkout_phone || data.buyer?.phone || body.phone_checkout_number,
        });
      }
      return res.json({ ok: true, purchase_id: r.purchaseId });
    }
    if (EVENTOS_DERRUBAM[evento]) {
      const ok = await atualizarStatusCompra({ source: 'hotmart', externalId: transacao, status: EVENTOS_DERRUBAM[evento] });
      console.log(`[hotmart] ${evento} ${transacao} → ${EVENTOS_DERRUBAM[evento]}${ok ? '' : ' (compra não encontrada)'}`);
      return res.json({ ok: true, atualizada: ok });
    }
    res.json({ ok: true, ignorado: evento || 'evento desconhecido' });
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
