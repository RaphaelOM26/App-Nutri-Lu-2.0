// Dashboard do público comprador: o que as respostas do onboarding e da
// anamnese dizem sobre QUEM compra — pra Luciana e os sócios criarem
// conteúdo alinhado com as dores, desejos e a persona real.
//
// Regras de privacidade (decididas em 16/09/2026):
//   - Tudo agregado. Nenhuma linha "por pessoa", nenhum nome, nenhuma data.
//   - Bloco clínico só em CONTAGEM; qualquer corte com menos de 5 pessoas
//     vira "menos de 5" (n = null). Com menos de 5 anamneses, o bloco inteiro
//     não sai.
//   - Texto livre CLÍNICO (doenças, medicamentos, sintomas) nunca é exibido
//     e nunca entra em prompt de IA: é classificado aqui, por dicionário de
//     palavras, em categorias fechadas.
//   - Texto livre NÃO clínico (dor, desejo, urgência, o que não gosta, o que
//     é indispensável, limitações) aparece sem nome, embaralhado, e alimenta
//     a síntese por IA (1x/dia, guardada em painel_cache).

import { getPool } from '../db.js';
import { openai, MODEL } from './openai.js';
import { inicioDaSemana } from '../utils/datas.js';

const hojeISO = () => new Date().toISOString().slice(0, 10);
const MINIMO = 5;

// ─── Faixas ───────────────────────────────────────────────────────────────

const idadeDe = (nasc) => {
  if (!nasc || !/^\d{4}-\d{2}-\d{2}$/.test(nasc)) return null;
  const d = new Date(`${nasc}T00:00:00Z`), h = new Date();
  let a = h.getUTCFullYear() - d.getUTCFullYear();
  if (h.getUTCMonth() < d.getUTCMonth() || (h.getUTCMonth() === d.getUTCMonth() && h.getUTCDate() < d.getUTCDate())) a -= 1;
  return a >= 10 && a <= 100 ? a : null;
};
const faixa = (v, cortes) => {
  if (v == null || !Number.isFinite(v)) return null;
  for (const [id, max] of cortes) if (v < max) return id;
  return cortes[cortes.length - 1][0];
};
const FAIXA_IDADE = [['ate_24', 25], ['25_34', 35], ['35_44', 45], ['45_54', 55], ['55_mais', Infinity]];
const FAIXA_IMC = [['abaixo', 18.5], ['normal', 25], ['sobrepeso', 30], ['obesidade_1', 35], ['obesidade_2_mais', Infinity]];
const FAIXA_PERDER = [['ate_5', 5.01], ['5_10', 10.01], ['10_20', 20.01], ['20_mais', Infinity]];
const FAIXA_AGUA = [['menos_1', 1], ['1_2', 2.01], ['2_3', 3.01], ['3_mais', Infinity]];
const FAIXA_SONO = [['menos_6', 6], ['6_7', 7.01], ['7_8', 8.01], ['8_mais', Infinity]];

// ─── Classificação clínica por dicionário (nunca IA) ──────────────────────

