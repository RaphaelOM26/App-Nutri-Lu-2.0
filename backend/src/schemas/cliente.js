// Corpo das rotas de escrita da cliente (routes/cliente.js).
// A forma é o que o navegador manda hoje; os tetos existem pra JSON livre
// não virar banco inchado. Regra de negócio (slot existe? plano ativo?) fica
// no handler; aqui é só forma e tamanho.
import { z } from '../utils/validar.js';
import { data, slot, fonte, texto, numeroBr, itensRefeicao, uuid } from './comuns.js';

// Objeto pequeno (não texto: texto tem o próprio teto na união).
const objetoPequeno = (maxChars, nome) => z.record(z.string().max(40), z.unknown()).superRefine((v, ctx) => {
  if (JSON.stringify(v).length > maxChars) ctx.addIssue({ code: 'custom', message: `${nome} grande demais.` });
});

export const criarRefeicao = z.object({
  date: data,
  slot,
  source: fonte,
  items: itensRefeicao,
  photo_key: z.string().max(200).nullable().optional(),
  // 'high' | 'medium' | 'low' da análise por foto; texto livre curto.
  confidence: z.string().max(20).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  logged_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export const editarRefeicao = z.object({
  items: itensRefeicao,
  slot: slot.optional(),
  note: z.string().max(500).nullable().optional(),
});

export const copiarRefeicoes = z.object({ from: data, to: data });

export const agua = z.object({
  date: data,
  delta_ml: z.number().finite().min(-10_000).max(10_000).optional(),
  ml: z.number().finite().min(0).max(20_000).optional(),
});

export const peso = z.object({ date: data, kg: numeroBr(20, 400) });

export const medidas = z.object({
  date: data,
  measures: z.record(z.string().regex(/^[a-z_]{2,30}$/), numeroBr(0.1, 399.9)).refine((m) => Object.keys(m).length > 0 && Object.keys(m).length <= 30, 'Nenhuma medida válida.'),
});

export const uploadUrl = z.object({
  pasta: z.enum(['prato', 'perfil', 'progresso']).optional(),
  content_type: z.string().regex(/^image\/(jpeg|png|webp|heic|heif)$/i, 'Só foto (jpeg, png, webp ou heic).'),
  size: z.number().int().min(0).max(30 * 1024 * 1024).optional(),
});

export const fotoProgresso = z.object({
  date: data,
  photo_key: z.string().min(1).max(200),
  weight_kg: numeroBr(20, 400).nullable().optional(),
});

export const trocaDePlano = z.object({
  date: data,
  slot,
  meal: z.object({
    name: texto(120, 1),
    code: z.string().max(12).nullable().optional(),
    items: itensRefeicao,
  }).passthrough(),
});

export const suplementoTomado = z.object({ date: data, taken: z.boolean().optional() });

// Perfil: cada campo é curto (texto, número, sim/não, lista de textos ou um
// objeto pequeno, caso da `estimativa` e dos `lembretes`). O handler ainda
// filtra pelas chaves conhecidas (CAMPOS_PERFIL) e trata nome/apelido/foto.
const valorPerfil = z.union([
  z.string().max(1000),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(z.string().max(120)).max(50),
  objetoPequeno(2000, 'campo do perfil'),
]);
export const perfil = z.object({
  perfil: z.record(z.string().max(40), valorPerfil).superRefine((p, ctx) => {
    if (Object.keys(p).length > 60) ctx.addIssue({ code: 'custom', message: 'perfil com campos demais.' });
    if (JSON.stringify(p).length > 20_000) ctx.addIssue({ code: 'custom', message: 'perfil grande demais.' });
    if (p.altura_cm != null && !(Number(p.altura_cm) >= 100 && Number(p.altura_cm) <= 250)) ctx.addIssue({ code: 'custom', message: 'altura_cm fora do esperado (100 a 250).' });
    if (p.meta_kg != null && p.meta_kg !== '' && !(Number(p.meta_kg) >= 20 && Number(p.meta_kg) <= 400)) ctx.addIssue({ code: 'custom', message: 'meta_kg fora do esperado (20 a 400).' });
  }),
});

// Anamnese clínica: dado de saúde, texto livre mais longo (até 2.000 por
// campo, como antes) e o rastreio de suplementação como objeto pequeno.
const valorClinico = z.union([
  z.string().max(2000),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(z.string().max(200)).max(50),
  objetoPequeno(4000, 'campo da anamnese'),
]);
export const anamneseClinica = z.object({
  consentimento: z.literal(true, { errorMap: () => ({ message: 'É preciso consentir com o uso dos dados de saúde.' }) }),
  data: z.record(z.string().max(40), valorClinico).superRefine((d, ctx) => {
    if (JSON.stringify(d).length > 40_000) ctx.addIssue({ code: 'custom', message: 'anamnese grande demais.' });
  }),
});

export const pergunta = z.object({
  text: z.string().trim().min(3, 'Escreve a pergunta antes de mandar.').max(2000, 'A pergunta está longa demais (máximo 2.000 caracteres).'),
});

export const notificacoesLidas = z.object({ ids: z.array(uuid).max(200).nullable().optional() });
