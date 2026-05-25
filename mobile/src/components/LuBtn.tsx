// Atalho pra Chat IA Lu — porte de components.jsx.

import React from 'react';
import { Pressable, Text, View, Platform, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme, FONT } from '../theme';

type Props = {
  onPress?: () => void;
  label?: boolean;
};

export const LuBtn: React.FC<Props> = ({ onPress, label = false }) => {
  const theme = useTheme();
  const shadow =
    !theme.dark
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
      accessibilityLabel="Falar com Lu"
      style={[
        {
          height: 38,
          paddingLeft: label ? 4 : 0,
          paddingRight: label ? 12 : 0,
          width: label ? undefined : 38,
          borderRadius: 19,
          backgroundColor: theme.bgElev,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          justifyContent: 'center',
        },
        shadow,
      ]}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: theme.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </Svg>
      </View>
      {label && (
        <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text, letterSpacing: -0.01 }}>
          Lu
        </Text>
      )}
    </Pressable>
  );
};
