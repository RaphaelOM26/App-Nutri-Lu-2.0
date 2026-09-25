// Calibração do RECIPIENTE da paciente (decisão do Raphael, 26/09/2026).
//
// A medição de 25/09 mostrou que o erro do arroz não é aleatório: o modelo
// chuta o mesmo tamanho de prato pra todo mundo, então erra pela metade no
// prato grande e pelo dobro na marmita, sempre igual. A cura é saber o
// tamanho do recipiente DELA. Uma vez na vida: foto do prato vazio com a mão
// aberta em cima (mão adulta ≈ 18 cm) e, se ela usa, da marmita também.
// Fica em client_profiles.data.recipientes e entra como pista em toda foto
// de comida dela. Nada clínico; a foto da mão não é guardada.

import { getPool } from '../../db.js';
import { openai, FOOD_MODEL } from '../openai.js';

export const RECIPIENTE_SCHEMA = {
  name: 'recipiente',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['tipo', 'largura_cm', 'comprimento_cm', 'confianca', 'observacao'],
    properties: {
      tipo: { type: 'string', enum: ['prato', 'marmita', 'tigela', 'nenhum'], description: '"nenhum" se a foto não mostra um recipiente VAZIO (ou quase) pra ser medido.' },
      largura_cm: { type: ['number', 'null'], description: 'Prato/tigela: diâmetro INTERNO da borda. Marmita: o lado menor, interno.' },
      comprimento_cm: { type: ['number', 'null'], description: 'Prato/tigela: igual ao diâmetro. Marmita: o lado maior, interno.' },
      confianca: { type: 'string', enum: ['high', 'medium', 'low'] },
      observacao: { type: 'string', description: 'Uma frase: que referência usou (mão, talher, moeda) e o que atrapalhou.' },
    },
  },
};

const PROMPT = `Você mede recipientes de comida a partir de UMA foto, usando uma referência de tamanho conhecida.
Referências, em ordem de confiança: mão adulta aberta (punho à ponta do dedo médio ≈ 18 cm; mulher ≈ 17 cm, homem ≈ 19 cm; palma ≈ 8,5 cm de largura), garfo/faca de mesa ≈ 20 cm, colher de sopa ≈ 18 cm, cartão de banco 8,6 × 5,4 cm, moeda de R$ 1 ≈ 2,7 cm, celular ≈ 15 × 7 cm.
Tarefa: dizer se a foto mostra um PRATO, uma MARMITA/pote ou uma TIGELA vazios (ou quase vazios) e estimar o tamanho INTERNO em cm. Corrija a perspectiva: a referência precisa estar no mesmo plano do recipiente; se a mão está bem acima do prato, ela parece maior do que é. Prato: diâmetro interno (largura = comprimento). Marmita: comprimento × largura internos.
Sem referência confiável, estime pelo que houver e marque confianca "low". Se a foto é de comida servida, de corpo, ou não tem recipiente, tipo "nenhum". Responda em português.`;

/** @param {string} dataUrl */
export async function medirRecipiente(dataUrl) {
  const completion = await openai.chat.completions.create({
    model: FOOD_MODEL,
    messages: [
      { role: 'system', content: PROMPT },
      { role: 'user', content: [{ type: 'text', text: 'Meça o recipiente desta foto conforme o schema.' }, { type: 'image_url', image_url: { url: dataUrl } }] },
    ],
    response_format: { type: 'json_schema', json_schema: RECIPIENTE_SCHEMA },
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw Object.assign(new Error('Resposta vazia da IA.'), { status: 502, code: 'AI_EMPTY_RESPONSE' });
  const r = JSON.parse(content);
  const ok = (v) => (typeof v === 'number' && v >= 8 && v <= 45 ? Math.round(v) : null);
  return { tipo: r.tipo, largura: ok(r.largura_cm), comprimento: ok(r.comprimento_cm), confianca: r.confianca, observacao: String(r.observacao || '').slice(0, 200) };
}

export async function recipientesDe(userId) {
  const { rows: [r] } = await getPool().query(`SELECT data->'recipientes' AS r FROM client_profiles WHERE user_id = $1`, [userId]);
  return r?.r && typeof r.r === 'object' ? r.r : {};
}

/** Guarda prato ou marmita (tigela conta como prato) no perfil. */
export async function guardarRecipiente(userId, medida) {
  const chave = medida.tipo === 'marmita' ? 'marmita' : 'prato';
  const atual = await recipientesDe(userId);
  const novo = { ...atual, [chave]: { largura: medida.largura, comprimento: medida.comprimento, confianca: medida.confianca, em: new Date().toISOString().slice(0, 10) } };
  await getPool().query(
    `INSERT INTO client_profiles (user_id, data) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET data = client_profiles.data || EXCLUDED.data, updated_at = NOW()`,
    [userId, JSON.stringify({ recipientes: novo })]);
  return novo;
}

/** "prato de ~26 cm" / "marmita de ~17 × 12 cm" */
export function descreverRecipiente(chave, r) {
  if (!r) return '';
  if (chave === 'marmita') return `marmita de ~${r.comprimento || r.largura} × ${r.largura || r.comprimento} cm`;
  return `prato de ~${r.largura || r.comprimento} cm de diâmetro`;
}

/**
 * A pista que vai pra Foto IA. Aceita o objeto do perfil ({ prato, marmita })
 * ou um texto pronto ({ texto }), que é como o harness anota o gabarito.
 */
export function pistaDosRecipientes(rec) {
  if (!rec) return '';
  const partes = rec.texto ? [rec.texto] : ['prato', 'marmita'].filter((k) => rec[k]).map((k) => descreverRecipiente(k, rec[k]));
  if (!partes.length) return '';
  return `Recipientes dela, medidos com a mão: ${partes.join('; ')}. Se o recipiente da foto for um deles, use esse tamanho como a referência de escala principal.`;
}
