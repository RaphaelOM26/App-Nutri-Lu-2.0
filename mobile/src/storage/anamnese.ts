// Anamnese — as perguntas do questionário da nutricionista que ficam no app.
//
// ⚠️ SÓ AS NÃO CLÍNICAS. As dez perguntas sobre saúde do questionário dela
// (doenças, histórico familiar, medicamentos, suplementos, alergias, perda de
// controle ao comer, intestino, sintomas, álcool e exames) são dado sensível
// pela LGPD e ficam FORA daqui — coletadas por ela, no instrumento dela, sob
// responsabilidade profissional dela. Não adicionar nenhuma delas neste arquivo
// sem antes rever a base legal e os formulários de privacidade das lojas.
//
// A restrição alimentar que o plano precisa respeitar ("sem glúten") vem da
// nutricionista no painel, nunca do diagnóstico da paciente.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@nutri-lu/anamnese';

export type PeriodoFome = 'manha' | 'apos-almoco' | 'tarde' | 'noite';
export type FrequenciaDoces = 'nao' | 'as-vezes' | 'frequentemente' | 'todos-os-dias';
export type QualidadeSono = 'bom' | 'regular' | 'ruim';

export type DiaNormal = {
  cafe?: string;
  almoco?: string;
  lanche?: string;
  jantar?: string;
};

export type Anamnese = {
  /** 13 — alimentos que não gosta, tem aversão ou não consegue consumir. */
  naoGosta?: string;
  /** 14 — o que ela considera indispensável manter pra conseguir seguir. */
  indispensavel?: string;
  /** 15 — dificuldade de rotina, acesso ou custo. */
  limitacoes?: string;
  /** 16 — como costuma ser a alimentação num dia normal, por refeição. */
  diaNormal?: DiaNormal;
  /** 17 — em qual período sente mais fome. */
  maisFome?: PeriodoFome;
  /** 18 — vontade de doces, e quando acontece mais. */
  doces?: FrequenciaDoces;
  docesQuando?: string;
  /** 22 — litros de água por dia. */
  aguaLitros?: number;
  /** 24 — sono. */
  sonoQualidade?: QualidadeSono;
  sonoHoras?: number;
  /** Timestamp de quando terminou. Ausente = ainda não respondeu. */
  respondidaEm?: number;
};

export async function loadAnamnese(): Promise<Anamnese> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Anamnese) : {};
  } catch {
    return {};
  }
}

/**
 * Grava só os campos informados, preservando o resto.
 *
 * É merge e não substituição porque cada tela do fluxo salva a sua parte ao
 * avançar — assim quem fecha o app no meio não perde o que já respondeu, e
 * quem volta pra trás encontra as respostas onde deixou.
 */
export async function salvarAnamnese(parcial: Anamnese): Promise<void> {
  const atual = await loadAnamnese();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...atual, ...parcial }));
}

export async function limparAnamnese(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
