// Fila de trabalho do bot, no próprio Postgres.
//
// Por que existe: a Meta exige 200 rápido do webhook e REENVIA se não ouvir.
// Uma foto leva ~8 s de IA; no almoço, em 10 mil pacientes, chegam ~6 mil
// fotos em 2 horas. Se a IA rodasse dentro do webhook, o pico viraria timeout,
// reenvio e foto registrada em dobro. Aqui o webhook só GRAVA o trabalho; quem
// chama IA e Meta é este trabalhador, no ritmo que o servidor aguenta.
//
// Por que Postgres e não Redis/SQS: já existe, é transacional com o resto
// (mensagem e trabalho nascem juntos) e o volume é baixo pra um banco
// (~1 trabalho/s na média, ~10/s no pico). FOR UPDATE SKIP LOCKED deixa vários
// processos puxarem da mesma fila sem pegar o mesmo item.
//
// Ordem: trabalhos com a mesma `chave` (o contato) saem UM de cada vez, em
// ordem de chegada — "foto" e depois o toque no botão "é refeição" não podem
// inverter. Chaves diferentes correm em paralelo.

import { getPool } from '../../db.js';

const CONCORRENCIA = Math.max(1, Number(process.env.WHATSAPP_CONCORRENCIA) || 6);
const MAX_TENTATIVAS = 3;
const ESPERA_SEG = [10, 60]; // antes da 2ª e da 3ª tentativa
const TRAVA_MIN = 5;         // trabalho "processando" há mais que isso = processo morreu: volta pra fila

const executores = new Map();
let ativos = 0;
let puxando = false;
let ligado = false;

/** Quem sabe executar cada tipo de trabalho. `aoFalhar` roda quando as tentativas acabam. */
export function registrarExecutor(tipo, fn, aoFalhar) {
  executores.set(tipo, { fn, aoFalhar });
}

export async function enfileirar(tipo, chave, payload, { emSegundos = 0 } = {}) {
  await getPool().query(
    `INSERT INTO whatsapp_fila (tipo, chave, payload, disponivel_em) VALUES ($1, $2, $3, NOW() + ($4 || ' seconds')::interval)`,
    [tipo, chave, JSON.stringify(payload), String(emSegundos)]);
  acordar();
}

/** Puxa trabalho agora, sem esperar o próximo ciclo. */
export function acordar() {
  if (ligado) setImmediate(puxar);
}

async function puxar() {
  if (puxando || ativos >= CONCORRENCIA) return;
  puxando = true;
  try {
    // Elegível: pendente na hora, ou "processando" com a trava vencida. E só
    // se não houver trabalho MAIS ANTIGO da mesma chave ainda aberto.
    const { rows } = await getPool().query(
      `UPDATE whatsapp_fila f
          SET status = 'processando', tentativas = f.tentativas + 1, travado_ate = NOW() + ($2 || ' minutes')::interval
        WHERE f.id IN (
          SELECT c.id FROM whatsapp_fila c
           WHERE ((c.status = 'pendente' AND c.disponivel_em <= NOW()) OR (c.status = 'processando' AND c.travado_ate < NOW()))
             AND NOT EXISTS (SELECT 1 FROM whatsapp_fila o WHERE o.chave = c.chave AND o.id < c.id AND o.status IN ('pendente', 'processando'))
           ORDER BY c.id LIMIT $1 FOR UPDATE SKIP LOCKED)
        RETURNING f.*`,
      [CONCORRENCIA - ativos, String(TRAVA_MIN)]);
    for (const t of rows) executar(t);
  } catch (e) {
    console.error('[whatsapp:fila] falha ao puxar:', e.message);
  } finally { puxando = false; }
}

async function executar(t) {
  ativos += 1;
  const pool = getPool();
  const ex = executores.get(t.tipo);
  try {
    if (!ex) throw new Error(`sem executor pro tipo ${t.tipo}`);
    await ex.fn(t.payload, t);
    await pool.query(`UPDATE whatsapp_fila SET status = 'feito', feito_em = NOW(), erro = NULL WHERE id = $1`, [t.id]);
  } catch (e) {
    const acabou = t.tentativas >= MAX_TENTATIVAS || e?.semRetry === true;
    console.error(`[whatsapp:fila] ${t.tipo} #${t.id} falhou (tentativa ${t.tentativas}${acabou ? ', desisti' : ''}):`, e.message);
    await pool.query(
      `UPDATE whatsapp_fila SET status = $2, erro = $3, feito_em = CASE WHEN $2 = 'falhou' THEN NOW() ELSE NULL END,
              disponivel_em = NOW() + ($4 || ' seconds')::interval WHERE id = $1`,
      [t.id, acabou ? 'falhou' : 'pendente', String(e.message).slice(0, 500), String(ESPERA_SEG[t.tentativas - 1] ?? 60)],
    ).catch((e2) => console.error('[whatsapp:fila] não consegui marcar a falha:', e2.message));
    if (acabou && ex?.aoFalhar) await ex.aoFalhar(t.payload, e).catch(() => {});
  } finally {
    ativos -= 1;
    setImmediate(puxar);
  }
}

/**
 * Faxina: trabalho concluído some em 7 dias; histórico de conversa em
 * WHATSAPP_RETENCAO_DIAS (padrão 90); código de vínculo vencido em 1 dia;
 * atendimento humano parado há 48 h volta pra Luna (senão a paciente fica
 * muda pra sempre numa conversa que ninguém encerrou).
 */
export async function faxina() {
  const pool = getPool();
  const dias = Math.max(7, Number(process.env.WHATSAPP_RETENCAO_DIAS) || 90);
  try {
    await pool.query(`DELETE FROM whatsapp_fila WHERE status IN ('feito', 'falhou') AND feito_em < NOW() - interval '7 days'`);
    await pool.query(`DELETE FROM whatsapp_mensagens WHERE criado_em < NOW() - ($1 || ' days')::interval`, [String(dias)]);
    await pool.query(`DELETE FROM whatsapp_codigos WHERE expires_at < NOW() - interval '1 day'`);
    await pool.query(
      `UPDATE whatsapp_contatos SET atendimento = 'luna', fila = NULL, atendente_id = NULL, aguardando_equipe = FALSE, atendimento_desde = NULL
        WHERE atendimento = 'humano' AND updated_at < NOW() - interval '48 hours'`);
  } catch (e) { console.warn('[whatsapp:fila] faxina falhou:', e.message); }
}

/** Liga o trabalhador neste processo. WHATSAPP_WORKER=0 desliga (pra rodar num serviço separado). */
export function iniciarTrabalhador() {
  if (ligado) return;
  ligado = true;
  // O ciclo de 3 s é a rede de segurança (nova tentativa agendada, trabalho
  // de outro processo); o caminho normal é o acordar() do webhook.
  setInterval(puxar, 3000).unref();
  setInterval(faxina, 6 * 60 * 60 * 1000).unref();
  setImmediate(puxar);
  console.log(`[whatsapp:fila] trabalhador ligado (até ${CONCORRENCIA} em paralelo)`);
}
