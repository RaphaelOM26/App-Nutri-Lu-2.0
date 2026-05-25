// 4 anéis concêntricos (kcal + 3 macros) — porte de components.jsx.
// Cada anel anima de "vazio" até seu valor com stagger sutil pra efeito cascata.

import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  kcal?: number; // 0–1
  p?: number;
  c?: number;
  f?: number;
  size?: number;
};

export const ConcentricRings: React.FC<Props> = ({
  kcal = 0.6,
  p = 0.7,
  c = 0.5,
  f = 0.4,
  size = 200,
}) => {
  const theme = useTheme();
  const stroke = 12;
  const rings = [
    { r: (size - stroke) / 2, v: kcal, color: theme.primary },
    { r: (size - stroke) / 2 - 18, v: p, color: theme.proteinPink },
    { r: (size - stroke) / 2 - 36, v: c, color: theme.carbsBlue },
    { r: (size - stroke) / 2 - 54, v: f, color: theme.fatsGold },
  ];

  // Cria um Animated.Value pra cada anel
  const offsets = useRef(
    rings.map((ring) => new Animated.Value(2 * Math.PI * ring.r)),
  ).current;

  useEffect(() => {
    rings.forEach((ring, i) => {
      const circ = 2 * Math.PI * ring.r;
      const target = circ * (1 - Math.min(1, Math.max(0, ring.v)));
      Animated.timing(offsets[i], {
        toValue: target,
        duration: 900,
        delay: i * 90, // efeito cascata
        useNativeDriver: false,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kcal, p, c, f]);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.r;
        return (
          <G key={i}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={ring.r}
              stroke={theme.ringTrack}
              strokeWidth={stroke}
              fill="none"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={ring.r}
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circ}`}
              strokeDashoffset={offsets[i] as any}
              fill="none"
            />
          </G>
        );
      })}
    </Svg>
  );
};
