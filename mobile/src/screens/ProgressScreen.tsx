// Progresso — porte completo do ProgressScreen.
// 4 tabs: Peso (com CRUD), Macros (bar chart + breakdown), Fotos, Hábitos.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, ScrollView, Pressable, Alert, Modal, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
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
import { ProgressMenuSheet } from '../components/ProgressMenuSheet';
import { EditWeightGoalModal } from '../components/EditWeightGoalModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { ShareJourneyModal } from '../components/ShareJourneyModal';
import { WeightCalendarModal } from '../components/WeightCalendarModal';
import { MonthCalendar } from '../components/MonthCalendar';
import { EditHabitModal } from '../components/EditHabitModal';
import { calcStreak, dayKey, type Habit } from '../storage/habits';
import {
  requestNotificationPermission,
  scheduleNamedDailyReminder,
  cancelNamedReminder,
  habitNotifId,
} from '../utils/notifications';
import { useApp, type WeightEntry } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { SEED_ACHIEVEMENTS, formatUnlockedDate } from '../data/achievements';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(SCircle);
const AnimatedSRect = Animated.createAnimatedComponent(SRect);

type TabId = 'weight' | 'macros' | 'photos' | 'habits';
type Period = '7D' | '30D';

const PERIOD_DAYS: Record<Period, number> = {
  '7D': 7,
  '30D': 30,
};

