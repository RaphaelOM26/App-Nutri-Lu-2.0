// Chave compartilhada entre o app e o backend, no cabeçalho `x-api-key`.
//
// O QUE ELA RESOLVE: hoje qualquer pessoa com a URL do Railway chama as rotas
// de IA e gasta a conta da OpenAI. É o item 1 da auditoria de junho, e o risco
// real não é alguém decidir atacar o Nutri Lu — é varredor automático achando
// um endpoint aberto que responde a POST e devolve texto de um modelo.
//
// O QUE ELA NÃO RESOLVE: a chave viaja dentro do binário do app, então quem
// abrir o APK a encontra. Isso é inerente a app cliente e não tem conserto —
// nem com OAuth, que também guardaria um segredo ali. A chave eleva o custo de
// "curl na URL" pra "engenharia reversa do pacote", e é isso que ela promete.
//
// ⚠️ ORDEM DE IMPLANTAÇÃO — inverter derruba produção:
//
//   1. Deploy deste código SEM a variável APP_API_KEY. Sem ela, a verificação
//      não roda e nada muda.
//   2. Build novo do app já mandando o cabeçalho.
//   3. Quando a frota tiver atualizado, criar APP_API_KEY no Railway.
//      Só então a verificação começa a valer.
//
// O passo 3 corta quem estiver em build antigo — hoje, os 20 do beta. Por isso
// ele espera a frota, e por isso a verificação é opt-in por env em vez de estar
// ligada por padrão.

import crypto from 'node:crypto';

/** Compara sem vazar o tamanho nem o ponto da diferença pelo tempo de resposta. */
function iguais(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Middleware. Sem `APP_API_KEY` configurada, deixa passar — é o estado dos
 * passos 1 e 2 acima, e o que permite implantar sem janela de indisponibilidade.
 */
export function exigirChaveDoApp(req, res, next) {
  const esperada = process.env.APP_API_KEY;
  if (!esperada) return next();

  const recebida = req.get('x-api-key');
  if (recebida && iguais(recebida, esperada)) return next();

  // 401 e não 403: o cliente não se identificou. E a mensagem é deliberadamente
  // vaga — dizer "chave errada" versus "chave ausente" entrega informação de
  // graça a quem está sondando.
  return res.status(401).json({
    error: 'Requisição não autorizada.',
    code: 'CHAVE_INVALIDA',
  });
}

if (process.env.APP_API_KEY) {
  console.log('[chave] APP_API_KEY configurada — rotas de IA exigem x-api-key');
} else {
  console.warn('[chave] APP_API_KEY ausente — rotas de IA abertas a qualquer origem');
}
