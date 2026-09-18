// REGRAS DA APROVAÇÃO EM LOTE — o único lugar com números.
//
// Decididas com o Raphael em 18/09/2026 a partir do documento que a Luciana
// está preenchendo ("Critérios da aprovação em lote"). Quando ela devolver,
// os valores mudam AQUI e a VERSAO sobe: cada plano gerado guarda a versão
// com que foi avaliado (meal_plans.regras_versao), então dá pra saber depois
// com que regra cada aprovação aconteceu.
//
// Lógica geral (services/lote/elegibilidade.js): LISTA VERDE. Só entra no
// lote quem cumpre TODOS os critérios; qualquer coisa fora, ou que ninguém
// previu, cai na revisão individual da Luciana. Regra em código, nunca IA.

// Sobe também quando o GERADOR muda (ex.: .2 = ajuste fino de porções): o
// rascunho intocado é refeito na varredura seguinte.
export const VERSAO = '2026-09-18.2';

export const REGRAS = {
  // Parte 1: quem pode entrar no lote
  idade: { min: 18, max: 59 },
  imc: { min: 18.5, max: 29.9 },           // baixo peso e obesidade: sempre revisão individual
  pesoMaxKg: 105,                          // acima disso a fórmula de bolso pode dar superávit
  perdaMaxPorSemana: 0.01,                 // 1% do peso por semana
  intestinoAceito: ['regular', 'preso'],
  perdaControleAceita: ['nao'],
  alcoolAceito: ['nao', 'social'],
  suplementosAceitos: ['whey', 'creatina', 'vitamina d', 'vitamina d3'],
  restricoesAceitas: ['sem-gluten', 'sem-lactose', 'vegetariana', 'vegana', 'nenhuma'],
  gestanteAceito: ['nao'],

  // Parte 2: checagens do plano gerado
  pisoKcal: { feminino: 1200, masculino: 1500, outro: 1200 },
  deficitMax: 0.25,                        // até 25% abaixo do gasto estimado
  toleranciaMeta: 0.05,                    // soma do dia até 5% longe da meta
  repeticaoMaxSemana: 3,                   // mesma receita no máximo 3x na semana

  // Parte 3: travas do processo
  tamanhoLote: 10,
  amostraPorLote: 2,
  calibracao: { minimoPublicados: 20, taxaMaxCorrecao: 0.05 },
  semanasNoMes: 4,
};

/** Perfil = a "regra" que a calibração mede: objetivo × sexo. */
export function perfilChave(perfil) {
  return `${perfil?.objetivo || '?'}:${perfil?.sexo || '?'}`;
}