export const ProgressScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<any>();
  const replayKey = useFocusReplay();
  const { weightGoalKg, setWeightGoal, setMacroTargets, displayedMacros } = useApp();
  const [tab, setTab] = useState<TabId>('weight');
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // O calendário é contextual: na tab Peso mostra dias com pesagem,
  // nas tabs Macros/Fotos/Hábitos abre o MonthCalendar de aderência de macros.
  const onOpenCalendar = () => setCalendarOpen(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Progresso"
        large
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="cal" icon={Icon.calendar} onPress={onOpenCalendar} />,
          <IconBtn key="more" icon={Icon.more} onPress={() => setMenuOpen(true)} />,
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
      <ProgressMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEditGoal={() => setEditGoalOpen(true)}
        onReminders={() => setRemindersOpen(true)}
        onShare={() => setShareOpen(true)}
      />
      <EditWeightGoalModal
        visible={editGoalOpen}
        onClose={() => setEditGoalOpen(false)}
        currentKg={weightGoalKg}
        currentTargets={{
          kcal: displayedMacros.kcal.target,
          p: displayedMacros.p.target,
          c: displayedMacros.c.target,
          f: displayedMacros.f.target,
        }}
        onSave={({ kg, targets }) => {
          setWeightGoal(kg);
          setMacroTargets(targets);
        }}
      />
      <NotificationsModal visible={remindersOpen} onClose={() => setRemindersOpen(false)} />
      <ShareJourneyModal visible={shareOpen} onClose={() => setShareOpen(false)} />
      {tab === 'weight' ? (
        <WeightCalendarModal visible={calendarOpen} onClose={() => setCalendarOpen(false)} />
      ) : (
        <MonthCalendar
          visible={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          today={new Date().getDate()}
          todayKcal={displayedMacros.kcal.value}
          todayP={displayedMacros.p.value}
          todayC={displayedMacros.c.value}
          todayF={displayedMacros.f.value}
        />
      )}
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
  // User começa com 0 conquistas desbloqueadas. Mostra os 8 catálogos como
  // BLOQUEADAS (cinza, sem data, opacity 50%) — assim user vê o que tem pra
  // conquistar, mas fica claro que nada foi desbloqueado ainda.
  const unlockedCount = 0;
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
                {unlockedCount} de {SEED_ACHIEVEMENTS.length} desbloqueadas
              </Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {SEED_ACHIEVEMENTS.map((a) => {
              const IconC = Icon[a.icon];
              // Tudo bloqueado por enquanto — quando sistema de unlock existir,
              // gating real determina cor/data por achievement.
              const locked = true;
              const color = locked ? theme.textFaint : toneToColor(a.tone);
              return (
                <View
                  key={a.id}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: theme.bgElev,
                    opacity: locked ? 0.55 : 1,
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
                    {locked ? (
                      <Icon.lock size={18} color={theme.textFaint} stroke={2} />
                    ) : (
                      <IconC size={20} color={color} stroke={2} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '700', color: theme.text, flex: 1 }}>
                        {a.title}
                      </Text>
                      {!locked && (
                        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginLeft: 8 }}>
                          {formatUnlockedDate(a.unlockedAt)}
                        </Text>
                      )}
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

// ─── Streak card ──
// Conta dias consecutivos em que o user marcou um dia como "completo" no Diário.
// User novo começa com 0. Semana segunda→domingo (padrão BR), check nos dias completados.
const StreakCard: React.FC = () => {
  const theme = useTheme();
  const { completedDays } = useApp();
  const today = new Date();
  // getDay(): 0=Dom..6=Sáb. Mapeia pra semana começando segunda: Seg=0, ..., Dom=6.
  const todayWeekday = (today.getDay() + 6) % 7;
  const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  // Streak: conta dias consecutivos retrocedendo a partir de hoje.
  const streak = calcStreak(completedDays);

  // Dias completados desta semana (pra marcar os indicadores).
  const completedSet = new Set(completedDays);
  const weekDoneFlags = labels.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (todayWeekday - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return completedSet.has(key);
  });

  return (
    <Card pad={16} radius={20} style={{ flex: 1.3, backgroundColor: theme.primarySoft }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 30, fontWeight: '800', color: theme.primaryDeep, letterSpacing: -0.4 }}>
            {streak}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '600' }}>
            {streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </Text>
        </View>
        <Icon.flame size={32} color={theme.primaryDeep} stroke={1.5} />
      </View>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 12 }}>
        {labels.map((d, i) => {
          const isToday = i === todayWeekday;
          const done = weekDoneFlags[i];
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


// ─── Achievements card ──
// User começa com 0 conquistas. Sistema de unlock real vem depois.
const AchievementsCard: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const theme = useTheme();
  const badges = [theme.fatsGold, theme.primaryDeep, theme.proteinPink, theme.carbsBlue];
  const count: number = 0; // TODO: derivar de sistema de unlock quando existir
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
    <Card pad={16} radius={20} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 30, fontWeight: '800', color: theme.text, letterSpacing: -0.4 }}>
            {count}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600' }}>
            {count === 1 ? 'conquista' : 'conquistas'}
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

// ─── Cell de stat embaixo do gráfico de peso (estilo macros legenda) ──
const WeightStat: React.FC<{
  color: string;
  label: string;
  big: string;
  bigSuffix?: string;
  sub: string;
  tone?: 'good' | 'warn' | 'goal';
}> = ({ color, label, big, bigSuffix, sub, tone }) => {
  const theme = useTheme();
  const subColor =
    tone === 'warn' ? theme.warningDeep :
    tone === 'goal' || tone === 'good' ? theme.primaryDeep :
    theme.textMuted;
  const bigColor = tone === 'warn' ? theme.warningDeep : theme.text;
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: bigColor, letterSpacing: -0.3 }}>
          {big}
        </Text>
        {bigSuffix && (
          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', marginLeft: 2 }}>
            {bigSuffix}
          </Text>
        )}
      </View>
      <Text
        style={{
          fontFamily: FONT.body,
          fontSize: 9,
          fontWeight: '700',
          color: subColor,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: 1,
        }}
      >
        {sub}
      </Text>
    </View>
  );
};

