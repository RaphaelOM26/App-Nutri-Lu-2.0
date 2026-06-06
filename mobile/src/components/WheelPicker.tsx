// Wheel picker estilo iOS — snap suave, fade dos itens fora do centro.
// Pra Telas 4 (Data) e 5 (Altura+Peso) do onboarding.
//
// 7 itens visíveis. Item central tem bg primarySoft (pill), fonte maior + bold.
// Fade pela distância do centro: dist 0 = 1.0, dist 1 = 0.85, dist 2 = 0.58, dist 3+ = 0.32.
//
// Implementação: ScrollView vertical com snapToInterval pra encaixe natural.
// O onMomentumScrollEnd ancora no item mais próximo e dispara onChange.

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT } from '../theme';

const ITEM_H = 40;
const VISIBLE = 7;
const HALF = Math.floor(VISIBLE / 2); // 3 itens de cada lado do centro

type Props<T> = {
  items: T[];
  value: T;
  onChange: (v: T) => void;
  /** Label opcional em caps acima do wheel (ex: "ALTURA"). */
  label?: string;
  /** Função pra formatar cada item pra string visível. Default: String(it). */
  fmt?: (item: T) => string;
};

export function WheelPicker<T>({ items, value, onChange, label, fmt = (x) => String(x) }: Props<T>) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const initialIdx = Math.max(0, items.indexOf(value));
  const [centerIdx, setCenterIdx] = useState(initialIdx);
  const readyRef = useRef(false);
  const lastEmittedRef = useRef(value);

  // Posiciona no item inicial assim que o ScrollView monta.
  // 60ms timeout pra layout estabilizar antes do scrollTo.
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialIdx * ITEM_H, animated: false });
      readyRef.current = true;
    }, 60);
    return () => clearTimeout(t);
  }, [initialIdx]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    if (clamped !== centerIdx) setCenterIdx(clamped);
  };

  // Só notifica o parent quando o usuário PARA de scrollar — evita storm de onChange.
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!readyRef.current) return;
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    const next = items[clamped];
    if (next !== lastEmittedRef.current) {
      lastEmittedRef.current = next;
      onChange(next);
    }
  };

  const tapItem = (idx: number) => {
    scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={{
            fontFamily: FONT.bodyBold,
            fontSize: 11,
            color: theme.textMuted,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}

      <View style={{ position: 'relative', width: '100%', height: ITEM_H * VISIBLE }}>
        {/* Pill central — bg sage soft, fica atrás dos números */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: ITEM_H * HALF,
            left: 8,
            right: 8,
            height: ITEM_H,
            backgroundColor: theme.primarySoft,
            borderRadius: 12,
            zIndex: 0,
          }}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_H}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: ITEM_H * HALF,
            paddingBottom: ITEM_H * HALF,
          }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {items.map((it, i) => {
            const dist = Math.abs(i - centerIdx);
            const opacity = dist === 0 ? 1 : dist === 1 ? 0.85 : dist === 2 ? 0.58 : 0.32;
            const isCenter = dist === 0;
            return (
              <Pressable
                key={i}
                onPress={() => tapItem(i)}
                style={{
                  height: ITEM_H,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: isCenter ? FONT.headExtra : FONT.head,
                    fontSize: isCenter ? 20 : 17,
                    color: isCenter ? theme.primaryDeep : theme.text,
                    opacity,
                  }}
                >
                  {fmt(it)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});
