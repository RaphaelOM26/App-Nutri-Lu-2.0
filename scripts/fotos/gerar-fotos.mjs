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

// Qual livro fotografar. Sem flags, o livro oficial (NL). O livro das receitas
// práticas (PR) passa planilha, aba e saída próprias — as fotos não podem se
// misturar na mesma pasta, senão o redimensionador não sabe qual é de quem:
//   node --env-file=backend/.env scripts/fotos/gerar-fotos.mjs --estilo=B \
//     --planilha="Conteúdo/Receitas simples Nutri Lu - completa.xlsx" --aba="Receitas PR" --saida=scripts/fotos/saida-pr
const arg = (nome, padrao) => {
  const a = process.argv.find((x) => x.startsWith(`--${nome}=`));
  return a ? a.slice(nome.length + 3) : padrao;
};
const PLANILHA = path.resolve(RAIZ, arg('planilha', path.join('Conteúdo', 'Receitas nutri Lu.xlsx')));
const ABA = arg('aba', 'Receitas_App');
const SAIDA = path.resolve(RAIZ, arg('saida', path.join('scripts', 'fotos', 'saida')));

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
  // D — "dia a dia" (set/26). O estilo B ficou com cara de IA no lote das
  // receitas práticas: mesa de madeira rústica impecável, luz de janela e o
  // MESMO pano de prato dobrado em toda foto. O que tira a cara de catálogo
  // não é pedir "foto torta" (o C tentou e o modelo ignorou) — é trocar o
  // MATERIAL da cena: toalha de plástico, louça comum gasta, luz de lâmpada,
  // bagunça de casa cortada pela borda. Por isso D também sobrescreve o bloco
  // de realismo, que é onde moravam a louça branca e a luz bonita.
  D: {
    nome: 'dia-a-dia',
    cena:
      'on a kitchen table covered with a slightly worn patterned plastic tablecloth in a simple Brazilian home, ' +
      'ordinary household things partly cropped by the edge of the frame such as a glass of water, ' +
      'a paper napkin and a plastic bottle, the everyday kitchen out of focus behind',
    realismo:
      'A quick photo taken with an older mobile phone just before eating, not a food photograph. ' +
      'Indoor light from a ceiling bulb mixed with whatever comes from the window, a little uneven and slightly harsh, ' +
      'imperfect white balance, mild digital noise, flat ordinary colors, straight out of the camera with no editing. ' +
      'Everyday worn Brazilian dishware: a plain plate with a simple printed rim or a slightly scratched melamine plate, ' +
      'ordinary mismatched cutlery. ' +
      'The food was served to be eaten, not arranged: portions uneven, pieces overlapping and touching, ' +
      'a small smear of sauce on the rim, a few crumbs on the tablecloth. ' +
      'Nothing is centered, styled or wiped clean. Realistic photograph.',
    negativo:
      'Do not include: text, captions, watermarks, logos, brand names, hands, people, ' +
      'studio seamless backdrop, heavy background blur or bokeh, glossy advertising look, ' +
      'restaurant fine-dining plating, decorative garnish that is not part of the recipe, ' +
      'food styling, arranged props, folded cloth napkin or dish towel, rustic wooden board, ' +
      'raw ingredients scattered around the dish, warm golden cinematic light.',
  },
  // E — meio termo (set/26). O B ficou com cara de catálogo e o D pesou a mão:
  // toalha de plástico estampada, luz de lâmpada amarela e granulado deixaram
  // a foto escura e datada. E fica no meio: mantém do D a louça comum e a
  // comida servida sem arrumar; devolve do B a luz de dia neutra e a mesa
  // limpa. Sai a toalha estampada, sai a bagunça, sai o ruído.
  E: {
    nome: 'casa-simples',
    cena:
      'on a plain kitchen table in an ordinary home, a glass of water partly cropped at the edge of the frame, ' +
      'the rest of the table empty, a simple kitchen wall softly out of focus behind',
    realismo:
      'A photo taken with a recent mobile phone right before eating, clean and in focus, but not a professional food photo. ' +
      'Even indoor daylight from a window, neutral white balance, ordinary brightness, ' +
      'no golden light, no dramatic shadows, no filter and no editing. ' +
      'Everyday home dishware: a simple plain plate or bowl, ordinary stainless cutlery, ' +
      'nothing artisanal or designer, nothing scratched or worn out. ' +
      'The food was just served and not arranged: portions uneven, pieces touching and overlapping, ' +
      'no pattern or symmetry, but the rim of the plate is clean. Realistic photograph.',
    negativo:
      'Do not include: text, captions, watermarks, logos, brand names, hands, people, ' +
      'studio seamless backdrop, heavy background blur or bokeh, glossy advertising look, ' +
      'restaurant fine-dining plating, decorative garnish that is not part of the recipe, ' +
      'food styling, arranged props, folded cloth napkin or dish towel, rustic weathered wooden board, ' +
      'raw ingredients scattered around the dish, warm golden cinematic light, ' +
      'patterned plastic tablecloth, dark or yellow tungsten lighting, visible grain or noise.',
  },
  // F — meio termo, 2ª tentativa. O E errou pro outro lado: tirar a bagunça e
  // pedir "mesa lisa + parede ao fundo" produziu FUNDO VAZIO, que é o fundo de
  // estúdio — justamente a cara de banco de imagens que queríamos matar. O que
  // dava realidade no D era o CONTEXTO (cozinha atrás, copo e guardanapo na
  // borda); o que pesava era a toalha estampada, a luz de lâmpada amarela e o
  // granulado. F fica com o contexto e tira os três. O negativo agora proíbe
  // fundo vazio de propósito.
  F: {
    nome: 'casa-real',
    cena:
      'on an ordinary kitchen table in a simple Brazilian home, a glass of water and a paper napkin ' +
      'partly cropped at the edge of the frame, the everyday kitchen visible out of focus behind ' +
      'with its normal household things around',
    realismo:
      'A photo taken with a mobile phone right before eating, not a food photograph. ' +
      'Ordinary daylight from the kitchen window, even and a little flat, neutral white balance, ' +
      'normal brightness, clean and in focus, no filter and no editing. ' +
      'Everyday home dishware: a simple plate or bowl with a thin plain rim, ordinary stainless cutlery, ' +
      'nothing artisanal or designer. ' +
      'The food was served to be eaten and not arranged: portions uneven, pieces touching and overlapping, ' +
      'no symmetry and no pattern. Realistic photograph.',
    negativo:
      'Do not include: text, captions, watermarks, logos, brand names, hands, people, ' +
      'studio seamless backdrop, empty plain background, bare wall behind the dish, ' +
      'heavy background blur or bokeh, glossy advertising look, ' +
      'restaurant fine-dining plating, decorative garnish that is not part of the recipe, ' +
      'food styling, arranged props, folded cloth napkin or dish towel, rustic weathered wooden board, ' +
      'raw ingredients scattered around the dish, warm golden cinematic light, ' +
      'patterned plastic tablecloth, yellow tungsten lighting, visible grain or noise.',
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
  // Bebida GELADA não pode herdar o enquadramento do chá: "faint steam" num
  // refresco de melancia é contradição, e sem enquadramento nenhum o modelo
  // devolve um prato de comida com o copo de canto (medido no lote de ago/26).
  bebidaFria: 'in a tall clear glass with ice, cold, condensation on the glass, no steam, nothing else on the plate',
  vitamina: 'in a tall clear glass, thick and creamy, no ice, no steam, nothing else on the plate',
  petisco: 'piled informally on a small plate',
  sobremesa: 'a single portion in a small glass dessert cup',
  mingau: 'in a cereal bowl with a spoon resting inside',
  sopa: 'in a deep soup bowl with a spoon resting inside, faint steam',
  bolo: 'one slice on a small plate, the rest of the cake out of frame',
  // Livro das receitas práticas (PR, set/26): dois enquadramentos que o livro
  // NL não precisava. Sem eles, 24 iogurtes e ~60 pães/sanduíches virariam
  // "prato de jantar em louça branca vista de frente" — o mesmo erro que
  // fotografou refresco como almoço no lote de agosto.
  tigela: 'in an everyday bowl seen from slightly above, a spoon resting inside, nothing else on the table',
  sanduiche: 'on a small plate, seen from a natural eye-level angle, the filling visible at the cut or open edge',
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
  // Famílias de bebida fria que entraram no lote de 407 (ago/26). Sem elas os
  // 27 refrescos/vitaminas caíam em 'prato' e viravam foto de almoço.
  if (/^(vitamina|smoothie|shake)\s/i.test(nome)) return 'vitamina';
  if (/^(refresco|suco|limonada|água saborizada|agua saborizada)\s/i.test(nome)) return 'bebidaFria';
  if (/^molho\b/i.test(nome)) return 'molho';
  if (/^salada\b/i.test(nome)) return 'salada';
  // "Creme de Cenoura" no almoço é sopa; "Creme de Mamão" no lanche é sobremesa.
  if (/^(sopa|creme)\b/i.test(nome)) return almocoOuJantar ? 'sopa' : 'sobremesa';
  if (/^(mingau|overnight|baked oats)\b/i.test(nome)) return 'mingau';
  if (/^(pudim|flan|sorvete|mousse)\b/i.test(nome)) return 'sobremesa';
  if (/^bolo\b/i.test(nome)) return 'bolo';
  // Tigela: iogurte, coalhada e "bowl de…" são comidos de tigela, com colher.
  // Vêm DEPOIS de creme/mousse de propósito — "Creme de iogurte com cacau" é
  // sobremesa em taça, não café da manhã em tigela.
  if (/^(iogurte|coalhada|bowl|tigela|a[çc]a[íi])\b/i.test(nome)) return 'tigela';
  // Pão, sanduíche, torrada, wrap, tapioca e crepioca se comem na mão, num
  // pratinho — não num prato raso de jantar.
  if (/^(p[ãa]o|sandu[íi]che|mini sandu[íi]che|misto|torrada|torradas|wrap|bruschetta|tapioca|crepioca|cr[êe]pe|panqueca|beiju)\b/i.test(nome)) return 'sanduiche';
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
  const ws = wb.Sheets[ABA];
  if (!ws) throw new Error(`aba "${ABA}" não existe em ${path.basename(PLANILHA)} (abas: ${wb.SheetNames.join(', ')})`);
  return XLSX.utils.sheet_to_json(ws, { defval: null });
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

  // O estilo pode sobrescrever realismo e negativo (ver estilo D): em alguns
  // casos o que precisa mudar não é a cena, é a louça e a luz.
  const e = ESTILOS[estilo];
  return (
    `A home-cooked Brazilian dish called "${nome}", ${enquadra}.` +
    descricaoUtil +
    dica +
    ` Scene: ${e.cena}. ` +
    (e.realismo ?? REALISMO) +
    ' ' +
    (e.negativo ?? NEGATIVO)
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

  // --ids=PR-001,PR-002 gera SÓ essas, no estilo pedido. É como se roda um
  // piloto num livro novo: confere o enquadramento em algumas imagens reais
  // antes de soltar o lote inteiro (geração é paga e não tem desfazer).
  const idsPedidos = (arg('ids', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

  const trabalhos = [];
  if (idsPedidos.length) {
    if (!ESTILOS[argEstilo]) throw new Error('--ids exige --estilo=A|B|C');
    for (const id of idsPedidos) {
      const l = porId[id];
      if (!l) { console.warn(`  ! ${id} não existe na planilha`); continue; }
      trabalhos.push({ id, tipo: inferirTipo(l), estilo: argEstilo });
    }
  } else if (argEstilo) {
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
  console.log(`\nconcluído: ${indice.length} imagem(ns). Índice em ${path.relative(RAIZ, path.join(SAIDA, 'indice.json'))}`);
}

main().catch((e) => {
  console.error('falhou:', e.message);
  process.exit(1);
});