// ─── WEIGHT TAB ──────────────────────────────────────────────────
const WeightTab: React.FC = () => {
  const theme = useTheme();
  const { weightEntries, weightGoalKg, addWeightEntry, removeWeightEntry } = useApp();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('7D');
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
  // Animação 0→1 das barras (mesmo padrão do AnimatedBar do MacrosTab).
  // Cada barra deriva y/height por interpolação. Re-anima ao trocar período.
  const chartAnim = useRef(new Animated.Value(0)).current;

  // ─── Definição do range do período ──────────────────────────────
  // Janela fixa (7 ou 30 dias) terminando hoje.
  const { startMs, endMs } = useMemo(() => {
    const now = Date.now();
    const days = PERIOD_DAYS[period];
    return { startMs: now - days * 24 * 60 * 60 * 1000, endMs: now };
  }, [period]);

  // Filtra entradas pelo período + ordena crescente por data
  const filteredEntries = useMemo(() => {
    return weightEntries
      .filter((e) => e.date >= startMs && e.date <= endMs)
      .sort((a, b) => a.date - b.date);
  }, [weightEntries, startMs, endMs]);

  // Re-anima as barras 0→1 ao mount, ao trocar período (7D/30D) ou quando
  // entradas mudam. Mesma duração (700ms) e easing default do AnimatedBar
  // do MacrosTab pra coerência visual.
  useEffect(() => {
    chartAnim.setValue(0);
    Animated.timing(chartAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [period, filteredEntries.length, chartAnim]);

  // Faixa de peso pra eixo Y — começa em ZERO pra preservar a proporção real.
  // Assim a meta (ex: 82kg) aparece visualmente próxima do topo das barras
  // (84-85kg), e a distância visual reflete a distância real até a meta.
  // O preço é que pequenas variações entre pesagens viram pouco distinguíveis,
  // mas é uma escolha consciente — a tab "Registros recentes" lista valores
  // exatos pra quem quer comparar.
  const { yMin, yMax, yMid } = useMemo(() => {
    const goal = weightGoalKg;
    if (filteredEntries.length === 0) {
      return { yMin: 0, yMax: Math.ceil(goal + 4), yMid: goal / 2 };
    }
    const kgs = filteredEntries.map((e) => e.kg);
    const hi = Math.ceil(Math.max(...kgs, goal) + 1);
    return { yMin: 0, yMax: hi, yMid: hi / 2 };
  }, [filteredEntries, weightGoalKg]);

  // Header info
  const current = weightEntries[0]?.kg ?? null;
  const periodOldest = filteredEntries[0]?.kg ?? null;
  const periodNewest = filteredEntries[filteredEntries.length - 1]?.kg ?? null;
  const delta = periodOldest != null && periodNewest != null ? periodNewest - periodOldest : 0;
  const deltaPositive = delta > 0;
  const deltaAbs = Math.abs(delta).toFixed(1).replace('.', ',');

  // ─── 3 stats do período (menor peso, peso perdido, progresso até alvo) ──
  // Menor peso do período: pega o min entre as pesagens no range.
  // Peso perdido no período: delta absoluto (se ganho, vira valor com sinal +).
  // Progresso até alvo: % do caminho percorrido entre o peso MAIS ANTIGO do
  // histórico inteiro (não só do período) e a meta. Vai de 0% (ainda nada)
  // até 100% (chegou na meta). Se ultrapassou a meta, capa em 100%.
  const minWeightInPeriod = filteredEntries.length
    ? Math.min(...filteredEntries.map((e) => e.kg))
    : null;
  const allTimeOldest = useMemo(() => {
    if (weightEntries.length === 0) return null;
    return [...weightEntries].sort((a, b) => a.date - b.date)[0];
  }, [weightEntries]);
  const progressPct = useMemo(() => {
    if (!allTimeOldest || current == null) return null;
    const startKg = allTimeOldest.kg;
    const totalToLose = startKg - weightGoalKg;
    if (totalToLose <= 0) return null; // já estava abaixo da meta no início
    const lostSoFar = startKg - current;
    return Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
  }, [allTimeOldest, current, weightGoalKg]);

  // ─── Coordenadas do SVG (viewBox 0..100 → preserveAspectRatio=none escala) ──
  const W = 100;
  const H = 100;
  // Padding horizontal interno do gráfico (em viewBox units) — garante que a
  // primeira e a última barra fiquem inteiras dentro do SVG, sem clip.
  const X_PAD = 3;
  const xFor = (date: number) => X_PAD + ((date - startMs) / (endMs - startMs)) * (W - X_PAD * 2);
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

  // ─── X ticks: 7 dias da semana (7D) ou 5 ticks uniformes (30D) ──
  // Cada tick carrega o timestamp real (`x`) — usado pra posicionar o label
  // absoluto sobre a posição da barra correspondente.
  const xTicks = useMemo(() => {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const DAY_MS = 24 * 60 * 60 * 1000;
    const fmtDay = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${cap(d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''))}`;

    if (period === '7D') {
      const ticks: { label: string; x: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endMs - i * DAY_MS);
        const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        ticks.push({ label: cap(wd).charAt(0), x: d.getTime() });
      }
      return ticks;
    }
    // 30D: 5 ticks distribuídos uniformemente
    const ticks: { label: string; x: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const t = startMs + (i / 4) * (endMs - startMs);
      ticks.push({ label: fmtDay(new Date(t)), x: t });
    }
    return ticks;
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
  const X_AXIS_H = 18;

  // Formata número de kg com vírgula brasileira
  const fmtKg = (k: number) => k.toFixed(1).replace('.', ',');
  const periodLabel = period === '7D' ? 'Últimos 7 dias' : 'Últimos 30 dias';
  const deltaPeriodLabel = period === '7D' ? 'em 7 dias' : 'em 30 dias';

  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {/* Card: layout estilo macros — label + título + chip de progresso + gráfico + 3 stats + período */}
      <Card pad={18} radius={22}>
        {/* Header: ÚLTIMOS XD + Evolução do peso + chip "X% até alvo" */}
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
              {periodLabel}
            </Text>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 2 }}>
              Evolução do peso
            </Text>
          </View>
          {progressPct != null && (
            <View style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700' }}>
                {progressPct}% até alvo
              </Text>
            </View>
          )}
        </View>

        {/* Chart: barras à esquerda (flex:1) + coluna do label "meta" à direita */}
        <View style={{ height: CHART_H + X_AXIS_H, flexDirection: 'row' }}>
         <View style={{ flex: 1, height: CHART_H + X_AXIS_H }}>
          <View style={{ height: CHART_H, position: 'relative' }}>
            {filteredEntries.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                  Sem pesagens nos últimos {period === '7D' ? '7' : '30'} dias
                </Text>
              </View>
            ) : (
              <Svg width="100%" height={CHART_H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                {/* Barras verticais — cada pesagem vira uma barra arredondada.
                    Inclui o caso de 1 só entry (do onboarding) — antes mostrava só um dot.
                    Animação: y e height interpolam de (H, 0) → (H-h, h). Cada barra
                    cresce de baixo pra cima conforme chartAnim vai de 0→1. */}
                {(() => {
                  const n = filteredEntries.length;
                  const slotW = W / Math.max(n, 7); // pelo menos 7 slots pra barra não ficar gigante
                  const barW = Math.min(5, Math.max(3, slotW * 0.6));
                  return filteredEntries.map((e, i) => {
                    const isLast = i === n - 1;
                    const x = xFor(e.date) - barW / 2;
                    const y = yFor(e.kg);
                    const h = Math.max(barW, H - y);
                    const animY = chartAnim.interpolate({ inputRange: [0, 1], outputRange: [H, H - h] });
                    const animH = chartAnim.interpolate({ inputRange: [0, 1], outputRange: [0, h] });
                    return (
                      <AnimatedSRect
                        key={i}
                        x={x}
                        y={animY}
                        width={barW}
                        height={animH}
                        rx={barW / 2}
                        ry={barW / 2}
                        fill={theme.primary}
                        fillOpacity={isLast ? 1 : 0.6}
                      />
                    );
                  });
                })()}
                {/* Linha horizontal pontilhada da meta */}
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

            {/* Overlay tocável: hit-area por barra (habilitada pra 1+ pesagens) */}
            {filteredEntries.length >= 1 &&
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

            {/* Tooltip da barra tocada */}
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
                    {fmtKg(e.kg)} kg
                  </Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.bg, opacity: 0.7, marginTop: 1 }}>
                    {dateLabel}
                  </Text>
                </View>
              );
            })()}

          </View>

          {/* X-axis labels alinhados ao centro de cada barra */}
          <View style={{ height: X_AXIS_H, paddingTop: 4, position: 'relative' }}>
            {xTicks.map((t, i) => {
              const pct = ((t.x - startMs) / (endMs - startMs)) * 100;
              const LABEL_W = 40;
              let left: DimensionValue = `${pct}%`;
              let marginLeft = -LABEL_W / 2;
              let alignItems: 'flex-start' | 'center' | 'flex-end' = 'center';
              if (i === 0 && pct < 5) { left = 0; marginLeft = 0; alignItems = 'flex-start'; }
              if (i === xTicks.length - 1 && pct > 95) { left = '100%'; marginLeft = -LABEL_W; alignItems = 'flex-end'; }
              return (
                <View
                  key={i}
                  pointerEvents="none"
                  style={{ position: 'absolute', left, top: 4, width: LABEL_W, marginLeft, alignItems }}
                >
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>
                    {t.label}
                  </Text>
                </View>
              );
            })}
          </View>
         </View>

         {/* Coluna direita: label "meta XX kg" alinhado verticalmente com a linha pontilhada
             e empurrado pra direita (encosta na borda direita do card). */}
         {goalYInChart !== null && (
           <View style={{ width: 56, height: CHART_H, position: 'relative', alignItems: 'flex-end' }}>
             <Text
               style={{
                 position: 'absolute',
                 right: 0,
                 top: `${(goalYInChart / H) * 100}%`,
                 marginTop: -7,
                 fontFamily: FONT.body,
                 fontSize: 10,
                 fontWeight: '700',
                 color: theme.primaryDeep,
                 textAlign: 'right',
               }}
             >
               meta {fmtKg(weightGoalKg)}kg
             </Text>
           </View>
         )}
        </View>

        {/* 3 stats: menor peso · peso perdido · % até alvo */}
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
          {/* Menor peso do período */}
          <WeightStat
            color={theme.primarySoft}
            label="Menor"
            big={minWeightInPeriod != null ? `${fmtKg(minWeightInPeriod)}` : '—'}
            bigSuffix={minWeightInPeriod != null ? 'kg' : undefined}
            sub={period === '7D' ? 'NA SEMANA' : 'NO MÊS'}
          />
          {/* Peso perdido/ganho */}
          <WeightStat
            color={deltaPositive ? theme.warning : theme.primary}
            label="Variação"
            big={
              filteredEntries.length < 2
                ? '—'
                : `${deltaPositive ? '+' : '−'}${deltaAbs}`
            }
            bigSuffix={filteredEntries.length >= 2 ? 'kg' : undefined}
            sub={filteredEntries.length >= 2 ? deltaPeriodLabel.toUpperCase() : 'SEM DADOS'}
            tone={deltaPositive ? 'warn' : 'good'}
          />
          {/* kg que ainda falta perder + % de progresso na subtag */}
          {(() => {
            const remainingKg = current != null ? current - weightGoalKg : null;
            const showRemaining = remainingKg != null && remainingKg > 0;
            return (
              <WeightStat
                color={theme.primaryDeep}
                label="Falta"
                big={showRemaining ? fmtKg(remainingKg) : (remainingKg != null && remainingKg <= 0 ? '0' : '—')}
                bigSuffix={remainingKg != null ? 'kg' : undefined}
                sub={
                  remainingKg != null && remainingKg <= 0
                    ? 'META BATIDA'
                    : progressPct != null
                      ? `${progressPct}% FEITO`
                      : 'PRA META'
                }
                tone="goal"
              />
            );
          })()}
        </View>

        {/* Period selector — só 7D e 30D */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
          {(['7D', '30D'] as Period[]).map((p) => {
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
                <Text style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: '700', color: active ? theme.bg : theme.textMuted }}>
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
  // No futuro virão do perfil real do user; por ora seguem o seed de demo.
  const targets = {
    p: displayedMacros.p.target,
    c: displayedMacros.c.target,
    f: displayedMacros.f.target,
  };
  // Dias passados começam zerados — vão preencher conforme user registrar refeições.
  // (Histórico real virá do backend quando subir. No MVP, só HOJE tem dado real.)
  const todayWeekdayLetter = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][new Date().getDay()];
  const emptyDay = (letter: string) => ({ d: letter, p: 0, c: 0, f: 0 });
  const days = [
    emptyDay('S'),
    emptyDay('T'),
    emptyDay('Q'),
    emptyDay('Q'),
    emptyDay('S'),
    emptyDay('S'),
    {
      d: todayWeekdayLetter,
      p: isToday ? displayedMacros.p.value : 0,
      c: isToday ? displayedMacros.c.value : 0,
      f: isToday ? displayedMacros.f.value : 0,
    },
  ];

  // % avg real (apenas dias com registro contribuem — não dilui com zeros)
  const safeAvg = (key: 'p' | 'c' | 'f', target: number) => {
    const withData = days.filter((d) => d[key] > 0);
    if (withData.length === 0 || target === 0) return 0;
    const sum = withData.reduce((a, x) => a + x[key], 0);
    return Math.round((sum / withData.length / target) * 100);
  };
  const avgPct = {
    p: safeAvg('p', targets.p),
    c: safeAvg('c', targets.c),
    f: safeAvg('f', targets.f),
  };
  const overallAvg = Math.round((avgPct.p + avgPct.c + avgPct.f) / 3);
  const macroDefs = [
    { k: 'p' as const, label: 'Proteína', color: theme.proteinPink, target: targets.p, avg: avgPct.p },
    { k: 'c' as const, label: 'Carbo', color: theme.carbsBlue, target: targets.c, avg: avgPct.c },
    { k: 'f' as const, label: 'Gordura', color: theme.fatsGold, target: targets.f, avg: avgPct.f },
  ];

  // Heatmap começa vazio (cinza claro) — vai preencher conforme histórico real chega.
  const heatmapCells = Array.from({ length: 12 * 7 }).map(() => 0);

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
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700' }}>{overallAvg}% meta</Text>
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
  const { progressPhotos, addProgressPhoto, removeProgressPhoto, weightEntries } = useApp();
  const toast = useToast();
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<{ id: string } | null>(null);

  // Pesagem mais recente por dia — pra anexar o peso à foto automaticamente
  const lastWeightToday = (): number | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tsTodayStart = today.getTime();
    const w = weightEntries.find((e) => e.date >= tsTodayStart);
    return w?.kg ?? weightEntries[0]?.kg;
  };

  const fmtDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}`;
  };

  const pickFromCamera = async () => {
    setSourceSheetOpen(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { toast('Permissão da câmera negada', 'error'); return; }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.85, allowsEditing: false });
    if (res.canceled || !res.assets?.[0]) return;
    addProgressPhoto(res.assets[0].uri, lastWeightToday());
    toast('Foto adicionada · histórico atualizado');
  };

  const pickFromLibrary = async () => {
    setSourceSheetOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast('Permissão da galeria negada', 'error'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.85 });
    if (res.canceled || !res.assets?.[0]) return;
    addProgressPhoto(res.assets[0].uri, lastWeightToday());
    toast('Foto adicionada · histórico atualizado');
  };

  // Antes/depois: usa a foto mais antiga + mais recente (se >= 2)
  const sortedAsc = [...progressPhotos].sort((a, b) => a.date - b.date);
  const before = sortedAsc[0];
  const after = sortedAsc[sortedAsc.length - 1];
  const hasComparison = progressPhotos.length >= 2;
  const weeksBetween =
    before && after ? Math.max(1, Math.round((after.date - before.date) / (7 * 24 * 60 * 60 * 1000))) : 0;
  const deltaKg = before?.weightKg != null && after?.weightKg != null ? after.weightKg - before.weightKg : null;

  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {/* Botão principal — adicionar foto */}
      <Pressable
        onPress={() => setSourceSheetOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 18,
          backgroundColor: theme.primarySoft,
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.primaryDeep, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.camera size={20} color="#fff" stroke={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '800', color: theme.text }}>
            Adicionar foto de progresso
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '600', marginTop: 1 }}>
            {progressPhotos.length} {progressPhotos.length === 1 ? 'foto registrada' : 'fotos registradas'}
          </Text>
        </View>
        <Icon.plus size={18} color={theme.primaryDeep} stroke={2.5} />
      </Pressable>

      {/* Comparação antes/depois — só aparece quando tem 2+ fotos */}
      {hasComparison && before && after && (
        <Card pad={0} radius={20} style={{ overflow: 'hidden' }}>
          <View style={{ height: 260, flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: theme.bgSubtle }}>
              <Animated.Image source={{ uri: before.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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
                <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>
                  {fmtDate(before.date)}
                </Text>
              </View>
            </View>
            <View style={{ width: 2, backgroundColor: '#fff' }} />
            <View style={{ flex: 1, backgroundColor: theme.bgSubtle }}>
              <Animated.Image source={{ uri: after.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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
                <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>
                  {fmtDate(after.date)}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ padding: 14 }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text }}>
              Comparar antes e depois
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
              {weeksBetween} {weeksBetween === 1 ? 'semana' : 'semanas'} de progresso
              {deltaKg != null ? ` · ${deltaKg > 0 ? '+' : ''}${deltaKg.toFixed(1).replace('.', ',')}kg` : ''}
            </Text>
          </View>
        </Card>
      )}

      {/* Histórico (real) ou empty state */}
      <View>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
          Histórico
        </Text>
        {progressPhotos.length === 0 ? (
          <Card pad={20} radius={16}>
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.camera size={24} color={theme.textMuted} stroke={1.5} />
              </View>
              <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
                Nenhuma foto ainda
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 17 }}>
                Tire uma foto agora pra começar seu antes/depois. Sugestão: tirar sempre no mesmo horário e iluminação.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {progressPhotos.map((p) => (
              <Pressable
                key={p.id}
                onLongPress={() => setPendingRemove({ id: p.id })}
                style={{ width: '32%' }}
              >
                <View style={{ borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                  <Animated.Image source={{ uri: p.uri }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 100,
                    }}
                  >
                    <Text style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: '700', color: '#fff' }}>
                      {fmtDate(p.date)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {progressPhotos.length > 0 && (
          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, textAlign: 'center', marginTop: 10 }}>
            Pressione e segure pra remover
          </Text>
        )}
      </View>

      {/* Bottom-sheet de origem (câmera / galeria) */}
      <Modal visible={sourceSheetOpen} transparent animationType="fade" onRequestClose={() => setSourceSheetOpen(false)}>
        <Pressable onPress={() => setSourceSheetOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28, gap: 4 }}>
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <SourceItem
              icon={Icon.camera}
              tint={theme.primaryDeep}
              tintBg={theme.primarySoft}
              title="Tirar foto agora"
              subtitle="Abre a câmera"
              onPress={pickFromCamera}
            />
            <SourceItem
              icon={Icon.gallery}
              tint="#B07A1E"
              tintBg="#F8ECD7"
              title="Escolher da galeria"
              subtitle="Selecionar uma foto existente"
              onPress={pickFromLibrary}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal de confirmação de remoção */}
      <Modal visible={!!pendingRemove} transparent animationType="fade" onRequestClose={() => setPendingRemove(null)}>
        <Pressable onPress={() => setPendingRemove(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 22, gap: 14 }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>Remover foto?</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 18 }}>
              Esta ação não pode ser desfeita.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="outline" size="md" onPress={() => setPendingRemove(null)} full>Cancelar</Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="md" onPress={() => { if (pendingRemove) removeProgressPhoto(pendingRemove.id); setPendingRemove(null); toast('Foto removida'); }} full>Remover</Btn>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const SourceItem: React.FC<{
  icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  tint: string;
  tintBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}> = ({ icon: IconC, tint, tintBg, title, subtitle, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: tintBg, alignItems: 'center', justifyContent: 'center' }}>
        <IconC size={18} color={tint} stroke={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>{title}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{subtitle}</Text>
      </View>
    </Pressable>
  );
};

