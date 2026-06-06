// Tela 14 do onboarding — Cerimônia/transição emocional antes da geração.
//
// Círculo grande com gradiente accentPink → accentBlue rotacionando lentamente.
// Coração sage no centro pulsando (scale 1.0 ↔ 1.08).
// 6 partículas sage flutuando ao redor (cada uma com fase diferente).
// Texto editorial em DM Serif Display + Plus Jakarta.

import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../../state/AppContext';
import { useTheme, FONT } from '../../theme';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { Icon } from '../../components/Icons';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const RING_SIZE = 220;
const RING_PADDING = 8;
const PARTICLE_RADIUS = 96;
const PARTICLE_COUNT = 6;

export const OnboardingCeremonyScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const { name } = useApp();

  // Rotação contínua do anel gradiente (12s/volta)
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // Pulsação do coração (scale 1.0 ↔ 1.08, 1.2s)
  const heartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rot = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const heart = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    rot.start();
    heart.start();
    return () => {
      rot.stop();
      heart.stop();
    };
  }, [rotateAnim, heartAnim]);

  const rotateZ = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const heartScale = heartAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  // Posições dos 6 pontinhos sage flutuando ao redor
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        return {
          i,
          x: Math.cos(angle) * PARTICLE_RADIUS,
          y: Math.sin(angle) * PARTICLE_RADIUS,
          delay: i * 200,
          duration: 2000 + i * 300,
        };
      }),
    [],
  );

  return (
    <OnboardingScreen ctaLabel="Vamos lá!" onCta={() => nav.navigate('Generating')}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        {/* Círculo grande com gradiente — usamos 2 views aninhadas pra simular borda gradiente */}
        <View
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Anel externo: rotaciona. Sem gradient lib, fingimos com cor sólida + sombra
              tonalizada (combinação accentPink↔accentBlue da palette). */}
          <Animated.View
            style={{
              position: 'absolute',
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: RING_SIZE / 2,
              backgroundColor: theme.accentPink,
              borderWidth: 0,
              transform: [{ rotateZ }],
              shadowColor: theme.accentBlue,
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 5,
            }}
          />
          {/* Centro: cria a "borda" de 8px com fundo cream */}
          <View
            style={{
              width: RING_SIZE - RING_PADDING * 2,
              height: RING_SIZE - RING_PADDING * 2,
              borderRadius: (RING_SIZE - RING_PADDING * 2) / 2,
              backgroundColor: theme.dark ? '#16191b' : '#FAF7F2',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon.heartFill size={64} color={theme.primary} />
            </Animated.View>
          </View>

          {/* Partículas sage flutuando — float vertical com delay diferente */}
          {particles.map((p) => (
            <FloatingParticle key={p.i} x={p.x} y={p.y} delay={p.delay} duration={p.duration} />
          ))}
        </View>

        {/* Texto editorial */}
        <View style={{ marginTop: 40, alignItems: 'center', gap: 10, paddingHorizontal: 12 }}>
          <Text
            style={{
              fontFamily: FONT.serif,
              fontSize: 26,
              color: theme.text,
              textAlign: 'center',
              lineHeight: 34,
            }}
          >
            {name ? `Tudo pronto, ${name}.` : 'Tudo pronto.'}
          </Text>
          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 16,
              color: theme.textMuted,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Valeu pela confiança 💚
          </Text>
          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 16,
              color: theme.textMuted,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Vou montar seu plano agora.
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
};

// Partícula sage que flutua vertical (translateY oscila) — animação infinita
const FloatingParticle: React.FC<{ x: number; y: number; delay: number; duration: number }> = ({
  x,
  y,
  delay,
  duration,
}) => {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay, duration]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: x - 3,
        marginTop: y - 3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.primary,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
};
