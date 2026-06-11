// Botão primário/secundário/outline/ghost/accent — porte de components.jsx.
// Toque tem feedback tátil: encolhe ~3% com mola (motion pass 2026-06-11).

import React, { useRef } from 'react';
import { Animated, Pressable, Text, View, type ViewStyle, type StyleProp } from 'react-native';
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
  const scale = useRef(new Animated.Value(1)).current;
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

  const pressTo = (v: number, stiff: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: true, damping: 24, stiffness: stiff, mass: 0.6 }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => pressTo(0.97, 420)}
      onPressOut={() => pressTo(1, 280)}
      style={{ width: full ? '100%' : undefined, alignSelf: full ? undefined : 'flex-start' }}
    >
      <Animated.View
        style={[
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
            opacity: disabled ? 0.5 : 1,
            width: full ? '100%' : undefined,
            transform: [{ scale }],
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
      </Animated.View>
    </Pressable>
  );
};
