// Modal de calendário do MÊS atual mostrando dias com pesagem registrada.
// Dia com bola verde = pesou. Tap num dia mostra o valor + delta vs anterior.
// Semana começa segunda (padrão BR).

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { useApp } from '../state/AppContext';

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

type Props = { visible: boolean; onClose: () => void };

export const WeightCalendarModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { weightEntries } = useApp();
  const [offset, setOffset] = useState(0); // 0 = mês atual, -1 = anterior, etc.
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Mês exibido (relativo ao offset)
  const now = new Date();
  const viewYear = now.getFullYear() + Math.floor((now.getMonth() + offset) / 12);
  const viewMonth = ((now.getMonth() + offset) % 12 + 12) % 12;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=dom..6=sab
  const firstColIdx = (firstDow + 6) % 7; // Seg→Dom, 0=Seg..6=Dom

  // Mapa dayOfMonth → última pesagem do dia
  const entriesByDay = useMemo(() => {
    const map: Record<number, { kg: number; date: number }> = {};
    for (const e of weightEntries) {
      const d = new Date(e.date);
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) continue;
      const day = d.getDate();
      // Pega a mais recente do dia caso tenha mais de uma
      if (!map[day] || e.date > map[day].date) map[day] = { kg: e.kg, date: e.date };
    }
    return map;
  }, [weightEntries, viewYear, viewMonth]);

  // Pesagem do dia anterior (pra delta)
  const prevForDay = (day: number): number | null => {
    let bestDate = -Infinity;
    let bestKg: number | null = null;
    const target = new Date(viewYear, viewMonth, day).getTime();
    for (const e of weightEntries) {
      if (e.date < target && e.date > bestDate) {
        bestDate = e.date;
        bestKg = e.kg;
      }
    }
    return bestKg;
  };

  const today = now;
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  // Cria grade 6×7 (max)
  const cells: ({ day: number; hasWeigh: boolean; isToday: boolean; isFuture: boolean } | null)[] = [];
  for (let i = 0; i < firstColIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && d === today.getDate();
    const isFuture = isCurrentMonth && d > today.getDate();
    cells.push({ day: d, hasWeigh: !!entriesByDay[d], isToday, isFuture });
  }

  const selectedEntry = selectedDay != null ? entriesByDay[selectedDay] : null;
  const selectedPrev = selectedDay != null ? prevForDay(selectedDay) : null;
  const selectedDelta = selectedEntry && selectedPrev != null ? selectedEntry.kg - selectedPrev : null;

  // Total de dias pesados no mês visível
  const totalWeighed = Object.keys(entriesByDay).length;
  const daysSoFar = isCurrentMonth ? today.getDate() : daysInMonth;
  const adherence = daysSoFar > 0 ? Math.round((totalWeighed / daysSoFar) * 100) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Math.max(28, insets.bottom + 16), gap: 14, maxHeight: '85%' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.calendar size={18} color={theme.primaryDeep} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
                Histórico de pesagens
              </Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          {/* Month switcher */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Pressable onPress={() => { setOffset((o) => o - 1); setSelectedDay(null); }} hitSlop={10}>
              <Icon.back size={18} color={theme.text} stroke={2} />
            </Pressable>
            <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.text }}>
              {MONTHS_PT[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={() => { if (offset < 0) { setOffset((o) => o + 1); setSelectedDay(null); } }} hitSlop={10} disabled={offset >= 0}>
              <Icon.forward size={18} color={offset >= 0 ? theme.textFaint : theme.text} stroke={2} />
            </Pressable>
          </View>

          {/* Stats do mês */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Stat label="Dias pesados" big={String(totalWeighed)} sub={`de ${daysSoFar}`} color={theme.primaryDeep} />
            <Stat label="Aderência" big={`${adherence}%`} sub={isCurrentMonth ? 'no mês até hoje' : 'do mês'} color={theme.primary} />
          </View>

          {/* Weekday header */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {WEEKDAYS.map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.5 }}>
                  {w}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {cells.map((c, i) => {
              if (!c) return <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
              const isSelected = selectedDay === c.day;
              const bg = c.hasWeigh ? (isSelected ? theme.primaryDeep : theme.primarySoft) : (isSelected ? theme.text : 'transparent');
              const textColor = c.hasWeigh ? (isSelected ? '#fff' : theme.primaryDeep) : (isSelected ? theme.bg : c.isFuture ? theme.textFaint : theme.text);
              return (
                <Pressable
                  key={i}
                  onPress={() => c.hasWeigh && setSelectedDay(isSelected ? null : c.day)}
                  disabled={!c.hasWeigh}
                  style={{
                    width: `${100 / 7 - 0.5}%`,
                    aspectRatio: 1,
                    borderRadius: 10,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: c.isToday ? 1.5 : 0,
                    borderColor: c.isToday ? theme.primaryDeep : 'transparent',
                  }}
                >
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: c.hasWeigh || c.isToday ? '700' : '500', color: textColor }}>
                    {c.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Detalhe do dia selecionado */}
          {selectedEntry && (
            <View style={{ padding: 14, borderRadius: 14, backgroundColor: theme.bgElev, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.scale size={18} color={theme.primaryDeep} stroke={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  {selectedDay} de {MONTHS_PT[viewMonth]}
                </Text>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text, marginTop: 1, letterSpacing: -0.3 }}>
                  {selectedEntry.kg.toFixed(1).replace('.', ',')} kg
                </Text>
              </View>
              {selectedDelta != null && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                    Vs anterior
                  </Text>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: selectedDelta > 0 ? theme.warningDeep : theme.primaryDeep, marginTop: 1 }}>
                    {selectedDelta > 0 ? '+' : ''}{selectedDelta.toFixed(1).replace('.', ',')}kg
                  </Text>
                </View>
              )}
            </View>
          )}

          {!selectedEntry && totalWeighed > 0 && (
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, textAlign: 'center' }}>
              Toque num dia verde pra ver o peso registrado
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const Stat: React.FC<{ label: string; big: string; sub: string; color: string }> = ({ label, big, sub, color }) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: theme.bgElev }}>
      <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4, gap: 4 }}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color, letterSpacing: -0.3 }}>
          {big}
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
          {sub}
        </Text>
      </View>
    </View>
  );
};
