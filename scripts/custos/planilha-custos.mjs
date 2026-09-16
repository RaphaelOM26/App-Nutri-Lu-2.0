// Gera docs/custos-10mil-pacientes.xlsx (com fórmulas) e o .md com o resumo.
// Depende de exceljs, que NÃO está no package.json: rode com
//   npm i --no-save exceljs && node scripts/custos/planilha-custos.mjs
// na raiz do repo.
// Todas as fórmulas apontam pra aba Premissas: mudou um número lá, recalcula tudo.
import ExcelJS from 'exceljs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SAIDA_XLSX = fileURLToPath(new URL('../../docs/custos-10mil-pacientes.xlsx', import.meta.url));
const SAIDA_MD = fileURLToPath(new URL('../../docs/custos-10mil-pacientes.md', import.meta.url));
const HOJE = '2026-09-17';

const wb = new ExcelJS.Workbook();
wb.creator = 'Nutri Lu · planilha gerada por script'; wb.created = new Date();

const negrito = { bold: true };
const titulo = (ws, texto, sub) => {
  ws.getCell('A1').value = texto; ws.getCell('A1').font = { bold: true, size: 14 };
  if (sub) { ws.getCell('A2').value = sub; ws.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } }; }
};
const cabecalho = (ws, linha, cols) => {
  cols.forEach((c, i) => { const cell = ws.getCell(linha, i + 1); cell.value = c; cell.font = negrito; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFE3' } }; });
};

// ─── 1. Premissas ─────────────────────────────────────────────────────────
const P = wb.addWorksheet('Premissas');
titulo(P, 'Premissas (mude aqui; o resto recalcula)', `Preços coletados em ${HOJE}. Linhas marcadas "estimativa" são chute meu com base no uso esperado: ajuste quando tiver dado real.`);
P.columns = [{ width: 46 }, { width: 14 }, { width: 16 }, { width: 70 }];
cabecalho(P, 4, ['Premissa', 'Valor', 'Unidade', 'De onde veio / observação']);
const prem = {}; const val = {};
let linha = 5;
const grupo = (nome) => { linha += 1; const c = P.getCell(linha, 1); c.value = nome; c.font = { bold: true, color: { argb: 'FF2F4F2F' } }; linha += 1; };
const param = (chave, rotulo, valor, unidade, nota) => {
  P.getCell(linha, 1).value = rotulo; P.getCell(linha, 2).value = valor; P.getCell(linha, 3).value = unidade; P.getCell(linha, 4).value = nota;
  P.getCell(linha, 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF6D5' } };
  prem[chave] = `Premissas!$B$${linha}`; val[chave] = valor; linha += 1;
};

grupo('Geral');
param('cambio', 'Câmbio (R$ por US$)', 5.5, 'R$/US$', 'Estimativa: atualize pelo dia.');
param('semanas_mes', 'Semanas por mês', 4.33, 'semanas', 'Média do ano.');

grupo('OpenAI (modelo gpt-5.4-mini, o que o backend usa)');
param('in_1m', 'Preço por 1 milhão de tokens de ENTRADA', 0.75, 'US$', 'developers.openai.com/api/docs/pricing (17/09/2026).');
param('out_1m', 'Preço por 1 milhão de tokens de SAÍDA', 4.5, 'US$', 'Idem.');
param('chat_msgs', 'Chat da Lu: mensagens por paciente por mês', 20, 'msgs', 'Estimativa. Teto atual no backend: 60/dia e 600/mês por conta (limites.js).');
param('chat_in', 'Chat da Lu: tokens de entrada por mensagem', 3000, 'tokens', 'Estimativa: prompt do sistema + contexto (perfil, plano, 40 receitas candidatas) + histórico.');
param('chat_out', 'Chat da Lu: tokens de saída por mensagem', 250, 'tokens', 'Estimativa (resposta curta em JSON).');
param('foto_n', 'Foto do prato por IA: análises por paciente por mês', 30, 'fotos', 'Estimativa: 1/dia. Teto atual: 30/dia e 400/mês.');
param('foto_in', 'Foto: tokens de entrada por análise', 1500, 'tokens', 'Estimativa: imagem (~1.000) + prompt.');
param('foto_out', 'Foto: tokens de saída por análise', 300, 'tokens', 'Estimativa (JSON com itens e macros).');
param('resumo_n', 'Resumo do dia / insight por IA: por paciente por mês', 0, 'chamadas', 'Só existe no app de celular, que ninguém vai usar. Deixe 0; se a web ganhar isso, use 30.');
param('resumo_in', 'Resumo do dia: tokens de entrada', 2000, 'tokens', 'Estimativa.');
param('resumo_out', 'Resumo do dia: tokens de saída', 300, 'tokens', 'Estimativa.');
param('sintese_dia', 'Síntese do dashboard: chamadas por dia (custo global, não por paciente)', 1, 'chamadas', '1x/dia com cache (dashboard.js).');
param('sintese_in', 'Síntese: tokens de entrada por chamada', 20000, 'tokens', 'Estimativa: amostra das respostas abertas não clínicas.');
param('sintese_out', 'Síntese: tokens de saída por chamada', 1000, 'tokens', 'Estimativa.');

grupo('E-mail transacional');
param('email_n', 'E-mails por paciente por mês', 7, 'e-mails', 'Estimativa: 4 códigos de login + 1 "plano pronto" + 2 recados.');
param('email_50k', 'Provedor: plano até 50 mil e-mails/mês', 20, 'US$/mês', 'Resend Pro (referência de mercado; Brevo/Postmark parecidos). Hoje o backend usa SMTP da caixa Titan, que NÃO serve pra volume: precisa trocar.');
param('email_100k', 'Provedor: plano até 100 mil e-mails/mês', 90, 'US$/mês', 'Resend Scale.');
param('email_extra', 'Acima de 100 mil: custo por e-mail adicional', 0.0009, 'US$', 'Estimativa a partir das faixas maiores; confirmar no provedor escolhido.');

grupo('Cloudflare R2 (fotos dos pratos e PDFs)');
param('r2_fotos', 'Fotos enviadas por paciente por mês', 30, 'fotos', 'Estimativa: 1/dia.');
param('r2_kb', 'Tamanho médio da foto', 150, 'KB', 'Estimativa: o app redimensiona antes de subir.');
param('r2_meses', 'Meses de fotos acumuladas (retenção)', 6, 'meses', 'Estimativa: hoje nada é apagado. Definir política de retenção baixa o custo.');
param('r2_gb', 'Armazenamento', 0.015, 'US$/GB-mês', 'developers.cloudflare.com/r2/pricing (10 GB grátis/mês).');
param('r2_a', 'Operações classe A (upload)', 4.5, 'US$/milhão', 'Idem (1 milhão grátis/mês).');
param('r2_b', 'Operações classe B (leitura)', 0.36, 'US$/milhão', 'Idem (10 milhões grátis/mês). Sem custo de saída de dados.');
param('r2_leituras', 'Leituras por foto ao longo da vida', 10, 'leituras', 'Estimativa (paciente + painel da nutri).');

grupo('Railway (API + Postgres)');
param('rw_vcpu', 'vCPU', 20, 'US$/vCPU-mês', 'railway.com/pricing (17/09/2026).');
param('rw_ram', 'Memória', 10, 'US$/GB-mês', 'Idem.');
param('rw_vol', 'Volume (disco do Postgres)', 0.15, 'US$/GB-mês', 'Idem.');
param('rw_egress', 'Saída de dados', 0.05, 'US$/GB', 'Idem.');
param('rw_plano', 'Plano Pro (por assento)', 20, 'US$/mês', 'Idem. Hoje está no Hobby (US$ 5, inclui US$ 5 de uso). Pro traz mais limite de recursos e suporte.');

grupo('WhatsApp (bot ainda não existe; deixe 0 até existir)');
param('wa_msgs', 'Mensagens iniciadas pela empresa por paciente por mês', 0, 'msgs', 'Quando o bot existir, use ~10.');
param('wa_preco', 'Preço por mensagem utilitária no Brasil', 0.008, 'US$', 'Estimativa pela tabela pública da Meta; confirmar na hora de contratar (BSP).');

grupo('Tempo da equipe (o gargalo real)');
param('min_plano', 'Minutos da nutri por plano do mês (gerar, conferir, publicar)', 6, 'min', 'Estimativa com o editor atual, revisando por exceção. Sem lote, é bem mais.');
param('min_duvida', 'Minutos por dúvida respondida', 3, 'min', 'Estimativa.');
param('duvidas_mes', 'Dúvidas por paciente por mês', 2, 'dúvidas', 'Estimativa.');
param('horas_nutri', 'Horas úteis de uma nutri por mês', 140, 'horas', '~7 h/dia × 20 dias.');

grupo('Receita (opcional: pra ver a margem)');
param('ticket', 'Ticket mensal por paciente', 0, 'R$', 'PREENCHA. Fica 0 até você decidir o preço.');
param('hot_pct', 'Taxa da Hotmart (percentual)', 0.099, '%', 'Referência pública 9,9% + R$ 1 por venda; confirmar no contrato.');
param('hot_fixo', 'Taxa da Hotmart (fixa por venda)', 1, 'R$', 'Idem.');

// ─── 2. Por paciente ──────────────────────────────────────────────────────
const C = wb.addWorksheet('Por paciente');
titulo(C, 'Custo variável por paciente por mês', 'Só o que cresce com cada paciente. Infra e planos de e-mail estão na aba Cenários, porque vêm em degraus.');
C.columns = [{ width: 44 }, { width: 16 }, { width: 16 }, { width: 60 }];
cabecalho(C, 4, ['Item', 'US$/mês', 'R$/mês', 'Como foi calculado']);
const por = {}; const porVal = {};
let lc = 5;
const item = (chave, rotulo, formula, valor, como) => {
  C.getCell(lc, 1).value = rotulo;
  C.getCell(lc, 2).value = { formula, result: valor }; C.getCell(lc, 2).numFmt = '0.0000';
  C.getCell(lc, 3).value = { formula: `B${lc}*${prem.cambio}`, result: valor * val.cambio }; C.getCell(lc, 3).numFmt = '0.00';
  C.getCell(lc, 4).value = como;
  por[chave] = `'Por paciente'!$B$${lc}`; porVal[chave] = valor; lc += 1;
};
const tok = (n, i, o) => n * (i * val.in_1m + o * val.out_1m) / 1e6;
item('chat', 'Chat da Lu (IA)', `${prem.chat_msgs}*(${prem.chat_in}*${prem.in_1m}+${prem.chat_out}*${prem.out_1m})/1000000`, tok(val.chat_msgs, val.chat_in, val.chat_out), 'msgs × (entrada × preço + saída × preço)');
item('foto', 'Foto do prato (IA)', `${prem.foto_n}*(${prem.foto_in}*${prem.in_1m}+${prem.foto_out}*${prem.out_1m})/1000000`, tok(val.foto_n, val.foto_in, val.foto_out), 'análises × (entrada × preço + saída × preço)');
item('resumo', 'Resumo do dia (IA, só app)', `${prem.resumo_n}*(${prem.resumo_in}*${prem.in_1m}+${prem.resumo_out}*${prem.out_1m})/1000000`, tok(val.resumo_n, val.resumo_in, val.resumo_out), 'idem');
const r2GB = (val.r2_fotos * val.r2_kb * val.r2_meses) / 1024 / 1024;
item('r2_storage', 'R2: fotos guardadas', `(${prem.r2_fotos}*${prem.r2_kb}*${prem.r2_meses}/1024/1024)*${prem.r2_gb}`, r2GB * val.r2_gb, 'fotos/mês × KB × meses de retenção → GB × preço');
item('r2_ops', 'R2: uploads e leituras', `${prem.r2_fotos}*(${prem.r2_a}+${prem.r2_leituras}*${prem.r2_b})/1000000`, val.r2_fotos * (val.r2_a + val.r2_leituras * val.r2_b) / 1e6, 'fotos × (classe A + leituras × classe B)');
item('email_extra', 'E-mail acima do plano (só quando passa de 100 mil/mês)', `${prem.email_n}*${prem.email_extra}`, val.email_n * val.email_extra, 'Usado na aba Cenários só no que exceder o plano.');
item('wa', 'WhatsApp (quando existir)', `${prem.wa_msgs}*${prem.wa_preco}`, val.wa_msgs * val.wa_preco, 'msgs × preço');
lc += 1;
C.getCell(lc, 1).value = 'TOTAL variável por paciente (sem o e-mail extra)'; C.getCell(lc, 1).font = negrito;
const totalVar = porVal.chat + porVal.foto + porVal.resumo + porVal.r2_storage + porVal.r2_ops + porVal.wa;
C.getCell(lc, 2).value = { formula: `${por.chat}+${por.foto}+${por.resumo}+${por.r2_storage}+${por.r2_ops}+${por.wa}`, result: totalVar }; C.getCell(lc, 2).numFmt = '0.0000'; C.getCell(lc, 2).font = negrito;
C.getCell(lc, 3).value = { formula: `B${lc}*${prem.cambio}`, result: totalVar * val.cambio }; C.getCell(lc, 3).numFmt = '0.00'; C.getCell(lc, 3).font = negrito;
const TOTAL_VAR = `'Por paciente'!$B$${lc}`;
lc += 2;
C.getCell(lc, 1).value = 'Leitura:'; C.getCell(lc, 1).font = negrito; lc += 1;
C.getCell(lc, 1).value = 'A IA (chat + foto) é quase todo o custo variável. Os tetos por conta em limites.js são o freio: se um paciente usar o teto inteiro do chat (600/mês), ele sozinho custa 30× a média.'; lc += 1;
C.getCell(lc, 1).value = 'Cache de prompt da OpenAI (o prompt do sistema e a lista de receitas se repetem) pode cortar a entrada do chat em até ~50%. Não está contado aqui.';

// ─── 3. Cenários ──────────────────────────────────────────────────────────
const S = wb.addWorksheet('Cenários');
titulo(S, 'Cenários por número de pacientes', 'Infra e e-mail vêm em degraus (minha estimativa de tamanho por faixa). Os totais somam a aba Por paciente × N.');
S.columns = [{ width: 46 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 50 }];
const NS = [1000, 5000, 10000, 30000];
cabecalho(S, 4, ['', ...NS.map((n) => `${n.toLocaleString('pt-BR')} pacientes`), 'Observação']);
const colL = (i) => String.fromCharCode(66 + i); // B, C, D, E
let ls = 5;
const linhaN = (rotulo, fn, fmt, nota, bold = false) => {
  S.getCell(ls, 1).value = rotulo; if (bold) S.getCell(ls, 1).font = negrito;
  NS.forEach((n, i) => { const { formula, result } = fn(n, i, colL(i)); const c = S.getCell(ls, i + 2); c.value = formula ? { formula, result } : result; c.numFmt = fmt; if (bold) c.font = negrito; });
  S.getCell(ls, 6).value = nota; const r = ls; ls += 1; return r;
};
// Infra por faixa (estimativa de dimensionamento)
const infra = { 1000: { api_cpu: 1, api_ram: 1, db_cpu: 1, db_ram: 2, vol: 5, egress: 30 }, 5000: { api_cpu: 2, api_ram: 2, db_cpu: 2, db_ram: 4, vol: 15, egress: 120 }, 10000: { api_cpu: 2, api_ram: 4, db_cpu: 2, db_ram: 8, vol: 30, egress: 250 }, 30000: { api_cpu: 4, api_ram: 8, db_cpu: 4, db_ram: 16, vol: 80, egress: 700 } };
const rN = linhaN('Pacientes (N)', (n) => ({ result: n }), '#,##0', 'Mude aqui pra testar outro tamanho.', true);
const N = (col) => `${col}$${rN}`;
ls += 1; S.getCell(ls, 1).value = 'Custo variável (aba Por paciente × N)'; S.getCell(ls, 1).font = negrito; ls += 1;
const rVar = linhaN('IA + R2 + WhatsApp (US$/mês)', (n, i, col) => ({ formula: `${N(col)}*${TOTAL_VAR}`, result: n * totalVar }), '#,##0.00', 'Cresce linear com N.');
ls += 1; S.getCell(ls, 1).value = 'Custos em degrau'; S.getCell(ls, 1).font = negrito; ls += 1;
const emailsDe = (n) => n * val.email_n;
const emailCusto = (n) => { const e = emailsDe(n); if (e <= 3000) return 0; if (e <= 50000) return val.email_50k; if (e <= 100000) return val.email_100k; return val.email_100k + (e - 100000) * val.email_extra; };
const rEmail = linhaN('E-mail transacional (US$/mês)', (n, i, col) => ({ formula: `IF(${N(col)}*${prem.email_n}<=3000,0,IF(${N(col)}*${prem.email_n}<=50000,${prem.email_50k},IF(${N(col)}*${prem.email_n}<=100000,${prem.email_100k},${prem.email_100k}+(${N(col)}*${prem.email_n}-100000)*${prem.email_extra})))`, result: emailCusto(n) }), '#,##0.00', 'Faixas: até 3 mil grátis, até 50 mil, até 100 mil, depois por e-mail.');
const rowsInfra = {};
const infraLinha = (chave, rotulo, valores, precoRef, precoVal, nota) => {
  const r = linhaN(rotulo, (n, i) => ({ result: valores[n] }), '#,##0', nota); rowsInfra[chave] = { r, valores };
  return r;
};
infraLinha('api_cpu', 'API: vCPU', Object.fromEntries(NS.map((n) => [n, infra[n].api_cpu])), null, null, 'Estimativa de dimensionamento.');
infraLinha('api_ram', 'API: GB de RAM', Object.fromEntries(NS.map((n) => [n, infra[n].api_ram])), null, null, '');
infraLinha('db_cpu', 'Postgres: vCPU', Object.fromEntries(NS.map((n) => [n, infra[n].db_cpu])), null, null, '');
infraLinha('db_ram', 'Postgres: GB de RAM', Object.fromEntries(NS.map((n) => [n, infra[n].db_ram])), null, null, '');
infraLinha('vol', 'Postgres: GB de disco', Object.fromEntries(NS.map((n) => [n, infra[n].vol])), null, null, 'Registros de refeição, planos, mensagens.');
infraLinha('egress', 'Saída de dados (GB/mês)', Object.fromEntries(NS.map((n) => [n, infra[n].egress])), null, null, 'API + fotos assinadas passam pelo R2, não por aqui.');
const infraCusto = (n) => { const x = infra[n]; return val.rw_plano + (x.api_cpu + x.db_cpu) * val.rw_vcpu + (x.api_ram + x.db_ram) * val.rw_ram + x.vol * val.rw_vol + x.egress * val.rw_egress; };
const rInfra = linhaN('Railway total (US$/mês)', (n, i, col) => {
  const R = rowsInfra; return { formula: `${prem.rw_plano}+(${col}${R.api_cpu.r}+${col}${R.db_cpu.r})*${prem.rw_vcpu}+(${col}${R.api_ram.r}+${col}${R.db_ram.r})*${prem.rw_ram}+${col}${R.vol.r}*${prem.rw_vol}+${col}${R.egress.r}*${prem.rw_egress}`, result: infraCusto(n) };
}, '#,##0.00', 'Plano Pro + recursos × preço.');
const sinteseMes = val.sintese_dia * 30 * (val.sintese_in * val.in_1m + val.sintese_out * val.out_1m) / 1e6;
const rSint = linhaN('Síntese do dashboard por IA (US$/mês)', () => ({ formula: `${prem.sintese_dia}*30*(${prem.sintese_in}*${prem.in_1m}+${prem.sintese_out}*${prem.out_1m})/1000000`, result: sinteseMes }), '#,##0.00', 'Global, não depende de N.');
const rPages = linhaN('Cloudflare Pages (site + área de membros)', () => ({ result: 0 }), '#,##0.00', 'Plano grátis serve.');
ls += 1;
const totalUSD = (n) => n * totalVar + emailCusto(n) + infraCusto(n) + sinteseMes;
const rTot = linhaN('TOTAL (US$/mês)', (n, i, col) => ({ formula: `${col}${rVar}+${col}${rEmail}+${col}${rInfra}+${col}${rSint}+${col}${rPages}`, result: totalUSD(n) }), '#,##0.00', '', true);
const rTotBRL = linhaN('TOTAL (R$/mês)', (n, i, col) => ({ formula: `${col}${rTot}*${prem.cambio}`, result: totalUSD(n) * val.cambio }), '#,##0.00', '', true);
const rPorPac = linhaN('Custo por paciente (R$/mês)', (n, i, col) => ({ formula: `${col}${rTotBRL}/${N(col)}`, result: totalUSD(n) * val.cambio / n }), '#,##0.00', 'É esse número que tem que caber no ticket.', true);
ls += 1; S.getCell(ls, 1).value = 'Tempo da equipe'; S.getCell(ls, 1).font = negrito; ls += 1;
const horas = (n) => (n * val.min_plano + n * val.duvidas_mes * val.min_duvida) / 60;
const rHoras = linhaN('Horas de nutri por mês', (n, i, col) => ({ formula: `(${N(col)}*${prem.min_plano}+${N(col)}*${prem.duvidas_mes}*${prem.min_duvida})/60`, result: horas(n) }), '#,##0', 'Planos + dúvidas.');
const rNutris = linhaN('Nutris necessárias (tempo integral)', (n, i, col) => ({ formula: `${col}${rHoras}/${prem.horas_nutri}`, result: horas(n) / val.horas_nutri }), '0.0', 'Sem aprovação em lote, a Lu sozinha para em ~1.000 pacientes.', true);
ls += 1; S.getCell(ls, 1).value = 'Receita (se o ticket estiver preenchido)'; S.getCell(ls, 1).font = negrito; ls += 1;
const receita = (n) => n * (val.ticket * (1 - val.hot_pct) - val.hot_fixo);
const rRec = linhaN('Receita líquida da Hotmart (R$/mês)', (n, i, col) => ({ formula: `IF(${prem.ticket}>0,${N(col)}*(${prem.ticket}*(1-${prem.hot_pct})-${prem.hot_fixo}),0)`, result: val.ticket > 0 ? receita(n) : 0 }), '#,##0.00', 'N × (ticket − taxa Hotmart).');
linhaN('Margem antes de equipe e impostos (R$/mês)', (n, i, col) => ({ formula: `IF(${prem.ticket}>0,${col}${rRec}-${col}${rTotBRL},0)`, result: val.ticket > 0 ? receita(n) - totalUSD(n) * val.cambio : 0 }), '#,##0.00', 'Não inclui salário das nutris, impostos nem marketing.');

// ─── 4. Fontes e decisões ─────────────────────────────────────────────────
const F = wb.addWorksheet('Fontes e decisões');
titulo(F, 'De onde vieram os números e o que precisa decidir');
F.columns = [{ width: 40 }, { width: 100 }];
let lf = 3;
const fonte = (a, b) => { F.getCell(lf, 1).value = a; F.getCell(lf, 2).value = b; lf += 1; };
fonte('OpenAI', 'https://developers.openai.com/api/docs/pricing — gpt-5.4-mini: US$ 0,75/1M entrada, US$ 4,50/1M saída (17/09/2026).');
fonte('Railway', 'https://railway.com/pricing — US$ 20/vCPU-mês, US$ 10/GB RAM-mês, US$ 0,15/GB volume, US$ 0,05/GB saída; Hobby US$ 5, Pro US$ 20/assento.');
fonte('Cloudflare R2', 'https://developers.cloudflare.com/r2/pricing — US$ 0,015/GB-mês, classe A US$ 4,50/M, classe B US$ 0,36/M, saída grátis.');
fonte('E-mail', 'Resend (referência): Pro US$ 20 até 50 mil/mês, Scale US$ 90 até 100 mil/mês. Confirmar no provedor escolhido.');
fonte('WhatsApp', 'Tabela pública da Meta pra mensagens utilitárias no Brasil (~US$ 0,008). Confirmar com o BSP na contratação.');
fonte('Hotmart', 'Taxa pública 9,9% + R$ 1 por venda. Confirmar no contrato.');
lf += 1;
fonte('DECISÕES PENDENTES', '');
fonte('1. Provedor de e-mail', 'Hoje o backend manda pelo SMTP da caixa Titan. Caixa de e-mail tem limite de envio diário e vai bloquear no lançamento. Trocar por transacional (Resend, Brevo, Postmark) antes de abrir a venda.');
fonte('2. Railway Hobby → Pro', 'Hobby é 1 instância pequena. Antes de 1.000 pacientes, passar pra Pro e dimensionar API e Postgres.');
fonte('3. Retenção de fotos', 'Definir quantos meses de foto do prato ficam guardados. Muda o custo do R2 e é uma decisão de LGPD também.');
fonte('4. Aprovação em lote', 'Com o editor atual a Lu para em ~1.000 pacientes. Precisa de geração automática com revisão por exceção e/ou mais nutris com o papel "nutri".');
fonte('5. Ticket', 'Preencha o ticket na aba Premissas pra ver a margem por cenário.');

await wb.xlsx.writeFile(SAIDA_XLSX);

// ─── Resumo em markdown ───────────────────────────────────────────────────
const brl = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usd = (v) => `US$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const md = `# Custos por paciente e por cenário (gerado em ${HOJE})

Planilha viva: \`docs/custos-10mil-pacientes.xlsx\` (aba **Premissas** é editável; o resto recalcula).
Regenerar: \`node <scratchpad>/planilha-custos.mjs\` (script fica fora do repo; copie pra \`scripts/\` se quiser versionar).

## Custo variável por paciente por mês (câmbio ${val.cambio})

| Item | US$ | R$ |
|---|---:|---:|
| Chat da Lu (IA, ${val.chat_msgs} msgs) | ${porVal.chat.toFixed(4)} | ${(porVal.chat * val.cambio).toFixed(2)} |
| Foto do prato (IA, ${val.foto_n} fotos) | ${porVal.foto.toFixed(4)} | ${(porVal.foto * val.cambio).toFixed(2)} |
| R2 (fotos guardadas + operações) | ${(porVal.r2_storage + porVal.r2_ops).toFixed(4)} | ${((porVal.r2_storage + porVal.r2_ops) * val.cambio).toFixed(2)} |
| WhatsApp (0 até existir) | ${porVal.wa.toFixed(4)} | ${(porVal.wa * val.cambio).toFixed(2)} |
| **Total variável** | **${totalVar.toFixed(4)}** | **${(totalVar * val.cambio).toFixed(2)}** |

## Cenários (US$/mês → R$/mês)

| Pacientes | IA+R2 | E-mail | Railway | Total US$ | Total R$ | R$/paciente | Horas de nutri | Nutris |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${NS.map((n) => `| ${n.toLocaleString('pt-BR')} | ${usd(n * totalVar)} | ${usd(emailCusto(n))} | ${usd(infraCusto(n))} | ${usd(totalUSD(n))} | ${brl(totalUSD(n) * val.cambio)} | ${brl(totalUSD(n) * val.cambio / n)} | ${Math.round(horas(n))} | ${(horas(n) / val.horas_nutri).toFixed(1)} |`).join('\n')}

## O que os números dizem

- **A IA é ~90% do custo variável.** Chat e foto do prato. Os tetos por conta (limites.js) são o freio; cache de prompt da OpenAI pode cortar a entrada do chat pela metade (não contado).
- **Infra e e-mail são pequenos** perto da IA, mas exigem troca de ferramenta: SMTP do Titan → provedor transacional; Railway Hobby → Pro com Postgres dimensionado.
- **O custo que não cabe é o humano.** Em 10 mil pacientes, ${Math.round(horas(10000))} horas/mês de nutri (${(horas(10000) / val.horas_nutri).toFixed(1)} pessoas em tempo integral) com o fluxo atual. Aprovação em lote e revisão por exceção são obrigatórias antes do volume.

## Decisões pendentes

1. Provedor de e-mail transacional (antes de abrir a venda).
2. Railway Pro e tamanho do Postgres (antes de ~1.000 pacientes).
3. Retenção das fotos do prato (custo + LGPD).
4. Desenho da aprovação em lote / equipe de nutris.
5. Ticket mensal (preencher na planilha pra ver a margem).
`;
writeFileSync(SAIDA_MD, md, 'utf8');
console.log('ok', SAIDA_XLSX);
console.log(md.split('\n').slice(8, 30).join('\n'));
