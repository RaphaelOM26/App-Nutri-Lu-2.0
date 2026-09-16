// Define o papel de uma pessoa no painel: cliente (padrão), nutri (a
// Luciana) ou admin (sócios). É o ÚNICO jeito de dar papel — não existe rota
// pra isso de propósito: quem tem acesso ao banco decide quem opera o painel.
//
//   node scripts/definir-papel.mjs --email lu@nutrilualves.com.br --papel nutri
//   node scripts/definir-papel.mjs --email socio@exemplo.com --papel admin
//   node scripts/definir-papel.mjs --email fulana@exemplo.com --papel cliente   (revoga)
//   node scripts/definir-papel.mjs --listar
//
// Roda contra o DATABASE_URL do .env (produção). Pra usar o banco de dev:
//   DATABASE_URL=...nutrilu_dev node scripts/definir-papel.mjs ...
// Se a pessoa ainda não entrou, cria o usuário 'email' pra ela — o papel já
// vale no primeiro login.

import 'dotenv/config';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length));
const PAPEIS = ['cliente', 'nutri', 'admin'];
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL ausente'); process.exit(1); }
const pool = new pg.Pool({ connectionString: url, ssl: url.includes('railway') || url.includes('rlwy') ? { rejectUnauthorized: false } : undefined });

try {
  if (args.listar) {
    const { rows } = await pool.query(`SELECT email, display_name, role FROM users WHERE role <> 'cliente' ORDER BY role, email`);
    if (!rows.length) console.log('Ninguém com papel além de cliente.');
    for (const r of rows) console.log(`${r.role.padEnd(7)} ${r.email || '(sem e-mail)'}  ${r.display_name || ''}`);
  } else {
    const email = String(args.email || '').trim().toLowerCase();
    const papel = String(args.papel || '');
    if (!email.includes('@') || !PAPEIS.includes(papel)) {
      console.error('uso: node scripts/definir-papel.mjs --email <e-mail> --papel <cliente|nutri|admin>  |  --listar');
      process.exit(1);
    }
    const { rows } = await pool.query(
      `INSERT INTO users (provider, provider_sub, display_name, email, role) VALUES ('email', $1, $2, $1, $3)
       ON CONFLICT (provider, provider_sub) DO UPDATE SET role = EXCLUDED.role
       RETURNING id, display_name, role`,
      [email, args.nome || email.split('@')[0], papel],
    );
    // A mesma pessoa pode ter entrado por Apple/Google no app com esse e-mail:
    // o papel vale pra todas as contas com o e-mail.
    await pool.query(`UPDATE users SET role = $2 WHERE email = $1`, [email, papel]);
    console.log(`✔ ${email} agora é ${rows[0].role} (id ${rows[0].id})`);
  }
} finally { await pool.end(); }
