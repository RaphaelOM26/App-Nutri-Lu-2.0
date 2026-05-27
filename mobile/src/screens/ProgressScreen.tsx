// Progresso — porte completo do ProgressScreen.
// 4 tabs: Peso (com CRUD), Macros (bar chart + breakdown), Fotos, Hábitos.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Polyline, Polygon, Path, Circle as SCircle, Line as SLine, Rect as SRect } from 'react-native-svg';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { LuBtn } from '../components/LuBtn';
import { Btn } from '../components/Btn';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icons';
import { FoodImg } from '../components/FoodImg';
import { AddWeightModal } from '../components/AddWeightModal';
import { useApp, type WeightEntry } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { SEED_ACHIEVEMENTS, formatUnlockedDate } from '../data/achievements';

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
  const [achievementsOpen, setAchievementsOpen] = useState(false);

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
          <AchievementsCard onPress={() => setAchievementsOpen(true)} />
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

      <AchievementsModal visible={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
    </SafeAreaView>
  );
};

// ─── Modal de conquistas ─────────────────────────────────────────
const ACHIEVEMENT_TONES: Record<string, string> = {};
const AchievementsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const theme = useTheme();
  const toneToColor = (t: string) => {
    if (t === 'primary') return theme.primary;
    if (t === 'protein') return theme.proteinPink;
    if (t === 'carbs') return theme.carbsBlue;
    if (t === 'fats') return theme.fatsGold;
    if (t === 'water') return theme.waterIce;
    if (t === 'warning') return theme.warning;
    return theme.primary;
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 20, gap: 12, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.fatsGold + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.award size={20} color={theme.fatsGold} stroke={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                Conquistas
              </Text>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text, marginTop: 1 }}>
                {SEED_ACHIEVEMENTS.length} desbloqueadas
              </Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {SEED_ACHIEVEMENTS.map((a) => {
              const IconC = Icon[a.icon];
              const color = toneToColor(a.tone);
              return (
                <View key={a.id} style={{ flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, backgroundColor: theme.bgElev }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <IconC size={20} color={color} stroke={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '700', color: theme.text, flex: 1 }}>
                        {a.title}
                      </Text>
                      <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginLeft: 8 }}>
                        {formatUnlockedDate(a.unlockedAt)}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                      {a.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <Pressable onPress={onClose} style={{ padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.text }}>
            <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.bg, fontWeight: '700' }}>Fechar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── Streak card (12 dias + 7 mini indicadores da semana atual) ──
// Semana segunda→domingo (padrão BR). Check nos dias até HOJE, vazio nos futuros.
// Dia de hoje fica destacado com borda branca.
const StreakCard: React.FC = () => {
  const theme = useTheme();
  const today = new Date();
  // getDay(): 0=Dom..6=Sáb. Mapeia pra semana começando segunda: Seg=0, ..., Dom=6.
  const todayWeekday = (today.getDay() + 6) % 7;
  const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
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
        {labels.map((d, i) => {
          const isPast = i < todayWeekday;
          const isToday = i === todayWeekday;
          const done = isPast || isToday; // marca como feito até hoje (mock)
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: done ? theme.primaryDeep : 'rgba(255,255,255,0.5)',
                  borderWidth: isToday ? 2 : 0,
                  borderColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {done && <Icon.check size={12} color="#fff" stroke={3} />}
              </View>
              <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.primaryDeep, fontWeight: isToday ? '800' : '700' }}>{d}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

// ─── Achievements card (7 + badges stacked) ──────────────────────
const AchievementsCard: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const theme = useTheme();
  const badges = [theme.fatsGold, theme.primaryDeep, theme.proteinPink, theme.carbsBlue];
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
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
    </Pressable>
  );
};

// ─── WEIGHT TAB ──────────────────────────────────────────────────
const WeightTab: React.FC = () => {
  const theme = useTheme();
  const { weightEntries, weightGoalKg, addWeightEntry, removeWeightEntry } = useApp();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('90D');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  // Modal custom de confirmação ao remover pesagem (substitui Alert.alert feio)
  const [pendingRemove, setPendingRemove] = useState<WeightEntry | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showHover = (idx: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredIdx(idx);
    // Auto-fecha após 2.5s sem mais interação
    hoverTimer.current = setTimeout(() => setHoveredIdx(null), 2500);
  };

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

  // ─── Smooth path (Catmull-Rom → Bezier cúbica) ──
  // Suaviza a linha entre pontos pra dar um visual mais elegante (modelo A).
  const smoothPath = useMemo(() => {
    const pts = filteredEntries.map((e) => ({ x: xFor(e.date), y: yFor(e.kg) }));
    if (pts.length < 2) return '';
    const tension = 0.2;
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const prev2 = pts[i - 2] || prev;
      const next = pts[i + 1] || curr;
      const cp1x = prev.x + (curr.x - prev2.x) * tension;
      const cp1y = prev.y + (curr.y - prev2.y) * tension;
      const cp2x = curr.x - (next.x - prev.x) * tension;
      const cp2y = curr.y - (next.y - prev.y) * tension;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }
    return d;
  }, [filteredEntries, startMs, endMs, yMin, yMax]);

  // Path da área sombreada (mesmo smooth, fechado até a baseline)
  const smoothAreaPath = useMemo(() => {
    if (!smoothPath || filteredEntries.length < 2) return '';
    const firstX = xFor(filteredEntries[0].date);
    const lastX = xFor(filteredEntries[filteredEntries.length - 1].date);
    return `${smoothPath} L ${lastX},${H} L ${firstX},${H} Z`;
  }, [smoothPath, filteredEntries, startMs, endMs]);

  // Y da meta no SVG (pra linha pontilhada horizontal)
  const goalYInChart = weightGoalKg >= yMin && weightGoalKg <= yMax ? yFor(weightGoalKg) : null;
  const lastKg = filteredEntries[filteredEntries.length - 1]?.kg;
  const aboveGoalKg = lastKg != null ? lastKg - weightGoalKg : 0;

  // (Sem animações no gráfico de peso — atualização instantânea ao mudar período)

  // ─── X ticks: contagem e labels mudam por período ──
  //  - 7D: 7 dias da semana (na ordem dos últimos 7 dias)
  //  - 30D: 4 semanas (Sem 1 → 4)
  //  - 90D: 3 meses (últimos 3 meses do calendário)
  //  - 1A / Tudo: 12 meses (últimos 12 meses do calendário)
  // ─── X ticks ──
  // Agora cada tick carrega o timestamp real (`x`) — usado pra posicionar
  // o label absoluto sobre a posição da barra correspondente, garantindo
  // alinhamento com o que está no gráfico.
  const xTicks = useMemo(() => {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const DAY_MS = 24 * 60 * 60 * 1000;
    const fmtDay = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${cap(d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''))}`;
    const fmtMonth = (d: Date) => cap(d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));

    switch (period) {
      case '7D': {
        const ticks: { label: string; x: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(endMs - i * DAY_MS);
          const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          ticks.push({ label: cap(wd), x: d.getTime() });
        }
        return ticks;
      }
      case '30D': {
        // 5 ticks distribuídos UNIFORMEMENTE ao longo dos 30 dias do período.
        // Cobre o range completo (do startMs ao endMs).
        const ticks: { label: string; x: number }[] = [];
        for (let i = 0; i < 5; i++) {
          const t = startMs + (i / 4) * (endMs - startMs);
          ticks.push({ label: fmtDay(new Date(t)), x: t });
        }
        return ticks;
      }
      case '90D': {
        // Início do mês pra cada um dos últimos 3 meses (ex: "Mar", "Abr", "Mai")
        const ticks: { label: string; x: number }[] = [];
        const end = new Date(endMs);
        for (let i = 2; i >= 0; i--) {
          const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
          // Se o início do mês está antes do startMs, clampa
          const t = Math.max(startMs, d.getTime());
          ticks.push({ label: fmtMonth(d), x: t });
        }
        return ticks;
      }
      case '1A': {
        // Mostra ~6 ticks bimestrais pra não ficar apertado (12 meses)
        const ticks: { label: string; x: number }[] = [];
        const end = new Date(endMs);
        for (let i = 10; i >= 0; i -= 2) {
          const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
          const t = Math.max(startMs, d.getTime());
          ticks.push({ label: fmtMonth(d), x: t });
        }
        return ticks;
      }
      case 'Tudo':
      default: {
        // Adaptativo: ticks proporcionais ao RANGE REAL do histórico do user.
        // Antes era bimestral fixo (10 meses atrás) — se o histórico tinha só
        // 7 dias, todos os 6 ticks viravam x=startMs (clampados) e ficavam
        // empilhados na esquerda do gráfico (bug visual).
        const rangeMs = endMs - startMs;
        const rangeDays = rangeMs / DAY_MS;
        const ticks: { label: string; x: number }[] = [];

        if (rangeDays <= 8) {
          // Curto — mostra dia da semana de cada dia
          const totalDays = Math.max(2, Math.ceil(rangeDays));
          for (let i = totalDays; i >= 0; i--) {
            const t = endMs - i * DAY_MS;
            if (t < startMs) continue;
            const d = new Date(t);
            const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            ticks.push({ label: cap(wd), x: t });
          }
        } else if (rangeDays <= 60) {
          // Médio — 5 ticks uniformes com data DD MMM
          for (let i = 0; i < 5; i++) {
            const t = startMs + (i / 4) * rangeMs;
            ticks.push({ label: fmtDay(new Date(t)), x: t });
          }
        } else if (rangeDays <= 180) {
          // ~6 meses — 1 tick por mês
          const end = new Date(endMs);
          const monthsBack = Math.min(6, Math.ceil(rangeDays / 30));
          for (let i = monthsBack - 1; i >= 0; i--) {
            const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
            const t = Math.max(startMs, d.getTime());
            ticks.push({ label: fmtMonth(d), x: t });
          }
        } else {
          // Longo — bimestral, máximo 6 ticks
          const end = new Date(endMs);
          const monthsBack = Math.ceil(rangeDays / 30);
          const step = monthsBack > 12 ? 2 : 1;
          for (let i = Math.min(monthsBack - 1, 10); i >= 0; i -= step) {
            const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
            const t = Math.max(startMs, d.getTime());
            ticks.push({ label: fmtMonth(d), x: t });
          }
        }

        // Dedup ticks no mesmo ponto X (acontece quando clamp colide datas)
        const seen = new Set<string>();
        return ticks.filter((tk) => {
          // Agrupa por dia pra evitar duplicatas
          const key = String(Math.round(tk.x / DAY_MS));
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
    }
  }, [period, endMs, startMs]);

  const onAddSaved = (kg: number) => {
    addWeightEntry(kg);
    toast(`Pesagem registrada · ${kg.toFixed(1).replace('.', ',')} kg`);
  };

  const onLongPressEntry = (entry: WeightEntry) => {
    setPendingRemove(entry);
  };

  const confirmRemove = () => {
    if (!pendingRemove) return;
    removeWeightEntry(pendingRemove.id);
    toast('Pesagem removida');
    setPendingRemove(null);
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
                  {/* Modelo B: barras verticais — cada pesagem é uma barra */}
                  {(() => {
                    const n = filteredEntries.length;
                    // Largura de cada slot = W / n; barra ocupa ~65% (o resto é gap entre elas).
                    // Cap pra barras não ficarem largas demais com poucos pontos.
                    const slotW = W / n;
                    const barW = Math.min(2.5, slotW * 0.65);
                    return filteredEntries.map((e, i) => {
                      const isLast = i === n - 1;
                      const x = xFor(e.date) - barW / 2;
                      const y = yFor(e.kg);
                      const h = H - y;
                      return (
                        <SRect
                          key={i}
                          x={x}
                          y={y}
                          width={barW}
                          height={h}
                          rx={barW / 3}
                          ry={barW / 3}
                          fill={theme.primary}
                          fillOpacity={isLast ? 1 : 0.55}
                        />
                      );
                    });
                  })()}
                  {/* Linha horizontal pontilhada da meta (mantida sobre as barras) */}
                  {goalYInChart !== null && (
                    <SLine
                      x1={0}
                      y1={goalYInChart}
                      x2={W}
                      y2={goalYInChart}
                      stroke={theme.primaryDeep}
                      strokeWidth={1}
                      strokeDasharray="2,3"
                      strokeOpacity={0.7}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </Svg>
              )}

              {/* Overlay tocável: 1 hit-area por barra (mais largo que a barra
                  pra facilitar o toque). onPressIn = aparece já no contato. */}
              {filteredEntries.length >= 2 &&
                filteredEntries.map((e, i) => {
                  const pct = ((e.date - startMs) / (endMs - startMs)) * 100;
                  const HIT_W = 28;
                  return (
                    <Pressable
                      key={`hit-${i}`}
                      onPressIn={() => showHover(i)}
                      onHoverIn={() => showHover(i)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${pct}%`,
                        marginLeft: -HIT_W / 2,
                        width: HIT_W,
                      }}
                    />
                  );
                })}

              {/* Tooltip flutuante mostrando peso + data da barra selecionada */}
              {hoveredIdx !== null && filteredEntries[hoveredIdx] && (() => {
                const e = filteredEntries[hoveredIdx];
                const pct = ((e.date - startMs) / (endMs - startMs)) * 100;
                const onLeftHalf = pct < 50;
                const d = new Date(e.date);
                const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
                return (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      // Posiciona próximo da barra; flip pra esquerda se barra estiver na direita
                      left: `${pct}%`,
                      marginLeft: onLeftHalf ? 6 : -90,
                      top: `${(yFor(e.kg) / H) * 100}%`,
                      marginTop: -42,
                      width: 84,
                      backgroundColor: theme.text,
                      borderRadius: 10,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                    }}
                  >
                    <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, fontWeight: '800', color: theme.bg }}>
                      {e.kg.toFixed(1).replace('.', ',')} kg
                    </Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.bg, opacity: 0.7, marginTop: 1 }}>
                      {dateLabel}
                    </Text>
                  </View>
                );
              })()}

              {/* Label da meta sobreposto à direita da linha pontilhada */}
              {goalYInChart !== null && filteredEntries.length >= 2 && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: `${(goalYInChart / H) * 100}%`,
                    marginTop: -16,
                    backgroundColor: theme.bg,
                    paddingHorizontal: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: '700', color: theme.primaryDeep }}>
                    meta {weightGoalKg.toFixed(1).replace('.', ',')}kg
                  </Text>
                </View>
              )}
            </View>

            {/* X-axis labels: cada label é um wrapper de largura fixa centrado
                no X do timestamp (técnica padrão pra centralizar sobre coord).
                Isso alinha o CENTRO do label com o CENTRO da barra correspondente. */}
            <View style={{ height: X_AXIS_H, paddingTop: 4, position: 'relative' }}>
              {xTicks.map((t, i) => {
                const pct = ((t.x - startMs) / (endMs - startMs)) * 100;
                const LABEL_W = 50;
                // Ancoragem: ponto da esquerda fica em `left: pct% - LABEL_W/2`
                // Pro primeiro/último, evita sair do card limitando a min/max.
                let left: string | number = `${pct}%`;
                let marginLeft = -LABEL_W / 2;
                let alignItems: 'flex-start' | 'center' | 'flex-end' = 'center';
                if (i === 0 && pct < 5) { left = 0; marginLeft = 0; alignItems = 'flex-start'; }
                if (i === xTicks.length - 1 && pct > 95) { left = '100%' as any; marginLeft = -LABEL_W; alignItems = 'flex-end'; }
                return (
                  <View
                    key={i}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left,
                      top: 4,
                      width: LABEL_W,
                      marginLeft,
                      alignItems,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT.body,
                        fontSize: 9,
                        color: theme.textFaint,
                        fontWeight: '600',
                      }}
                    >
                      {t.label}
                    </Text>
                  </View>
                );
              })}
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
                  {/* Coluna de peso com largura fixa pra alinhar a direita em todas as linhas */}
                  <Text style={{ width: 80, textAlign: 'right', fontFamily: FONT.headExtra, fontSize: 15, fontWeight: '800', color: theme.text }}>
                    {entry.kg.toFixed(1).replace('.', ',')} kg
                  </Text>
                  {/* Slot do delta sempre presente (mesmo se vazio) pra não empurrar o peso */}
                  <Text
                    style={{
                      width: 52,
                      textAlign: 'right',
                      marginLeft: 10,
                      fontFamily: FONT.body,
                      fontSize: 11,
                      color: d > 0 ? theme.warningDeep : theme.primaryDeep,
                      fontWeight: '700',
                    }}
                  >
                    {d !== 0 ? `${sign}${d.toFixed(1).replace('.', ',')}kg` : ''}
                  </Text>
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

      {/* Modal custom de remover pesagem — substitui Alert.alert (sem identidade visual) */}
      <Modal visible={!!pendingRemove} transparent animationType="fade" onRequestClose={() => setPendingRemove(null)}>
        <Pressable
          onPress={() => setPendingRemove(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <Pressable
            onPress={() => {}}
            style={{ backgroundColor: theme.bg, borderRadius: 20, padding: 22, width: '100%', maxWidth: 320, gap: 14 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.scale size={22} color={theme.text} stroke={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
                  Remover pesagem?
                </Text>
                {pendingRemove && (
                  <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
                    {pendingRemove.kg.toFixed(1).replace('.', ',')} kg · {formatDate(pendingRemove.date)}
                  </Text>
                )}
              </View>
            </View>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 19 }}>
              Esse registro será apagado e sairá do gráfico. Você pode adicionar de novo a qualquer momento.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="secondary" size="md" onPress={() => setPendingRemove(null)} full>
                  Cancelar
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="md" icon={Icon.trash} onPress={confirmRemove} full>
                  Remover
                </Btn>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  const { displayedMacros, isToday } = useApp();
  // Targets vêm do state (mesma fonte que Home e Diário).
  // No futuro, virão do perfil; por ora estão no mock alinhados com Larissa.
  const targets = {
    p: displayedMacros.p.target,
    c: displayedMacros.c.target,
    f: displayedMacros.f.target,
  };
  // Últimos 6 dias = mock (até ter histórico real de macros). HOJE = state real
  // do AppContext, então qualquer refeição adicionada/removida reflete aqui também.
  const todayWeekdayLetter = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][new Date().getDay()];
  const mockPastDays = [
    { d: 'S', p: 110, c: 180, f: 60 },
    { d: 'T', p: 125, c: 220, f: 55 },
    { d: 'Q', p: 95, c: 165, f: 70 },
    { d: 'Q', p: 130, c: 195, f: 62 },
    { d: 'S', p: 118, c: 175, f: 58 },
    { d: 'S', p: 105, c: 240, f: 75 },
  ];
  const today = {
    d: todayWeekdayLetter,
    p: isToday ? displayedMacros.p.value : 0,
    c: isToday ? displayedMacros.c.value : 0,
    f: isToday ? displayedMacros.f.value : 0,
  };
  const days = [...mockPastDays, today];

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
            const over = m.avg > 110;
            const OVER_RED = '#D67373';
            return (
              <View key={m.k} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color }} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
                    {m.label}
                  </Text>
                </View>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: over ? OVER_RED : theme.text, marginTop: 4, letterSpacing: -0.3 }}>
                  {m.avg}%
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 9,
                    fontWeight: '700',
                    color: over ? OVER_RED : onGoal ? theme.primaryDeep : theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  {over ? 'acima' : 'da meta'}
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
            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()]} · hoje
          </Text>
          {macroDefs.map((m, mi) => {
            const today = days[days.length - 1];
            const val = today[m.k];
            const pct = Math.round((val / m.target) * 100);
            const over = val > m.target;
            const OVER_RED = '#D67373';
            return (
              <View key={m.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ width: 60, fontFamily: FONT.body, fontSize: 11, color: theme.text, fontWeight: '600' }}>
                  {m.label}
                </Text>
                <View style={{ flex: 1, height: 6, borderRadius: 100, backgroundColor: theme.ringTrack, overflow: 'hidden', position: 'relative' }}>
                  <AnimatedBarHorizontal
                    targetPct={Math.min(100, pct)}
                    color={over ? OVER_RED : m.color}
                    delay={500 + mi * 120}
                  />
                  {over && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: OVER_RED,
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 12, fontWeight: '800', color: over ? OVER_RED : theme.text, minWidth: 38, textAlign: 'right' }}>
                  {pct}%
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: over ? OVER_RED : theme.textMuted, minWidth: 60, textAlign: 'right' }}>
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
