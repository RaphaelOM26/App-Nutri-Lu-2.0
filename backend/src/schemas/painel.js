// Corpo das rotas de escrita do PAINEL (routes/nutri.js e routes/lote.js).
//
// Só forma e tamanho. A regra de negócio do plano (segunda-feira, slots,
// itens, dia vazio ao publicar…) continua em validarPlano/validarSuplementos/
// validarMaterial, que dão a mensagem certa pra Luciana. O que entra aqui é o
// que essas funções NÃO cobriam: tipo errado, chave desconhecida (some), texto
// ou JSON sem teto — que em 10 mil pacientes vira JSONB inchado. Por isso
// `days` e `weeks` ficam soltos por dentro (a validação de verdade é a de
// negócio) mas com teto de tamanho por fora.
import { z } from '../utils/validar.js';
import { data, texto, uuid, jsonPequeno } from './comuns.js';

export { perfil as perfilNutri } from './cliente.js';

// Metas do plano: kcal/p/c/f/water_ml. validarPlano converte e arredonda;
// aqui só garante que é um objeto pequeno de números (ou texto de formulário).
const targets = z.record(z.string().max(20), z.union([z.number().finite(), z.string().max(20), z.null()]))
  .refine((t) => Object.keys(t).length <= 10, 'targets com campos demais.')
  .optional();

const metaKg = z.number().finite().min(20, 'meta_kg fora do esperado').max(400, 'meta_kg fora do esperado').nullable().optional();
const recado = z.string().max(2000, 'O recado está longo demais (máximo 2.000 caracteres).').nullable().optional();
const note = z.string().max(2000, 'A nota está longa demais (máximo 2.000 caracteres).').nullable().optional();

// Uma semana: até 7 dias, cada um com suas refeições. Teto de 500 mil
// caracteres cobre 7 dias × 6 refeições × 50 itens com folga.
const days = z.array(z.unknown()).max(7, 'days tem dias demais (máximo 7).').pipe(jsonPequeno(500_000, 'plano da semana')).optional();

export const suplemento = z.object({
  name: texto(80, 1),
  dose: z.string().max(60).nullable().optional(),
  time: z.string().max(5).nullable().optional(),
  with_meal: z.string().max(80).nullable().optional(),
}).passthrough();
const supplements = z.array(suplemento).max(30, 'Suplementos demais (máximo 30).').optional();

// PUT /nutri/pacientes/:id/plano (uma semana)
export const plano = z.object({
  week_start: z.string().max(10),
  // Número no navegador; os scripts de carga podem mandar texto — validarPlano converte.
  week_index: z.union([z.number().int(), z.string().max(3)]).nullable().optional(),
  week_total: z.union([z.number().int(), z.string().max(3)]).nullable().optional(),
  targets,
  note,
  days,
  supplements,
  meta_kg: metaKg,
  recado,
  publicar: z.boolean().optional(),
  avisar: z.boolean().optional(),
});

// PUT /nutri/pacientes/:id/plano-mes (N semanas de uma vez)
export const planoMes = z.object({
  inicio: z.string().max(10),
  targets,
  note,
  weeks: z.array(z.object({ days }).passthrough())
    .min(1, 'weeks precisa ter de 1 a 6 semanas').max(6, 'weeks precisa ter de 1 a 6 semanas'),
  supplements,
  meta_kg: metaKg,
  recado,
  publicar: z.boolean().optional(),
  avisar: z.boolean().optional(),
});

export const copiarPlano = z.object({ week_start: data });

export const suplementos = z.object({ supplements: z.array(suplemento).max(30, 'Suplementos demais (máximo 30).') });

const textoDeRecado = z.string().trim()
  .min(2, 'Escreve o recado antes de mandar.')
  .max(2000, 'O recado está longo demais (máximo 2.000 caracteres).');
export const recadoPaciente = z.object({ text: textoDeRecado, reply_to: uuid.nullable().optional() });
export const recadoTodos = z.object({ text: textoDeRecado });

// Materiais (vídeo por link, PDF pelo R2)
export const uploadUrlMaterial = z.object({
  content_type: z.string().min(1, 'content_type é obrigatório.').max(100),
  size: z.number().finite().min(0).max(1_000_000_000).optional(),
});
export const material = z.object({
  title: z.string().trim().min(1, 'Título obrigatório.').max(120, 'O título está longo demais (máximo 120 caracteres).'),
  kind: z.enum(['video', 'pdf']),
  url: z.string().max(500, 'O link está longo demais.').nullable().optional(),
  file_key: z.string().max(200).nullable().optional(),
  meta: z.record(z.string().max(40), z.union([z.string().max(500), z.number().finite(), z.boolean(), z.null()]))
    .refine((m) => Object.keys(m).length <= 20, 'meta com campos demais.').nullable().optional(),
  sort: z.number().finite().optional(),
  active: z.boolean().optional(),
});

// Aprovação em lote
export const abrirLote = z.object({ user_ids: z.array(uuid).max(100, 'Pacientes demais num lote só.') });
export const conferirLote = z.object({ user_id: uuid });
