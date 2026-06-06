// Tela 8 do onboarding — Objetivo.
// 3 opções: Perder / Manter / Ganhar peso.
// IMPORTANTE: se goal='maintain', pula DesiredWeight e Speed → vai direto pra Barriers.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { OptionCard } from '../../components/OptionCard';
import type { OnboardingStackParamList } from '../../navigation/types';
import type { GoalType } from '../../storage/userProfile';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

type Opt = { id: GoalType; label: string };
const OPTS: Opt[] = [
  { id: 'lose', label: 'Perder peso' },
  { id: 'maintain', label: 'Manter peso' },
  { id: 'gain', label: 'Ganhar peso' },
];

export const OnboardingGoalScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { goal, setGoal } = useApp();

  const handleContinue = () => {
    // Se "manter peso", pula DesiredWeight (9) e Speed (10).
    // O stack do navigator não fica poluído: back de Barriers volta direto pra Goal.
    if (goal === 'maintain') {
      nav.navigate('Barriers');
    } else {
      nav.navigate('DesiredWeight');
    }
  };

  return (
    <OnboardingScreen
      step={7}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={!goal}
      onCta={handleContinue}
    >
      <OnboardingTitle>Qual seu objetivo?</OnboardingTitle>
      <OnboardingSubtitle>Vou usar pra gerar um plano calórico personalizado.</OnboardingSubtitle>

      {OPTS.map((o) => (
        <OptionCard
          key={o.id}
          label={o.label}
          selected={goal === o.id}
          onPress={() => setGoal(o.id)}
        />
      ))}
    </OnboardingScreen>
  );
};
