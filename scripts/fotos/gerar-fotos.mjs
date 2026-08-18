// Geração das fotos das receitas do livro da nutri (planilha Conteúdo/).
//
// Uso:
//   node --env-file=backend/.env scripts/fotos/gerar-fotos.mjs            → piloto (8 receitas × 3 estilos)
//   node --env-file=backend/.env scripts/fotos/gerar-fotos.mjs --estilo=B → lote completo num estilo só
//
// Por que lote e não sob demanda: são 153 receitas FIXAS. Gerar na hora custaria
// uma chamada paga por usuário, daria segundos de espera e mostraria fotos
// diferentes da mesma receita pra pessoas diferentes.
//
// A chave vem do env (--env-file), nunca é lida nem impressa por este script.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Ambas as libs já existem no projeto, em pastas diferentes — importadas por
// caminho explícito pra não precisar de um npm install novo só pra este script.
const XLSX = require('../extract-pdf/node_modules/xlsx');
const openaiMod = require('../../backend/node_modules/openai');
const OpenAI = openaiMod.default ?? openaiMod;

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '../..');
const PLANILHA = path.join(RAIZ, 'Conteúdo', 'Receitas nutri Lu.xlsx');
const SAIDA = path.join(RAIZ, 'scripts', 'fotos', 'saida');

// ─── Estilos em teste ──────────────────────────────────────────────────────
// Variam SÓ o grau de "casual". O bloco de realismo abaixo é comum aos três,
// porque é ele que tira a cara de banco de imagens.
const ESTILOS = {
  A: {
    nome: 'cozinha-clara',
    cena:
      'on a clean light kitchen countertop, daylight coming from a window off to the side, ' +
      'tidy but not styled, a plain kitchen backdrop slightly out of focus behind',
  },
  B: {
    nome: 'mesa-de-casa',
    cena:
      'on a worn wooden kitchen table at home, a folded cotton dish towel at the edge of the frame, ' +
      'a few crumbs and a water ring on the table, lived-in and unstaged',
  },
  C: {
    nome: 'snapshot',
    cena:
      'a casual phone snapshot taken right before eating, frame slightly tilted and off-center, ' +
      'ordinary mixed indoor lighting, the edge of a placemat and a glass cropped by the frame',
  },
};

// Comum a todos: é aqui que mora a diferença entre "foto de anúncio" e "foto real".
const REALISMO =
  'Everyday Brazilian home cooking, photographed by an ordinary person, not a professional. ' +
  'Plain everyday white ceramic dishes and simple stainless cutlery, nothing artisanal or designer. ' +
  'Soft natural daylight, neutral white balance, gentle shadows, no golden hour. ' +
  'Normal depth of field with the whole dish in focus. ' +
  'Portions look homemade and slightly uneven, not styled or plated by a chef. ' +
  'Realistic photograph.';

const NEGATIVO =
  'Do not include: text, captions, watermarks, logos, brand names, hands, people, ' +
  'studio seamless backdrop, heavy background blur or bokeh, glossy advertising look, ' +
  'restaurant fine-dining plating, decorative garnish that is not part of the recipe.';

// ─── Enquadramento por tipo de prato ───────────────────────────────────────
// Resolve o problema das descrições template da planilha, que chamam até chá de
// "prato finalizado servido em louça clara".
const ENQUADRAMENTO = {
  prato: 'served on a plain white dinner plate, seen from a natural eye-level angle',
  salada: 'served in a shallow everyday bowl',
  molho: 'in a small sauce bowl next to a few fresh salad leaves',
  bebida: 'in a clear glass mug on a small saucer, faint steam',
  petisco: 'piled informally on a small plate',
  sobremesa: 'a single portion in a small glass dessert cup',
  mingau: 'in a cereal bowl with a spoon resting inside',
  sopa: 'in a deep soup bowl with a spoon resting inside, faint steam',
  bolo: 'one slice on a small plate, the rest of the cake out of frame',
};

