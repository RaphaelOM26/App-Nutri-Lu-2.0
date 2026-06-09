// Strip semanal com dia selecionado.
// Mostra a SEMANA CORRENTE (Seg→Dom) que contém HOJE. Padrão BR.
//
// Dias FUTUROS (após hoje) ficam visíveis mas desabilitados — usuário entende
// onde a semana termina sem poder clicar em quartas/quintas futuras (o app
// é um diário retroativo, não meal planner).
//
// API: recebe e emite `dateKey` no formato YYYY-MM-DD.

import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  /** YYYY-MM-DD do dia selecionado. Se ausente, assume hoje. */
  selectedDateKey?: string;
  onSelectDate?: (dateKey: string) => void;
};

// Ordem segunda→domingo
const SHORT_DAYS_MON = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function fmtDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DateStrip: React.FC<Props> = ({ selectedDateKey, onSelectDate }) => {
  const theme = useTheme();
  const { days, todayKey } = useMemo(() => {
    const today = new Date();
    const offsetFromMonday = (today.getDay() + 6) % 7;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offsetFromMonday);
    const todayK = fmtDateKey(today);
    const generated = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = fmtDateKey(d);
      return {
        key,
        day: d.getDate(),
        label: SHORT_DAYS_MON[i],
        isFuture: key > todayK,
      };
    });
    return { days: generated, todayKey: todayK };
  }, []);

  const activeKey = selectedDateKey ?? todayKey;

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'space-between' }}>
      {days.map(({ key, day, label, isFuture }) => {
        const isSelected = key === activeKey;
        const isToday = key === todayKey;
        // Cor do label: futuro → bem apagado. Hoje → verde. Normal → cinza.
        const labelColor = isFuture
          ? theme.borderStrong
          : isToday
          ? theme.primaryDeep
          : theme.textMuted;
        // Cor do número:
        //   - futuro: bem apagado
        //   - selecionado (não-futuro): branco (sobre fundo preto)
        //   - hoje: verde da marca
        //   - normal: text padrão
        const numberColor = isFuture
          ? theme.borderStrong
          : isSelected
          ? theme.bg
          : isToday
          ? theme.primaryDeep
          : theme.text;
        const borderColor = isFuture
          ? theme.border
          : isToday
          ? theme.primary
          : theme.borderStrong;
        const borderStyle: 'solid' | 'dashed' = isToday ? 'solid' : 'dashed';

        return (
          <Pressable
            key={key}
            onPress={() => !isFuture && onSelectDate?.(key)}
            disabled={isFuture}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              opacity: isFuture ? 0.4 : 1,
            }}
            accessibilityLabel={`${label} ${day}${isToday ? ' (hoje)' : isFuture ? ' (futuro)' : ''}`}
            accessibilityState={{ disabled: isFuture, selected: isSelected }}
          >
            <Text
              style={{
                fontFamily: FONT.bodyMedium,
                fontSize: 11,
                color: labelColor,
                fontWeight: isToday ? '800' : '600',
                letterSpacing: 0.4,
                marginBottom: 4,
              }}
            >
              {label}
            </Text>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected && !isFuture ? theme.text : 'transparent',
                borderWidth: isSelected && !isFuture ? 0 : 1.5,
                borderColor: isSelected && !isFuture ? undefined : borderColor,
                borderStyle: isSelected && !isFuture ? undefined : borderStyle,
              }}
            >
              <Text
                style={{
                  color: numberColor,
                  fontFamily: FONT.head,
                  fontSize: 14,
                  fontWeight: isToday ? '800' : '700',
                }}
              >
                {day}
              </Text>
            </View>
            {/* Pontinho verde embaixo — marca permanente do HOJE */}
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: isToday ? theme.primary : 'transparent',
                marginTop: 4,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
};
