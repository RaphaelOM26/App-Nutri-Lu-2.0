// Metas do plano pela "fórmula de bolso" da nutricionista, no servidor.
//
// É a MESMA conta de web/src/lib/estimativa.ts (faixas por kg de peso,
// atividade posiciona dentro da faixa, piso calórico). A web mostra a faixa
// pra paciente como referência; aqui a aprovação em lote precisa de um NÚMERO
// pra montar o plano, e o número é o meio da faixa, como o botão "Preencher
// com o meio da faixa" do editor. Quem muda esses valores é a Luciana; a
// versão fica registrada em cada plano (services/lote/regras.js).

const TABELA = {
  perder: { kcal: [20, 25], p: [1.6, 2.0], f: [0.8, 1.0], c: [2.0, 3.0] },
  manter: { kcal: [25, 30], p: [1.4, 1.8], f: [0.8, 1.2], c: [3.0, 4.0] },
  ganhar: { kcal: [30, 35], p: [1.6, 2.2], f: [0.8, 1.2], c: [3.0, 5.0] },
};
const POSICAO = { sedentaria: 0, leve: 0.25, moderada: 0.5, muito: 0.75, extrema: 1 };
// Fatores clássicos de atividade (Harris-Benedict), só pra ESTIMAR o gasto e
// medir o déficit. Nunca entram no funil de macros.
const FATOR_ATIVIDADE = { sedentaria: 1.2, leve: 1.375, moderada: 1.55, muito: 1.725, extrema: 1.9 };

export const PISO_KCAL = { feminino: 1200, masculino: 1500, outro: 1200 };
const arred = (v, passo) => Math.round(v / passo) * passo;

/** Faixas [mínimo, máximo], iguais às da web. */
export function estimar(pesoKg, objetivo, atividade, sexo) {
  const t = TABELA[objetivo]; const pos = POSICAO[atividade];
  if (!t || pos == null || !(pesoKg > 0)) return null;
  const largura = t.kcal[1] - t.kcal[0];
  const lo = t.kcal[0] + pos * (largura / 2), hi = lo + largura / 2;
  const piso = PISO_KCAL[sexo] ?? 1200;
  const kcal = [Math.max(piso, arred(pesoKg * lo, 50)), Math.max(piso, arred(pesoKg * hi, 50))];
  const p = [arred(pesoKg * t.p[0], 5), arred(pesoKg * t.p[1], 5)];
  const f = [arred(pesoKg * t.f[0], 1), arred(pesoKg * t.f[1], 1)];
  const cDeKcal = [Math.max(0, (kcal[0] - p[1] * 4 - f[1] * 9) / 4), Math.max(0, (kcal[1] - p[0] * 4 - f[0] * 9) / 4)];
  const c = [arred(Math.max(cDeKcal[0], pesoKg * t.c[0]), 5), arred(Math.min(Math.max(cDeKcal[1], pesoKg * t.c[0]), pesoKg * t.c[1]), 5)];
  if (c[1] < c[0]) c[1] = c[0];
  return { kcal, p, c, f };
}

/**
 * O número pro plano: meio da faixa de kcal e de proteína, gordura no PISO da
 * faixa (ordem dela: kcal → proteína → gordura no piso → carbo fecha a conta).
 */
export function metaDoMeio(faixa) {
  const kcal = arred((faixa.kcal[0] + faixa.kcal[1]) / 2, 10);
  const p = arred((faixa.p[0] + faixa.p[1]) / 2, 5);
  const f = faixa.f[0];
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, c, f, water_ml: 2000 };
}

/** Gasto energético estimado (Harris-Benedict revisada) pra medir o déficit. Só verificação. */
export function gastoEstimado({ pesoKg, alturaCm, idade, sexo, atividade }) {
  if (!(pesoKg > 0 && alturaCm > 0 && idade > 0)) return null;
  const tmb = sexo === 'masculino'
    ? 88.362 + 13.397 * pesoKg + 4.799 * alturaCm - 5.677 * idade
    : 447.593 + 9.247 * pesoKg + 3.098 * alturaCm - 4.330 * idade;
  return Math.round(tmb * (FATOR_ATIVIDADE[atividade] || 1.2));
}
