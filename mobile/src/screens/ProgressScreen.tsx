// Progresso — porte completo do ProgressScreen.
// 4 tabs: Peso (com CRUD), Macros (bar chart + breakdown), Fotos, Hábitos.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Polyline, Polygon, Circle as SCircle } from 'react-native-svg';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { LuBtn } from '../components/LuBtn';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icons';
import { FoodImg } from '../components/FoodImg';
import { AddWeightModal } from '../components/AddWeightModal';
import { useApp, type WeightEntry } from '../state/AppContext';
import { useFocusReplay } from '../utils/useFocusReplay';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(SCircle);

type TabId = 'weight' | 'macros' | 'photos' | 'habits';
type Period = '7D' | '30D' | '90D' | '1A' | 'Tudo';

const PERIOD_DAYS: Record<Period, number | null> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1A': 365,
  Tudo: null,
};

export const ProgressScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const replayKey = useFocusReplay();
  const [tab, setTab] = useState<TabId>('weight');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Progresso"
        large
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="cal" icon={Icon.calendar} />,
          <IconBtn key="more" icon={Icon.more} />,
        ]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Streak + conquistas */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', gap: 10 }}>
          <StreakCard />
          <AchievementsCard />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 14 }}>
          {(
            [
              { id: 'weight', label: 'Peso' },
              { id: 'macros', label: 'Macros' },
              { id: 'photos', label: 'Fotos' },
              { id: 'habits', label: 'Hábitos' },
            ] as { id: TabId; label: string }[]
          ).map((t) => (
            <Chip key={t.id} active={tab === t.id} onPress={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </ScrollView>

        {tab === 'weight' && <WeightTab key={`weight-${replayKey}`} />}
        {tab === 'macros' && <MacrosTab key={`macros-${replayKey}`} />}
        {tab === 'photos' && <PhotosTab />}
        {tab === 'habits' && <HabitsTab />}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Streak card (12 dias + 7 mini indicadores) ──────────────────
const StreakCard: React.FC = () => {
  const theme = useTheme();
  const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  return (
    <Card pad={16} radius={20} style={{ flex: 1.3, backgroundColor: theme.primarySoft }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 30, fontWeight: '800', color: theme.primaryDeep, letterSpacing: -0.4 }}>
            12
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '600' }}>
            dias seguidos
          </Text>
        </View>
        <Icon.flame size={32} color={theme.primaryDeep} stroke={1.5} />
      </View>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 12 }}>
        {days.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: i < 6 ? theme.primaryDeep : 'rgba(255,255,255,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i < 6 && <Icon.check size={12} color="#fff" stroke={3} />}
            </View>
            <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.primaryDeep, fontWeight: '700' }}>{d}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

// ─── Achievements card (7 + badges stacked) ──────────────────────
const AchievementsCard: React.FC = () => {
  const theme = useTheme();
  const badges = [theme.fatsGold, theme.primaryDeep, theme.proteinPink, theme.carbsBlue];
  return (
    <Card pad={16} radius={20} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 30, fontWeight: '800', color: theme.text, letterSpacing: -0.4 }}>
            7
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600' }}>
            conquistas
          </Text>
        </View>
        <Icon.award size={34} color={theme.fatsGold} stroke={1.5} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        {badges.map((c, i) => (
          <View
            key={i}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: theme.bgElev,
              backgroundColor: c,
              marginLeft: i > 0 ? -8 : 0,
            }}
          />
        ))}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.bgElev,
            backgroundColor: theme.bgSubtle,
            marginLeft: -8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 9, fontWeight: '800', color: theme.textMuted }}>+3</Text>
        </View>
      </View>
    </Card>
  );
};

