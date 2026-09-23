// Cloudflare Turnstile: prova de "é gente" antes de rotas que custam por
// chamada sem login — hoje só o pedido de código de login por e-mail.
//
// Por quê: o /auth/email/request é aberto (não tem como ter sessão antes de
// entrar) e cada chamada manda um e-mail pelo Resend. O teto por IP segura um
// script de uma máquina só; não segura quem troca de IP. O Turnstile põe um
// desafio no navegador que um script não resolve, e na maioria dos casos a
// pessoa nem vê nada. Grátis e sem limite de volume: custo zero em 10 mil.
//
// Liga só com a env. Sem TURNSTILE_SECRET (dev, testes, ou enquanto o Pages
// não tem a site key), a rota segue sem exigir token — ligar o servidor antes
// do site quebraria o login de todo mundo.
//
// Como ligar (Cloudflare → Turnstile → Add widget → domínio
// nutrilualves.com.br, modo Managed): a SITE KEY vai pro Pages como
// VITE_TURNSTILE_SITE_KEY; a SECRET KEY vai pro Railway como TURNSTILE_SECRET.
// Primeiro o Pages (o site passa a mandar o token, o servidor ignora), depois
// o Railway (o servidor passa a exigir). Chaves de teste da Cloudflare:
// secret 1x0000000000000000000000000000000AA aceita tudo, 2x…AA recusa tudo.

const URL_VERIFICACAO = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 5000;

export function turnstileLigado() {
  return Boolean(process.env.TURNSTILE_SECRET);
}

/**
 * Confere o token que o widget gerou no navegador. Devolve { ok, motivo? }.
 * Cloudflare fora do ar conta como recusa: é raro, e o contrário (aceitar sem
 * conferir) devolveria o buraco que este módulo existe pra fechar.
 */
export async function verificarTurnstile(token, ip) {
  if (!token || typeof token !== 'string' || token.length > 2048) return { ok: false, motivo: 'TOKEN_AUSENTE' };
  const corpo = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET, response: token });
  if (ip) corpo.set('remoteip', ip);
  try {
    const res = await fetch(URL_VERIFICACAO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: corpo,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const dados = await res.json();
    if (dados.success) return { ok: true };
    // Códigos da Cloudflare (timeout-or-duplicate, invalid-input-response…)
    // só no log: pro navegador a resposta é uma só, "tenta de novo".
    console.warn('[turnstile] recusado:', (dados['error-codes'] || []).join(','));
    return { ok: false, motivo: 'RECUSADO' };
  } catch (e) {
    console.error('[turnstile] verificação falhou:', e.message);
    return { ok: false, motivo: 'INDISPONIVEL' };
  }
}
