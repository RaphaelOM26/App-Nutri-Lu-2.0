// Zera uma conta pra refazer o onboarding do zero (teste com o time, demo).
//
//   node scripts/resetar-conta.mjs --email fulana@x.com              (só mostra)
//   node scripts/resetar-conta.mjs --email fulana@x.com --confirmar  (apaga)
//
// O que some: a linha em users e tudo que pende dela (perfil, anamnese,
// diário, peso, medidas, fotos, planos, recados, notificações, códigos de
// login, suplementos) + receitas/avaliações da comunidade. O WhatsApp é
// DESVINCULADO (a conversa fica, sem dono; a pessoa vincula de novo pelo
// código). O que fica: a compra (purchases é por e-mail) — ao entrar de novo
// com o mesmo e-mail o acesso continua e a área manda pro onboarding.
// Roda contra o DATABASE_URL do .env (produção). Banco de dev:
//   DATABASE_URL=...nutrilu_dev node scripts/resetar-conta.mjs ...
import 'dotenv/config';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length));
const email = String(args.email || '').trim().toLowerCase();
if (!email) { console.error('uso: --email fulana@x.com [--confirmar]'); process.exit(1); }
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL ausente'); process.exit(1); }

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const c = await pool.connect();
try {
  // O mesmo e-mail pode ter mais de uma conta (login social do app das lojas
  // e login por e-mail da web). A da web é provider 'email'; --provider muda.
  const provider = String(args.provider || 'email');
  const { rows: [u] } = await c.query(`SELECT id, provider, display_name, apelido, role, created_at FROM users WHERE lower(email) = $1 AND provider = $2`, [email, provider]);
  if (!u) {
    const { rows: outras } = await c.query(`SELECT provider FROM users WHERE lower(email) = $1`, [email]);
    console.log(`Nenhuma conta ${provider} com ${email}.${outras.length ? ` Existem: ${outras.map((o) => o.provider).join(', ')} (use --provider).` : ''}`);
    process.exit(0);
  }
  const n = async (sql) => Number((await c.query(sql, [u.id])).rows[0].n);
  const resumo = {
    perfil: await n(`SELECT COUNT(*) n FROM client_profiles WHERE user_id = $1`),
    anamnese: await n(`SELECT COUNT(*) n FROM anamnese_clinica WHERE user_id = $1`),
    refeicoes: await n(`SELECT COUNT(*) n FROM meal_entries WHERE user_id = $1`),
    pesos: await n(`SELECT COUNT(*) n FROM weight_log WHERE user_id = $1`),
    fotos: await n(`SELECT COUNT(*) n FROM progress_photos WHERE user_id = $1`),
    planos: await n(`SELECT COUNT(*) n FROM meal_plans WHERE user_id = $1`),
    recados: await n(`SELECT COUNT(*) n FROM lu_messages WHERE user_id = $1`),
    whatsapp_vinculado: await n(`SELECT COUNT(*) n FROM whatsapp_contatos WHERE user_id = $1`),
    compras_por_email: Number((await c.query(`SELECT COUNT(*) n FROM purchases WHERE lower(email) = $1`, [email])).rows[0].n),
  };
  console.log(`Conta ${u.provider}: ${u.display_name || '(sem nome)'}${u.apelido ? ` (${u.apelido})` : ''} · papel ${u.role} · desde ${new Date(u.created_at).toLocaleDateString('pt-BR')}`);
  console.table(resumo);
  if (u.role !== 'cliente') console.warn(`⚠️  Papel "${u.role}": apagar a conta apaga o papel também. Redefina depois com scripts/definir-papel.mjs.`);
  if (!args.confirmar) { console.log('\nNada apagado. Repita com --confirmar pra zerar.'); process.exit(0); }

  await c.query('BEGIN');
  await c.query(`UPDATE whatsapp_contatos SET user_id = NULL, vinculado_em = NULL, estado = '{}', aguardando_equipe = FALSE, updated_at = NOW() WHERE user_id = $1`, [u.id]);
  await c.query(`DELETE FROM recipe_ratings WHERE user_id = $1 OR recipe_id IN (SELECT id FROM community_recipes WHERE user_id = $1)`, [u.id]);
  await c.query(`DELETE FROM community_recipes WHERE user_id = $1`, [u.id]);
  await c.query(`DELETE FROM login_codes WHERE lower(email) = $1`, [email]);
  await c.query(`DELETE FROM users WHERE id = $1`, [u.id]);
  await c.query('COMMIT');
  console.log(`\n✅ Conta ${email} zerada. A compra continua; ao entrar de novo cai no onboarding. O WhatsApp precisa ser vinculado de novo.`);
} catch (e) {
  await c.query('ROLLBACK').catch(() => {});
  console.error('falhou:', e.message);
  process.exit(1);
} finally {
  c.release(); await pool.end();
}