// Infere o enquadramento pelo nome da receita — os nomes da planilha são muito
// regulares ("Salada de…", "Chá de…", "Molho de…"), então isso acerta quase
// tudo. Enquanto a coluna `Tipo de prato` não existir na planilha, é aqui que
// o chá deixa de ser fotografado como se fosse um prato de comida.
function inferirTipo(receita) {
  const nome = String(receita['Nome da receita'] || '');
  const refeicao = String(receita['Refeição(ões)'] || '');
  const almocoOuJantar = /almoço|jantar/i.test(refeicao);

  // Sem \b depois de "chá": em JS o \b só enxerga [A-Za-z0-9_], e "á" não conta
  // como caractere de palavra — então /^chá\b/ nunca casa com "Chá de Hibisco".
  if (/^chá\s/i.test(nome)) return 'bebida';
  if (/^molho\b/i.test(nome)) return 'molho';
  if (/^salada\b/i.test(nome)) return 'salada';
  // "Creme de Cenoura" no almoço é sopa; "Creme de Mamão" no lanche é sobremesa.
  if (/^(sopa|creme)\b/i.test(nome)) return almocoOuJantar ? 'sopa' : 'sobremesa';
  if (/^(mingau|overnight|baked oats)\b/i.test(nome)) return 'mingau';
  if (/^(pudim|flan|sorvete|mousse)\b/i.test(nome)) return 'sobremesa';
  if (/^bolo\b/i.test(nome)) return 'bolo';
  if (/sobremesa/i.test(refeicao)) return 'sobremesa';
  if (/petisco|aperitivo/i.test(refeicao)) return 'petisco';
  return 'prato';
}

// Piloto: 8 receitas escolhidas pra cobrir os casos difíceis — inclui as duas
// naturezas de descrição (específica e template), o molho, o chá e a sobremesa.
const PILOTO = [
  { id: 'NL-003', tipo: 'prato' },
  { id: 'NL-041', tipo: 'prato' },
  { id: 'NL-104', tipo: 'salada' },
  { id: 'NL-091', tipo: 'molho' },
  { id: 'NL-121', tipo: 'bebida' },
  { id: 'NL-063', tipo: 'petisco' },
  { id: 'NL-112', tipo: 'sobremesa' },
  { id: 'NL-130', tipo: 'mingau' },
];

// A descrição template não descreve nada — só troca o nome dentro da mesma
// frase. Quando for template, ignoramos e usamos os ingredientes reais.
const TEMPLATE = /^Prato finalizado de .*, servido em louça clara e fotografado de cima em luz natural\.?$/i;

function lerPlanilha() {
  const wb = XLSX.readFile(PLANILHA);
  return XLSX.utils.sheet_to_json(wb.Sheets['Receitas_App'], { defval: null });
}

function ingredientesPrincipais(texto, n = 5) {
  return String(texto || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // Linhas curtas sem quantidade são título de seção ("Massa", "Salada"),
    // não ingrediente — entram como ruído no prompt.
    .filter((l) => /\d/.test(l))
    .slice(0, n)
    .map((l) => l.replace(/\s*\([^)]*\)\s*/g, ' ').trim());
}

function montarPrompt(receita, tipo, estilo) {
  const nome = receita['Nome da receita'];
  const desc = String(receita['Descrição para foto IA'] || '').trim();
  const descricaoUtil = desc && !TEMPLATE.test(desc) ? ` ${desc}` : '';
  const ingredientes = ingredientesPrincipais(receita['Ingredientes padronizados']);
  const dica = ingredientes.length ? ` Made with: ${ingredientes.join(', ')}.` : '';
  const enquadra = ENQUADRAMENTO[tipo] || ENQUADRAMENTO.prato;

  return (
    `A home-cooked Brazilian dish called "${nome}", ${enquadra}.` +
    descricaoUtil +
    dica +
    ` Scene: ${ESTILOS[estilo].cena}. ` +
    REALISMO +
    ' ' +
    NEGATIVO
  );
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// A conta tem limite de 5 imagens/min no gpt-image-1, então 429 é esperado num
// lote grande — não é erro, é ritmo. Espera o tempo que a própria API sugere
// (ou backoff crescente) e tenta de novo.
async function gerarComRetry(client, prompt, tentativas = 5) {
  for (let i = 1; ; i++) {
    try {
      return await gerar(client, prompt);
    } catch (e) {
      const limite = e?.status === 429;
      if (!limite || i >= tentativas) throw e;
      const sugerido = Number(String(e.message).match(/try again in (\d+)/)?.[1]);
      const espera = (Number.isFinite(sugerido) ? sugerido + 3 : 15 * i) * 1000;
      console.log(`      429 — aguardando ${Math.round(espera / 1000)}s (tentativa ${i}/${tentativas - 1})`);
      await dormir(espera);
    }
  }
}

async function gerar(client, prompt) {
  const r = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
    prompt,
    // 3:2 deitado — os cards do app são mais largos que altos, então corta menos.
    size: '1536x1024',
    quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
    output_format: 'jpeg',
    output_compression: 80,
    n: 1,
  });
  const d = r?.data?.[0];
  if (d?.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d?.url) {
    const res = await fetch(d.url);
    if (!res.ok) throw new Error('falha ao baixar imagem gerada');
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error('a API não devolveu imagem');
}

