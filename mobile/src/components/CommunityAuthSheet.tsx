// Sheet de login da comunidade (Sign in with Apple / Google).
//
// Aparece na PRIMEIRA ação que exige conta (publicar receita ou avaliar) —
// não no boot do app, que continua 100% anônimo. `reason` personaliza o texto
// pra pessoa entender POR QUE está sendo pedido login agora.
//
// No iOS mostramos o botão oficial da Apple (exigência das guidelines quando
// há login de terceiros) + Google; no Android, só Google.

import React, { useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { SheetModal } from './motion';
import { Btn } from './Btn';
import { Icon } from './Icons';
import { useTheme, FONT } from '../theme';
import { useToast } from '../state/ToastContext';
import {
  signInWithApple,
  signInWithGoogle,
  appleSignInAvailable,
  type AuthSession,
} from '../state/authState';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Chamado após login OK — o caller retoma a ação que estava pendente. */
  onSignedIn: (session: AuthSession) => void;
  /** Ex: "publicar sua receita" / "avaliar receitas" — completa a frase do título. */
  reason?: string;
};

export const CommunityAuthSheet: React.FC<Props> = ({ visible, onClose, onSignedIn, reason }) => {
  const theme = useTheme();
  const toast = useToast();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  useEffect(() => {
    appleSignInAvailable().then(setAppleAvailable);
  }, []);

  const finish = (session: AuthSession | null) => {
    setBusy(null);
    if (!session) return; // cancelou — sheet continua aberta
    toast(`Bem-vindo(a), ${session.user.displayName}!`);
    onClose();
    onSignedIn(session);
  };

  const onApple = async () => {
    setBusy('apple');
    try {
      finish(await signInWithApple());
    } catch (e) {
      setBusy(null);
      toast(e instanceof Error ? e.message : 'Não consegui entrar com a Apple', 'error');
    }
  };

  const onGoogle = async () => {
    setBusy('google');
    try {
      finish(await signInWithGoogle());
    } catch (e) {
      setBusy(null);
      toast(e instanceof Error ? e.message : 'Não consegui entrar com o Google', 'error');
    }
  };

  return (
    <SheetModal
      visible={visible}
      onClose={onClose}
      sheetStyle={{
        backgroundColor: theme.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 32,
        gap: 12,
      }}
    >
      <View style={{ alignItems: 'center', paddingBottom: 2 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
      </View>

      <View style={{ alignItems: 'center', gap: 6 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: theme.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.globe size={26} color={theme.primaryDeep} />
        </View>
        <Text style={{ fontFamily: FONT.head, fontSize: 18, color: theme.text, textAlign: 'center' }}>
          Entre pra {reason || 'participar da comunidade'}
        </Text>
        <Text
          style={{
            fontFamily: FONT.body,
            fontSize: 13.5,
            color: theme.textMuted,
            textAlign: 'center',
            lineHeight: 19,
          }}
        >
          Seu nome aparece nas receitas que você publicar. O diário e as suas receitas continuam
          privados — a conta é só pra comunidade.
        </Text>
      </View>

      <View style={{ gap: 10, paddingTop: 6 }}>
        {appleAvailable && Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={14}
            style={{ width: '100%', height: 52, opacity: busy === 'apple' ? 0.6 : 1 }}
            onPress={busy ? () => {} : onApple}
          />
        )}
        <Btn variant="outline" full onPress={onGoogle} disabled={busy !== null}>
          {busy === 'google' ? 'Entrando…' : 'Entrar com Google'}
        </Btn>
        <Btn variant="ghost" full size="md" onPress={onClose} disabled={busy !== null}>
          Agora não
        </Btn>
      </View>
    </SheetModal>
  );
};
