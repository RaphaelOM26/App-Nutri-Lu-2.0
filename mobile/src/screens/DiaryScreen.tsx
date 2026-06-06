// Diário — porte do DiaryScreen em screens-home.jsx.
// Contém as Quick Actions (Foto IA / Buscar / Código / Voz) e refeições expandidas por padrão.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { LuBtn } from '../components/LuBtn';
import { DateStrip } from '../components/DateStrip';
import { Card } from '../components/Card';
import { MacroRing } from '../components/MacroRing';
import { MacroBar } from '../components/MacroBar';
import { Btn } from '../components/Btn';
import { MealCard } from '../components/MealCard';
import { Icon, type IconName } from '../components/Icons';
import { MonthCalendar } from '../components/MonthCalendar';
import { ConfigMealsModal } from '../components/ConfigMealsModal';
import { ShareProgressModal } from '../components/ShareProgressModal';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { TODAY, TODAY_MONTH, TODAY_YEAR } from '../state/AppContext';
import { todayKey } from '../storage/completedDays';
import { getDeviceId } from '../storage/deviceId';
import { generateDayReview, getDaySnapshot, ApiError, type DaySnapshotPayload } from '../api/client';
import { MarkdownText } from '../components/MarkdownText';
import { ActivityIndicator } from 'react-native';

const WEEKDAY_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function formatDayBR(day: number, month: number, year: number): string {
  // month aqui é 1-12 (segue padrão TODAY_MONTH); Date espera 0-11
  const wd = new Date(year, month - 1, day).getDay();
  return `${WEEKDAY_LONG[wd]}, ${day} de ${MONTHS[month - 1]}`;
}
import type { RootStackParamList } from '../navigation/types';

// "Copiar dia anterior" puxa o snapshot de ontem do backend Postgres via
// deviceId anônimo (sem auth). Se 404, toast "nada registrado". Se hoje já
// tem dados, abre modal de confirmação antes de sobrescrever.

// Retorna o dayKey de ontem no mesmo formato YYYY-MM-DD do todayKey.
function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;
type QuickAction = 'photo' | 'search' | 'barcode' | 'voice';

