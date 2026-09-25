// O bot: decide o que fazer com cada mensagem que chega no número.
//
// Antes de tudo: ela escreveu, então a janela de 24 h abriu. Sai o que estava
// guardado esperando por isso (resposta da Nutri Luciana, plano pronto,
// mensagem da equipe). Depois, a ordem de decisão (a primeira que casar, vence):
//   1. Conversa em atendimento HUMANO → a Luna fica calada; a mensagem só
//      aparece no painel de Atendimento.
//   2. Número que ainda não é de ninguém → procura código de vínculo; senão,
//      ensina a vincular (e oferece falar com a equipe).
//   3. Botão tocado → ação do botão.
//   4. Foto → pergunta "refeição ou evolução?" ANTES de qualquer IA. Foto de
//      corpo nunca vai pra IA. Áudio → transcreve; se for comida, registra.
//   5. Texto → comandos de SISTEMA por dicionário (PARAR, atendente, saúde →
//      Nutri Luciana, comando exato tipo "macros"): custa zero. Todo o resto
//      vai pra CONVERSA (conversa.js): o modelo lê o histórico e o contexto,
//      responde como gente e chama ações de uma lista fechada (23/09).
//
// Regras do projeto que valem aqui: a anamnese clínica nunca é lida; restrição
// e alergia não são decididas por modelo (no WhatsApp a Luna nem sugere
// receita); todo uso de IA passa pelo teto da conta (services/limites.js).

import { getPool } from '../../db.js';
import { norm } from '../dashboard.js';
import { motivoClinico, agendarRascunho } from '../triagem.js';
import { RESPOSTA_SAUDE } from '../luna.js';
import { analisarPrato, transcrever, estruturarRefeicaoFalada, itensDoDiario } from '../refeicaoIA.js';
import { consumirTeto } from '../limites.js';
import { temAcesso, premiumObrigatorio } from '../billing.js';
import { comContextoDeUso } from '../uso.js';
import { montarDia, normalizarItens, SLOTS } from '../diario.js';
import { gravar, ler, apagar, urlDeLeitura, novaChaveWhatsapp, extensaoDe, r2Configurado } from '../r2.js';
import { dataBR, slotPelaHora, somarDias } from '../../utils/datas.js';
import { nomeDe, vocativo, saudacao, apelidoDoTexto } from '../../utils/nomes.js';
import { baixarMidia, marcarLida } from './api.js';
import { contatoPorWaId, mandar, entregarGuardadas, atualizarEstado, tentarVinculo, chamarEquipe, devolverPraLuna, janelaAberta } from './contatos.js';
import { entregarPendentes } from './avisos.js';
import { aceitarConvite, emailMascarado } from './convites.js';
import { planoDaLista, textosLista, dadosDaLista } from '../plano/listaCompras.js';
import { gerarPdfLista, nomeDoArquivo } from '../plano/listaPdf.js';
import { criarLink } from '../loginPorLink.js';
import { conversar, bonito } from './conversa.js';
import { PRATICA_POR_CODIGO } from '../plano/receitas.js';
import { perguntasAposFoto, refeicaoDoPlanoDe, aplicarPlano, itensComTroca, atualizarRegistro, pistasDaPaciente, guardarCorrecao, medidaDe, porcaoTexto, gramasDoTexto, itemEmGramas, membroDoPar } from './confirmacao.js';

const MEMBROS = (process.env.MEMBROS_URL || 'https://nutrilualves.com.br/membros').replace(/\/$/, '');
const ROTULO = { cafe: 'Café da manhã', lanche_manha: 'Lanche da manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da tarde', jantar: 'Jantar', ceia: 'Ceia' };
/**
 * Link da área de membros já LOGADO (link mágico de uso único, 10 min): o
 * número dela está vinculado, então o WhatsApp é canal autenticado. Só pra
 * contato com conta; sem conta, o link comum. Ver services/loginPorLink.js.
 */
async function linkLogado(contato, caminho = '/') {
  if (!contato?.user_id) return `${MEMBROS}${caminho}`;
  try { return await criarLink(contato.user_id, caminho); } catch (e) { console.warn('[whatsapp] link logado falhou:', e.message); return `${MEMBROS}${caminho}`; }
}
const uuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));
const n0 = (v) => Math.round(Number(v) || 0).toLocaleString('pt-BR');
const dataCurta = (iso) => new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace('.', '');

// ─── Textos fixos ─────────────────────────────────────────────────────────

const MENU = `Por aqui você pode:

📸 Mandar a *foto do prato*: eu registro a refeição pra você
🎙️ Mandar um *áudio* contando o que comeu
📊 Pedir *macros* pra ver como está o seu dia
🍽️ Perguntar *o que como hoje* (ou amanhã)
⚖️ Mandar *peso 72,4* pra registrar o peso
📚 Pedir *materiais* da Nutri Luciana
💬 Tirar dúvidas comigo, a Luna
👩‍⚕️ Escrever *dúvida pra nutri* pra falar com a Nutri Luciana
🙋 Escrever *atendente* pra falar com uma pessoa do time`;

const COMO_VINCULAR = `Oi! Aqui é o WhatsApp do *Nutri Lu* 🌿

Ainda não sei de quem é este número. Se você já é paciente, é rapidinho:
1. Entra na área de membros: ${MEMBROS}/perfil
2. Toca em *Vincular WhatsApp*
3. Manda pra cá o código que aparecer

Se preferir falar com uma pessoa da equipe, toca no botão.`;

// ─── Entrada ──────────────────────────────────────────────────────────────

/** Executor do tipo 'mensagem'. `msg` é o objeto cru da Meta. */
export async function processarMensagem({ waId, mensagemId, msg }) {
  const contato = await contatoPorWaId(waId);
  if (!contato) return;
  // Reação e figurinha não pedem resposta de ninguém.
  if (msg.type === 'reaction' || msg.type === 'sticker') return;

  // Ela escreveu = a janela abriu: sai o que estava guardado esperando por isso
  // (resposta da Nutri Luciana, plano pronto, mensagem do time), em qualquer modo.
  const entregues = contato.user_id ? await entregarPendentes(contato) : await entregarGuardadas(contato);

  if (contato.atendimento === 'humano') return emAtendimentoHumano(contato, msg, mensagemId);
  if (!contato.user_id) return semVinculo(contato, msg);

  const acao = msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id || null;
  if (acao) return tratarBotao(contato, acao, msg);
  if (msg.type === 'button') { if (!entregues) await mandar(contato, { texto: `Não achei nada novo por aqui. 😊\n\n${MENU}` }); return; }
  if (msg.type === 'image') return receberFoto(contato, msg, mensagemId);
  if (msg.type === 'audio') return receberAudio(contato, msg, mensagemId);
  if (msg.type === 'text') return tratarTexto(contato, String(msg.text?.body || '').trim(), { msg, entregues });
  await mandar(contato, { texto: 'Por aqui eu entendo *texto*, *foto* e *áudio*. Vídeo e arquivo ainda não. 🙏' });
}

/** Quando as tentativas da fila acabam: a pessoa não fica no vácuo. */
export async function avisarFalha({ waId }) {
  const contato = await contatoPorWaId(waId);
  if (contato && contato.atendimento !== 'humano' && janelaAberta(contato)) {
    await mandar(contato, { texto: 'Tive um problema pra processar a sua última mensagem. 😕 Pode mandar de novo? Se continuar, escreve *atendente* que alguém do time te ajuda.' }, { autor: 'sistema' });
  }
}

// ─── 1. Atendimento humano ────────────────────────────────────────────────

async function emAtendimentoHumano(contato, msg, mensagemId) {
  if (msg.type === 'text' && ['luna', 'voltar pra luna', 'voltar para luna', 'falar com a luna'].includes(norm(msg.text?.body).trim())) {
    await devolverPraLuna(contato);
    await mandar(contato, { texto: 'Voltei! 😊 Aqui é a Luna de novo. Se precisar do time outra vez, é só escrever *atendente*.' });
    return;
  }
  // Número ainda sem dona que manda o código no meio da conversa com a equipe: vincula e segue com a Luna.
  if (!contato.user_id && msg.type === 'text' && (await tentarVinculo(contato, msg.text?.body)).ok) {
    await devolverPraLuna(contato);
    return boasVindas(contato);
  }
  // Foto, áudio e PDF mandados pro time (comprovante, print do erro) ficam guardados pro painel.
  const midia = msg.image || msg.audio || msg.document;
  if (midia?.id && r2Configurado()) await guardarMidia(contato, midia.id, mensagemId).catch((e) => console.warn('[whatsapp] mídia do atendimento não guardada:', e.message));
}

async function guardarMidia(contato, mediaId, mensagemId) {
  const { buffer, mime } = await baixarMidia(mediaId);
  if (!extensaoDe(mime)) throw Object.assign(new Error(`tipo não aceito: ${mime}`), { code: 'TIPO' });
  const key = novaChaveWhatsapp(contato.user_id || `wa/${contato.id}`, mime);
  await gravar(key, buffer, mime);
  await getPool().query(`UPDATE whatsapp_mensagens SET media_key = $2, media_mime = $3 WHERE id = $1`, [mensagemId, key, mime]);
  return { key, mime, buffer };
}

// ─── 2. Número sem vínculo ────────────────────────────────────────────────

