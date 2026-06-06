// Resultado da análise de imagem (Foto IA).
// 2 fluxos via `mode`:
//   - 'food'   → adiciona como item de refeição no Diário (com meal picker)
//   - 'pantry' → adiciona à despensa com shelf-life estimado (sem meal picker)
//
// Items vêm da IA — usuário pode REMOVER e AJUSTAR a porção em gramas.
// Ajuste de porção recalcula macros proporcionalmente (regra de 3 simples).
// (Adicionado 2026-06-05 — IA estimava errado em ~50% pra alguns alimentos.)

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Modal, TextInput } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { guessMealByTime, MEAL_LABELS, MEAL_ORDER, mealLabel, type MealId } from '../utils/meals';
import { categorize } from '../storage/shoppingList';
import { estimateShelfLifeDays, shelfLifeToExpiresAt } from '../utils/pantryShelfLife';
import type { FoodAnalysisItem } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CameraResult'>;
type Rt = RouteProp<RootStackParamList, 'CameraResult'>;

export const CameraResultScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<Rt>();
  const nav = useNavigation<Nav>();
  const { analysis, imageDataUrl, mode = 'food', mealId: paramMealId } = route.params;
  const { addToMeal, addPantryItem } = useApp();
  const toast = useToast();
  const isPantry = mode === 'pantry';

  const [items, setItems] = useState<FoodAnalysisItem[]>(analysis.items);
  const [selectedMeal, setSelectedMeal] = useState<MealId>(
    (paramMealId as MealId) || guessMealByTime(),
  );
  // Edição inline de porção: idx + valor temporário do TextInput. null = modal fechado.
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const openEditor = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(String(Math.round(items[idx].portion_grams)));
  };

  const closeEditor = () => {
    setEditingIdx(null);
    setEditValue('');
  };

  // Atualiza porção do item recalculando macros pelo ratio (newGrams / oldGrams).
  // Em pantry só importa a gramatura — kcal/macros são ignorados ao salvar mesmo,
  // mas a gente atualiza pra UI ficar consistente.
  const saveEditedPortion = () => {
    if (editingIdx === null) return;
    const parsed = parseFloat(editValue.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert('Valor inválido', 'Informe a quantidade em gramas (ex: 485).');
      return;
    }
    const oldItem = items[editingIdx];
    const ratio = parsed / oldItem.portion_grams;
    const updated: FoodAnalysisItem = {
      ...oldItem,
      portion_grams: parsed,
      kcal: Math.round(oldItem.kcal * ratio),
      protein_g: Math.round(oldItem.protein_g * ratio),
      carbs_g: Math.round(oldItem.carbs_g * ratio),
      fat_g: Math.round(oldItem.fat_g * ratio),
    };
    setItems(items.map((it, i) => (i === editingIdx ? updated : it)));
    closeEditor();
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
        amount: 1,
        kcal: it.kcal,
        p: it.protein_g,
        c: it.carbs_g,
        f: it.fat_g,
      })),
      total,
    );
    toast(`Adicionado a ${mealLabel(selectedMeal)} · ${total.kcal} kcal`);
    nav.navigate('Tabs', { screen: 'Diary' } as never);
  };

  const saveToPantry = () => {
    if (items.length === 0) {
      Alert.alert('Nenhum item', 'Identifique pelo menos um item antes de salvar.');
      return;
    }
    // Adiciona cada item identificado à despensa com:
    // - qty: portion_grams da IA (ex: "100g")
    // - cat: derivada via categorize() do nome (Hortifruti/Proteínas/etc.)
    // - expiresAt: estimado via estimateShelfLifeDays() ou null pra não-perecível
    for (const it of items) {
      const days = estimateShelfLifeDays(it.name);
      addPantryItem({
        name: it.name,
        qty: `${Math.round(it.portion_grams)}g`,
        cat: categorize(it.name),
        expiresAt: shelfLifeToExpiresAt(days),
      });
    }
    toast(`Adicionado à despensa · ${items.length} ${items.length === 1 ? 'item' : 'itens'}`);
    nav.navigate('Tabs', { screen: 'Recipes' } as never);
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

        {/* Header (+ meal picker quando food) */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3, marginBottom: 4 }}>
            {items.length === 0
              ? 'Nenhum item identificado'
              : `Encontramos ${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>
            {isPantry
              ? 'Validade estimada por categoria do alimento'
              : 'Porções estimadas pela IA com base na foto'}
          </Text>

          {/* Meal picker SOMENTE no fluxo food */}
          {!isPantry && (
            <>
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
            </>
          )}
        </View>

        {/* Items list — pantry mostra validade, food mostra macros */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {items.map((it, idx) => {
            const shelfDays = isPantry ? estimateShelfLifeDays(it.name) : null;
            const expiryLabel =
              shelfDays == null
                ? isPantry
                  ? 'Não-perecível'
                  : null
                : shelfDays === 0
                  ? 'Vence hoje'
                  : `Vence em ${shelfDays} ${shelfDays === 1 ? 'dia' : 'dias'}`;
            const expiryColor =
              shelfDays != null && shelfDays <= 3 ? theme.warning : theme.textMuted;
            return (
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
                    {/* Toque na linha da porção pra ajustar — IA estimou, user pode corrigir.
                        Underline sutil sinaliza que é editável. */}
                    <Pressable onPress={() => openEditor(idx)} hitSlop={6}>
                      <Text
                        style={{
                          fontFamily: FONT.body,
                          fontSize: 11,
                          color: isPantry ? expiryColor : theme.textMuted,
                          marginTop: 1,
                          textDecorationLine: 'underline',
                          textDecorationColor: theme.borderStrong,
                        }}
                      >
                        {isPantry
                          ? `${Math.round(it.portion_grams)}g · ${expiryLabel}`
                          : `${Math.round(it.portion_grams)}g · ${Math.round(it.kcal)} kcal · P${Math.round(it.protein_g)} C${Math.round(it.carbs_g)} G${Math.round(it.fat_g)}`}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => removeItem(idx)} hitSlop={8}>
                    <Icon.trash size={18} color={theme.textFaint} />
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky bottom — food mostra total de macros, pantry mostra count */}
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
            {isPantry ? (
              <>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text }}>
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                  Validade calculada automaticamente
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: theme.text }}>{total.kcal} kcal</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                  P {total.p}g · C {total.c}g · G {total.f}g
                </Text>
              </>
            )}
          </View>
          <Btn
            variant="primary"
            size="md"
            onPress={isPantry ? saveToPantry : saveToDiary}
          >
            {isPantry ? 'Salvar na despensa' : `Salvar em ${mealLabel(selectedMeal).split(' ')[0].toLowerCase()}`}
          </Btn>
        </View>
      </View>

      {/* Modal de edição da porção. Toque em qualquer item abre aqui. */}
      <Modal
        visible={editingIdx !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <Pressable
          onPress={closeEditor}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: theme.bg,
              borderRadius: 24,
              padding: 24,
              gap: 16,
            }}
          >
            <View>
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
                Ajustar quantidade
              </Text>
              {editingIdx !== null && (
                <Text
                  style={{
                    fontFamily: FONT.head,
                    fontSize: 18,
                    fontWeight: '800',
                    color: theme.text,
                    marginTop: 4,
                  }}
                >
                  {items[editingIdx]?.name}
                </Text>
              )}
              <Text
                style={{
                  fontFamily: FONT.body,
                  fontSize: 12,
                  color: theme.textMuted,
                  marginTop: 4,
                }}
              >
                {isPantry
                  ? 'A IA estimou — você pode corrigir pra refletir o peso real.'
                  : 'Macros serão recalculados proporcionalmente.'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="numeric"
                autoFocus
                placeholder="0"
                placeholderTextColor={theme.textFaint}
                style={{
                  flex: 1,
                  height: 56,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 16,
                  paddingHorizontal: 18,
                  fontFamily: FONT.headExtra,
                  fontSize: 22,
                  fontWeight: '800',
                  color: theme.text,
                  textAlign: 'right',
                }}
              />
              <Text
                style={{
                  fontFamily: FONT.bodyBold,
                  fontSize: 16,
                  color: theme.textMuted,
                  fontWeight: '700',
                }}
              >
                g
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="secondary" size="md" full onPress={closeEditor}>
                  Cancelar
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="md" full onPress={saveEditedPortion}>
                  Salvar
                </Btn>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
