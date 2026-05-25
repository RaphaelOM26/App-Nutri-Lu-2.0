// Botão primário/secundário/outline/ghost/accent — porte de components.jsx.

import React from 'react';
import { Pressable, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme, FONT } from '../theme';
import type { IconProps } from './Icons';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
type Size = 'lg' | 'md' | 'sm';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  onPress?: () => void;
  icon?: React.FC<IconProps>;
  full?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Btn: React.FC<Props> = ({
  children,
  variant = 'primary',
  size = 'lg',
  onPress,
  icon: IconC,
  full = false,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const h = size === 'lg' ? 52 : size === 'md' ? 44 : 36;
  const fontSize = size === 'lg' ? 15 : 14;

  let bg: string, color: string, borderColor: string | undefined;
  switch (variant) {
    case 'primary':
      bg = theme.text;
      color = theme.bg;
      break;
    case 'secondary':
      bg = theme.primarySoft;
      color = theme.primaryDeep;
      break;
    case 'outline':
      bg = 'transparent';
      color = theme.text;
      borderColor = theme.borderStrong;
      break;
    case 'ghost':
      bg = 'transparent';
      color = theme.text;
      break;
    case 'accent':
      bg = theme.primary;
      color = '#FFFFFF';
      break;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: h,
          paddingHorizontal: 22,
          backgroundColor: bg,
          borderRadius: h / 2,
          borderWidth: borderColor ? 1.5 : 0,
          borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: full ? '100%' : undefined,
          alignSelf: full ? undefined : 'flex-start',
        },
        style,
      ]}
    >
      {IconC && (
        <View style={{ marginRight: 8 }}>
          <IconC size={18} color={color} stroke={2} />
        </View>
      )}
      <Text
        style={{
          fontFamily: FONT.head,
          fontSize,
          fontWeight: '700',
          color,
          letterSpacing: 0.2,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
};
