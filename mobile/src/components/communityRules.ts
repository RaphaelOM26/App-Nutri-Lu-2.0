// Regras da comunidade (EULA de conteúdo).
//
// Por que existe: a App Store (guideline 1.2) exige, pra qualquer app com
// conteúdo gerado por usuário, que a pessoa CONCORDE com termos de tolerância
// zero a conteúdo ofensivo antes de publicar, e que haja um contato publicado
// pra quem quiser reportar algo. Sem isso a review reprova mesmo com denúncia
// e bloqueio implementados.
//
// É um Alert e não uma tela: as regras precisam estar a UM toque de onde a
// pessoa aceita (o sheet de login) e de onde ela administra a conta (o perfil).
// Uma tela nova em outro canto do app seria mais bonita e menos lida.

import { Alert, Linking } from 'react-native';

/**
 * Contato publicado pra denúncias e dúvidas — exigido pela guideline 1.2.
 *
 * Resolvido em 07/09/2026: era o Gmail pessoal do Raphael desde agosto, à
 * espera do e-mail institucional. Agora é o endereço de suporte do domínio,
 * o mesmo que consta na página de suporte e na ficha da loja.
 */
export const COMMUNITY_CONTACT_EMAIL = 'suporte@nutrilualves.com.br';

const RULES_BODY = [
  'Ao publicar receitas você concorda em NÃO postar conteúdo:',
  '',
  '• ofensivo, discriminatório ou de assédio;',
  '• ilegal, sexual ou violento;',
  '• perigoso à saúde (jejuns extremos, purgação, doses tóxicas);',
  '• spam, propaganda ou receita copiada sem crédito.',
  '',
  'Tolerância zero: conteúdo denunciado é analisado e removido, e contas reincidentes são banidas.',
  '',
  'Em qualquer receita da comunidade você pode denunciar o conteúdo ou bloquear o autor.',
  '',
  `Dúvidas ou denúncias urgentes: ${COMMUNITY_CONTACT_EMAIL}`,
].join('\n');

/** Abre as regras da comunidade, com atalho pra escrever pro contato. */
export function showCommunityRules(): void {
  Alert.alert('Regras da comunidade', RULES_BODY, [
    { text: 'Entendi', style: 'cancel' },
    {
      text: 'Falar com o suporte',
      onPress: () => {
        // openURL falha em simulador sem cliente de e-mail configurado — não
        // vale derrubar a UI por isso, o endereço já está escrito no texto.
        Linking.openURL(
          `mailto:${COMMUNITY_CONTACT_EMAIL}?subject=${encodeURIComponent('Comunidade Nutri Lu')}`,
        ).catch(() => {});
      },
    },
  ]);
}
