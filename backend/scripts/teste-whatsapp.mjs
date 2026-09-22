// Teste de ponta a ponta do bot de WhatsApp, SEM a Meta: este script faz o
// papel dela, mandando webhooks pro servidor LOCAL (scripts/dev-local.mjs, que
// roda em MODO SIMULADO), e confere no banco o que o bot respondeu e gravou.
//
//   node scripts/teste-whatsapp.mjs [http://localhost:3101] [--ia]
//
// Sem --ia: só o que não custa (vínculo, dicionário, atendimento, avisos).
// Com --ia: também foto real → IA → diário, e uma pergunta pra Luna (~US$ 0,02).

import 'dotenv/config';
import pg from 'pg';

const args = process.argv.slice(2);
const BASE = args.find((a) => a.startsWith('http')) || 'http://localhost:3101';
const COM_IA = args.includes('--ia');
const stamp = Date.now();
const CLIENTE = `teste-wa-${stamp}@example.com`, SUPORTE = `teste-suporte-${stamp}@example.com`, NUTRI = `teste-nutri-wa-${stamp}@example.com`;
const WA = `5521${String(stamp).slice(-9)}`, WA_ESTRANHO = `5511${String(stamp + 7).slice(-9)}`;
// Compradora da Hotmart: DDD 31 + celular de 9 dígitos, como vem do checkout.
const COMPRADORA = `teste-compra-${stamp}@example.com`, FONE_COMPRA = `9${String(stamp).slice(-8)}`, WA_COMPRA = `5531${FONE_COMPRA}`;
const TRANSACAO = `HP-TESTE-${stamp}`;
let falhas = 0; let seq = 0;

const url = new URL(process.env.DATABASE_URL); url.pathname = '/nutrilu_dev';
const pool = new pg.Pool({ connectionString: url.toString(), ssl: url.hostname.includes('railway') || url.hostname.includes('rlwy') ? { rejectUnauthorized: false } : undefined });

const check = (cond, msg, extra) => { if (!cond) { falhas++; console.log(`✘ ${msg}${extra ? `\n    ${String(extra).slice(0, 300)}` : ''}`); } else console.log(`✔ ${msg}`); };
async function chamar(token, metodo, rota, body, esperado = 200) {
  const res = await fetch(`${BASE}${rota}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
  const ok = res.status === esperado; if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${metodo} ${rota} → ${res.status}${ok ? '' : ` (esperava ${esperado}) ${JSON.stringify(data).slice(0, 220)}`}`);
  return data;
}
async function login(email) {
  const r = await chamar(null, 'POST', '/auth/email/request', { email });
  if (!r?.dev_code) { console.error('sem dev_code: o servidor precisa ser o scripts/dev-local.mjs'); process.exit(1); }
  return chamar(null, 'POST', '/auth/email/verify', { email, code: r.dev_code });
}

