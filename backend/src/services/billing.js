// Acesso pago: quem tem direito, e como o direito é concedido.
//
// O app é bônus do acompanhamento da nutricionista, vendido fora das lojas.
// Então o servidor precisa responder uma pergunta só: **esta conta tem acesso
// AGORA?** Tudo aqui existe pra responder isso de forma que não fique
// desatualizada — em especial no dia do reembolso.
//
// Princípio: o acesso é DERIVADO da tabela `purchases` a cada consulta, nunca
// gravado como um campo no usuário. Direito guardado em dois lugares vira
// direito divergente.

import crypto from 'node:crypto';
import { getPool } from '../db.js';
import { requireAuth } from './auth.js';

// Trava de segurança. Enquanto desligada, as rotas caras seguem abertas como
// hoje — o código pode ir pra produção sem cortar o acesso de ninguém antes de
// o app ter a tela de ativação pronta. Liga com ENFORCE_PREMIUM=1 no Railway.
const ENFORCE = process.env.ENFORCE_PREMIUM === '1';

// Alfabeto sem os caracteres que as pessoas confundem ao digitar: 0/O e 1/I/L.
// Erro de digitação em código de acesso não vira erro de digitação — vira
// mensagem no WhatsApp do Raphael.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const GRUPOS = 3;
const TAMANHO_GRUPO = 4;

/** Normaliza e-mail pra comparação: minúsculo e sem espaços nas pontas. */
export function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : null;
}

function sortearCodigo() {
  const grupos = [];
  for (let g = 0; g < GRUPOS; g++) {
    let bloco = '';
    for (let i = 0; i < TAMANHO_GRUPO; i++) {
      // randomInt é uniforme — Math.random é previsível e o resto de
      // randomBytes % alfabeto teria viés nas primeiras letras.
      bloco += ALFABETO[crypto.randomInt(0, ALFABETO.length)];
    }
    grupos.push(bloco);
  }
  return grupos.join('-');
}

/** Aceita o código digitado de qualquer jeito: minúsculo, sem hífen, com espaço. */
export function normalizarCodigo(bruto) {
  const limpo = String(bruto || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (limpo.length !== GRUPOS * TAMANHO_GRUPO) return null;
  return limpo.match(/.{1,4}/g).join('-');
}

/**
 * Registra uma compra e emite o código dela.
 *
 * Idempotente por (source, external_id): a plataforma de venda reenvia o mesmo
 * evento quando não recebe confirmação, e sem isso o mesmo pagamento viraria
 * duas compras e dois códigos.
 */
export async function registrarCompra({ source, externalId, email, validoAte }) {
  const p = getPool();
  const { rows } = await p.query(
    `INSERT INTO purchases (source, external_id, email, valido_ate)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (source, external_id) WHERE external_id IS NOT NULL
     DO UPDATE SET email = COALESCE(EXCLUDED.email, purchases.email),
                   valido_ate = EXCLUDED.valido_ate,
                   updated_at = NOW()
     RETURNING id`,
    [source, externalId || null, normalizarEmail(email), validoAte || null],
  );
  const purchaseId = rows[0].id;

  // Uma compra tem um código. Se já existe (reenvio do webhook), devolve o
  // mesmo — emitir um segundo confundiria o comprador que já recebeu o primeiro.
  const { rows: jaTem } = await p.query('SELECT code FROM access_codes WHERE purchase_id = $1', [purchaseId]);
  if (jaTem[0]) return { purchaseId, code: jaTem[0].code, novo: false };

  // A garantia de unicidade é a PRIMARY KEY, não a probabilidade. Colisão é
  // improvável, mas "improvável" não é "impossível" — o retry é o que garante.
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const code = sortearCodigo();
    try {
      await p.query('INSERT INTO access_codes (code, purchase_id) VALUES ($1, $2)', [code, purchaseId]);
      return { purchaseId, code, novo: true };
    } catch (e) {
      if (e?.code !== '23505') throw e;
    }
  }
  throw new Error('não consegui gerar um código único');
}

