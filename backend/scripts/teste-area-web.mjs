// Teste de ponta a ponta das rotas da área de membros web, contra um servidor
// LOCAL rodando com ALLOW_DEV_LOGIN=1 e sem SMTP (o código de login volta na
// resposta). Nunca apontar pra produção: cria usuário, refeições e peso.
//
//   node scripts/teste-area-web.mjs [http://localhost:3001] [e-mail]

const BASE = process.argv[2] || 'http://localhost:3001';
const EMAIL = process.argv[3] || `teste-web-${Date.now()}@example.com`;
const HOJE = new Date().toISOString().slice(0, 10);
let token = null;
let falhas = 0;

async function chamar(metodo, rota, body, esperado = 200) {
  const res = await fetch(`${BASE}${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  const ok = res.status === esperado;
  if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${metodo} ${rota} → ${res.status}${ok ? '' : ` (esperava ${esperado}) ${JSON.stringify(data).slice(0, 200)}`}`);
  return data;
}

// 1. Login por e-mail
const req = await chamar('POST', '/auth/email/request', { email: EMAIL });
if (!req?.dev_code) { console.error('sem dev_code: o servidor precisa estar SEM SMTP e com ALLOW_DEV_LOGIN=1'); process.exit(1); }
await chamar('POST', '/auth/email/verify', { email: EMAIL, code: '000000' }, 400);
const ver = await chamar('POST', '/auth/email/verify', { email: EMAIL, code: req.dev_code });
token = ver.token;
await chamar('POST', '/auth/email/verify', { email: EMAIL, code: req.dev_code }, 400); // código já usado
await chamar('POST', '/auth/email/request', { email: EMAIL }, 429); // 1 por minuto

// 2. Dia vazio
const dia0 = await chamar('GET', `/me/dia?date=${HOJE}`);
if (dia0.entries.length !== 0 || dia0.consumido.kcal !== 0) { falhas++; console.log('✘ dia deveria vir vazio'); }

// 3. Refeições
const e1 = await chamar('POST', '/me/refeicoes', { date: HOJE, slot: 'cafe', source: 'taco', items: [
  { name: 'Ovo cozido', portion: '2 unidades', grams: 100, kcal: 146, p: 13.3, c: 0.6, f: 9.5 },
  { name: 'Pão integral', portion: '1 fatia', grams: 30, kcal: 75, p: 3, c: 14, f: 1 },
] }, 201);
await chamar('POST', '/me/refeicoes', { date: HOJE, slot: 'almoco', source: 'plano', items: [] }, 400);
await chamar('POST', '/me/refeicoes', { date: HOJE, slot: 'brunch', source: 'plano', items: [{ name: 'x', kcal: 1, p: 0, c: 0, f: 0 }] }, 400);
await chamar('PUT', `/me/refeicoes/${e1.entry.id}`, { items: [{ name: 'Ovo cozido', portion: '3 unidades', grams: 150, kcal: 219, p: 20, c: 1, f: 14 }] });
const dia1 = await chamar('GET', `/me/dia?date=${HOJE}`);
if (Math.round(dia1.consumido.kcal) !== 219) { falhas++; console.log(`✘ consumido deveria ser 219, veio ${dia1.consumido.kcal}`); }
if (dia1.streak !== 1) { falhas++; console.log(`✘ streak deveria ser 1, veio ${dia1.streak}`); }

// 4. Água, peso, medidas
await chamar('PUT', '/me/agua', { date: HOJE, delta_ml: 200 });
const agua = await chamar('PUT', '/me/agua', { date: HOJE, delta_ml: 200 });
if (agua.water_ml !== 400) { falhas++; console.log('✘ água deveria somar 400'); }
await chamar('POST', '/me/peso', { date: HOJE, kg: '72,4' });
await chamar('POST', '/me/peso', { date: HOJE, kg: 999 }, 400);
await chamar('POST', '/me/medidas', { date: HOJE, measures: { cintura_cm: 79, quadril_cm: 99 } });

