// Diário — porte do DiaryScreen em screens-home.jsx.
// Contém as Quick Actions (Foto IA / Buscar / Código / Voz) e refeições expandidas por padrão.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { TODAY, TODAY_MONTH, TODAY_YEAR } from '../state/AppContext';
import { todayKey } from '../storage/completedDays';
import { generateDayReview, ApiError } from '../api/client';
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

// Refeição "do dia anterior" usada pela opção "Copiar dia anterior".
// No MVP é hardcoded — versão real virá com histórico no backend.
const YESTERDAY_ITEMS: Record<string, Array<{ name: string; portion: string; amount: number; kcal: number; p: number; c: number; f: number }>> = {
  breakfast: [
    { name: 'Pão integral com queijo', portion: '80g', amount: 1, kcal: 240, p: 12, c: 32, f: 7 },
    { name: 'Café com leite', portion: '1 xícara', amount: 1, kcal: 102, p: 6, c: 9, f: 4 },
  ],
  lunch: [
    { name: 'Arroz integral', portion: '120g', amount: 1, kcal: 144, p: 3, c: 30, f: 1 },
    { name: 'Frango grelhado', portion: '150g', amount: 1, kcal: 247, p: 46, c: 0, f: 5 },
    { name: 'Salada verde', portion: '1 prato', amount: 1, kcal: 60, p: 2, c: 7, f: 2 },
    { name: 'Feijão preto cozido', portion: '100g', amount: 1, kcal: 77, p: 4, c: 14, f: 1 },
  ],
  snack: [
    { name: 'Iogurte natural', portion: '170g', amount: 1, kcal: 90, p: 9, c: 12, f: 1 },
    { name: 'Granola', portion: '30g', amount: 1, kcal: 130, p: 3, c: 22, f: 4 },
  ],
  dinner: [
    { name: 'Salmão grelhado', portion: '150g', amount: 1, kcal: 280, p: 31, c: 0, f: 17 },
    { name: 'Batata-doce assada', portion: '150g', amount: 1, kcal: 134, p: 2, c: 31, f: 0 },
    { name: 'Brócolis no vapor', portion: '100g', amount: 1, kcal: 35, p: 3, c: 7, f: 0 },
  ],
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type QuickAction = 'photo' | 'search' | 'barcode' | 'voice';

export const DiaryScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const replayKey = useFocusReplay();
  const {
    selectedDay, setSelectedDay, displayedMacros, displayedMeals, isToday, meals, replaceDay,
    water, todayCompleted, completeDay, uncompleteDay,
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
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
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
        profile: { name: 'Larissa', goal: 'Perder peso', weightKg: 85.2, goalWeightKg: 82 },
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

  const requestCopyYesterday = () => {
    setMenuOpen(false);
    // Se já tem registros hoje, confirma antes de sobrescrever
    if (hasAnyRegisteredMeal) setCopyConfirmOpen(true);
    else doCopyYesterday();
  };

  const doCopyYesterday = () => {
    setCopyConfirmOpen(false);
    // Substitui completamente as refeições de hoje pelas de ontem
    replaceDay(YESTERDAY_ITEMS);
    showToast('Refeições de ontem copiadas');
  };

  const openConfig = () => { setMenuOpen(false); setConfigMealsOpen(true); };
  const showExport = () => { setMenuOpen(false); showToast('Exportação em PDF em breve'); };
  const showShare = () => { setMenuOpen(false); showToast('Compartilhamento em breve'); };

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
                    : 'No MVP, o histórico de outros dias vem com o backend conectado.'}
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
              paddingBottom: 32,
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
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28, gap: 6 }}>
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <DiaryMenuItem icon={Icon.calendar} title="Copiar dia anterior" subtitle="Replica as 4 refeições de ontem" onPress={requestCopyYesterday} />
            <DiaryMenuItem icon={Icon.settings} title="Configurar refeições" subtitle="Horários e refeições padrão" onPress={openConfig} />
            <DiaryMenuItem icon={Icon.bookmark} title="Exportar diário" subtitle="PDF do dia pra nutricionista" onPress={showExport} />
            <DiaryMenuItem icon={Icon.send} title="Compartilhar progresso" subtitle="Cartão estilizado pra rede social" onPress={showShare} />
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

      {/* Configurar refeições — visualização das 4 padrão (edição vem na Sem 2) */}
      <Modal visible={configMealsOpen} transparent animationType="fade" onRequestClose={() => setConfigMealsOpen(false)}>
        <Pressable onPress={() => setConfigMealsOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 20, padding: 20, gap: 12 }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Configurar refeições
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, lineHeight: 17 }}>
              Suas refeições padrão atuais. Edição de horários e refeições customizadas (ex: Pré-treino, Ceia) chegam na próxima atualização.
            </Text>
            <View style={{ gap: 8, marginTop: 4 }}>
              {meals.map((m) => (
                <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.bgElev, borderRadius: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: m.color || theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.drumstick size={16} color={theme.text} stroke={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }}>{m.name}</Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>{m.time}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable onPress={() => setConfigMealsOpen(false)} style={{ padding: 14, alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.textMuted }}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
