// Strip semanal com dia selecionado e navegação entre semanas.
// Semana exibida = a que contém o dia SELECIONADO (Seg→Dom, padrão BR).
// Setas ‹ › pulam a seleção ±7 dias (a semana visível acompanha).
//
// Dias futuros SÃO clicáveis — o user pode planejar refeições à frente
// (o Alert de confirmação no addToMeal cobre registros fora de hoje).
//
// Visual:
//   - HOJE sempre destacado em VERDE (label + número + pontinho embaixo).
//   - Dia SELECIONADO ganha círculo preto + número branco.
//   - Header mostra o range da semana ("8 – 14 de jun"); quando a seleção
//     está fora de hoje, tocar no header volta pra hoje (mostra "· Hoje").
//
// API: recebe e emite `dateKey` no formato YYYY-MM-DD.

import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';

type Props = {
  /** YYYY-MM-DD do dia selecionado. Se ausente, assume hoje. */
  selectedDateKey?: string;
  onSelectDate?: (dateKey: string) => void;
};

// Ordem segunda→domingo
const SHORT_DAYS_MON = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export const DateStrip: React.FC<Props> = ({ selectedDateKey, onSelectDate }) => {
  const theme = useTheme();
  const todayKey = fmtDateKey(new Date());
  const activeKey = selectedDateKey ?? todayKey;

  const { days, weekLabel } = useMemo(() => {
    const sel = parseDateKey(activeKey);
    const offsetFromMonday = (sel.getDay() + 6) % 7;
    const monday = addDays(sel, -offsetFromMonday);
    const sunday = addDays(monday, 6);
    const generated = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      return { key: fmtDateKey(d), day: d.getDate(), label: SHORT_DAYS_MON[i] };
    });
    // "8 – 14 de jun" (mesmo mês) ou "30 jun – 6 jul" (meses diferentes)
    const label =
      monday.getMonth() === sunday.getMonth()
        ? `${monday.getDate()} – ${sunday.getDate()} de ${MONTHS_SHORT[monday.getMonth()]}`
        : `${monday.getDate()} ${MONTHS_SHORT[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS_SHORT[sunday.getMonth()]}`;
    return { days: generated, weekLabel: label };
  }, [activeKey]);

  const goWeek = (delta: -1 | 1) => {
    onSelectDate?.(fmtDateKey(addDays(parseDateKey(activeKey), delta * 7)));
  };

  const offToday = activeKey !== todayKey;

  return (
    <View style={{ paddingVertical: 4 }}>
      {/* Header de navegação da semana */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
        <Pressable
          onPress={() => goWeek(-1)}
          hitSlop={10}
          style={{ padding: 6 }}
          accessibilityLabel="Semana anterior"
        >
          <Icon.back size={16} color={theme.textMuted} stroke={2} />
        </Pressable>
        <Pressable
          onPress={() => offToday && onSelectDate?.(todayKey)}
          hitSlop={8}
          accessibilityLabel={offToday ? 'Voltar pra hoje' : 'Semana atual'}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 12, fontWeight: '600', color: theme.textMuted, letterSpacing: 0.2 }}>
            {weekLabel}
          </Text>
          {offToday && (
            <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 12, fontWeight: '700', color: theme.primaryDeep }}>
              · Hoje
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => goWeek(1)}
          hitSlop={10}
          style={{ padding: 6 }}
          accessibilityLabel="Próxima semana"
        >
          <Icon.forward size={16} color={theme.textMuted} stroke={2} />
        </Pressable>
      </View>

      {/* Dias da semana */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 4, justifyContent: 'space-between' }}>
        {days.map(({ key, day, label }) => {
          const isSelected = key === activeKey;
          const isToday = key === todayKey;
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
              key={key}
              onPress={() => onSelectDate?.(key)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 8,
              }}
              accessibilityLabel={`${label} ${day}${isToday ? ' (hoje)' : ''}`}
              accessibilityState={{ selected: isSelected }}
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
    </View>
  );
};
