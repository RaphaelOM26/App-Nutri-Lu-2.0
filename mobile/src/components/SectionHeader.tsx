// Cabeçalho de seção (com ação opcional à direita) — porte de components.jsx.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
  size?: 'lg' | 'sm';
};

export const SectionHeader: React.FC<Props> = ({ title, action, onAction, size = 'lg' }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: 20,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontFamily: FONT.headExtra,
          fontSize: size === 'lg' ? 20 : 16,
          fontWeight: '800',
          letterSpacing: -0.3,
          color: theme.text,
        }}
      >
        {title}
      </Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text
            style={{
              fontFamily: FONT.bodyMedium,
              fontSize: 13,
              fontWeight: '600',
              color: theme.primaryDeep,
            }}
          >
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
