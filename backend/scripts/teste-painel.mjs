// Teste de ponta a ponta das rotas do painel (/nutri/*), contra um servidor
// LOCAL com ALLOW_DEV_LOGIN=1 e sem SMTP. Cria a nutri, um admin e uma
// cliente de teste, e confere permissão por papel, ficha, plano (rascunho →
// publicar), suplementos, recados, dúvidas, materiais e dashboard.
//
//   node scripts/teste-painel.mjs [http://localhost:3101]
//
// Precisa do DATABASE_URL do .env pra dar o papel (mesmo banco do servidor,
// que o dev-local.mjs aponta pra nutrilu_dev).

import 'dotenv/config';
import pg from 'pg';

const BASE = process.argv[2] || 'http://localhost:3101';
const stamp = Date.now();
const NUTRI = `teste-nutri-${stamp}@example.com`, ADMIN = `teste-admin-${stamp}@example.com`, CLIENTE = `teste-cliente-${stamp}@example.com`;
const HOJE = new Date().toISOString().slice(0, 10);
const d = new Date(`${HOJE}T12:00:00Z`); const dow = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 1 - dow);
const SEGUNDA = d.toISOString().slice(0, 10);
const prox = new Date(d); prox.setUTCDate(prox.getUTCDate() + 7); const PROX = prox.toISOString().slice(0, 10);
let falhas = 0;
const somar = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

const url = new URL(process.env.DATABASE_URL); url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: url.hostname.includes('railway') || url.hostname.includes('rlwy') ? { rejectUnauthorized: false } : undefined });

async function chamar(token, metodo, rota, body, esperado = 200) {
  const res = await fetch(`${BASE}${rota}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
  const ok = res.status === esperado; if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${metodo} ${rota} → ${res.status}${ok ? '' : ` (esperava ${esperado}) ${JSON.stringify(data).slice(0, 220)}`}`);
  return data;
}
const check = (cond, msg) => { if (!cond) { falhas++; console.log(`✘ ${msg}`); } else console.log(`✔ ${msg}`); };
async function login(email) {
  const r = await chamar(null, 'POST', '/auth/email/request', { email });
  if (!r?.dev_code) { console.error('sem dev_code: servidor precisa estar SEM SMTP e com ALLOW_DEV_LOGIN=1'); process.exit(1); }
  return chamar(null, 'POST', '/auth/email/verify', { email, code: r.dev_code });
}

// 1. Cliente comum: entra, faz "onboarding", pergunta
const cli = await login(CLIENTE);
const tCli = cli.token;
check(cli.user.role === 'cliente', 'verify devolve role cliente');
await chamar(tCli, 'PUT', '/me/perfil', { perfil: { nome: 'Cliente Teste', sexo: 'feminino', nascimento: '1990-05-10', altura_cm: 165, objetivo: 'perder', meta_kg: 62, atividade: 'leve', restricoes: ['sem-lactose'], dor: 'Como bem na semana e perco no fim de semana.', desejo: 'Ter energia e caber no jeans.', urgencia: 'Cansaço depois do almoço.', onboarding_em: new Date().toISOString() } });
await chamar(tCli, 'POST', '/me/peso', { date: HOJE, kg: 70 });
await chamar(tCli, 'PUT', '/me/anamnese-clinica', { consentimento: true, data: { doencas: 'hipotireoidismo', medicamentos_usa: 'sim', medicamentos: 'levotiroxina', intestino: 'preso', alcool: 'social', perda_controle: 'as-vezes', sintomas: 'estufamento', caneta_usa: 'sim', caneta_qual: 'Ozempic', caneta_tempo: '3 meses', caneta_dose: '0,5 mg/semana', caneta_ultima_dose: HOJE, suplementacao: { usa: 'nao', cansaco: 'sim', pouco_sol: 'sim' } } });
const perg = await chamar(tCli, 'POST', '/me/perguntas', { text: 'Posso trocar o jantar de sexta?' }, 201);
// Pergunta de SAÚDE: a triagem por dicionário manda direto pra nutri, sem IA.
const pergSaude = await chamar(tCli, 'POST', '/me/perguntas', { text: 'Tomo levotiroxina de manhã, posso comer brócolis à noite?' }, 201);
// Cliente NÃO entra no painel
await chamar(tCli, 'GET', '/nutri/pacientes', null, 403);
await chamar(tCli, 'GET', '/nutri/dashboard', null, 403);