// Exportados também pra triagem das dúvidas (services/triagem.js): a mesma
// lista decide o que é assunto de saúde e vai direto pra Nutri Luciana.
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const DOENCAS = [
  ['tireoide', ['tireoid', 'hashimoto', 'hipotireo', 'hipertireo']],
  ['diabetes_insulina', ['diabet', 'resistencia a insulina', 'resistencia insulinica', 'pre-diabet', 'pre diabet', 'glicemia']],
  ['pressao_alta', ['pressao alta', 'hipertens']],
  ['colesterol_triglicerideos', ['colesterol', 'triglicer', 'dislipid']],
  ['ansiedade_depressao', ['ansiedad', 'depress', 'panico', 'burnout', 'tdah']],
  ['gastrite_refluxo', ['gastrit', 'refluxo', 'azia', 'h. pylori', 'pylori', 'ulcera']],
  ['intestino', ['intestino irritavel', 'sii', 'colite', 'crohn', 'constipa', 'prisao de ventre']],
  ['sop_hormonal', ['sop', 'ovario policistico', 'ovarios policisticos', 'endometriose', 'menopausa', 'hormon']],
  ['celiaca_intolerancia', ['celiac', 'intoleran', 'sensibilidade ao gluten']],
  ['renal_hepatica', ['rim', 'renal', 'figado', 'hepat', 'esteatose', 'gordura no figado']],
  ['osteo_articular', ['osteop', 'artrose', 'artrite', 'fibromialgia', 'hernia']],
  ['enxaqueca', ['enxaqueca', 'cefaleia']],
  ['anemia', ['anemia', 'ferritina baixa', 'ferro baixo']],
];
export const MEDICAMENTOS = [
  ['hormonio_tireoide', ['levotirox', 'puran', 'euthyrox', 'synthroid']],
  ['antidepressivo_ansiolitico', ['sertralin', 'escitalopram', 'fluoxetin', 'venlafax', 'desvenlafax', 'clonazepam', 'rivotril', 'alprazolam', 'bupropion', 'antidepress', 'ansiolit', 'paroxetin', 'duloxetin']],
  ['anticoncepcional', ['anticoncep', 'pilula', 'diu', 'yasmin', 'ciclo 21', 'implanon']],
  ['pressao', ['losartan', 'enalapril', 'atenolol', 'anlodipin', 'hidroclorotiaz', 'captopril', 'pressao']],
  ['metformina_antidiabetico', ['metformin', 'glifage', 'insulina', 'gliclazid', 'empagliflozin', 'jardiance']],
  ['emagrecedor_glp1', ['ozempic', 'semaglut', 'wegovy', 'mounjaro', 'tirzepat', 'saxenda', 'liraglut', 'sibutramin', 'contrave']],
  ['estatina', ['sinvastat', 'rosuvastat', 'atorvastat', 'estatina']],
  ['omeprazol_gastrico', ['omeprazol', 'pantoprazol', 'esomeprazol']],
  ['vitaminas_suplementos', ['vitamina', 'omega', 'whey', 'creatina', 'ferro', 'polivitamin', 'suplemento', 'magnesio']],
];
export const SINTOMAS = [
  ['estufamento_gases', ['estufa', 'inchaç', 'inchac', 'gases', 'distens', 'barriga inchada']],
  ['azia_refluxo', ['azia', 'refluxo', 'queimac']],
  ['cansaco', ['cansa', 'fadiga', 'sem energia', 'sonolen']],
  ['dor_cabeca', ['dor de cabeca', 'enxaqueca', 'cefaleia']],
  ['sono_ruim', ['insonia', 'sono ruim', 'durmo mal', 'nao durmo']],
  ['queda_cabelo_unhas', ['cabelo', 'unha']],
  ['dor_articular', ['articula', 'joelho', 'coluna', 'dor nas costas', 'dores no corpo']],
  ['intestino_preso', ['intestino preso', 'constipa', 'prisao de ventre']],
  ['ansiedade_compulsao', ['ansiedad', 'compuls', 'descont']],
  ['tontura_pressao', ['tontura', 'pressao baixa']],
];
function classificar(texto, dicionario) {
  const t = norm(texto);
  if (!t || /^(nao|nenhum|nenhuma|nada|n\/a|-)\.?$/.test(t.trim())) return t ? ['nenhuma'] : [];
  const achou = dicionario.filter(([, chaves]) => chaves.some((k) => t.includes(k))).map(([id]) => id);
  return achou.length ? achou : ['outra'];
}

// ─── Contagem com corte mínimo ────────────────────────────────────────────