async function semVinculo(contato, msg) {
  const acao = msg.interactive?.button_reply?.id;
  if (acao === 'humano:comercial') {
    await chamarEquipe(contato, 'comercial');
    await mandar(contato, { texto: 'Combinado! Chamei a equipe do Nutri Lu. 🙋 Pode escrever a sua dúvida aqui que alguém te responde em horário comercial.' }, { autor: 'sistema' });
    return;
  }
  if (msg.type === 'text') {
    const r = await tentarVinculo(contato, msg.text?.body);
    if (r.ok) return boasVindas(contato);
    if (r.motivo === 'bloqueado') { await mandar(contato, { texto: 'Foram muitos códigos errados seguidos. 🔒 Espera uma hora e gera um código novo em Perfil → Vincular WhatsApp.' }, { autor: 'sistema' }); return; }
    if (r.motivo === 'invalido') { await mandar(contato, { texto: `Esse código não está valendo (ele dura 30 minutos e só funciona uma vez). Gera outro em ${MEMBROS}/perfil e me manda. 😊` }, { autor: 'sistema' }); return; }
  }
  // Veio da compra na Hotmart: o número que recebeu o convite RESPONDEU (tocou
  // em "Começar" ou escreveu qualquer coisa). É a resposta vinda desse número
  // que vincula; o telefone do checkout sozinho, não.
  const compra = await aceitarConvite(contato);
  if (compra) return boasVindas(contato, compra);
  // Instrução no máximo a cada 10 min: bot respondendo bot não vira conversa infinita.
  const ultima = contato.estado?.instrucao_em ? new Date(contato.estado.instrucao_em).getTime() : 0;
  if (Date.now() - ultima < 10 * 60 * 1000) return;
  await atualizarEstado(contato, { instrucao_em: new Date().toISOString() });
  await mandar(contato, { texto: COMO_VINCULAR, botoes: [{ id: 'humano:comercial', titulo: 'Falar com a equipe' }] }, { autor: 'sistema' });
}

/** `compra` vem de aceitarConvite(): ela chegou pelo convite da Hotmart e pode nem ter entrado na área de membros ainda. */
async function boasVindas(contato, compra = null) {
  const { rows: [u] } = await getPool().query(`SELECT apelido, display_name FROM users WHERE id = $1`, [contato.user_id]);
  // O nome da compra na Hotmart é chute: vem "MARIA DA SILVA", vem o nome de
  // quem pagou. Por isso a gente USA ele aqui e, na mesma mensagem, PERGUNTA
  // se pode chamar ela assim (um toque, sem digitar). Se ela não responder,
  // seguimos com esse nome mesmo: a pergunta nunca segura o onboarding.
  const nome = nomeDe({ ...u, nome: compra?.nome, nome_perfil: contato.nome_perfil });
  const jaConfirmado = Boolean(nomeDe({ apelido: u?.apelido }));
  const perguntarNome = !jaConfirmado;
  // A abertura pós-compra é o TEXTO DO RAPHAEL (aprovado em 21/09): o fato na
  // conta dela + a Luna se apresentando. A frase "não sou nutricionista" fica
  // porque é regra do projeto — a Luna nunca se apresenta sem ela.
  const apresentacao = '\n\nMas antes deixa eu me apresentar: eu sou a *Luna*, a sua assistente aqui no WhatsApp. É por aqui que você recebe o seu plano, tira dúvidas e fala com a equipe. Não sou nutricionista — o que for de saúde eu passo pra Nutri Luciana.';
  const primeira = compra
    ? `${saudacao(nome)} Seu acesso ao acompanhamento da *Nutri Luciana* está confirmado! 💚${apresentacao}`
    : `Pronto${vocativo(nome)}! ✅ Seu WhatsApp está ligado à sua conta do Nutri Lu.${apresentacao}`;

  if (perguntarNome && nome) {
    await mandar(contato, {
      texto: `${primeira}\n\nAntes de começar: posso te chamar de *${nome}*?`,
      botoes: [{ id: 'nome:ok', titulo: 'Pode sim' }, { id: 'nome:outro', titulo: 'Prefiro outro' }],
    }, { autor: 'sistema' });
  } else {
    await mandar(contato, { texto: primeira }, { autor: 'sistema' });
    // Sem nenhum nome utilizável (compra sem nome, perfil vazio): pergunta aberta.
    if (perguntarNome) {
      await atualizarEstado(contato, { aguardando: 'apelido' });
      await mandar(contato, { texto: 'Como você prefere que eu te chame? Pode mandar só o primeiro nome. 😊' }, { autor: 'sistema' });
    }
  }

  if (compra && !compra.cadastroFeito) {
    await mandar(contato, { texto: `*Seu primeiro passo* 👇\n\n1. Toca aqui pra entrar na área de membros (já entra logada, sem senha): ${await linkLogado(contato, '/comecar')}\n2. Responde o questionário. Leva uns 10 minutos.\n\nCom as suas respostas, a Nutri Luciana monta o seu plano alimentar, e eu te aviso por aqui assim que ele ficar pronto.\n\n_Se o link vencer (vale 10 minutos), entra em ${MEMBROS} com o e-mail da compra (${emailMascarado(compra.email)})._` }, { autor: 'sistema' });
  }
  await mandar(contato, { texto: `${MENU}\n\nTudo que você registrar aqui aparece na área de membros, em Meu plano.\n\n_Avisos importantes (plano pronto, resposta da Nutri Luciana) chegam por aqui. Pra não receber, manda PARAR._` }, { autor: 'sistema' });
  await entregarPendentes(contato);
}

/** Guarda como ela quer ser chamada. `display_name` (o nome da compra) fica intocado. */
async function guardarApelido(contato, nome) {
  await getPool().query(`UPDATE users SET apelido = $2 WHERE id = $1`, [contato.user_id, nome]);
  await atualizarEstado(contato, { aguardando: null });
}

/**
 * O nome que a Luna usa nas frases fixas. Uma consulta curta, só onde o nome
 * muda alguma coisa: abertura de conversa, elogio e notícia ruim. Confirmação
 * de um toque ("Feito! ✅") NÃO leva nome — repetir soa disparo automático.
 */
async function nomeDoContato(contato) {
  const { rows: [u] } = await getPool().query(`SELECT apelido, display_name FROM users WHERE id = $1`, [contato.user_id]);
  return nomeDe({ ...u, nome_perfil: contato.nome_perfil });
}

// ─── 3. Botões ────────────────────────────────────────────────────────────

async function tratarBotao(contato, acao, msg) {
  const [tipo, a, b] = String(acao).split(':');
  if (tipo === 'foto' && uuid(b)) return a === 'e' ? guardarEvolucao(contato, b) : registrarFoto(contato, b, { msg });
  if (tipo === 'slot' && uuid(a)) {
    return mandar(contato, { texto: 'Em qual refeição eu coloco?', lista: { botao: 'Escolher refeição', titulo: 'Refeições', itens: SLOTS.map((s) => ({ id: `slotset:${a}:${s}`, titulo: ROTULO[s] })) } });
  }
  if (tipo === 'slotset' && uuid(a) && SLOTS.includes(b)) {
    const { rowCount } = await getPool().query(`UPDATE meal_entries SET slot = $3 WHERE id = $1 AND user_id = $2`, [a, contato.user_id, b]);
    return mandar(contato, { texto: rowCount ? `Feito! Passei pra *${ROTULO[b]}*. ✅` : 'Não achei mais esse registro. Ele pode ter sido apagado.' });
  }
  if (tipo === 'del' && uuid(a)) {
    const { rows } = await getPool().query(`DELETE FROM meal_entries WHERE id = $1 AND user_id = $2 RETURNING photo_key`, [a, contato.user_id]);
    if (rows[0]?.photo_key) apagar(rows[0].photo_key).catch(() => {});
    return mandar(contato, { texto: rows[0] ? 'Apaguei o registro. 🗑️' : 'Esse registro já não existe.' });
  }
  if (tipo === 'nutri') {
    const pergunta = contato.estado?.pergunta_pendente;
    await atualizarEstado(contato, { pergunta_pendente: null });
    if (a !== 'enviar') return mandar(contato, { texto: 'Tudo bem, não enviei. 😊' });
    if (!pergunta) return mandar(contato, { texto: 'Não achei mais a pergunta. Escreve *dúvida pra nutri* e manda de novo, por favor.' });
    return enviarPraLuciana(contato, pergunta);
  }
  if (tipo === 'nome') {
    if (a === 'ok') {
      // Confirmar grava o nome que ela viu na tela: a partir daqui é escolha
      // dela, não chute da Hotmart, e vale também na área de membros.
      const { rows: [u] } = await getPool().query(`SELECT apelido, display_name FROM users WHERE id = $1`, [contato.user_id]);
      const nome = nomeDe({ ...u, nome_perfil: contato.nome_perfil });
      if (nome) await guardarApelido(contato, nome);
      return mandar(contato, { texto: `Combinado${vocativo(nome)}! 😊` }, { autor: 'sistema' });
    }
    await atualizarEstado(contato, { aguardando: 'apelido' });
    return mandar(contato, { texto: 'Claro! Como você prefere que eu te chame? Pode mandar só o primeiro nome. 😊' }, { autor: 'sistema' });
  }
  if (tipo === 'humano') return irPraEquipe(contato, a === 'comercial' ? 'comercial' : 'suporte');
  if (tipo === 'lista' && a === 'geral') return perguntarLista(contato, b || null);
  if (tipo === 'lista' && ['web', 'pdf', 'chat', 'dia'].includes(a)) return entregarLista(contato, a, b || null);
  if (tipo === 'mat' && uuid(a)) return mandarMaterial(contato, a);
  // Confirmação da foto (25/09): porção contra o plano, e ingrediente em dúvida.
  if (tipo === 'plano' && uuid(a) && ['menos', 'igual', 'mais'].includes(b)) return ajustarPeloPlano(contato, a, b);
  if (tipo === 'ing' && uuid(a)) { const [, , idx, slug] = String(acao).split(':'); return confirmarIngrediente(contato, a, Number(idx), slug); }
  await mandar(contato, { texto: `Esse botão não vale mais. 😊\n\n${MENU}` });
}