// 2. Papéis pelo banco (como o script definir-papel.mjs faz)
const nutri = await login(NUTRI); const admin = await login(ADMIN);
await pool.query(`UPDATE users SET role = 'nutri' WHERE email = $1`, [NUTRI]);
await pool.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [ADMIN]);
const tN = nutri.token, tA = admin.token;
const eu = await chamar(tN, 'GET', '/auth/me');
check(eu.user.role === 'nutri', '/auth/me devolve role nutri (lido do banco, sem novo login)');

// 3. Lista e ficha
const lista = await chamar(tN, 'GET', `/nutri/pacientes?q=${encodeURIComponent(CLIENTE)}`);
const pac = lista.pacientes.find((p) => p.email === CLIENTE);
check(pac && pac.situacoes.includes('aguardando_plano') && pac.situacoes.includes('duvida_pendente'), 'cliente aparece como aguardando plano + dúvida pendente');
check(lista.total === 1 && lista.pagina === 1 && lista.contagens && lista.contagens.todas >= 1 && lista.secoes, 'lista paginada: busca por e-mail devolve total 1 + contagens + secoes');
const listaToda = await chamar(tN, 'GET', '/nutri/pacientes?limite=200');
check(!listaToda.pacientes.some((p) => p.email === NUTRI || p.email === ADMIN), 'equipe não aparece na lista de pacientes');
check(listaToda.contagens.todas === listaToda.total && listaToda.contagens.precisam + listaToda.contagens.em_dia + listaToda.contagens.incompletas === listaToda.contagens.todas, 'contagens fecham: precisam + em dia + incompletas = todas');
const pg1 = await chamar(tN, 'GET', '/nutri/pacientes?limite=2&pagina=1');
const pg2 = await chamar(tN, 'GET', '/nutri/pacientes?limite=2&pagina=2');
check(pg1.pacientes.length === 2 && pg2.pacientes.length >= 1 && pg1.pacientes[0].id !== pg2.pacientes[0].id, 'paginação: página 2 traz gente diferente da 1');
const soDuvidas = await chamar(tN, 'GET', '/nutri/pacientes?filtro=duvidas&limite=200');
check(soDuvidas.pacientes.length === soDuvidas.contagens.duvidas && soDuvidas.pacientes.every((p) => p.situacoes.includes('duvida_pendente')), 'filtro=duvidas devolve só quem tem dúvida, no total do chip');
const ficha = await chamar(tA, 'GET', `/nutri/pacientes/${pac.id}`);
check(ficha.perfil.dor && ficha.evolucao.pesos.length === 1 && ficha.anamnese.respondida === true && ficha.plano_atual === null, 'ficha (admin) traz perfil, evolução e o FATO da anamnese');
const listaA = await chamar(tA, 'GET', `/nutri/pacientes?q=${encodeURIComponent(CLIENTE)}`);
check(ficha.anamnese.caneta === undefined && listaA.pacientes[0]?.caneta === undefined, 'admin NÃO recebe a etiqueta de caneta (dado clínico)');
const fichaN = await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}`);
const listaN = await chamar(tN, 'GET', `/nutri/pacientes?q=${encodeURIComponent(CLIENTE)}`);
check(fichaN.anamnese.caneta === true && listaN.pacientes[0]?.caneta === true, 'nutri recebe a etiqueta de caneta na ficha e na lista');
const soPlanos = await chamar(tN, 'GET', '/nutri/pacientes?filtro=planos&limite=200');
check(soPlanos.pacientes.some((p) => p.id === pac.id) && soPlanos.contagens.planos === soPlanos.total, 'filtro=planos (tela Plano alimentar) inclui quem espera plano');
await chamar(tA, 'GET', `/nutri/pacientes/${pac.id}/anamnese-clinica`, null, 403);
const anam = await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/anamnese-clinica`);
check(anam.data.doencas === 'hipotireoidismo', 'anamnese clínica (nutri) vem inteira');
await chamar(tN, 'GET', `/nutri/pacientes/${nutri.user.id}`, null, 404); // a própria nutri não é paciente
await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/dia?date=${HOJE}`);
await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/mes?month=${HOJE.slice(0, 7)}`);
await chamar(tA, 'PUT', `/nutri/pacientes/${pac.id}/perfil`, { perfil: { meta_kg: 60 } }, 403);
const pf = await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/perfil`, { perfil: { meta_kg: 60, dor: 'não pode' } });
check(pf.perfil.meta_kg === 60 && pf.perfil.dor !== 'não pode', 'nutri edita meta_kg mas não o texto da cliente');

// 4. Plano: inválido, rascunho, publicar, copiar, encerrar
const refeicao = (slot, name, kcal) => ({ slot, time: '12:00', name, code: null, subs: slot === 'cafe' ? 'frango desfiado no lugar da carne' : '', items: [{ name, portion: '1 porção', kcal, p: 20, c: 30, f: 10 }] });
const dias7 = Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, meals: [refeicao('cafe', 'Café teste', 300), refeicao('almoco', 'Almoço teste', 500), refeicao('jantar', 'Jantar teste', 400)] }));
await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano`, { week_start: HOJE === SEGUNDA ? PROX : HOJE, days: dias7 }, HOJE === SEGUNDA ? 200 : 400); // não é segunda → 400
await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano`, { week_start: SEGUNDA, days: [{ weekday: 1, meals: [{ slot: 'brunch', name: 'x', items: [] }] }] }, 400);
await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano`, { week_start: SEGUNDA, targets: {}, days: dias7, publicar: true }, 400); // sem kcal não publica
const rasc = await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano`, { week_start: SEGUNDA, week_index: 1, week_total: 4, targets: { kcal: 1500, p: 120, c: 150, f: 50, water_ml: 2000 }, days: dias7.slice(0, 3) });
check(rasc.plano.status === 'rascunho' && rasc.plano.dias.length === 3, 'rascunho salvo com 3 dias');
const diaSemPlano = await chamar(tCli, 'GET', `/me/dia?date=${HOJE}`);
check(diaSemPlano.plano === null, 'cliente NÃO vê o rascunho');
await chamar(tA, 'PUT', `/nutri/pacientes/${pac.id}/plano`, { week_start: SEGUNDA, days: dias7 }, 403);
const pub = await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano`, {
  week_start: SEGUNDA, week_index: 1, week_total: 4, targets: { kcal: 1500, p: 120, c: 150, f: 50, water_ml: 2000 }, note: 'Semana 1: base.', days: dias7,
  supplements: [{ name: 'Whey', dose: '30 g', time: '07:00', with_meal: 'no café' }], meta_kg: 61, recado: 'Plano no ar!', publicar: true,
});
check(pub.plano.status === 'ativo' && pub.plano.published_at && pub.email && pub.email.enviado === false, 'publicado (e-mail não enviado: sem SMTP, sem erro)');
const diaCom = await chamar(tCli, 'GET', `/me/dia?date=${HOJE}`);
check(diaCom.plano && diaCom.plano.dia.meals.length === 3 && diaCom.targets.kcal === 1500 && diaCom.suplementos.length === 1, 'cliente vê o plano, as metas e o suplemento');
check(diaCom.plano.dia.meals.find((m) => m.slot === 'cafe')?.subs === 'frango desfiado no lugar da carne' && !diaCom.plano.dia.meals.find((m) => m.slot === 'almoco')?.subs, 'substituições da nutri chegam na refeição certa');
const rec = await chamar(tCli, 'GET', '/me/recados');
check(rec.mensagens.some((m) => m.kind === 'recado' && m.text === 'Plano no ar!'), 'recado de abertura chegou');
const perfilCli = await chamar(tCli, 'GET', '/me/perfil');
check(perfilCli.perfil.meta_kg === 61 && perfilCli.plano?.week_index === 1, 'perfil recebeu meta e plano');
// Busca pelo e-mail: no banco de dev a paciente nova cai fora da 1ª página de 50.
const lista2 = await chamar(tN, 'GET', `/nutri/pacientes?q=${encodeURIComponent(CLIENTE)}`);
const pac2 = lista2.pacientes.find((p) => p.email === CLIENTE);
const quintaOuDepois = new Date(`${HOJE}T12:00:00Z`).getUTCDay() >= 4;
check(pac2.situacoes.includes('plano_ativo') && pac2.situacoes.includes('plano_vencendo') === quintaOuDepois && !pac2.situacoes.includes('aguardando_plano'), `situação virou plano ativo${quintaOuDepois ? ' + vencendo (sem próxima semana)' : ' (vencendo só de quinta em diante)'}`);
const copia = await chamar(tN, 'POST', `/nutri/pacientes/${pac.id}/planos/${pub.plano.id}/copiar`, { week_start: PROX }, 201);
check(copia.plano.status === 'rascunho' && copia.plano.week_index === 2 && copia.plano.dias.length === 7, 'cópia pra próxima semana vira rascunho com índice 2');
await chamar(tN, 'POST', `/nutri/pacientes/${pac.id}/planos/${pub.plano.id}/copiar`, { week_start: PROX }, 409);
const planos = await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/planos`);
check(planos.planos.length === 2, 'lista de planos com 2 semanas');
await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/planos/${copia.plano.id}`);
const del = await chamar(tN, 'DELETE', `/nutri/pacientes/${pac.id}/planos/${copia.plano.id}`);
check(del.status === 'apagado', 'rascunho apagado');
const sup = await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/suplementos`, { supplements: [{ name: 'Whey', dose: '30 g', time: '07:00' }, { name: 'Ômega 3', dose: '1 cápsula', time: '12:30' }] });
check(sup.suplementos.length === 2, 'suplementos substituídos (2)');

// 4b. Plano do MÊS (4 semanas de uma vez)
const semanaMes = (kcal) => Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, meals: [refeicao('cafe', 'Café mês', kcal), refeicao('almoco', 'Almoço mês', 500), refeicao('jantar', 'Jantar mês', 400)] }));
const INICIO = PROX; // mês começa na próxima segunda (a semana atual já tem plano do teste anterior)
await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/plano-mes?inicio=${HOJE === SEGUNDA ? PROX : HOJE}`, null, HOJE === SEGUNDA ? 200 : 400); // inicio precisa ser segunda
const mesVazio = await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/plano-mes?inicio=${INICIO}`);
check(mesVazio.semanas.length === 4 && mesVazio.semanas.every((s) => s.plano === null), 'mês novo vem com 4 semanas vazias');
await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano-mes`, { inicio: INICIO, targets: { kcal: 1500 }, weeks: [{ days: semanaMes(300) }, { days: [] }, { days: [] }, { days: [] }], publicar: true }, 400); // semana 2 vazia não publica
const rascMes = await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano-mes`, { inicio: INICIO, targets: { kcal: 1500, p: 120, c: 150, f: 50 }, note: 'Mês 1', weeks: [{ days: semanaMes(300) }, { days: semanaMes(310) }, { days: [] }, { days: [] }] });
check(rascMes.semanas.length === 4 && rascMes.semanas.every((s) => s.status === 'rascunho') && rascMes.semanas[1].week_index === 2 && rascMes.semanas[3].week_total === 4, 'rascunho do mês grava 4 semanas com índice 1..4');
const pubMes = await chamar(tN, 'PUT', `/nutri/pacientes/${pac.id}/plano-mes`, { inicio: INICIO, targets: { kcal: 1500, p: 120, c: 150, f: 50 }, note: 'Mês 1', weeks: [1, 2, 3, 4].map((i) => ({ days: semanaMes(290 + i * 5) })), supplements: [{ name: 'Creatina', dose: '3 g', time: '08:00' }], recado: 'Mês no ar!', publicar: true });
check(pubMes.semanas.every((s) => s.status === 'ativo' && s.published_at) && pubMes.email && pubMes.email.enviado === false, 'mês publicado: 4 semanas ativas numa transação');
const mesLido = await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/plano-mes?inicio=${INICIO}`);
check(mesLido.semanas.every((s) => s.plano?.status === 'ativo') && mesLido.semanas[2].plano.dias[0].meals[0].kcal === 305, 'leitura do mês devolve as 4 semanas certas');
const diaSem3 = await chamar(tCli, 'GET', `/me/dia?date=${somar(INICIO, 14)}`);
check(diaSem3.plano && diaSem3.plano.week_index === 3 && diaSem3.plano.week_total === 4, 'cliente na semana 3 vê "semana 3 de 4"');
const recMes = await chamar(tCli, 'GET', '/me/recados');
check(recMes.mensagens.some((m) => m.text === 'Mês no ar!'), 'recado do mês chegou uma vez só');

