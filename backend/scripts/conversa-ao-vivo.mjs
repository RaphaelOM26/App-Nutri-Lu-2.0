// Conversa AO VIVO com a Luna no servidor local (IA de verdade, custa centavos):
// vincula um número novo à conta demo e manda uma sequência de mensagens
// como a Meta mandaria; imprime o que a Luna respondeu.
import 'dotenv/config';
import pg from 'pg';

const BASE = process.argv[2]?.startsWith("http") ? process.argv.splice(2, 1)[0] : "http://localhost:3101";
const stamp = Date.now();
const WA = `5521${String(stamp).slice(-9)}`;
let seq = 0;
const url = new URL(process.env.DATABASE_URL); url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });

async function chamar(token, metodo, rota, body) {
  const res = await fetch(`${BASE}${rota}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return res.json();
}
async function esvaziar(segundos = 60) {
  const fim = Date.now() + segundos * 1000;
  while (Date.now() < fim) {
    const { rows: [r] } = await pool.query(`SELECT COUNT(*)::int AS n FROM whatsapp_fila WHERE chave = $1 AND status IN ('pendente', 'processando')`, [WA]);
    if (r.n === 0) return;
    await new Promise((ok) => setTimeout(ok, 400));
  }
}
let vistas = 0;
async function novas() {
  const { rows } = await pool.query(
    `SELECT m.texto, m.tipo, m.autor FROM whatsapp_mensagens m JOIN whatsapp_contatos c ON c.id = m.contato_id
      WHERE c.wa_id = $1 AND m.direcao = 'out' ORDER BY m.criado_em ASC, m.id ASC`, [WA]);
  const n = rows.slice(vistas); vistas = rows.length; return n;
}
async function texto(body) {
  const msg = { from: WA, id: `wamid.vivo.${stamp}.${++seq}`, timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body } };
  const corpo = { object: 'whatsapp_business_account', entry: [{ id: 'WABA', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { display_phone_number: '5521900000000', phone_number_id: 'TESTE' }, contacts: [{ wa_id: WA, profile: { name: 'Raphael Teste' } }], messages: [msg] } }] }] };
  await fetch(`${BASE}/whatsapp/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  await esvaziar();
  console.log(`\n\x1b[32m> ${body}\x1b[0m`);
  for (const m of await novas()) console.log(`\x1b[36m[${m.autor}${m.tipo !== 'text' ? ' · ' + m.tipo : ''}]\x1b[0m ${m.texto}`);
}

try {
  const r = await chamar(null, 'POST', '/auth/email/request', { email: 'demo@nutrilualves.com.br' });
  const v = await chamar(null, 'POST', '/auth/email/verify', { email: 'demo@nutrilualves.com.br', code: r.dev_code });
  const cod = await chamar(v.token, 'POST', '/me/whatsapp/codigo');
  await texto(`Oi! Quero ativar o meu WhatsApp no Nutri Lu. Meu código: ${cod.codigo}`);
  for (const m of process.argv.slice(2).length ? process.argv.slice(2) : [
    'bom dia luna',
    'quero registrar meu peso de hoje',
    '87',
    'comi 2 ovos mexidos e um pão francês com manteiga',
    'tapioca engorda?',
    'quanto de proteína ainda falta pra hoje?',
    'posso pular o jantar por causa do remédio que eu tomo?',
    'valeu, você é demais',
  ]) await texto(m);
} finally {
  await pool.query(`DELETE FROM whatsapp_contatos WHERE wa_id = $1`, [WA]).catch(() => {});
  await pool.end();
}
