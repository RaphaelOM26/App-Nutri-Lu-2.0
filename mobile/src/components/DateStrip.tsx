// Strip semanal com dia selecionado — porte de components.jsx.
// Mostra a SEMANA CORRENTE (Seg→Dom) que contém HOJE. Quando passa do domingo,
// automaticamente avança pra próxima semana. Padrão BR (não dom→sáb).
//
// Visual:
//   - HOJE sempre destacado em VERDE (label + número), independente do que está selecionado.
//     Um pontinho verde aparece abaixo do número como reforço.
//   - Dia SELECIONADO ganha círculo preto + número branco.
//   - Hoje + selecionado: combina — círculo preto, número branco, mas label fica verde e
//     o pontinho aparece embaixo pra manter a clareza de "este é hoje".

import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  selected?: number;
  onSelect?: (day: number) => void;
};

// Ordem segunda→domingo
const SHORT_DAYS_MON = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const DateStrip: React.FC<Props> = ({ selected, onSelect }) => {
  const theme = useTheme();
  // Calcula a segunda-feira da semana corrente, depois gera 7 dias a partir dela.
  // getDay(): 0=Dom..6=Sáb. Pra "quantos dias voltar pra chegar na Seg":
  //   Dom(0) → 6, Seg(1) → 0, Ter(2) → 1, ..., Sáb(6) → 5
  const { days, todayDay, todayMonth } = useMemo(() => {
    const today = new Date();
    const offsetFromMonday = (today.getDay() + 6) % 7;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offsetFromMonday);
    const generated = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return { day: d.getDate(), month: d.getMonth(), label: SHORT_DAYS_MON[i] };
    });
    return { days: generated, todayDay: today.getDate(), todayMonth: today.getMonth() };
  }, []);

  const selectedDay = selected ?? todayDay;

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'space-between' }}>
      {days.map(({ day, month, label }) => {
        const isSelected = day === selectedDay;
        const isToday = day === todayDay && month === todayMonth;
        // Cor do label: se hoje → verde da marca. Senão cinza padrão.
        const labelColor = isToday ? theme.primaryDeep : theme.textMuted;
        // Cor do número dentro do círculo:
        //   - selecionado: branco (vai no preto)
        //   - hoje (não selecionado): verde da marca
        //   - normal: text padrão
        const numberColor = isSelected ? theme.bg : isToday ? theme.primaryDeep : theme.text;
        // Borda do círculo (só aparece quando NÃO selecionado):
        //   - hoje: cor verde, sem dash (linha sólida fina)
        //   - normal: cinza dashed
        const borderColor = isToday ? theme.primary : theme.borderStrong;
        const borderStyle: 'solid' | 'dashed' = isToday ? 'solid' : 'dashed';

        return (
          <Pressable
            key={`${month}-${day}`}
            onPress={() => onSelect?.(day)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
            }}
            accessibilityLabel={`${label} ${day}${isToday ? ' (hoje)' : ''}`}
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
                backgroundColor: isSelected ? theme.text : 'transparent',
                borderWidth: isSelected ? 0 : 1.5,
                borderColor: isSelected ? undefined : borderColor,
                borderStyle: isSelected ? undefined : borderStyle,
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