// 5. Recados e dúvidas
const duv = await chamar(tA, 'GET', '/nutri/duvidas');
check(duv.duvidas.some((q) => q.id === perg.id && q.resposta === null), 'dúvida pendente aparece na caixa de entrada');
// Triagem da Luna (roda em segundo plano ao receber a pergunta): espera até 5 s.
let triada = null;
for (let i = 0; i < 10 && !triada; i++) { const d = await chamar(tA, 'GET', '/nutri/duvidas'); const s = d.duvidas.find((q) => q.id === pergSaude.id); if (s?.triagem) triada = s; else await new Promise((r) => setTimeout(r, 500)); }
check(triada?.triagem === 'nutri' && triada.rascunho === null && /saúde/i.test(triada.rascunho_motivo || ''), 'pergunta de saúde vai pra nutri sem rascunho (dicionário, sem IA)');
const triagemComum = await chamar(tN, 'POST', `/nutri/duvidas/${perg.id}/rascunho`, {});
check(['ia', 'nutri'].includes(triagemComum.duvida.triagem) && (triagemComum.duvida.triagem === 'nutri' || String(triagemComum.duvida.rascunho || '').length > 10), 'rascunho sob demanda devolve triagem (ia com texto, ou nutri com motivo)');
console.log(`   → triagem da pergunta comum: ${triagemComum.duvida.triagem} · ${(triagemComum.duvida.rascunho || triagemComum.duvida.rascunho_motivo || '').slice(0, 120)}`);
await chamar(tA, 'POST', `/nutri/duvidas/${perg.id}/rascunho`, {}, 403); // admin não pede rascunho
await chamar(tA, 'POST', `/nutri/pacientes/${pac.id}/recados`, { text: 'Pode sim, duas fatias.', reply_to: perg.id }, 201);
const duv2 = await chamar(tA, 'GET', '/nutri/duvidas');
check(!duv2.duvidas.some((q) => q.id === perg.id), 'depois de respondida sai das pendentes');
const duv3 = await chamar(tA, 'GET', '/nutri/duvidas?todas=1');
check(duv3.duvidas.find((q) => q.id === perg.id)?.resposta?.text === 'Pode sim, duas fatias.', 'com ?todas=1 vem com a resposta');
await chamar(tN, 'POST', `/nutri/pacientes/${pac.id}/recados`, { text: 'Pergunta de outra pessoa', reply_to: '00000000-0000-0000-0000-000000000000' }, 404);
await chamar(tA, 'POST', '/nutri/recados/todos', { text: 'Oi todo mundo' }, 403);
const todos = await chamar(tN, 'POST', '/nutri/recados/todos', { text: 'Semana que vem tem material novo.' }, 201);
check(todos.enviados >= 1, `recado em massa chegou pra ${todos.enviados}`);
const recCli = await chamar(tCli, 'GET', '/me/recados');
check(recCli.mensagens.some((m) => m.kind === 'resposta') && recCli.mensagens.some((m) => m.text === 'Semana que vem tem material novo.'), 'cliente vê a resposta e o recado em massa');
await chamar(tN, 'GET', `/nutri/pacientes/${pac.id}/recados`);
// Sino: o plano publicado e a resposta viraram notificações; abrir marca como lidas.
const notif = await chamar(tCli, 'GET', '/me/notificacoes');
check(notif.itens.some((n) => n.tipo === 'plano') && notif.itens.some((n) => n.tipo === 'resposta') && notif.nao_lidas >= 2, 'sino: plano publicado e resposta da nutri viram notificações não lidas');
await chamar(tCli, 'POST', '/me/notificacoes/lidas', {});
check((await chamar(tCli, 'GET', '/me/notificacoes')).nao_lidas === 0, 'sino: marcar lidas zera o contador');
await chamar(tCli, 'GET', '/me/notificacoes/x', null, 404);
const resumo = await chamar(tN, 'GET', '/nutri/resumo');
check(typeof resumo.duvidas === 'number' && resumo.papel === 'nutri', 'resumo do menu');

