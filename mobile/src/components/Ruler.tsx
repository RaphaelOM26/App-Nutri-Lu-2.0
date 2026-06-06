// Régua horizontal scrollable estilo iOS — ticks + indicador central + snap por unidade.
// Pra Tela 9 (Peso desejado) do onboarding.
//
// Ticks: grandes (40px altura) a cada 5 unidades, com label embaixo.
// Pequenos (22px altura) a cada 1 unidade.
// Indicador central: barra vertical sage 2px com glow leve.
// Padding lateral 50% pra permitir scroll até o primeiro e último valor.

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { useTheme, FONT } from '../theme';

const STEP_PX = 12; // largura em px de cada unidade (1 kg) — ticks ficam espaçados nessa distância

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  /** Sufixo opcional pra ler como "70 kg" ao invés de só "70" (não usado aqui — só pros ticks). */
  unit?: string;
};

export const Ruler: React.FC<Props> = ({ min, max, value, onChange }) => {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const { width: screenW } = useWindowDimensions();
  const padding = Math.floor(screenW / 2); // padding lateral pra primeiro e último valor poderem centralizar
  const lastEmittedRef = useRef(value);
  const positionedRef = useRef(false);

  // Posicionamento inicial UMA vez no mount. Depois disso, NUNCA scrollTo durante
  // mudança de value — senão briga com o gesto do user (interrompe o scroll dele a
  // cada frame). Se o parent precisar resetar pra um valor externo, lastEmittedRef
  // não vai bater com o novo value e a gente scrollTo programaticamente.
  useEffect(() => {
    if (positionedRef.current && value === lastEmittedRef.current) return;
    const t = setTimeout(() => {
      const offset = (value - min) * STEP_PX;
      scrollRef.current?.scrollTo({ x: offset, animated: positionedRef.current });
      positionedRef.current = true;
      lastEmittedRef.current = value;
    }, 60);
    return () => clearTimeout(t);
  }, [min, value]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const v = Math.round(x / STEP_PX) + min;
    const clamped = Math.max(min, Math.min(max, v));
    if (clamped !== lastEmittedRef.current) {
      lastEmittedRef.current = clamped;
      onChange(clamped);
    }
  };

  const ticks: number[] = [];
  for (let i = min; i <= max; i++) ticks.push(i);

  return (
    <View style={{ position: 'relative', width: '100%', height: 90 }}>
      {/* Indicador central — fica fixo no meio enquanto a régua rola atrás */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          marginLeft: -1,
          width: 2,
          height: 56,
          backgroundColor: theme.primary,
          borderRadius: 2,
          zIndex: 3,
          // glow sutil pra destacar da régua
          shadowColor: theme.primary,
          shadowOpacity: 0.4,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
          elevation: 3,
        }}
      />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={STEP_PX}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'flex-start', paddingHorizontal: 0 }}
      >
        {/* Espaçador esquerdo pra primeiro valor poder centralizar no indicador */}
        <View style={{ width: padding }} />

        {ticks.map((t) => {
          const major = t % 5 === 0;
          return (
            <View
              key={t}
              style={{
                width: STEP_PX,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 2,
                  height: major ? 40 : 22,
                  backgroundColor: major ? theme.text : theme.border,
                  borderRadius: 2,
                  marginTop: 10,
                }}
              />
              {major && (
                <Text
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 11,
                    color: theme.textMuted,
                    marginTop: 6,
                  }}
                  numberOfLines={1}
                >
                  {t}
                </Text>
              )}
            </View>
          );
        })}

        {/* Espaçador direito pra último valor poder centralizar no indicador */}
        <View style={{ width: padding }} />
      </ScrollView>
    </View>
  );
};
