// Header do onboarding: back button circular + progress bar animada.
// Usado por todas as telas exceto 1 (boas-vindas) e 16/17 (cerimônia/payoff).
//
// A progress bar anima `width` quando `step` muda (350ms ease-out) — visualiza
// a sensação de avanço entre telas.

import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated, Easing } from 'react-native';
import { useTheme } from '../theme';
import { Icon } from './Icons';

type Props = {
  /** Step atual (0-based ou 1-based, indiferente — só importa a fração step/total). */
  step: number;
  /** Total de steps (ex: 16 — onboarding tem 17 telas mas a primeira não conta progresso). */
  total: number;
  /** Callback do back. Se não passar, o botão fica desabilitado (primeira tela do funil). */
  onBack?: () => void;
};

export const OnboardingHeader: React.FC<Props> = ({ step, total, onBack }) => {
  const theme = useTheme();
  const progress = Math.max(0, Math.min(1, step / total));
  const widthAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animando width — precisa false
    }).start();
  }, [progress, widthAnim]);

  const widthPercent = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 16,
      }}
    >
      {/* Back button circular 44×44 */}
      <Pressable
        onPress={onBack}
        disabled={!onBack}
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.bgSubtle,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: !onBack ? 0.4 : pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}
      >
        <Icon.back size={20} color={theme.text} />
      </Pressable>

      {/* Progress bar: track + fill animado */}
      <View
        style={{
          flex: 1,
          height: 4,
          borderRadius: 999,
          backgroundColor: theme.bgSubtle,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width: widthPercent,
            height: '100%',
            borderRadius: 999,
            backgroundColor: theme.primary,
          }}
        />
      </View>
    </View>
  );
};
