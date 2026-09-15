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

/** Competência 'YYYY-MM' válida? */
export function mesValido(s) {
  return typeof s === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}
