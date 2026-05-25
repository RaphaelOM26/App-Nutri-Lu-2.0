// Diário — porte do DiaryScreen em screens-home.jsx.
// Contém as Quick Actions (Foto IA / Buscar / Código / Voz) e refeições expandidas por padrão.

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
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
import { useApp } from '../state/AppContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const DiaryScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const replayKey = useFocusReplay();
  const { selectedDay, setSelectedDay, displayedMacros, displayedMeals, isToday } = useApp();
  const subtitle = isToday ? 'Segunda, 25 de maio' : `Dia ${selectedDay} de maio`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Diário"
        large
        sub={subtitle}
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="cal" icon={Icon.calendar} />,
          <IconBtn key="more" icon={Icon.more} />,
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
                  { icon: 'camera', label: 'Foto IA', tint: theme.primarySoft, color: theme.primaryDeep, action: () => nav.navigate('Camera', { mode: 'food' }) },
                  { icon: 'search', label: 'Buscar', tint: theme.accentPink, color: '#8E5E66', action: () => nav.navigate('AddFood', {}) },
                  { icon: 'barcode', label: 'Código', tint: theme.accentBlue, color: theme.insightAccent, action: () => nav.navigate('Barcode', {}) },
                  { icon: 'mic', label: 'Voz', tint: theme.accentIce, color: '#5B7090', action: () => nav.navigate('Voice', {}) },
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
                key={meal.id}
                meal={meal}
                onAdd={() => nav.navigate('AddFood', { mealId: meal.id })}
                defaultExpanded
                collapsible
              />
            ))
          )}
        </View>

        {isToday && (
          <View style={{ padding: 16 }}>
            <Btn variant="primary" full icon={Icon.check}>
              Completar dia
            </Btn>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
