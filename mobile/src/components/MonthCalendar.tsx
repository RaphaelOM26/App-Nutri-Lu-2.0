// Modal de calendário mensal com heatmap de aderência à meta calórica.
// Cada célula colorida = um dia. Tap num dia abre um pequeno painel com
// os macros consumidos vs. meta. Dia atual destacado com borda.

import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { getMonthSummaries, adherenceBucket, type DailySummary } from '../data/mockHistory';
import { TODAY_MONTH, TODAY_YEAR } from '../state/AppContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Dia atual. Pra destacar e usar dados reais. */
  today: number;
  /** Macros consumidos HOJE (vem do state). Sobrescreve o mock pro dia atual. */
  todayKcal: number;
  todayP: number;
  todayC: number;
  todayF: number;
};

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTH = TODAY_MONTH;
const YEAR = TODAY_YEAR;
const MONTH_NAME = `${MONTHS_PT[MONTH - 1]} ${YEAR}`;
// Semana começa na segunda (padrão BR). Dom no fim.
const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const TARGETS = { kcal: 2200, p: 135, c: 240, f: 70 };

type Metric = 'kcal' | 'p' | 'c' | 'f';

const METRIC_LABELS: Record<Metric, { chip: string; long: string }> = {
  kcal: { chip: 'Calorias', long: 'calorias' },
  p:    { chip: 'Proteína', long: 'proteína' },
  c:    { chip: 'Carbo',    long: 'carboidrato' },
  f:    { chip: 'Gordura',  long: 'gordura' },
};

// Paleta de heatmap (low→great) por métrica — tons suaves/pasteis, alinhados
// com a paleta geral do app. "great" é tom médio (não vibrante) pra não destoar.
// "low" e "over" são uniformes em todas as métricas: cinza pra "longe da meta"
// (neutro, sem alarme) e vermelho pastel mais forte pra "passou da meta" (distintivo).
const NEUTRAL_LOW = '#D8D8DC';
const RED_OVER   = '#D67373';
const HEATMAP_PALETTE: Record<Metric, { low: string; mid: string; good: string; great: string; over: string }> = {
  kcal: { low: NEUTRAL_LOW, mid: '#F5E6CC', good: '#DCE6D2', great: '#B5CCA9', over: RED_OVER },
  p:    { low: NEUTRAL_LOW, mid: '#EBC9CE', good: '#E0B0B8', great: '#D497A1', over: RED_OVER },
  c:    { low: NEUTRAL_LOW, mid: '#CAD6E4', good: '#B0C2D7', great: '#92AAC5', over: RED_OVER },
  f:    { low: NEUTRAL_LOW, mid: '#E9D7A8', good: '#DEC57F', great: '#C8AE5E', over: RED_OVER },
};