async function irPraEquipe(contato, fila) {
  await chamarEquipe(contato, fila);
  await mandar(contato, { texto: 'Chamei uma pessoa do time do Nutri Lu. 🙋 Escreve aqui o que você precisa: a resposta chega por este mesmo chat, em horário comercial.\n\nEnquanto isso eu fico quietinha. Pra voltar a falar comigo, escreve *luna*.' }, { autor: 'sistema' });
}

async function enviarPraLuciana(contato, pergunta) {
  const texto = String(pergunta).trim().slice(0, 2000);
  if (texto.length < 3) return mandar(contato, { texto: 'A pergunta ficou curta demais. Escreve de novo com um pouco mais de detalhe? 😊' });
  const { rows } = await getPool().query(
    `INSERT INTO lu_messages (user_id, kind, author, text) VALUES ($1, 'pergunta', 'cliente', $2) RETURNING id`, [contato.user_id, texto]);
  // A mesma triagem da web: saúde vai direto pra ela; o resto chega com rascunho.
  agendarRascunho(rows[0].id);
  await mandar(contato, { texto: 'Enviei pra *Nutri Luciana*. ✅ Ela responde pessoalmente, em até 2 dias úteis, e a resposta chega por aqui e na área de membros.' }, { autor: 'sistema', clinico: true });
}

// ─── 4. Foto e áudio ──────────────────────────────────────────────────────

/** Pode gastar IA agora? Mesma regra das rotas HTTP: acesso (se a trava estiver ligada) e teto da conta. */
async function podeUsarIA(contato, recurso) {
  // Notícia ruim leva o nome: é onde ele faz diferença de verdade.
  if (premiumObrigatorio() && !(await temAcesso(contato.user_id)).acesso) {
    const quem = await nomeDoContato(contato);
    await mandar(contato, { texto: `${quem ? `${quem}, seu` : 'Seu'} acesso ao acompanhamento não está ativo, então não consigo registrar por aqui. Dá uma olhada em ${await linkLogado(contato, '/perfil')} ou escreve *atendente* que o time te ajuda.` }, { autor: 'sistema' });
    return false;
  }
  const t = await consumirTeto(recurso, contato.user_id);
  if (t.ok) return true;
  const quem = await nomeDoContato(contato);
  await mandar(contato, { texto: t.motivo === 'dia' ? `${quem ? `${quem}, você` : 'Você'} chegou no limite de hoje (${t.limite}) pra esse tipo de registro. Amanhã libera de novo. 🙏 Na área de membros dá pra registrar pela tabela de alimentos.` : `${quem ? `${quem}, você` : 'Você'} chegou no limite deste mês (${t.limite}). Na área de membros dá pra registrar pela tabela de alimentos.` }, { autor: 'sistema' });
  return false;
}

const RE_EVOLUCAO = /\b(evolucao|antes|depois|espelho|corpo|shape|progresso|medidas?)\b/;
const RE_REFEICAO = /\b(cafe|almoco|almocei|jantar|jantei|janta|lanche|lanchei|ceia|comi|comendo|prato|refeicao|marmita)\b/;
const slotDaLegenda = (t) => (/\bcafe\b/.test(t) ? 'cafe' : /\balmoc/.test(t) ? 'almoco' : /\bjant/.test(t) ? 'jantar' : /\bceia\b/.test(t) ? 'ceia' : /\blanch/.test(t) ? (/\bmanha\b/.test(t) ? 'lanche_manha' : 'lanche_tarde') : null);

async function receberFoto(contato, msg, mensagemId) {
  if (!r2Configurado()) return mandar(contato, { texto: 'O registro por foto ainda não está ligado por aqui. Por enquanto, registra pela área de membros. 🙏' }, { autor: 'sistema' });
  try {
    await guardarMidia(contato, msg.image.id, mensagemId);
  } catch (e) {
    if (e.code === 'MIDIA_GRANDE' || e.code === 'TIPO') return mandar(contato, { texto: 'Não consegui abrir essa imagem. Manda como *foto* (não como arquivo), por favor. 📸' });
    throw e;
  }
  // A legenda decide por DICIONÁRIO quando deixa claro. Na dúvida, pergunta:
  // foto de corpo nunca pode cair na IA de comida por engano.
  const legenda = norm(msg.image?.caption || '');
  if (RE_EVOLUCAO.test(legenda)) return guardarEvolucao(contato, mensagemId);
  if (RE_REFEICAO.test(legenda)) return registrarFoto(contato, mensagemId, { msg, slot: slotDaLegenda(legenda) });
  await mandar(contato, { texto: 'Recebi a foto! 📸 Ela é de quê?', botoes: [{ id: `foto:r:${mensagemId}`, titulo: '🍽️ Refeição' }, { id: `foto:e:${mensagemId}`, titulo: '🪞 Evolução' }] });
}

/** Trava contra toque duplo no botão: a foto só é processada uma vez. */
async function pegarFoto(contato, mensagemId) {
  const { rows } = await getPool().query(
    `UPDATE whatsapp_mensagens SET status = 'processada'
      WHERE id = $1 AND contato_id = $2 AND direcao = 'in' AND media_key IS NOT NULL AND status = 'recebida'
      RETURNING media_key, media_mime, criado_em, texto`, [mensagemId, contato.id]);
  if (!rows[0]) return null;
  // A legenda ficou gravada como "[foto] legenda": vira pista pra IA.
  return { ...rows[0], legenda: String(rows[0].texto || '').replace(/^\[foto\]\s*/, '').trim() };
}

async function registrarFoto(contato, mensagemId, { msg, slot } = {}) {
  const foto = await pegarFoto(contato, mensagemId);
  if (!foto) return mandar(contato, { texto: 'Essa foto eu já registrei (ou ela não está mais disponível). Se quiser, manda de novo. 😊' });
  try {
    if (!(await podeUsarIA(contato, 'foto-ia'))) {
      await getPool().query(`UPDATE whatsapp_mensagens SET status = 'recebida' WHERE id = $1`, [mensagemId]);
      return;
    }
    await marcarLida(msg?.id, true);
    const buffer = await ler(foto.media_key);
    // Pistas: a legenda ("almoço: arroz, frango e abóbora") e o que ela já
    // corrigiu em fotos anteriores. Valem mais que a impressão visual.
    const pistas = [];
    if (foto.legenda) pistas.push(`Legenda da foto: "${foto.legenda.slice(0, 160)}"`);
    pistas.push(...await pistasDaPaciente(contato.user_id));
    const analise = await comContextoDeUso({ rota: '/whatsapp/foto', userId: contato.user_id }, () =>
      analisarPrato(`data:${foto.media_mime || 'image/jpeg'};base64,${buffer.toString('base64')}`, { pistas }));
    const itensIA = itensDoDiario(analise.items);
    if (!itensIA.length) {
      return mandar(contato, { texto: 'Não consegui identificar comida nessa foto. 🤔 Tenta outra, de cima e com o prato inteiro aparecendo. Se era foto de evolução, manda de novo e escolhe *Evolução*.' });
    }
    const quando = new Date(foto.criado_em);
    const entry = await gravarRefeicao(contato.user_id, { quando, slot: slot || slotPelaHora(quando), itens: itensIA, photoKey: foto.media_key, confidence: analise.confidence, nota: 'foto pelo WhatsApp' });
    await confirmarRegistro(contato, entry, analise.confidence === 'low');
    await perguntarSePrecisar(contato, entry, analise.confidence);
  } catch (e) {
    // Devolve a foto pra "recebida": a nova tentativa da fila precisa achá-la.
    await getPool().query(`UPDATE whatsapp_mensagens SET status = 'recebida' WHERE id = $1`, [mensagemId]).catch(() => {});
    throw e;
  }
}

async function guardarEvolucao(contato, mensagemId) {
  const foto = await pegarFoto(contato, mensagemId);
  if (!foto) return mandar(contato, { texto: 'Essa foto eu já guardei. 😊' });
  await getPool().query(`INSERT INTO progress_photos (user_id, date, photo_key) VALUES ($1, $2, $3)`, [contato.user_id, dataBR(new Date(foto.criado_em)), foto.media_key]);
  // Foto de corpo: não passa por IA nenhuma, e sai da visão do time de suporte.
  await getPool().query(`UPDATE whatsapp_mensagens SET clinico = TRUE WHERE id = $1`, [mensagemId]);
  await mandar(contato, { texto: `Guardei na sua *Evolução*. 🪞 Só você e a Nutri Luciana veem essa foto.\n\nQuer registrar o peso de hoje também? Manda, por exemplo: *peso 72,4*` }, { autor: 'sistema', clinico: true });
}

