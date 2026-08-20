// Tela de ativação do acompanhamento.
//
// É a peça que faltava pra poder ligar o ENFORCE_PREMIUM: sem ela, o servidor
// passaria a responder "sem acesso" e nem quem pagou teria o que tocar.
//
// DOIS CAMINHOS, e o segundo é exceção:
//
//   1. Entrar com Apple/Google. O provedor entrega ao servidor o e-mail JÁ
//      VERIFICADO — é prova, não declaração. Bateu com o acompanhamento, libera
//      na hora e a pessoa nunca vê código nenhum. É o caminho normal.
//
//   2. Código. Só pra quando o e-mail não bate: "Ocultar meu e-mail" da Apple,
//      contratou com um endereço e usa o celular com outro, ou ganhou de
//      presente. Por isso o campo de código só aparece DEPOIS do login — antes
//      dele não há conta a que vincular o código.
//
// A tela é de ATIVAÇÃO, nunca de venda: sem preço, sem "assine", sem link pra
// fora e sem citar a plataforma de pagamento. Ela destrava algo que a pessoa já
// contratou — que é a verdade do modelo — e é isso que a review da Apple espera
// ver quando não há compra dentro do app.

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Platform, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Btn } from '../components/Btn';
import { Icon } from '../components/Icons';
import { useToast } from '../state/ToastContext';
import { useAuthSession, signInWithApple, signInWithGoogle, appleSignInAvailable } from '../state/authState';
import { useAccess, refreshAccess } from '../state/accessState';
import { redeemAccessCode, ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'Access'>;

const TAMANHO = 12; // 3 grupos de 4

/**
 * Formata enquanto digita: maiúsculo, sem caractere que não seja do código, e
 * hífen a cada 4. O servidor aceita de qualquer jeito (minúsculo, sem hífen) —
 * isto é só pra pessoa conseguir CONFERIR o que digitou contra o que recebeu.
 */
function formatarCodigo(bruto: string): string {
  const limpo = bruto.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, TAMANHO);
  return limpo.match(/.{1,4}/g)?.join('-') ?? limpo;
}

/** Mensagem por motivo. "Código inválido" pra tudo faria quem teve o código
 *  usado por outra pessoa achar que digitou errado — conversa completamente
 *  diferente, e é a que precisa chegar até você. */
function mensagemDoErro(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'FORMATO_INVALIDO':
        return 'Esse código não parece completo — são 12 caracteres. Confira e tente de novo.';
      case 'NAO_ENCONTRADO':
        return 'Não encontrei esse código. Confira se copiou certinho da mensagem que você recebeu.';
      case 'JA_USADO':
        return 'Esse código já foi usado em outra conta. Se não foi você, fale com a gente pelo suporte.';
      case 'RATE_LIMITED':
        return 'Muitas tentativas seguidas. Espera alguns minutos e tenta de novo.';
      case 'AUTH_EXPIRED':
        return 'Sua sessão expirou. Entre de novo pra continuar.';
      default:
        return e.message || 'Não consegui validar o código agora.';
    }
  }
  return 'Não consegui validar o código agora. Confira sua conexão.';
}

const formatarData = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR');
};

