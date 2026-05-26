// Barra horizontal de progresso para um macro — porte de components.jsx.

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  value: number;
  color: string;
  label: string;
  val: number;
  target: number;
};

export const MacroBar: React.FC<Props> = ({ value, color, label, val, target }) => {
  const theme = useTheme();
  const over = val > target;
  const OVER_RED = '#D67373';
  return (
    <View style={{ flexDirection: 'column', gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 12, fontWeight: '600', color: theme.text }}>{label}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>
          <Text style={{ color: over ? OVER_RED : theme.text, fontWeight: '700' }}>{val}</Text>
          {`/${target}g`}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 100,
          backgroundColor: theme.ringTrack,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.min(100, value * 100)}%`,
            backgroundColor: over ? OVER_RED : color,
            borderRadius: 100,
          }}
        />
      </View>
    </View>
  );
};
