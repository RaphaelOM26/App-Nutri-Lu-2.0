// Card primitivo — porte de components.jsx.
// Container com border-radius, padding e shadow conforme tema.

import React from 'react';
import { View, type ViewStyle, type StyleProp, Platform } from 'react-native';
import { useTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  pad?: number;
  radius?: number;
  elev?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Card: React.FC<Props> = ({ children, pad = 20, radius = 22, elev = true, style }) => {
  const theme = useTheme();
  const shadowStyle: ViewStyle = elev
    ? Platform.select<ViewStyle>({
        ios: {
          shadowColor: theme.dark ? '#000' : '#1B1B1B',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.dark ? 0.3 : 0.04,
          shadowRadius: 2,
        },
        android: {
          elevation: theme.dark ? 0 : 1,
        },
        default: {},
      }) ?? {}
    : {};

  return (
    <View
      style={[
        {
          backgroundColor: theme.bgElev,
          borderRadius: radius,
          padding: pad,
          borderWidth: theme.dark ? 1 : 0,
          borderColor: theme.dark ? 'rgba(255,255,255,0.04)' : 'transparent',
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
};
