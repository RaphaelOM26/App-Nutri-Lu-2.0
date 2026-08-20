// Contabilidade de uso da OpenAI: quanto cada rota e cada pessoa consomem.
//
// Por que existe: o gasto recorrente do app é a IA, e até aqui NENHUMA chamada
// registrava os números que a OpenAI devolve em toda resposta. Sem isso só
// existe o total do painel no fim do mês — que não se atribui a feature nenhuma
// nem a usuário nenhum, e portanto não fecha a economia unitária.
//
// Grava TOKENS, não dólares. Preço muda, varia por modelo e por tipo de token;
// custo calculado com preço fixado aqui dentro viraria número inventado com
// cara de medição. A conversão pra dinheiro é feita no relatório, com o preço
// lido do painel da OpenAI — ver scripts/relatorio-uso.mjs.
//
// Por que AsyncLocalStorage: a chamada à OpenAI acontece no fundo da rota,
// longe do `req`. Passar { rota, usuário } por parâmetro obrigaria a mexer nas
// nove chamadas existentes e a lembrar disso em toda rota nova. Com o contexto
// viajando junto, o cliente é embrulhado UMA vez e rota nova entra contabilizada
// sozinha — mesma ideia do 402 interceptado no postJSON do app.

import { AsyncLocalStorage } from 'node:async_hooks';
import { getPool } from '../db.js';

const contexto = new AsyncLocalStorage();

/**
 * Middleware: abre o contexto da requisição. Vai ANTES das rotas no index.js.
 */
export function contextoDeUso(req, res, next) {
  // req.path é lido AGORA porque o Express o reescreve pra '/' assim que a
  // requisição entra no router montado — é o mesmo motivo pelo qual o logger
  // do index.js captura o caminho antes do res.on('finish').
  //
  // Guarda o `req` inteiro, não só o userId: quem autentica (optionalAuth,
  // requireAuth) é middleware que roda DEPOIS deste, então ler req.user só na
  // hora de gravar é o que pega o valor já preenchido.
  contexto.run({ rota: req.path, req }, () => next());
}

const inteiro = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null);

// A OpenAI usa nomes diferentes por família de API: chat devolve
// prompt_tokens/completion_tokens; imagem e transcrição devolvem
// input_tokens/output_tokens. Normaliza pra tabela ter uma forma só.
function normalizarUso(usage) {
  if (!usage || typeof usage !== 'object') return {};
  return {
    input: inteiro(usage.prompt_tokens ?? usage.input_tokens),
    output: inteiro(usage.completion_tokens ?? usage.output_tokens),
    total: inteiro(usage.total_tokens),
    // Token em cache custa uma fração do normal — sem separar, o custo estimado
    // sai alto pros prompts grandes e repetidos (os system prompts daqui são
    // enormes e vão iguais em toda chamada).
    cached: inteiro(usage.prompt_tokens_details?.cached_tokens ?? usage.input_tokens_details?.cached_tokens),
    reasoning: inteiro(usage.completion_tokens_details?.reasoning_tokens ?? usage.output_tokens_details?.reasoning_tokens),
  };
}

const INSERT = `
  INSERT INTO ai_usage (
    rota, tipo, modelo, user_id, device_id,
    input_tokens, output_tokens, cached_tokens, reasoning_tokens, total_tokens,
    imagens, ms, ok, erro
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
`;

/**
 * Grava uma chamada. NUNCA lança e NUNCA é esperada pela requisição: falha de
 * contabilidade não pode derrubar a foto do prato de alguém.
 */
function registrarUso({ tipo, modelo, usage, imagens, ms, ok, erro }) {
  try {
    const store = contexto.getStore();
    const req = store?.req;
    const u = normalizarUso(usage);

    getPool()
      .query(INSERT, [
        store?.rota || 'desconhecida',
        tipo,
        modelo || null,
        req?.user?.userId || null,
        req?.body?.device_id || null,
        u.input ?? null,
        u.output ?? null,
        u.cached ?? null,
        u.reasoning ?? null,
        u.total ?? null,
        inteiro(imagens),
        inteiro(ms),
        ok !== false,
        erro || null,
      ])
      .catch((e) => console.error('[uso] não consegui gravar:', e.message));
  } catch (e) {
    console.error('[uso] erro inesperado ao contabilizar:', e?.message);
  }
}

function embrulhar(alvo, metodo, tipo, extrair) {
  if (typeof alvo?.[metodo] !== 'function') {
    console.warn(`[uso] ${tipo}: ${metodo} não é função — chamadas dessa API ficam sem contabilidade`);
    return;
  }
  const original = alvo[metodo].bind(alvo);
  alvo[metodo] = async (...args) => {
    const inicio = Date.now();
    try {
      const resposta = await original(...args);
      registrarUso({ tipo, ms: Date.now() - inicio, ok: true, ...extrair(resposta, args[0]) });
      return resposta;
    } catch (e) {
      // Chamada que falhou também vira linha: distingue "ninguém usou" de
      // "todo mundo tentou e quebrou", e erro depois de tokens consumidos
      // ainda aparece na conta da OpenAI.
      registrarUso({
        tipo,
        ms: Date.now() - inicio,
        ok: false,
        modelo: args[0]?.model,
        erro: String(e?.code || e?.status || e?.name || 'erro').slice(0, 80),
      });
      throw e;
    }
  };
}

/**
 * Embrulha o cliente compartilhado. Chamado uma vez, na criação do cliente.
 */
export function contabilizar(openai) {
  embrulhar(openai.chat.completions, 'create', 'chat', (r, params) => ({
    modelo: params?.model,
    usage: r?.usage,
  }));

  embrulhar(openai.images, 'generate', 'imagem', (r, params) => ({
    modelo: params?.model,
    usage: r?.usage, // gpt-image-1 devolve usage; dall-e-3 não devolve nada
    // A imagem é a chamada mais cara do app e nem sempre vem com tokens — a
    // CONTAGEM é o que sustenta o custo por toque medido (US$ 0,064/imagem).
    imagens: Array.isArray(r?.data) ? r.data.length : (params?.n ?? 1),
  }));

  embrulhar(openai.audio.transcriptions, 'create', 'transcricao', (r, params) => ({
    modelo: params?.model,
    usage: r?.usage, // whisper-1 não devolve usage; os modelos novos devolvem
  }));

  return openai;
}
