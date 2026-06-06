// Tela 1 do onboarding — Boas-vindas (hero).
//
// Mockup de celular no topo com 2 frames em crossfade infinito (2.5s cada):
//   Frame A: tela de câmera enquadrando um prato (retículo nos cantos + pill "Foto")
//   Frame B: tela de resultado mostrando macros DAQUELE prato (foto + título + 4 stats)
//
// O Frame B foi pivotado em 2026-06-05 após feedback do Raphael — antes era a Home com
// anéis de macros do dia; agora é a tela de detalhe do alimento detectado. Conta a história
// "Foto → Macros" literal (input → output).

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../../theme';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import type { OnboardingStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;

// Imagem genérica de prato — frango grelhado bowl-style. Carrega via Unsplash CDN.
// Mesma URL usada nos 2 frames pra dar sensação de continuidade (mesmo prato).
const FOOD_PHOTO = {
  uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=800&fit=crop&auto=format&q=80',
};

const MOCKUP_W = 200;
const MOCKUP_H = 400;

export const OnboardingWelcomeScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const theme = useTheme();

  // Crossfade entre Frame A (camera) e Frame B (result) em loop infinito.
  const frameAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(frameAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
        Animated.timing(frameAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(frameAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(frameAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [frameAnim]);

  const opacityA = frameAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const opacityB = frameAnim;

  return (
    <OnboardingScreen ctaLabel="Começar" onCta={() => nav.navigate('Name')}>
      <View style={{ flex: 1 }}>
        {/* Mockup do celular */}
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 20, flex: 1 }}>
          <View
            style={{
              width: MOCKUP_W,
              height: MOCKUP_H,
              borderRadius: 34,
              backgroundColor: '#1B1B1B',
              padding: 8,
              shadowColor: '#1B1B1B',
              shadowOpacity: 0.22,
              shadowRadius: 60,
              shadowOffset: { width: 0, height: 30 },
              elevation: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 26,
                overflow: 'hidden',
                backgroundColor: '#000',
                position: 'relative',
              }}
            >
              {/* Frame A — câmera */}
              <Animated.View style={{ ...StyleSheet_absoluteFill, opacity: opacityA }}>
                <Image
                  source={FOOD_PHOTO}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {/* Overlay escurecido sutil pra parecer preview de câmera */}
                <View
                  style={{
                    ...StyleSheet_absoluteFill,
                    backgroundColor: 'rgba(0,0,0,0.15)',
                  }}
                />
                {/* Retículo nos 4 cantos */}
                <CameraReticule />
                {/* Pill "Foto" no rodapé */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 100,
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT.head,
                        fontSize: 11,
                        color: '#1B1B1B',
                      }}
                    >
                      Foto
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Frame B — tela de detalhe do alimento (resultado do scan) */}
              <Animated.View
                style={{
                  ...StyleSheet_absoluteFill,
                  opacity: opacityB,
                  backgroundColor: theme.bg,
                }}
              >
                <FoodDetailMockup />
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Textos hero — título serif + subtítulo cinza */}
        <View style={{ alignItems: 'center', paddingHorizontal: 8, marginTop: 24 }}>
          <Text
            style={{
              fontFamily: FONT.serif,
              fontSize: 38,
              color: theme.text,
              textAlign: 'center',
              lineHeight: 42,
            }}
          >
            Foto. Macros. Pronto.
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: FONT.head,
              fontSize: 16,
              color: theme.textMuted,
              textAlign: 'center',
              maxWidth: 280,
              lineHeight: 22,
            }}
          >
            Acompanhe seus macros sem esforço
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
};

// Helper de absoluteFill (não importei do StyleSheet pra evitar import extra)
const StyleSheet_absoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

// ─── Retículo decorativo do frame da câmera ──
const CameraReticule: React.FC = () => {
  const SIZE = 110;
  const CORNER = 16;
  const STROKE = 2.5;
  const COLOR = '#fff';

  return (
    <View
      style={{
        position: 'absolute',
        top: '36%',
        left: '50%',
        marginLeft: -SIZE / 2,
        width: SIZE,
        height: SIZE,
      }}
    >
      {/* TL */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: CORNER,
          height: CORNER,
          borderTopWidth: STROKE,
          borderLeftWidth: STROKE,
          borderColor: COLOR,
          borderTopLeftRadius: 8,
        }}
      />
      {/* TR */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: CORNER,
          height: CORNER,
          borderTopWidth: STROKE,
          borderRightWidth: STROKE,
          borderColor: COLOR,
          borderTopRightRadius: 8,
        }}
      />
      {/* BL */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: CORNER,
          height: CORNER,
          borderBottomWidth: STROKE,
          borderLeftWidth: STROKE,
          borderColor: COLOR,
          borderBottomLeftRadius: 8,
        }}
      />
      {/* BR */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: CORNER,
          height: CORNER,
          borderBottomWidth: STROKE,
          borderRightWidth: STROKE,
          borderColor: COLOR,
          borderBottomRightRadius: 8,
        }}
      />
    </View>
  );
};

// ─── Frame B: detalhe do alimento (mostra "o que a Lu vê") ──
const FoodDetailMockup: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Foto do alimento ocupando ~50% do topo */}
      <Image
        source={FOOD_PHOTO}
        style={{ width: '100%', height: '48%' }}
        resizeMode="cover"
      />

      {/* Card de info abaixo */}
      <View style={{ flex: 1, padding: 12 }}>
        {/* Badges */}
        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
          {['Almoço', 'Alto em proteína'].map((tag) => (
            <View
              key={tag}
              style={{
                backgroundColor: theme.bgSubtle,
                borderRadius: 100,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ fontFamily: FONT.body, fontSize: 8, color: theme.textMuted }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Título do prato */}
        <Text
          numberOfLines={2}
          style={{
            marginTop: 6,
            fontFamily: FONT.head,
            fontSize: 11,
            color: theme.text,
            lineHeight: 14,
          }}
        >
          Bowl de salada com frango grelhado
        </Text>

        {/* 4 macros em linha */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingHorizontal: 2,
          }}
        >
          {[
            { val: '480', label: 'kcal', color: theme.primary },
            { val: '38g', label: 'P', color: theme.proteinPink },
            { val: '45g', label: 'C', color: theme.carbsBlue },
            { val: '12g', label: 'G', color: theme.fatsGold },
          ].map((m) => (
            <View key={m.label} style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: FONT.headExtra,
                  fontSize: 12,
                  color: theme.text,
                }}
              >
                {m.val}
              </Text>
              <View
                style={{
                  marginTop: 2,
                  height: 3,
                  width: 14,
                  borderRadius: 2,
                  backgroundColor: m.color,
                }}
              />
              <Text
                style={{
                  marginTop: 2,
                  fontFamily: FONT.body,
                  fontSize: 8,
                  color: theme.textMuted,
                }}
              >
                {m.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
