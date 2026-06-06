// Tela 10 do onboarding — Velocidade de progresso.
// Velocímetro SVG (SpeedGauge) com ponteiro acompanhando o slider abaixo.
// Pill de feedback contextual muda de copy + cor por zona.
//
// Nota: essa tela é PULADA quando goal='maintain' (vide OnboardingGoalScreen).

import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle } from '../../components/OnboardingScreen';
import { AnimalSlider } from '../../components/AnimalSlider';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingSpeedScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { goal, weeklyRateKg, setWeeklyRate } = useApp();

  const [rate, setRate] = useState<number>(weeklyRateKg ?? 0.8);

  const handleContinue = () => {
    setWeeklyRate(rate);
    nav.navigate('Barriers');
  };

  const mode: 'lose' | 'gain' = goal === 'gain' ? 'gain' : 'lose';
  const gaugeLabel = mode === 'gain' ? 'Ganho por semana' : 'Perda por semana';

  return (
    <OnboardingScreen
      step={9}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={handleContinue}
    >
      <OnboardingTitle>Em qual ritmo?</OnboardingTitle>

      <View style={{ marginTop: 32 }}>
        <AnimalSlider value={rate} onChange={setRate} gaugeLabel={gaugeLabel} mode={mode} />
      </View>
    </OnboardingScreen>
  );
};
