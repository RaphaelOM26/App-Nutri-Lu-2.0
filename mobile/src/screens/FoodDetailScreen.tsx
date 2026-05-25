// Detalhe do alimento — agora com botão "Adicionar" funcional que
// despacha addToMeal pro contexto e volta pro diário.

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { MacroRing } from '../components/MacroRing';
import { FoodImg } from '../components/FoodImg';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { guessMealByTime, mealLabel, type MealId } from '../utils/meals';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'FoodDetail'>;

export const FoodDetailScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const replayKey = useFocusReplay();
  const { addToMeal } = useApp();
  const { food } = route.params;
  // Se veio de AddFood com mealId, usa; senão adivinha pela hora atual
  const mealId: MealId = (route.params?.mealId as MealId) || guessMealByTime();

  // Parse da porção base do food (ex: "100g" → 100)
  const basePortion = parseInt(food.portion, 10) || 100;
  const [qty, setQty] = useState(basePortion);
  const factor = qty / basePortion;
  const kcal = Math.round(food.kcal * factor);
  const p = Math.round(food.p * factor);
  const c = Math.round(food.c * factor);
  const f = Math.round(food.f * factor);

  const onAdd = () => {
    if (qty <= 0) {
      Alert.alert('Porção inválida', 'Digite uma porção maior que zero.');
      return;
    }
    addToMeal(
      mealId,
      [
        {
          name: food.name,
          portion: `${qty}g`,
          amount: 1,
          kcal,
          p,
          c,
          f,
        },
      ],
      { kcal, p, c, f },
    );
    // Feedback visual + navega pro Diário
    Alert.alert('Adicionado!', `${food.name} (${qty}g · ${kcal} kcal) no ${mealLabel(mealId).toLowerCase()}.`, [
      {
        text: 'OK',
        onPress: () => nav.navigate('Tabs', { screen: 'Diary' } as never),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={food.name}
        left={[<IconBtn key="back" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[<IconBtn key="heart" icon={Icon.heart} />, <IconBtn key="more" icon={Icon.more} />]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <FoodImg q={food.q} w="100%" h={180} style={{ borderRadius: 24 }} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 13,
              color: theme.textMuted,
              fontWeight: '600',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {food.brand}
          </Text>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.4, marginTop: 4 }}>
            {food.name}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '600', marginTop: 4 }}>
            Será adicionado em: {mealLabel(mealId)}
          </Text>
        </View>

        {/* Porção */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Card pad={16} radius={20}>
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
              Porção
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <TextInput
                value={String(qty)}
                onChangeText={(v) => setQty(parseInt(v || '0', 10) || 0)}
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: theme.bgSubtle,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  fontFamily: FONT.head,
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.text,
                }}
              />
              <View style={{ backgroundColor: theme.bgSubtle, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>gramas</Text>
              </View>
            </View>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 8 }}>
              Base nutricional: {food.portion}
            </Text>
          </Card>
        </View>

        {/* Nutrição */}
        <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
          <Card pad={18} radius={20}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 32, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }}>{kcal}</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>kcal · {qty}g</Text>
              </View>
              <MacroRing
                key={`food-ring-${replayKey}-${qty}`}
                size={60}
                stroke={6}
                value={kcal / 2200}
                color={theme.primary}
                inner={<Icon.flame size={20} color={theme.primaryDeep} />}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { k: 'Proteína', v: p, color: theme.proteinPink },
                { k: 'Carbo', v: c, color: theme.carbsBlue },
                { k: 'Gordura', v: f, color: theme.fatsGold },
              ].map((m) => (
                <View key={m.k} style={{ flex: 1, backgroundColor: theme.bgSubtle, borderRadius: 14, padding: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
                    {m.v}
                    <Text style={{ fontSize: 11, fontWeight: '600', color: theme.textMuted }}>g</Text>
                  </Text>
                  <View style={{ width: 24, height: 3, backgroundColor: m.color, borderRadius: 2, marginVertical: 6 }} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>{m.k}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
        <Btn variant="primary" full onPress={onAdd} icon={Icon.plus}>
          Adicionar · {kcal} kcal
        </Btn>
      </View>
    </SafeAreaView>
  );
};
