// Teto de uso das rotas que custam por chamada.
//
// Existe por um motivo específico: tirar o botão do app não impede ninguém de
// chamar o endpoint direto, e a URL do backend vai dentro do binário que
// qualquer pessoa baixa da loja. O limite tem que morar aqui.
//
// DOIS NÍVEIS (decisão do Raphael, 07/09). Quem contratou o acompanhamento tem
// teto muito maior; quem não contratou tem um teto que, pelos números dele, a
// grande maioria nunca encosta.
//
// ⚠️ O teto gratuito PRECISA continuar generoso. É ele que sustenta o argumento
// de que o limite existe contra abuso, e não pra vender: um limite que 95% das
// pessoas nunca alcançam não nega funcionalidade. Se um dia ele apertar a ponto
// de incomodar o uso normal, vira paywall disfarçado — com tudo que isso traz
// junto na diretriz 3.1.1 da App Store.
//
// TETO MENSAL por cima do diário: teto diário não limita gasto sustentado.
// Alguém no limite todo dia gasta trinta vezes o dia. O mensal é o que amarra o
// custo de verdade, e é mais gentil, porque perdoa o dia atípico.

import { getPool } from '../db.js';
import { temAcesso } from './billing.js';

const janelas = new Map();

const inicioDoDia = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const competencia = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Formato do device_id gerado pelo app (UUID v4-like, 8-4-4-4-12).
 *
 * A validação importa porque o device_id é a chave de contagem do usuário
 * anônimo, e ele vem do corpo da requisição — ou seja, o cliente escolhe.
 * Sem validar, girar uma string nova a cada chamada dá um contador limpo toda
 * vez e o teto deixa de existir. Com validação, forjar exige pelo menos imitar
 * o formato — e o teto por IP embaixo fecha o resto.
 */
const DEVICE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function contarNaMemoria(chave, maximo) {
  const hoje = inicioDoDia();
  const atual = janelas.get(chave);
  if (!atual || atual.dia !== hoje) {
    janelas.set(chave, { dia: hoje, n: 1 });
    return { estourou: false };
  }
  if (atual.n >= maximo) return { estourou: true };
  atual.n += 1;
  return { estourou: false };
}

/**
 * Contador mensal em banco. Só roda pro assinante: o teto diário do gratuito
 * (8/dia) já o amarra em 240/mês, e uma escrita por chamada pra confirmar o que
 * a aritmética já garante seria custo sem informação.
 */
async function contarNoMes(chave, maximo) {
  if (!maximo || !process.env.DATABASE_URL) return { estourou: false };
  try {
    const { rows } = await getPool().query(
      `INSERT INTO uso_mensal (chave, competencia, n)
            VALUES ($1, $2, 1)
       ON CONFLICT (chave, competencia)
       DO UPDATE SET n = uso_mensal.n + 1, atualizado_em = NOW()
         RETURNING n`,
      [chave, competencia()],
    );
    return { estourou: rows[0].n > maximo, usados: rows[0].n };
  } catch (e) {
    // Banco fora do ar não pode derrubar a chamada — o teto diário continua
    // valendo e é ele que segura o pior caso de curto prazo.
    console.warn('[limites] contador mensal falhou:', e.message);
    return { estourou: false };
  }
}

/**
 * Middleware de teto por nível.
 *
 * @param {string} nome        identificador da rota, usado na chave de contagem
 * @param {object} limites     { gratis, assinante, assinanteMes }
 * @param {string} envPrefix   prefixo das envs de override (ex: LIMITE_FOTO_IA)
 *
 * Envs reconhecidas, todas opcionais e sem deploy:
 *   <PREFIXO>_DIA          teto diário do gratuito
 *   <PREFIXO>_DIA_ASSIN    teto diário do assinante
 *   <PREFIXO>_MES_ASSIN    teto mensal do assinante
 * `0` em qualquer uma desliga aquele teto.
 */
export function teto(nome, limites, envPrefix) {
  return async (req, res, next) => {
    try {
      const num = (env, padrao) => {
        const v = process.env[env];
        return v === undefined ? padrao : Number(v);
      };

      // Nível. Sem usuário autenticado é sempre gratuito — e é o caso da maioria,
      // porque o app roda anônimo por padrão.
      let assinante = false;
      if (req.user?.userId) {
        try {
          assinante = (await temAcesso(req.user.userId)).acesso === true;
        } catch {
          // Falha ao consultar acesso trata como gratuito: errar pro lado do
          // teto menor é preferível a liberar por acidente.
        }
      }

      const maxDia = assinante
        ? num(`${envPrefix}_DIA_ASSIN`, limites.assinante)
        : num(`${envPrefix}_DIA`, limites.gratis);
      const maxMes = assinante ? num(`${envPrefix}_MES_ASSIN`, limites.assinanteMes) : 0;

      if (!Number.isFinite(maxDia) || maxDia <= 0) return next();

      // Identidade de contagem, da mais confiável pra menos.
      const deviceId = req.body?.device_id;
      const deviceValido = typeof deviceId === 'string' && DEVICE_ID_RE.test(deviceId);
      const quem = req.user?.userId || (deviceValido ? deviceId : null);

      // O IP conta SEMPRE, além da identidade. É o que fecha a porta de girar
      // device_id: cada identidade nova ganha contador limpo, mas todas dividem
      // o mesmo IP. O `trust proxy` do index.js é o que faz esse IP ser o da
      // pessoa e não o do proxy do Railway.
      const chaves = [`${nome}:ip:${req.ip}`];
      if (quem) chaves.unshift(`${nome}:${quem}`);

      for (const chave of chaves) {
        if (contarNaMemoria(chave, maxDia).estourou) {
          return res.status(429).json({
            error: `Você atingiu o limite de ${maxDia} por dia. Tente amanhã.`,
            code: 'LIMITE_DIARIO',
            limite: maxDia,
          });
        }
      }

      if (maxMes > 0 && quem) {
        const mes = await contarNoMes(`${nome}:${quem}`, maxMes);
        if (mes.estourou) {
          return res.status(429).json({
            error: `Você atingiu o limite de ${maxMes} neste mês.`,
            code: 'LIMITE_MENSAL',
            limite: maxMes,
          });
        }
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

// Faxina periódica: sem isso o Map cresceria para sempre com chaves de dias
// passados. Uma vez por hora é folgado — as entradas são minúsculas.
setInterval(
  () => {
    const hoje = inicioDoDia();
    for (const [chave, v] of janelas) if (v.dia !== hoje) janelas.delete(chave);
  },
  60 * 60 * 1000,
).unref();
