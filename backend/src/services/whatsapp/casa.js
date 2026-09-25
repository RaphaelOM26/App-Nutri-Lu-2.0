// "Conhecimento da casa" (25/09/2026): o que a Luna sabe sobre COMO O NUTRI LU
// FUNCIONA, pra responder do jeito da casa em vez de "uma nutricionista
// qualquer": onde troca refeição, prazo da Luciana, como a lista de compras
// nasce, o que é foto de evolução, quem é a Luna. Mais os MATERIAIS que a
// Luciana publicou (título e pra quem serve) e a NOTA dela no plano da semana.
//
// Sem IA e sem embedding: cada trecho tem palavras-chave; entra no contexto
// só o que casa com a mensagem (até 3), pra não inflar o prompt. Receita nova
// NÃO entra aqui de propósito: sugestão de receita no WhatsApp continua
// proibida (restrição/alergia é filtro duro na área de membros).

import { getPool } from '../../db.js';
import { norm } from '../dashboard.js';

const MEMBROS = (process.env.MEMBROS_URL || 'https://nutrilualves.com.br/membros').replace(/\/$/, '');

export const FAQ = [
  { id: 'trocar', chaves: ['troca', 'trocar', 'substitu', 'outra opcao', 'nao gost', 'enjoei', 'mudar a refeicao', 'mudar o almoco', 'mudar o jantar'],
    texto: 'Trocar refeição: em Meu plano (área de membros), na refeição, botão Trocar. As opções são do livro da Nutri Luciana e já vêm filtradas pelas restrições e alergias dela; dá pra aplicar a mesma troca em outros dias da semana. A Luna não sugere receita nova por aqui.' },
  { id: 'prazo', chaves: ['responde', 'respondeu', 'resposta', 'demora', 'quanto tempo', 'prazo', 'duvida pra nutri', 'mandei pra nutri'],
    texto: 'Dúvida pra Nutri Luciana: ela responde pessoalmente em até 2 dias úteis; a resposta chega aqui no WhatsApp e no sino da área de membros. Pra mandar: "dúvida pra nutri".' },
  { id: 'lista', chaves: ['lista de compras', 'lista', 'mercado', 'comprar', 'feira'],
    texto: 'Lista de compras: nasce do plano da semana (ingredientes das receitas, somados). Peça "lista de compras" aqui; de sexta a domingo vem a da semana que vem, nos outros dias a desta semana. Formatos: marcar no celular (página da área de membros), PDF pra imprimir, ou aqui no chat.' },
  { id: 'registrar', chaves: ['registrar', 'registro', 'como anoto', 'como marco', 'anotar refeicao', 'foto do prato', 'audio'],
    texto: 'Registrar refeição: manda foto do prato, áudio ou texto aqui que a Luna registra na refeição certa (dá pra corrigir: "eram 3 colheres", "o arroz eram 150 g"). Na área de membros também dá pela tabela de alimentos e pelas receitas do plano.' },
  { id: 'evolucao', chaves: ['foto do corpo', 'foto de corpo', 'antes e depois', 'evolucao', 'espelho', 'medidas', 'circunfer'],
    texto: 'Foto de evolução (corpo, espelho, antes e depois): manda aqui e escolhe Evolução, ou escreve "evolução" na legenda. Vai pra aba Evolução da área de membros; só ela e a Nutri Luciana veem, nunca passa por IA. Medidas e peso entram em Evolução também.' },
  { id: 'plano', chaves: ['plano do mes', 'plano da semana', 'quando sai o plano', 'proxima semana', 'semana que vem', 'novo plano', 'quantas semanas', 'observacao', 'recado no plano'],
    texto: 'Plano: a Nutri Luciana publica o mês em 4 semanas; ela vê a semana corrente em Meu plano e a Luna mostra o dia ("o que como hoje/amanhã"). Quando o plano novo sai, chega aviso aqui. A nota da Luciana pra semana, quando existe, está no contexto.' },
  { id: 'materiais', chaves: ['material', 'materiais', 'video', 'vídeo', 'pdf', 'aula', 'ebook', 'guia'],
    texto: 'Materiais: vídeos e PDFs da Nutri Luciana ficam em Materiais na área de membros; peça "materiais" aqui que a Luna manda o que ela escolher. Os títulos disponíveis estão no contexto.' },
  { id: 'suporte', chaves: ['pagamento', 'boleto', 'cartao', 'acesso', 'senha', 'login', 'entrar', 'cadastro', 'reembolso', 'cancelar', 'suporte', 'atendente'],
    texto: 'Pagamento, acesso, cadastro e cancelamento são com o time de suporte: escreva "atendente" que uma pessoa assume a conversa em horário comercial. Login na área de membros é por e-mail (código) ou pelo link que a Luna manda.' },
  { id: 'quem', chaves: ['quem e voce', 'quem é você', 'voce e nutricionista', 'você é nutricionista', 'e um robo', 'é um robô', 'e uma ia', 'inteligencia artificial', 'voce e humana', 'você é humana', 'voce e real'],
    texto: 'A Luna é a assistente da Nutri Luciana (Luciana Alves, nutricionista) no WhatsApp do Nutri Lu: registra, mostra o plano, tira dúvida do dia a dia. Não é nutricionista e não substitui a Luciana; o que é decisão clínica vai pra ela.' },
  { id: 'peso', chaves: ['pesar', 'balanca', 'quando peso', 'registrar peso', 'anotar peso', 'meu peso'],
    texto: 'Peso: manda "peso 72,4" aqui ou registra em Evolução. Vale pesar 1 a 2 vezes por semana, de manhã, em jejum, na mesma balança; a Luna guarda o histórico e diz quanto mudou desde o início.' },
  { id: 'suplemento', chaves: ['suplemento', 'creatina', 'whey', 'omega', 'vitamina', 'colageno', 'magnesio', 'probiotico'],
    texto: 'Suplementos: os que a Nutri Luciana prescreveu estão no plano (nome, dose, horário) e no contexto; "tomei a creatina" marca o de hoje. Acrescentar, trocar ou mudar dose é prescrição: a Luna oferece mandar a pergunta pra Luciana.' },
  { id: 'agua', chaves: ['agua', 'água', 'hidrat', 'ml', 'litro'],
    texto: 'Água: a meta do dia está no plano (quando a Luciana definiu); "anota 500 ml" soma no copo do dia, e o resumo ("macros") mostra quanto falta.' },
  { id: 'avisos', chaves: ['parar', 'avisos', 'notificac', 'mensagens automaticas', 'nao quero receber'],
    texto: 'Avisos: "PARAR" desliga os avisos por aqui (ela continua podendo falar com a Luna); "AVISOS" liga de novo.' },
  { id: 'link', chaves: ['link', 'site', 'area de membros', 'área de membros', 'plataforma', 'app', 'aplicativo', 'onde vejo'],
    texto: `Área de membros: ${MEMBROS}. A Luna manda links já logados (valem 10 minutos) pra Meu plano, Lista, Evolução e Materiais. Não existe aplicativo pra baixar: é o site, que dá pra instalar na tela inicial do celular.` },
];

