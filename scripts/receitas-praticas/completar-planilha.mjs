// Completa a planilha "Receitas simples Nutri Lu" com o que está nos docs dos
// cardápios (Projeto 21 dias + 10 cardápios práticos): ingredientes com
// gramas, observações e substituições. A planilha original NÃO é tocada; sai
// uma cópia "- completa.xlsx" e um relatório em Markdown.
//
//   node scripts/receitas-praticas/completar-planilha.mjs
//
// Como os docs e a planilha se casam: os cardápios têm 31 dias × 4 refeições
// × 4 opções = 496 receitas, e a planilha tem 496 linhas na MESMA ordem
// (dia 1 café opção 1 = PR-001 … dia 1 jantar opção 4 = PR-016, dia 2 = PR-017…).
// O casamento é por posição E conferido pelo nome; divergência vira aviso.
//
// Regras: só preenche célula VAZIA. Nunca inventa grama: o que o doc não
// resolve fica vazio e entra no relatório. Macro da planilha é mantido; se o
// doc discorda, vai pro relatório pra Lu decidir.
//
// Duplicatas: os cardápios repetem a mesma opção em dias diferentes (o dia 2
// repete 8 opções do dia 1). Linha 100% idêntica a uma anterior é REMOVIDA da
// planilha final — a receita continua existindo, com o ID da primeira vez.
// O ID nunca é renumerado (mesma regra do livro NL), então a numeração final
// tem buracos de propósito.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('../extract-pdf/node_modules/xlsx');

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PASTA = path.join(RAIZ, 'Conteúdo');
const PLANILHA = path.join(PASTA, 'Receitas simples Nutri Lu - prioridade de recomendação.xlsx');
const SAIDA = path.join(PASTA, 'Receitas simples Nutri Lu - completa.xlsx');
const RELATORIO = path.join(PASTA, 'relatorio-receitas-simples.md');
const TMP = path.join(RAIZ, 'scripts', 'receitas-praticas', '.tmp');

const REFEICOES = ['CAFÉ DA MANHÃ', 'ALMOÇO', 'LANCHE DA TARDE', 'JANTAR'];
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const vazio = (v) => String(v ?? '').trim() === '';

