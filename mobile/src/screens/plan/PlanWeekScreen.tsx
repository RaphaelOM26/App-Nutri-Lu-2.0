// Plano alimentar premium — VISÃO DA SEMANA (tela principal da feature paga).
// Estilo Dark Luxe (theme/premium). Sem plano importado, mostra o estado
// vazio com o convite pra anexar o PDF da nutricionista.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT } from '../../theme';
import { PREMIUM as P } from '../../theme/premium';
import { Icon } from '../../components/Icons';
import { getActivePlan, WEEKDAY_SHORT, WEEKDAY_LONG, type MealPlan, type PlanMeal, type PlanDay } from '../../storage/mealPlan';
import { usePlanStatuses, getMealStatus } from '../../storage/mealPlanState';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const PlanWeekScreen: React.FC = () => {
  const plan = getActivePlan();
  if (!plan) return <PlanEmptyState />;
  return <PlanWeekContent plan={plan} />;
};

// ─── Estado vazio: ainda não existe plano importado ─────────────────
const PlanEmptyState: React.FC = () => {
  const onAttach = () => {
    Alert.alert(
      'Em breve',
      'A importação do plano em PDF está em desenvolvimento. Assim que estiver pronta, é só anexar o plano da sua nutricionista aqui.',
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, paddingHorizontal: 28, paddingBottom: 120, alignItems: 'center', justifyContent: 'center' }}>
        {/* Emblema com moldura de ouro */}
        <View style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderColor: P.goldBorder, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: P.cardRaised, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.recipe size={30} color={P.gold} stroke={1.5} />
          </View>
        </View>

        <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 3, color: P.gold, marginTop: 26 }}>
          PLANO PREMIUM
        </Text>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 26, color: P.cream, letterSpacing: -0.5, marginTop: 8, textAlign: 'center' }}>
          Seu plano alimentar
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 14, color: P.sage, lineHeight: 21, marginTop: 12, textAlign: 'center' }}>
          Anexe o plano em PDF feito pela sua nutricionista e acompanhe aqui as
          refeições da semana, com horários e lembretes.
        </Text>

        <Pressable
          onPress={onAttach}
          style={{ marginTop: 28, alignSelf: 'stretch', backgroundColor: P.gold, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Icon.plus size={18} color={P.onGold} stroke={2.5} />
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, color: P.onGold }}>Anexar plano em PDF</Text>
        </Pressable>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: P.sageFaint, marginTop: 12, textAlign: 'center' }}>
          Disponível em breve
        </Text>
      </View>
    </SafeAreaView>
  );
};