async function gravarRefeicao(userId, { quando, slot, itens, photoKey, confidence, nota }) {
  const { itens: limpos, tot } = normalizarItens(itens);
  const { rows } = await getPool().query(
    `INSERT INTO meal_entries (user_id, date, slot, source, items, kcal, p, c, f, photo_key, confidence, note, logged_at)
     VALUES ($1, $2, $3, 'whatsapp', $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, date, slot, items, kcal, p, c, f`,
    [userId, dataBR(quando), slot, JSON.stringify(limpos), tot.kcal, tot.p, tot.c, tot.f, photoKey || null, confidence || null, nota || null, quando]);
  return rows[0];
}

/** "Dia: 1.240 de 1.600 kcal (faltam 360)": a linha que fecha toda mensagem de registro. */
async function linhaDoDia(userId, date) {
  const dia = await montarDia(userId, date);
  const meta = dia.targets?.kcal;
  return meta ? `Dia: ${n0(dia.consumido.kcal)} de ${n0(meta)} kcal${meta > dia.consumido.kcal ? ` (faltam ${n0(meta - dia.consumido.kcal)})` : ' ✅'}` : `Dia até agora: ${n0(dia.consumido.kcal)} kcal`;
}

// Padrão de mensagem "registro" (23/09): título curto, um item por linha com
// porção e kcal, totais numa linha, e o dia numa linha. Sem repetir rótulo.
// A porção sai nos DOIS jeitos ("2 colheres de servir · 120 g"): quem pesa
// confere pelas gramas, quem não pesa se acha pela colher; e a correção
// pode vir em qualquer um dos dois (25/09).
const DICA_CORRIGIR = '_Se algo estiver diferente, me diz em medida caseira ou em gramas (tipo "eram 3 colheres de arroz" ou "o arroz eram 150 g") que eu corrijo._';
async function confirmarRegistro(contato, entry, poucaConfianca) {
  const itens = entry.items.map((i) => { const m = porcaoTexto(i); return `• ${bonito(i.name)}${m ? `, ${m}` : ''} · ${n0(i.kcal)} kcal`; }).join('\n');
  await mandar(contato, {
    texto: `*${ROTULO[entry.slot]} registrado* ✅\n${itens}\n\n*${n0(entry.kcal)} kcal* · P ${n0(entry.p)} · C ${n0(entry.c)} · G ${n0(entry.f)}\n${await linhaDoDia(contato.user_id, entry.date)}${poucaConfianca ? `\n\n${DICA_CORRIGIR}` : ''}`,
    botoes: [{ id: `slot:${entry.id}`, titulo: 'Mudar refeição' }, { id: `del:${entry.id}`, titulo: 'Apagar' }],
  });
}

const ARTIGO = { ceia: 'a' };
const artigoDe = (slot) => ARTIGO[slot] || 'o';

/**
 * Depois do registro pela foto: UMA pergunta, só quando há sinal (ver
 * confirmacao.js). Silêncio dela = está certo; o registro já existe.
 */
async function perguntarSePrecisar(contato, entry, confidence) {
  const refeicaoDoPlano = await refeicaoDoPlanoDe(contato.user_id, entry.date, entry.slot);
  const q = perguntasAposFoto({ itens: entry.items, confidence, refeicaoDoPlano, kcal: Number(entry.kcal) });
  if (q.ingrediente) {
    const { idx, par, atual } = q.ingrediente;
    const este = par[atual], outro = par[atual === 'a' ? 'b' : 'a'];
    return mandar(contato, {
      texto: `Só confirma uma coisa: isso é *${este.nome.toLowerCase()}* ou *${outro.nome.toLowerCase()}*?`,
      botoes: [{ id: `ing:${entry.id}:${idx}:${este.slug}`, titulo: este.nome }, { id: `ing:${entry.id}:${idx}:${outro.slug}`, titulo: outro.nome }],
    });
  }
  if (q.plano) {
    const m = q.plano.meal;
    const quando = entry.date === dataBR() ? 'de hoje' : `de ${dataCurta(entry.date)}`;
    return mandar(contato, {
      texto: `No plano, ${artigoDe(entry.slot)} ${ROTULO[entry.slot].toLowerCase()} ${quando} era *${bonito(m.name)}* (${n0(m.kcal)} kcal). Pela foto ficou ${q.plano.direcao} disso. Se foi o do plano, me diz quanto:\n\n_Ou me escreve a quantidade, em medida caseira ou em gramas._`,
      botoes: [{ id: `plano:${entry.id}:menos`, titulo: 'Menos que o plano' }, { id: `plano:${entry.id}:igual`, titulo: 'Igual ao plano' }, { id: `plano:${entry.id}:mais`, titulo: 'Mais que o plano' }],
    });
  }
}

async function registroDela(contato, entryId) {
  const { rows } = await getPool().query(`SELECT id, date, slot, items, kcal FROM meal_entries WHERE id = $1 AND user_id = $2`, [entryId, contato.user_id]);
  return rows[0] || null;
}

/** Botão "menos / igual / mais que o plano". */
async function ajustarPeloPlano(contato, entryId, escolha) {
  const e = await registroDela(contato, entryId);
  if (!e) return mandar(contato, { texto: 'Não achei mais esse registro. Ele pode ter sido apagado.' });
  const meal = await refeicaoDoPlanoDe(contato.user_id, e.date, e.slot);
  if (!meal) return mandar(contato, { texto: 'Não achei essa refeição no plano, então deixei o registro como estava. 😊' });
  const novo = await atualizarRegistro(e.id, contato.user_id, aplicarPlano(meal, escolha, e.items), `ajustado pelo plano (${escolha})`);
  const frase = escolha === 'igual' ? 'Ajustei pelo plano' : escolha === 'mais' ? 'Ajustei: um pouco mais que o plano' : 'Ajustei: um pouco menos que o plano';
  await mandar(contato, { texto: `${frase}: *${n0(novo.kcal)} kcal*. ✅\n${await linhaDoDia(contato.user_id, novo.date)}` }, { autor: 'sistema' });
}

/** Botão "abóbora / batata-doce": troca o ingrediente e recalcula pelas gramas. */
async function confirmarIngrediente(contato, entryId, idx, slug) {
  const membro = membroDoPar(slug);
  const e = await registroDela(contato, entryId);
  if (!membro || !e) return mandar(contato, { texto: 'Não achei mais esse registro. Ele pode ter sido apagado.' });
  const antes = e.items[idx];
  if (!antes) return mandar(contato, { texto: 'Não achei mais esse item no registro.' });
  if (membro.re.test(norm(antes.name))) return mandar(contato, { texto: 'Fechou, era isso mesmo. ✅' }, { autor: 'sistema' });
  const novo = await atualizarRegistro(e.id, contato.user_id, itensComTroca(e.items, idx, membro), `ingrediente confirmado: ${membro.nome}`);
  await guardarCorrecao(contato.user_id, { tipo: 'nome', item: antes.name, de: antes.name, para: membro.nome });
  const it = novo.items[idx];
  const m = porcaoTexto(it);
  await mandar(contato, { texto: `Troquei pra *${membro.nome.toLowerCase()}*${m ? `, ${m}` : ''} · ${n0(it.kcal)} kcal. ${ROTULO[novo.slot]} agora: *${n0(novo.kcal)} kcal*. ✅` }, { autor: 'sistema' });
}

/**
 * Correção por texto, vinda da conversa ("eram 3 colheres de arroz", "era
 * batata-doce, não abóbora"). Age no último registro dela (até 8 h atrás).
 * Nome novo de um par conhecido recalcula pela tabela; fora do par, ou
 * porção nova, a IA de texto (a mesma do áudio) estima as gramas e os macros.
 */
