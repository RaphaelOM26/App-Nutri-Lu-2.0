// Dados de MENTIRA pra ver o WhatsApp funcionando no servidor LOCAL (banco
// nutrilu_dev, modo simulado): vincula um número fictício à conta demo
// (scripts/seed-demo.mjs), conversa um pouco com o bot, pede um atendente e
// cria uma pessoa com o papel `suporte` pra abrir a tela de Atendimento.
//
//   node scripts/seed-whatsapp-demo.mjs [http://localhost:3101]
//
// Depois: entrar na web com suporte-demo@nutrilualves.com.br (o código de
// login aparece na tela) → Painel → WhatsApp.

import 'dotenv/config';
import pg from 'pg';

const BASE = process.argv[2] || 'http://localhost:3101';
const DEMO = 'demo@nutrilualves.com.br', SUPORTE = 'suporte-demo@nutrilualves.com.br';
const WA = '5521988887777', WA_LEAD = '5511977776666';
const url = new URL(process.env.DATABASE_URL); url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: url.hostname.includes('railway') || url.hostname.includes('rlwy') ? { rejectUnauthorized: false } : undefined });

// O webhook responde "OK" em texto puro (é o que a Meta espera), não JSON.
const post = async (rota, body, token) => (await fetch(`${BASE}${rota}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body || {}) })).text().then((t) => { try { return JSON.parse(t); } catch { return t; } });
let seq = 0;
async function receber(de, nome, parcial) {
  const msg = { from: de, id: `wamid.demo.${Date.now()}.${++seq}`, timestamp: String(Math.floor(Date.now() / 1000)), ...parcial };
  await post('/whatsapp/webhook', { object: 'whatsapp_business_account', entry: [{ id: 'WABA', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { phone_number_id: 'DEMO' }, contacts: [{ wa_id: de, profile: { name: nome } }], messages: [msg] } }] }] });
  for (let i = 0; i < 150; i++) {
    const { rows: [r] } = await pool.query(`SELECT COUNT(*)::int AS n FROM whatsapp_fila WHERE chave = $1 AND status IN ('pendente', 'processando')`, [de]);
    if (!r.n) return; await new Promise((ok) => setTimeout(ok, 300));
  }
}
const texto = (de, nome, body) => receber(de, nome, { type: 'text', text: { body } });

try {
  await pool.query(`DELETE FROM whatsapp_contatos WHERE wa_id = ANY($1)`, [[WA, WA_LEAD]]);
  // Sem login: o pedido de código de acesso é limitado a 1 por minuto por
  // e-mail, e este script tem o banco de dev na mão. O código de vínculo nasce
  // direto na tabela, igual ao que POST /me/whatsapp/codigo faria.
  const { rows: [demo] } = await pool.query(`SELECT id FROM users WHERE email = $1 AND role = 'cliente' LIMIT 1`, [DEMO]);
  if (!demo) throw new Error(`conta ${DEMO} não existe: rode antes node scripts/seed-demo.mjs`);
  const codigo = `DEM${String(Date.now()).slice(-3)}`.replace(/[01]/g, '7');
  await pool.query(`DELETE FROM whatsapp_codigos WHERE user_id = $1`, [demo.id]);
  await pool.query(`INSERT INTO whatsapp_codigos (code, user_id, expires_at) VALUES ($1, $2, NOW() + interval '30 minutes')`, [codigo, demo.id]);
  await texto(WA, 'Mari Costa', `Oi! Quero ativar o meu WhatsApp no Nutri Lu. Meu código: ${codigo}`);
  await texto(WA, 'Mari Costa', 'macros');
  await texto(WA, 'Mari Costa', 'o que como hoje?');
  await texto(WA, 'Mari Costa', 'quero falar com um atendente');
  await texto(WA, 'Mari Costa', 'Oi! Comprei pela Hotmart com outro e-mail e queria passar o acesso pra este aqui. Como faço?');

  await texto(WA_LEAD, 'Carla', 'oi, vi o perfil da Lu no Instagram');
  await receber(WA_LEAD, 'Carla', { type: 'interactive', interactive: { type: 'button_reply', button_reply: { id: 'humano:comercial', title: 'Falar com a equipe' } } });
  await texto(WA_LEAD, 'Carla', 'Quanto custa o acompanhamento e como funciona?');

  await pool.query(
    `INSERT INTO users (provider, provider_sub, display_name, email, role) VALUES ('email', $1, 'Ana (suporte)', $1, 'suporte')
     ON CONFLICT (provider, provider_sub) DO UPDATE SET role = 'suporte', display_name = 'Ana (suporte)'`, [SUPORTE]);
  console.log(`✔ pronto. Entre na web com ${SUPORTE} → Painel → WhatsApp.`);
} finally { await pool.end(); }
