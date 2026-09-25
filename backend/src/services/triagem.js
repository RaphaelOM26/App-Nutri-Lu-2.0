// Triagem das dúvidas que as clientes mandam pra Nutri Luciana.
//
// Decidido com o Raphael em 17/09/2026: a Luna (IA) resolve a maior parte
// das dúvidas na hora; o que chega pra Luciana deve vir com um RASCUNHO pra
// ela só aprovar, e o que a IA não sabe fica destacado como "precisa de você".
//
// Duas regras que não mudam:
//  1. Assunto de SAÚDE (doença, remédio, sintoma, gestação, exame) vai
//     direto pra Luciana, sem rascunho e sem IA. Decidido por DICIONÁRIO no
//     código (o mesmo do dashboard), nunca por modelo. A anamnese clínica
//     nunca entra em prompt. SUPLEMENTO saiu dessa lista em 25/09/2026
//     (Raphael): é parte do plano prescrito, a Luna conhece a lista dela e
//     responde "já tomei?", "que horas?"; mudar/acrescentar suplemento é
//     prescrição e a Luna oferece mandar pra Luciana (manual da conversa).
//  2. Rascunho nunca sai sozinho: a Luciana clica em "Aprovar e enviar".
//
// Custo: uma chamada por dúvida não clínica (~US$ 0,003). Entra na planilha
// docs/custos-10mil-pacientes.xlsx.

import { getPool } from '../db.js';
import { openai, MODEL } from './openai.js';
import { DOENCAS, MEDICAMENTOS, SINTOMAS, norm } from './dashboard.js';
import { CAMPOS_PERFIL, planoDaData, planoResumido } from './diario.js';

// Termos de saúde que o dicionário do dashboard não cobre (ele classifica
// anamnese, não perguntas): gestação, exames, cirurgia, criança…
const SAUDE_EXTRA = ['gravid', 'gestant', 'gestac', 'amament', 'lactant', 'remedio', 'medicament', 'medico', 'medica ', 'exame', 'cirurgi', 'bariatric', 'doenca', 'diagnost', 'sintoma', 'alergi', 'crianca', 'meu filho', 'minha filha', 'bebe', 'idoso', 'jejum', 'laxante', 'diuretic', 'emagrecedor', 'injec'];

// Remédios de verdade: o dicionário do dashboard tem também a categoria
// "vitaminas_suplementos" (serve pra agregar a anamnese), mas suplemento não é
// motivo pra tirar a pergunta da Luna.
const REMEDIOS = MEDICAMENTOS.filter(([id]) => id !== 'vitaminas_suplementos');

/** Por que a pergunta é assunto de saúde (null = não é). Só dicionário. */
export function motivoClinico(texto) {
  const t = ` ${norm(texto)} `;
  const bate = (dic) => dic.some(([, chaves]) => chaves.some((k) => t.includes(k)));
  if (bate(DOENCAS)) return 'fala de doença ou condição de saúde';
  if (bate(REMEDIOS)) return 'fala de remédio';
  if (bate(SINTOMAS)) return 'fala de sintoma';
  if (SAUDE_EXTRA.some((k) => t.includes(k))) return 'assunto de saúde (gestação, exame, cirurgia, criança…)';
  return null;
}

const RASCUNHO_SCHEMA = {
  name: 'rascunho_duvida',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['pode_responder', 'rascunho', 'motivo'],
    properties: {
      pode_responder: { type: 'boolean', description: 'true se o rascunho responde a dúvida com segurança só com o que está no contexto.' },
      rascunho: { type: 'string', description: 'Resposta pronta, em primeira pessoa como a Luciana, 2 a 5 frases. Vazio se pode_responder for false.' },
      motivo: { type: 'string', description: 'Uma frase curta pra Luciana: por que dá (ou não dá) pra responder só com isso.' },
    },
  },
};

const RASCUNHO_PROMPT = `Você é a Luna, assistente de IA da nutricionista Luciana Alves (Nutri Lu). Uma paciente mandou uma pergunta pra Luciana. Escreva um RASCUNHO de resposta que a Luciana vai ler, ajustar e aprovar antes de enviar.

Como escrever:
- Em primeira pessoa, como se fosse a Luciana falando: calorosa, direta, prática. 2 a 5 frases. Sem emoji. Sem "como IA".
- Use o perfil, o objetivo, as metas, as restrições e o plano da semana que vêm no contexto. Não invente nada que não esteja lá.
- Você responde com segurança: uso da plataforma (registrar, trocar refeição, ver o plano, materiais), trocas simples de ingrediente ou refeição, dúvidas sobre o que está no plano, rotina e motivação.

Marque pode_responder = false (e deixe rascunho vazio) quando:
- a resposta depende de saúde, doença, remédio, suplemento, exame, gestação ou sintoma;
- ela pede pra mudar metas, calorias ou a prescrição (isso é decisão da Luciana);
- falta informação no contexto pra responder com segurança;
- é um assunto pessoal com a Luciana (consulta, cobrança, agenda, reclamação).
Nunca prometa nada em nome dela (prazo, consulta, desconto).`;