// 5. Plano ainda não existe
const plano = await chamar('GET', `/me/plano?date=${HOJE}`);
if (plano.plano !== null) { falhas++; console.log('✘ plano deveria ser null antes de carregar'); }
await chamar('POST', '/me/plano/troca', { date: HOJE, slot: 'almoco', meal: { name: 'x', items: [{ name: 'x', kcal: 1, p: 0, c: 0, f: 0 }] } }, 404);

// 6. Copiar dia, mês, evolução, perfil, recados
const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const cop = await chamar('POST', '/me/refeicoes/copiar', { from: HOJE, to: ontem });
if (cop.copiadas !== 1) { falhas++; console.log('✘ copiar deveria copiar 1'); }
await chamar('GET', `/me/mes?month=${HOJE.slice(0, 7)}`);
const evo = await chamar('GET', `/me/evolucao?date=${HOJE}`);
if (evo.pesos.length !== 1 || evo.streak !== 2) { falhas++; console.log(`✘ evolução: pesos=${evo.pesos.length} streak=${evo.streak}`); }
await chamar('PUT', '/me/perfil', { perfil: { nome: 'Teste Web', objetivo: 'Perder 6 kg', campo_invalido: 'x' } });
const perfil = await chamar('GET', '/me/perfil');
if (perfil.user.displayName !== 'Teste Web' || perfil.perfil.campo_invalido) { falhas++; console.log('✘ perfil não gravou como esperado'); }
await chamar('POST', '/me/perguntas', { text: 'Posso trocar o jantar de sexta por uma pizza?' }, 201);
await chamar('POST', '/me/perguntas', { text: 'oi' }, 400);
await chamar('GET', '/me/recados');
await chamar('GET', '/me/materiais');

// 6b. Onboarding web: campos novos do perfil, estimativa e anamnese clínica
const ob = await chamar('PUT', '/me/perfil', { perfil: { objetivo: 'perder', atividade: 'moderada', barreiras: ['agenda'], estimativa: { kcal: [1550, 1950] }, onboarding_em: new Date().toISOString(), foto_key: 'outra-pessoa/perfil/x.jpg' } }, 400);
await chamar('PUT', '/me/perfil', { perfil: { objetivo: 'perder', atividade: 'moderada', barreiras: ['agenda'], estimativa: { kcal: [1550, 1950] }, onboarding_em: new Date().toISOString() } });
const diaOb = await chamar('GET', `/me/dia?date=${HOJE}`);
if (!diaOb.onboarding_em || diaOb.estimativa?.kcal?.[0] !== 1550) { falhas++; console.log('✘ /me/dia deveria trazer onboarding_em e estimativa'); }
const an0 = await chamar('GET', '/me/anamnese-clinica');
if (an0.respondida !== false) { falhas++; console.log('✘ anamnese deveria começar não respondida'); }
await chamar('PUT', '/me/anamnese-clinica', { data: { doencas: 'nenhuma' } }, 400); // sem consentimento
await chamar('PUT', '/me/anamnese-clinica', { consentimento: true, data: { doencas: 'nenhuma', alergias: 'camarão', campo_invalido: 'x' } });
const an1 = await chamar('GET', '/me/anamnese-clinica');
if (!an1.respondida || an1.data.alergias !== 'camarão' || an1.data.campo_invalido) { falhas++; console.log('✘ anamnese não gravou como esperado'); }
const diaSemClinico = await chamar('GET', `/me/dia?date=${HOJE}`);
const perfilSemClinico = await chamar('GET', '/me/perfil');
if (JSON.stringify(diaSemClinico).includes('camarão') || JSON.stringify(perfilSemClinico).includes('camarão')) { falhas++; console.log('✘ dado clínico vazou em /me/dia ou /me/perfil'); }
await chamar('DELETE', '/me/anamnese-clinica');
void ob;

// 7. Sem sessão → 401
token = null;
await chamar('GET', `/me/dia?date=${HOJE}`, undefined, 401);

// 8. Limpeza
console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo passou.');
process.exit(falhas ? 1 : 0);
