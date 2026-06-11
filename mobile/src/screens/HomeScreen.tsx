// Dashboard — porte do DashboardScreen em screens-home.jsx.
// Sem Quick Actions (essa seção vive no Diário, conforme design).

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Btn } from '../components/Btn';
import { Card } from '../components/Card';
import { FadeInUp, AnimatedNumber } from '../components/motion';
import { ConcentricRings } from '../components/ConcentricRings';
import { DateStrip } from '../components/DateStrip';
import { IconBtn } from '../components/IconBtn';
import { LuBtn } from '../components/LuBtn';
import { Icon } from '../components/Icons';
import { MealCard } from '../components/MealCard';
import { useApp } from '../state/AppContext';
import { Avatar } from '../components/Avatar';
import { useFocusReplay } from '../utils/useFocusReplay';
import type { RootStackParamList } from '../navigation/types';
import { formatRelativeTime, type AppNotification } from '../data/notifications';
import { generateInsight, ApiError, computeInsightTone, type InsightTone } from '../api/client';
import { calcStreak } from '../storage/habits';
import { loadInsight, saveInsight, makeStateHash } from '../storage/insight';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const replayKey = useFocusReplay();
  const {
    water,
    addWater,
    removeWater,
    selectedDateKey,
    setSelectedDate,
    displayedMacros,
    displayedMeals,
    isToday,
    notifications,
    readNotificationIds,
    unreadNotificationsCount,
    markAllNotificationsRead,
    markNotificationRead,
    profilePhotoUri,
    name,
    completedDays,
    weightEntries,
  } = useApp();
  // Nome de display + iniciais com fallbacks pra usuários pré-onboarding.
  const displayName = name ?? 'você';
  const initials = name ? name.trim().charAt(0).toUpperCase() : 'L';
  // Streak real baseado em dias completados — começa em 0 pra user novo.
  const streakDays = calcStreak(completedDays);
  // Hidratação alvo = ~35ml/kg do peso atual. Fallback 2000ml pra usuário pré-onboarding.
  const currentWeightKg = weightEntries[0]?.kg ?? 0;
  const dailyWaterTargetMl =
    currentWeightKg > 0 ? Math.round((currentWeightKg * 35) / 50) * 50 : 2000;
  const [notifOpen, setNotifOpen] = useState(false);

  // Insight regenerado a cada mudança real nos macros/refeições/hidratação.
  // Cache por "stateHash" evita chamada quando nada mudou (remounts).
  // Debounce 1.5s evita chamadas em sequência se o user registrar vários itens rápido.
  const [insight, setInsight] = useState<string | null>(null);
  const [insightTone, setInsightTone] = useState<InsightTone>('good');
  const [insightLoading, setInsightLoading] = useState(false);
  const mealsRegistered = displayedMeals.filter((m) => m.items.length > 0).length;
  const stateHash = makeStateHash({
    kcal: displayedMacros.kcal.value,
    p: displayedMacros.p.value,
    c: displayedMacros.c.value,
    f: displayedMacros.f.value,
    water,
    mealsRegistered,
  });

  useEffect(() => {
    if (!isToday) return; // não gera insight pra dia diferente do atual
    let alive = true;
    const timer = setTimeout(async () => {
      const cached = await loadInsight();
      if (!alive) return;
      if (cached && cached.stateHash === stateHash) {
        setInsight(cached.text);
        if (cached.tone) setInsightTone(cached.tone);
        return;
      }
      setInsightLoading(true);
      try {
        const macros = { kcal: displayedMacros.kcal, p: displayedMacros.p, c: displayedMacros.c, f: displayedMacros.f };
        const tone = computeInsightTone(macros);
        const { text, tone: returnedTone } = await generateInsight({
          profile: { name: name ?? 'Anônima', goal: 'Perder peso', weightKg: 85.2, goalWeightKg: 82 },
          macros,
          meals: displayedMeals.map((m) => ({
            name: m.name,
            items: m.items.map((it) => ({ name: it.name, portion: it.portion, kcal: it.kcal })),
          })),
          water,
          tone,
        });
        if (!alive) return;
        if (text) {
          const finalTone = returnedTone || tone;
          setInsight(text);
          setInsightTone(finalTone);
          saveInsight({ text, stateHash, tone: finalTone }).catch(() => {});
        }
      } catch (err) {
        if (err instanceof ApiError) console.warn('[insight]', err.message);
      } finally {
        if (alive) setInsightLoading(false);
      }
    }, 1500);
    return () => { alive = false; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateHash, isToday]);

  const kcalRemaining = Math.max(0, displayedMacros.kcal.target - displayedMacros.kcal.value);
  const kcalOver = displayedMacros.kcal.value > displayedMacros.kcal.target;
  const OVER_RED = '#D67373'; // mesma cor do "over" no heatmap do calendário

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
          <Pressable
            onPress={() => nav.navigate('Tabs', { screen: 'Profile' } as never)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Avatar uri={profilePhotoUri} initials={initials} size={38} />
            <View>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Olá,</Text>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>{displayName}</Text>
            </View>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <StreakPill days={streakDays} />
            <View>
              <IconBtn icon={Icon.bell} onPress={() => setNotifOpen(true)} />
              {unreadNotificationsCount > 0 && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    backgroundColor: theme.warning,
                    borderWidth: 2,
                    borderColor: theme.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FONT.head, fontSize: 9, fontWeight: '800', color: '#FFF' }}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </View>
            <LuBtn onPress={() => nav.navigate('ChatLu')} />
          </View>
        </View>

        <DateStrip selectedDateKey={selectedDateKey} onSelectDate={setSelectedDate} />

        {/* Card de macros */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={22} radius={26}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <AnimatedNumber
                  value={kcalOver ? displayedMacros.kcal.value - displayedMacros.kcal.target : kcalRemaining}
                  style={{ fontFamily: FONT.headExtra, fontSize: 38, fontWeight: '800', color: kcalOver ? OVER_RED : theme.text, letterSpacing: -1, lineHeight: 38 }}
                />
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: kcalOver ? OVER_RED : theme.textMuted, marginTop: 4 }}>
                  {kcalOver ? 'kcal acima da meta' : 'kcal restantes'}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 10, gap: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    <Text style={{ color: kcalOver ? OVER_RED : theme.text, fontWeight: '700' }}>{displayedMacros.kcal.value}</Text>
                    {' · consumido'}
                  </Text>
                  <View style={{ width: 1, height: 10, backgroundColor: theme.border }} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    <Text style={{ color: theme.text, fontWeight: '700' }}>{displayedMacros.kcal.target}</Text>
                    {' · meta'}
                  </Text>
                </View>
              </View>
              <ConcentricRings
                key={`home-rings-${replayKey}-${selectedDateKey}`}
                size={140}
                kcal={displayedMacros.kcal.value / displayedMacros.kcal.target}
                p={displayedMacros.p.value / displayedMacros.p.target}
                c={displayedMacros.c.value / displayedMacros.c.target}
                f={displayedMacros.f.value / displayedMacros.f.target}
              />
            </View>
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border, flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { c: theme.primary, label: 'kcal', val: `${displayedMacros.kcal.value}/${displayedMacros.kcal.target}`, over: displayedMacros.kcal.value > displayedMacros.kcal.target },
                { c: theme.proteinPink, label: 'Proteína', val: `${displayedMacros.p.value}/${displayedMacros.p.target}g`, over: displayedMacros.p.value > displayedMacros.p.target },
                { c: theme.carbsBlue, label: 'Carbs', val: `${displayedMacros.c.value}/${displayedMacros.c.target}g`, over: displayedMacros.c.value > displayedMacros.c.target },
                { c: theme.fatsGold, label: 'Gordura', val: `${displayedMacros.f.value}/${displayedMacros.f.target}g`, over: displayedMacros.f.value > displayedMacros.f.target },
              ].map((m) => (
                <View key={m.label} style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.c }} />
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>{m.label}</Text>
                  </View>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.head, fontSize: 12, fontWeight: '700', color: m.over ? OVER_RED : theme.text }}>{m.val}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Refeições — com "Ver tudo" → Diary */}
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
            Refeições {isToday ? 'de hoje' : 'do dia'}
          </Text>
          <Pressable onPress={() => nav.navigate('Tabs', { screen: 'Diary' } as never)}>
            <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 13, fontWeight: '600', color: theme.primaryDeep }}>
              Ver tudo
            </Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {displayedMeals.length === 0 || displayedMeals.every((m) => m.items.length === 0) ? (
            <EmptyDayState
              isToday={isToday}
              onAdd={
                !isToday && displayedMeals.length > 0
                  ? () => nav.navigate('AddFood', { mealId: displayedMeals[0].id })
                  : undefined
              }
            />
          ) : (
            displayedMeals.map((meal, i) => (
              <FadeInUp key={`${meal.id}-${replayKey}`} delay={i * 45}>
                <MealCard meal={meal} collapsible defaultExpanded={false} />
              </FadeInUp>
            ))
          )}
        </View>

        {/* Água — só mostra pra hoje */}
        {isToday && (
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <Card pad={16} radius={22}>
              {(() => {
                const ml = water * 250;
                const metGoal = ml >= dailyWaterTargetMl;
                const slotColor = metGoal ? theme.primary : theme.waterIce;
                // Mostra goalMl como 1,5L / 2L / 2,5L / 3L (mais legível que "2975ml")
                const targetDisplay = (dailyWaterTargetMl / 1000).toFixed(1).replace('.', ',') + 'L';
                // 8 slots fixos por design — visual representa "8 copos de 250ml ≈ 2L".
                // Pra targets diferentes, os 8 slots mapeiam linearmente até a meta;
                // se user passa de 8 copos, os slots permanecem cheios e ml continua subindo.
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        Hidratação
                      </Text>
                      <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 4 }}>
                        {ml}ml{!metGoal && (
                          <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: '600' }}> / {targetDisplay}</Text>
                        )}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center', gap: 4 }}>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <View
                            key={i}
                            style={{
                              width: 14,
                              height: 28,
                              borderRadius: 4,
                              backgroundColor: i < Math.min(water, 8) ? slotColor : theme.ringTrack,
                            }}
                          />
                        ))}
                      </View>
                      {metGoal && (
                        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.primaryDeep, fontWeight: '700' }}>
                          meta atingida ✓
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <IconBtn icon={Icon.minus} size={32} onPress={removeWater} />
                      <IconBtn icon={Icon.plus} size={32} variant="filled" onPress={addWater} />
                    </View>
                  </View>
                );
              })()}
            </Card>
          </View>
        )}

        {/* Insight — só pra hoje */}
        {isToday && (() => {
          const isAlert = insightTone === 'alert';
          // Alert: tons de rosa suave; Good: azul gelo (atual).
          const cardBg = isAlert ? '#F5DCDF' : theme.accentIce;
          const accentColor = isAlert ? OVER_RED : theme.insightAccent;
          const textColor = isAlert ? '#5B2A30' : theme.insightText;
          const labelText = isAlert ? 'Atenção da Lu' : 'Insight de Lu';
          return (
            <View style={{ padding: 16 }}>
              <Card pad={18} radius={22} style={{ backgroundColor: cardBg }}>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.sparkle size={20} color={accentColor} stroke={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: accentColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {labelText}
                    </Text>
                    <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: textColor, marginTop: 4, lineHeight: 20 }}>
                      {insight || (insightLoading ? 'Pensando no insight do dia…' : 'Sua proteína está 18% acima da média da semana. Bom trabalho.')}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          );
        })()}
      </ScrollView>

      {/* Painel flutuante de notificações — abre ao tocar no sino. */}
      <NotificationsPanel
        visible={notifOpen}
        notifications={notifications}
        readIds={readNotificationIds}
        onClose={() => setNotifOpen(false)}
        onMarkAllRead={markAllNotificationsRead}
        onMarkRead={markNotificationRead}
      />
    </SafeAreaView>
  );
};

