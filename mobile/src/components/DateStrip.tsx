// Strip semanal com dia selecionado — porte de components.jsx.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  selected?: number;
  onSelect?: (day: number) => void;
};

export const DateStrip: React.FC<Props> = ({ selected = 25, onSelect }) => {
  const theme = useTheme();
  const days = ['Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter'];
  const nums = [20, 21, 22, 23, 24, 25, 26];
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'space-between' }}>
      {nums.map((n, i) => {
        const isToday = n === selected;
        return (
          <Pressable
            key={n}
            onPress={() => onSelect?.(n)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: FONT.bodyMedium,
                fontSize: 11,
                color: theme.textMuted,
                fontWeight: '600',
                letterSpacing: 0.4,
                marginBottom: 4,
              }}
            >
              {days[i]}
            </Text>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isToday ? theme.text : 'transparent',
                borderWidth: isToday ? 0 : 1.5,
                borderColor: isToday ? undefined : theme.borderStrong,
                borderStyle: 'dashed',
              }}
            >
              <Text
                style={{
                  color: isToday ? theme.bg : theme.text,
                  fontFamily: FONT.head,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                {n}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
