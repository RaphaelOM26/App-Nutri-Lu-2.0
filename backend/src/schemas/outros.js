// Corpo das rotas de escrita fora do /me: login, comunidade, atendimento,
// resgate de código. Ver utils/validar.js.
import { z } from '../utils/validar.js';
import { texto, uuid } from './comuns.js';

const email = z.string().trim().toLowerCase().max(254).email('Digite um e-mail válido.');

export const loginPedirCodigo = z.object({ email, turnstile_token: z.string().max(2048).optional() });
export const loginConferirCodigo = z.object({
  email,
  code: z.union([z.string(), z.number()]).transform((v) => String(v)).pipe(z.string().max(12)),
  display_name: z.string().max(80).optional(),
  device_id: z.string().max(64).optional(),
});
export const loginPorLink = z.object({ t: z.string().min(1).max(512) });
export const loginSocial = z.object({
  provider: z.enum(['apple', 'google']),
  identity_token: z.string().min(1).max(8192),
  display_name: z.string().max(80).optional(),
  device_id: z.string().max(64).optional(),
});

export const resgatarCodigo = z.object({ code: z.string().trim().min(1).max(64) });

// Comunidade (app das lojas). Tetos iguais aos que a rota já aplicava.
export const receitaComunidade = z.object({
  title: texto(120, 1),
  payload: z.object({ ingredients: z.array(z.unknown()).max(200), steps: z.array(z.unknown()).max(200) }).passthrough()
    .superRefine((p, ctx) => { if (JSON.stringify(p).length > 2_000_000) ctx.addIssue({ code: 'custom', message: 'Receita grande demais' }); }),
  image_data_url: z.string().max(1_500_000, 'Foto grande demais — reduza a qualidade').nullable().optional(),
  source_url: z.string().max(2048).nullable().optional(),
});
export const avaliarReceita = z.object({ stars: z.coerce.number().int().min(1).max(5) });
export const denunciarReceita = z.object({ reason: z.string().max(40).optional() });

// Atendimento (time no painel).
export const mensagemDaEquipe = z.object({
  text: z.string().trim().min(1, 'Escreve a mensagem antes de enviar.').max(2000, 'A mensagem está longa demais (máximo 2.000 caracteres).'),
});
export const encerrarAtendimento = z.object({ avisar: z.boolean().optional() });

export { uuid };
