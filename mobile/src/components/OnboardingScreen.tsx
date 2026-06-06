// Wrapper de layout pra todas as telas do onboarding.
// Cuida de: safe area, padding consistente, header (opcional), CTA fixo no rodapé.
//
// Uso típico:
//   <OnboardingScreen
//     step={3} total={16} onBack={...}
//     ctaLabel="Continuar" ctaDisabled={!selected} onCta={next}
//   >
//     <Title>...</Title>
//     <Subtitle>...</Subtitle>
//     ... conteúdo principal ...
//   </OnboardingScreen>

import React from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONT } from '../theme';
import { OnboardingHeader } from './OnboardingHeader';

type Props = {
  /** Step atual (1-based). Omite pra esconder header (telas 1, 16, 17). */
  step?: number;
  /** Total de steps com progress bar (default 16 — todas exceto a 1). */
  total?: number;
  /** Callback do back. Omite na primeira tela do funil. */
  onBack?: () => void;
  /** Texto do CTA principal. Omite pra esconder footer (ex: tela 16 auto-avança). */
  ctaLabel?: string;
  /** Desabilita o CTA visualmente (e bloqueia onCta). */
  ctaDisabled?: boolean;
  /** Callback do CTA principal. */
  onCta?: () => void;
  /** Conteúdo abaixo do CTA (ex: link "Agora não" na tela 14). */
  ctaSecondary?: React.ReactNode;
  /** Se o conteúdo principal precisa de scroll (default true). */
  scrollable?: boolean;
  children: React.ReactNode;
};

export const OnboardingScreen: React.FC<Props> = ({
  step,
  total = 16,
  onBack,
  ctaLabel,
  ctaDisabled,
  onCta,
  ctaSecondary,
  scrollable = true,
  children,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? {
        contentContainerStyle: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 },
        keyboardShouldPersistTaps: 'handled' as const,
        showsVerticalScrollIndicator: false,
      }
    : { style: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 } };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {step != null && <OnboardingHeader step={step} total={total} onBack={onBack} />}

        <ContentWrapper {...contentProps}>{children}</ContentWrapper>

        {ctaLabel && (
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 24),
              backgroundColor: theme.bg,
            }}
          >
            <Pressable
              onPress={onCta}
              disabled={ctaDisabled || !onCta}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              style={({ pressed }) => ({
                height: 56,
                borderRadius: 999,
                backgroundColor: ctaDisabled ? theme.primarySoft : theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed && !ctaDisabled ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: FONT.head,
                  fontSize: 18,
                  color: ctaDisabled ? theme.textFaint : '#FFFFFF',
                }}
              >
                {ctaLabel}
              </Text>
            </Pressable>
            {ctaSecondary && <View style={{ marginTop: 12, alignItems: 'center' }}>{ctaSecondary}</View>}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/** Título principal da tela (Plus Jakarta 700 28px). */
export const OnboardingTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontFamily: FONT.head,
        fontSize: 28,
        lineHeight: 34,
        color: theme.text,
        marginTop: 24,
      }}
    >
      {children}
    </Text>
  );
};

/** Subtítulo explicativo (Plus Jakarta body 16px cinza). */
export const OnboardingSubtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontFamily: FONT.body,
        fontSize: 16,
        lineHeight: 22,
        color: theme.textMuted,
        marginTop: 8,
      }}
    >
      {children}
    </Text>
  );
};