// ─── Semana do plano (quando existir plano importado) ───────────────
const PlanWeekContent: React.FC<{ plan: MealPlan }> = ({ plan }) => {
  const nav = useNavigation<Nav>();
  usePlanStatuses(); // re-renderiza quando um "feito" muda em outra tela
  const [selected, setSelected] = useState(plan.todayWeekday);
  const [week, setWeek] = useState(plan.weekIndex);

  const day: PlanDay = plan.days.find((d) => d.weekday === selected) ?? plan.days[0];
  const doneCount = day.meals.filter((m) => getMealStatus(m.id, m.status) === 'done').length;
  const isToday = selected === plan.todayWeekday;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }}>
        {/* Top bar: lembretes + selo membro (raiz de aba, sem voltar) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 18 }}>
          <CircleBtn icon={Icon.bell} onPress={() => nav.navigate('PlanReminders')} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: P.goldBorder, borderRadius: 100, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Icon.award size={12} color={P.gold} stroke={2} />
            <Text style={{ fontFamily: FONT.head, fontSize: 9, letterSpacing: 1, color: P.gold }}>MEMBRO</Text>
          </View>
        </View>

        <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 3, color: P.gold }}>
          PLANO PREMIUM · {plan.monthLabel.toUpperCase()}
        </Text>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 30, color: P.cream, letterSpacing: -0.6, marginTop: 6 }}>
          Sua semana
        </Text>

        {/* Nutricionista */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: P.hair }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: P.gold, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, color: P.gold }}>{plan.nutritionist.initial}</Text>
          </View>
          <View>
            <Text style={{ fontFamily: FONT.bodyBold, fontSize: 12, color: P.cream }}>{plan.nutritionist.name}</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: 0.5, color: P.sage }}>
              Nutricionista · {plan.nutritionist.crn}
            </Text>
          </View>
        </View>

        {/* Seletor de semana */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <Pressable onPress={() => setWeek((w) => Math.max(1, w - 1))} disabled={week <= 1} hitSlop={12} style={{ padding: 6, opacity: week <= 1 ? 0.3 : 1 }}>
            <Icon.back size={18} color={P.gold} stroke={2} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, color: P.cream }}>Semana {week}</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: 1, color: P.sage, marginTop: 1 }}>
              {plan.weekRange.toUpperCase()}
            </Text>
          </View>
          <Pressable onPress={() => setWeek((w) => Math.min(plan.weekTotal, w + 1))} disabled={week >= plan.weekTotal} hitSlop={12} style={{ padding: 6, opacity: week >= plan.weekTotal ? 0.3 : 1 }}>
            <Icon.forward size={18} color={P.gold} stroke={2} />
          </Pressable>
        </View>

        {/* Tira de dias */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          {plan.days.map((d) => (
            <DayCell
              key={d.weekday}
              label={d.dayLabel}
              short={WEEKDAY_SHORT[d.weekday - 1]}
              active={d.weekday === selected}
              future={d.weekday > plan.todayWeekday}
              onPress={() => setSelected(d.weekday)}
            />
          ))}
        </View>

        {/* Progresso do dia */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, color: P.cream }}>
            {isToday ? 'Hoje, ' : ''}{WEEKDAY_LONG[day.weekday - 1]}
          </Text>
          <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 1, color: P.gold }}>
            {doneCount} / {day.meals.length} CONCLUÍDAS
          </Text>
        </View>
        <View style={{ height: 2, backgroundColor: P.hairFaint, borderRadius: 2, marginTop: 8 }}>
          <View style={{ width: `${(doneCount / Math.max(1, day.meals.length)) * 100}%`, height: 2, backgroundColor: P.gold, borderRadius: 2 }} />
        </View>

        {/* Refeições do dia */}
        <View style={{ marginTop: 14 }}>
          {day.meals.map((m, i) => (
            <MealRow key={m.id} meal={m} first={i === 0} onPress={() => nav.navigate('PlanMeal', { mealId: m.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CircleBtn: React.FC<{ icon: React.FC<any>; onPress: () => void }> = ({ icon: IconC, onPress }) => (
  <Pressable
    onPress={onPress}
    style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: P.hair, alignItems: 'center', justifyContent: 'center' }}
  >
    <IconC size={18} color={P.gold} stroke={2} />
  </Pressable>
);

const DayCell: React.FC<{ label: string; short: string; active: boolean; future: boolean; onPress: () => void }> = ({
  label,
  short,
  active,
  future,
  onPress,
}) => {
  const numColor = active ? P.onGold : future ? P.sageFaint : P.cream;
  const lblColor = active ? P.gold : future ? P.sageFaint : P.sage;
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 32,
          height: 44,
          borderRadius: 13,
          backgroundColor: active ? P.gold : 'transparent',
          borderWidth: active ? 0 : 1,
          borderColor: future ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, color: numColor }}>{label}</Text>
      </View>
      <Text style={{ fontFamily: FONT.head, fontSize: 9, letterSpacing: 0.5, color: lblColor, marginTop: 5 }}>{short}</Text>
    </Pressable>
  );
};

const MealRow: React.FC<{ meal: PlanMeal; first: boolean; onPress: () => void }> = ({ meal, first, onPress }) => {
  const done = getMealStatus(meal.id, meal.status) === 'done';
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: P.hair,
      }}
    >
      <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, color: P.gold, width: 46 }}>{meal.time}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, color: P.cream }}>{meal.name}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: P.sage }} numberOfLines={1}>
          {meal.dish}
        </Text>
      </View>
      {done ? (
        <Icon.checkCircle size={20} color={P.gold} stroke={2} />
      ) : (
        <Icon.ring size={20} color={P.sageFaint} stroke={2} />
      )}
    </Pressable>
  );
};