function contar(valores, { minimo = 0 } = {}) {
  const m = new Map();
  for (const v of valores) if (v != null && v !== '') m.set(String(v), (m.get(String(v)) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => (minimo && n < minimo ? { id, n: null, poucos: true } : { id, n }));
}

// ─── Síntese por IA (só texto NÃO clínico) ────────────────────────────────

const CAMPOS_ABERTOS = ['dor', 'desejo', 'urgencia', 'nao_gosta', 'indispensavel', 'limitacoes', 'doces_quando'];
const SINTESE_VALIDADE_H = 24;

async function lerCache(chave) {
  const { rows } = await getPool().query(`SELECT data, gerado_em FROM painel_cache WHERE chave = $1`, [chave]);
  return rows[0] ? { ...rows[0].data, gerado_em: rows[0].gerado_em } : null;
}
async function gravarCache(chave, data) {
  await getPool().query(
    `INSERT INTO painel_cache (chave, data, gerado_em) VALUES ($1, $2, NOW()) ON CONFLICT (chave) DO UPDATE SET data = EXCLUDED.data, gerado_em = NOW()`,
    [chave, JSON.stringify(data)],
  );
}

// Embaralha de um jeito estável no dia (a ordem não pode denunciar a ordem
// de cadastro), sem depender de aleatoriedade a cada pedido.
function embaralhar(lista, semente) {
  let s = 0; for (const ch of semente) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const SINTESE_PROMPT = `Você analisa respostas de onboarding de clientes de uma nutricionista brasileira (Lu, "Nutri Lu"). Recebe listas de respostas ANÔNIMAS a perguntas abertas: "dor" (o que incomoda hoje), "desejo" (como gostaria de estar), "urgencia" (desconforto aceito como normal), "nao_gosta" (comidas), "indispensavel" (comidas que não abre mão), "limitacoes" (rotina/custo), "doces_quando" (quando bate vontade de doce).

Sua tarefa: descrever a PERSONA do público comprador pra orientar conteúdo (posts, vídeos, e-mails). Seja concreta, use a linguagem das próprias respostas. Não invente números exatos: use "muitas", "boa parte", "algumas". Nada de conselho clínico.

Responda SÓ com JSON neste formato:
{
  "persona": "parágrafo de 4 a 6 frases descrevendo a pessoa típica (rotina, sentimento, tentativas anteriores, o que quer)",
  "dores": [{ "tema": "nome curto", "frequencia": "muitas|boa parte|algumas", "como_falam": "frase curta no tom delas", "exemplo": "uma resposta real, encurtada" }],
  "desejos": [{ "tema": "...", "frequencia": "...", "como_falam": "...", "exemplo": "..." }],
  "normalizados": [{ "tema": "desconforto que aceitam como normal", "frequencia": "...", "exemplo": "..." }],
  "barreiras": [{ "tema": "limitação de rotina/custo/comida", "frequencia": "...", "exemplo": "..." }],
  "comida": { "rejeitam": ["..."], "nao_abrem_mao": ["..."] },
  "ganchos": ["5 a 8 ideias de conteúdo com título pronto, cada uma ligada a uma dor ou desejo acima"],
  "palavras_delas": ["8 a 12 expressões literais recorrentes, úteis pra copy"]
}
Cada lista de temas com 3 a 6 itens, do mais pro menos frequente.`;

export async function gerarSintese({ forcar = false } = {}) {
  const atual = await lerCache('sintese');
  if (!forcar && atual && Date.now() - new Date(atual.gerado_em).getTime() < SINTESE_VALIDADE_H * 3600e3) return atual;

  const { rows } = await getPool().query(
    `SELECT c.data FROM client_profiles c JOIN users u ON u.id = c.user_id WHERE u.role = 'cliente' AND c.data ? 'onboarding_em'`);
  const respostas = {};
  for (const k of CAMPOS_ABERTOS) respostas[k] = rows.map((r) => String(r.data?.[k] || '').trim()).filter((s) => s.length >= 3).map((s) => s.slice(0, 300));
  const n = rows.length;
  if (n < 3 || respostas.dor.length < 3) {
    const vazio = { vazio: true, n, motivo: 'Ainda há poucas respostas pra sintetizar (mínimo 3 clientes com o onboarding feito).' };
    await gravarCache('sintese', vazio);
    return { ...vazio, gerado_em: new Date().toISOString() };
  }
  const entrada = Object.entries(respostas).map(([k, lista]) => `## ${k} (${lista.length})\n${embaralhar(lista, k).slice(0, 120).map((s) => `- ${s}`).join('\n')}`).join('\n\n');
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: SINTESE_PROMPT }, { role: 'user', content: `Total de clientes: ${n}.\n\n${entrada}` }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_completion_tokens: 2500,
  });
  let json;
  try { json = JSON.parse(completion.choices?.[0]?.message?.content || '{}'); } catch { throw Object.assign(new Error('A IA respondeu fora do formato; tenta de novo.'), { status: 502, code: 'IA_FORMATO' }); }
  const sintese = { ...json, n, modelo: MODEL };
  await gravarCache('sintese', sintese);
  return { ...sintese, gerado_em: new Date().toISOString() };
}

