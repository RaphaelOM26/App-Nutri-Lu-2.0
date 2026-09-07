// Tela 6 do onboarding — Nível de atividade física.
//
// Cinco opções, na escala da nutricionista. A pergunta mudou de "quantos
// treinos por semana" pra rotina geral porque o gasto de quem treina 3× e passa
// o resto do dia sentada não é o mesmo de quem treina 3× e trabalha em pé — e
// era isso que a escala de treinos ignorava.
//
// A atividade decide DUAS coisas: onde a pessoa cai dentro da faixa kcal/kg da
// fórmula de bolso, e o fator do Harris-Benedict que confere a estimativa.

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
      label: 'Sedentária',
      sub: 'Pouco ou nenhum exercício, rotina sentada',
      icon: <Icon.flag size={22} color={theme.primaryDeep} stroke={2} />,
    },
    {
      id: 'light',
      label: 'Levemente ativa',
      sub: 'Exercício leve 1 a 3 vezes por semana',
      icon: <Icon.chart size={22} color={theme.primaryDeep} stroke={2} />,
    },
    {
      id: 'moderate',
      label: 'Moderadamente ativa',
      sub: 'Exercício 3 a 5 vezes por semana',
      icon: <Icon.flame size={22} color={theme.primaryDeep} stroke={2} />,
    },
    {
      id: 'very',
      label: 'Muito ativa',
      sub: 'Exercício 6 a 7 vezes por semana',
      icon: <Icon.award size={22} color={theme.primaryDeep} stroke={2} />,
    },
    {
      id: 'extreme',
      label: 'Extremamente ativa',
      sub: 'Treino pesado diário ou trabalho braçal',
      icon: <Icon.heart size={22} color={theme.primaryDeep} stroke={2} />,
    },
  ];

  return (
    <OnboardingScreen
      step={5}
      total={11}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      ctaDisabled={!activityLevel}
      onCta={() => nav.navigate('LuExplains')}
    >
      <OnboardingTitle>Como é sua rotina?</OnboardingTitle>
      <OnboardingSubtitle>Contando o dia todo, não só os treinos.</OnboardingSubtitle>

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
