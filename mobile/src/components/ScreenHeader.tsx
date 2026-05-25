// Header de tela — versão "regular" (título centrado) e "large" (título grande).
// Porte de components.jsx.

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  title?: React.ReactNode;
  left?: React.ReactNode[];
  right?: React.ReactNode[];
  large?: boolean;
  sub?: string;
};

export const ScreenHeader: React.FC<Props> = ({ title, left, right, large = false, sub }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: large ? 20 : 16,
        paddingTop: large ? 8 : 12,
        paddingBottom: large ? 8 : 12,
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 36,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8 }}>{left}</View>
        {!large && typeof title === 'string' && (
          <Text
            style={{
              fontFamily: FONT.head,
              fontSize: 16,
              fontWeight: '700',
              color: theme.text,
            }}
          >
            {title}
          </Text>
        )}
        {!large && typeof title !== 'string' && title}
        <View style={{ flexDirection: 'row', gap: 8 }}>{right}</View>
      </View>
      {large && (
        <View>
          <Text
            style={{
              fontFamily: FONT.headExtra,
              fontSize: 30,
              fontWeight: '800',
              letterSpacing: -0.6,
              color: theme.text,
            }}
          >
            {title}
          </Text>
          {sub && (
            <Text
              style={{
                marginTop: 4,
                fontFamily: FONT.body,
                fontSize: 14,
                color: theme.textMuted,
              }}
            >
              {sub}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
