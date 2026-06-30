// Peças visuais compartilhadas das telas premium do plano (Dark Luxe).

import React from 'react';
import { View, Text } from 'react-native';
import { FONT } from '../../theme';
import { PREMIUM as P } from '../../theme/premium';

/** Card de macros: anel de kcal em ouro + 3 colunas P/C/G com cores oficiais. */
export const MacroRow: React.FC<{ kcal: number; p: number; c: number; f: number; compact?: boolean }> = ({
  kcal,
  p,
  c,
  f,
  compact,
}) => {
  const ring = compact ? 60 : 72;
  return (
    <View style={{ backgroundColor: P.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View
        style={{
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: 6,
          borderColor: P.gold,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: FONT.headExtra, fontSize: compact ? 16 : 18, color: P.cream }}>{kcal}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 9, color: P.sage, marginTop: -2 }}>kcal</Text>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
        <MacroCol value={p} label="P" color={P.protein} />
        <MacroCol value={c} label="C" color={P.carbs} />
        <MacroCol value={f} label="G" color={P.fats} />
      </View>
    </View>
  );
};

const MacroCol: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, color: P.cream }}>{value}g</Text>
    <View style={{ width: 22, height: 3, borderRadius: 2, backgroundColor: color, marginVertical: 5 }} />
    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: P.sage, fontWeight: '600' }}>{label}</Text>
  </View>
);
