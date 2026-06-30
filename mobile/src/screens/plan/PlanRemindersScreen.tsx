// Plano alimentar premium — LEMBRETES. Um toggle por refeição do plano.
// Estilo Dark Luxe. Fase 1: estado local; Fase 4: agenda via reconciler.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT } from '../../theme';
import { PREMIUM as P } from '../../theme/premium';
import { Icon } from '../../components/Icons';
import { SAMPLE_PLAN } from '../../storage/mealPlan';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PlanRemindersScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const meals = SAMPLE_PLAN.days[0].meals;

  const [master, setMaster] = useState(true);
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(meals.map((m) => [m.id, m.name !== 'Lanche da tarde'])),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Pressable
            onPress={() => nav.goBack()}
            style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: P.hair, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.back size={18} color={P.gold} stroke={2} />
          </Pressable>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, color: P.cream, letterSpacing: -0.4 }}>Lembretes do plano</Text>
        </View>
        <Text style={{ fontFamily: FONT.body, fontSize: 13, color: P.sage, lineHeight: 19 }}>
          A Lu te avisa no horário de cada refeição do seu plano.
        </Text>

        {/* Master */}
        <View style={{ marginTop: 18, backgroundColor: P.cardRaised, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: FONT.bodyBold, fontSize: 15, color: P.cream }}>Ativar lembretes</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: P.gold }}>{meals.length} refeições por dia</Text>
          </View>
          <Toggle on={master} onToggle={() => setMaster((v) => !v)} />
        </View>

        {/* Por refeição */}
        <View style={{ marginTop: 12, gap: 8, opacity: master ? 1 : 0.4 }}>
          {meals.map((m) => (
            <View
              key={m.id}
              style={{ backgroundColor: P.card, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <Icon.clock size={18} color={P.gold} stroke={2} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, color: P.cream }}>
                  {m.name} <Text style={{ fontFamily: FONT.body, color: P.sage }}>· {m.time}</Text>
                </Text>
              </View>
              <Toggle on={!!on[m.id] && master} onToggle={() => setOn((s) => ({ ...s, [m.id]: !s[m.id] }))} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Toggle: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
  <Pressable
    onPress={onToggle}
    style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: on ? P.gold : '#3A463F', justifyContent: 'center', paddingHorizontal: 3 }}
  >
    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: on ? P.onGold : P.creamSoft, alignSelf: on ? 'flex-end' : 'flex-start' }} />
  </Pressable>
);
