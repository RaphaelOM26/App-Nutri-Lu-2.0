// Datas do diário: sempre 'YYYY-MM-DD' no dia civil da cliente.
//
// O servidor está em UTC e a cliente no Brasil; misturar Date do servidor com
// "hoje" da cliente registraria o jantar de terça na quarta. Por isso as rotas
// recebem a data pronta do navegador e só validam o formato.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function dataValida(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function exigirData(s) {
  if (!dataValida(s)) {
    throw Object.assign(new Error('date precisa estar no formato YYYY-MM-DD'), { status: 400, code: 'BAD_REQUEST' });
  }
  return s;
}

/** Soma dias a uma data 'YYYY-MM-DD' sem passar por fuso. */
export function somarDias(s, n) {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Dia da semana no padrão BR: 1 = segunda … 7 = domingo. */
export function diaDaSemana(s) {
  const dow = new Date(`${s}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return dow === 0 ? 7 : dow;
}

/** Segunda-feira da semana que contém a data. */
export function inicioDaSemana(s) {
  return somarDias(s, 1 - diaDaSemana(s));
}

// ─── Fuso da cliente quando NÃO há navegador (bot de WhatsApp, jobs) ──────
// Na web a data vem pronta do navegador. No WhatsApp só existe o instante da
// mensagem, então o dia civil é calculado aqui, no fuso de Brasília.

const FUSO = 'America/Sao_Paulo';
const fmtData = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtHora = new Intl.DateTimeFormat('en-GB', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hour12: false });

/** 'YYYY-MM-DD' do instante dado, no fuso de Brasília. */
export function dataBR(instante = new Date()) {
  return fmtData.format(instante);
}

/** Minutos desde a meia-noite, no fuso de Brasília. */
export function minutosBR(instante = new Date()) {
  const [h, m] = fmtHora.format(instante).split(':').map(Number);
  return (h % 24) * 60 + m;
}

// Mesma tabela e mesma regra de web/src/lib/slots.ts (slotAgora): a refeição
// "da vez" é a primeira cujo horário ainda não passou há mais de 2 h.
const SLOT_HORA = [['cafe', 420], ['lanche_manha', 600], ['almoco', 750], ['lanche_tarde', 960], ['jantar', 1170], ['ceia', 1290]];

export function slotPelaHora(instante = new Date()) {
  const min = minutosBR(instante);
  for (const [slot, inicio] of SLOT_HORA) if (min < inicio + 120) return slot;
  return 'ceia';
}

/** Competência 'YYYY-MM' válida? */
export function mesValido(s) {
  return typeof s === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}
