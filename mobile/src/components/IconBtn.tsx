// Botão circular com ícone — porte de components.jsx.

import React from 'react';
import { Pressable, type ViewStyle, type StyleProp, Platform } from 'react-native';
import { useTheme } from '../theme';
import type { IconProps } from './Icons';

type Variant = 'soft' | 'filled' | 'outline';

type Props = {
  icon: React.FC<IconProps>;
  onPress?: () => void;
  size?: number;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export const IconBtn: React.FC<Props> = ({ icon: IconC, onPress, size = 38, variant = 'soft', style }) => {
  const theme = useTheme();
  let bg: string, color: string, borderWidth = 0;
  switch (variant) {
    case 'soft':
      bg = theme.bgElev;
      color = theme.text;
      break;
    case 'filled':
      bg = theme.text;
      color = theme.bg;
      break;
    case 'outline':
      bg = 'transparent';
      color = theme.text;
      borderWidth = 1;
      break;
  }

  const shadow =
    variant === 'soft' && !theme.dark
      ? Platform.select<ViewStyle>({
          ios: {
            shadowColor: '#1B1B1B',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
          },
          android: { elevation: 1 },
          default: {},
        }) ?? {}
      : {};

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth,
          borderColor: theme.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadow,
        style,
      ]}
    >
      <IconC size={18} color={color} stroke={2} />
    </Pressable>
  );
};
