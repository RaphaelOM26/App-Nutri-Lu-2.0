// Fetch de URL informada pela CLIENTE sem virar porta pra dentro da rede
// (SSRF). Hoje só o /extract-recipe busca URL que a pessoa cola.
//
// O risco: "importa essa receita" com http://169.254.169.254/ (metadados da
// nuvem), http://localhost:5432, http://10.0.0.5/admin… O servidor buscaria
// de dentro do Railway e devolveria o conteúdo pra IA (e pra pessoa). Com
// redirect: um link público que redireciona pra dentro passa pela mesma porta.
//
// Regras:
//   - só http/https, sem usuário:senha na URL, só porta padrão (80/443);
//   - hostname resolvido em DNS ANTES do fetch, e TODO endereço tem que ser
//     público (nada de loopback, privado, link-local, metadados, IPv6 local,
//     IPv4 mapeado em IPv6);
//   - redirect é seguido À MÃO: cada salto passa pelas mesmas regras, no
//     máximo 5 saltos;
//   - corpo limitado a 2 MB e timeout por salto — página de receita não
//     precisa de mais, e o resto é custo.
// Fica o resíduo conhecido: o DNS pode mudar entre a conferência e o fetch
// (rebinding). Pra fechar isso de vez seria um agente de fetch com lookup
// próprio; não vale o peso hoje, porque a rota já exige assinatura e teto.

import dns from 'node:dns/promises';
import net from 'node:net';

const MAX_SALTOS = 5;
const MAX_CORPO = 2 * 1024 * 1024;
const TIMEOUT_MS = 15000;

function erro(mensagem, code = 'URL_INVALIDA', status = 400) {
  return Object.assign(new Error(mensagem), { status, code });
}

/** IPv4 em faixa que nunca é "site público". */
function ipv4Privado(ip) {
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127
    || (a === 100 && b >= 64 && b <= 127) // CGNAT
    || (a === 169 && b === 254)           // link-local + metadados de nuvem
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0)             // 192.0.0.0/24 e 192.0.2.0/24 (doc)
    || (a === 198 && (b === 18 || b === 19))
    || a >= 224;                          // multicast, reservado, broadcast
}

function ipv6Privado(ip) {
  const x = ip.toLowerCase();
  if (x === '::' || x === '::1') return true;
  if (x.startsWith('fe8') || x.startsWith('fe9') || x.startsWith('fea') || x.startsWith('feb')) return true; // link-local
  if (x.startsWith('fc') || x.startsWith('fd')) return true; // ULA
  if (x.startsWith('ff')) return true; // multicast
  // IPv4 mapeado (::ffff:10.0.0.1) ou compatível: julga pelo IPv4 embutido.
  const m = x.match(/(?:^|:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (m) return ipv4Privado(m[1]);
  if (x.startsWith('::ffff:')) return true; // forma hexadecimal do mapeado: não arrisca
  return false;
}

export function ipPrivado(ip) {
  const v = net.isIP(ip);
  if (v === 4) return ipv4Privado(ip);
  if (v === 6) return ipv6Privado(ip);
  return true; // não é IP: não devia chegar aqui
}

/**
 * Valida a URL e resolve o host. Devolve a URL normalizada (string).
 * Lança { status: 400, code: 'URL_INVALIDA' } com mensagem pra pessoa.
 */
export async function validarUrlPublica(entrada) {
  let u;
  try { u = new URL(String(entrada).trim()); } catch { throw erro('Esse link não é válido.'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw erro('Só links http ou https.');
  if (u.username || u.password) throw erro('Esse link não é válido.');
  if (u.port && u.port !== '80' && u.port !== '443') throw erro('Esse link não é válido.');
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.home.arpa')) {
    throw erro('Esse link não aponta pra um site público.');
  }
  if (net.isIP(host)) {
    if (ipPrivado(host)) throw erro('Esse link não aponta pra um site público.');
    return u.toString();
  }
  let enderecos;
  try { enderecos = await dns.lookup(host, { all: true, verbatim: true }); } catch { throw erro('Não achei esse site. Confere o link.', 'URL_FETCH_FAILED', 422); }
  if (!enderecos.length || enderecos.some((e) => ipPrivado(e.address))) throw erro('Esse link não aponta pra um site público.');
  return u.toString();
}

/**
 * fetch com as regras acima, seguindo redirect à mão. Devolve
 * { url (final), status, ok, text() } — o suficiente pra quem só lê HTML.
 */
export async function fetchSeguro(entrada, { headers = {}, timeoutMs = TIMEOUT_MS, maxCorpo = MAX_CORPO } = {}) {
  let url = await validarUrlPublica(entrada);
  for (let salto = 0; salto <= MAX_SALTOS; salto++) {
    const res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const destino = res.headers.get('location');
      // Consome o corpo pra liberar a conexão antes do próximo salto.
      res.body?.cancel().catch(() => {});
      if (!destino) throw erro('Esse link redireciona pra lugar nenhum.', 'URL_FETCH_FAILED', 422);
      if (salto === MAX_SALTOS) throw erro('Esse link redireciona demais.', 'URL_FETCH_FAILED', 422);
      url = await validarUrlPublica(new URL(destino, url).toString());
      continue;
    }
    return {
      url,
      status: res.status,
      ok: res.ok,
      text: () => lerLimitado(res, maxCorpo),
    };
  }
  throw erro('Esse link redireciona demais.', 'URL_FETCH_FAILED', 422);
}

/** Lê o corpo até o limite; o que passar é descartado (página de receita cabe fácil). */
async function lerLimitado(res, maxCorpo) {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const partes = []; let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxCorpo) { partes.push(value.subarray(0, value.byteLength - (total - maxCorpo))); reader.cancel().catch(() => {}); break; }
    partes.push(value);
  }
  return Buffer.concat(partes).toString('utf8');
}
