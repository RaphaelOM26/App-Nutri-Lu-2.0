// Anel de progresso para um único macro — porte de components.jsx.
// Anima strokeDashoffset com Animated API (sem react-native-reanimated).

import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  value?: number; // 0–1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  inner?: React.ReactNode;
};

export const MacroRing: React.FC<Props> = ({
  value = 0.62,
  size = 140,
  stroke = 12,
  color,
  track,
  inner,
}) => {
  const theme = useTheme();
  const ringColor = color || theme.primary;
  const trackColor = track || theme.ringTrack;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  const target = c * (1 - v);

  // Anima a partir de "vazio" (offset = c) até o target.
  const dashOffset = useRef(new Animated.Value(c)).current;

  useEffect(() => {
    Animated.timing(dashOffset, {
      toValue: target,
      duration: 900,
      useNativeDriver: false, // SVG props não suportam native driver
    }).start();
  }, [target, dashOffset]);

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          strokeDashoffset={dashOffset as any}
          fill="none"
        />
      </Svg>
      {inner && (
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
          {inner}
        </View>
      )}
    </View>
  );
};
