// LISTA VERDE: quem pode ter o plano aprovado em lote, e o que o plano gerado
// precisa cumprir. Tudo por regra em código (services/lote/regras.js), nunca
// por IA. A anamnese clínica é lida AQUI, só pra decidir "lote ou revisão", e
// o que sai pra tela são motivos curtos e fechados ("caneta emagrecedora"),
// nunca o texto que a paciente escreveu.
//
// Regra de segurança: qualquer critério que não dê pra avaliar (campo
// faltando, valor que ninguém previu) TIRA do lote. O caminho seguro é a
// revisão individual.

import { getPool } from '../../db.js';
import { motivoClinico } from '../triagem.js';
import { normalizar } from '../plano/receitas.js';
import { estimar, metaDoMeio, gastoEstimado } from '../plano/metas.js';
import { PRATICA_POR_CODIGO } from '../plano/receitas.js';
import { permitida, termosExcluidos } from '../plano/gerador.js';
import { REGRAS, VERSAO, perfilChave } from './regras.js';

const idadeDe = (nasc) => {
  if (!nasc) return null;
  const d = new Date(`${String(nasc).slice(0, 10)}T00:00:00Z`); if (Number.isNaN(d.getTime())) return null;
  const hoje = new Date(); let a = hoje.getUTCFullYear() - d.getUTCFullYear();
  if (hoje.getUTCMonth() < d.getUTCMonth() || (hoje.getUTCMonth() === d.getUTCMonth() && hoje.getUTCDate() < d.getUTCDate())) a -= 1;
  return a;
};
const vazio = (s) => { const t = normalizar(s); return !t || ['nenhum', 'nenhuma', 'nao', 'não', 'nada', '-', 'nenhum.', 'nenhuma.'].includes(t); };

/** O que o gerador e as checagens precisam saber da paciente (nada clínico). */
export async function dadosDaPaciente(userId) {
  const pool = getPool();
  const [{ rows: [u] }, { rows: [c] }, { rows: [peso] }] = await Promise.all([
    pool.query(`SELECT id, display_name, email FROM users WHERE id = $1 AND role = 'cliente'`, [userId]),
    pool.query(`SELECT data FROM client_profiles WHERE user_id = $1`, [userId]),
    pool.query(`SELECT kg FROM weight_log WHERE user_id = $1 ORDER BY date DESC LIMIT 1`, [userId]),
  ]);
  if (!u) return null;
  const p = c?.data || {};
  return {
    userId: u.id, nome: u.display_name, email: u.email, perfil: p,
    pesoKg: peso ? Number(peso.kg) : null, alturaCm: Number(p.altura_cm) || null, idade: idadeDe(p.nascimento),
    sexo: p.sexo || null, objetivo: p.objetivo || null, atividade: p.atividade || null, metaKg: p.meta_kg != null ? Number(p.meta_kg) : null,
    restricoes: Array.isArray(p.restricoes) ? p.restricoes : [], alergias: typeof p.alergias === 'string' ? p.alergias : '',
    naoGosta: typeof p.nao_gosta === 'string' ? p.nao_gosta : '', indispensavel: typeof p.indispensavel === 'string' ? p.indispensavel : '',
    variedade: ['simples', 'media', 'variada'].includes(p.variedade) ? p.variedade : 'media',
    onboardingFeito: Boolean(p.onboarding_em),
  };
}

/**
 * Parte 1 do documento: a paciente cumpre a lista verde?
 * @returns {Promise<{elegivel:boolean, motivos:string[], perfil_chave:string, dados:object|null}>}
 */