async function corrigirUltimaRefeicao(contato, { item, novo_nome, quantidade } = {}) {
  const { rows: [e] } = await getPool().query(
    `SELECT id, date, slot, items, kcal FROM meal_entries WHERE user_id = $1 AND logged_at > NOW() - interval '8 hours' ORDER BY logged_at DESC LIMIT 1`, [contato.user_id]);
  if (!e) return mandar(contato, { texto: 'Não achei um registro recente pra corrigir. Manda a foto de novo, ou me conta o que comeu que eu registro.' });
  const alvo = norm(item || '');
  let idx = alvo ? e.items.findIndex((i) => norm(i.name).includes(alvo) || alvo.includes(norm(i.name))) : -1;
  if (idx < 0 && alvo) {
    const palavras = alvo.split(' ').filter((w) => w.length > 3);
    idx = e.items.findIndex((i) => palavras.some((w) => norm(i.name).includes(w)));
  }
  if (idx < 0 && e.items.length === 1) idx = 0;
  if (idx < 0) return mandar(contato, { texto: `Não achei "${item}" no último registro (${e.items.map((i) => bonito(i.name)).join(', ')}). Qual deles você quer corrigir?` });
  const antes = e.items[idx];
  const itens = e.items.map((i) => ({ ...i }));
  const nomeNovo = String(novo_nome || '').trim().slice(0, 80);
  const qtd = String(quantidade || '').trim().slice(0, 60);
  if (!nomeNovo && !qtd) return mandar(contato, { texto: `O que eu corrijo em ${bonito(antes.name)}: a quantidade ou o alimento?` });

  if (nomeNovo) {
    const membro = membroDoPar(nomeNovo);
    if (membro && Number(antes.grams) > 0) itens[idx] = itensComTroca(itens, idx, membro)[idx];
    else {
      const r = await comContextoDeUso({ rota: '/whatsapp/chat', userId: contato.user_id }, () => estruturarRefeicaoFalada(`${qtd ? `${qtd} de ` : Number(antes.grams) > 0 ? `${Math.round(antes.grams)} g de ` : ''}${nomeNovo}`));
      const it0 = itensDoDiario(r.items)[0];
      if (!it0) return mandar(contato, { texto: `Não consegui entender "${nomeNovo}". Me diz de outro jeito?` });
      itens[idx] = { ...antes, name: it0.name, ...(qtd ? { grams: it0.grams, portion: it0.portion, medida: qtd } : {}), kcal: it0.kcal, p: it0.p, c: it0.c, f: it0.f };
    }
  }
  if (qtd && !(nomeNovo && !membroDoPar(nomeNovo))) {
    // Em GRAMAS ("150 g") a conta é direta, sem IA: mesma comida, outra
    // gramatura, macros na proporção. Em medida caseira a IA de texto estima.
    const gramas = gramasDoTexto(qtd);
    const direto = gramas ? itemEmGramas(itens[idx], gramas) : null;
    if (direto) itens[idx] = direto;
    else {
      const r = await comContextoDeUso({ rota: '/whatsapp/chat', userId: contato.user_id }, () => estruturarRefeicaoFalada(`${qtd} de ${itens[idx].name}`));
      const it0 = itensDoDiario(r.items)[0];
      if (!it0 || !(it0.grams > 0)) return mandar(contato, { texto: `Não consegui entender a quantidade "${qtd}". Me diz de outro jeito, tipo "3 colheres de servir" ou "150 g"?` });
      itens[idx] = { ...itens[idx], grams: it0.grams, portion: it0.portion, ...(gramas ? {} : { medida: qtd }), kcal: it0.kcal, p: it0.p, c: it0.c, f: it0.f };
      if (gramas) delete itens[idx].medida;
    }
  }
  const novo = await atualizarRegistro(e.id, contato.user_id, itens, `corrigido: ${[nomeNovo, qtd].filter(Boolean).join(', ')}`);
  await guardarCorrecao(contato.user_id, nomeNovo
    ? { tipo: 'nome', item: antes.name, de: antes.name, para: itens[idx].name }
    : { tipo: 'porcao', item: antes.name, de: medidaDe(antes), para: qtd });
  const it = novo.items[idx];
  const m = porcaoTexto(it);
  await mandar(contato, { texto: `Corrigi: ${bonito(it.name)}${m ? `, ${m}` : ''} · ${n0(it.kcal)} kcal. ${ROTULO[novo.slot]} agora: *${n0(novo.kcal)} kcal*. ✅\n${await linhaDoDia(contato.user_id, novo.date)}` }, { autor: 'sistema' });
}

/** Refeição contada em TEXTO ("comi 2 ovos e um pão"): a mesma IA do áudio estrutura os itens. */
async function registrarRefeicaoTexto(contato, descricao, slot) {
  const dito = String(descricao || '').trim();
  if (!dito) return;
  const r = await comContextoDeUso({ rota: '/whatsapp/chat', userId: contato.user_id }, () => estruturarRefeicaoFalada(dito));
  // Água não é refeição: se só sobrou água, é o copo do dia (registrar_agua).
  const itens = itensDoDiario(r.items).filter((i) => !/^[áa]gua\b/i.test(i.name));
  if (!itens.length) {
    const ml = /(\d{2,4})\s*ml/i.exec(dito);
    if (ml) return registrarAgua(contato, Number(ml[1]));
    return mandar(contato, { texto: 'Não consegui montar a refeição com isso. Me conta de novo com as quantidades? Ex.: "2 ovos mexidos e um pão francês".' });
  }
  const quando = new Date();
  const entry = await gravarRefeicao(contato.user_id, { quando, slot: (SLOTS.includes(slot) && slot) || SLOT_DA_VOZ[r.mealType] || slotPelaHora(quando), itens, confidence: r.confidence, nota: `texto pelo WhatsApp: ${dito}`.slice(0, 500) });
  await confirmarRegistro(contato, entry, r.confidence === 'low');
}

const SLOT_DA_VOZ = { breakfast: 'cafe', lunch: 'almoco', dinner: 'jantar' };

async function receberAudio(contato, msg, mensagemId) {
  if (!(await podeUsarIA(contato, 'voz'))) return;
  await marcarLida(msg.id, true);
  let midia;
  try { midia = await baixarMidia(msg.audio.id); }
  catch (e) { if (e.code === 'MIDIA_GRANDE') return mandar(contato, { texto: 'Esse áudio ficou grande demais. Manda um mais curtinho, só com o que você comeu. 🎙️' }); throw e; }
  const ext = extensaoDe(midia.mime) || 'ogg';
  const dito = await comContextoDeUso({ rota: '/whatsapp/audio', userId: contato.user_id }, () => transcrever(midia.buffer, ext));
  if (!dito) return mandar(contato, { texto: 'Não consegui entender o áudio. 😕 Tenta de novo, falando mais perto do microfone?' });
  // O histórico guarda o que foi DITO (o áudio em si não é guardado), com a marca de saúde recalculada.
  await getPool().query(`UPDATE whatsapp_mensagens SET texto = $2, clinico = $3 WHERE id = $1`, [mensagemId, `[áudio] ${dito}`.slice(0, 4000), motivoClinico(dito) !== null]);
  // Saúde não vai pra modelo nenhum, nem pro que estrutura refeição.
  if (motivoClinico(dito)) return tratarTexto(contato, dito, { msg });
  const r = await comContextoDeUso({ rota: '/whatsapp/audio', userId: contato.user_id }, () => estruturarRefeicaoFalada(dito));
  const itens = itensDoDiario(r.items);
  // Áudio que não fala de comida é uma pergunta falada: segue como texto.
  if (!itens.length) return tratarTexto(contato, dito, { msg });
  const quando = Number(msg.timestamp) > 0 ? new Date(Number(msg.timestamp) * 1000) : new Date();
  const entry = await gravarRefeicao(contato.user_id, { quando, slot: SLOT_DA_VOZ[r.mealType] || slotPelaHora(quando), itens, confidence: r.confidence, nota: `áudio pelo WhatsApp: ${dito}`.slice(0, 500) });
  await confirmarRegistro(contato, entry, r.confidence === 'low');
}

// ─── 5. Texto: dicionário antes de IA ─────────────────────────────────────

const SAUDACOES = new Set(['oi', 'oii', 'oie', 'ola', 'opa', 'bom dia', 'boa tarde', 'boa noite', 'menu', 'ajuda', 'help', 'inicio', 'comecar', 'oi luna', 'ola luna']);
const RE_PESO = /^(?:(?:meu )?peso|pesei|pesando|to com|estou com)\D{0,6}(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|kilos?|quilos?)?$|^(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|kilos?|quilos?)$/;
const RE_ATENDENTE =/\b(atendente|atendimento humano|humano|suporte)\b|falar com (alguem|uma pessoa|a equipe|o time|gente)/;
const RE_FINANCEIRO = /\b(reembolso|estorno|cobranca|cobrado|cobraram|pagamento|boleto|fatura|nota fiscal|hotmart)\b|cancelar (a |o |minha |meu )?(assinatura|compra|plano|acompanhamento)|nao consigo (entrar|acessar|logar)/;
const RE_NUTRI = /^(quero |preciso |posso )?(falar|mandar|enviar|fazer|tirar)?\s*(uma |minha )?(duvida|pergunta|mensagem|recado)?\s*(com|pra|para|a|pro)?\s*(a )?(nutri|nutricionista|luciana|dra\.? luciana|lu)( luciana)?$/;
// Como ela quer ser chamada: "meu nome é Mari", "pode me chamar de Mari".
// O "de" é obrigatório no "chama de" de propósito — sem ele, "me chama o
// atendente" viraria um pedido de apelido (e RE_ATENDENTE nunca rodaria).
const RE_NOME = /^(o )?(meu )?(nome|apelido)( e| eh)?\b|^(pode |podes )?(me )?cham(a|ar) de\b|^prefiro (ser chamada )?de\b/;
const PARAR = new Set(['parar', 'pare', 'sair', 'stop', 'cancelar avisos', 'parar avisos', 'nao quero receber']);
const VOLTAR_AVISOS = new Set(['avisos', 'voltar avisos', 'ativar avisos', 'quero avisos']);

