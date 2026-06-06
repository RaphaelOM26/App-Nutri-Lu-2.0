// Card de opção reutilizável pras telas de pergunta do onboarding (telas 3, 6, 8, 12, 13).
//
// Suporta:
// - Single-select: clica → seleciona; cinza ↔ sage
// - Multi-select: clica → toggle; radio circle visível à direita
// - Ícone opcional à esquerda (em círculo branco)
// - Texto secundário (subtítulo dentro do card)
//
// Visual:
// - Não selecionado: bg `bgSubtle`, texto `text`, sem border
// - Selecionado: bg `primary` sage, texto branco, scale 1.02, leve sombra
// - Press: scale 0.97

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  label: string;
  /** Subtítulo opcional (renderizado abaixo do label em fonte menor). */
  secondaryLabel?: string;
  /** Ícone opcional renderizado em círculo branco à esquerda. */
  icon?: React.ReactNode;
  /** Estado selecionado. */
  selected: boolean;
  /** Renderiza um radio circle à direita (default false — só pra multi-select). */
  showRadio?: boolean;
  onPress: () => void;
};

export const OptionCard: React.FC<Props> = ({
  label,
  secondaryLabel,
  icon,
  selected,
  showRadio = false,
  onPress,
}) => {
  const theme = useTheme();

  const bg = selected ? theme.primary : theme.bgSubtle;
  const textColor = selected ? '#FFFFFF' : theme.text;
  const subtitleColor = selected ? 'rgba(255,255,255,0.85)' : theme.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={showRadio ? 'checkbox' : 'radio'}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: bg,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 12,
        transform: [{ scale: pressed ? 0.97 : selected ? 1.02 : 1 }],
        shadowColor: selected ? theme.primaryDeep : 'transparent',
        shadowOpacity: selected ? 0.15 : 0,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: selected ? 3 : 0,
      })}
    >
      {icon && (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: selected ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONT.bodyMedium,
            fontSize: secondaryLabel ? 16 : 17,
            color: textColor,
            lineHeight: 22,
          }}
        >
          {label}
        </Text>
        {secondaryLabel && (
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 13,
              color: subtitleColor,
              marginTop: 2,
              lineHeight: 18,
            }}
          >
            {secondaryLabel}
          </Text>
        )}
      </View>

      {showRadio && (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: selected ? '#FFFFFF' : theme.borderStrong,
            backgroundColor: selected ? '#FFFFFF' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected && (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.primary,
              }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};
