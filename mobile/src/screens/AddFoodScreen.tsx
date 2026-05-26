// Adicionar alimento — porte simplificado do AddFoodScreen em screens-home.jsx.

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { mealLabel, normalize } from '../utils/meals';
import type { RootStackParamList } from '../navigation/types';
import type { Food } from '../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'AddFood'>;

type TabKey = 'search' | 'recent' | 'fav';

export const AddFoodScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { foodDB, favoriteFoodIds, recentFoodIds, toggleFavoriteFood, addRecentFood } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>('search');
  const [query, setQuery] = useState('');
  const mealId = route.params?.mealId || 'breakfast';
  const mealName = mealLabel(mealId);

  const tabs: { id: TabKey; label: string }[] = [
    { id: 'search', label: 'Buscar' },
    { id: 'recent', label: 'Recentes' },
    { id: 'fav', label: 'Favoritos' },
  ];

  // Lookup rápido por id pra mapear ordens persistidas → objetos Food.
  const foodById = React.useMemo(() => {
    const m = new Map<string, Food>();
    for (const f of foodDB) m.set(f.id, f);
    return m;
  }, [foodDB]);
  const favIdSet = React.useMemo(() => new Set(favoriteFoodIds), [favoriteFoodIds]);

  // Resultado depende da tab + query.
  const trimmed = query.trim();
  const results: Food[] = React.useMemo(() => {
    if (tab === 'search') {
      if (!trimmed) return [];
      const q = normalize(trimmed);
      return foodDB.filter((f) => normalize(f.name).includes(q) || normalize(f.brand).includes(q));
    }
    if (tab === 'recent') {
      const list = recentFoodIds.map((id) => foodById.get(id)).filter((f): f is Food => !!f);
      if (!trimmed) return list;
      const q = normalize(trimmed);
      return list.filter((f) => normalize(f.name).includes(q) || normalize(f.brand).includes(q));
    }
    // 'fav'
    const list = favoriteFoodIds.map((id) => foodById.get(id)).filter((f): f is Food => !!f);
    if (!trimmed) return list;
    const q = normalize(trimmed);
    return list.filter((f) => normalize(f.name).includes(q) || normalize(f.brand).includes(q));
  }, [tab, trimmed, foodDB, foodById, recentFoodIds, favoriteFoodIds]);

  const onPickFood = (food: Food) => {
    addRecentFood(food.id);
    nav.navigate('FoodDetail', { food, mealId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={`Adicionar a ${mealName}`}
        left={[<IconBtn key="close" icon={Icon.close} onPress={() => nav.goBack()} />]}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.bgElev,
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <Icon.search size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Busque por alimento, marca…"
            placeholderTextColor={theme.textFaint}
            style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, color: theme.text }}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 12 }}
      >
        {tabs.map((t) => (
          <Chip key={t.id} active={tab === t.id} onPress={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}>
        {results.length === 0 && (
          <View style={{ padding: 32, alignItems: 'center', gap: 8 }}>
            <Icon.search size={28} color={theme.textMuted} stroke={1.5} />
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
              {tab === 'search' && !trimmed && 'Comece digitando o nome de um alimento.'}
              {tab === 'search' && trimmed && `Nenhum alimento encontrado pra "${query}".`}
              {tab === 'recent' && !trimmed && 'Sem alimentos recentes ainda.\nOs alimentos que você adicionar aparecem aqui.'}
              {tab === 'recent' && trimmed && `Nenhum recente bate com "${query}".`}
              {tab === 'fav' && !trimmed && 'Sem favoritos ainda.\nToque no coração de um alimento pra favoritar.'}
              {tab === 'fav' && trimmed && `Nenhum favorito bate com "${query}".`}
            </Text>
          </View>
        )}
        {results.map((food) => {
          const isFav = favIdSet.has(food.id);
          return (
            <Pressable
              key={food.id}
              onPress={() => onPickFood(food)}
              style={{
                backgroundColor: theme.bgElev,
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }} numberOfLines={2}>
                  {food.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    {food.brand} · {food.portion}
                  </Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.proteinPink, fontWeight: '700' }}>P {food.p}g</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.carbsBlue, fontWeight: '700' }}>C {food.c}g</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.fatsGold, fontWeight: '700' }}>G {food.f}g</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>{food.kcal}</Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted }}>kcal</Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  const wasFav = favIdSet.has(food.id);
                  toggleFavoriteFood(food.id);
                  toast(wasFav ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
                }}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                {isFav ? (
                  <Icon.heartFill size={20} color={theme.proteinPink} />
                ) : (
                  <Icon.heart size={20} color={theme.textFaint} stroke={2} />
                )}
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