const so = (obj, campos) => Object.fromEntries(Object.entries(obj || {}).filter(([k, v]) => campos.has(k) && v != null && v !== ''));

/**
 * Gera (ou regenera) a triagem e o rascunho de uma pergunta e grava em
 * lu_messages. Chamada em segundo plano ao receber a pergunta e sob demanda
 * pelo painel. Nunca lança: erro vira triagem 'nutri' com o motivo.
 */
export async function gerarRascunho(perguntaId) {
  const pool = getPool();
  const { rows: [q] } = await pool.query(
    `SELECT q.id, q.user_id, q.text, u.display_name FROM lu_messages q JOIN users u ON u.id = q.user_id WHERE q.id = $1 AND q.kind = 'pergunta'`, [perguntaId]);
  if (!q) return null;
  const gravar = async (triagem, rascunho, motivo) => {
    const { rows: [r] } = await pool.query(
      `UPDATE lu_messages SET triagem = $2, rascunho = $3, rascunho_motivo = $4, rascunho_em = NOW() WHERE id = $1 RETURNING id, triagem, rascunho, rascunho_motivo, rascunho_em`,
      [perguntaId, triagem, rascunho || null, motivo || null]);
    return r;
  };

  const clinico = motivoClinico(q.text);
  if (clinico) return gravar('nutri', null, `Assunto de saúde (${clinico}). Por regra, só você responde; a Luna não escreve rascunho.`);
  if (!process.env.OPENAI_API_KEY) return gravar('nutri', null, 'IA não configurada neste servidor.');

  try {
    const { rows: [perf] } = await pool.query(`SELECT data FROM client_profiles WHERE user_id = $1`, [q.user_id]);
    // Só campos NÃO clínicos do perfil (CAMPOS_PERFIL não tem a anamnese).
    const perfil = so(perf?.data, new Set([...CAMPOS_PERFIL].filter((k) => !['whatsapp', 'lembretes', 'foto_key'].includes(k))));
    const hoje = new Date().toISOString().slice(0, 10);
    const plano = planoResumido(await planoDaData(q.user_id, hoje));
    const planoCurto = plano ? {
      semana: `${plano.week_index || 1} de ${plano.week_total || 1}`, metas: plano.targets, nota: plano.note,
      refeicoes_de_hoje: (plano.dias.find((d) => d.date === hoje)?.meals || []).map((m) => `${m.slot}: ${m.name}${m.subs ? ` (substituições: ${m.subs})` : ''}`),
    } : 'sem plano publicado nesta semana';
    const contexto = `Paciente: ${q.display_name || 'sem nome'}\nPerfil (não clínico): ${JSON.stringify(perfil)}\nPlano da semana: ${JSON.stringify(planoCurto)}\n\nPergunta dela:\n"""${q.text.slice(0, 2000)}"""`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: RASCUNHO_PROMPT }, { role: 'user', content: contexto }],
      temperature: 0.4,
      max_completion_tokens: 600,
      response_format: { type: 'json_schema', json_schema: RASCUNHO_SCHEMA },
    });
    const bruto = completion.choices?.[0]?.message?.content?.trim() || '';
    let d; try { d = JSON.parse(bruto); } catch { d = null; }
    if (!d) return gravar('nutri', null, 'A Luna não devolveu um rascunho legível.');
    const ok = d.pode_responder === true && String(d.rascunho || '').trim().length >= 10;
    return gravar(ok ? 'ia' : 'nutri', ok ? String(d.rascunho).trim().slice(0, 2000) : null, String(d.motivo || '').trim().slice(0, 300) || null);
  } catch (e) {
    console.warn('[triagem] rascunho falhou:', e.message);
    return gravar('nutri', null, `A Luna não conseguiu gerar o rascunho (${e.message.slice(0, 80)}).`);
  }
}

/** Dispara em segundo plano; a resposta da cliente não espera a IA. */
export function agendarRascunho(perguntaId) {
  setImmediate(() => { gerarRascunho(perguntaId).catch((e) => console.warn('[triagem] falhou:', e.message)); });
}