export const AccessScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const rota = useRoute<Rota>();
  const toast = useToast();

  const sessao = useAuthSession();
  const acesso = useAccess();

  const [appleDisponivel, setAppleDisponivel] = useState(false);
  const [entrando, setEntrando] = useState<'apple' | 'google' | null>(null);
  // Código pode chegar pelo link da mensagem — vem pré-preenchido, mas o
  // resgate NÃO dispara sozinho: a pessoa vê o que vai ativar e confirma.
  const [codigo, setCodigo] = useState(formatarCodigo(rota.params?.codigo ?? ''));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    appleSignInAvailable().then(setAppleDisponivel);
  }, []);

  // Ao abrir, confirma com o servidor. Se a pessoa contratou depois do último
  // login, o acesso aparece aqui sem ela fazer mais nada.
  useEffect(() => {
    refreshAccess();
  }, []);

  const entrar = useCallback(
    async (via: 'apple' | 'google') => {
      setEntrando(via);
      setErro(null);
      try {
        const s = via === 'apple' ? await signInWithApple() : await signInWithGoogle();
        if (s) {
          toast(`Bem-vindo(a), ${s.user.displayName}!`);
          // O acesso é derivado do login: o accessState já reconsulta sozinho
          // quando a sessão muda, então aqui não há nada a fazer além de esperar.
        }
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Não consegui entrar', 'error');
      } finally {
        setEntrando(null);
      }
    },
    [toast],
  );

  const ativar = useCallback(async () => {
    if (!sessao) return;
    setEnviando(true);
    setErro(null);
    try {
      await redeemAccessCode(sessao.token, codigo);
      await refreshAccess();
      toast('Acesso ativado!');
    } catch (e) {
      // Mantém o que foi digitado: quase sempre é um caractere trocado, e
      // limpar o campo obrigaria a redigitar os 12 do zero.
      setErro(mensagemDoErro(e));
    } finally {
      setEnviando(false);
    }
  }, [sessao, codigo, toast]);

  const temAcesso = acesso?.acesso === true;
  const validade = formatarData(acesso?.validoAte);
  const podeEnviar = codigo.replace(/-/g, '').length === TAMANHO && !enviando;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Meu acesso"
        left={[<IconBtn key="back" icon={Icon.back} onPress={() => nav.goBack()} />]}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Selo do estado ───────────────────────────────────── */}
        <View style={{ alignItems: 'center', gap: 10, paddingTop: 8 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: temAcesso ? theme.primarySoft : theme.bgSubtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {temAcesso ? (
              <Icon.checkCircle size={32} color={theme.primaryDeep} />
            ) : (
              <Icon.lock size={30} color={theme.textMuted} />
            )}
          </View>

          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 20,
              color: theme.text,
              textAlign: 'center',
            }}
          >
            {temAcesso ? 'Acesso ativo' : 'Ativar meu acesso'}
          </Text>

          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 14,
              color: theme.textMuted,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {temAcesso
              ? validade
                ? `Seu acompanhamento está ativo até ${validade}. Todas as ferramentas da Lu estão liberadas.`
                : 'Seu acompanhamento está ativo. Todas as ferramentas da Lu estão liberadas.'
              : 'O diário, a busca de alimentos e as receitas são sempre seus. As ferramentas com a Lu fazem parte do acompanhamento.'}
          </Text>
        </View>

        {/* ── Já está tudo certo ───────────────────────────────── */}
        {temAcesso && (
          <Btn full onPress={() => nav.goBack()}>
            Voltar pro app
          </Btn>
        )}

        {/* ── Caminho 1: entrar (é o normal) ───────────────────── */}
        {!temAcesso && !sessao && (
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontFamily: FONT.body,
                fontSize: 13,
                color: theme.textMuted,
                textAlign: 'center',
                lineHeight: 19,
              }}
            >
              Entre com a mesma conta de e-mail que você usou pra contratar. Na maioria das vezes o
              acesso libera na hora, sem precisar de código.
            </Text>

            {appleDisponivel && Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={14}
                style={{ width: '100%', height: 52, opacity: entrando === 'apple' ? 0.6 : 1 }}
                onPress={entrando ? () => {} : () => entrar('apple')}
              />
            )}
            <Btn variant="outline" full onPress={() => entrar('google')} disabled={entrando !== null}>
              {entrando === 'google' ? 'Entrando…' : 'Entrar com Google'}
            </Btn>
          </View>
        )}

        {/* ── Caminho 2: código (exceção, só faz sentido logado) ─ */}
        {!temAcesso && sessao && (
          <View style={{ gap: 12 }}>
            <View
              style={{
                backgroundColor: theme.bgElev,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
                padding: 16,
                gap: 12,
              }}
            >
              <Text style={{ fontFamily: FONT.head, fontSize: 15, color: theme.text }}>
                Já tenho um código
              </Text>
              <Text
                style={{
                  fontFamily: FONT.body,
                  fontSize: 13,
                  color: theme.textMuted,
                  lineHeight: 19,
                }}
              >
                Você entrou como {sessao.user.displayName}, mas não encontrei um acompanhamento
                ativo nessa conta. Se você contratou com outro e-mail — ou escolheu ocultar seu
                e-mail —, use o código que recebeu.
              </Text>

              <TextInput
                value={codigo}
                onChangeText={(t) => {
                  setCodigo(formatarCodigo(t));
                  if (erro) setErro(null);
                }}
                placeholder="ABCD-EFGH-JKMN"
                placeholderTextColor={theme.textFaint}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                maxLength={14} // 12 + 2 hífens
                style={{
                  fontFamily: FONT.head,
                  fontSize: 20,
                  letterSpacing: 2,
                  textAlign: 'center',
                  color: theme.text,
                  backgroundColor: theme.bgSubtle,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: erro ? theme.warningDeep : theme.border,
                  paddingVertical: 14,
                }}
              />

              {erro && (
                <Text
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 12.5,
                    color: theme.warningDeep,
                    lineHeight: 18,
                  }}
                >
                  {erro}
                </Text>
              )}

              <Btn full onPress={ativar} disabled={!podeEnviar}>
                {enviando ? 'Ativando…' : 'Ativar acesso'}
              </Btn>
            </View>

            <Text
              style={{
                fontFamily: FONT.body,
                fontSize: 12,
                color: theme.textFaint,
                textAlign: 'center',
                lineHeight: 17,
              }}
            >
              Acabou de contratar? Toque em atualizar — às vezes leva alguns minutos pra chegar
              aqui.
            </Text>

            <Btn variant="ghost" full size="md" onPress={() => refreshAccess()}>
              Atualizar
            </Btn>
          </View>
        )}

        {/* Estado de "ainda perguntando" — só quando há sessão e o servidor
            ainda não respondeu; sem conta não há o que perguntar. */}
        {!temAcesso && sessao && acesso === null && (
          <View style={{ alignItems: 'center', paddingTop: 4 }}>
            <ActivityIndicator color={theme.primaryDeep} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
