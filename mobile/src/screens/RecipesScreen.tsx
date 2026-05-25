// Tela "Receitas" (Tab 4) — porte do RecipesScreen em screens-recipes.jsx.
// Tabs: Minhas (grid) | Descobrir | Coleções | Despensa.

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { LuBtn } from '../components/LuBtn';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { FoodImg } from '../components/FoodImg';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { unsplashUrl } from '../data/mockData';
import type { RootStackParamList } from '../navigation/types';
import type { SavedRecipe } from '../storage/recipes';
import type { Recipe } from '../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'mine' | 'discover' | 'collections' | 'pantry';
type FilterKey = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export const RecipesScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>('mine');
  const [filter, setFilter] = useState<FilterKey>('all');
  const { recipes, savedRecipes } = useApp();

  const tabs: { id: TabKey; label: string }[] = [
    { id: 'mine', label: 'Minhas' },
    { id: 'discover', label: 'Descobrir' },
    { id: 'collections', label: 'Coleções' },
    { id: 'pantry', label: 'Despensa' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Receitas"
        large
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="s" icon={Icon.search} />,
          <IconBtn key="add" icon={Icon.plus} variant="filled" onPress={() => nav.navigate('ImportRecipe')} />,
        ]}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 14 }}>
          {tabs.map((t) => (
            <Chip key={t.id} active={tab === t.id} onPress={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </ScrollView>

        {tab === 'mine' && <MyRecipes filter={filter} setFilter={setFilter} savedRecipes={savedRecipes} recipes={recipes} nav={nav} />}
        {tab === 'discover' && <DiscoverRecipes recipes={recipes} nav={nav} />}
        {tab === 'collections' && <Collections />}
        {tab === 'pantry' && <PantryView nav={nav} />}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Sub-componentes ────────────────────────────────────────────

const MyRecipes: React.FC<{
  filter: FilterKey;
  setFilter: (k: FilterKey) => void;
  savedRecipes: SavedRecipe[];
  recipes: Recipe[];
  nav: Nav;
}> = ({ filter, setFilter, savedRecipes, recipes, nav }) => {
  const theme = useTheme();
  const filters: { k: FilterKey; label: string }[] = [
    { k: 'all', label: 'Todas' },
    { k: 'breakfast', label: 'Café' },
    { k: 'lunch', label: 'Almoço' },
    { k: 'dinner', label: 'Jantar' },
    { k: 'snack', label: 'Lanche' },
    { k: 'dessert', label: 'Sobremesa' },
  ];

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 14 }}>
        {filters.map((f) => (
          <Chip key={f.k} active={filter === f.k} onPress={() => setFilter(f.k)}>
            {f.label}
          </Chip>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {/* Receitas salvas pelo usuário primeiro (mais recentes no topo) */}
        {savedRecipes.map((r) => (
          <SavedCard key={r.id} recipe={r} onPress={() => nav.navigate('RecipeDetail', { saved: r })} />
        ))}
        {/* Receitas seed do mock */}
        {recipes.map((r) => (
          <SeedCard key={r.id} recipe={r} onPress={() => nav.navigate('RecipeDetail', { recipe: r })} />
        ))}
        {savedRecipes.length === 0 && (
          <View style={{ width: '100%', padding: 24, alignItems: 'center', gap: 8 }}>
            <Icon.sparkle size={28} color={theme.primary} stroke={1.5} />
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
              Importe sua primeira receita via foto ou link tocando no "+" acima.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const cardWidth = '47%' as const; // 2-col grid com gap

const SavedCard: React.FC<{ recipe: SavedRecipe; onPress: () => void }> = ({ recipe, onPress }) => {
  const theme = useTheme();
  const time = recipe.time || '—';
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: cardWidth,
        backgroundColor: theme.bgElev,
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'relative' }}>
        {recipe.imageDataUrl ? (
          <Image source={{ uri: recipe.imageDataUrl }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
        ) : (
          <FoodImg q={recipe.title} w="100%" h={120} style={{ borderRadius: 0 }} />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(0,0,0,0.55)',
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon.clock size={10} color="#fff" stroke={2} />
          <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>{time}</Text>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, lineHeight: 18 }} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
            {recipe.ingredients.length} ingredientes
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint }}>{recipe.servings || '—'} porç.</Text>
        </View>
      </View>
    </Pressable>
  );
};

const SeedCard: React.FC<{ recipe: Recipe; onPress: () => void }> = ({ recipe, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: cardWidth,
        backgroundColor: theme.bgElev,
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'relative' }}>
        <FoodImg q={recipe.q} w="100%" h={120} style={{ borderRadius: 0 }} />
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.92)',
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.heartFill size={14} color={theme.proteinPink} />
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(0,0,0,0.55)',
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderRadius: 100,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon.clock size={10} color="#fff" stroke={2} />
          <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>{recipe.time}</Text>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, lineHeight: 18 }} numberOfLines={2}>
          {recipe.name}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
            {recipe.kcal} kcal · {recipe.tag}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint }}>{recipe.servings} porç.</Text>
        </View>
      </View>
    </Pressable>
  );
};

