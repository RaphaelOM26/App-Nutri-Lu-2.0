// Resultado da análise de prato (Foto IA de comida).
// A IA define as porções — usuário NÃO ajusta (só pode remover itens).
// Permite escolher pra qual refeição salvar (chips no topo).

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { guessMealByTime, MEAL_LABELS, MEAL_ORDER, mealLabel, type MealId } from '../utils/meals';
import type { FoodAnalysisItem } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CameraResult'>;
type Rt = RouteProp<RootStackParamList, 'CameraResult'>;

export const CameraResultScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<Rt>();
  const nav = useNavigation<Nav>();
  const { analysis, imageDataUrl, mealId: paramMealId } = route.params;
  const { addToMeal } = useApp();

  // Items vêm da IA — usuário só pode remover, não ajustar quantidade.
  const [items, setItems] = useState<FoodAnalysisItem[]>(analysis.items);
  // Refeição: usa a que veio do nav ou adivinha pela hora
  const [selectedMeal, setSelectedMeal] = useState<MealId>(
    (paramMealId as MealId) || guessMealByTime(),
  );

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const total = items.reduce(
    (acc, it) => ({
      kcal: acc.kcal + Math.round(it.kcal),
      p: acc.p + Math.round(it.protein_g),
      c: acc.c + Math.round(it.carbs_g),
      f: acc.f + Math.round(it.fat_g),
    }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  const saveToDiary = () => {
    if (items.length === 0) {
      Alert.alert('Nenhum item', 'Adicione pelo menos um item antes de salvar.');
      return;
    }
    addToMeal(
      selectedMeal,
      items.map((it) => ({
        name: it.name,
        portion: `${Math.round(it.portion_grams)}g`,
        amount: 1, // porções vêm prontas da IA
        kcal: it.kcal,
        p: it.protein_g,
        c: it.carbs_g,
        f: it.fat_g,
      })),
      total,
    );
    Alert.alert(
      'Adicionado!',
      `${total.kcal} kcal lançadas em ${mealLabel(selectedMeal).toLowerCase()}.`,
      [{ text: 'OK', onPress: () => nav.navigate('Tabs', { screen: 'Diary' } as never) }],
    );
  };

  const confidenceColor =
    analysis.confidence === 'high'
      ? theme.primary
      : analysis.confidence === 'medium'
      ? theme.warning
      : theme.proteinPink;
  const confidenceLabel =
    analysis.confidence === 'high' ? 'Alta' : analysis.confidence === 'medium' ? 'Média' : 'Baixa';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Foto */}
        <View style={{ height: 240 }}>
          <Image source={{ uri: imageDataUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View
            style={{
              position: 'absolute',
              top: 50,
              left: 16,
              right: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => nav.goBack()}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon.close size={18} color="#fff" />
            </Pressable>
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.45)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 100,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: confidenceColor }} />
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: '#fff', fontWeight: '600' }}>
                Confiança {confidenceLabel.toLowerCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Header + meal picker */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3, marginBottom: 4 }}>
            {items.length === 0 ? 'Nenhum item identificado' : `Encontramos ${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>
            Porções estimadas pela IA com base na foto
          </Text>

          {/* Meal picker — escolha a refeição */}
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 11,
              color: theme.textMuted,
              fontWeight: '700',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Adicionar em
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {MEAL_ORDER.map((m) => {
              const isActive = m === selectedMeal;
              return (
                <Pressable
                  key={m}
                  onPress={() => setSelectedMeal(m)}
                  style={{
                    height: 32,
                    paddingHorizontal: 14,
                    backgroundColor: isActive ? theme.text : theme.bgElev,
                    borderRadius: 16,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: theme.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT.bodyMedium,
                      fontSize: 13,
                      fontWeight: '600',
                      color: isActive ? theme.bg : theme.text,
                    }}
                  >
                    {MEAL_LABELS[m]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Items list */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {items.map((it, idx) => (
            <Card key={idx} pad={14} radius={18}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', fontSize: 12, color: '#fff' }}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>{it.name}</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                    {Math.round(it.portion_grams)}g · {Math.round(it.kcal)} kcal · P{Math.round(it.protein_g)} C{Math.round(it.carbs_g)} G{Math.round(it.fat_g)}
                  </Text>
                </View>
                <Pressable onPress={() => removeItem(idx)} hitSlop={8}>
                  <Icon.trash size={18} color={theme.textFaint} />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Sticky total + save */}
      <View
        style={{
          position: 'absolute',
          bottom: 24,
          left: 16,
          right: 16,
          backgroundColor: theme.bgElev,
          borderRadius: 24,
          padding: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text }}>{total.kcal} kcal</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
              P {total.p}g · C {total.c}g · G {total.f}g
            </Text>
          </View>
          <Btn variant="primary" size="md" onPress={saveToDiary}>
            Salvar em {mealLabel(selectedMeal).split(' ')[0].toLowerCase()}
          </Btn>
        </View>
      </View>
    </View>
  );
};
