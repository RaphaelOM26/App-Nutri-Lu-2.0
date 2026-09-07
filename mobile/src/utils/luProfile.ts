// Monta o bloco `profile` que viaja pra Lu no chat, na dica do dia e no resumo.
//
// Existe como função única porque as três telas montavam esse objeto na mão —
// e as três mandavam os MESMOS valores fixos, escritos durante o mockup:
// "Perder peso", 85,2 kg, meta 82 kg. Ou seja, a Lu vinha respondendo a toda
// paciente como se ela pesasse 85,2 kg. Mesma natureza dos macros 38/45/12 e do
// insight fixo que já saíram do app: dado inventado com cara de dado real, e
// pior aqui, porque alimentava um texto que se dirige à pessoa.
//
// Com uma função só, rota nova nasce com o perfil certo sem ninguém lembrar.

import type { LuContext } from '../api/client';
import type { GoalType } from '../storage/userProfile';

const OBJETIVO: Record<GoalType, string> = {
  lose: 'Perder peso',
  maintain: 'Manter o peso',
  gain: 'Ganhar massa muscular',
};

/** Rótulos das barreiras do onboarding. O id sozinho não diz nada pro modelo. */
const BARREIRA: Record<string, string> = {
  constancy: 'falta de constância',
  food: 'alimentação ruim',
  support: 'falta de apoio',
  schedule: 'agenda corrida',
  ideas: 'falta de ideias de refeição',
};

const MOTIVACAO: Record<string, string> = {
  live: 'comer e viver melhor',
  energy: 'mais energia e disposição',
  consistency: 'manter motivação e constância',
  body: 'se sentir bem com o próprio corpo',
};

export type PerfilLuParams = {
  name?: string | null;
  goal?: GoalType | null;
  weightKg?: number | null;
  goalWeightKg?: number | null;
  barriers?: string[];
  motivations?: string[];
};

/**
 * Campo ausente sai FORA do objeto, em vez de virar um valor plausível. Um
 * peso omitido faz a Lu não falar de peso; um peso inventado faz ela falar do
 * peso errado com confiança.
 */
export function montarPerfilLu(p: PerfilLuParams): LuContext['profile'] {
  const perfil: NonNullable<LuContext['profile']> = {};

  const nome = (p.name || '').trim();
  if (nome) perfil.name = nome;
  if (p.goal) perfil.goal = OBJETIVO[p.goal];
  if (typeof p.weightKg === 'number' && p.weightKg > 0) perfil.weightKg = p.weightKg;
  if (typeof p.goalWeightKg === 'number' && p.goalWeightKg > 0) perfil.goalWeightKg = p.goalWeightKg;

  const barreiras = (p.barriers ?? []).map((id) => BARREIRA[id]).filter(Boolean);
  if (barreiras.length) perfil.barriers = barreiras;

  const motivacoes = (p.motivations ?? []).map((id) => MOTIVACAO[id]).filter(Boolean);
  if (motivacoes.length) perfil.motivations = motivacoes;

  return perfil;
}
