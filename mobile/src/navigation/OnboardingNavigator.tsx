// Stack do onboarding. Rodado quando o user ainda não concluiu o funil
// (isOnboarded === false no AppContext).
//
// Ordem das 22 telas — 13 de perfil, 8 de anamnese e a estimativa no fim.
// A anamnese vem ANTES da estimativa a pedido da nutricionista: a paciente não
// deve ancorar num número antes de ser perguntada sobre si mesma.
//   Welcome → Name → Gender → BirthDate → HeightWeight → Activity →
//   LuExplains → Goal → DesiredWeight → Barriers → Motivations →
//   Notifications → Ceremony → [anamnese: 3 aberturas + 5 perguntas] → Estimate
//
// Skip condicional: quando goal='maintain', GoalScreen pula DesiredWeight
// (navega direto pra Barriers). Stack continua limpo — back funciona corretamente.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingNameScreen } from '../screens/onboarding/OnboardingNameScreen';
import { OnboardingGenderScreen } from '../screens/onboarding/OnboardingGenderScreen';
import { OnboardingBirthDateScreen } from '../screens/onboarding/OnboardingBirthDateScreen';
import { OnboardingHeightWeightScreen } from '../screens/onboarding/OnboardingHeightWeightScreen';
import { OnboardingActivityScreen } from '../screens/onboarding/OnboardingActivityScreen';
import { OnboardingLuExplainsScreen } from '../screens/onboarding/OnboardingLuExplainsScreen';
import { OnboardingGoalScreen } from '../screens/onboarding/OnboardingGoalScreen';
import { OnboardingDesiredWeightScreen } from '../screens/onboarding/OnboardingDesiredWeightScreen';
import { OnboardingBarriersScreen } from '../screens/onboarding/OnboardingBarriersScreen';
import { OnboardingMotivationsScreen } from '../screens/onboarding/OnboardingMotivationsScreen';
import { OnboardingNotificationsScreen } from '../screens/onboarding/OnboardingNotificationsScreen';
import { OnboardingCeremonyScreen } from '../screens/onboarding/OnboardingCeremonyScreen';
import { OnboardingEstimateScreen } from '../screens/onboarding/OnboardingEstimateScreen';
import {
  AnamneseIntroComidaScreen,
  AnamnesePreferenciasScreen,
  AnamneseIntroRotinaScreen,
  AnamneseDiaNormalScreen,
  AnamneseLimitacoesScreen,
  AnamneseIntroCorpoScreen,
  AnamneseFomeDocesScreen,
  AnamneseAguaSonoScreen,
} from '../screens/onboarding/OnboardingAnamnese';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // bloqueia swipe-back nativo do iOS — back só via OnboardingHeader
      }}
    >
      <Stack.Screen name="Welcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="Name" component={OnboardingNameScreen} />
      <Stack.Screen name="Gender" component={OnboardingGenderScreen} />
      <Stack.Screen name="BirthDate" component={OnboardingBirthDateScreen} />
      <Stack.Screen name="HeightWeight" component={OnboardingHeightWeightScreen} />
      <Stack.Screen name="Activity" component={OnboardingActivityScreen} />
      <Stack.Screen name="LuExplains" component={OnboardingLuExplainsScreen} />
      <Stack.Screen name="Goal" component={OnboardingGoalScreen} />
      <Stack.Screen name="DesiredWeight" component={OnboardingDesiredWeightScreen} />
      <Stack.Screen name="Barriers" component={OnboardingBarriersScreen} />
      <Stack.Screen name="Motivations" component={OnboardingMotivationsScreen} />
      <Stack.Screen name="Notifications" component={OnboardingNotificationsScreen} />
      {/* Cerimônia e Estimativa bloqueiam back via gestureEnabled+sem header próprio */}
      <Stack.Screen name="Ceremony" component={OnboardingCeremonyScreen} />
      <Stack.Screen name="AnamneseIntroComida" component={AnamneseIntroComidaScreen} />
      <Stack.Screen name="AnamnesePreferencias" component={AnamnesePreferenciasScreen} />
      <Stack.Screen name="AnamneseIntroRotina" component={AnamneseIntroRotinaScreen} />
      <Stack.Screen name="AnamneseDiaNormal" component={AnamneseDiaNormalScreen} />
      <Stack.Screen name="AnamneseLimitacoes" component={AnamneseLimitacoesScreen} />
      <Stack.Screen name="AnamneseIntroCorpo" component={AnamneseIntroCorpoScreen} />
      <Stack.Screen name="AnamneseFomeDoces" component={AnamneseFomeDocesScreen} />
      <Stack.Screen name="AnamneseAguaSono" component={AnamneseAguaSonoScreen} />
      <Stack.Screen name="Estimate" component={OnboardingEstimateScreen} />
    </Stack.Navigator>
  );
}
