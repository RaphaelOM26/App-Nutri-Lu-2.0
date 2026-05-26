// Dashboard — porte do DashboardScreen em screens-home.jsx.
// Sem Quick Actions (essa seção vive no Diário, conforme design).

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Card } from '../components/Card';
import { ConcentricRings } from '../components/ConcentricRings';
import { DateStrip } from '../components/DateStrip';
import { IconBtn } from '../components/IconBtn';
import { LuBtn } from '../components/LuBtn';
import { Icon } from '../components/Icons';
import { MealCard } from '../components/MealCard';
import { useApp } from '../state/AppContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const replayKey = useFocusReplay();
  const {
    water,
    addWater,
    selectedDay,
    setSelectedDay,
    displayedMacros,
    displayedMeals,
    isToday,
  } = useApp();

  const kcalRemaining = Math.max(0, displayedMacros.kcal.target - displayedMacros.kcal.value);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', fontSize: 14, color: theme.primaryDeep }}>LS</Text>
            </View>
            <View>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Olá,</Text>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>Larissa</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.bgElev, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
              <Icon.flame size={14} color={theme.warning} />
              <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>12</Text>
            </View>
            <IconBtn icon={Icon.bell} />
            <LuBtn onPress={() => nav.navigate('ChatLu')} />
          </View>
        </View>

        <DateStrip selected={selectedDay} onSelect={setSelectedDay} />

        {/* Card de macros */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          <Card pad={22} radius={26}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 38, fontWeight: '800', color: theme.text, letterSpacing: -1, lineHeight: 38 }}>
                  {kcalRemaining}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>kcal restantes</Text>
                <View style={{ flexDirection: 'row', marginTop: 10, gap: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    <Text style={{ color: theme.text, fontWeight: '700' }}>{displayedMacros.kcal.value}</Text>
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
                key={`home-rings-${replayKey}-${selectedDay}`}
                size={140}
                kcal={displayedMacros.kcal.value / displayedMacros.kcal.target}
                p={displayedMacros.p.value / displayedMacros.p.target}
                c={displayedMacros.c.value / displayedMacros.c.target}
                f={displayedMacros.f.value / displayedMacros.f.target}
              />
            </View>
            <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border, flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { c: theme.primary, label: 'kcal', val: `${displayedMacros.kcal.value}/${displayedMacros.kcal.target}` },
                { c: theme.proteinPink, label: 'Proteína', val: `${displayedMacros.p.value}/${displayedMacros.p.target}g` },
                { c: theme.carbsBlue, label: 'Carbs', val: `${displayedMacros.c.value}/${displayedMacros.c.target}g` },
                { c: theme.fatsGold, label: 'Gordura', val: `${displayedMacros.f.value}/${displayedMacros.f.target}g` },
              ].map((m) => (
                <View key={m.label} style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.c }} />
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>{m.label}</Text>
                  </View>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONT.head, fontSize: 12, fontWeight: '700', color: theme.text }}>{m.val}</Text>
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
          {displayedMeals.length === 0 || !isToday ? (
            <EmptyDayState isToday={isToday} />
          ) : (
            displayedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onAdd={() => nav.navigate('AddFood', { mealId: meal.id })}
                collapsible
                defaultExpanded={false}
              />
            ))
          )}
        </View>

        {/* Água — só mostra pra hoje */}
        {isToday && (
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <Card pad={16} radius={22}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Hidratação
                  </Text>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text, marginTop: 4 }}>
                    {water * 250}ml <Text style={{ fontSize: 13, color: theme.textMuted, fontWeight: '600' }}>/ 2000ml</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: 14,
                        height: 28,
                        borderRadius: 4,
                        backgroundColor: i < water ? theme.waterIce : theme.ringTrack,
                      }}
                    />
                  ))}
                </View>
                <IconBtn icon={Icon.plus} variant="filled" onPress={addWater} />
              </View>
            </Card>
          </View>
        )}

        {/* Insight — só pra hoje */}
        {isToday && (
          <View style={{ padding: 16 }}>
            <Card pad={18} radius={22} style={{ backgroundColor: theme.accentIce }}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.sparkle size={20} color={theme.insightAccent} stroke={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.insightAccent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Insight de Lu
                  </Text>
                  <Text style={{ fontFamily: FONT.head, fontSize: 15, fontWeight: '700', color: theme.insightText, marginTop: 4, lineHeight: 20 }}>
                    Sua proteína está 18% acima da média da semana. Bom trabalho.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const EmptyDayState: React.FC<{ isToday: boolean }> = ({ isToday }) => {
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
            : 'No MVP, o histórico de outros dias vem com o backend conectado.'}
        </Text>
      </View>
    </Card>
  );
};
