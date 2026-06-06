// Tela 3 do onboarding — Gênero.
// 3 opções single-select. CTA habilita só após escolher.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { OptionCard } from '../../components/OptionCard';
import type { OnboardingStackParamList } from '../../navigation/types';
import type { Gender } from '../../storage/userProfile';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

type Opt = { id: Gender; label: string };
const OPTS: Opt[] = [
  { id: 'female', label: 'Feminino' },
  { id: 'male', label: 'Masculino' },
  { id: 'other', label: 'Outro / Prefiro não dizer' },
];

export const OnboardingGenderScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { gender, setGender } = useApp();

  return (
    <OnboardingScreen
      step={2}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={!gender}
      onCta={() => nav.navigate('BirthDate')}
    >
      <OnboardingTitle>Qual seu gênero?</OnboardingTitle>
      <OnboardingSubtitle>Vamos usar pra calibrar seu plano personalizado.</OnboardingSubtitle>

      <OptionCard label="Feminino" selected={gender === 'female'} onPress={() => setGender('female')} />
      <OptionCard label="Masculino" selected={gender === 'male'} onPress={() => setGender('male')} />
      <OptionCard label="Outro / Prefiro não dizer" selected={gender === 'other'} onPress={() => setGender('other')} />
    </OnboardingScreen>
  );
};
