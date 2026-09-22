// Como a Luna chama a paciente, num lugar só.
//
// São três fontes, nesta ordem (decidido com o Raphael em 21/09/2026):
//   1. `users.apelido`   — o que ELA respondeu ("pode me chamar de Mari")
//   2. `users.display_name` — o nome da compra na Hotmart
//   3. `whatsapp_contatos.nome_perfil` — o nome do perfil do WhatsApp dela
// e, se não houver nada, o nome simplesmente não aparece: toda frase do bot é
// escrita pra funcionar sem ele (`Pronto${vocativo(n)}!` → "Pronto!").
//
// Por que tratar: na Hotmart as pessoas digitam "MARIA DA SILVA SANTOS",
// "maria", "Maria (esposa)". Mandar isso pra 10 mil pessoas é pior do que não
// mandar nome nenhum. Aqui a gente tira o primeiro nome, arruma a caixa e
// recusa o que claramente não é nome.

// Partículas que nunca são o primeiro nome sozinhas ("de Oliveira" → Oliveira).
const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'del', 'dr', 'dra', 'sr', 'sra', 'o', 'a', 'um', 'uma']);

// Papéis, comandos do bot e palavras que abrem frase comum: se sobrou uma
// dessas, ela não estava dizendo o nome dela ("me chama de atendente", "quero
// água", "meu plano"). Sem isso o apelido vira "Atendente" ou "Quero" e a Luna
// passa a chamar a paciente assim pra sempre. Dicionário, não IA.
const NAO_E_NOME = new Set([
  'atendente', 'atendimento', 'suporte', 'equipe', 'time', 'humano', 'pessoa', 'alguem', 'gente',
  'luna', 'nutri', 'nutricionista', 'luciana', 'lu', 'voce', 'vc', 'eu', 'me', 'mim', 'nao', 'sim',
  'parar', 'cancelar', 'ajuda', 'menu', 'oi', 'ola', 'bom', 'boa', 'peso', 'macros', 'plano',
  'meu', 'minha', 'meus', 'minhas', 'quero', 'queria', 'como', 'quanto', 'quanta', 'quantos', 'quantas',
  'quando', 'onde', 'que', 'qual', 'quais', 'tem', 'tenho', 'to', 'estou', 'ja', 'ainda', 'hoje', 'amanha',
  'ontem', 'obrigada', 'obrigado', 'valeu', 'ok', 'beleza', 'certo', 'tudo', 'bem', 'pode', 'deixa',
  'lista', 'compras', 'receita', 'receitas', 'cafe', 'almoco', 'janta', 'jantar', 'lanche', 'agua', 'fome',
]);

const soLetras = (s) => /^[\p{L}][\p{L}'-]*$/u.test(s);

/** "MARIA DA SILVA" → "Maria" · "maria" → "Maria" · "M4ria!!" → null */
export function primeiroNome(bruto) {
  const limpo = String(bruto || '')
    .replace(/[(\[{].*$/s, '')       // "Maria (esposa do João)" → "Maria"
    .replace(/[_*~`]/g, ' ')          // markdown do WhatsApp
    .trim();
  if (!limpo) return null;
  const palavra = limpo.split(/\s+/).find((p) => soLetras(p) && !PARTICULAS.has(p.toLowerCase()));
  if (!palavra || palavra.length < 2 || palavra.length > 20) return null;
  const minuscula = palavra.toLocaleLowerCase('pt-BR');
  return minuscula.charAt(0).toLocaleUpperCase('pt-BR') + minuscula.slice(1);
}

/**
 * O nome que a Luna usa. Aceita qualquer objeto com as três fontes.
 * @param {{ apelido?: string, display_name?: string, nome?: string, nome_perfil?: string }} f
 * @returns {string|null}
 */
export function nomeDe(f = {}) {
  // `||`, não `??`: o cadastro grava display_name como string VAZIA quando a
  // compra veio sem nome, e '' ?? x devolve '' — o `nome` da compra morreria.
  return primeiroNome(f.apelido) || primeiroNome(f.display_name || f.nome) || primeiroNome(f.nome_perfil);
}

/**
 * ", Mariana" pra colar no meio da frase — vazio quando não há nome.
 * Uso: `Pronto${vocativo(nome)}! ✅`
 */
export const vocativo = (nome) => (nome ? `, ${nome}` : '');

/** "Oi, Mariana! " · sem nome vira "Oi! " — pra abrir mensagem. */
export const saudacao = (nome) => (nome ? `Oi, ${nome}!` : 'Oi!');

// O pedido em volta do nome: "pode me chamar de X", "me chama de X", "prefiro
// (ser chamada de) X", "pode ser X", "meu nome é X", "sou (a) X". A forma longa
// vem antes da curta na alternação — a regex casa a primeira que serve, e
// "prefiro" sozinho deixaria "ser chamada de Mari" → "Ser". O `(?:a\s+)?` exige
// espaço depois do "a" pra não comer o "A" de "sou Ana".
const GATILHO = /^(?:(?:pode|podes|pd)\s+(?:me\s+)?chamar\s+(?:de\s+)?|(?:me\s+)?chama\s+(?:de\s+)?|prefiro\s+(?:ser\s+chamada\s+de\s+)?|pode\s+ser\s+|meu\s+nome\s+(?:é|eh|e)\s+|sou\s+(?:a\s+)?)/i;

/**
 * O que ela digitou quando pedimos o apelido ("pode me chamar de Mari 💕").
 * Devolve só o nome, ou null se não deu pra entender.
 *
 * Sem o pedido em volta, só aceita o que PARECE nome: uma ou duas palavras.
 * "quanto de proteína comi hoje?" não é resposta à pergunta do nome, é uma
 * pergunta — devolve null e quem chama segue o fluxo normal com ela.
 */
export function apelidoDoTexto(texto) {
  const cru = String(texto || '').replace(/[.!?]+$/, '').trim();
  if (!cru || cru.length > 60) return null;
  const comGatilho = GATILHO.test(cru);
  const sem = cru.replace(GATILHO, '').trim();
  if (!comGatilho && sem.split(/\s+/).length > 2) return null;
  const nome = primeiroNome(sem);
  if (!nome) return null;
  // Sem acento e em minúsculas só pra comparar com a lista de não-nomes.
  const chave = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return NAO_E_NOME.has(chave) ? null : nome;
}
