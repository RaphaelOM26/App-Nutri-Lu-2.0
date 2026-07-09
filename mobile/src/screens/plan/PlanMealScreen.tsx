// Plano alimentar premium — DETALHE DA REFEIÇÃO. Estilo Dark Luxe.
// Foto do prato (vinda do PDF na v1.0) + alimentos + macros + ações.

import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT } from '../../theme';
import { PREMIUM as P } from '../../theme/premium';
import { Icon } from '../../components/Icons';
import { useToast } from '../../state/ToastContext';
import { getActivePlan, findPlanMeal } from '../../storage/mealPlan';
import { getMealStatus, toggleMealStatus, usePlanStatuses } from '../../storage/mealPlanState';
import { MacroRow } from './premiumParts';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'PlanMeal'>;

export const PlanMealScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const toast = useToast();
  usePlanStatuses(); // re-renderiza quando o status muda
  const plan = getActivePlan();
  const meal = plan ? findPlanMeal(plan, route.params.mealId) : undefined;

  if (!plan || !meal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg, padding: 24 }}>
        <Text style={{ color: P.cream, fontFamily: FONT.body }}>Refeição não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const hasRecipe = !!meal.steps && meal.steps.length > 0;
  const done = getMealStatus(meal.id, meal.status) === 'done';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 22, paddingBottom: 8 }}>
          <Pressable
            onPress={() => nav.goBack()}
            style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: P.hair, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.back size={18} color={P.gold} stroke={2} />
          </Pressable>
          <View>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, color: P.cream }}>{meal.name}</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: P.sage }}>{meal.time}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 22 }}>
          {/* Foto do prato (placeholder na Fase 1; real do PDF na v1.0) */}
          <View style={{ height: 168, borderRadius: 18, backgroundColor: P.cardRaised, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Icon.drumstick size={48} color={P.gold} stroke={1.5} />
            <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderWidth: 1, borderColor: P.goldBorder, borderRadius: 12 }} />
            <View style={{ position: 'absolute', bottom: 12, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon.image size={11} color={P.creamSoft} stroke={2} />
              <Text style={{ fontFamily: FONT.head, fontSize: 9, letterSpacing: 1.5, color: P.creamSoft }}>FOTO DO PRATO · DO PDF</Text>
            </View>
          </View>

          {/* Alimentos */}
          <View style={{ marginTop: 14, backgroundColor: P.card, borderRadius: 16, paddingHorizontal: 16 }}>
            {meal.foods.map((fd, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 13,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: P.hairFaint,
                }}
              >
                <Text style={{ fontFamily: FONT.body, fontSize: 14, color: P.cream }}>{fd.name}</Text>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, color: P.creamSoft }}>{fd.qty}</Text>
              </View>
            ))}
          </View>

          {/* Macros */}
          <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 3, color: P.gold, marginTop: 18, marginBottom: 8 }}>
            MACROS DA REFEIÇÃO
          </Text>
          <MacroRow kcal={meal.kcal} p={meal.p} c={meal.c} f={meal.f} />

          {/* Ações */}
          {hasRecipe && (
            <Pressable
              onPress={() => nav.navigate('PlanRecipe', { mealId: meal.id })}
              style={{ marginTop: 16, borderWidth: 1, borderColor: P.gold, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Icon.recipe size={18} color={P.gold} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, letterSpacing: 0.5, color: P.gold }}>Ver receita completa</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => { toast('Adicionada ao diário'); }}
            style={{ marginTop: 10, backgroundColor: P.gold, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Icon.plus size={18} color={P.onGold} stroke={2.5} />
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, color: P.onGold }}>Adicionar ao diário</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const next = toggleMealStatus(meal.id, meal.status);
              toast(next === 'done' ? 'Marcada como feita' : 'Marcada como pendente');
            }}
            style={{ paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
          >
            {done && <Icon.check size={15} color={P.gold} stroke={2.5} />}
            <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, color: P.gold }}>{done ? 'Concluída' : 'Marcar como feito'}</Text>
          </Pressable>

          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: P.sageFaint, textAlign: 'center', marginTop: 4 }}>
            Do seu plano de {plan.monthLabel} · {plan.nutritionist.name}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
