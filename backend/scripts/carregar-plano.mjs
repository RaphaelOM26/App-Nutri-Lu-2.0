// Carrega um plano alimentar (e, opcionalmente, suplementos e metas) pra uma
// cliente, a partir de um arquivo JSON. É o caminho de entrada de plano até o
// painel da Lu existir — e continua útil depois, pra importar em lote.
//
// Uso:
//   node scripts/carregar-plano.mjs --email cliente@exemplo.com --arquivo plano.json
//   node scripts/carregar-plano.mjs --email ... --arquivo ... --simular   (só valida)
//
// Formato do JSON (ver docs/area-de-membros-web.md):
// {
//   "week_start": "2026-09-14",            // segunda-feira
//   "week_index": 2, "week_total": 4,
//   "targets": { "kcal": 1650, "p": 150, "c": 120, "f": 60, "water_ml": 2000 },
//   "note": "Subi a proteína do café...",
//   "days": [ { "weekday": 1, "meals": [ { "slot": "cafe", "time": "07:00", "name": "...",
//              "code": "NL-024", "items": [ { "name": "...", "portion": "1 porção", "kcal": 320, "p": 27, "c": 32, "f": 11 } ] } ] } ],
//   "supplements": [ { "name": "Whey protein", "dose": "30 g", "time": "07:00", "with_meal": "junto com o café" } ],
//   "meta_kg": 68
// }
//
// A cliente precisa já existir (ter entrado ao menos uma vez) OU o script cria
// o usuário 'email' pra ela — assim a Luciana pode montar o plano antes do
// primeiro acesso.

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import pg from 'pg';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length));
if (!args.email || !args.arquivo) {
  console.error('uso: node scripts/carregar-plano.mjs --email <e-mail> --arquivo <plano.json> [--simular]');
  process.exit(1);
}

const SLOTS = ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'];
const plano = JSON.parse(readFileSync(args.arquivo, 'utf8'));
const email = String(args.email).trim().toLowerCase();

// Validação antes de encostar no banco.
const falhas = [];
if (!/^\d{4}-\d{2}-\d{2}$/.test(plano.week_start || '')) falhas.push('week_start precisa ser YYYY-MM-DD');
else if (new Date(`${plano.week_start}T00:00:00Z`).getUTCDay() !== 1) falhas.push('week_start precisa ser uma segunda-feira');
if (!Array.isArray(plano.days) || !plano.days.length) falhas.push('days vazio');
for (const d of plano.days || []) {
  if (!(d.weekday >= 1 && d.weekday <= 7)) falhas.push(`weekday inválido: ${d.weekday}`);
  for (const m of d.meals || []) {
    if (!SLOTS.includes(m.slot)) falhas.push(`slot inválido no dia ${d.weekday}: ${m.slot}`);
    if (!m.name) falhas.push(`refeição sem nome no dia ${d.weekday} (${m.slot})`);
    if (!Array.isArray(m.items) || !m.items.length) falhas.push(`refeição sem itens: dia ${d.weekday} ${m.slot}`);
    for (const it of m.items || []) for (const k of ['kcal', 'p', 'c', 'f']) if (typeof it[k] !== 'number') falhas.push(`item "${it.name}" sem ${k} numérico`);
  }
}
if (falhas.length) {
  console.error('Plano inválido:\n - ' + falhas.join('\n - '));
  process.exit(1);
}

// Totais por refeição calculados a partir dos itens — o JSON não manda total.
const days = plano.days.map((d) => ({
  weekday: Number(d.weekday),
  meals: (d.meals || []).map((m) => {
    const t = m.items.reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, f: a.f + it.f }), { kcal: 0, p: 0, c: 0, f: 0 });
    return { slot: m.slot, time: m.time || null, name: m.name, code: m.code || null, items: m.items, ...t };
  }),
}));

const resumo = days.map((d) => `dia ${d.weekday}: ${d.meals.length} refeições, ${d.meals.reduce((a, m) => a + m.kcal, 0)} kcal`);
console.log(`Plano de ${email} — semana de ${plano.week_start}`);
console.log(' - ' + resumo.join('\n - '));
if (args.simular) { console.log('(simulação: nada gravado)'); process.exit(0); }

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const c = await pool.connect();
try {
  await c.query('BEGIN');
  const { rows: u } = await c.query(
    `INSERT INTO users (provider, provider_sub, display_name, email)
     VALUES ('email', $1, $2, $1)
     ON CONFLICT (provider, provider_sub) DO UPDATE SET email = COALESCE(users.email, EXCLUDED.email)
     RETURNING id`,
    [email, plano.nome || email.split('@')[0]],
  );
  const userId = u[0].id;

  await c.query(
    `INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, note, days, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'ativo')
     ON CONFLICT (user_id, week_start) DO UPDATE SET
       week_index = EXCLUDED.week_index, week_total = EXCLUDED.week_total, targets = EXCLUDED.targets,
       note = EXCLUDED.note, days = EXCLUDED.days, status = 'ativo', updated_at = NOW()`,
    [userId, plano.week_start, plano.week_index ?? null, plano.week_total ?? null, JSON.stringify(plano.targets || {}), plano.note || null, JSON.stringify(days)],
  );

  if (Array.isArray(plano.supplements)) {
    await c.query(`UPDATE supplements SET active = FALSE WHERE user_id = $1`, [userId]);
    let i = 0;
    for (const s of plano.supplements) {
      await c.query(
        `INSERT INTO supplements (user_id, name, dose, time, with_meal, sort) VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, s.name, s.dose || null, s.time || null, s.with_meal || null, i++],
      );
    }
  }
  const perfil = {};
  if (typeof plano.meta_kg === 'number') perfil.meta_kg = plano.meta_kg;
  if (plano.targets) perfil.targets = plano.targets;
  if (Object.keys(perfil).length) {
    await c.query(
      `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()`,
      [userId, JSON.stringify(perfil)],
    );
  }
  if (plano.recado) {
    await c.query(`INSERT INTO lu_messages (user_id, kind, author, text) VALUES ($1, 'recado', 'nutri', $2)`, [userId, plano.recado]);
  }
  await c.query('COMMIT');
  console.log(`✔ gravado pra user ${userId}`);
} catch (e) {
  await c.query('ROLLBACK');
  console.error('falhou:', e.message);
  process.exit(1);
} finally {
  c.release();
  await pool.end();
}