const EmptyDayState: React.FC<{ isToday: boolean; onAdd?: () => void }> = ({ isToday, onAdd }) => {
  const theme = useTheme();
  return (
    <Card pad={24} radius={22}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Icon.calendar size={32} color={theme.primary} stroke={1.5} />
        <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
          {isToday ? 'Nenhuma refeição registrada' : 'Nenhum dado neste dia'}
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
          {isToday
            ? 'Comece tocando no "+" de uma refeição abaixo.'
            : 'Você ainda não registrou nada neste dia.'}
        </Text>
        {onAdd && (
          <Btn variant="primary" icon={Icon.plus} onPress={onAdd}>
            Adicionar refeição
          </Btn>
        )}
      </View>
    </Card>
  );
};

// Pill animada do streak. Comportamento:
//
// - Texto dinâmico baseado em `days`:
//     0   → "Comece registrando!" (anima a primeira ação)
//     1   → "Primeiro dia! 🎉" (comemora o início)
//     2+  → "X dias seguidos!" (comemora a sequência)
//
// - Auto-expande na PRIMEIRA vez que aparece na sessão E quando o streak SOBE
//   (ex: 0→1, 5→6). Em re-renders normais ou tab switches sem mudança, fica
//   no estado colapsado. Toque manual sempre reexpande por 3s.
//
// O fogo + número FICAM SEMPRE VISÍVEIS — só o texto extra entra/sai. Pra dias=0
// escondemos o "0" (visualmente fica só o fogo + texto).