// 6. Materiais
await chamar(tN, 'POST', '/nutri/materiais', { title: 'x', kind: 'video', url: 'nao-e-url' }, 400);
const mat = await chamar(tN, 'POST', '/nutri/materiais', { title: 'Como montar o prato', kind: 'video', url: 'https://youtu.be/abc', meta: { duracao: '11 min', destaque: true, invalido: 'x' } }, 201);
check(mat.material.meta.duracao === '11 min' && !mat.material.meta.invalido, 'material criado com meta filtrada');
await chamar(tA, 'POST', '/nutri/materiais', { title: 'y', kind: 'video', url: 'https://youtu.be/x' }, 403);
const up = await chamar(tN, 'POST', '/nutri/materiais/upload-url', { content_type: 'application/pdf', size: 1000 });
check(up.key?.startsWith('materiais/') && up.url, 'URL de upload de PDF');
await chamar(tN, 'POST', '/nutri/materiais/upload-url', { content_type: 'image/gif', size: 1000 }, 400);
const pdf = await chamar(tN, 'POST', '/nutri/materiais', { title: 'Guia', kind: 'pdf', file_key: up.key, meta: { paginas: 12 } }, 201);
const matsCli = await chamar(tCli, 'GET', '/me/materiais');
check(matsCli.materiais.some((m) => m.id === pdf.material.id && m.url), 'PDF aparece pra cliente com URL');
await chamar(tN, 'PUT', `/nutri/materiais/${mat.material.id}`, { title: 'Como montar o prato (v2)', kind: 'video', url: 'https://youtu.be/abc', active: false });
const matsCli2 = await chamar(tCli, 'GET', '/me/materiais');
check(!matsCli2.materiais.some((m) => m.id === mat.material.id), 'material inativo some pra cliente');
await chamar(tA, 'GET', '/nutri/materiais');
await chamar(tN, 'DELETE', `/nutri/materiais/${mat.material.id}`);
await chamar(tN, 'DELETE', `/nutri/materiais/${pdf.material.id}`);

// 7. Dashboard
const dash = await chamar(tA, 'GET', '/nutri/dashboard');
check(dash.funil && typeof dash.funil.onboarding === 'number' && dash.distribuicoes.sexo && Array.isArray(dash.abertas.dor), 'dashboard: funil, distribuições e respostas abertas');
check(dash.abertas.dor.every((s) => typeof s === 'string') && JSON.stringify(dash.abertas).indexOf(CLIENTE) === -1, 'respostas abertas sem e-mail/nome');
check(dash.clinico === null ? typeof dash.clinico_motivo === 'string' : dash.clinico.doencas.every((x) => x.n === null || x.n >= 5), 'bloco clínico respeita o corte de 5');
check(JSON.stringify(dash.clinico || {}).indexOf('hipotireoidismo') === -1 && JSON.stringify(dash.clinico || {}).indexOf('levotiroxina') === -1, 'texto clínico livre nunca aparece no dashboard');

// Limpeza: apaga as contas de teste (cascata leva perfil, plano, recados)
await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [[NUTRI, ADMIN, CLIENTE]]);
await pool.end();
console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
