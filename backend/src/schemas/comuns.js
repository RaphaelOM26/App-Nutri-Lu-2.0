// Pedaços de schema que várias rotas usam. Ver utils/validar.js.
import { z } from '../utils/validar.js';
import { dataValida } from '../utils/datas.js';
import { SLOTS, FONTES } from '../services/diario.js';

export const data = z.string().refine(dataValida, { message: 'date precisa estar no formato YYYY-MM-DD' });
export const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'id inválido');
export const slot = z.enum(SLOTS);
export const fonte = z.enum(FONTES);

/** Texto curto, já aparado. */
export const texto = (max, min = 0) => z.string().trim().min(min).max(max);

/** Número que pode vir como "72,5" do formulário. */
export const numeroBr = (min, max) => z.preprocess(
  (v) => (typeof v === 'string' ? Number(v.replace(',', '.')) : v),
  z.number().finite().min(min).max(max),
);

/** Qualquer JSON, desde que caiba em `maxChars` quando serializado. */
export const jsonPequeno = (maxChars, nome = 'conteúdo') => z.unknown().superRefine((v, ctx) => {
  if (v !== undefined && JSON.stringify(v).length > maxChars) ctx.addIssue({ code: 'custom', message: `${nome} grande demais.` });
});

/** Um item de refeição como o navegador manda; totais são recalculados no servidor. */
export const itemRefeicao = z.object({
  name: texto(120, 1),
  portion: texto(60).optional().default(''),
  grams: z.number().finite().min(0).max(100_000).nullable().optional(),
  kcal: z.number().finite().min(0).max(100_000),
  p: z.number().finite().min(0).max(10_000),
  c: z.number().finite().min(0).max(10_000),
  f: z.number().finite().min(0).max(10_000),
  code: z.string().max(12).optional(),
}).passthrough();

export const itensRefeicao = z.array(itemRefeicao).min(1, 'A refeição precisa de pelo menos um item.').max(50, 'Muitos itens numa refeição só (máximo 50).');
