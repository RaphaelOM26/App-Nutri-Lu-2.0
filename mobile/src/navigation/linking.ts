// Deep link do app: nutrilu://
//
// Existe pra uma coisa só, e é a mais importante do fluxo de venda: a mensagem
// que a cliente recebe depois de comprar traz um link com o código de ativação.
// Tocar nele abre o app já com o código no campo — em vez de ela ter que
// digitar oito caracteres copiados de outra tela.
//
//   nutrilu://acesso?codigo=K7M2P9X4   → abre a tela de ativação preenchida
//
// ⚠️ O `scheme` que faz isso funcionar é configuração NATIVA (app.json). Ele só
// existe em build de loja — no Expo Go os links são `exp://`. Se um build sair
// sem o scheme, o deep link espera o build SEGUINTE, não "amanhã".
//
// O código só PRÉ-PREENCHE. O resgate continua sendo um toque deliberado da
// pessoa: link que ativa sozinho é link que ativa por engano, e um código
// gasto por engano vira conversa de suporte.

import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['nutrilu://'],
  config: {
    screens: {
      // "acesso" em português porque o link é lido por gente, não por máquina.
      Access: 'acesso',
    },
  },
};