export const MonthCalendar: React.FC<Props> = ({ visible, onClose, today, todayKcal, todayP, todayC, todayF }) => {
  const theme = useTheme();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [metric, setMetric] = useState<Metric>('kcal');

  const palette = HEATMAP_PALETTE[metric];

  const colorFor = (b: ReturnType<typeof adherenceBucket>) => {
    switch (b) {
      case 'empty': return theme.ringTrack;
      case 'low':   return palette.low;
      case 'mid':   return palette.mid;
      case 'good':  return palette.good;
      case 'great': return palette.great;
      case 'over':  return palette.over;
    }
  };
  // Texto: branco em over (pra contraste com vermelho forte); escuro nos outros
  const textColorFor = (b: ReturnType<typeof adherenceBucket>) =>
    b === 'over' ? '#FFFFFF' : theme.text;

  // Pra dado um summary, devolve consumed/target da métrica ativa
  const pickMetric = (s: DailySummary | null): { consumed: number; target: number } => {
    if (!s) return { consumed: 0, target: 0 };
    if (metric === 'kcal') return { consumed: s.kcal, target: s.kcalTarget };
    if (metric === 'p')    return { consumed: s.p,    target: s.pTarget };
    if (metric === 'c')    return { consumed: s.c,    target: s.cTarget };
    return { consumed: s.f, target: s.fTarget };
  };

  // Monta uma matriz com offset do primeiro dia da semana (segunda=0..domingo=6)
  const firstWeekday = (new Date(YEAR, MONTH - 1, 1).getDay() + 6) % 7;
  const monthSummaries = getMonthSummaries(MONTH, YEAR);
  const daysInMonth = monthSummaries.length;

  // Sobrescreve o dia "hoje" com os dados reais do state
  const summaries = monthSummaries.map((s, i) => {
    const day = i + 1;
    if (day === today) {
      return {
        day, month: MONTH, year: YEAR,
        kcal: todayKcal, kcalTarget: TARGETS.kcal,
        p: todayP, pTarget: TARGETS.p,
        c: todayC, cTarget: TARGETS.c,
        f: todayF, fTarget: TARGETS.f,
      } as DailySummary;
    }
    return s;
  });

  // Lista linear de células: vazias até o firstWeekday + dias do mês
  const cells: Array<{ day: number | null; summary: DailySummary | null }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, summary: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, summary: summaries[d - 1] });
  // Completa até múltiplo de 7
  while (cells.length % 7 !== 0) cells.push({ day: null, summary: null });

  const selectedSummary = selectedDay ? summaries[selectedDay - 1] : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}
      >
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 20, gap: 14 }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Consumo de {METRIC_LABELS[metric].long}
              </Text>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 2 }}>
                {MONTH_NAME}
              </Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          {/* Toggle de métrica */}
          <View style={{ flexDirection: 'row', gap: 6, backgroundColor: theme.bgElev, padding: 4, borderRadius: 12 }}>
            {(['kcal', 'p', 'c', 'f'] as Metric[]).map((m) => {
              const active = m === metric;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMetric(m)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: active ? theme.text : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 11, fontWeight: '700', color: active ? theme.bg : theme.textMuted }}>
                    {METRIC_LABELS[m].chip}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Cabeçalho dos dias da semana */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {WEEKDAYS.map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.textMuted }}>
                  {w}
                </Text>
              </View>
            ))}
          </View>

          {/* Grid de células */}
          <View style={{ gap: 4 }}>
            {Array.from({ length: cells.length / 7 }).map((_, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', gap: 4 }}>
                {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                  if (cell.day === null) return <View key={colIdx} style={{ flex: 1, aspectRatio: 1 }} />;
                  const isFuture = cell.day > today;
                  const isToday = cell.day === today;
                  const m = pickMetric(cell.summary);
                  const bucket = adherenceBucket(m.consumed, m.target);
                  const bg = isFuture ? 'transparent' : colorFor(bucket);
                  const txt = isFuture ? theme.textFaint : textColorFor(bucket);
                  return (
                    <Pressable
                      key={colIdx}
                      onPress={() => !isFuture && cell.summary && setSelectedDay(cell.day!)}
                      disabled={isFuture || !cell.summary}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        backgroundColor: bg,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isToday ? 2 : selectedDay === cell.day ? 1.5 : 0,
                        borderColor: isToday ? theme.text : selectedDay === cell.day ? theme.primaryDeep : 'transparent',
                      }}
                    >
                      <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: isToday ? '800' : '600', color: txt }}>
                        {cell.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legenda */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted }}>Aderência:</Text>
            {[
              { label: 'Baixa', b: 'low' as const },
              { label: 'Média', b: 'mid' as const },
              { label: 'Boa', b: 'good' as const },
              { label: 'Meta', b: 'great' as const },
              { label: 'Passou', b: 'over' as const },
            ].map((l) => (
              <View key={l.b} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colorFor(l.b) }} />
                <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textMuted }}>{l.label}</Text>
              </View>
            ))}
          </View>

          {/* Painel de detalhe do dia selecionado */}
          {selectedSummary && (
            <View style={{ marginTop: 6, padding: 14, borderRadius: 16, backgroundColor: theme.bgElev, gap: 6 }}>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text }}>
                Dia {selectedSummary.day} de {MONTHS_PT[MONTH - 1].toLowerCase()}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                <DetailMacro label="kcal" v={selectedSummary.kcal} t={selectedSummary.kcalTarget} color={theme.primary} />
                <DetailMacro label="P" v={selectedSummary.p} t={selectedSummary.pTarget} color={theme.proteinPink} />
                <DetailMacro label="C" v={selectedSummary.c} t={selectedSummary.cTarget} color={theme.carbsBlue} />
                <DetailMacro label="G" v={selectedSummary.f} t={selectedSummary.fTarget} color={theme.fatsGold} />
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const DetailMacro: React.FC<{ label: string; v: number; t: number; color: string }> = ({ label, v, t, color }) => {
  const theme = useTheme();
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>{label}</Text>
      </View>
      <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>
        {v}<Text style={{ fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>/{t}</Text>
      </Text>
    </View>
  );
};