/** Trechos da FAQ que casam com a mensagem (até `max`), pelo dicionário. */
export function trechosDaCasa(texto, { max = 3 } = {}) {
  const t = ` ${norm(texto)} `;
  const pont = FAQ.map((f) => ({ f, n: f.chaves.filter((k) => t.includes(norm(k))).length })).filter((x) => x.n > 0);
  pont.sort((a, b) => b.n - a.n);
  return pont.slice(0, max).map((x) => x.f.texto);
}

// Materiais publicados: título + pra quem serve. Cache curto em memória — a
// lista muda pouco e é a mesma pra todas as pacientes (10 mil pedidos por
// hora não podem virar 10 mil SELECTs).
let cacheMateriais = { em: 0, itens: [] };
export async function materiaisDaCasa() {
  if (Date.now() - cacheMateriais.em < 10 * 60 * 1000) return cacheMateriais.itens;
  const { rows } = await getPool().query(`SELECT title, kind, meta FROM materials WHERE active ORDER BY sort, created_at DESC LIMIT 12`);
  cacheMateriais = { em: Date.now(), itens: rows.map((m) => `${m.title} (${m.kind === 'pdf' ? 'PDF' : 'vídeo'}${m.meta?.porque ? `: ${String(m.meta.porque).slice(0, 90)}` : ''})`) };
  return cacheMateriais.itens;
}
export const limparCacheMateriais = () => { cacheMateriais = { em: 0, itens: [] }; };
