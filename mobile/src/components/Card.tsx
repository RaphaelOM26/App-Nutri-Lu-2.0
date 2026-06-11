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
  // Sombra "premium": mais difusa e levemente mais presente — profundidade
  // suave em vez de risco duro sob o card (motion & depth pass 2026-06-11).
  const shadowStyle: ViewStyle = elev
    ? Platform.select<ViewStyle>({
        ios: {
          shadowColor: theme.dark ? '#000' : '#1B1B1B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.dark ? 0.35 : 0.06,
          shadowRadius: 12,
        },
        android: {
          elevation: theme.dark ? 0 : 2,
          // Android 9+ aceita cor na sombra da elevation — esquenta o tom
          // pra não ficar cinza-azulado de Material default.
          shadowColor: theme.dark ? '#000' : 'rgba(27,27,27,0.5)',
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
