// Parser que transforma os dumps de páginas em receitas estruturadas.
// Detecta o padrão "Receita de | TÍTULO | Ingredientes: | ... | Modo de preparo: | ..."
// Anonimiza tudo que faz referência à autora original (Ana, Menezes, @anamenezesfit).
//
// Output: scripts/extract-pdf/dumps/recipes-structured.json com lista única de receitas
// já anonimizadas, prontas pra ser inseridas como seed do app.

import { readFile, writeFile, readdir } from 'node:fs/promises';

const DUMPS_DIR = 'C:/Users/Usuário/Desktop/Raphael/Claude/Testes/App Nutri Lu 2.0/scripts/extract-pdf/dumps';
const OUT_PATH = `${DUMPS_DIR}/recipes-structured.json`;

// Mapeia arquivo → coleção do app
const SOURCE_TO_COLLECTION = {
  'saladas-molhos.json': 'lu-saladas',
  'vitaminas-sorvetes.json': 'lu-vitaminas',
  'bolos-brownies.json': 'lu-bolos',
  'petiscos-sauda-veis.json': 'lu-petiscos',
  'sobremesas-sauda-veis.json': 'lu-sobremesas',
  '150-receitas-saudaveis.json': 'lu-saudaveis',
  'detox-pdf-nutrrilu.json': 'lu-detox',
};

// ─── Anonimização ──────────────────────────────────────────────
// Remove referências à autora original. Conservador com false positives:
//   - "banana" NÃO bate (palavra continha "ana")
//   - "Ana" SÓ bate quando palavra isolada (\bana\b)
//   - "@anamenezesfit", "anamenezesfit", "Menezes" → fora
//   - Qualquer linha com "Marque @" → fora
function shouldDropLine(line) {
  const lower = line.toLowerCase();
  // === Anonimização Ana / Menezes (PDFs principais) ===
  if (lower.includes('@anamenezesfit')) return true;
  if (lower.includes('anamenezesfit')) return true;
  if (lower.includes('marque @')) return true;
  if (lower.includes('marque @anamenezesfit')) return true;
  if (lower.includes('após fazer as receitas')) return true;
  if (/\bguia\s+de\s+receitas\b/i.test(line)) return true;
  if (/^da\s+ana$/i.test(line.trim())) return true;
  if (/\bana\b/i.test(line)) return true;
  if (/\bmenezes\b/i.test(line)) return true;

  // === Anonimização Lu Schuller (PDF Detox) ===
  // Não bloqueia "Lu" sozinha (é nome da nossa mascote Nutri Lu) — só variações específicas
  if (lower.includes('luschuller')) return true;
  if (lower.includes('@nutricionista')) return true;
  if (lower.includes('siga nossa página')) return true;
  if (lower.includes('siga nossa pagina')) return true;
  if (/\bnutricionista\s+especialista\b/i.test(line)) return true;
  if (/\bebook\s+feito\s+por\b/i.test(line)) return true;

  // === Qualquer linha começando com @ (mention) — assume autoria/promoção ===
  if (/^@\w/.test(line.trim())) return true;

  return false;
}

