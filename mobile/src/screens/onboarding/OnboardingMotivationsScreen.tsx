// Tela 12 do onboarding — Motivações (multi-select).
// 4 opções com ícone + radio. >=1 obrigatório.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { OptionCard } from '../../components/OptionCard';
import { Icon } from '../../components/Icons';
import { useTheme } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const OPTS = [
  { id: 'live', label: 'Comer e viver melhor', icon: Icon.apple },
  { id: 'energy', label: 'Mais energia e disposição', icon: Icon.flame },
  { id: 'consistency', label: 'Manter motivação e constância', icon: Icon.award },
  { id: 'body', label: 'Me sentir bem com meu corpo', icon: Icon.heart },
] as const;

export const OnboardingMotivationsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const { motivations, setMotivations } = useApp();

  const toggle = (id: string) => {
    if (motivations.includes(id)) {
      setMotivations(motivations.filter((x) => x !== id));
    } else {
      setMotivations([...motivations, id]);
    }
  };

  return (
    <OnboardingScreen
      step={10}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={motivations.length === 0}
      onCta={() => nav.navigate('Notifications')}
    >
      <OnboardingTitle>O que você quer alcançar?</OnboardingTitle>
      <OnboardingSubtitle>Pode marcar quantos fizerem sentido.</OnboardingSubtitle>

      {OPTS.map((o) => {
        const IconC = o.icon;
        const selected = motivations.includes(o.id);
        return (
          <OptionCard
            key={o.id}
            label={o.label}
            icon={<IconC size={22} color={selected ? '#fff' : theme.primaryDeep} stroke={2} />}
            selected={selected}
            showRadio
            onPress={() => toggle(o.id)}
          />
        );
      })}
    </OnboardingScreen>
  );
};