async function tratarTexto(contato, texto, { msg, entregues = 0 } = {}) {
  if (!texto) return;
  const t = norm(texto).replace(/[!?.,;]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Ela está respondendo ao "como prefere que eu te chame?". Limpa o estado
  // ANTES de tratar (como o pergunta_nutri logo abaixo): a pergunta do nome
  // vale UMA resposta, não fica armada esperando a próxima mensagem. Comando
  // de sistema (PARAR, cancelar, saudação) vence: senão "PARAR" vira apelido.
  if (contato.estado?.aguardando === 'apelido') {
    await atualizarEstado(contato, { aguardando: null });
    const comando = PARAR.has(t) || VOLTAR_AVISOS.has(t) || SAUDACOES.has(t) || t === 'cancelar' || t === 'deixa';
    const nome = comando ? null : apelidoDoTexto(texto);
    if (nome) {
      await guardarApelido(contato, nome);
      return mandar(contato, { texto: `Perfeito, ${nome}! 😊 É assim que eu te chamo daqui pra frente. Pra trocar depois, é só escrever *meu nome é ...*` }, { autor: 'sistema' });
    }
    // Resposta curta que não virou nome ("M4ri!!"): ela tentou; avisa uma vez
    // só. Insistir num nome é pior do que seguir com o da compra.
    // Frase inteira ("quanto de proteína comi hoje?") não era resposta ao
    // nome: cai pro fluxo normal, que responde a pergunta dela.
    if (!comando && t.split(' ').length <= 2) {
      await mandar(contato, { texto: 'Não consegui entender o nome. 😅 Por enquanto sigo com o que está no seu cadastro — quando quiser, escreve *meu nome é ...* que eu troco na hora.' }, { autor: 'sistema' });
      return;
    }
  }

  // A pessoa está respondendo ao "escreve a pergunta que eu mando pra Nutri Luciana".
  if (contato.estado?.aguardando === 'pergunta_nutri') {
    await atualizarEstado(contato, { aguardando: null });
    if (t === 'cancelar' || t === 'deixa' || t === 'deixa pra la') return mandar(contato, { texto: 'Tudo bem, cancelei. 😊' });
    return enviarPraLuciana(contato, texto);
  }

  if (PARAR.has(t)) {
    await getPool().query(`UPDATE whatsapp_contatos SET opt_out_em = NOW() WHERE id = $1`, [contato.id]);
    return mandar(contato, { texto: 'Pronto: não mando mais avisos por aqui. ✅ Você continua podendo falar comigo e registrar as refeições quando quiser. Pra voltar a receber, manda *AVISOS*.' }, { autor: 'sistema' });
  }
  if (VOLTAR_AVISOS.has(t)) {
    await getPool().query(`UPDATE whatsapp_contatos SET opt_out_em = NULL WHERE id = $1`, [contato.id]);
    return mandar(contato, { texto: 'Avisos ligados de novo. ✅' }, { autor: 'sistema' });
  }
  // "menu" e "ajuda" mostram o que dá pra fazer. Cumprimento ("oi", "bom
  // dia") vai pra conversa: a Luna responde como gente, não despeja menu.
  if (t === 'menu' || t === 'ajuda' || t === 'help') { await mandar(contato, { texto: MENU }); return; }
  if (SAUDACOES.has(t) && entregues) return; // acabou de receber o que estava guardado: não empilha um "oi" em cima

  const curto = t.split(' ').length <= 10;
  // "meu nome é Mari" / "pode me chamar de Mari", a qualquer momento.
  if (curto && RE_NOME.test(t) && !RE_ATENDENTE.test(t)) {
    const nome = apelidoDoTexto(texto);
    if (nome) {
      await guardarApelido(contato, nome);
      return mandar(contato, { texto: `Anotado, ${nome}! 😊 É assim que eu te chamo daqui pra frente.` }, { autor: 'sistema' });
    }
    await atualizarEstado(contato, { aguardando: 'apelido' });
    return mandar(contato, { texto: 'Como você prefere que eu te chame? Pode mandar só o primeiro nome. 😊' }, { autor: 'sistema' });
  }
  if (RE_ATENDENTE.test(t) && curto) return irPraEquipe(contato, 'suporte');
  if (RE_FINANCEIRO.test(t)) {
    return mandar(contato, { texto: 'Isso é com o nosso time de suporte (pagamento, acesso e cadastro). Quer que eu chame uma pessoa pra te ajudar?', botoes: [{ id: 'humano:suporte', titulo: 'Chamar o suporte' }] });
  }
  if (RE_NUTRI.test(t)) {
    await atualizarEstado(contato, { aguardando: 'pergunta_nutri' });
    return mandar(contato, { texto: 'Claro! Escreve a sua pergunta na próxima mensagem que eu mando pra *Nutri Luciana*. Ela responde pessoalmente, em até 2 dias úteis.\n\n_Se for algo do dia a dia (trocar um ingrediente, como registrar, o que tem no plano), eu respondo na hora: é só perguntar. Pra desistir, escreve cancelar._' });
  }
  // Saúde: por DICIONÁRIO, antes de qualquer modelo. A Luna não responde o mérito.
  if (motivoClinico(texto)) {
    await atualizarEstado(contato, { pergunta_pendente: texto.slice(0, 2000) });
    return mandar(contato, { texto: RESPOSTA_SAUDE, botoes: [{ id: 'nutri:enviar', titulo: 'Mandar pra nutri' }, { id: 'nutri:nao', titulo: 'Não precisa' }] }, { clinico: true });
  }
  // Comando EXATO ("macros", "peso 72,4", "o que como hoje", "lista de
  // compras", "materiais") continua por dicionário: custa zero e responde na
  // hora. Qualquer variação ("quanto já comi?", "87", "tô com 90 hoje") vai
  // pra conversa, que entende pelo contexto e chama a mesma ação.
  const peso = curto ? RE_PESO.exec(norm(texto).replace(/[!?]+/g, '').replace(/\s+/g, ' ').trim().replace(/(\d),(\d)/, '$1.$2')) : null;
  if (peso && /\b(peso|pesei|kg|kilos?|quilos?)\b/.test(t)) return registrarPeso(contato, Number(peso[1] || peso[2]));
  if (t === 'macros' || t === 'resumo do dia' || t === 'meu dia') return resumoDoDia(contato);
  if (/^(o que (eu )?como (hoje|amanha|agora)|(meu )?(plano|cardapio)( de (hoje|amanha))?)$/.test(t)) return planoDoDia(contato, /\bamanha\b/.test(t) ? 1 : 0, /\bagora\b/.test(t));
  if (/^(materiais?|videos|pdfs?)$/.test(t)) return listarMateriais(contato);
  if (/^lista( de compras)?$/.test(t)) return perguntarLista(contato);
  if (t === 'lista do dia' || t === 'lista de compras do dia') return entregarLista(contato, 'dia');

  return conversarComLuna(contato, texto, msg);
}

/** "lista de compras": a da semana que vem de sexta a domingo, senão a desta semana. Sem IA. */
const SEM_PLANO_LISTA = 'A lista de compras nasce do plano da semana, e o seu ainda não está publicado. Assim que a Nutri Luciana publicar, eu monto pra você. 😊';
const faixaCurta = (ws) => `${ws.slice(8, 10)}/${ws.slice(5, 7)} a ${somarDias(ws, 6).slice(8, 10)}/${somarDias(ws, 6).slice(5, 7)}`;

/**
 * "lista de compras" (ou o botão "Mandar a lista" do aviso de plano pronto):
 * a Luna pergunta o formato (fluxo do Raphael, 22/09). O mesmo conteúdo, três
 * jeitos: marcar no celular (página /lista da área de membros), PDF pra
 * imprimir, ou o texto aqui no chat. Ela escolhe um; se quiser outro, toca de
 * novo. Tudo dentro da janela: sem modelo, R$ 0.
 */
async function perguntarLista(contato, weekStart = null) {
  const { plano, proxima } = await planoDaLista(contato.user_id, weekStart);
  if (!plano) return mandar(contato, { texto: SEM_PLANO_LISTA }, { autor: 'sistema' });
  const ws = plano.week_start;
  await mandar(contato, {
    texto: `Lista de compras da semana de ${faixaCurta(ws)} pronta! 🛒${proxima ? '\n(Como já é fim de semana, é a da *semana que vem*.)' : ''}\n\nComo você prefere?`,
    botoes: [
      { id: `lista:web:${ws}`, titulo: 'Marcar no celular' },
      { id: `lista:pdf:${ws}`, titulo: 'PDF pra imprimir' },
      { id: `lista:chat:${ws}`, titulo: 'Ver aqui no chat' },
    ],
  }, { autor: 'sistema' });
}

/** Entrega no formato escolhido: web (link), pdf (arquivo), chat (texto geral) ou dia (texto dia a dia). */
async function entregarLista(contato, formato, weekStart = null) {
  const { plano, proxima } = await planoDaLista(contato.user_id, weekStart);
  if (!plano) return mandar(contato, { texto: SEM_PLANO_LISTA }, { autor: 'sistema' });
  const ws = plano.week_start;
  if (formato === 'web') {
    return mandar(contato, { texto: `Aqui está a sua lista pra marcar no mercado (já abre logada):\n${await linkLogado(contato, `/lista?ws=${ws}`)}\n\nToca no item pra riscar; as marcações ficam salvas no seu celular. 😉` }, { autor: 'sistema' });
  }
  const nome = await nomeDoContato(contato);
  if (formato === 'pdf') {
    // A folha com a marca, igual à da área de membros: gera no servidor, guarda
    // no R2 e a Meta baixa pela URL assinada. Sem R2 ou com falha, vai o texto
    // — ela não fica sem lista.
    if (r2Configurado()) {
      try {
        const pdf = await gerarPdfLista(dadosDaLista(plano, null, { proxima, nome }));
        const key = `${contato.user_id}/listas/${ws}.pdf`;
        await gravar(key, pdf, 'application/pdf');
        return mandar(contato, { texto: 'Sua lista em PDF, pra imprimir ou guardar. 🛒', documento: { link: await urlDeLeitura(key), nome: nomeDoArquivo(ws) } }, { autor: 'sistema' });
      } catch (e) { console.error('[lista] PDF não saiu:', e.message); }
    }
    await mandar(contato, { texto: 'Não consegui gerar o PDF agora. 😕 Vai o texto da lista, e daqui a pouco você tenta o PDF de novo.' }, { autor: 'sistema' });
    formato = 'chat';
  }
  const modo = formato === 'dia' ? 'dia' : 'geral';
  const partes = textosLista(plano, modo, nome);
  if (proxima && modo === 'geral') partes[0] = `Como já é fim de semana, essa é a lista da *semana que vem*. 😉\n\n${partes[0]}`;
  for (const [i, texto] of partes.entries()) {
    const ultima = i === partes.length - 1;
    await mandar(contato, ultima && modo === 'geral'
      ? { texto, botoes: [{ id: `lista:dia:${ws}`, titulo: 'Ver por dia' }] }
      : { texto }, { autor: 'sistema' });
  }
}

async function registrarPeso(contato, kg) {
  if (!Number.isFinite(kg) || kg < 20 || kg > 400) return mandar(contato, { texto: 'Esse número não parece um peso em kg. Manda de novo, tipo *72,4*?' });
  const hoje = dataBR();
  const { rows: [antes] } = await getPool().query(`SELECT kg FROM weight_log WHERE user_id = $1 AND date < $2 ORDER BY date DESC LIMIT 1`, [contato.user_id, hoje]);
  await getPool().query(
    `INSERT INTO weight_log (user_id, date, kg) VALUES ($1, $2, $3) ON CONFLICT (user_id, date) DO UPDATE SET kg = EXCLUDED.kg`, [contato.user_id, hoje, kg]);
  const dif = antes ? kg - Number(antes.kg) : null;
  const f = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const variacao = dif != null && Math.abs(dif) >= 0.1 ? ` ${dif < 0 ? '⬇️' : '⬆️'} ${f(Math.abs(dif))} kg desde o último.` : '';
  await mandar(contato, { texto: `Anotado: *${f(kg)} kg*.${variacao}` }, { autor: 'sistema' });
}

/**
 * "Tomei a creatina" → marca o suplemento PRESCRITO de hoje (mesma tabela do
 * botão da área de membros). Suplemento é parte do plano da nutri (25/09):
 * a Luna conhece a lista; só não acrescenta nem muda dose.
 */
async function marcarSuplemento(contato, nome, tomado = true) {
  const hoje = dataBR();
  const { rows } = await getPool().query(`SELECT id, name FROM supplements WHERE user_id = $1 AND active ORDER BY sort`, [contato.user_id]);
  if (!rows.length) return mandar(contato, { texto: 'Você não tem suplemento cadastrado no plano. Se a Nutri Luciana te passou algum, escreve *dúvida pra nutri* que ela inclui.' }, { autor: 'sistema' });
  const alvo = norm(nome || '');
  const s = rows.find((r) => norm(r.name).includes(alvo) || alvo.includes(norm(r.name))) || (rows.length === 1 ? rows[0] : null);
  if (!s) return mandar(contato, { texto: `Qual deles? No seu plano tem: ${rows.map((r) => r.name).join(', ')}.` }, { autor: 'sistema' });
  if (tomado) await getPool().query(`INSERT INTO supplement_intake (user_id, date, supplement_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [contato.user_id, hoje, s.id]);
  else await getPool().query(`DELETE FROM supplement_intake WHERE user_id = $1 AND date = $2 AND supplement_id = $3`, [contato.user_id, hoje, s.id]);
  const { rows: [pend] } = await getPool().query(
    `SELECT COUNT(*)::int AS n FROM supplements s WHERE s.user_id = $1 AND s.active
        AND NOT EXISTS (SELECT 1 FROM supplement_intake i WHERE i.user_id = s.user_id AND i.supplement_id = s.id AND i.date = $2)`, [contato.user_id, hoje]);
  await mandar(contato, { texto: tomado
    ? `Marquei *${s.name}* de hoje. ✅${pend.n ? ` Falta${pend.n > 1 ? 'm' : ''} ${pend.n} hoje.` : ' Suplementos do dia completos.'}`
    : `Desmarquei *${s.name}* de hoje.` }, { autor: 'sistema' });
}

/** "Anota 500 ml de água" → soma no copo do dia (mesma tabela do botão da área de membros). Água nunca vira refeição. */
async function registrarAgua(contato, ml) {
  if (!Number.isFinite(ml) || ml <= 0 || ml > 5000) return mandar(contato, { texto: 'Quanto de água? Manda em ml, tipo *500 ml*.' }, { autor: 'sistema' });
  const hoje = dataBR();
  const { rows: [r] } = await getPool().query(
    `INSERT INTO water_log (user_id, date, ml) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET ml = water_log.ml + $3, updated_at = NOW() RETURNING ml`, [contato.user_id, hoje, Math.round(ml)]);
  const dia = await montarDia(contato.user_id, hoje);
  const meta = dia.targets?.water_ml;
  await mandar(contato, { texto: `Anotei *${n0(ml)} ml* de água. 💧 Hoje: ${n0(r.ml)} ml${meta ? ` de ${n0(meta)}${r.ml >= meta ? ' ✅' : ` (faltam ${n0(meta - r.ml)})`}` : ''}.` }, { autor: 'sistema' });
}

async function resumoDoDia(contato) {
  const hoje = dataBR();
  const dia = await montarDia(contato.user_id, hoje);
  const t = dia.targets || {}; const c = dia.consumido;
  // Sem plano publicado, a conta é contra a faixa provisória do onboarding (e
  // sai em faixa também: ninguém escolhe um número dentro dela).
  const est = !t.kcal && dia.estimativa?.kcal ? dia.estimativa : null;
  const chave = { Calorias: 'kcal', Proteína: 'p', Carboidrato: 'c', Gordura: 'f' };
  const linha = (rotulo, v, meta, un) => {
    if (meta) return `${rotulo}: *${n0(v)}* de ${n0(meta)} ${un}${meta > v ? ` · faltam ${n0(meta - v)}` : ' ✅'}`;
    const f = est?.[chave[rotulo]];
    if (!f) return `${rotulo}: *${n0(v)}* ${un}`;
    const [lo, hi] = f;
    const resto = v < lo ? ` · faltam ${n0(lo - v)} a ${n0(hi - v)}` : v <= hi ? ` · na faixa, até ${n0(hi - v)} a mais` : ' · passou da faixa';
    return `${rotulo}: *${n0(v)}* de ${n0(lo)} a ${n0(hi)} ${un}${resto}`;
  };
  const feitas = [...new Set(dia.entries.map((e) => ROTULO[e.slot]))];
  const referencia = est ? '\n\n_Faixa provisória do cadastro, até a Nutri Luciana publicar o plano._' : '';
  await mandar(contato, {
    texto: `*Seu dia até agora* · ${dataCurta(hoje)}\n${linha('Calorias', c.kcal, t.kcal, 'kcal')}\n${linha('Proteína', c.p, t.p, 'g')}\n${linha('Carboidrato', c.c, t.c, 'g')}\n${linha('Gordura', c.f, t.f, 'g')}\nÁgua: ${n0(dia.water_ml)} ml${t.water_ml ? ` de ${n0(t.water_ml)}` : ''}\n\n${feitas.length ? `Registrado: ${feitas.join(', ')}.` : 'Nada registrado ainda. Manda a foto do próximo prato que eu registro.'}${referencia}`,
  }, { autor: 'sistema' });
}

/** `apenas`: só estas refeições (ex.: o que ainda falta no dia). */
async function planoDoDia(contato, maisDias, soAgora, apenas = null) {
  const data = somarDias(dataBR(), maisDias);
  const dia = await montarDia(contato.user_id, data);
  let refeicoes = dia.plano?.dia?.meals || [];
  if (!refeicoes.length) {
    return mandar(contato, { texto: dia.plano ? `Não há refeições no plano pra ${maisDias ? 'amanhã' : 'hoje'}.` : `A Nutri Luciana ainda não publicou o plano ${maisDias ? 'dessa semana' : 'desta semana'}. Assim que sair, eu te aviso por aqui. 😊` }, { autor: 'sistema' });
  }
  // "Parcial" se mede contra o dia INTEIRO: à noite, "o que falta?" com só o
  // jantar no filtro continua sendo "Ainda falta", não "Plano de hoje".
  const noDia = refeicoes.length;
  if (soAgora && !maisDias) { const s = slotPelaHora(); refeicoes = refeicoes.filter((m) => m.slot === s).length ? refeicoes.filter((m) => m.slot === s) : refeicoes; }
  const filtro = Array.isArray(apenas) ? apenas.filter((s) => SLOTS.includes(s)) : [];
  const parcial = filtro.length > 0 && filtro.length < noDia;
  if (filtro.length) refeicoes = refeicoes.filter((m) => filtro.includes(m.slot));
  if (!refeicoes.length) return mandar(contato, { texto: 'Não achei essas refeições no plano de hoje.' }, { autor: 'sistema' });
  // Padrão "plano do dia" (23/09): uma linha por refeição. Os itens só
  // aparecem quando são mais de um ou diferentes do nome (uma receita só
  // repetia o próprio nome logo abaixo).
  const EMOJI = { cafe: '☕', lanche_manha: '🍎', almoco: '🍽️', lanche_tarde: '🥪', jantar: '🌙', ceia: '🍵' };
  const blocos = refeicoes.map((m) => {
    const itens = (m.items || []);
    const soEla = itens.length === 1 && norm(itens[0].name) === norm(m.name);
    const porcao = soEla && itens[0].portion ? ` · ${itens[0].portion}` : '';
    const lista = soEla ? '' : itens.slice(0, 8).map((i) => `\n   • ${bonito(i.name)}${i.portion ? `, ${i.portion}` : ''}`).join('');
    return `${EMOJI[m.slot] || '•'} *${m.time || ROTULO[m.slot]}* ${bonito(m.name)} · ${n0(m.kcal)} kcal${porcao}${m.trocada ? ' _(trocada)_' : ''}${lista}${m.subs ? `\n   _Pode trocar por: ${m.subs}_` : ''}`;
  });
  await mandar(contato, { texto: `*${parcial ? 'Ainda falta' : `Plano de ${maisDias ? 'amanhã' : 'hoje'}`}* · ${dataCurta(data)}\n\n${blocos.join('\n')}\n\nQuer o modo de preparo de alguma? É só pedir. Trocar ou ver a lista: ${await linkLogado(contato, '/plano')}` }, { autor: 'sistema' });
}

/**
 * A receita inteira aqui no chat (pedido do Raphael, 23/09: ninguém cozinha
 * com a plataforma aberta). Acha pelo código ou pela refeição do plano de
 * hoje; manda ingredientes e modo de preparo. Só do livro PR, que é de onde
 * o plano sai; o livro da nutri (NL) fica na área de membros.
 */
async function mandarReceita(contato, { code, refeicao, dia } = {}) {
  let codigo = code ? String(code).toUpperCase().trim() : null;
  let refeicaoDoPlano = null;
  if (!codigo || refeicao) {
    const data = somarDias(dataBR(), dia === 'amanha' ? 1 : 0);
    const d = await montarDia(contato.user_id, data);
    const meals = d.plano?.dia?.meals || [];
    const slot = SLOTS.includes(refeicao) ? refeicao : slotPelaHora();
    refeicaoDoPlano = meals.find((m) => m.slot === slot) || null;
    if (!codigo) codigo = refeicaoDoPlano?.code || refeicaoDoPlano?.items?.find((i) => i.code)?.code || null;
  }
  const r = codigo ? PRATICA_POR_CODIGO.get(codigo) : null;
  if (!r) {
    return mandar(contato, { texto: refeicaoDoPlano ? `Essa refeição (${bonito(refeicaoDoPlano.name)}) não é uma receita do livro, então não tem modo de preparo pra mandar.` : 'Não achei essa receita no plano. Me diz qual refeição (café, almoço, jantar…) ou o nome dela?' }, { autor: 'sistema' });
  }
  const porcoes = refeicaoDoPlano?.items?.find((i) => i.code === r.id)?.portion;
  const ingredientes = (r.ingredients || []).map((i) => `• ${i.name}${i.quantity ? ` · ${String(i.quantity).replace('.', ',')} ${i.unit || ''}`.trimEnd() : ''}`).join('\n');
  const passos = (r.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
  const cabeca = `*${bonito(r.name)}*\n${[r.time && r.time !== '—' ? r.time.replace('min', ' min') : null, `rende ${r.servings} ${r.servings === 1 ? 'porção' : 'porções'}`, `${n0(r.macros.kcal)} kcal por porção`].filter(Boolean).join(' · ')}${porcoes ? `\n_No seu plano: ${porcoes}._` : ''}`;
  const ressalvas = (r.ressalvas || []).length ? `\n\n_${r.ressalvas.join(' ')}_` : '';
  const texto = `${cabeca}\n\n*Ingredientes*\n${ingredientes}\n\n*Modo de preparo*\n${passos || 'Sem modo de preparo cadastrado: é montar e servir.'}${ressalvas}`;
  // O WhatsApp corta em 4.096 caracteres: receita longa vai em duas.
  const partes = [];
  for (let s = texto; s.length; ) {
    if (s.length <= 3800) { partes.push(s); break; }
    const corte = s.lastIndexOf('\n', 3800);
    partes.push(s.slice(0, corte)); s = s.slice(corte + 1);
  }
  for (const p of partes) await mandar(contato, { texto: p }, { autor: 'sistema' });
}

async function listarMateriais(contato) {
  const { rows } = await getPool().query(`SELECT id, title, kind FROM materials WHERE active ORDER BY sort, created_at DESC LIMIT 10`);
  if (!rows.length) return mandar(contato, { texto: 'A Nutri Luciana ainda não publicou materiais. Quando sair algo novo, aparece em Materiais, na área de membros. 📚' }, { autor: 'sistema' });
  await mandar(contato, {
    texto: `Esses são os materiais mais recentes da Nutri Luciana. 📚 Escolhe um que eu te mando.\n\nTodos ficam em ${await linkLogado(contato, '/materiais')}`,
    lista: { botao: 'Ver materiais', titulo: 'Materiais', itens: rows.map((m) => ({ id: `mat:${m.id}`, titulo: m.title, descricao: m.kind === 'pdf' ? 'PDF' : 'Vídeo' })) },
  }, { autor: 'sistema' });
}

async function mandarMaterial(contato, id) {
  const { rows: [m] } = await getPool().query(`SELECT title, kind, url, file_key FROM materials WHERE id = $1 AND active`, [id]);
  if (!m) return mandar(contato, { texto: 'Esse material não está mais disponível.' }, { autor: 'sistema' });
  // PDF guardado no R2 vai como ARQUIVO (a Meta baixa pela URL assinada). Vídeo
  // vai como link: o WhatsApp não aceita vídeo acima de 16 MB.
  if (m.kind === 'pdf' && m.file_key && r2Configurado()) {
    return mandar(contato, { texto: m.title, documento: { link: await urlDeLeitura(m.file_key), nome: `${m.title}.pdf` } }, { autor: 'sistema' });
  }
  await mandar(contato, { texto: `*${m.title}*\n${m.url || await linkLogado(contato, '/materiais')}` }, { autor: 'sistema' });
}

/**
 * A conversa de verdade (conversa.js): o modelo responde e escolhe ações;
 * cada ação abaixo é uma função já existente deste arquivo. Lista FECHADA.
 */
async function conversarComLuna(contato, texto, msg) {
  if (!(await podeUsarIA(contato, 'chat-lu'))) return;
  await marcarLida(msg?.id, true);
  const acoes = {
    registrar_peso: ({ kg }) => registrarPeso(contato, Number(String(kg).replace(',', '.'))),
    registrar_refeicao: ({ descricao, refeicao }) => registrarRefeicaoTexto(contato, descricao, refeicao),
    corrigir_refeicao: (args) => corrigirUltimaRefeicao(contato, args || {}),
    resumo_do_dia: () => resumoDoDia(contato),
    plano_do_dia: ({ dia, so_agora, refeicoes }) => planoDoDia(contato, dia === 'amanha' ? 1 : 0, so_agora === true, Array.isArray(refeicoes) ? refeicoes : null),
    receita: (args) => mandarReceita(contato, args || {}),
    lista_de_compras: () => perguntarLista(contato),
    materiais: () => listarMateriais(contato),
    mandar_para_nutri: async ({ pergunta }) => {
      // A pessoa confirma com um toque: nada vai pra Luciana sem ela querer.
      await atualizarEstado(contato, { pergunta_pendente: String(pergunta || texto).slice(0, 2000) });
      await mandar(contato, { texto: 'Quer que eu mande essa pergunta pra Nutri Luciana? Ela responde em até 2 dias úteis.', botoes: [{ id: 'nutri:enviar', titulo: 'Mandar pra nutri' }, { id: 'nutri:nao', titulo: 'Não precisa' }] });
    },
    chamar_atendente: () => irPraEquipe(contato, 'suporte'),
    marcar_suplemento: ({ nome, tomado }) => marcarSuplemento(contato, nome, tomado !== false),
    registrar_agua: ({ ml }) => registrarAgua(contato, Number(ml)),
    mudar_apelido: async ({ nome }) => {
      const limpo = apelidoDoTexto(String(nome || ''));
      if (!limpo) return mandar(contato, { texto: 'Não consegui entender o nome. Manda só o primeiro nome?' });
      await guardarApelido(contato, limpo);
      await mandar(contato, { texto: `Fechou, ${limpo}. É assim que eu te chamo daqui pra frente.` }, { autor: 'sistema' });
    },
  };
  await comContextoDeUso({ rota: '/whatsapp/chat', userId: contato.user_id }, () => conversar({ contato, texto, acoes, mandar }));
}