// Concorrência baixa: 3 por vez. Evita rate limit e mantém o custo visível
// enquanto roda (dá pra abortar no meio sem ter queimado tudo).
async function emLotes(itens, n, fn) {
  const out = [];
  for (let i = 0; i < itens.length; i += n) {
    out.push(...(await Promise.all(itens.slice(i, i + n).map(fn))));
  }
  return out;
}

async function main() {
  // --dry monta e imprime os prompts sem chamar a API. Geração é paga: vale
  // conferir o texto antes de disparar dezenas de chamadas.
  const dry = process.argv.includes('--dry');
  const soConfere = dry || process.argv.includes('--tipos');
  if (!soConfere && !process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY ausente. Rode com: node --env-file=backend/.env scripts/fotos/gerar-fotos.mjs');
    process.exit(1);
  }
  const argEstilo = (process.argv.find((a) => a.startsWith('--estilo=')) || '').split('=')[1];
  const linhas = lerPlanilha();
  const porId = Object.fromEntries(linhas.map((r) => [r['ID'], r]));

  const trabalhos = [];
  if (argEstilo) {
    if (!ESTILOS[argEstilo]) throw new Error('estilo inválido: ' + argEstilo);
    for (const l of linhas) trabalhos.push({ id: l['ID'], tipo: inferirTipo(l), estilo: argEstilo });
  } else {
    for (const p of PILOTO) for (const e of Object.keys(ESTILOS)) trabalhos.push({ ...p, estilo: e });
  }

  // --tipos confere a classificação de enquadramento antes de gastar gerações.
  if (process.argv.includes('--tipos')) {
    const porTipo = {};
    for (const t of trabalhos) (porTipo[t.tipo] = porTipo[t.tipo] || []).push(t.id);
    for (const [tipo, ids] of Object.entries(porTipo).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n${tipo.toUpperCase()} (${ids.length})`);
      for (const id of ids) console.log(`   ${id}  ${porId[id]['Nome da receita'].slice(0, 52)}`);
    }
    return;
  }

  if (dry) {
    console.log(`SIMULAÇÃO — ${trabalhos.length} imagem(ns) seriam geradas.\n`);
    for (const t of trabalhos.slice(0, 4)) {
      const r = porId[t.id];
      console.log(`--- ${t.id} (${t.tipo}) estilo ${t.estilo} — ${r['Nome da receita']}`);
      console.log(montarPrompt(r, t.tipo, t.estilo) + '\n');
    }
    return;
  }

  fs.mkdirSync(SAIDA, { recursive: true });
  console.log(`gerando ${trabalhos.length} imagem(ns) em ${SAIDA}\n`);

  const client = new OpenAI({ timeout: 180000 });
  const indice = [];
  let feitos = 0;

  await emLotes(trabalhos, 3, async (t) => {
    const receita = porId[t.id];
    if (!receita) {
      console.warn(`  ! ${t.id} não encontrada na planilha`);
      return;
    }
    const prompt = montarPrompt(receita, t.tipo, t.estilo);
    const arquivo = path.join(SAIDA, `${t.id}-${t.estilo}-${ESTILOS[t.estilo].nome}.jpg`);
    // Retomável: imagem que já existe não é gerada de novo. Num lote de 153 com
    // limite de 5/min, rodar de novo depois de uma queda não pode custar tudo
    // outra vez.
    if (fs.existsSync(arquivo)) {
      const kb = Math.round(fs.statSync(arquivo).size / 1024);
      indice.push({ id: t.id, nome: receita['Nome da receita'], tipo: t.tipo, estilo: t.estilo, arquivo: path.basename(arquivo), kb, prompt });
      console.log(`  --  ${String(++feitos).padStart(2)}/${trabalhos.length}  ${t.id} estilo ${t.estilo}  (já existia)`);
      return;
    }
    try {
      const buf = await gerarComRetry(client, prompt);
      fs.writeFileSync(arquivo, buf);
      indice.push({ id: t.id, nome: receita['Nome da receita'], tipo: t.tipo, estilo: t.estilo, arquivo: path.basename(arquivo), kb: Math.round(buf.length / 1024), prompt });
      console.log(`  ok  ${String(++feitos).padStart(2)}/${trabalhos.length}  ${t.id} estilo ${t.estilo}  (${Math.round(buf.length / 1024)} KB)`);
    } catch (e) {
      console.error(`  ERRO ${t.id} estilo ${t.estilo}: ${e.message}`);
    }
  });

  fs.writeFileSync(path.join(SAIDA, 'indice.json'), JSON.stringify(indice, null, 2));
  console.log(`\nconcluído: ${indice.length} imagem(ns). Índice em saida/indice.json`);
}

main().catch((e) => {
  console.error('falhou:', e.message);
  process.exit(1);
});