// ─── O dashboard ──────────────────────────────────────────────────────────

// Dashboard inteiro em cache (premissa de 10 mil pacientes): agregar todos os
// perfis a cada abertura de tela não escala. Vale por DASHBOARD_VALIDADE_MIN;
// a tela mostra a hora e tem "Atualizar números" (forcar) pra quem precisar.
const DASHBOARD_VALIDADE_MIN = 60;

export async function montarDashboard({ forcar = false } = {}) {
  if (!forcar) {
    const c = await lerCache('dashboard');
    if (c && Date.now() - new Date(c.gerado_em).getTime() < DASHBOARD_VALIDADE_MIN * 60_000) {
      return { ...c, atualizado_em: c.gerado_em, do_cache: true, sintese: await lerCache('sintese') };
    }
  }
  const dados = await calcularDashboard();
  const { sintese, ...semSintese } = dados;
  await gravarCache('dashboard', semSintese);
  return { ...dados, atualizado_em: new Date().toISOString(), do_cache: false };
}

async function calcularDashboard() {
  const p = getPool();
  const hoje = hojeISO(); const ws = inicioDaSemana(hoje);
  const [clientes, compras, pesos, anam, ativas, comPlano, sintese] = await Promise.all([
    p.query(`SELECT u.id, u.created_at, c.data FROM users u LEFT JOIN client_profiles c ON c.user_id = u.id WHERE u.role = 'cliente'`),
    p.query(`SELECT COUNT(*)::int AS n FROM purchases WHERE status = 'ativa' AND (valido_ate IS NULL OR valido_ate > NOW())`),
    p.query(`SELECT DISTINCT ON (user_id) user_id, kg FROM weight_log ORDER BY user_id, date DESC`),
    p.query(`SELECT a.data FROM anamnese_clinica a JOIN users u ON u.id = a.user_id WHERE u.role = 'cliente'`),
    p.query(`SELECT COUNT(DISTINCT user_id)::int AS n FROM meal_entries WHERE date >= $1`, [ws]),
    p.query(`SELECT COUNT(DISTINCT user_id)::int AS n FROM meal_plans WHERE status = 'ativo' AND week_start >= $1`, [ws]),
    lerCache('sintese'),
  ]);
  const pesoDe = new Map(pesos.rows.map((r) => [r.user_id, Number(r.kg)]));
  const todos = clientes.rows;
  const perfis = todos.filter((r) => r.data?.onboarding_em).map((r) => ({ ...r.data, _peso: pesoDe.get(r.id) ?? null }));
  const n = perfis.length;

  const imc = (x) => (x.altura_cm > 0 && x._peso ? x._peso / Math.pow(x.altura_cm / 100, 2) : null);
  const distribuicoes = {
    sexo: contar(perfis.map((x) => x.sexo)),
    faixa_idade: contar(perfis.map((x) => faixa(idadeDe(x.nascimento), FAIXA_IDADE))),
    imc: contar(perfis.map((x) => faixa(imc(x), FAIXA_IMC))),
    objetivo: contar(perfis.map((x) => x.objetivo)),
    atividade: contar(perfis.map((x) => x.atividade)),
    quanto_perder: contar(perfis.filter((x) => x.objetivo === 'perder' && x._peso && x.meta_kg).map((x) => faixa(x._peso - Number(x.meta_kg), FAIXA_PERDER))),
    restricoes: contar(perfis.flatMap((x) => (Array.isArray(x.restricoes) ? x.restricoes : []))),
    mais_fome: contar(perfis.map((x) => x.mais_fome)),
    doces: contar(perfis.map((x) => x.doces)),
    agua: contar(perfis.map((x) => faixa(Number(x.agua_litros), FAIXA_AGUA))),
    sono: contar(perfis.map((x) => x.sono)),
    sono_horas: contar(perfis.map((x) => faixa(Number(x.sono_horas), FAIXA_SONO))),
    alergias: { com: perfis.filter((x) => String(x.alergias || '').trim().length > 1).length, sem: perfis.filter((x) => !(String(x.alergias || '').trim().length > 1)).length },
  };
  const medias = {
    idade: media(perfis.map((x) => idadeDe(x.nascimento))),
    peso: media(perfis.map((x) => x._peso)),
    altura_cm: media(perfis.map((x) => Number(x.altura_cm) || null)),
    imc: media(perfis.map(imc)),
    meta_perder_kg: media(perfis.filter((x) => x.objetivo === 'perder' && x._peso && x.meta_kg).map((x) => x._peso - Number(x.meta_kg))),
    agua_litros: media(perfis.map((x) => Number(x.agua_litros) || null)),
    sono_horas: media(perfis.map((x) => Number(x.sono_horas) || null)),
  };

  // Texto livre NÃO clínico, sem nome, embaralhado por dia.
  const abertas = {};
  for (const k of CAMPOS_ABERTOS) abertas[k] = embaralhar(perfis.map((x) => String(x[k] || '').trim()).filter((s) => s.length >= 3).map((s) => s.slice(0, 400)), k + hoje);
  abertas.dia_normal = embaralhar(perfis.map((x) => x.dia_normal).filter((d) => d && typeof d === 'object' && Object.values(d).some(Boolean)), 'dia' + hoje).slice(0, 60);

  // Bloco clínico: só contagens, corte mínimo, e só com 5+ anamneses.
  const respondidas = anam.rows.length;
  let clinico = null;
  if (respondidas >= MINIMO) {
    const a = anam.rows.map((r) => r.data || {});
    const sup = a.map((x) => x.suplementacao || {});
    const perguntas = ['forca', 'proteina', 'cansaco', 'cabelo', 'pouca_carne', 'pouco_sol', 'osteo', 'pouco_calcio', 'pouco_peixe', 'intestino_preso', 'poucos_vegetais', 'sono_ruim', 'articular'];
    const corte = (v) => (v < MINIMO ? null : v);
    clinico = {
      respondidas,
      medicamentos_usa: contar(a.map((x) => x.medicamentos_usa), { minimo: MINIMO }),
      caneta: contar(a.map((x) => x.caneta_usa), { minimo: MINIMO }),
      suplementos_usa: contar(sup.map((x) => x.usa), { minimo: MINIMO }),
      alcool: contar(a.map((x) => x.alcool), { minimo: MINIMO }),
      intestino: contar(a.map((x) => x.intestino), { minimo: MINIMO }),
      perda_controle: contar(a.map((x) => x.perda_controle), { minimo: MINIMO }),
      historico_familiar: { com: corte(a.filter((x) => String(x.historico_familiar || '').trim().length > 2 && !/^(nao|nenhum|nenhuma|nada)\b/i.test(norm(x.historico_familiar))).length) },
      suplementacao: perguntas.map((id) => ({ id, sim: corte(sup.filter((x) => x[id] === 'sim').length), respondeu: sup.filter((x) => x[id] === 'sim' || x[id] === 'nao').length })),
      doencas: contar(a.flatMap((x) => classificar(x.doencas, DOENCAS)), { minimo: MINIMO }),
      medicamentos: contar(a.filter((x) => x.medicamentos_usa === 'sim').flatMap((x) => classificar(x.medicamentos, MEDICAMENTOS)), { minimo: MINIMO }),
      sintomas: contar(a.flatMap((x) => classificar(x.sintomas, SINTOMAS)), { minimo: MINIMO }),
      historico_familiar_temas: contar(a.flatMap((x) => classificar(x.historico_familiar, DOENCAS)).filter((c) => c !== 'nenhuma'), { minimo: MINIMO }),
    };
  }

  return {
    gerado_em: new Date().toISOString(),
    minimo: MINIMO,
    funil: {
      compraram: compras.rows[0].n,
      entraram: todos.length,
      onboarding: n,
      com_plano: comPlano.rows[0].n,
      ativas_semana: ativas.rows[0].n,
      anamnese: respondidas,
    },
    n,
    medias,
    distribuicoes,
    abertas,
    clinico,
    clinico_motivo: clinico ? null : `O bloco de saúde só aparece com ${MINIMO} ou mais anamneses respondidas (hoje: ${respondidas}).`,
    sintese,
  };
}

function media(vals) {
  const v = vals.filter((x) => x != null && Number.isFinite(x));
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
}