/** Um webhook igual ao da Meta, com uma mensagem. */
async function receber(de, parcial, { id } = {}) {
  const msg = { from: de, id: id || `wamid.teste.${stamp}.${++seq}`, timestamp: String(Math.floor(Date.now() / 1000)), ...parcial };
  const corpo = { object: 'whatsapp_business_account', entry: [{ id: 'WABA', changes: [{ field: 'messages', value: { messaging_product: 'whatsapp', metadata: { display_phone_number: '5521900000000', phone_number_id: 'TESTE' }, contacts: [{ wa_id: de, profile: { name: 'Teste Zap' } }], messages: [msg] } }] }] };
  const res = await fetch(`${BASE}/whatsapp/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  if (res.status !== 200) { falhas++; console.log(`✘ webhook → ${res.status}`); }
  await esvaziar(de);
  return msg.id;
}
const texto = (de, body) => receber(de, { type: 'text', text: { body } });
const botao = (de, idBotao, titulo = 'botão') => receber(de, { type: 'interactive', interactive: { type: 'button_reply', button_reply: { id: idBotao, title: titulo } } });

/** Espera o trabalhador terminar tudo daquele número (a IA da foto leva ~10 s). */
async function esvaziar(chave, segundos = 90) {
  const fim = Date.now() + segundos * 1000;
  while (Date.now() < fim) {
    const { rows: [r] } = await pool.query(`SELECT COUNT(*)::int AS n FROM whatsapp_fila WHERE chave = $1 AND status IN ('pendente', 'processando')`, [chave]);
    if (r.n === 0) return;
    await new Promise((ok) => setTimeout(ok, 400));
  }
  falhas++; console.log(`✘ a fila de ${chave} não esvaziou em ${segundos}s`);
}
/** As últimas mensagens que o bot MANDOU pra esse número (mais recente primeiro). */
async function saidas(de, n = 3) {
  const { rows } = await pool.query(
    `SELECT m.texto, m.tipo, m.autor, m.status, m.clinico, m.sessao_humana FROM whatsapp_mensagens m JOIN whatsapp_contatos c ON c.id = m.contato_id
      WHERE c.wa_id = $1 AND m.direcao = 'out' ORDER BY m.criado_em DESC, m.id DESC LIMIT $2`, [de, n]);
  return rows;
}
const ultima = async (de) => (await saidas(de, 1))[0] || { texto: '' };
/** Avisos nascem no painel e entram na fila SEM segurar o request: espera a saída aparecer. */
async function esperarSaida(de, teste, segundos = 15) {
  const fim = Date.now() + segundos * 1000;
  while (Date.now() < fim) {
    const achou = (await saidas(de, 6)).find(teste);
    if (achou) return achou;
    await new Promise((ok) => setTimeout(ok, 400));
  }
  return null;
}

try {
  console.log(`\n— Servidor ${BASE} · IA ${COM_IA ? 'LIGADA (custa centavos)' : 'desligada (use --ia)'}\n`);

  // 0. Verificação do webhook (o que a Meta faz ao cadastrar a URL)
  const v = await fetch(`${BASE}/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=dev&hub.challenge=12345`);
  check(v.status === 200 && (await v.text()) === '12345', 'GET /whatsapp/webhook devolve o challenge com o token certo');
  const v2 = await fetch(`${BASE}/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=1`);
  check(v2.status === 403, 'GET /whatsapp/webhook recusa token errado');

  // 1. Paciente com cadastro feito e acesso ativo
  const cli = await login(CLIENTE); const tCli = cli.token;
  await chamar(tCli, 'PUT', '/me/perfil', { perfil: { nome: 'Paciente Zap', objetivo: 'perder', meta_kg: 62, restricoes: [], onboarding_em: new Date().toISOString() } });
  // Metas são decisão da nutri (a rota da cliente não aceita): entram como o painel grava, direto no perfil.
  await pool.query(`UPDATE client_profiles SET data = data || $2::jsonb WHERE user_id = $1`, [cli.user.id, JSON.stringify({ targets: { kcal: 1600, p: 110, c: 160, f: 53 } })]);
  await pool.query(`INSERT INTO purchases (source, external_id, email, status) VALUES ('cortesia', $1, $2, 'ativa')`, [`teste-wa-${stamp}`, CLIENTE]);

  // 2. Número desconhecido: ensina a vincular, e não repete a instrução em seguida
  await texto(WA, 'oi, quero jantar melhor');
  check(/Vincular WhatsApp/.test((await ultima(WA)).texto), 'número sem vínculo recebe o passo a passo (e "JANTAR" não é confundido com código)');
  await texto(WA, 'oi de novo');
  check((await saidas(WA, 10)).length === 1, 'a instrução não se repete antes de 10 min');

  // 3. Vínculo por código
  const st0 = await chamar(tCli, 'GET', '/me/whatsapp');
  check(st0.disponivel && !st0.vinculado, 'GET /me/whatsapp: disponível e ainda não vinculado');
  const cod = await chamar(tCli, 'POST', '/me/whatsapp/codigo', {}, 201);
  check(/^[A-Z0-9]{6}$/.test(cod.codigo) && /\d/.test(cod.codigo) && cod.link?.includes('wa.me/'), 'código de 6 caracteres, com número, e link wa.me');
  await texto(WA, 'Meu código: ZZZZ99');
  check(/não está valendo/.test((await ultima(WA)).texto), 'código errado é recusado com explicação');
  await texto(WA, `Oi! Quero ativar o meu WhatsApp no Nutri Lu. Meu código: ${cod.codigo}`);
  const st1 = await chamar(tCli, 'GET', '/me/whatsapp');
  check(st1.vinculado && st1.numero?.endsWith(WA.slice(-4)), 'número vinculado à conta, mostrado mascarado');
  check((await saidas(WA, 2)).some((m) => /Luna/.test(m.texto)), 'boas-vindas da Luna depois do vínculo');
  // Nome: vale o do cadastro ("Paciente Zap" → "Paciente"), e a Luna pergunta
  // antes de adotar — nome de cadastro é chute igual ao da compra.
  check((await saidas(WA, 2)).some((m) => /posso te chamar de \*Paciente\*/.test(m.texto)), 'no vínculo por código a Luna também pergunta como chamar');
  await botao(WA, 'nome:outro', 'Prefiro outro');
  check(/Como você prefere que eu te chame/.test((await ultima(WA)).texto), '"Prefiro outro" → pergunta aberta');
  await texto(WA, 'pode me chamar de Mari');
  const { rows: [apMari] } = await pool.query(`SELECT apelido FROM users WHERE email = $1`, [CLIENTE]);
  check(apMari?.apelido === 'Mari', 'ela responde o apelido em texto livre e ele fica gravado');
  await texto(WA, 'meu nome é Duda');
  const { rows: [apDuda] } = await pool.query(`SELECT apelido FROM users WHERE email = $1`, [CLIENTE]);
  check(apDuda?.apelido === 'Duda', '"meu nome é ..." troca o apelido a qualquer momento');
  await texto(WA_ESTRANHO, `código ${cod.codigo}`);
  const { rows: [estranho] } = await pool.query(`SELECT user_id FROM whatsapp_contatos WHERE wa_id = $1`, [WA_ESTRANHO]);
  check(!estranho.user_id, 'o mesmo código não vincula um segundo número (uso único)');

  // 4. Dicionário: sem IA, sem custo
  await texto(WA, 'macros');
  check(/Seu dia até agora/.test((await ultima(WA)).texto) && /1\.600/.test((await ultima(WA)).texto), '"macros" → resumo do dia com a meta');
  await texto(WA, 'peso 72,4');
  const { rows: [peso] } = await pool.query(`SELECT kg FROM weight_log w JOIN users u ON u.id = w.user_id WHERE u.email = $1`, [CLIENTE]);
  check(Number(peso?.kg) === 72.4, '"peso 72,4" → peso registrado');
  await texto(WA, 'o que como hoje?');
  check(/ainda não publicou/.test((await ultima(WA)).texto), '"o que como hoje" sem plano → avisa que ainda não saiu');
  await texto(WA, 'materiais');
  check(/materia/i.test((await ultima(WA)).texto), '"materiais" → lista ou aviso de que não há');

  // 5. Saúde: por dicionário, direto pra Nutri Luciana, sem modelo
  const usoAntes = (await pool.query(`SELECT COUNT(*)::int AS n FROM ai_usage`)).rows[0].n;
  await texto(WA, 'Tomo levotiroxina de manhã, posso comer brócolis à noite?');
  const s = await ultima(WA);
  check(/Nutri Luciana/.test(s.texto) && s.tipo === 'interactive' && s.clinico, 'pergunta de saúde → resposta fixa com botão, marcada como saúde');
  check((await pool.query(`SELECT COUNT(*)::int AS n FROM ai_usage`)).rows[0].n === usoAntes, 'pergunta de saúde não chamou IA nenhuma');
  await botao(WA, 'nutri:enviar', 'Mandar pra nutri');
  const { rows: [perg] } = await pool.query(`SELECT q.id, q.text FROM lu_messages q JOIN users u ON u.id = q.user_id WHERE u.email = $1 AND q.kind = 'pergunta'`, [CLIENTE]);
  check(/levotiroxina/.test(perg?.text || ''), 'botão "Mandar pra nutri" cria a pergunta na caixa da Luciana');

  // 6. Webhook repetido (a Meta reenvia): não processa duas vezes
  const idRep = await texto(WA, 'macros');
  const antes = (await saidas(WA, 50)).length;
  await receber(WA, { type: 'text', text: { body: 'macros' } }, { id: idRep });
  check((await saidas(WA, 50)).length === antes, 'webhook repetido (mesmo id) não gera segunda resposta');

  // 7. Resposta da Nutri Luciana chega no WhatsApp (janela aberta → conteúdo direto)
  const nutri = await login(NUTRI);
  await pool.query(`UPDATE users SET role = 'nutri' WHERE email = $1`, [NUTRI]);
  await chamar(nutri.token, 'POST', `/nutri/pacientes/${cli.user.id}/recados`, { text: 'Pode sim, o brócolis à noite não atrapalha o remédio da manhã.', reply_to: perg.id }, 201);
  const resp = await esperarSaida(WA, (m) => /respondeu a sua dúvida/.test(m.texto));
  check(resp && /brócolis/.test(resp.texto) && resp.clinico, 'resposta da Luciana entregue no WhatsApp, fora da visão do suporte');

  // 8. Atendimento humano
  await texto(WA, 'quero falar com um atendente');
  check(/Chamei uma pessoa/.test((await ultima(WA)).texto), '"atendente" → conversa vai pro time');
  const nSaidas = (await saidas(WA, 50)).length;
  await texto(WA, 'meu boleto veio com valor errado');
  check((await saidas(WA, 50)).length === nSaidas, 'em atendimento humano a Luna fica calada');

  const sup = await login(SUPORTE);
  await chamar(sup.token, 'GET', '/atendimento/conversas', null, 403);
  await pool.query(`UPDATE users SET role = 'suporte', display_name = 'Ana Suporte' WHERE email = $1`, [SUPORTE]);
  await chamar(tCli, 'GET', '/atendimento/conversas', null, 403);
  await chamar(sup.token, 'GET', '/nutri/pacientes', null, 403);
  const resumo = await chamar(sup.token, 'GET', '/atendimento/resumo');
  check(resumo.aguardando >= 1 && resumo.papel === 'suporte', 'resumo do atendimento conta quem espera resposta');
  const lista = await chamar(sup.token, 'GET', '/atendimento/conversas');
  const conv = lista.conversas?.find((c) => c.email === CLIENTE);
  check(conv?.aguardando && conv.numero.includes('••••'), 'a conversa aparece na fila, com o número mascarado');
  const det = await chamar(sup.token, 'GET', `/atendimento/conversas/${conv.id}`);
  check(det.paciente?.acesso?.acesso === true && !('perfil' in det.paciente), 'suporte vê acesso e plano, sem perfil nem diário');
  const hist = await chamar(sup.token, 'GET', `/atendimento/conversas/${conv.id}/mensagens`);
  check(hist.mensagens.length > 0 && hist.mensagens.every((m) => !/levotiroxina|brócolis|Seu dia/.test(m.texto)), 'suporte só vê a parte humana da conversa (nada de saúde nem da Luna)');
  const histNutri = await chamar(nutri.token, 'GET', `/atendimento/conversas/${conv.id}/mensagens`);
  check(histNutri.mensagens.some((m) => /levotiroxina/.test(m.texto)), 'a nutri vê a conversa inteira');
  const env = await chamar(sup.token, 'POST', `/atendimento/conversas/${conv.id}/mensagens`, { text: 'Oi! Vou conferir o seu boleto agora.' }, 201);
  const doTime = await ultima(WA);
  check(env.enviada && doTime.autor === 'equipe' && /Ana · time Nutri Lu/.test(doTime.texto), 'mensagem do time sai assinada com o nome de quem atende');
  await chamar(sup.token, 'POST', `/atendimento/conversas/${conv.id}/encerrar`, {});
  await texto(WA, 'oi');
  check(/Luna/.test((await ultima(WA)).texto), 'atendimento encerrado → a Luna volta a responder');

  // 9. Janela fechada: mensagem do time fica guardada, sai um modelo, e é entregue quando ela escreve
  await pool.query(`UPDATE whatsapp_contatos SET ultima_msg_cliente_em = NOW() - interval '30 hours', ultimo_aviso_em = NULL WHERE wa_id = $1`, [WA]);
  const fora = await chamar(sup.token, 'POST', `/atendimento/conversas/${conv.id}/mensagens`, { text: 'Seu boleto foi corrigido.' }, 201);
  check(fora.guardada && !fora.enviada, 'fora da janela de 24 h a mensagem do time fica guardada');
  check(await esperarSaida(WA, (m) => m.tipo === 'template' && /mensagem_equipe/.test(m.texto)), 'e sai UM aviso por modelo aprovado');
  await receber(WA, { type: 'button', button: { text: 'Ver mensagem', payload: 'ver' } });
  check((await saidas(WA, 4)).some((m) => /boleto foi corrigido/.test(m.texto) && m.status !== 'aguardando_janela'), 'quando ela toca no botão do aviso, a mensagem guardada é entregue');
  await chamar(sup.token, 'POST', `/atendimento/conversas/${conv.id}/encerrar`, { avisar: false });

  // 9b. Compra na Hotmart → convite por modelo → toque em "Começar" → vínculo + onboarding
  const hotmart = (transaction, buyer) => fetch(`${BASE}/billing/hotmart`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hotmart-hottok': 'hottok-local-de-desenvolvimento' }, body: JSON.stringify({ event: 'PURCHASE_APPROVED', version: '2.0.0', data: { buyer, purchase: { transaction, status: 'APPROVED' } } }) });
  // Nome como vem MESMO da Hotmart: tudo em maiúscula, nome completo.
  const compra = await hotmart(TRANSACAO, { email: COMPRADORA, name: 'JULIA DA SILVA SANTOS', first_name: 'JULIA DA SILVA SANTOS', checkout_phone_code: '31', checkout_phone: FONE_COMPRA });
  check(compra.status === 200, 'webhook da Hotmart aceita a compra aprovada');
  check(await esperarSaida(WA_COMPRA, (m) => m.tipo === 'template' && /boas_vindas_luna/.test(m.texto)), 'a compradora recebe o modelo boas_vindas_luna no telefone do checkout');
  const { rows: [antesDoToque] } = await pool.query(`SELECT user_id FROM whatsapp_contatos WHERE wa_id = $1`, [WA_COMPRA]);
  check(antesDoToque && !antesDoToque.user_id, 'o telefone do checkout, sozinho, NÃO vincula conta nenhuma');
  await hotmart(TRANSACAO, { email: COMPRADORA, first_name: 'JULIA DA SILVA SANTOS', checkout_phone_code: '31', checkout_phone: FONE_COMPRA });
  const { rows: [nConv] } = await pool.query(`SELECT COUNT(*)::int AS n FROM whatsapp_convites WHERE email = $1`, [COMPRADORA]);
  check(nConv.n === 1, 'a Hotmart repetindo o evento não gera segundo convite');
  await receber(WA_ESTRANHO, { type: 'button', button: { text: 'Começar', payload: 'Começar' } });
  const { rows: [curioso] } = await pool.query(`SELECT user_id FROM whatsapp_contatos WHERE wa_id = $1`, [WA_ESTRANHO]);
  check(!curioso.user_id, 'número que não recebeu convite não se vincula tocando em botão');
  await receber(WA_COMPRA, { type: 'button', button: { text: 'Começar', payload: 'Começar' } });
  const boas = await saidas(WA_COMPRA, 4);
  const RE_ABERTURA = /acesso ao acompanhamento da \*Nutri Luciana\* está confirmado/;
  check(boas.some((m) => RE_ABERTURA.test(m.texto)) && boas.some((m) => /primeiro passo/.test(m.texto) && /te••/.test(m.texto) && !m.texto.includes(COMPRADORA)), 'toque em "Começar" → boas-vindas + primeiro passo, com o e-mail mascarado');
  // Nome: o da compra entra limpo ("JULIA DA SILVA SANTOS" → "Julia") e a
  // Luna PERGUNTA se pode chamar assim, com botão — sem segurar o onboarding.
  // O texto da abertura é o do Raphael (21/09), e a Luna sempre diz que não é nutricionista.
  const abertura = boas.find((m) => RE_ABERTURA.test(m.texto));
  check(/^Oi, Julia! Seu acesso/.test(abertura?.texto || '') && /eu sou a \*Luna\*/.test(abertura?.texto || '') && /Não sou nutricionista/.test(abertura?.texto || '') && /posso te chamar de \*Julia\*/.test(abertura?.texto || '') && abertura?.tipo === 'interactive',
    'boas-vindas com o texto do Raphael tratam o nome da compra e perguntam se pode chamar assim');
  check(boas.some((m) => /primeiro passo/.test(m.texto)), 'a pergunta do nome não segura o primeiro passo');
  await botao(WA_COMPRA, 'nome:ok', 'Pode sim');
  const { rows: [apJulia] } = await pool.query(`SELECT apelido, display_name FROM users WHERE email = $1`, [COMPRADORA]);
  check(apJulia?.apelido === 'Julia' && apJulia?.display_name === 'JULIA DA SILVA SANTOS',
    '"Pode sim" grava o apelido e NÃO mexe no nome da compra');
  const compradora = await login(COMPRADORA);
  const stCompra = await chamar(compradora.token, 'GET', '/me/whatsapp');
  check(stCompra.vinculado && stCompra.numero?.endsWith(WA_COMPRA.slice(-4)), 'ao entrar na área de membros com o e-mail da compra, a conta já está com o WhatsApp vinculado');
  await hotmart(`${TRANSACAO}-B`, { email: `sem-fone-${COMPRADORA}`, first_name: 'Sem', checkout_phone: '123' });
  await new Promise((ok) => setTimeout(ok, 1500));
  const { rows: [semFone] } = await pool.query(`SELECT status FROM whatsapp_convites WHERE email = $1`, [`sem-fone-${COMPRADORA}`]);
  check(semFone?.status === 'ignorado', 'telefone fora do padrão → convite ignorado, a compra segue valendo');

  // 10. PARAR
  await texto(WA, 'PARAR');
  const { rows: [opt] } = await pool.query(`SELECT opt_out_em FROM whatsapp_contatos WHERE wa_id = $1`, [WA]);
  check(Boolean(opt.opt_out_em), '"PARAR" desliga os avisos');
  await texto(WA, 'avisos');

  // 10b. Lista de compras (sem IA): plano publicado com uma receita do livro PR
  const ws = (() => { const d = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00Z`); const dow = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 1 - dow); return d.toISOString().slice(0, 10); })();
  const diasLista = Array.from({ length: 7 }, (_, i) => ({ weekday: i + 1, meals: [{ slot: 'cafe', time: '07:00', name: 'IOGURTE PROTEICO COM FRUTA, AVEIA E CHIA', code: 'PR-001', items: [{ name: 'IOGURTE PROTEICO COM FRUTA, AVEIA E CHIA', portion: '1 porção', code: 'PR-001', kcal: 325, p: 22, c: 43, f: 10 }], kcal: 325, p: 22, c: 43, f: 10 }] }));
  await pool.query(`INSERT INTO meal_plans (user_id, week_start, week_index, week_total, targets, days, status, published_at) VALUES ($1, $2, 1, 4, '{"kcal":1600}', $3, 'ativo', NOW()) ON CONFLICT (user_id, week_start) DO UPDATE SET days = EXCLUDED.days, status = 'ativo'`, [cli.user.id, ws, JSON.stringify(diasLista)]);
  await texto(WA, 'lista de compras');
  // Saem 2 mensagens: o texto (com botão "Ver por dia") e, depois, o PDF da folha.
  const saidasLista = await saidas(WA, 3);
  const saidaLista = saidasLista.find((m) => m.tipo === 'interactive') || { texto: '' };
  check(saidasLista[0]?.tipo === 'document' && /PDF/.test(saidasLista[0].texto), 'a lista geral vai também como PDF anexado (a folha com a marca)');
  check(/Lista de compras/.test(saidaLista.texto) && /Iogurte proteico/.test(saidaLista.texto) && saidaLista.tipo === 'interactive', '"lista de compras" → lista geral com ingredientes do livro e botão "Ver por dia"');
  check(/Lista de compras de Duda/.test(saidaLista.texto), 'a lista sai com o apelido que ela escolheu');
  // Formato de 22/09: seções do mercado, quantidades SOMADAS na semana (7 cafés
  // × 160 g = 1.120 g → 8 potes de 150 g), unidade de compra na frente e o
  // peso entre parênteses.
  check(/\*🥚 Ovos e laticínios\*/.test(saidaLista.texto) && /Iogurte proteico — 8 potes \(1,1 kg · 150 g cada\)/.test(saidaLista.texto), 'lista por seção do mercado, com os 7 cafés somados em 8 potes de iogurte');
  check(!/Por refeição/.test(JSON.stringify(saidaLista)), 'não existe mais o modo "por refeição"');
  await botao(WA, `lista:dia:${ws}`, 'Ver por dia');
  check(/\*Segunda\*/.test((await ultima(WA)).texto) && /\*Domingo\*/.test((await ultima(WA)).texto), 'botão "Ver por dia" → lista dia a dia');
  const listaJson = await chamar(tCli, 'GET', `/me/lista-compras?week_start=${ws}`);
  check(listaJson.week_start === ws && Array.isArray(listaJson.secoes) && listaJson.secoes.some((s) => s.id === 'laticinios' && s.itens.some((i) => i.nome === 'Iogurte proteico' && i.principal === '8 potes')) && typeof listaJson.texto === 'string' && Array.isArray(listaJson.cardapio) && listaJson.cardapio[0]?.refeicoes?.length > 0 && listaJson.cardapio.every((d) => d.refeicoes.every((r) => r !== r.toUpperCase())), 'GET /me/lista-compras → seções, dias e texto, a MESMA lista da Luna');
  const pdfRes = await fetch(`${BASE}/me/lista-compras.pdf?week_start=${ws}`, { headers: { Authorization: `Bearer ${tCli}` } });
  const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());
  check(pdfRes.status === 200 && String(pdfRes.headers.get('content-type')).includes('application/pdf') && pdfBuf.subarray(0, 5).toString() === '%PDF-' && pdfBuf.length > 3000, 'GET /me/lista-compras.pdf → PDF de verdade (a mesma folha da web e do WhatsApp)');
  await chamar(tCli, 'GET', '/me/lista-compras?week_start=2030-01-07', undefined, 404);
  await chamar(tCli, 'POST', '/me/lista-compras/whatsapp', { week_start: ws }, 404);

  // 11. Com IA de verdade
  if (COM_IA) {
    console.log('\n— Com IA (foto real de scripts/food-test)\n');
    await receber(WA, { type: 'image', image: { id: 'sim:01-arroz-carne.jpeg', mime_type: 'image/jpeg' } });
    const pergunta = await ultima(WA);
    check(/Ela é de quê/.test(pergunta.texto), 'foto sem legenda → pergunta "refeição ou evolução?" antes de qualquer IA');
    const { rows: [foto] } = await pool.query(`SELECT m.id FROM whatsapp_mensagens m JOIN whatsapp_contatos c ON c.id = m.contato_id WHERE c.wa_id = $1 AND m.tipo = 'image' ORDER BY m.criado_em DESC LIMIT 1`, [WA]);
    await botao(WA, `foto:r:${foto.id}`, 'Refeição');
    const { rows: [ref] } = await pool.query(`SELECT e.id, e.slot, e.kcal, e.source, e.photo_key, jsonb_array_length(e.items) AS itens FROM meal_entries e JOIN users u ON u.id = e.user_id WHERE u.email = $1 ORDER BY e.created_at DESC LIMIT 1`, [CLIENTE]);
    check(ref?.source === 'whatsapp' && Number(ref.kcal) > 50 && ref.itens > 0 && ref.photo_key, `foto → IA → diário (${ref?.itens} itens, ${Math.round(ref?.kcal)} kcal, em ${ref?.slot})`);
    check(/Registrei no/.test((await ultima(WA)).texto), 'confirmação com itens, total do dia e botões');
    await botao(WA, `foto:r:${foto.id}`, 'Refeição');
    const { rows: [qt] } = await pool.query(`SELECT COUNT(*)::int AS n FROM meal_entries e JOIN users u ON u.id = e.user_id WHERE u.email = $1`, [CLIENTE]);
    check(qt.n === 1, 'toque duplo no botão não registra a refeição duas vezes');
    await botao(WA, `slotset:${ref.id}:jantar`, 'Jantar');
    const { rows: [mud] } = await pool.query(`SELECT slot FROM meal_entries WHERE id = $1`, [ref.id]);
    check(mud.slot === 'jantar', 'botão "Mudar refeição" troca o slot');
    const dia = await chamar(tCli, 'GET', `/me/dia?date=${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })}`);
    check(dia.entries?.some((e) => e.source === 'whatsapp'), 'a refeição aparece na área de membros (GET /me/dia)');

    await receber(WA, { type: 'image', image: { id: 'sim:02-cuscus-ovo.jpeg', mime_type: 'image/jpeg', caption: 'meu antes e depois' } });
    const { rows: [evo] } = await pool.query(`SELECT COUNT(*)::int AS n FROM progress_photos p JOIN users u ON u.id = p.user_id WHERE u.email = $1`, [CLIENTE]);
    const usoFoto = (await pool.query(`SELECT COUNT(*)::int AS n FROM ai_usage WHERE rota = '/whatsapp/foto'`)).rows[0].n;
    check(evo.n === 1 && /Evolução/.test((await ultima(WA)).texto), 'legenda "antes e depois" → vai pra Evolução');
    check(usoFoto >= 1, 'uso de IA do WhatsApp contabilizado em ai_usage (rota /whatsapp/foto)');

    await texto(WA, 'posso trocar o arroz por batata doce no almoço?');
    const luna = await ultima(WA);
    check(luna.autor === 'luna' && luna.texto.length > 20, `Luna respondeu: "${luna.texto.replace(/\s+/g, ' ').slice(0, 110)}…"`);
  }
} catch (e) {
  falhas++; console.error('\n✘ o teste quebrou:', e);
} finally {
  // Limpeza: tudo que o teste criou (o CASCADE leva contatos, mensagens, diário…)
  await pool.query(`DELETE FROM whatsapp_fila WHERE chave = ANY($1)`, [[WA, WA_ESTRANHO, WA_COMPRA]]);
  await pool.query(`DELETE FROM whatsapp_contatos WHERE wa_id = ANY($1)`, [[WA, WA_ESTRANHO, WA_COMPRA]]);
  await pool.query(`DELETE FROM purchases WHERE external_id = ANY($1)`, [[`teste-wa-${stamp}`, TRANSACAO, `${TRANSACAO}-B`]]);
  await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [[CLIENTE, SUPORTE, NUTRI, COMPRADORA]]);
  await pool.end();
  console.log(falhas ? `\n✘ ${falhas} falha(s)\n` : '\n✔ tudo passou\n');
  process.exit(falhas ? 1 : 0);
}