// Module-level: persiste enquanto o app está em memória. Reseta no reload do app.
// Usamos pra:
//   1. Saber se já mostramos a expansão nesta sessão (skip em remounts/tab switches)
//   2. Detectar SUBIDA real do streak (animar quando 5→6, mas não em renders extras)
let lastSeenStreak = -1;

const StreakPill: React.FC<{ days: number }> = ({ days }) => {
  const theme = useTheme();
  const expand = useRef(new Animated.Value(0)).current; // começa COLAPSADA — animate decide se expande
  const pulse = useRef(new Animated.Value(1)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.5)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const COLLAPSED_W = days === 0 ? 36 : 66; // sem número quando 0
  // Largura limitada pra pill NÃO invadir a área do nome do user.
  // Calibrado pra caber labels curtos em screens de 360dp+ sem sobreposição.
  const EXPANDED_W = 140;

  // Labels curtos — encaixam em EXPANDED_W e mantêm tom encorajador.
  const label =
    days === 0
      ? 'Comece já!'
      : days === 1
        ? 'Dia 1! 🎉'
        : `${days} dias!`;

  const animate = (toValue: number) => {
    Animated.spring(expand, { toValue, useNativeDriver: false, friction: 6, tension: 90 }).start();
    if (toValue === 1) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 180, useNativeDriver: false }),
        Animated.spring(pulse, { toValue: 1, useNativeDriver: false, friction: 4, tension: 100 }),
      ]).start();
    }
  };

  useEffect(() => {
    // Auto-expand SÓ na primeira vez na sessão OU quando streak sobe (delta positivo).
    // Casos:
    //   - Sessão nova, days=0: lastSeenStreak=-1 → -1 < 0 → anima (1ª vez vendo)
    //   - Tab switch, days=0: lastSeenStreak=0 → 0 < 0 falso → NÃO anima
    //   - User completa dia (0→1): lastSeenStreak=0 → 0 < 1 → anima (subiu)
    //   - User reset (5→0): lastSeenStreak=5 → 5 < 0 falso → NÃO anima
    const shouldAnimate = lastSeenStreak < days || lastSeenStreak === -1;
    lastSeenStreak = days;

    if (shouldAnimate) {
      animate(1);
      // Auto-contrai depois de 3s
      const t = setTimeout(() => animate(0), 3000);

      // Loop infinito de pulse no fogo (mesmo padrão do FAB de câmera)
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(flameScale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
      ).start();
      // Anel pulsante atrás do fogo (cresce e some)
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ringScale, { toValue: 2.2, duration: 1800, useNativeDriver: true }),
            Animated.timing(ringScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ringOpacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      ).start();
      return () => clearTimeout(t);
    } else {
      // Já mostrou nesta sessão — apenas mantém o loop do fogo rolando, sem expand.
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameScale, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(flameScale, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [days]); // re-roda se days mudar (ex: user completa um dia novo)

  const onPress = () => {
    animate(1);
    setTimeout(() => animate(0), 3000);
  };

  const width = expand.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_W, EXPANDED_W] });
  const labelOpacity = expand.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${days} dias consecutivos · ${label}`}
      style={{ width: COLLAPSED_W, height: 32 }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width,
          height: 32,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: theme.bgElev,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 100,
          overflow: 'hidden',
          transform: [{ scale: pulse }],
        }}
      >
        <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: theme.warning,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            }}
          />
          <Animated.View style={{ transform: [{ scale: flameScale }] }}>
            <Icon.flame size={14} color={theme.warning} />
          </Animated.View>
        </View>
        {/* Número só aparece quando days >= 1 — pra 0 mostramos só o fogo */}
        {days >= 1 && (
          <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>{days}</Text>
        )}
        <Animated.Text
          numberOfLines={1}
          style={{
            opacity: labelOpacity,
            marginLeft: 4,
            fontFamily: FONT.body,
            fontSize: 11,
            fontWeight: '600',
            color: theme.textMuted,
          }}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

// Painel flutuante de notificações — abre como Modal vindo de cima.
// Tap fora fecha. Toque numa notificação a marca como lida; "Marcar todas como lidas" no header.
const NotificationsPanel: React.FC<{
  visible: boolean;
  notifications: AppNotification[];
  readIds: string[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}> = ({ visible, notifications, readIds, onClose, onMarkAllRead, onMarkRead }) => {
  const theme = useTheme();
  const toneToColor: Record<AppNotification['tone'], string> = {
    primary: theme.primary,
    water: theme.waterIce,
    protein: theme.proteinPink,
    carbs: theme.carbsBlue,
    fats: theme.fatsGold,
    warning: theme.warning,
    info: theme.insightAccent || theme.primary,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <Pressable
          onPress={() => {}}
          style={{
            marginTop: 60,
            marginHorizontal: 12,
            backgroundColor: theme.bg,
            borderRadius: 20,
            maxHeight: '80%',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Notificações
            </Text>
            <Pressable onPress={onMarkAllRead} hitSlop={8}>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '700' }}>
                Marcar todas como lidas
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            {notifications.length === 0 && (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Icon.bell size={28} color={theme.textMuted} stroke={1.5} />
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 10 }}>
                  Sem notificações nas últimas 24h.
                </Text>
              </View>
            )}
            {notifications.map((n) => {
              const isRead = readIds.includes(n.id);
              const IconC = Icon[n.icon];
              const color = toneToColor[n.tone];
              return (
                <Pressable
                  key={n.id}
                  onPress={() => onMarkRead(n.id)}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: isRead ? 'transparent' : theme.bgElev,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <IconC size={18} color={color} stroke={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '700', color: theme.text, flex: 1 }} numberOfLines={1}>
                        {n.title}
                      </Text>
                      <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginLeft: 8 }}>
                        {formatRelativeTime(n.ts)}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }} numberOfLines={2}>
                      {n.body}
                    </Text>
                  </View>
                  {!isRead && (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary, marginTop: 14 }} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
