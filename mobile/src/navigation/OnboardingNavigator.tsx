// Stack do onboarding. Rodado quando o user ainda não concluiu o funil
// (isOnboarded === false no AppContext).
//
// Ordem das 16 telas (ver ONBOARDING_SPEC.md):
//   Welcome → Name → Gender → BirthDate → HeightWeight → Activity →
//   LuExplains → Goal → DesiredWeight → Speed → Barriers → Motivations →
//   Notifications → Ceremony → Generating → PlanReady
//
// Skip condicional: quando goal='maintain', GoalScreen pula DesiredWeight e Speed
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
import { OnboardingSpeedScreen } from '../screens/onboarding/OnboardingSpeedScreen';
import { OnboardingBarriersScreen } from '../screens/onboarding/OnboardingBarriersScreen';
import { OnboardingMotivationsScreen } from '../screens/onboarding/OnboardingMotivationsScreen';
import { OnboardingNotificationsScreen } from '../screens/onboarding/OnboardingNotificationsScreen';
import { OnboardingCeremonyScreen } from '../screens/onboarding/OnboardingCeremonyScreen';
import { OnboardingGeneratingScreen } from '../screens/onboarding/OnboardingGeneratingScreen';
import { OnboardingPlanReadyScreen } from '../screens/onboarding/OnboardingPlanReadyScreen';

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
      <Stack.Screen name="Speed" component={OnboardingSpeedScreen} />
      <Stack.Screen name="Barriers" component={OnboardingBarriersScreen} />
      <Stack.Screen name="Motivations" component={OnboardingMotivationsScreen} />
      <Stack.Screen name="Notifications" component={OnboardingNotificationsScreen} />
      {/* Cerimônia, Geração e Payoff bloqueiam back via gestureEnabled+sem header próprio */}
      <Stack.Screen name="Ceremony" component={OnboardingCeremonyScreen} />
      <Stack.Screen name="Generating" component={OnboardingGeneratingScreen} />
      <Stack.Screen name="PlanReady" component={OnboardingPlanReadyScreen} />
    </Stack.Navigator>
  );
}
