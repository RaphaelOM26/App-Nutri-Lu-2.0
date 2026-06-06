// Tela 13 do onboarding — Permissão de notificação com priming honesto.
// 3 cards mockup mostrando como vão aparecer as notificações reais.
// "Permitir" dispara o prompt nativo do OS. "Agora não" pula sem pedir.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../../theme';
import { OnboardingScreen, OnboardingTitle, OnboardingSubtitle } from '../../components/OnboardingScreen';
import { LuAvatar } from '../../components/LuAvatar';
import { requestNotificationPermission } from '../../utils/notifications';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const CARDS = [
  { title: 'Hora do almoço', sub: 'Lembrete de refeição', time: '12:30' },
  { title: 'Hidratação', sub: 'Falta beber 800 ml hoje', time: '18:00' },
  { title: 'Insight da Lu', sub: 'Vi seus macros — tem uma dica pra você', time: '21:00' },
];

export const OnboardingNotificationsScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();

  const handleAllow = async () => {
    // Dispara o prompt nativo do OS (ignora resultado — se negar, segue mesmo assim)
    await requestNotificationPermission();
    nav.navigate('Ceremony');
  };

  const handleSkip = () => {
    nav.navigate('Ceremony');
  };

  return (
    <OnboardingScreen
      step={11}
      total={12}
      onBack={() => nav.goBack()}
      ctaLabel="Permitir"
      onCta={handleAllow}
      ctaSecondary={
        <Pressable onPress={handleSkip} accessibilityRole="button">
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 14,
              color: theme.textMuted,
              textDecorationLine: 'underline',
            }}
          >
            Agora não
          </Text>
        </Pressable>
      }
    >
      <OnboardingTitle>Posso te lembrar?</OnboardingTitle>
      <OnboardingSubtitle>Lembretes leves nos horários certos.</OnboardingSubtitle>

      <View style={{ marginTop: 28, gap: 12 }}>
        {CARDS.map((c, i) => (
          <View
            key={i}
            style={{
              backgroundColor: theme.bgElev,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: theme.shadow,
              shadowOpacity: 0.06,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <LuAvatar pose="default" size={32} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.head, fontSize: 14, color: theme.text }}>
                {c.title}
              </Text>
              <Text
                style={{
                  fontFamily: FONT.body,
                  fontSize: 12,
                  color: theme.textMuted,
                  marginTop: 1,
                }}
              >
                {c.sub}
              </Text>
            </View>
            <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 11, color: theme.textFaint }}>
              {c.time}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
};
