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
//   5. Texto → DICIONÁRIO primeiro (macros, plano, peso, materiais, atendente,
//      PARAR…): custa zero e responde na hora. Saúde, por dicionário, vai pra
//      Nutri Luciana sem passar por modelo. Só o resto chega na Luna.
//
// Regras do projeto que valem aqui: a anamnese clínica nunca é lida; restrição
// e alergia não são decididas por modelo (no WhatsApp a Luna nem sugere
// receita); todo uso de IA passa pelo teto da conta (services/limites.js).

import { getPool } from '../../db.js';
import { norm } from '../dashboard.js';
import { motivoClinico, agendarRascunho } from '../triagem.js';
import { responderLuna, contextoDoServidor, RESPOSTA_SAUDE } from '../luna.js';
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

const MEMBROS = (process.env.MEMBROS_URL || 'https://nutrilualves.com.br/membros').replace(/\/$/, '');
const ROTULO = { cafe: 'Café da manhã', lanche_manha: 'Lanche da manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da tarde', jantar: 'Jantar', ceia: 'Ceia' };
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
    await mandar(contato, { texto: `*Seu primeiro passo* 👇\n\n1. Entra na área de membros: ${MEMBROS}\n2. Usa o e-mail da compra (${emailMascarado(compra.email)}). Eu mando um código de 6 números pra ele, sem senha.\n3. Responde o questionário. Leva uns 10 minutos.\n\nCom as suas respostas, a Nutri Luciana monta o seu plano alimentar, e eu te aviso por aqui assim que ele ficar pronto.` }, { autor: 'sistema' });
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
  if (tipo === 'lista' && ['geral', 'dia'].includes(a)) return enviarLista(contato, a, b || null);
  if (tipo === 'mat' && uuid(a)) return mandarMaterial(contato, a);
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
  await mandar(contato, { texto: 'Enviei pra *Nutri Luciana*. ✅ Ela responde pessoalmente, em até 1 dia útil, e a resposta chega por aqui e na área de membros.' }, { autor: 'sistema', clinico: true });
}

// ─── 4. Foto e áudio ──────────────────────────────────────────────────────

