// Teto de uso por conta, para as rotas que custam por chamada.
//
// Existe por um motivo específico: tirar o botão do app não impede ninguém de
// chamar o endpoint direto, e a URL do backend vai dentro do binário que
// qualquer pessoa baixa da loja. O limite tem que morar aqui.
//
// A contagem é em memória, por processo. Isso é deliberado: um contador em
// banco resolveria reinício e múltiplas instâncias, mas custa uma escrita por
// chamada para proteger de um cenário que, no volume atual, é hipotético. Se um
// dia o backend rodar em várias réplicas, é aqui que muda.

const janelas = new Map();

const inicioDoDia = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Middleware de teto diário. Conta por usuário autenticado; sem usuário, cai
 * no device_id do corpo e por fim no IP — nessa ordem porque cada uma é mais
 * fácil de forjar que a anterior.
 *
 * Vem SEMPRE depois de requirePremium: primeiro se pergunta se pode, depois
 * quanto já usou.
 */
export function tetoDiario(nome, maximoPadrao, envVar) {
  return (req, res, next) => {
    const maximo = Number(process.env[envVar] ?? maximoPadrao);
    // 0 desliga o teto — escotilha de emergência sem precisar de deploy.
    if (!Number.isFinite(maximo) || maximo <= 0) return next();

    const quem = req.user?.userId || req.body?.device_id || req.ip || 'desconhecido';
    const chave = `${nome}:${quem}`;
    const hoje = inicioDoDia();

    const atual = janelas.get(chave);
    if (!atual || atual.dia !== hoje) {
      janelas.set(chave, { dia: hoje, n: 1 });
      return next();
    }

    if (atual.n >= maximo) {
      return res.status(429).json({
        error: `Você atingiu o limite de ${maximo} por dia. Tente amanhã.`,
        code: 'LIMITE_DIARIO',
        limite: maximo,
      });
    }
    atual.n += 1;
    next();
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