/** Muda o estado da compra (reembolso, cancelamento). O acesso cai junto. */
export async function atualizarStatusCompra({ source, externalId, status }) {
  const { rowCount } = await getPool().query(
    `UPDATE purchases SET status = $3, updated_at = NOW()
      WHERE source = $1 AND external_id = $2`,
    [source, externalId, status],
  );
  return rowCount > 0;
}

/**
 * Vincula um código a uma conta.
 *
 * O UPDATE condicional é o que impede dois resgates: se o código vazar antes de
 * ser usado e duas pessoas tentarem ao mesmo tempo, um SELECT seguido de UPDATE
 * deixaria as duas passarem. Aqui só a primeira volta com linha.
 */
export async function resgatarCodigo(codigoBruto, userId) {
  const code = normalizarCodigo(codigoBruto);
  if (!code) return { ok: false, motivo: 'FORMATO_INVALIDO' };

  const { rows } = await getPool().query(
    `UPDATE access_codes
        SET redeemed_by_user_id = $2, redeemed_at = NOW()
      WHERE code = $1 AND redeemed_by_user_id IS NULL
      RETURNING purchase_id`,
    [code, userId],
  );
  if (rows[0]) return { ok: true };

  // Não voltou linha: ou o código não existe, ou já foi usado. Distinguir os
  // dois casos ajuda o suporte — e o resgate pelo PRÓPRIO dono não é erro.
  const { rows: existente } = await getPool().query(
    'SELECT redeemed_by_user_id FROM access_codes WHERE code = $1',
    [code],
  );
  if (!existente[0]) return { ok: false, motivo: 'NAO_ENCONTRADO' };
  if (existente[0].redeemed_by_user_id === userId) return { ok: true, jaEra: true };
  return { ok: false, motivo: 'JA_USADO' };
}

/**
 * A pergunta central: esta conta tem acesso agora?
 *
 * Duas formas de ter: o e-mail verificado pelo provedor de login bate com o da
 * compra (caminho normal, sem código), ou existe código dessa compra resgatado
 * por esta conta (caminho de exceção).
 */
export async function temAcesso(userId) {
  const { rows } = await getPool().query(
    `SELECT p.id, p.source, p.valido_ate
       FROM users u
       JOIN purchases p
         ON (
              (p.email IS NOT NULL AND u.email IS NOT NULL AND p.email = BTRIM(LOWER(u.email)))
              OR EXISTS (
                   SELECT 1 FROM access_codes c
                    WHERE c.purchase_id = p.id AND c.redeemed_by_user_id = u.id
                 )
            )
      WHERE u.id = $1
        AND p.status = 'ativa'
        AND (p.valido_ate IS NULL OR p.valido_ate > NOW())
      LIMIT 1`,
    [userId],
  );
  if (!rows[0]) return { acesso: false };
  return { acesso: true, origem: rows[0].source, validoAte: rows[0].valido_ate };
}

/**
 * Middleware das rotas que custam dinheiro (foto IA, voz, chat).
 *
 * Precisa existir NO SERVIDOR: esconder o botão no app não impede ninguém de
 * chamar o endpoint direto — e quem paga a conta da OpenAI é o dono do app.
 */
export function requirePremium(req, res, next) {
  if (!ENFORCE) return next();
  requireAuth(req, res, () => {
    temAcesso(req.user.userId)
      .then(({ acesso }) => {
        if (acesso) return next();
        // 402 em vez de 403: o app distingue "não tem direito" (mostra a tela
        // de ativação) de "sessão inválida" (manda entrar de novo).
        res.status(402).json({
          error: 'Este recurso faz parte do acompanhamento.',
          code: 'PREMIUM_REQUIRED',
        });
      })
      .catch(next);
  });
}

if (ENFORCE) console.log('[acesso] ENFORCE_PREMIUM=1 — rotas de IA exigem acesso ativo');
else console.warn('[acesso] ENFORCE_PREMIUM desligado — rotas de IA abertas');