/** Pode gastar IA agora? Mesma regra das rotas HTTP: acesso (se a trava estiver ligada) e teto da conta. */
async function podeUsarIA(contato, recurso) {
  // Notícia ruim leva o nome: é onde ele faz diferença de verdade.
  if (premiumObrigatorio() && !(await temAcesso(contato.user_id)).acesso) {
    const quem = await nomeDoContato(contato);
    await mandar(contato, { texto: `${quem ? `${quem}, seu` : 'Seu'} acesso ao acompanhamento não está ativo, então não consigo registrar por aqui. Dá uma olhada em ${MEMBROS}/perfil ou escreve *atendente* que o time te ajuda.` }, { autor: 'sistema' });
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
      RETURNING media_key, media_mime, criado_em`, [mensagemId, contato.id]);
  return rows[0] || null;
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
    const analise = await comContextoDeUso({ rota: '/whatsapp/foto', userId: contato.user_id }, () =>
      analisarPrato(`data:${foto.media_mime || 'image/jpeg'};base64,${buffer.toString('base64')}`));
    const itensIA = itensDoDiario(analise.items);
    if (!itensIA.length) {
      return mandar(contato, { texto: 'Não consegui identificar comida nessa foto. 🤔 Tenta outra, de cima e com o prato inteiro aparecendo. Se era foto de evolução, manda de novo e escolhe *Evolução*.' });
    }
    const quando = new Date(foto.criado_em);
    const entry = await gravarRefeicao(contato.user_id, { quando, slot: slot || slotPelaHora(quando), itens: itensIA, photoKey: foto.media_key, confidence: analise.confidence, nota: 'foto pelo WhatsApp' });
    await confirmarRegistro(contato, entry, analise.confidence === 'low');
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

async function confirmarRegistro(contato, entry, poucaConfianca) {
  const dia = await montarDia(contato.user_id, entry.date);
  const itens = entry.items.map((i) => `• ${i.name}${i.portion ? ` (${i.portion})` : ''}: ${n0(i.kcal)} kcal`).join('\n');
  const meta = dia.targets?.kcal;
  const total = meta ? `Seu dia: *${n0(dia.consumido.kcal)}* de ${n0(meta)} kcal${meta > dia.consumido.kcal ? ` · faltam ${n0(meta - dia.consumido.kcal)}` : ''}` : `Seu dia até agora: *${n0(dia.consumido.kcal)} kcal*`;
  await mandar(contato, {
    texto: `Registrei no *${ROTULO[entry.slot]}*: ✅\n\n${itens}\n\n*${n0(entry.kcal)} kcal* · P ${n0(entry.p)} g · C ${n0(entry.c)} g · G ${n0(entry.f)} g\n\n${total}${poucaConfianca ? '\n\n_Essa estimativa saiu com pouca confiança. Dá pra ajustar as porções na área de membros, em Meu plano._' : ''}`,
    botoes: [{ id: `slot:${entry.id}`, titulo: 'Mudar refeição' }, { id: `del:${entry.id}`, titulo: 'Apagar' }],
  });
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
const RE_MACROS = /\bmacros?\b|quant[oa]s? (calorias? )?(ainda )?(ja )?(comi|consumi|falta|faltam|resta|restam|sobra|sobrou|posso (comer|consumir|ingerir)|consigo (comer|consumir))|(ainda )?(posso|consigo) (comer|consumir) quant|resumo d[oe] (dia|hoje)|como (esta|ta|anda) (o )?meu dia|meu dia/;
const RE_PLANO = /o que (eu )?(como|vou comer|tem|e|devo comer|posso comer) .{0,12}\b(hoje|amanha|agora)\b|\b(plano|cardapio|refeicoes|refeicao) (alimentar )?(de |do |da |pra |para )?(hoje|amanha|agora)\b|\b(cafe|almoco|jantar|janta|lanche|ceia) (da manha |da tarde )?(de |do |pra |para )?(hoje|amanha)\b|^(meu )?(plano|cardapio)$/;
const RE_PESO = /^(?:(?:meu )?peso|pesei|pesando|to com|estou com)\D{0,6}(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|kilos?|quilos?)?$|^(\d{2,3}(?:[.,]\d{1,2})?)\s*(?:kg|kilos?|quilos?)$/;
const RE_MATERIAIS = /^(quero |ver |me manda |manda |os |meus )*(materia(l|is)|pdfs?|apostilas?|videos?|aulas?|ebooks?)( da (nutri|luciana|lu))?$/;
const RE_LISTA = /lista (de |das |de compras|do mercado|da feira)|\bcompras\b|\bmercado\b|o que (eu )?(preciso|tenho que) comprar|ingredientes da semana/;
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
  if (SAUDACOES.has(t)) { if (!entregues) await mandar(contato, { texto: `Oi! 😊 Aqui é a Luna.\n\n${MENU}` }); return; }

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
    return mandar(contato, { texto: 'Claro! Escreve a sua pergunta na próxima mensagem que eu mando pra *Nutri Luciana*. Ela responde pessoalmente, em até 1 dia útil.\n\n_Se for algo do dia a dia (trocar um ingrediente, como registrar, o que tem no plano), eu respondo na hora: é só perguntar. Pra desistir, escreve cancelar._' });
  }
  // Saúde: por DICIONÁRIO, antes de qualquer modelo. A Luna não responde o mérito.
  if (motivoClinico(texto)) {
    await atualizarEstado(contato, { pergunta_pendente: texto.slice(0, 2000) });
    return mandar(contato, { texto: RESPOSTA_SAUDE, botoes: [{ id: 'nutri:enviar', titulo: 'Mandar pra nutri' }, { id: 'nutri:nao', titulo: 'Não precisa' }] }, { clinico: true });
  }
  // `t` perdeu vírgula e ponto (viraram espaço); o peso precisa deles.
  const peso = curto ? RE_PESO.exec(norm(texto).replace(/[!?]+/g, '').replace(/\s+/g, ' ').trim().replace(/(\d),(\d)/, '$1.$2')) : null;
  if (peso) return registrarPeso(contato, Number(peso[1] || peso[2]));
  if (curto && RE_MACROS.test(t)) return resumoDoDia(contato);
  if (curto && RE_PLANO.test(t)) return planoDoDia(contato, /\bamanha\b/.test(t) ? 1 : 0, /\bagora\b/.test(t));
  if (RE_MATERIAIS.test(t)) return listarMateriais(contato);
  if (curto && RE_LISTA.test(t)) return enviarLista(contato, /\bdia\b/.test(t) ? 'dia' : /refei/.test(t) ? 'refeicao' : 'geral');

  return conversarComLuna(contato, texto, msg);
}

/** "lista de compras": a da semana que vem de sexta a domingo, senão a desta semana. Sem IA. */
async function enviarLista(contato, modo = 'geral', weekStart = null) {
  const { plano, proxima } = await planoDaLista(contato.user_id, weekStart);
  if (!plano) return mandar(contato, { texto: 'A lista de compras nasce do plano da semana, e o seu ainda não está publicado. Assim que a Nutri Luciana publicar, eu monto pra você. 😊' }, { autor: 'sistema' });
  const nome = await nomeDoContato(contato);
  const partes = textosLista(plano, modo, nome);
  if (proxima && modo === 'geral') partes[0] = `Como já é fim de semana, essa é a lista da *semana que vem*. 😉\n\n${partes[0]}`;
  for (const [i, texto] of partes.entries()) {
    const ultima = i === partes.length - 1;
    await mandar(contato, ultima && modo === 'geral'
      ? { texto, botoes: [{ id: `lista:dia:${plano.week_start}`, titulo: 'Ver por dia' }] }
      : { texto }, { autor: 'sistema' });
  }
  // A lista geral vai também como PDF (a folha com a marca, igual à da área de
  // membros): gera no servidor, guarda no R2 e a Meta baixa pela URL assinada.
  // Se o PDF falhar, o texto já foi — ela não fica sem lista.
  if (modo === 'geral' && r2Configurado()) {
    try {
      const pdf = await gerarPdfLista(dadosDaLista(plano, null, { proxima, nome }));
      const key = `${contato.user_id}/listas/${plano.week_start}.pdf`;
      await gravar(key, pdf, 'application/pdf');
      await mandar(contato, { texto: 'A mesma lista em PDF, pra imprimir ou guardar. 🛒', documento: { link: await urlDeLeitura(key), nome: nomeDoArquivo(plano.week_start) } }, { autor: 'sistema' });
    } catch (e) { console.error('[lista] PDF não saiu:', e.message); }
  }
}

async function registrarPeso(contato, kg) {
  if (!Number.isFinite(kg) || kg < 20 || kg > 400) return mandar(contato, { texto: 'Não entendi esse peso. Manda assim: *peso 72,4*' });
  const hoje = dataBR();
  const { rows: [antes] } = await getPool().query(`SELECT kg FROM weight_log WHERE user_id = $1 AND date < $2 ORDER BY date DESC LIMIT 1`, [contato.user_id, hoje]);
  await getPool().query(
    `INSERT INTO weight_log (user_id, date, kg) VALUES ($1, $2, $3) ON CONFLICT (user_id, date) DO UPDATE SET kg = EXCLUDED.kg`, [contato.user_id, hoje, kg]);
  const dif = antes ? kg - Number(antes.kg) : null;
  const f = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  await mandar(contato, { texto: `Peso de hoje registrado: *${f(kg)} kg* ✅${dif != null && Math.abs(dif) >= 0.1 ? `\n${dif < 0 ? '⬇️' : '⬆️'} ${f(Math.abs(dif))} kg em relação ao último registro.` : ''}\n\nO gráfico está em Evolução, na área de membros.` }, { autor: 'sistema' });
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
  const referencia = est ? '\n\n_Faixa provisória, calculada no seu cadastro. Vale até a Nutri Luciana publicar o seu plano._' : '';
  await mandar(contato, {
    texto: `*Seu dia até agora* (${dataCurta(hoje)})\n\n🔥 ${linha('Calorias', c.kcal, t.kcal, 'kcal')}\n🥩 ${linha('Proteína', c.p, t.p, 'g')}\n🍚 ${linha('Carboidrato', c.c, t.c, 'g')}\n🥑 ${linha('Gordura', c.f, t.f, 'g')}\n💧 Água: ${n0(dia.water_ml)} ml${t.water_ml ? ` de ${n0(t.water_ml)}` : ''}\n\n${feitas.length ? `Registrado: ${feitas.join(' · ')}` : 'Nada registrado hoje ainda. Manda a foto do próximo prato que eu registro. 📸'}${referencia}`,
  }, { autor: 'sistema' });
}

async function planoDoDia(contato, maisDias, soAgora) {
  const data = somarDias(dataBR(), maisDias);
  const dia = await montarDia(contato.user_id, data);
  let refeicoes = dia.plano?.dia?.meals || [];
  if (!refeicoes.length) {
    return mandar(contato, { texto: dia.plano ? `Não há refeições no plano pra ${maisDias ? 'amanhã' : 'hoje'}.` : `A Nutri Luciana ainda não publicou o plano ${maisDias ? 'dessa semana' : 'desta semana'}. Assim que sair, eu te aviso por aqui. 😊` }, { autor: 'sistema' });
  }
  if (soAgora && !maisDias) { const s = slotPelaHora(); refeicoes = refeicoes.filter((m) => m.slot === s).length ? refeicoes.filter((m) => m.slot === s) : refeicoes; }
  const blocos = refeicoes.map((m) => {
    const itens = (m.items || []).slice(0, 8).map((i) => `   • ${i.name}${i.portion ? ` (${i.portion})` : ''}`).join('\n');
    return `*${ROTULO[m.slot] || m.slot}*${m.time ? ` · ${m.time}` : ''}\n${m.name} · ${n0(m.kcal)} kcal${m.trocada ? ' _(você trocou)_' : ''}${itens ? `\n${itens}` : ''}${m.subs ? `\n   _Pode trocar: ${m.subs}_` : ''}`;
  });
  await mandar(contato, { texto: `*Plano de ${maisDias ? 'amanhã' : 'hoje'}* (${dataCurta(data)})\n\n${blocos.join('\n\n')}\n\nPra trocar uma refeição ou ver a lista de compras: ${MEMBROS}/plano` }, { autor: 'sistema' });
}

async function listarMateriais(contato) {
  const { rows } = await getPool().query(`SELECT id, title, kind FROM materials WHERE active ORDER BY sort, created_at DESC LIMIT 10`);
  if (!rows.length) return mandar(contato, { texto: 'A Nutri Luciana ainda não publicou materiais. Quando sair algo novo, aparece em Materiais, na área de membros. 📚' }, { autor: 'sistema' });
  await mandar(contato, {
    texto: `Esses são os materiais mais recentes da Nutri Luciana. 📚 Escolhe um que eu te mando.\n\nTodos ficam em ${MEMBROS}/materiais`,
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
  await mandar(contato, { texto: `*${m.title}*\n${m.url || `${MEMBROS}/materiais`}` }, { autor: 'sistema' });
}

async function conversarComLuna(contato, texto, msg) {
  if (!(await podeUsarIA(contato, 'chat-lu'))) return;
  await marcarLida(msg?.id, true);
  // Memória curta: as últimas falas das últimas 3 horas, só texto, nada marcado como saúde.
  const { rows } = await getPool().query(
    `SELECT autor, texto FROM whatsapp_mensagens
      WHERE contato_id = $1 AND criado_em > NOW() - interval '3 hours' AND NOT clinico AND NOT sessao_humana
        AND autor IN ('cliente', 'luna') AND tipo IN ('text', 'interactive', 'audio') AND texto IS NOT NULL AND texto <> ''
      ORDER BY criado_em DESC LIMIT 9`, [contato.id]);
  const historico = rows.reverse().map((m) => ({ role: m.autor === 'luna' ? 'lu' : 'user', text: m.texto.replace(/^\[áudio\] /, '') }));
  // A mensagem de agora já está no histórico (o webhook gravou); áudio transcrito entra pelo UPDATE do texto.
  if (!historico.length || historico[historico.length - 1].role !== 'user') historico.push({ role: 'user', text: texto });

  const r = await comContextoDeUso({ rota: '/whatsapp/chat', userId: contato.user_id }, async () =>
    responderLuna({ messages: historico, context: await contextoDoServidor(contato.user_id, dataBR()), canal: 'whatsapp' }));
  if (r.encaminhar) {
    await atualizarEstado(contato, { pergunta_pendente: texto.slice(0, 2000) });
    return mandar(contato, { texto: r.reply || 'Essa é com a Nutri Luciana. Quer que eu mande a sua pergunta pra ela?', botoes: [{ id: 'nutri:enviar', titulo: 'Mandar pra nutri' }, { id: 'nutri:nao', titulo: 'Não precisa' }] });
  }
  await mandar(contato, { texto: r.reply || 'Não consegui pensar numa resposta agora. 😕 Pode perguntar de outro jeito?' });
}
