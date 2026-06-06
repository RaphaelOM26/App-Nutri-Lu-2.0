// Tela 9 do onboarding — Peso desejado.
// Régua scrollable 30-200 kg. Número grande acima. Contexto dinâmico (Perder/Ganhar)
// pega de form.goal. Validação: se goal='lose' e desired >= current → bloqueia CTA.
//
// Nota: essa tela é PULADA quando goal='maintain' (vide OnboardingGoalScreen).

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { useTheme, FONT } from '../../theme';
import { OnboardingScreen, OnboardingTitle } from '../../components/OnboardingScreen';
import { Ruler } from '../../components/Ruler';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingDesiredWeightScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const { goal, weightGoalKg, setWeightGoal, weightEntries } = useApp();

  const currentWeight = weightEntries[0]?.kg ?? 65;
  // Default: -5 kg do peso atual se "perder", +5 kg se "ganhar".
  const defaultGoal = goal === 'gain' ? currentWeight + 5 : currentWeight - 5;
  const [val, setVal] = useState<number>(weightGoalKg !== 82 ? weightGoalKg : defaultGoal);

  // Validação contextual
  const invalid =
    (goal === 'lose' && val >= currentWeight) || (goal === 'gain' && val <= currentWeight);

  const handleContinue = () => {
    setWeightGoal(val);
    nav.navigate('Speed');
  };

  const ctx = goal === 'gain' ? 'Ganhar peso' : 'Perder peso';

  return (
    <OnboardingScreen
      step={8}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={invalid}
      onCta={handleContinue}
      scrollable={false}
    >
      <OnboardingTitle>Qual seu peso desejado?</OnboardingTitle>

      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, color: theme.textMuted }}>
          {ctx}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
          <Text
            style={{
              fontFamily: FONT.headExtra,
              fontSize: 48,
              color: theme.text,
              letterSpacing: -1,
            }}
          >
            {val.toFixed(1).replace('.', ',')}
          </Text>
          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 22,
              color: theme.textMuted,
              marginLeft: 6,
            }}
          >
            kg
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 20, marginHorizontal: -24 }}>
        <Ruler min={30} max={200} value={Math.round(val)} onChange={(v) => setVal(v)} />
      </View>

      {invalid && (
        <Text
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontFamily: FONT.body,
            fontSize: 13,
            color: theme.textMuted,
            paddingHorizontal: 24,
          }}
        >
          {goal === 'lose'
            ? 'Pra perder peso, escolha um valor menor que seu peso atual.'
            : 'Pra ganhar peso, escolha um valor maior que seu peso atual.'}
        </Text>
      )}
    </OnboardingScreen>
  );
};