// ─── 1. Docx → texto ───────────────────────────────────────────────────────
function textoDoDocx(arquivo) {
  fs.mkdirSync(TMP, { recursive: true });
  const dest = path.join(TMP, path.basename(arquivo, '.docx'));
  fs.rmSync(dest, { recursive: true, force: true });
  const zip = dest + '.zip';
  fs.copyFileSync(arquivo, zip);
  execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -Force -LiteralPath '${zip}' -DestinationPath '${dest}'`]);
  const xml = fs.readFileSync(path.join(dest, 'word', 'document.xml'), 'utf8');
  return xml.replace(/<w:tab\/>/g, '\t').replace(/<\/w:p>/g, '\n').replace(/<w:br\/>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

// ─── 2. Texto → receitas ───────────────────────────────────────────────────
function parsear(texto) {
  const out = [];
  let dia = null, ref = null, atual = null, lendoIngr = false;
  const fecha = () => { if (atual) out.push(atual); atual = null; lendoIngr = false; };
  for (const bruta of texto.split('\n')) {
    const l = bruta.trim();
    if (!l) continue;
    let m;
    if ((m = l.match(/^DIA\s+(\d+)/))) { fecha(); dia = Number(m[1]); ref = null; continue; }
    if (REFEICOES.includes(l.toUpperCase().replace(/\s+/g, ' '))) { fecha(); ref = REFEICOES.indexOf(l.toUpperCase().replace(/\s+/g, ' ')); continue; }
    if ((m = l.match(/^OP[ÇC][ÃA]O\s+(\d)\s*[—–-]\s*(.+)$/i))) {
      fecha();
      atual = { dia, refeicao: ref, opcao: Number(m[1]), nome: m[2].trim(), ingredientes: [], preparo: '', obs: '', macros: null };
      lendoIngr = true; continue;
    }
    if (!atual) continue;
    if (/^ingredientes\s*:?$/i.test(l)) { lendoIngr = true; continue; }
    if ((m = l.match(/^COMO FAZER\s*:\s*(.*)$/i))) { lendoIngr = false; atual.preparo = m[1].trim(); continue; }
    if ((m = l.match(/^OBS\.?\s*:\s*(.*)$/i))) { lendoIngr = false; atual.obs = m[1].trim(); continue; }
    if (/^bebida opcional/i.test(l)) { lendoIngr = false; continue; }
    if (/^informa[çc][ãa]o nutricional/i.test(l)) { lendoIngr = false; const r = l.replace(/^[^:]*:\s*/, ''); if (/kcal/.test(r)) atual.macros = macrosDe(r); continue; }
    if ((m = l.match(/^\d+\s*kcal\s*\|/))) { lendoIngr = false; atual.macros = macrosDe(l); continue; }
    if (lendoIngr) {
      const ing = l.replace(/^[•·\-*]\s*/, '').trim();
      if (ing && !/^ingredientes/i.test(ing)) atual.ingredientes.push(ing);
    }
  }
  fecha();
  return out;
}
function macrosDe(l) {
  const g = (re) => { const m = l.match(re); return m ? Number(m[1].replace(',', '.')) : null; };
  return { kcal: g(/(\d+(?:[.,]\d+)?)\s*kcal/i), p: g(/prote[íi]na[s]?:?\s*(\d+(?:[.,]\d+)?)/i), c: g(/carboidratos?:?\s*(\d+(?:[.,]\d+)?)/i), f: g(/gorduras?:?\s*(\d+(?:[.,]\d+)?)/i), fibra: g(/fibras?:?\s*(\d+(?:[.,]\d+)?)/i) };
}

// ─── 3. Docs + planilha ────────────────────────────────────────────────────
const docs = fs.readdirSync(PASTA).filter((f) => f.toLowerCase().endsWith('.docx') && !f.startsWith('~$'));
const receitasDoc = docs.flatMap((f) => parsear(textoDoDocx(path.join(PASTA, f))));
const porPosicao = new Map(receitasDoc.filter((r) => r.dia && r.refeicao != null && r.opcao).map((r) => [`${r.dia}-${r.refeicao}-${r.opcao}`, r]));
console.log(`${docs.length} docs · ${receitasDoc.length} receitas lidas · dias ${Math.min(...receitasDoc.map((r) => r.dia))} a ${Math.max(...receitasDoc.map((r) => r.dia))}`);

const wbOrig = XLSX.readFile(PLANILHA);
const linhas = XLSX.utils.sheet_to_json(wbOrig.Sheets['Receitas PR'], { defval: '' });
const CABECALHO = Object.keys(linhas[0]);

const rel = { preenchidos: [], semDoc: [], nomeDiferente: [], macroDiverge: [], aindaSemIngr: [], obs: 0, subs: 0, removidas: [] };

const completas = linhas.map((r, i) => {
  const out = { ...r };
  const dia = Math.floor(i / 16) + 1, refeicao = Math.floor((i % 16) / 4), opcao = (i % 4) + 1;
  const d = porPosicao.get(`${dia}-${refeicao}-${opcao}`);
  const refPlan = REFEICOES.indexOf(String(r['Refeição(ões)']).toUpperCase().trim());
  if (!d) { rel.semDoc.push(`${r.ID} ${r['Nome da receita']}`); if (vazio(out['Ingredientes padronizados'])) rel.aindaSemIngr.push(r.ID); return out; }

  const mesmoNome = norm(d.nome) === norm(r['Nome da receita']);
  if (!mesmoNome || refPlan !== refeicao) rel.nomeDiferente.push(`${r.ID} planilha "${r['Nome da receita']}" × doc dia ${dia} "${d.nome}"`);
  if (!mesmoNome && refPlan !== refeicao) { if (vazio(out['Ingredientes padronizados'])) rel.aindaSemIngr.push(r.ID); return out; }

  if (vazio(out['Ingredientes padronizados'])) {
    if (d.ingredientes.length) { out['Ingredientes padronizados'] = d.ingredientes.join('\n'); rel.preenchidos.push(r.ID); }
    else rel.aindaSemIngr.push(r.ID);
  }
  // O marcador de lista vazou pra dentro da célula nas 128 linhas que já vinham
  // preenchidas ("• Castanha-de-caju: 10 g"). Se ficar, vira nome de
  // ingrediente no app e entra no prompt da foto. Limpa as duas origens.
  out['Ingredientes padronizados'] = String(out['Ingredientes padronizados']).split('\n')
    .map((l) => l.replace(/^\s*[•·▪–-]\s*/, '').trim()).filter(Boolean).join('\n');
  if (vazio(out['Rendimento'])) out['Rendimento'] = '1 porção';
  if (vazio(out['Modo de preparo']) && d.preparo) out['Modo de preparo'] = d.preparo;
  if (d.obs && !/preparação pensada para rotina corrida/i.test(d.obs)) {
    if (/substitu|troqu|no lugar|pode ser trocad/i.test(d.obs) && vazio(out['Substituições'])) { out['Substituições'] = d.obs; rel.subs++; }
    else if (!String(out['Modo de preparo']).includes(d.obs)) { out['Modo de preparo'] = `${String(out['Modo de preparo']).trim()}\nObs.: ${d.obs}`; rel.obs++; }
  }
  if (d.macros) {
    const dif = [['Calorias (kcal/porção)', 'kcal'], ['Proteínas (g/porção)', 'p'], ['Carboidratos (g/porção)', 'c'], ['Gorduras (g/porção)', 'f'], ['Fibras (g/porção)', 'fibra']]
      .filter(([k, m]) => d.macros[m] != null && Number(r[k]) !== d.macros[m]).map(([k, m]) => `${k.split(' ')[0]} ${r[k]}→doc ${d.macros[m]}`);
    if (dif.length) rel.macroDiverge.push(`${r.ID}: ${dif.join(', ')}`);
  }
  return out;
});

// ─── 4. Duplicatas fora ────────────────────────────────────────────────────
// Mesma receita repetida em outro dia do cardápio. A chave é o conteúdo que
// define a receita: nome + ingredientes + macros. Preparo fica de fora porque
// a observação colada no fim varia entre os docs sem mudar a receita.
const vistas = new Map();
const finais = [];
for (const r of completas) {
  const chave = [r['Nome da receita'], r['Ingredientes padronizados'], r['Calorias (kcal/porção)'], r['Proteínas (g/porção)'], r['Carboidratos (g/porção)'], r['Gorduras (g/porção)']]
    .join('|').toLowerCase().replace(/\s+/g, ' ').trim();
  if (vistas.has(chave)) { rel.removidas.push(`${r.ID} = ${vistas.get(chave)} · ${r['Nome da receita']}`); continue; }
  vistas.set(chave, r.ID);
  finais.push(r);
}

// ─── 5. Escrita ────────────────────────────────────────────────────────────
const ws = XLSX.utils.json_to_sheet(finais, { header: CABECALHO });
ws['!cols'] = CABECALHO.map((c) => ({ wch: /Ingredientes|Modo de preparo|Substitui|Descrição/.test(c) ? 60 : Math.max(12, Math.min(28, c.length + 2)) }));
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Receitas PR');
XLSX.writeFile(wb, SAIDA);

const semIngr = finais.filter((r) => vazio(r['Ingredientes padronizados'])).length;
const md = [
  `# Receitas simples — relatório de preenchimento (${new Date().toISOString().slice(0, 10)})`, '',
  `Fonte: ${docs.length} docs em Conteúdo/ (${receitasDoc.length} receitas lidas). Planilha original intacta; resultado em \`${path.basename(SAIDA)}\`.`, '',
  `- Linhas na planilha original: ${linhas.length}`,
  `- **Receitas na planilha final: ${finais.length}** (${rel.removidas.length} duplicatas removidas)`,
  `- Ingredientes preenchidos a partir dos docs: **${rel.preenchidos.length}**`,
  `- Ainda sem ingredientes: **${semIngr}**${semIngr ? ` (${rel.aindaSemIngr.join(', ')})` : ''}`,
  `- Observações levadas pro preparo: ${rel.obs} · substituições levadas pra coluna própria: ${rel.subs}`,
  `- Sem receita correspondente nos docs: ${rel.semDoc.length}`,
  `- Nome/refeição diferente entre planilha e doc: ${rel.nomeDiferente.length}`,
  `- Macros divergentes (planilha mantida): ${rel.macroDiverge.length}`, '',
  `> Os IDs NÃO são renumerados: a numeração final tem buracos onde estavam as`,
  `> duplicatas. Mesma regra do livro NL — ID é a chave que amarra o plano à receita.`, '',
  '## Duplicatas removidas (a receita continua, com o ID da primeira aparição)',
  ...(rel.removidas.length ? rel.removidas.map((x) => `- ${x}`) : ['- nenhuma']), '',
  '## Nome diferente entre planilha e doc', ...(rel.nomeDiferente.length ? rel.nomeDiferente.map((x) => `- ${x}`) : ['- nenhum']), '',
  '## Macros divergentes', ...(rel.macroDiverge.length ? rel.macroDiverge.map((x) => `- ${x}`) : ['- nenhum']), '',
  '## Sem doc correspondente', ...(rel.semDoc.length ? rel.semDoc.map((x) => `- ${x}`) : ['- nenhum']), '',
].join('\n');
fs.writeFileSync(RELATORIO, md);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(md.split('\n').slice(0, 13).join('\n'));
console.log(`\nplanilha: ${SAIDA}\nrelatório: ${RELATORIO}`);
