// Tela "Receitas curadas da Nutri Lu" — grid de receitas (estilo da tab Minhas)
// com busca por nome. Opcionalmente filtra por collectionId (LU_COLLECTIONS).

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { FoodImg } from '../components/FoodImg';
import { Icon } from '../components/Icons';
import { useApp } from '../state/AppContext';
import { LU_COLLECTIONS, getLuCollection } from '../data/luCollections';
import type { RootStackParamList } from '../navigation/types';
import type { Recipe } from '../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LuRecipes'>;
type Rt = RouteProp<RootStackParamList, 'LuRecipes'>;

const cardWidth = '47%' as const;

export const LuRecipesScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { recipes, favoriteRecipeIds, toggleFavoriteRecipe, addRecentRecipe } = useApp();

  const collectionId = route.params?.collectionId;
  const collection = collectionId ? getLuCollection(collectionId) : null;

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  const onToggleSearch = () => {
    if (searching) {
      setSearching(false);
      setQuery('');
    } else {
      setSearching(true);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  };

  // Source de receitas: se tem coleção, filtra; senão usa TODAS as curadas (todas as seed).
  // Quando os PDFs forem importados, "TODAS as curadas" = união de todas as coleções.
  const baseRecipes = useMemo(() => {
    if (collection) {
      return recipes.filter((r) => collection.recipeIds.includes(r.id));
    }
    // União única de IDs de todas as coleções
    const allIds = new Set<string>();
    LU_COLLECTIONS.forEach((c) => c.recipeIds.forEach((id) => allIds.add(id)));
    return recipes.filter((r) => allIds.has(r.id));
  }, [recipes, collection]);

  const filtered = useMemo(() => {
    if (!query.trim()) return baseRecipes;
    const q = query.trim().toLowerCase();
    return baseRecipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [baseRecipes, query]);

  const openRecipe = (r: Recipe) => {
    addRecentRecipe(r.id);
    nav.navigate('RecipeDetail', { recipe: r });
  };

  const title = collection?.name || 'Receitas da Lu';
  const subtitle = collection?.description || `${filtered.length} ${filtered.length === 1 ? 'receita' : 'receitas'} curadas`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title={title}
        sub={subtitle}
        large
        left={[<IconBtn key="b" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[
          <IconBtn key="s" icon={searching ? Icon.close : Icon.search} onPress={onToggleSearch} />,
        ]}
      />

      {searching && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <Card pad={10} radius={14}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon.search size={16} color={theme.textMuted} />
              <TextInput
                ref={searchRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar receita por nome…"
                placeholderTextColor={theme.textFaint}
                autoCorrect={false}
                style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, color: theme.text }}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} accessibilityLabel="Limpar busca">
                  <Icon.close size={16} color={theme.textMuted} />
                </Pressable>
              )}
            </View>
          </Card>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {filtered.map((r) => (
            <CuratedCard
              key={r.id}
              recipe={r}
              isFav={favoriteRecipeIds.includes(r.id)}
              onPress={() => openRecipe(r)}
              onToggleFav={() => toggleFavoriteRecipe(r.id)}
            />
          ))}
          {filtered.length === 0 && (
            <View style={{ width: '100%', padding: 32, alignItems: 'center', gap: 10 }}>
              <Icon.sparkle size={32} color={theme.primary} stroke={1.5} />
              <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
                {query ? 'Nada encontrado' : 'Em breve'}
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', maxWidth: 260 }}>
                {query
                  ? `Não achei receita com "${query}" nesta coleção. Tente outro nome.`
                  : 'Esta coleção ainda não tem receitas. A Lu está preparando opções pra você.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CuratedCard: React.FC<{
  recipe: Recipe;
  isFav: boolean;
  onPress: () => void;
  onToggleFav: () => void;
}> = ({ recipe, isFav, onPress, onToggleFav }) => {
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
        <Pressable
          onPress={(e: any) => {
            e?.stopPropagation?.();
            onToggleFav();
          }}
          hitSlop={8}
          accessibilityLabel={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
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
          {isFav ? (
            <Icon.heartFill size={14} color={theme.proteinPink} />
          ) : (
            <Icon.heart size={14} color={theme.textMuted} stroke={2} />
          )}
        </Pressable>
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
        <Text
          style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, lineHeight: 18 }}
          numberOfLines={2}
        >
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
