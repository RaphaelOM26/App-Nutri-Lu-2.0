// Chip clicável (filtros, tabs horizontais) — porte de components.jsx.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme, FONT } from '../theme';
import type { IconProps } from './Icons';

type Props = {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  icon?: React.FC<IconProps>;
};

export const Chip: React.FC<Props> = ({ children, active = false, onPress, icon: IconC }) => {
  const theme = useTheme();
  const bg = active ? theme.text : theme.bgElev;
  const color = active ? theme.bg : theme.text;
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 32,
        paddingHorizontal: 14,
        backgroundColor: bg,
        borderRadius: 16,
        borderWidth: active ? 0 : 1,
        borderColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {IconC && (
        <View style={{ marginRight: 6 }}>
          <IconC size={14} color={color} stroke={2} />
        </View>
      )}
      <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 13, fontWeight: '600', color }}>{children}</Text>
    </Pressable>
  );
};