// ─── HABITS TAB ──────────────────────────────────────────────────
const HabitsTab: React.FC = () => {
  const theme = useTheme();
  const { habits, addHabit, updateHabit, removeHabit, toggleHabitToday } = useApp();
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const editingHabit = habits.find((h) => h.id === editingId);
  const today = dayKey();

  // Agenda/cancela notificação ao mudar hábito (chamado após save)
  const syncNotification = async (habit: Habit) => {
    const notifId = habitNotifId(habit.id);
    if (!habit.reminderTime) {
      await cancelNamedReminder(notifId);
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) return; // user-side issue, mas state já tá salvo
    await scheduleNamedDailyReminder(
      notifId,
      `${habit.name} 💪`,
      `Hora de bater seu hábito de hoje!`,
      habit.reminderTime,
    );
  };

  const onSaveNew = async (data: { name: string; reminderTime?: string }) => {
    const h = addHabit(data.name, data.reminderTime);
    if (data.reminderTime) {
      await syncNotification(h);
      toast(`Hábito criado · lembrete às ${data.reminderTime}`);
    } else {
      toast('Hábito criado');
    }
  };

  const onSaveEdit = async (data: { name: string; reminderTime?: string }) => {
    if (!editingHabit) return;
    updateHabit(editingHabit.id, data);
    const updated: Habit = { ...editingHabit, ...data };
    await syncNotification(updated);
    toast('Hábito atualizado');
  };

  const onDelete = async () => {
    if (!editingHabit) return;
    await cancelNamedReminder(habitNotifId(editingHabit.id));
    removeHabit(editingHabit.id);
    toast('Hábito removido');
  };

  return (
    <View style={{ paddingHorizontal: 16, gap: 14 }}>
      {habits.length === 0 ? (
        <Card pad={20} radius={18}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.flame size={24} color={theme.textMuted} stroke={1.5} />
            </View>
            <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
              Nenhum hábito ainda
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 17 }}>
              Crie hábitos diários (água, sono, caminhada) e marque a cada dia pra manter o streak.
            </Text>
          </View>
        </Card>
      ) : (
        <Card pad={0} radius={18}>
          {habits.map((h, i) => {
            const done = h.completedDays.includes(today);
            const streak = calcStreak(h.completedDays);
            return (
              <Pressable
                key={h.id}
                onPress={() => toggleHabitToday(h.id)}
                onLongPress={() => setEditingId(h.id)}
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
                    backgroundColor: done ? theme.primary : theme.bgSubtle,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done && <Icon.check size={16} color="#fff" stroke={3} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>{h.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon.flame size={12} color={theme.warning} />
                      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
                        {streak} {streak === 1 ? 'dia' : 'dias'}
                      </Text>
                    </View>
                    {h.reminderTime && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Icon.clock size={11} color={theme.primaryDeep} stroke={2} />
                        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700' }}>
                          {h.reminderTime}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={(e: any) => { e?.stopPropagation?.(); setEditingId(h.id); }}
                  hitSlop={8}
                  style={{ padding: 4 }}
                >
                  <Icon.more size={18} color={theme.textMuted} stroke={2} />
                </Pressable>
              </Pressable>
            );
          })}
        </Card>
      )}

      <Pressable
        onPress={() => setCreating(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: theme.border,
          borderStyle: 'dashed',
        }}
      >
        <Icon.plus size={16} color={theme.primaryDeep} stroke={2.5} />
        <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.primaryDeep }}>
          Adicionar hábito
        </Text>
      </Pressable>

      {habits.length > 0 && (
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, textAlign: 'center' }}>
          Toque pra marcar como feito hoje · Pressione e segure pra editar
        </Text>
      )}

      <EditHabitModal
        visible={creating}
        onClose={() => setCreating(false)}
        onSave={onSaveNew}
      />
      <EditHabitModal
        visible={!!editingHabit}
        onClose={() => setEditingId(null)}
        habit={editingHabit}
        onSave={onSaveEdit}
        onDelete={onDelete}
      />
    </View>
  );
};