const DiscoverRecipes: React.FC<{ recipes: Recipe[]; nav: Nav }> = ({ recipes, nav }) => {
  const theme = useTheme();
  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
        <Card pad={0} radius={22} style={{ overflow: 'hidden' }}>
          <FoodImg q="bowl,protein,colorful" w="100%" h={160} style={{ borderRadius: 0 }} />
          <View style={{ padding: 18 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Para suas metas
            </Text>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 4 }}>
              Bowls com 30g+ de proteína
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
              Selecionados com base nos seus macros restantes hoje
            </Text>
          </View>
        </Card>
      </View>

      <Text style={{ paddingHorizontal: 20, fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 }}>
        Em alta esta semana
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {recipes.slice(0, 5).map((r) => (
          <Pressable
            key={r.id}
            onPress={() => nav.navigate('RecipeDetail', { recipe: r })}
            style={{ width: 150, backgroundColor: theme.bgElev, borderRadius: 16, overflow: 'hidden' }}
          >
            <FoodImg q={r.q} w={150} h={110} style={{ borderRadius: 0 }} />
            <View style={{ padding: 10 }}>
              <Text style={{ fontFamily: FONT.head, fontSize: 12, fontWeight: '700', color: theme.text, lineHeight: 16, height: 32 }} numberOfLines={2}>
                {r.name}
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginTop: 4 }}>{r.kcal} kcal</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const Collections: React.FC = () => {
  const theme = useTheme();
  const cols = [
    { name: 'Café proteico', count: 8, q: 'breakfast,eggs' },
    { name: 'Pré-treino', count: 5, q: 'smoothie,oats' },
    { name: 'Jantar leve', count: 12, q: 'salad,dinner' },
    { name: 'Receitas da vó', count: 6, q: 'brazilian,homemade' },
  ];
  return (
    <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Pressable
        style={{
          width: cardWidth,
          minHeight: 160,
          backgroundColor: theme.bgElev,
          borderWidth: 1.5,
          borderColor: theme.borderStrong,
          borderStyle: 'dashed',
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 20,
        }}
      >
        <Icon.plus size={26} color={theme.textMuted} stroke={2} />
        <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.textMuted }}>Nova coleção</Text>
      </Pressable>
      {cols.map((c) => (
        <Card key={c.name} pad={0} radius={18} style={{ width: cardWidth, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', height: 110 }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: '50%', height: '50%' }}>
                <FoodImg q={`${c.q},${i}`} w="100%" h="100%" style={{ borderRadius: 0 }} />
              </View>
            ))}
          </View>
          <View style={{ padding: 12 }}>
            <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>{c.name}</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{c.count} receitas</Text>
          </View>
        </Card>
      ))}
    </View>
  );
};

const PantryView: React.FC<{ nav: Nav }> = ({ nav }) => {
  const theme = useTheme();
  const groups = [
    { name: 'Hortifruti', items: [
      { name: 'Tomate', qty: '4 un', exp: '2 dias', warn: true },
      { name: 'Alface', qty: '1 maço', exp: '4 dias' },
      { name: 'Cenoura', qty: '500g', exp: '8 dias' },
    ]},
    { name: 'Proteínas', items: [
      { name: 'Peito de frango', qty: '600g', exp: '3 dias' },
      { name: 'Ovos', qty: '8 un', exp: '15 dias' },
    ]},
    { name: 'Grãos & Massas', items: [
      { name: 'Arroz integral', qty: '1 kg' as string },
      { name: 'Lentilha', qty: '500g' as string },
    ]},
  ];
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Btn variant="secondary" size="md" icon={Icon.plus} full>Adicionar</Btn>
        </View>
        <View style={{ flex: 1 }}>
          <Btn variant="outline" size="md" icon={Icon.camera} full onPress={() => nav.navigate('Camera', { mode: 'food' })}>
            Foto geladeira
          </Btn>
        </View>
      </View>
      <Card pad={14} radius={16} style={{ marginBottom: 14, backgroundColor: theme.primarySoft }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon.sparkle size={22} color={theme.primaryDeep} stroke={2} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.primaryDeep }}>
              14 receitas cabem na sua despensa
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, opacity: 0.8, marginTop: 2 }}>
              Ver sugestões com o que você já tem
            </Text>
          </View>
          <Icon.forward size={18} color={theme.primaryDeep} />
        </View>
      </Card>
      {groups.map((g) => (
        <View key={g.name} style={{ marginBottom: 14 }}>
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
            {g.name}
          </Text>
          <Card pad={0} radius={16}>
            {g.items.map((it: any, i: number) => (
              <View
                key={it.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < g.items.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: it.warn ? theme.warning : theme.primary }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>{it.name}</Text>
                  {it.exp && (
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: it.warn ? theme.warningDeep : theme.textMuted, marginTop: 1 }}>
                      Vence em {it.exp}
                    </Text>
                  )}
                </View>
                <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>{it.qty}</Text>
              </View>
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
};