// ─── WEIGHT TAB ──────────────────────────────────────────────────
const WeightTab: React.FC = () => {
  const theme = useTheme();
  const { weightEntries, weightGoalKg, addWeightEntry, removeWeightEntry } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('90D');

  // ─── Definição do range do período ──────────────────────────────
  // Para "Tudo", usa do primeiro registro até hoje. Para outros, usa
  // a janela fixa (7/30/90/365 dias) terminando hoje.
  const { startMs, endMs } = useMemo(() => {
    const now = Date.now();
    const days = PERIOD_DAYS[period];
    if (days === null) {
      // Tudo: do mais antigo até agora (ou últimos 30d se vazio)
      const oldest = [...weightEntries].sort((a, b) => a.date - b.date)[0];
      const oldestMs = oldest?.date ?? now - 30 * 24 * 60 * 60 * 1000;
      return { startMs: oldestMs, endMs: now };
    }
    return { startMs: now - days * 24 * 60 * 60 * 1000, endMs: now };
  }, [period, weightEntries]);

  // Filtra entradas pelo período + ordena crescente por data
  const filteredEntries = useMemo(() => {
    return weightEntries
      .filter((e) => e.date >= startMs && e.date <= endMs)
      .sort((a, b) => a.date - b.date);
  }, [weightEntries, startMs, endMs]);

  // Faixa de peso pra eixo Y (Math.floor/ceil pra ticks bonitos)
  const { yMin, yMax, yMid } = useMemo(() => {
    if (filteredEntries.length === 0) {
      const goal = weightGoalKg;
      return { yMin: Math.floor(goal - 2), yMax: Math.ceil(goal + 2), yMid: goal };
    }
    const kgs = filteredEntries.map((e) => e.kg);
    const lo = Math.floor(Math.min(...kgs) - 1);
    const hi = Math.ceil(Math.max(...kgs) + 1);
    return { yMin: lo, yMax: hi, yMid: (lo + hi) / 2 };
  }, [filteredEntries, weightGoalKg]);

  // Header info
  const current = weightEntries[0]?.kg ?? null;
  const periodOldest = filteredEntries[0]?.kg ?? null;
  const periodNewest = filteredEntries[filteredEntries.length - 1]?.kg ?? null;
  const delta = periodOldest != null && periodNewest != null ? periodNewest - periodOldest : 0;
  const deltaPositive = delta > 0;
  const deltaAbs = Math.abs(delta).toFixed(1).replace('.', ',');

  // ─── Coordenadas do SVG (viewBox 0..100 → preserveAspectRatio=none escala) ──
  const W = 100;
  const H = 100;
  const xFor = (date: number) => ((date - startMs) / (endMs - startMs)) * W;
  const yFor = (kg: number) => H - ((kg - yMin) / (yMax - yMin)) * H;
  const points = filteredEntries.map((e) => `${xFor(e.date)},${yFor(e.kg)}`).join(' ');

  // (Sem animações no gráfico de peso — atualização instantânea ao mudar período)

  // ─── X ticks: contagem e labels mudam por período ──
  //  - 7D: 7 dias da semana (na ordem dos últimos 7 dias)
  //  - 30D: 4 semanas (Sem 1 → 4)
  //  - 90D: 3 meses (últimos 3 meses do calendário)
  //  - 1A / Tudo: 12 meses (últimos 12 meses do calendário)
  const xTicks = useMemo(() => {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    switch (period) {
      case '7D': {
        const ticks: { label: string }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(endMs);
          d.setDate(d.getDate() - i);
          const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          ticks.push({ label: cap(wd) });
        }
        return ticks;
      }
      case '30D':
        return [1, 2, 3, 4].map((n) => ({ label: `Sem ${n}` }));
      case '90D': {
        const out: { label: string }[] = [];
        const end = new Date(endMs);
        for (let i = 2; i >= 0; i--) {
          const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
          const name = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
          out.push({ label: cap(name) });
        }
        return out;
      }
      case '1A':
      case 'Tudo':
      default: {
        const out: { label: string }[] = [];
        const end = new Date(endMs);
        for (let i = 11; i >= 0; i--) {
          const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
          const name = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
          out.push({ label: cap(name) });
        }
        return out;
      }
    }
  }, [period, endMs]);

  const onAddSaved = (kg: number) => {
    addWeightEntry(kg);
  };

  const onLongPressEntry = (entry: WeightEntry) => {
    Alert.alert('Remover registro?', `${entry.kg.toFixed(1).replace('.', ',')} kg em ${formatDate(entry.date)}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeWeightEntry(entry.id) },
    ]);
  };

  // Espaços do layout do chart
  const CHART_H = 130;
  const Y_AXIS_W = 32;
  const X_AXIS_H = 18;

  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {/* Card principal: atual + meta + chart + período */}
      <Card pad={20} radius={22}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <View>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Atual
            </Text>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 36, fontWeight: '800', color: theme.text, letterSpacing: -0.6 }}>
              {(current ?? weightGoalKg).toFixed(1).replace('.', ',')}
              <Text style={{ fontSize: 16, color: theme.textMuted, fontWeight: '600' }}> kg</Text>
            </Text>
            {filteredEntries.length >= 2 && Math.abs(delta) > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                {deltaPositive ? (
                  <Icon.trend size={14} color={theme.warning} />
                ) : (
                  <Icon.trendDown size={14} color={theme.primaryDeep} />
                )}
                <Text
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 12,
                    color: deltaPositive ? theme.warningDeep : theme.primaryDeep,
                    fontWeight: '700',
                  }}
                >
                  {deltaPositive ? '+' : '-'}
                  {deltaAbs}kg em {period === 'Tudo' ? 'todo período' : period}
                </Text>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>Meta</Text>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>
              {weightGoalKg.toFixed(1).replace('.', ',')} kg
            </Text>
            <Icon.flag size={14} color={theme.textMuted} />
          </View>
        </View>

        {/* Chart com eixos */}
        <View style={{ marginTop: 8, height: CHART_H + X_AXIS_H, flexDirection: 'row' }}>
          {/* Y-axis labels */}
          <View style={{ width: Y_AXIS_W, height: CHART_H, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textFaint, fontWeight: '600' }}>{yMax}kg</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textFaint, fontWeight: '600' }}>{yMid.toFixed(0)}kg</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textFaint, fontWeight: '600' }}>{yMin}kg</Text>
          </View>

          {/* Plot area */}
          <View style={{ flex: 1, height: CHART_H + X_AXIS_H }}>
            <View style={{ height: CHART_H, position: 'relative' }}>
              {/* Gridlines horizontais */}
              {[0, 0.5, 1].map((t) => (
                <View
                  key={t}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: t * CHART_H,
                    height: 1,
                    backgroundColor: theme.border,
                  }}
                />
              ))}

              {filteredEntries.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                    Sem pesagens em {period === 'Tudo' ? 'nenhum período' : `últimos ${period}`}
                  </Text>
                </View>
              ) : filteredEntries.length === 1 ? (
                // Um ponto só: marca a posição e uma linha tracejada
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      position: 'absolute',
                      top: `${(yFor(filteredEntries[0].kg) / H) * 100}%`,
                      left: `${(xFor(filteredEntries[0].date) / W) * 100}%`,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.primary,
                      marginLeft: -4,
                      marginTop: -4,
                    }}
                  />
                  <Text
                    style={{
                      position: 'absolute',
                      top: `${(yFor(filteredEntries[0].kg) / H) * 100}%`,
                      left: `${(xFor(filteredEntries[0].date) / W) * 100}%`,
                      marginLeft: 12,
                      marginTop: -8,
                      fontFamily: FONT.head,
                      fontSize: 11,
                      fontWeight: '700',
                      color: theme.text,
                    }}
                  >
                    {filteredEntries[0].kg.toFixed(1).replace('.', ',')}
                  </Text>
                </View>
              ) : (
                <Svg width="100%" height={CHART_H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                  <Polygon
                    points={`${xFor(filteredEntries[0].date)},${H} ${points} ${xFor(filteredEntries[filteredEntries.length - 1].date)},${H}`}
                    fill={theme.primary}
                    fillOpacity={0.12}
                  />
                  <Polyline
                    points={points}
                    fill="none"
                    stroke={theme.primary}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <SCircle
                    cx={xFor(filteredEntries[filteredEntries.length - 1].date)}
                    cy={yFor(filteredEntries[filteredEntries.length - 1].kg)}
                    r={2.5}
                    fill={theme.bg}
                    stroke={theme.primary}
                    strokeWidth={1.2}
                  />
                </Svg>
              )}
            </View>

            {/* X-axis labels */}
            <View
              style={{
                height: X_AXIS_H,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 4,
              }}
            >
              {xTicks.map((t, i) => (
                <Text
                  key={i}
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 9,
                    color: theme.textFaint,
                    fontWeight: '600',
                  }}
                >
                  {t.label}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Period selector */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
          {(['7D', '30D', '90D', '1A', 'Tudo'] as Period[]).map((p) => {
            const active = p === period;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: active ? theme.text : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 12,
                    fontWeight: '700',
                    color: active ? theme.bg : theme.textMuted,
                  }}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Registros recentes */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>
            Registros recentes
          </Text>
          <Pressable onPress={() => setModalOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon.plus size={14} color={theme.primaryDeep} stroke={2.5} />
            <Text style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: '700', color: theme.primaryDeep }}>
              Adicionar
            </Text>
          </Pressable>
        </View>
        <Card pad={0} radius={16}>
          {weightEntries.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Icon.scale size={28} color={theme.primary} stroke={1.5} />
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
                Nenhuma pesagem ainda. Toque em "Adicionar" pra registrar a primeira.
              </Text>
            </View>
          ) : (
            weightEntries.slice(0, 6).map((entry, i, arr) => {
              const prev = arr[i + 1];
              const d = prev ? entry.kg - prev.kg : 0;
              const sign = d > 0 ? '+' : '';
              return (
                <Pressable
                  key={entry.id}
                  onLongPress={() => onLongPressEntry(entry)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: i < Math.min(arr.length, 6) - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                  }}
                >
                  <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, color: theme.text, fontWeight: '600' }}>
                    {formatDate(entry.date)}
                  </Text>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, fontWeight: '800', color: theme.text, marginRight: 10 }}>
                    {entry.kg.toFixed(1).replace('.', ',')} kg
                  </Text>
                  {d !== 0 && (
                    <Text
                      style={{
                        fontFamily: FONT.body,
                        fontSize: 11,
                        color: d > 0 ? theme.warningDeep : theme.primaryDeep,
                        fontWeight: '700',
                        minWidth: 44,
                        textAlign: 'right',
                      }}
                    >
                      {sign}
                      {d.toFixed(1).replace('.', ',')}kg
                    </Text>
                  )}
                </Pressable>
              );
            })
          )}
        </Card>
        {weightEntries.length > 0 && (
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, textAlign: 'center', marginTop: 8 }}>
            Pressione e segure pra remover
          </Text>
        )}
      </View>

      <AddWeightModal visible={modalOpen} onClose={() => setModalOpen(false)} onSave={onAddSaved} />
    </View>
  );
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) {
    return `Hoje, ${d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')}`;
  }
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
}

// ─── MACROS TAB ──────────────────────────────────────────────────
const MacrosTab: React.FC = () => {
  const theme = useTheme();
  // Targets fixos (no MVP — depois vem do perfil do usuário)
  const targets = { p: 135, c: 240, f: 70 };
  // Dados mockados da semana — depois vem de histórico real
  const days = [
    { d: 'S', p: 110, c: 180, f: 60 },
    { d: 'T', p: 125, c: 220, f: 55 },
    { d: 'Q', p: 95, c: 165, f: 70 },
    { d: 'Q', p: 130, c: 195, f: 62 },
    { d: 'S', p: 118, c: 175, f: 58 },
    { d: 'S', p: 105, c: 240, f: 75 },
    { d: 'D', p: 145, c: 150, f: 50 },
  ];

  const avgPct = {
    p: Math.round((days.reduce((a, x) => a + x.p, 0) / days.length / targets.p) * 100),
    c: Math.round((days.reduce((a, x) => a + x.c, 0) / days.length / targets.c) * 100),
    f: Math.round((days.reduce((a, x) => a + x.f, 0) / days.length / targets.f) * 100),
  };
  const macroDefs = [
    { k: 'p' as const, label: 'Proteína', color: theme.proteinPink, target: targets.p, avg: avgPct.p },
    { k: 'c' as const, label: 'Carbo', color: theme.carbsBlue, target: targets.c, avg: avgPct.c },
    { k: 'f' as const, label: 'Gordura', color: theme.fatsGold, target: targets.f, avg: avgPct.f },
  ];

  // Heatmap (estável via seed senoidal)
  const heatmapCells = Array.from({ length: 12 * 7 }).map((_, i) => {
    const seed = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const v = Math.abs(seed);
    return v < 0.2 ? 0.08 : v < 0.4 ? 0.3 : v < 0.7 ? 0.6 : 0.95;
  });

  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {/* Bar chart semanal + legenda */}
      <Card pad={18} radius={22}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <View>
            <Text
              style={{
                fontFamily: FONT.body,
                fontSize: 11,
                color: theme.textMuted,
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              Esta semana
            </Text>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 2 }}>
              % da meta por dia
            </Text>
          </View>
          <View style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700' }}>97% meta</Text>
          </View>
        </View>

        {/* Grouped bars por dia (P/C/G) */}
        <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'stretch', height: 130, paddingTop: 14 }}>
          <View style={{ flex: 1, position: 'relative', flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
            {/* Linha tracejada da meta 100% */}
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                borderTopWidth: 1.5,
                borderTopColor: theme.borderStrong,
                borderStyle: 'dashed',
              }}
            />
            {days.map((day, i) => {
              const isToday = i === days.length - 1;
              const pcts = {
                p: Math.min(120, (day.p / targets.p) * 100),
                c: Math.min(120, (day.c / targets.c) * 100),
                f: Math.min(120, (day.f / targets.f) * 100),
              };
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 1.5, width: '100%', justifyContent: 'center' }}>
                    {(['p', 'c', 'f'] as const).map((k, ki) => {
                      const raw = pcts[k];
                      const capped = Math.min(100, raw);
                      const over = raw > 100;
                      const def = macroDefs.find((m) => m.k === k)!;
                      // Stagger: cada dia 60ms, cada macro 25ms dentro do dia
                      const delay = i * 60 + ki * 25;
                      return (
                        <View key={k} style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                          <AnimatedBar
                            targetPct={capped}
                            color={def.color}
                            over={over}
                            overColor={theme.primaryDeep}
                            delay={delay}
                            opacity={isToday ? 1 : 0.7}
                          />
                        </View>
                      );
                    })}
                  </View>
                  <Text
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 10,
                      color: isToday ? theme.text : theme.textMuted,
                      fontWeight: isToday ? '800' : '600',
                    }}
                  >
                    {day.d}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={{ width: 60, alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: '700', color: theme.textMuted }}>
              meta 100%
            </Text>
          </View>
        </View>

        {/* Legenda + averages */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginTop: 12,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          {macroDefs.map((m) => {
            const onGoal = m.avg >= 95 && m.avg <= 110;
            return (
              <View key={m.k} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color }} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
                    {m.label}
                  </Text>
                </View>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 4, letterSpacing: -0.3 }}>
                  {m.avg}%
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 9,
                    fontWeight: '700',
                    color: onGoal ? theme.primaryDeep : theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  {onGoal ? 'na meta' : m.avg < 95 ? 'abaixo' : 'acima'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Today's breakdown */}
        <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.border }}>
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 10,
              fontWeight: '700',
              color: theme.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: 10,
            }}
          >
            Domingo · hoje
          </Text>
          {macroDefs.map((m, mi) => {
            const today = days[days.length - 1];
            const val = today[m.k];
            const pct = Math.round((val / m.target) * 100);
            return (
              <View key={m.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ width: 60, fontFamily: FONT.body, fontSize: 11, color: theme.text, fontWeight: '600' }}>
                  {m.label}
                </Text>
                <View style={{ flex: 1, height: 6, borderRadius: 100, backgroundColor: theme.ringTrack, overflow: 'hidden', position: 'relative' }}>
                  <AnimatedBarHorizontal
                    targetPct={Math.min(100, pct)}
                    color={m.color}
                    delay={500 + mi * 120}
                  />
                  {pct > 100 && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: theme.primaryDeep,
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 12, fontWeight: '800', color: theme.text, minWidth: 38, textAlign: 'right' }}>
                  {pct}%
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, minWidth: 60, textAlign: 'right' }}>
                  {val}/{m.target}g
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Heatmap */}
      <Card pad={18} radius={22}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
          Consistência · 12 semanas
        </Text>
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: 12 }).map((_, week) => (
            <View key={week} style={{ flex: 1, gap: 3 }}>
              {Array.from({ length: 7 }).map((_, day) => {
                const idx = week * 7 + day;
                return (
                  <View
                    key={day}
                    style={{
                      aspectRatio: 1,
                      borderRadius: 3,
                      backgroundColor: theme.primary,
                      opacity: heatmapCells[idx],
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint }}>12 sem atrás</Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint }}>Esta sem</Text>
        </View>
      </Card>
    </View>
  );
};

// ─── Barra vertical animada (usada no chart semanal de macros) ──
const AnimatedBar: React.FC<{
  targetPct: number;
  color: string;
  over: boolean;
  overColor: string;
  delay?: number;
  opacity?: number;
}> = ({ targetPct, color, over, overColor, delay = 0, opacity = 1 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: targetPct,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [targetPct, delay, anim]);
  const heightStyle = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  return (
    <Animated.View
      style={{
        width: '100%',
        height: heightStyle,
        backgroundColor: color,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        opacity,
        position: 'relative',
      }}
    >
      {over && (
        <View
          style={{
            position: 'absolute',
            top: -3,
            left: 0,
            right: 0,
            height: 2.5,
            backgroundColor: overColor,
            borderRadius: 2,
          }}
        />
      )}
    </Animated.View>
  );
};

// ─── Barra horizontal animada (usada no breakdown de hoje) ───────
const AnimatedBarHorizontal: React.FC<{
  targetPct: number;
  color: string;
  delay?: number;
}> = ({ targetPct, color, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: targetPct,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, [targetPct, delay, anim]);
  const widthStyle = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  return (
    <Animated.View
      style={{
        height: '100%',
        width: widthStyle,
        backgroundColor: color,
        borderRadius: 100,
      }}
    />
  );
};

// ─── PHOTOS TAB ──────────────────────────────────────────────────
const PhotosTab: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      <Card pad={0} radius={20} style={{ overflow: 'hidden' }}>
        <View style={{ height: 260, flexDirection: 'row' }}>
          <View style={{ flex: 1, backgroundColor: theme.bgSubtle }}>
            <FoodImg q="person,silhouette,fitness,1" w="100%" h="100%" style={{ borderRadius: 0 }} />
            <View
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(0,0,0,0.6)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 100,
              }}
            >
              <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>1 mar</Text>
            </View>
          </View>
          <View style={{ width: 2, backgroundColor: '#fff' }} />
          <View style={{ flex: 1, backgroundColor: theme.bgSubtle }}>
            <FoodImg q="person,silhouette,fitness,2" w="100%" h="100%" style={{ borderRadius: 0 }} />
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: 'rgba(0,0,0,0.6)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 100,
              }}
            >
              <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>25 mai</Text>
            </View>
          </View>
        </View>
        <View style={{ padding: 14 }}>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text }}>
            Comparar antes e depois
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
            12 semanas de progresso · -2,8kg
          </Text>
        </View>
      </Card>

      <View>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
          Histórico
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={{ width: '32%' }}>
              <FoodImg q={`person,fitness,${i}`} w="100%" h={110} style={{ borderRadius: 10 }} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── HABITS TAB ──────────────────────────────────────────────────
const HabitsTab: React.FC = () => {
  const theme = useTheme();
  const habits = [
    { name: 'Dormir 8h', streak: 9, done: true },
    { name: 'Beber 2L de água', streak: 12, done: true },
    { name: 'Sem ultraprocessados', streak: 4, done: false },
    { name: 'Caminhada 30min', streak: 7, done: true },
  ];
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Card pad={0} radius={18}>
        {habits.map((h, i) => (
          <View
            key={h.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: i < habits.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: h.done ? theme.primary : theme.bgSubtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {h.done && <Icon.check size={16} color="#fff" stroke={3} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>{h.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Icon.flame size={12} color={theme.warning} />
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
                  {h.streak} dias
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
};
