// Seletor de horário personalizável (HH:MM 24h).
// Dois TextInputs grandes lado a lado pra horas e minutos, com auto-completação
// e validação. Abaixo, chips de sugestões pra preenchimento rápido.

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import { useTheme, FONT } from '../theme';

type Props = {
  /** Valor atual em formato HH:MM */
  value: string;
  onChange: (time: string) => void;
  /** Sugestões opcionais (mostradas como chips abaixo). */
  suggestions?: string[];
};

const clampHour = (n: number) => Math.max(0, Math.min(23, n));
const clampMinute = (n: number) => Math.max(0, Math.min(59, n));
const pad = (n: number) => String(n).padStart(2, '0');

export const TimePicker: React.FC<Props> = ({ value, onChange, suggestions = [] }) => {
  const theme = useTheme();
  const [hh, mm] = value.split(':');
  const [hhText, setHhText] = useState(hh ?? '08');
  const [mmText, setMmText] = useState(mm ?? '00');

  // Sincroniza se o valor externo mudar (ex: tap num chip)
  useEffect(() => {
    const [h, m] = value.split(':');
    setHhText(h ?? '08');
    setMmText(m ?? '00');
  }, [value]);

  const emit = (h: string, m: string) => {
    const hN = clampHour(parseInt(h, 10) || 0);
    const mN = clampMinute(parseInt(m, 10) || 0);
    onChange(`${pad(hN)}:${pad(mN)}`);
  };

  // Aceita texto e formata na hora. Ex: "8" → "8", on blur normaliza pra "08".
  const onHourChange = (t: string) => {
    const cleaned = t.replace(/\D/g, '').slice(0, 2);
    setHhText(cleaned);
  };
  const onMinuteChange = (t: string) => {
    const cleaned = t.replace(/\D/g, '').slice(0, 2);
    setMmText(cleaned);
  };
  const onHourBlur = () => {
    const n = clampHour(parseInt(hhText, 10) || 0);
    const padded = pad(n);
    setHhText(padded);
    emit(padded, mmText);
  };
  const onMinuteBlur = () => {
    const n = clampMinute(parseInt(mmText, 10) || 0);
    const padded = pad(n);
    setMmText(padded);
    emit(hhText, padded);
  };

  const inputStyle = {
    fontFamily: FONT.headExtra,
    fontSize: 32,
    fontWeight: '800' as const,
    color: theme.text,
    textAlign: 'center' as const,
    backgroundColor: theme.bgElev,
    borderRadius: 14,
    paddingVertical: 14,
    width: 90,
    letterSpacing: -0.5,
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <TextInput
          value={hhText}
          onChangeText={onHourChange}
          onBlur={onHourBlur}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          maxLength={2}
          selectTextOnFocus
          style={inputStyle}
        />
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 32, fontWeight: '800', color: theme.text, marginHorizontal: 4 }}>
          :
        </Text>
        <TextInput
          value={mmText}
          onChangeText={onMinuteChange}
          onBlur={onMinuteBlur}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          maxLength={2}
          selectTextOnFocus
          style={inputStyle}
        />
      </View>

      {suggestions.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.textFaint, letterSpacing: 0.4, textTransform: 'uppercase', textAlign: 'center' }}>
            Sugestões
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {suggestions.map((t) => {
              const active = `${pad(parseInt(hhText, 10) || 0)}:${pad(parseInt(mmText, 10) || 0)}` === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => {
                    const [h, m] = t.split(':');
                    setHhText(h);
                    setMmText(m);
                    emit(h, m);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 100,
                    backgroundColor: active ? theme.text : theme.bgElev,
                  }}
                >
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: '700', color: active ? theme.bg : theme.textMuted }}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};
