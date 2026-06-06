// Tela 7 do onboarding — Lu explica (editorial).
// Sem cards/inputs — só texto serif grande + LuAvatar pequeno.

import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../../theme';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { LuAvatar } from '../../components/LuAvatar';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingLuExplainsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();

  return (
    <OnboardingScreen
      step={6}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Continuar"
      onCta={() => nav.navigate('Goal')}
    >
      <View style={{ paddingTop: 12 }}>
        <LuAvatar pose="default" size={56} />

        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontFamily: FONT.serif,
              fontSize: 28,
              lineHeight: 36,
              color: theme.text,
            }}
          >
            Pessoas que acompanham o que comem têm{' '}
            <Text style={{ color: theme.primary }}>2x mais chance</Text>{' '}
            de bater suas metas.
          </Text>

          <Text
            style={{
              marginTop: 20,
              fontFamily: FONT.head,
              fontSize: 16,
              color: theme.textMuted,
              lineHeight: 24,
            }}
          >
            Junto comigo, vai ser muito mais fácil.
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
};
