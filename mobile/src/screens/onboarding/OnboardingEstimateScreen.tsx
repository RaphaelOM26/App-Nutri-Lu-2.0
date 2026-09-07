// Tela final do onboarding — Estimativa inicial.
//
// Substitui as duas telas antigas: "Gerando seu plano" (4 segundos de animação
// em cima de uma conta instantânea) e "Plano pronto" (que apresentava a conta
// do app como plano assinado).
//
// A diferença não é cosmética. Plano alimentar é ato de nutricionista; o app
// não emite plano. O que ele mostra aqui é uma FAIXA de referência, e é a Lu
// que transforma faixa em meta. Por isso:
//
//   • a faixa é o elemento principal da tela, e o ponto de trabalho vem em
//     segundo plano — a largura da faixa é o que comunica "isto é estimativa";
//   • os macros também aparecem em faixa, direto dos valores em g/kg do
//     material dela, sem eleger um ponto dentro deles;
//   • a palavra "plano" não aparece pra nada que o app calculou.
//
// A tela termina dizendo o que já dá pra fazer, porque o app é completo e
// gratuito por si só — quem nunca contratar acompanhamento continua com um
// diário inteiro na mão.

import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../state/AppContext';
import { useTheme, FONT } from '../../theme';
import { Icon } from '../../components/Icons';
import { estimar, formatarFaixa, type Faixa } from '../../utils/macroCalc';

export const OnboardingEstimateScreen: React.FC = () => {
  const theme = useTheme();
  const {
    name,
    gender,
    birthDate,
    heightCm,
    weightEntries,
    activityLevel,
    goal,
    setMacroTargets,
    setOnboardedAt,
  } = useApp();

  // Calculada uma vez. Se algum campo faltar, usa um padrão conservador em vez
  // de quebrar a tela — o onboarding pode ter sido pulado por um caminho novo.
  const est = useMemo(
    () =>
      estimar({
        gender: gender ?? 'female',
        birthDate: birthDate ?? new Date(1995, 0, 1).getTime(),
        heightCm: heightCm ?? 165,
        weightKg: weightEntries[0]?.kg ?? 70,
        activityLevel: activityLevel ?? 'moderate',
        goal: goal ?? 'maintain',
      }),
    [gender, birthDate, heightCm, weightEntries, activityLevel, goal],
  );

  const handleFinish = () => {
    // O diário precisa de UM alvo pra desenhar o anel — não dá pra desenhar
    // progresso contra uma faixa. Grava o ponto de referência, marcado como
    // estimativa: é `origem` que autoriza a interface a chamar de "meta".
    setMacroTargets({
      kcal: est.kcalRef,
      p: Math.round((est.p.min + est.p.max) / 2),
      c: Math.round((est.c.min + est.c.max) / 2),
      f: Math.round((est.f.min + est.f.max) / 2),
      origem: 'estimativa',
    });
    setOnboardedAt(Date.now());
    // Sem navigate: o App.tsx detecta isOnboarded e troca de navigator.
  };

  const primeiroNome = (name || '').trim().split(/\s+/)[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 12 }}>
        <Text
          style={{
            fontFamily: FONT.head,
            fontSize: 11,
            letterSpacing: 2,
            color: theme.primaryDeep,
          }}
        >
          ESTIMATIVA INICIAL
        </Text>
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 28,
            color: theme.text,
            marginTop: 8,
            lineHeight: 34,
          }}
        >
          {primeiroNome ? `Um ponto de partida, ${primeiroNome}` : 'Um ponto de partida'}
        </Text>

        {/* Faixa calórica — o elemento principal da tela */}
        <View
          style={{
            marginTop: 22,
            padding: 20,
            borderRadius: 20,
            backgroundColor: theme.bgElev,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>
            Faixa estimada por dia
          </Text>
          <Text
            style={{
              fontFamily: FONT.headExtra,
              fontSize: 34,
              color: theme.text,
              marginTop: 4,
              letterSpacing: -1,
            }}
          >
            {formatarFaixa(est.kcal)}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>
            calorias
          </Text>
          <View
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: theme.border,
              alignSelf: 'stretch',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>
              Usando{' '}
              <Text style={{ color: theme.text, fontWeight: '600' }}>
                {est.kcalRef.toLocaleString('pt-BR')} kcal
              </Text>{' '}
              como referência
            </Text>
          </View>
        </View>

        {/* Macros, também em faixa */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <MacroFaixa label="Proteína" faixa={est.p} />
          <MacroFaixa label="Carboidrato" faixa={est.c} />
          <MacroFaixa label="Gordura" faixa={est.f} />
        </View>

        {/* O aviso que separa estimativa de prescrição */}
        <View
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 18,
            backgroundColor: theme.accentIce,
          }}
        >
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 14,
              lineHeight: 21,
              color: theme.insightText,
            }}
          >
            Esses números vêm do seu peso e do seu objetivo. São um ponto de partida — quem define
            suas metas é a Lu, olhando sua rotina, seu histórico e o que você já come.
          </Text>
        </View>

        <Linha
          icon={<Icon.check size={18} color={theme.textMuted} stroke={2} />}
          text="Já dá pra registrar suas refeições, buscar alimentos e ver as 407 receitas da Lu."
        />
        <Linha
          icon={<Icon.clock size={18} color={theme.textMuted} stroke={2} />}
          text="Seu plano alimentar aparece na aba Plano quando a Lu terminar."
        />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Text
          accessibilityRole="button"
          onPress={handleFinish}
          style={{
            height: 56,
            borderRadius: 999,
            backgroundColor: theme.primary,
            color: '#FFFFFF',
            fontFamily: FONT.head,
            fontSize: 18,
            textAlign: 'center',
            lineHeight: 56,
            overflow: 'hidden',
          }}
        >
          Começar
        </Text>
      </View>
    </SafeAreaView>
  );
};

const MacroFaixa: React.FC<{ label: string; faixa: Faixa }> = ({ label, faixa }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        backgroundColor: theme.bgSubtle,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>{label}</Text>
      <Text
        style={{
          fontFamily: FONT.head,
          fontSize: 15,
          color: theme.text,
          marginTop: 3,
          textAlign: 'center',
        }}
      >
        {faixa.min}–{faixa.max} g
      </Text>
    </View>
  );
};

const Linha: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'flex-start' }}>
      <View style={{ marginTop: 1 }}>{icon}</View>
      <Text
        style={{
          flex: 1,
          fontFamily: FONT.body,
          fontSize: 14,
          lineHeight: 20,
          color: theme.textMuted,
        }}
      >
        {text}
      </Text>
    </View>
  );
};
