// Tela 16 do onboarding — Payoff final ("Pronto! Seu plano tá feito").
//
// Checkmark sage gigante com spring bounce in. Título DM Serif Display.
// Pill com data calculada da meta. Grid 2x2 de mini-cards com macros + anéis animados.
// Count-up nos números (0 → valor final em 800ms).
//
// Ao clicar "Bora começar!": setOnboardedAt(now) → App.tsx detecta isOnboarded=true
// e troca automaticamente do OnboardingNavigator pro RootNavigator.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../state/AppContext';
import { useTheme, FONT } from '../../theme';
import { Icon } from '../../components/Icons';
import { daysToReachGoal, formatGoalDate } from '../../utils/macroCalc';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const OnboardingPlanReadyScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const {
    name,
    goal,
    weightGoalKg,
    weeklyRateKg,
    weightEntries,
    dailyMacros,
    setOnboardedAt,
  } = useApp();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Bounce in do checkmark
  const checkAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: 1,
      damping: 6,
      stiffness: 160,
      useNativeDriver: true,
    }).start();
  }, [checkAnim]);

  const currentWeight = weightEntries[0]?.kg ?? 65;
  const diff = Math.abs(currentWeight - weightGoalKg);
  const days = daysToReachGoal({
    currentWeightKg: currentWeight,
    targetWeightKg: weightGoalKg,
    weeklyRateKg: weeklyRateKg ?? 0.5,
    goal: goal ?? 'maintain',
  });

  // Pill da meta
  let pillText: string;
  if (goal === 'maintain' || days === 0) {
    pillText = 'Sua meta diária pra manter o peso';
  } else {
    const verb = goal === 'gain' ? 'ganhar' : 'perder';
    pillText = `Pode ${verb} ${diff.toFixed(1).replace('.', ',')} kg até ${formatGoalDate(days)}`;
  }

  // Hidratação: 35ml × peso, em litros
  const waterL = Math.round((currentWeight * 35) / 100) / 10;

  const handleFinish = () => {
    setOnboardedAt(Date.now());
    // Não precisa navigate — App.tsx detecta isOnboarded e troca de navigator.
  };

  const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View style={{ flex: 1, paddingTop: 12 }}>
        {/* Conteúdo scrollável poderia ser, mas com layout fixo cabe sem scroll */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
          <Animated.View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: checkScale }],
            }}
          >
            <Icon.check size={40} color="#fff" stroke={3} />
          </Animated.View>

          <Text
            style={{
              marginTop: 20,
              fontFamily: FONT.serif,
              fontSize: 26,
              color: theme.text,
              textAlign: 'center',
              lineHeight: 32,
            }}
          >
            {name ? `Pronto, ${name}! Seu plano tá feito` : 'Pronto! Seu plano tá feito'}
          </Text>

          {/* Pill da meta */}
          <View
            style={{
              marginTop: 16,
              backgroundColor: theme.bgSubtle,
              borderRadius: 999,
              paddingHorizontal: 24,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                fontFamily: FONT.head,
                fontSize: 14,
                color: theme.text,
                textAlign: 'center',
              }}
            >
              {pillText}
            </Text>
          </View>
        </View>

        {/* Card grande com 4 mini-cards de macros */}
        <View
          style={{
            margin: 24,
            backgroundColor: theme.bgSubtle,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <Text style={{ fontFamily: FONT.head, fontSize: 18, color: theme.text }}>
            Recomendação diária
          </Text>
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 14,
              color: theme.textMuted,
              marginTop: 2,
            }}
          >
            Você pode editar a qualquer momento
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 16,
            }}
          >
            <MacroMiniCard
              icon={<Icon.flame size={16} color={theme.primary} stroke={2} />}
              label="Kcal"
              value={dailyMacros.kcal.target}
              color={theme.primary}
              active={mounted}
              delay={0}
            />
            <MacroMiniCard
              icon={<Icon.wheat size={16} color={theme.carbsBlue} stroke={2} />}
              label="Carbs"
              value={dailyMacros.c.target}
              suffix="g"
              color={theme.carbsBlue}
              active={mounted}
              delay={100}
            />
            <MacroMiniCard
              icon={<Icon.drumstick size={16} color={theme.proteinPink} stroke={2} />}
              label="Prot"
              value={dailyMacros.p.target}
              suffix="g"
              color={theme.proteinPink}
              active={mounted}
              delay={200}
            />
            <MacroMiniCard
              icon={<Icon.droplet size={16} color={theme.waterIce} stroke={2} />}
              label="Água"
              value={waterL}
              suffix="L"
              decimals={1}
              color={theme.waterIce}
              active={mounted}
              delay={300}
            />
          </View>
        </View>

        {/* CTA fixo no rodapé */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 24, marginTop: 'auto' }}>
          <Animated.View>
            <Text
              accessibilityRole="button"
              onPress={handleFinish}
              style={{
                height: 56,
                borderRadius: 999,
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                fontFamily: FONT.head,
                fontSize: 18,
                textAlign: 'center',
                textAlignVertical: 'center',
                lineHeight: 56,
                overflow: 'hidden',
              }}
            >
              Bora começar!
            </Text>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Mini-card de macro com anel animado + count-up ──

type MiniCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  color: string;
  active: boolean;
  delay: number;
};

const RING_SIZE = 60;
const RING_STROKE = 5;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;
const RING_FILL_PCT = 0.75; // visualmente preenche 75% (estético — não é "% bater meta")

const MacroMiniCard: React.FC<MiniCardProps> = ({
  icon,
  label,
  value,
  suffix = '',
  decimals = 0,
  color,
  active,
  delay,
}) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    // Count-up do número
    let raf: number;
    let start: number | null = null;
    const dur = 800;
    const tick = (t: number) => {
      if (start === null) start = t + delay;
      if (t < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (t - start) / dur);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayValue(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Ring animation
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: dur,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animando strokeDashoffset
    }).start();

    return () => cancelAnimationFrame(raf);
  }, [active, value, delay, ringAnim]);

  const dashOffset = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRC, RING_CIRC * (1 - RING_FILL_PCT)],
  });

  const display = decimals === 1 ? displayValue.toFixed(1).replace('.', ',') : Math.round(displayValue);

  return (
    <View
      style={{
        flexBasis: '48%',
        backgroundColor: theme.bgElev,
        borderRadius: 16,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {icon}
        <Text style={{ fontFamily: FONT.bodyBold, fontSize: 12, color: theme.textMuted }}>
          {label}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: RING_SIZE, height: RING_SIZE, position: 'relative' }}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={theme.ringTrack}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_R}
              stroke={color}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashOffset}
            />
          </Svg>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, color: theme.text }}>
              {display}
              {suffix}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 10, right: 12 }}>
        <Icon.edit size={14} color={theme.textFaint} />
      </View>
    </View>
  );
};
