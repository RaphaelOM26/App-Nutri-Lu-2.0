// Tela 11 do onboarding — Barreiras (multi-select).
// 5 opções com ícone + radio. >=1 obrigatório.

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
  { id: 'constancy', label: 'Falta de constância', icon: Icon.chart },
  { id: 'food', label: 'Alimentação ruim', icon: Icon.recipe },
  { id: 'support', label: 'Falta de apoio', icon: Icon.user },
  { id: 'schedule', label: 'Agenda corrida', icon: Icon.calendar },
  { id: 'ideas', label: 'Falta de ideias de refeição', icon: Icon.apple },
] as const;

export const OnboardingBarriersScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const { barriers, setBarriers } = useApp();

  const toggle = (id: string) => {
    if (barriers.includes(id)) {
      setBarriers(barriers.filter((x) => x !== id));
    } else {
      setBarriers([...barriers, id]);
    }
  };

  return (
    <OnboardingScreen
      step={9}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={barriers.length === 0}
      onCta={() => nav.navigate('Motivations')}
    >
      <OnboardingTitle>O que tá te impedindo?</OnboardingTitle>
      <OnboardingSubtitle>Pode marcar quantos fizerem sentido.</OnboardingSubtitle>

      {OPTS.map((o) => {
        const IconC = o.icon;
        const selected = barriers.includes(o.id);
        return (
          <OptionCard
            key={o.id}
            label={o.label}
            // Ícone sempre verde: o círculo de trás é branco nos dois estados,
            // então branco-no-selecionado sumia (branco no branco).
            icon={<IconC size={22} color={theme.primaryDeep} stroke={2} />}
            selected={selected}
            showRadio
            onPress={() => toggle(o.id)}
          />
        );
      })}
    </OnboardingScreen>
  );
};
