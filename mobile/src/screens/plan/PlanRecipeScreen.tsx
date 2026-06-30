// Plano alimentar premium — RECEITA COMPLETA (foto + macros + ingredientes +
// modo de preparo passo a passo). Estilo Dark Luxe.
// Na v1.0 reaproveita a receita codificada do catálogo; Fase 1 usa o exemplo.

import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FONT } from '../../theme';
import { PREMIUM as P } from '../../theme/premium';
import { Icon } from '../../components/Icons';
import { SAMPLE_PLAN, findPlanMeal } from '../../storage/mealPlan';
import { MacroRow } from './premiumParts';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'PlanRecipe'>;

export const PlanRecipeScreen: React.FC = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const meal = findPlanMeal(SAMPLE_PLAN, route.params.mealId);

  if (!meal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg, padding: 24 }}>
        <Text style={{ color: P.cream, fontFamily: FONT.body }}>Receita não encontrada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero com moldura de ouro */}
        <View style={{ height: 230, backgroundColor: P.cardRaised, alignItems: 'center', justifyContent: 'center' }}>
          <Icon.drumstick size={56} color={P.gold} stroke={1.5} />
          <View style={{ position: 'absolute', top: 60, left: 16, right: 16, bottom: 16, borderWidth: 1, borderColor: P.goldBorder, borderRadius: 14 }} />
          <Pressable
            onPress={() => nav.goBack()}
            style={{ position: 'absolute', top: 56, left: 18, width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: P.goldBorder, backgroundColor: 'rgba(18,32,26,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon.back size={17} color={P.gold} stroke={2} />
          </Pressable>
          <Text style={{ position: 'absolute', bottom: 28, left: 22, fontFamily: FONT.head, fontSize: 9, letterSpacing: 2, color: P.creamSoft }}>
            DO SEU PLANO · {SAMPLE_PLAN.monthLabel.toUpperCase()}
          </Text>
        </View>

        <View style={{ padding: 22 }}>
          <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 3, color: P.gold }}>
            {meal.name.toUpperCase()} · {meal.time}
          </Text>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 25, color: P.cream, letterSpacing: -0.5, lineHeight: 29, marginTop: 8 }}>
            {meal.dish}
          </Text>

          {/* Tempo · porções · kcal */}
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: P.hair }}>
            <Meta label="TEMPO" value={meal.prepTime ?? '—'} />
            <View style={{ width: 1, backgroundColor: P.hair }} />
            <Meta label="PORÇÕES" value="1" />
            <View style={{ width: 1, backgroundColor: P.hair }} />
            <Meta label="KCAL" value={String(meal.kcal)} />
          </View>

          {/* Macros */}
          <View style={{ marginTop: 16 }}>
            <MacroRow kcal={meal.kcal} p={meal.p} c={meal.c} f={meal.f} compact />
          </View>

          {/* Ingredientes */}
          <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 3, color: P.gold, marginTop: 20, marginBottom: 8 }}>
            INGREDIENTES
          </Text>
          <View style={{ backgroundColor: P.card, borderRadius: 16, padding: 14 }}>
            {meal.foods.map((fd, i) => (
              <Text key={i} style={{ fontFamily: FONT.body, fontSize: 13, color: P.cream, lineHeight: 24 }}>
                ·  {fd.name} — {fd.qty}
              </Text>
            ))}
          </View>

          {/* Modo de preparo */}
          <Text style={{ fontFamily: FONT.head, fontSize: 10, letterSpacing: 3, color: P.gold, marginTop: 20, marginBottom: 8 }}>
            MODO DE PREPARO
          </Text>
          <View>
            {(meal.steps ?? []).map((s, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: P.hair,
                }}
              >
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, color: P.gold, width: 22 }}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, color: P.cream, lineHeight: 20 }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Meta: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View>
    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: P.sage }}>{label}</Text>
    <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, color: P.cream, marginTop: 2 }}>{value}</Text>
  </View>
);