export async function avaliarPaciente(userId) {
  const d = await dadosDaPaciente(userId);
  if (!d) return { elegivel: false, motivos: ['não é paciente'], perfil_chave: '?', dados: null };
  const motivos = [];
  const R = REGRAS;
  const p = d.perfil;

  if (!d.onboardingFeito) motivos.push('cadastro incompleto');
  if (d.idade == null) motivos.push('sem data de nascimento');
  else if (d.idade < R.idade.min || d.idade > R.idade.max) motivos.push(`idade ${d.idade} anos`);
  if (!R.gestanteAceito.includes(p.gestante)) motivos.push(p.gestante ? (p.gestante === 'amamentando' ? 'amamentando' : 'gestante') : 'sem resposta sobre gestação');
  if (!(d.pesoKg > 0) || !(d.alturaCm > 0)) motivos.push('sem peso ou altura');
  else {
    const imc = d.pesoKg / (d.alturaCm / 100) ** 2;
    if (imc < R.imc.min) motivos.push(`IMC ${imc.toFixed(1)} (baixo peso)`);
    else if (imc > R.imc.max) motivos.push(`IMC ${imc.toFixed(1)} (obesidade)`);
    if (d.pesoKg > R.pesoMaxKg) motivos.push(`peso acima de ${R.pesoMaxKg} kg`);
  }
  if (!['perder', 'manter', 'ganhar'].includes(d.objetivo)) motivos.push('sem objetivo');
  if (!d.atividade) motivos.push('sem nível de atividade');
  if (!['feminino', 'masculino', 'outro'].includes(d.sexo)) motivos.push('sem sexo informado');
  if (d.metaKg != null && d.pesoKg > 0) {
    if (d.objetivo === 'perder' && d.metaKg >= d.pesoKg) motivos.push('quer perder peso com meta acima do atual');
    if (d.objetivo === 'ganhar' && d.metaKg <= d.pesoKg) motivos.push('quer ganhar peso com meta abaixo do atual');
  }
  if (!vazio(d.alergias)) motivos.push('alergia alimentar');
  for (const r of d.restricoes) if (!R.restricoesAceitas.includes(r)) { motivos.push('restrição fora da lista'); break; }
  // Textos livres do cadastro: dicionário de saúde, nunca IA.
  const livres = [p.dor, p.desejo, p.urgencia, p.limitacoes, p.indispensavel, p.nao_gosta, ...(p.dia_normal ? Object.values(p.dia_normal) : [])].filter((x) => typeof x === 'string' && x.trim());
  if (livres.some((t) => motivoClinico(t))) motivos.push('texto do cadastro fala de saúde');

  // Anamnese clínica: lida só aqui, só pra decidir; sai como motivo fechado.
  const { rows: [an] } = await getPool().query(`SELECT data FROM anamnese_clinica WHERE user_id = $1`, [userId]);
  if (!an) motivos.push('anamnese clínica não respondida');
  else {
    const a = an.data || {};
    if (!vazio(a.doencas)) motivos.push('doença informada');
    if (a.medicamentos_usa === 'sim' || !vazio(a.medicamentos)) motivos.push('usa medicamento');
    if (a.caneta_usa === 'sim') motivos.push('caneta emagrecedora');
    if (!vazio(a.sintomas)) motivos.push('sintoma informado');
    if (!vazio(a.alergias)) motivos.push('alergia informada na anamnese');
    if (!vazio(a.exames)) motivos.push('exames informados');
    if (!R.intestinoAceito.includes(a.intestino)) motivos.push(a.intestino ? 'intestino fora do padrão' : 'sem resposta sobre intestino');
    if (!R.perdaControleAceita.includes(a.perda_controle)) motivos.push(a.perda_controle ? 'perda de controle ao comer' : 'sem resposta sobre controle');
    if (!R.alcoolAceito.includes(a.alcool)) motivos.push(a.alcool ? 'álcool frequente' : 'sem resposta sobre álcool');
    const s = a.suplementacao || {};
    const usaSup = s.usa === 'sim' || a.suplementos_usa === 'sim';
    if (usaSup) {
      const quais = normalizar(s.quais || a.suplementos || '');
      const fora = quais.split(/[,;\n/+]| e /).map((x) => x.trim()).filter(Boolean).filter((x) => !R.suplementosAceitos.some((ok) => x.includes(ok)));
      if (!quais || fora.length) motivos.push('suplemento fora da lista');
    }
  }
  return { elegivel: motivos.length === 0, motivos: [...new Set(motivos)], perfil_chave: perfilChave(p), dados: d };
}