export const DiaryScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const replayKey = useFocusReplay();
  // Inset bottom pra os bottom-sheets não ficarem cobertos pela nav bar
  // do sistema (Samsung 3-button, gesture indicator iOS, etc.).
  const insets = useSafeAreaInsets();
  const {
    selectedDay, setSelectedDay, displayedMacros, displayedMeals, isToday, meals,
    restoreDayFromSnapshot,
    water, todayCompleted, completeDay, uncompleteDay, name,
  } = useApp();
  const subtitle = isToday
    ? formatDayBR(TODAY, TODAY_MONTH, TODAY_YEAR)
    : `Dia ${selectedDay} de ${MONTHS[TODAY_MONTH - 1]}`;

  // Quando o usuário aperta uma das 4 quick actions, perguntamos pra qual refeição
  // antes de navegar — evita ir sempre pro "café da manhã" por default.
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [configMealsOpen, setConfigMealsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  // Snapshot já carregado de ontem, guardado entre o GET e o "Substituir" do modal.
  const [pendingSnapshot, setPendingSnapshot] = useState<DaySnapshotPayload | null>(null);
  const [copyLoading, setCopyLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const toast = useToast();

  const hasAnyRegisteredMeal = meals.some((m) => m.items.length > 0);

  const completeToday = async () => {
    const key = todayKey();
    completeDay(key);
    setReviewOpen(true);
    setReviewText(null);
    setReviewLoading(true);
    try {
      const { text } = await generateDayReview({
        profile: { name: name ?? 'Anônima', goal: 'Perder peso', weightKg: 85.2, goalWeightKg: 82 },
        macros: { kcal: displayedMacros.kcal, p: displayedMacros.p, c: displayedMacros.c, f: displayedMacros.f },
        meals: displayedMeals.map((m) => ({
          name: m.name,
          items: m.items.map((it) => ({ name: it.name, portion: it.portion, kcal: it.kcal })),
        })),
        water,
      });
      setReviewText(text || 'Sem análise pra mostrar agora.');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não consegui gerar a análise agora.';
      setReviewText(`⚠️ ${msg}`);
    } finally {
      setReviewLoading(false);
    }
  };

  const undoComplete = () => {
    uncompleteDay(todayKey());
    setReviewOpen(false);
    showToast('Dia reaberto');
  };

  const showToast = (msg: string) => toast(msg);

  const requestCopyYesterday = async () => {
    setMenuOpen(false);
    if (copyLoading) return;
    setCopyLoading(true);
    try {
      const deviceId = await getDeviceId();
      const snapshot = await getDaySnapshot(deviceId, yesterdayKey());
      if (!snapshot) {
        toast('Você não registrou nada ontem.', 'info');
        return;
      }
      const hasItemsInSnapshot = snapshot.meals.some((m) => m.items.length > 0);
      if (!hasItemsInSnapshot) {
        toast('Você não registrou refeições ontem.', 'info');
        return;
      }
      setPendingSnapshot(snapshot);
      if (hasAnyRegisteredMeal) {
        // Hoje já tem refeições — pede confirmação antes de sobrescrever.
        setCopyConfirmOpen(true);
      } else {
        // Hoje está vazio — copia direto, sem fricção.
        restoreDayFromSnapshot(snapshot);
        setPendingSnapshot(null);
        toast('Refeições de ontem copiadas.', 'success');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não consegui buscar o histórico de ontem.';
      toast(`⚠️ ${msg}`, 'error');
    } finally {
      setCopyLoading(false);
    }
  };

  const doCopyYesterday = () => {
    setCopyConfirmOpen(false);
    if (!pendingSnapshot) {
      toast('Snapshot indisponível, tente de novo.', 'error');
      return;
    }
    restoreDayFromSnapshot(pendingSnapshot);
    setPendingSnapshot(null);
    toast('Refeições de ontem copiadas.', 'success');
  };

  const openConfig = () => { setMenuOpen(false); setConfigMealsOpen(true); };
  const openShare = () => { setMenuOpen(false); setShareOpen(true); };

  const runActionForMeal = (mealId: string) => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === 'photo') nav.navigate('Camera', { mode: 'food', mealId });
    else if (action === 'search') nav.navigate('AddFood', { mealId });
    else if (action === 'barcode') nav.navigate('Barcode', { mealId });
    else if (action === 'voice') nav.navigate('Voice', { mealId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Diário"
        large
        sub={subtitle}
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="cal" icon={Icon.calendar} onPress={() => setCalendarOpen(true)} />,
          <IconBtn key="more" icon={Icon.more} onPress={() => setMenuOpen(true)} />,
        ]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <DateStrip selected={selectedDay} onSelect={setSelectedDay} />

        {/* Mini resumo sticky */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={14} radius={18}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <MacroRing
                key={`diary-ring-${replayKey}-${selectedDay}`}
                value={displayedMacros.kcal.value / displayedMacros.kcal.target}
                size={56}
                stroke={6}
                color={theme.primary}
                inner={
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 12, fontWeight: '800', color: theme.text }}>
                    {Math.round((displayedMacros.kcal.value / displayedMacros.kcal.target) * 100)}%
                  </Text>
                }
              />
              <View style={{ flex: 1, gap: 6 }}>
                <MacroBar value={displayedMacros.p.value / displayedMacros.p.target} color={theme.proteinPink} label="P" val={displayedMacros.p.value} target={displayedMacros.p.target} />
                <MacroBar value={displayedMacros.c.value / displayedMacros.c.target} color={theme.carbsBlue} label="C" val={displayedMacros.c.value} target={displayedMacros.c.target} />
                <MacroBar value={displayedMacros.f.value / displayedMacros.f.target} color={theme.fatsGold} label="G" val={displayedMacros.f.value} target={displayedMacros.f.target} />
              </View>
            </View>
          </Card>
        </View>

        {/* Quick actions — só faz sentido pra hoje */}
        {isToday && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
            <Card pad={14} radius={22}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {([
                  { icon: 'camera', label: 'Foto IA', tint: theme.primarySoft, color: theme.primaryDeep, action: () => setPendingAction('photo') },
                  { icon: 'search', label: 'Buscar', tint: theme.accentPink, color: '#8E5E66', action: () => setPendingAction('search') },
                  { icon: 'mic', label: 'Voz', tint: theme.accentIce, color: '#5B7090', action: () => setPendingAction('voice') },
                ] as { icon: IconName; label: string; tint: string; color: string; action: () => void }[]).map((a) => {
                  const IconC = Icon[a.icon];
                  return (
                    <Pressable key={a.label} onPress={a.action} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
                      <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: a.tint, alignItems: 'center', justifyContent: 'center' }}>
                        <IconC size={22} color={a.color} stroke={2} />
                      </View>
                      <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '600', color: theme.text }}>{a.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </View>
        )}

        {/* Lista de refeições */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {displayedMeals.length === 0 || !isToday ? (
            <Card pad={24} radius={22}>
              <View style={{ alignItems: 'center', gap: 12 }}>
                <Icon.calendar size={32} color={theme.primary} stroke={1.5} />
                <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
                  {isToday ? 'Nenhuma refeição registrada' : 'Nenhum dado neste dia'}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                  {isToday
                    ? 'Use as ações rápidas acima pra começar.'
                    : 'Nenhum dado registrado nesse dia.'}
                </Text>
              </View>
            </Card>
          ) : (
            displayedMeals.map((meal) => (
              <MealCard
                key={`${meal.id}-${replayKey}`}
                meal={meal}
                onAdd={() => nav.navigate('AddFood', { mealId: meal.id })}
                collapsible
                locked={isToday && todayCompleted}
              />
            ))
          )}
        </View>

        {isToday && !todayCompleted && (
          <View style={{ padding: 16 }}>
            <Btn variant="primary" full icon={Icon.check} onPress={completeToday}>
              Completar dia
            </Btn>
          </View>
        )}
        {isToday && todayCompleted && (
          <View style={{ padding: 16, gap: 8, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 100, backgroundColor: theme.bgElev }}>
              <Icon.lock size={14} color={theme.primaryDeep} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, fontWeight: '700', color: theme.text }}>
                Dia concluído
              </Text>
            </View>
            <Pressable onPress={() => setReviewOpen(true)}>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '600' }}>
                Ver análise novamente
              </Text>
            </Pressable>
            <Pressable onPress={undoComplete}>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600' }}>
                Reabrir dia
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Calendário mensal — heatmap de aderência */}
      <MonthCalendar
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        today={TODAY}
        todayKcal={displayedMacros.kcal.value}
        todayP={displayedMacros.p.value}
        todayC={displayedMacros.c.value}
        todayF={displayedMacros.f.value}
      />

      {/* Bottom sheet: escolha a refeição antes de Buscar/Foto/Código/Voz */}
      <Modal
        visible={pendingAction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingAction(null)}
      >
        <Pressable
          onPress={() => setPendingAction(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: theme.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: Math.max(32, insets.bottom + 20),
              gap: 12,
            }}
          >
            <View style={{ alignItems: 'center', paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center' }}>
              Adicionar a qual refeição?
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', marginBottom: 8 }}>
              {pendingAction === 'photo' && 'A foto IA vai estimar os macros do prato.'}
              {pendingAction === 'search' && 'Você vai poder buscar e adicionar alimentos.'}
              {pendingAction === 'barcode' && 'Vamos escanear o código de barras.'}
              {pendingAction === 'voice' && 'Você vai poder ditar o que comeu.'}
            </Text>
            {displayedMeals.map((meal) => (
              <Pressable
                key={meal.id}
                onPress={() => runActionForMeal(meal.id)}
                style={{
                  backgroundColor: theme.bgElev,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: meal.color || theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.drumstick size={18} color={theme.text} stroke={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 15, fontWeight: '700', color: theme.text }}>{meal.name}</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    {meal.time} · {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'} · {meal.kcal} kcal
                  </Text>
                </View>
                <Icon.forward size={18} color={theme.textMuted} stroke={2} />
              </Pressable>
            ))}
            <Pressable
              onPress={() => setPendingAction(null)}
              style={{ padding: 12, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '600', color: theme.textMuted }}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Menu ⋮ do Diário */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: Math.max(28, insets.bottom + 16), gap: 6 }}>
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <DiaryMenuItem icon={Icon.calendar} title="Copiar dia anterior" subtitle="Replica as 4 refeições de ontem" onPress={requestCopyYesterday} />
            <DiaryMenuItem icon={Icon.settings} title="Configurar refeições" subtitle="Adicionar, editar ou remover refeições" onPress={openConfig} />
            <DiaryMenuItem icon={Icon.send} title="Compartilhar progresso" subtitle="Cartão estilizado pra rede social" onPress={openShare} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmação ao sobrescrever registros existentes com copiar dia anterior */}
      <Modal visible={copyConfirmOpen} transparent animationType="fade" onRequestClose={() => setCopyConfirmOpen(false)}>
        <Pressable onPress={() => setCopyConfirmOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360, backgroundColor: theme.bg, borderRadius: 20, padding: 20, gap: 12 }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Substituir refeições de hoje?
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 18 }}>
              Você já tem refeições registradas hoje. Copiar o dia anterior vai{' '}
              <Text style={{ color: theme.text, fontWeight: '700' }}>apagar os registros atuais</Text> e substituir pelos de ontem. Essa ação não pode ser desfeita.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setCopyConfirmOpen(false)}
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.bgElev }}
              >
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.textMuted, fontWeight: '700' }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={doCopyYesterday}
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.text }}
              >
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.bg, fontWeight: '700' }}>Substituir</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Configurar refeições — CRUD: adicionar, editar, remover */}
      <ConfigMealsModal visible={configMealsOpen} onClose={() => setConfigMealsOpen(false)} />

      {/* Compartilhar progresso — gera card visual + submenu social */}
      <ShareProgressModal visible={shareOpen} onClose={() => setShareOpen(false)} />

      {/* Modal de análise do dia (Lu) */}
      <Modal visible={reviewOpen} transparent animationType="fade" onRequestClose={() => setReviewOpen(false)}>
        <Pressable onPress={() => setReviewOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 20, gap: 14, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon.sparkle size={18} color={theme.primaryDeep} stroke={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Análise do dia · Lu
                </Text>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text, marginTop: 1 }}>
                  Dia concluído 🎯
                </Text>
              </View>
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              {reviewLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
                  <ActivityIndicator size="small" color={theme.primaryDeep} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>Lu está analisando seu dia…</Text>
                </View>
              ) : (
                <MarkdownText style={{ fontFamily: FONT.body, fontSize: 14, color: theme.text, lineHeight: 21 }}>
                  {reviewText || ''}
                </MarkdownText>
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={undoComplete}
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.bgElev }}
              >
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.textMuted, fontWeight: '700' }}>Desfazer</Text>
              </Pressable>
              <Pressable
                onPress={() => setReviewOpen(false)}
                style={{ flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, backgroundColor: theme.text }}
              >
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: theme.bg, fontWeight: '700' }}>Fechar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

const DiaryMenuItem: React.FC<{
  icon: React.FC<{ size?: number; color?: string; stroke?: number }>;
  title: string;
  subtitle: string;
  onPress: () => void;
}> = ({ icon: IconC, title, subtitle, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: theme.bgElev }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <IconC size={18} color={theme.text} stroke={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }}>{title}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{subtitle}</Text>
      </View>
    </Pressable>
  );
};
