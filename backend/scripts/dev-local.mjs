// Sobe o servidor LOCAL apontando pro banco descartável `nutrilu_dev` (mesmo
// servidor Postgres da produção, banco separado), com login de dev ligado e
// sem SMTP — o código de login volta na resposta. Nunca usar pra produção.
//
//   node scripts/dev-local.mjs            (porta 3101)
//   PORT=3200 node scripts/dev-local.mjs

import 'dotenv/config';
import { fileURLToPath } from 'node:url';

const url = new URL(process.env.DATABASE_URL);
url.pathname = '/nutrilu_dev';
process.env.DATABASE_URL = url.toString();
process.env.ALLOW_DEV_LOGIN = '1';
// Segredo de sessão só pra rodar local: sessões emitidas aqui não valem na
// produção, que tem o segredo dela no Railway.
process.env.JWT_SECRET ||= 'segredo-local-de-desenvolvimento-nao-usar-em-producao';
process.env.PORT = process.env.PORT || '3101';
delete process.env.SMTP_HOST;
delete process.env.APP_API_KEY;
process.env.CORS_ORIGIN = 'http://localhost:5173,http://localhost:5174,http://localhost:4173';
// Fotos em disco em vez do R2 (a web não sabe a diferença)
process.env.FOTOS_LOCAL_DIR ||= fileURLToPath(new URL('../.dev-fotos', import.meta.url));

console.log(`[dev-local] banco nutrilu_dev · porta ${process.env.PORT} · login dev ligado`);
await import('../src/index.js');