/** Metas do meio da faixa pra esta paciente (null se faltar dado). */
export function metasPara(d) {
  const faixa = estimar(d.pesoKg, d.objetivo, d.atividade, d.sexo);
  return faixa ? { faixa, targets: metaDoMeio(faixa) } : null;
}

/**
 * Parte 2 do documento: o plano gerado passa nas checagens?
 * `semanas` = [{ days: [{ weekday, meals: [{ code, items }] }] }]
 */
export function checarPlano(semanas, targets, d) {
  const R = REGRAS; const motivos = [];
  const piso = R.pisoKcal[d.sexo] ?? 1200;
  if (!(targets?.kcal >= piso)) motivos.push(`meta abaixo do piso de ${piso} kcal`);
  const gasto = gastoEstimado(d);
  if (gasto && targets?.kcal && (gasto - targets.kcal) / gasto > R.deficitMax) motivos.push(`déficit de ${Math.round(((gasto - targets.kcal) / gasto) * 100)}% do gasto estimado`);
  const termos = termosExcluidos(d.naoGosta, d.alergias);
  const pedidos = normalizar(d.indispensavel);
  let diasFora = 0, maiorDesvio = 0;
  for (const [i, s] of semanas.entries()) {
    const usos = new Map();
    for (const dia of s.days || []) {
      const soma = (dia.meals || []).flatMap((m) => m.items || []).reduce((a, it) => a + Number(it.kcal || 0), 0);
      const desvio = targets?.kcal ? Math.abs(soma - targets.kcal) / targets.kcal : 0;
      if (desvio > R.toleranciaMeta) { diasFora += 1; maiorDesvio = Math.max(maiorDesvio, desvio); }
      for (const m of dia.meals || []) {
        for (const it of m.items || []) {
          const code = it.code || m.code;
          if (!code) { motivos.push(`semana ${i + 1}, dia ${dia.weekday}: item fora do livro`); continue; }
          const r = PRATICA_POR_CODIGO.get(code);
          if (!r) { motivos.push(`semana ${i + 1}: receita ${code} não é do livro prático`); continue; }
          // Restrição e alergia conferidas DE NOVO aqui, com o perfil de agora.
          if (!permitida(r, d.restricoes, termos)) motivos.push(`semana ${i + 1}: ${r.name} fere restrição ou alergia`);
          usos.set(code, (usos.get(code) || 0) + 1);
        }
      }
    }
    // Repetição é regra quando ela escolheu "simples" ou "meio-termo" (jantar
    // = almoço, e dois dias iguais): um prato principal aparece até 4× na
    // semana de propósito. Só "variada" segue o limite apertado.
    const maxRep = d.variedade === 'variada' ? R.repeticaoMaxSemana : Math.max(R.repeticaoMaxSemana, 4);
    for (const [code, n] of usos) if (n > maxRep) motivos.push(`semana ${i + 1}: ${PRATICA_POR_CODIGO.get(code)?.name || code} repete ${n}×`);
  }
  if (diasFora) motivos.push(`${diasFora} dia${diasFora > 1 ? 's' : ''} fora da meta de calorias (até ${Math.round(maiorDesvio * 100)}% de diferença)`);
  if (pedidos && pedidos.length >= 3 && !semanas.some((s) => (s.days || []).some((dia) => (dia.meals || []).some((m) => m.items?.some((it) => { const r = PRATICA_POR_CODIGO.get(it.code || m.code); return r && pedidos.split(/[,; e]+/).filter((x) => x.length >= 3).some((t) => normalizar(r.name + ' ' + r.ingredients.map((i) => i.name).join(' ')).includes(t)); }))))) {
    motivos.push('o "não abro mão" não entrou no plano');
  }
  return [...new Set(motivos)].slice(0, 12);
}

export { VERSAO };
