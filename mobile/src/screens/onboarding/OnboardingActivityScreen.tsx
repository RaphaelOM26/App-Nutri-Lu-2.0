// Tela 6 do onboarding — Frequência de treino.
// 3 opções com ícone + subtítulo. Mapeia pra ActivityLevel do BMR.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { OptionCard } from '../../components/OptionCard';
import { Icon } from '../../components/Icons';
import { useTheme } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';
import type { ActivityLevel } from '../../storage/userProfile';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingActivityScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const { activityLevel, setActivityLevel } = useApp();

  const opts: Array<{ id: ActivityLevel; label: string; sub: string; icon: React.ReactNode }> = [
    {
      id: 'sedentary',
      label: '0 – 2',
      sub: 'De vez em quando',
      icon: <Icon.flag size={22} color={theme.primaryDeep} stroke={2} />,
    },
    {
      id: 'moderate',
      label: '3 – 5',
      sub: 'Algumas vezes por semana',
      icon: <Icon.flame size={22} color={theme.primaryDeep} stroke={2} />,
    },
    {
      id: 'athlete',
      label: '6+',
      sub: 'Atleta dedicado',
      icon: <Icon.award size={22} color={theme.primaryDeep} stroke={2} />,
    },
  ];

  return (
    <OnboardingScreen
      step={5}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={!activityLevel}
      onCta={() => nav.navigate('LuExplains')}
    >
      <OnboardingTitle>Quantos treinos por semana?</OnboardingTitle>
      <OnboardingSubtitle>Vamos usar pra calibrar seu plano.</OnboardingSubtitle>

      {opts.map((o) => (
        <OptionCard
          key={o.id}
          label={o.label}
          secondaryLabel={o.sub}
          icon={o.icon}
          selected={activityLevel === o.id}
          onPress={() => setActivityLevel(o.id)}
        />
      ))}
    </OnboardingScreen>
  );
};