// Remove menções pontuais dentro de uma string (sem deletar a linha toda)
function cleanString(s) {
  return s
    .replace(/\bMENEZES\b/gi, '')
    .replace(/\bMARQUE\s+@\S+\s*/gi, '')
    .replace(/@anamenezesfit/gi, '')
    .replace(/@nutricionistaluschuller/gi, '')
    .replace(/@\w*luschuller\w*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Helpers ───────────────────────────────────────────────────
const CALORIE_REGEX = /(\d{2,4})\s*(?:kcal|calorias?)/i;
const SERVES_REGEX = /\(para\s+(\d+)\s+pessoas?\)/i;

function extractKcal(line) {
  const m = line.match(CALORIE_REGEX);
  return m ? parseInt(m[1], 10) : null;
}

function extractServings(line) {
  const m = line.match(SERVES_REGEX);
  return m ? parseInt(m[1], 10) : null;
}

// Title case PT-BR simples: primeira letra maiúscula, resto minúsculo, mantém preposições
function toTitleCase(s) {
  const stopwords = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'com', 'sem', 'a', 'o', 'no', 'na', 'em', 'ao']);
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && stopwords.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

// ─── Parser de uma página de receita ───────────────────────────
function parseRecipePage(lines, sourceFile, pageNum) {
  // Filtro inicial: descarta linhas anonimizadas
  const clean = lines.filter((l) => !shouldDropLine(l)).map(cleanString).filter(Boolean);

  const ingIdx = clean.findIndex((l) => /^Ingredientes:?$/i.test(l));
  // Aceita variantes: "Modo de preparo:", "Modo de Preparo:", "Instruções:", "Preparo:",
  // "Como fazer:", "Instruções :" (com espaço antes do `:`). Tolerante a espaços.
  const stepMarkerRegex = /^\s*(modo\s+de\s+preparo|instruções|instrucoes|preparo|como\s+fazer|preparação|preparacao)\s*:?\s*$/i;
  let stepIdx = clean.findIndex((l) => stepMarkerRegex.test(l));

  if (ingIdx === -1) return null;
  // Se não houver marcador de modo de preparo, tenta detectar fim dos ingredientes
  // pela mudança de padrão (linha começa com letra maiúscula e termina sem `;`).
  // Pro PDF Detox: muitas receitas só listam ingredientes + benefícios. Usamos
  // fallback de passos genérico pra essas.
  let hasExplicitSteps = stepIdx >= 0 && stepIdx > ingIdx;

  // TÍTULO: tudo entre "Receita de" e "Ingredientes:" (geralmente 1-3 linhas caps).
  // Se não houver "Receita de" (formato Detox), pega as linhas antes de "Ingredientes:".
  const receitaIdx = clean.findIndex((l) => /^Receita\s+de$/i.test(l));
  const titleStart = receitaIdx >= 0 ? receitaIdx + 1 : 0;
  const titleEnd = ingIdx;
  let titleLines = clean.slice(titleStart, titleEnd);
  // Filtros adicionais pro título: descarta linhas que são apenas dígitos (page num),
  // ":" sozinho, palavras genéricas tipo "INGREDIENTES" (caps).
  titleLines = titleLines.filter((l) => {
    if (/^\d+$/.test(l.trim())) return false;
    if (/^[:.]+$/.test(l.trim())) return false;
    return true;
  });
  let titleRaw = titleLines.join(' ').trim();
  // Skip number prefix da página (ex: "03 Receita de XYZ" pode ter "03" no início)
  titleRaw = titleRaw.replace(/^\d+\s+/, '').trim();
  // Remove ":" final do título (formato Detox: "Suco Detox de Cenoura e Laranja:")
  titleRaw = titleRaw.replace(/[:.]\s*$/, '').trim();
  if (!titleRaw || titleRaw.length < 3) return null;
  const title = toTitleCase(titleRaw);

  // INGREDIENTES: lines entre Ingredientes: e Modo de preparo:
  // Se não houver "Modo de preparo:", para no marcador "Benefícios:" / similar
  // OU no fim da lista (último item antes de seção em maiúscula tipo "Abacaxi:")
  const ingEnd = hasExplicitSteps
    ? stepIdx
    : (() => {
        // Acha primeiro marker de seção pós-ingredientes (Benefícios, ou nome:Ingrediente seguido de ":" sozinho)
        for (let i = ingIdx + 1; i < clean.length; i++) {
          if (/^(benef[íi]cios?|dicas?|observa[çc][ãa]o|nota|sugest[ãa]o)\s*:?$/i.test(clean[i])) return i;
          // Padrão "Nome:" sozinho (ex: "Abacaxi:", "Hortelã:") — palavra capitalizada + ":"
          if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç\-]+(?:\s+[a-záéíóúâêôãõç\-]+)?:$/.test(clean[i])) return i;
        }
        return clean.length;
      })();
  const ingLines = [];
  for (let i = ingIdx + 1; i < ingEnd; i++) {
    const l = clean[i];
    if (/^Ingredientes(\s+do\s+\w+)?:?$/i.test(l)) continue; // skip "Ingredientes do molho:"
    ingLines.push(l);
  }
  // Merge linhas continuadas: se a linha N termina sem pontuação E a N+1 começa
  // com letra minúscula (sem quantidade no início), mergeia.
  // Detecção de "começa com novo ingrediente": número, "Sal/Pimenta/...", letra MAIÚSCULA
  // depois de palavra de quantidade ("colher", "xícara", "pitada"...), etc.
  const merged = [];
  const startsNewIngredient = (line) => {
    // Começa com número ou fração
    if (/^[0-9¼½¾⅓⅔]/.test(line)) return true;
    // Palavras-chave de início que indicam novo ingrediente
    if (/^(sal|pimenta|adoçante|açúcar|farinha|orégano|alho|cebola|tempero|temperos|raspas|suco|leite|óleo|azeite|água|gelo|gengibre|coentro|salsinha|cebolinha|hortelã|manjericão|alecrim|tomilho|canela|cravo|noz|essência|fermento|chocolate|cacau|mel|gotas|fatias?|colher|colheres|xícara|pitada|punhado|pedaço|porção|porções|quantidade|opcional|para)\b/i.test(line)) return true;
    // Começa com maiúscula (provavelmente nome próprio de ingrediente, ex: "Whey", "Açafrão")
    if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(line)) return true;
    return false;
  };
  for (const raw of ingLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    // Se linha começa com minúscula e não bate padrão de início → continua o anterior
    if (merged.length > 0 && !startsNewIngredient(trimmed)) {
      // Se a anterior NÃO terminou com pontuação, é continuação
      const prev = merged[merged.length - 1];
      const prevEndsCleanly = /[;.,]\s*$/.test(prev);
      if (!prevEndsCleanly) {
        merged[merged.length - 1] = `${prev} ${trimmed}`;
        continue;
      }
    }
    merged.push(trimmed);
  }
  const ingredients = merged
    .map((l) => l.replace(/[;.]\s*$/, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 2);

  // STEPS: junta todas as lines após o marker até achar linha de calorias
  // OU marcador de seção extra (Benefícios:, Dicas:, etc. usado em PDFs como o Detox).
  // Quebra por sentença (`.`) pra ter passos discretos.
  let kcal = null;
  let servings = null;
  let steps = [];

  if (hasExplicitSteps) {
    const stepLinesRaw = [];
    for (let i = stepIdx + 1; i < clean.length; i++) {
      const l = clean[i];
      if (/^(benef[íi]cios?|dicas?|observa[çc][ãa]o|nota|sugest[ãa]o)\s*:?$/i.test(l)) break;
      const k = extractKcal(l);
      if (k != null) {
        kcal = k;
        const s = extractServings(l);
        if (s) servings = s;
        continue;
      }
      stepLinesRaw.push(l);
    }
    const joinedSteps = stepLinesRaw.join(' ').replace(/\s+/g, ' ').trim();
    steps = joinedSteps
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter((s) => s.length > 5);
  }

  // Fallback: receitas sem modo de preparo explícito (caso PDF Detox)
  // Gera passos genéricos baseados no tipo (suco/smoothie/vitamina).
  const isLiquid = /\b(suco|smoothie|vitamina|shake|detox|bebida)\b/i.test(title);
  if (steps.length === 0 && isLiquid) {
    steps = [
      'Lave bem todos os ingredientes antes de preparar.',
      'Descasque e corte os ingredientes em pedaços menores se necessário.',
      'Coloque todos os ingredientes no liquidificador.',
      'Bata em alta velocidade até obter uma mistura homogênea.',
      'Coe se desejar e sirva imediatamente, de preferência gelado.',
    ];
  }

  if (ingredients.length === 0 || steps.length === 0) return null;

  return {
    sourceFile,
    pageNum,
    title,
    ingredients,
    steps,
    kcal,
    servings,
  };
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  const files = await readdir(DUMPS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json') && f !== 'recipes-structured.json');

  const all = [];
  for (const file of jsonFiles) {
    const collectionId = SOURCE_TO_COLLECTION[file];
    if (!collectionId) {
      console.warn(`⚠️ Sem mapping pra ${file}, pulando.`);
      continue;
    }
    const dump = JSON.parse(await readFile(`${DUMPS_DIR}/${file}`, 'utf-8'));
    console.log(`\n=== ${file} (${dump.totalPages} páginas) → ${collectionId} ===`);

    let extracted = 0;
    let skipped = 0;
    for (const page of dump.pages) {
      const recipe = parseRecipePage(page.lines, file, page.pageNum);
      if (recipe) {
        all.push({ ...recipe, collectionId });
        extracted++;
      } else {
        skipped++;
      }
    }
    console.log(`  Receitas: ${extracted} extraídas, ${skipped} páginas puladas (capa, sumário, etc.)`);
  }

  console.log(`\n=== TOTAL: ${all.length} receitas anonimizadas ===`);

  // Sanity check: nenhuma menção residual
  let warnings = 0;
  for (const r of all) {
    const blob = [r.title, ...r.ingredients, ...r.steps].join(' ').toLowerCase();
    if (/\bana\b/i.test(blob) || /\bmenezes\b/i.test(blob) || blob.includes('anamenezesfit')) {
      console.warn(`⚠️ Possível vazamento em "${r.title}" (${r.sourceFile} p${r.pageNum})`);
      warnings++;
    }
  }
  console.log(warnings > 0 ? `${warnings} warnings de anonimização — revisar!` : '✓ Nenhuma menção residual detectada.');

  await writeFile(OUT_PATH, JSON.stringify(all, null, 2), 'utf-8');
  console.log(`\nSaída: ${OUT_PATH}`);

  // Resumo por coleção
  console.log('\n--- Distribuição por coleção ---');
  const byCol = {};
  for (const r of all) byCol[r.collectionId] = (byCol[r.collectionId] || 0) + 1;
  for (const [k, v] of Object.entries(byCol).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v} receitas`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
