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
import { FoodImg } from '../components/FoodImg';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { mealLabel, normalize } from '../utils/meals';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'AddFood'>;

type TabKey = 'search' | 'recent' | 'fav' | 'mine' | 'recipes' | 'meals';

export const AddFoodScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { foodDB } = useApp();
  const [tab, setTab] = useState<TabKey>('search');
  const [query, setQuery] = useState('');
  const mealId = route.params?.mealId || 'breakfast';
  const mealName = mealLabel(mealId);

  const tabs: { id: TabKey; label: string }[] = [
    { id: 'search', label: 'Buscar' },
    { id: 'recent', label: 'Recentes' },
    { id: 'fav', label: 'Favoritos' },
    { id: 'mine', label: 'Meus' },
    { id: 'recipes', label: 'Receitas' },
    { id: 'meals', label: 'Refeições' },
  ];

  // Busca tolerante a acentos e case
  const results = foodDB.filter((f) => {
    if (!query.trim()) return true;
    const q = normalize(query);
    return normalize(f.name).includes(q) || normalize(f.brand).includes(q);
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={`Adicionar a ${mealName}`}
        left={[<IconBtn key="close" icon={Icon.close} onPress={() => nav.goBack()} />]}
        right={[<IconBtn key="bc" icon={Icon.barcode} onPress={() => nav.navigate('Barcode', { mealId })} />]}
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
          <Pressable onPress={() => nav.navigate('Voice', { mealId })}>
            <Icon.mic size={18} color={theme.primaryDeep} stroke={2} />
          </Pressable>
          <Pressable onPress={() => nav.navigate('Camera', { mode: 'food', mealId })}>
            <Icon.camera size={18} color={theme.primaryDeep} stroke={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 12 }}>
        {tabs.map((t) => (
          <Chip key={t.id} active={tab === t.id} onPress={() => setTab(t.id)}>
            {t.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}>
        {results.length === 0 && query.trim() && (
          <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
            <Icon.search size={28} color={theme.textMuted} stroke={1.5} />
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
              Nenhum alimento encontrado pra "{query}".{'\n'}Tente buscar por outro termo.
            </Text>
          </View>
        )}
        {results.map((food) => (
          <Pressable
            key={food.id}
            onPress={() => nav.navigate('FoodDetail', { food, mealId })}
            style={{
              backgroundColor: theme.bgElev,
              borderRadius: 18,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <FoodImg q={food.q} w={44} h={44} style={{ borderRadius: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }}>{food.name}</Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                {food.brand} · {food.portion}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 14, fontWeight: '800', color: theme.text }}>{food.kcal}</Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted }}>kcal</Text>
            </View>
            <Icon.star size={18} color={food.fav ? theme.primary : theme.textFaint} stroke={2} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
