// Tela 4 do onboarding — Data de nascimento.
// 3 WheelPickers lado a lado: Mês (Jan/Fev/Mar...) · Dia (1-31) · Ano (1940-2010).
// Estado local até "Continuar" pra evitar storm de saves no AsyncStorage.

import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { WheelPicker } from '../../components/WheelPicker';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const MESES_ABREV = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 71 }, (_, i) => 1940 + i);
const MONTH_IDX = Array.from({ length: 12 }, (_, i) => i);

export const OnboardingBirthDateScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { birthDate, setBirthDate } = useApp();

  // Hidrata do AppContext (se já respondeu) ou usa default 1 Jan 2000.
  const initial = birthDate ? new Date(birthDate) : new Date(2000, 0, 1);
  const [m, setM] = useState(initial.getMonth());
  const [d, setD] = useState(initial.getDate());
  const [y, setY] = useState(initial.getFullYear());

  const handleContinue = () => {
    // Math.min do dia evita "30 fev" (se user selecionou 30 de jan + fev → vira 28/29)
    const safeDay = Math.min(d, new Date(y, m + 1, 0).getDate());
    const ts = new Date(y, m, safeDay).getTime();
    setBirthDate(ts);
    nav.navigate('HeightWeight');
  };

  return (
    <OnboardingScreen
      step={3}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={handleContinue}
      scrollable={false}
    >
      <OnboardingTitle>Quando você nasceu?</OnboardingTitle>
      <OnboardingSubtitle>Sua idade entra no cálculo das suas metas diárias.</OnboardingSubtitle>

      <View style={{ flexDirection: 'row', marginTop: 24, gap: 8 }}>
        <WheelPicker items={MONTH_IDX} value={m} onChange={setM} label="Mês" fmt={(i) => MESES_ABREV[i]} />
        <WheelPicker items={DAYS} value={d} onChange={setD} label="Dia" />
        <WheelPicker items={YEARS} value={y} onChange={setY} label="Ano" />
      </View>
    </OnboardingScreen>
  );
};
