// Tela 5 do onboarding — Altura e peso atual.
// 2 WheelPickers: Altura (140-220 cm) · Peso (35-200 kg). SEM toggle imperial (BR sempre métrico).
//
// Peso vira primeira WeightEntry no histórico. Se user volta e muda, substitui a entry mais
// recente (não acumula). Altura via setHeight (campo único).

import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { WheelPicker } from '../../components/WheelPicker';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const HEIGHTS = Array.from({ length: 81 }, (_, i) => 140 + i); // 140-220 cm
const WEIGHTS = Array.from({ length: 166 }, (_, i) => 35 + i); // 35-200 kg

export const OnboardingHeightWeightScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const { heightCm, setHeight, weightEntries, addWeightEntry, removeWeightEntry } = useApp();
  const lastEntry = weightEntries[0]; // mais recente (entries vêm ordenadas DESC)

  const [h, setH] = useState(heightCm ?? 165);
  const [w, setW] = useState(lastEntry?.kg ?? 65);

  const handleContinue = () => {
    setHeight(h);
    // Se já tem entry (user voltou e mudou), substitui a mais recente em vez de acumular.
    if (lastEntry) removeWeightEntry(lastEntry.id);
    addWeightEntry(w, Date.now());
    nav.navigate('Activity');
  };

  return (
    <OnboardingScreen
      step={4}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={handleContinue}
      scrollable={false}
    >
      <OnboardingTitle>Sua altura e peso atual</OnboardingTitle>
      <OnboardingSubtitle>Vamos usar pra calcular suas metas diárias.</OnboardingSubtitle>

      <View style={{ flexDirection: 'row', marginTop: 24, gap: 16 }}>
        <WheelPicker items={HEIGHTS} value={h} onChange={setH} label="Altura" fmt={(x) => `${x} cm`} />
        <WheelPicker items={WEIGHTS} value={w} onChange={setW} label="Peso" fmt={(x) => `${x} kg`} />
      </View>
    </OnboardingScreen>
  );
};
