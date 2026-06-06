// Tela 15 do onboarding — Gerando o plano.
//
// Animação 0 → 100% em 4 segundos. Subtítulo rotaciona conforme a porcentagem
// (5 mensagens diferentes). Checklist de 5 items preenchendo em sequência.
//
// No START: dispara cálculo dos macros via computeMacros() e salva no AppContext.
// No END (100%): navega automaticamente pra PlanReady.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../state/AppContext';
import { useTheme, FONT } from '../../theme';
import { Icon } from '../../components/Icons';
import { computeMacros } from '../../utils/macroCalc';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

const DURATION_MS = 4000;
const SUBS = [
  'Calculando seu metabolismo basal…',
  'Definindo suas metas de macros…',
  'Selecionando receitas pro seu perfil…',
  'Configurando seus lembretes…',
  'Quase lá…',
];
const CHECKS = [
  { label: 'Calorias', at: 20 },
  { label: 'Carboidratos', at: 40 },
  { label: 'Proteína', at: 60 },
  { label: 'Gordura', at: 80 },
  { label: 'Hidratação', at: 95 },
];

export const OnboardingGeneratingScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();
  const {
    gender,
    birthDate,
    heightCm,
    weightEntries,
    activityLevel,
    goal,
    weeklyRateKg,
    setMacroTargets,
  } = useApp();

  const [pct, setPct] = useState(0);
  const startedRef = useRef(false);
  const macrosComputedRef = useRef(false);

  // Calcula macros UMA vez no mount, salva no AppContext.
  // Fallback gracioso: se algum campo faltar, usa defaults seguros.
  useEffect(() => {
    if (macrosComputedRef.current) return;
    macrosComputedRef.current = true;
    try {
      const profile = {
        gender: gender ?? 'female',
        birthDate: birthDate ?? new Date(2000, 0, 1).getTime(),
        heightCm: heightCm ?? 165,
        weightKg: weightEntries[0]?.kg ?? 65,
        activityLevel: activityLevel ?? 'moderate',
        goal: goal ?? 'maintain',
        weeklyRateKg: weeklyRateKg ?? 0.5,
      };
      const targets = computeMacros(profile);
      setMacroTargets({ kcal: targets.kcal, p: targets.p, c: targets.c, f: targets.f });
    } catch (err) {
      console.warn('[onboarding] cálculo de macros falhou:', err);
    }
  }, [gender, birthDate, heightCm, weightEntries, activityLevel, goal, weeklyRateKg, setMacroTargets]);

  // Animação 0 → 100 em 4s. Atualiza state a cada frame.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let raf: number;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / DURATION_MS);
      setPct(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Pequeno delay no fim antes de navegar — deixa o user ver "100%"
        setTimeout(() => nav.navigate('PlanReady'), 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nav]);

  const sub = SUBS[Math.min(SUBS.length - 1, Math.floor(pct / 20))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: FONT.headExtra,
              fontSize: 64,
              color: theme.text,
              letterSpacing: -2,
            }}
          >
            {pct}%
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontFamily: FONT.serif,
              fontSize: 22,
              color: theme.text,
              textAlign: 'center',
            }}
          >
            Tô preparando tudo pra você
          </Text>

          {/* Barra de progresso gradient pink → blue */}
          <View
            style={{
              marginTop: 20,
              marginBottom: 12,
              height: 6,
              borderRadius: 999,
              backgroundColor: theme.bgSubtle,
              overflow: 'hidden',
              width: '100%',
            }}
          >
            {/* Fingimos gradiente com 2 views sobrepostas — esquerda pink, direita blue */}
            <View
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: theme.accentPink,
                borderRadius: 999,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: `${pct}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: theme.accentBlue,
                opacity: pct / 100, // mistura gradativa
              }}
            />
          </View>

          <Text
            key={sub}
            style={{
              fontFamily: FONT.body,
              fontSize: 14,
              color: theme.textMuted,
              textAlign: 'center',
            }}
          >
            {sub}
          </Text>
        </View>

        {/* Card de checklist */}
        <View
          style={{
            marginTop: 28,
            backgroundColor: theme.bgSubtle,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 14,
              color: theme.text,
              marginBottom: 12,
            }}
          >
            Recomendação diária pra você
          </Text>
          {CHECKS.map((c, i) => (
            <ChecklistItem key={i} label={c.label} done={pct >= c.at} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Item da checklist com check animado quando vira "done"
const ChecklistItem: React.FC<{ label: string; done: boolean }> = ({ label, done }) => {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    if (done) {
      Animated.spring(anim, {
        toValue: 1,
        damping: 8,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [done, anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <Animated.View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: done ? theme.primary : 'transparent',
          borderWidth: done ? 0 : 2,
          borderColor: theme.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: done ? scale : 1 }],
        }}
      >
        {done && <Icon.check size={14} color="#fff" stroke={3} />}
      </Animated.View>
      <Text
        style={{
          fontFamily: FONT.bodyMedium,
          fontSize: 14,
          color: done ? theme.text : theme.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
