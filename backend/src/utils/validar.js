// Validação do corpo das rotas de escrita com zod.
//
// Por quê: as rotas checavam campo a campo, mas o que é JSON livre (perfil,
// anamnese, medidas, itens) entrava como viesse — qualquer tipo, qualquer
// tamanho até os 15 MB do express.json — e ia direto pro JSONB. Em 10 mil
// pacientes isso é banco inchado e tela quebrando ao ler o que gravou.
//
// Uso:  router.post('/x', validar(schema), handler)
// O corpo validado SUBSTITUI req.body (chaves desconhecidas somem). Erro →
// 400 { error: mensagem em português, code: 'BAD_REQUEST', campo }.
// Erro com status/code próprios continua vindo do handler (404, 409…): aqui
// é só forma.

import { z } from 'zod';

export { z };

const NOME = (path) => (path.length ? path.map((p) => (typeof p === 'number' ? `[${p}]` : p)).join('.').replace(/\.\[/g, '[') : 'corpo');

/** Mensagem em português a partir do primeiro problema do zod. */
export function mensagemDe(issue) {
  const campo = NOME(issue.path);
  switch (issue.code) {
    case 'invalid_type':
      return issue.received === 'undefined' || issue.received === 'null' ? `${campo} é obrigatório.` : `${campo} inválido.`;
    case 'too_small':
      if (issue.type === 'string') return issue.minimum <= 1 ? `${campo} é obrigatório.` : `${campo} precisa ter pelo menos ${issue.minimum} caracteres.`;
      if (issue.type === 'array') return issue.minimum <= 1 ? `${campo} precisa de pelo menos um item.` : `${campo} precisa de pelo menos ${issue.minimum} itens.`;
      return `${campo} abaixo do mínimo (${issue.minimum}).`;
    case 'too_big':
      if (issue.type === 'string') return `${campo} está longo demais (máximo ${issue.maximum} caracteres).`;
      if (issue.type === 'array') return `${campo} tem itens demais (máximo ${issue.maximum}).`;
      return `${campo} acima do máximo (${issue.maximum}).`;
    case 'invalid_enum_value':
    case 'invalid_literal':
      return `${campo} inválido.`;
    case 'unrecognized_keys':
      return `Campo desconhecido: ${issue.keys.join(', ')}.`;
    case 'custom':
      return issue.message;
    default:
      return `${campo} inválido.`;
  }
}

export function validar(schema, onde = 'body') {
  return (req, res, next) => {
    const r = schema.safeParse(req[onde] ?? {});
    if (!r.success) {
      const issue = r.error.issues[0];
      return res.status(400).json({ error: mensagemDe(issue), code: 'BAD_REQUEST', campo: NOME(issue.path) });
    }
    req[onde] = r.data;
    next();
  };
}
