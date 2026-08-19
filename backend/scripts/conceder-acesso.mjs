// Concede acesso manualmente e imprime o código.
//
//   node --env-file=.env scripts/conceder-acesso.mjs --email=alguem@dominio.com --meses=3
//   node --env-file=.env scripts/conceder-acesso.mjs --meses=12          (só código, sem e-mail)
//   node --env-file=.env scripts/conceder-acesso.mjs --listar
//
// Para quê: dar acesso ao Raphael e à nutricionista, criar a conta de teste que
// vai nas notas da review da Apple, e atender cortesia enquanto o webhook da
// plataforma de venda não existe.
//
// Com --email, quem entrar no app com esse e-mail (verificado pela Apple ou
// pelo Google) recebe acesso SEM precisar do código. O código serve pra quem
// entrar com outro endereço — inclusive quem usar "Ocultar meu e-mail".

import { getPool, initSchema } from '../src/db.js';
import { registrarCompra, normalizarEmail } from '../src/services/billing.js';

const arg = (nome) => {
  const achado = process.argv.find((a) => a.startsWith(`--${nome}=`));
  return achado ? achado.split('=').slice(1).join('=') : null;
};

async function listar() {
  const { rows } = await getPool().query(
    `SELECT p.source, p.email, p.status, p.valido_ate, c.code,
            c.redeemed_by_user_id IS NOT NULL AS resgatado, u.display_name
       FROM purchases p
       LEFT JOIN access_codes c ON c.purchase_id = p.id
       LEFT JOIN users u ON u.id = c.redeemed_by_user_id
      ORDER BY p.created_at DESC
      LIMIT 50`,
  );
  if (!rows.length) return console.log('nenhuma compra registrada.');
  console.log(`${rows.length} compra(s):\n`);
  for (const r of rows) {
    const validade = r.valido_ate ? new Date(r.valido_ate).toISOString().slice(0, 10) : 'sem prazo';
    const quem = r.resgatado ? `resgatado por ${r.display_name}` : 'não resgatado';
    console.log(`  ${r.code || '(sem código)'}  ${String(r.source).padEnd(9)} ${r.status.padEnd(12)} até ${validade}  ${r.email || '(sem e-mail)'}  — ${quem}`);
  }
}

async function main() {
  await initSchema();

  if (process.argv.includes('--listar')) {
    await listar();
    return;
  }

  const email = normalizarEmail(arg('email'));
  const meses = Number(arg('meses') || 3);
  if (!Number.isFinite(meses) || meses <= 0) throw new Error('--meses precisa ser um número positivo');

  // Acesso com prazo desde o começo: o acompanhamento acaba, e o acesso tem que
  // acabar junto. Deixar sem validade seria entregar vitalício por descuido.
  const validoAte = new Date();
  validoAte.setMonth(validoAte.getMonth() + meses);

  const { code, novo } = await registrarCompra({
    source: 'cortesia',
    externalId: `cortesia-${Date.now()}`,
    email,
    validoAte,
  });

  console.log(`\n  código:   ${code}${novo ? '' : '  (já existia)'}`);
  console.log(`  e-mail:   ${email || '(nenhum — só o código libera)'}`);
  console.log(`  válido até: ${validoAte.toISOString().slice(0, 10)}  (${meses} meses)\n`);
  if (email) console.log('  Quem entrar com esse e-mail recebe acesso sem digitar nada.\n');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('falhou:', e.message);
    process.exit(1);
  });
