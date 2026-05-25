// Detalhe da receita — porte completo do RecipeDetailScreen em screens-recipes.jsx.
// Mostra: hero, título, macros, tabs (Ingredientes/Modo/Notas), com toggle de
// despensa/lista nos ingredientes e atalho pra Lista de Compras.
//
// Param pode ser { recipe } (seed), { saved } (do AsyncStorage) ou { extracted }
// (recém-extraída, ainda não salva).

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { Chip } from '../components/Chip';
import { Icon } from '../components/Icons';
import { FoodImg } from '../components/FoodImg';
import { MacroRing } from '../components/MacroRing';
import { useApp } from '../state/AppContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { newRecipeId, type SavedRecipe } from '../storage/recipes';
import { categorize } from '../storage/shoppingList';
import type { Ingredient, ExtractedRecipe } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeDetail'>;
type Rt = RouteProp<RootStackParamList, 'RecipeDetail'>;

type TabId = 'ingredients' | 'steps' | 'notes';
type IngredientStatus = 'pantry' | 'list' | null;

// Mock ingredients/steps pras receitas seed (não vêm com dados estruturados)
const SEED_INGREDIENTS: Ingredient[] = [
  { quantity: '300', unit: 'g', name: 'Peito de frango' },
  { quantity: '1', unit: 'xícara', name: 'Arroz integral' },
  { quantity: '200', unit: 'g', name: 'Brócolis' },
  { quantity: '2', unit: 'colheres', name: 'Azeite' },
  { quantity: '3', unit: 'dentes', name: 'Alho' },
  { quantity: '1', unit: 'unidade', name: 'Limão' },
];
const SEED_STEPS = [
  'Tempere o frango com sal, pimenta e suco de meio limão. Deixe descansar 10 minutos.',
  'Cozinhe o arroz integral em água fervente por 25 minutos, escorra e reserve.',
  'Em uma frigideira, doure o alho no azeite, adicione o brócolis e refogue por 4 minutos.',
  'Grelhe o frango por 6-7 minutos de cada lado. Sirva sobre o arroz com o brócolis.',
];

export const RecipeDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<Rt>();
  const nav = useNavigation<Nav>();
  const replayKey = useFocusReplay();
  const {
    addSavedRecipe,
    removeSavedRecipe,
    shoppingList,
    upsertShoppingItem,
    removeShoppingItem,
  } = useApp();
  const params = route.params ?? {};

  // Normaliza pra uma representação única
  const view = useMemo(() => {
    if (params.recipe) {
      return {
        kind: 'seed' as const,
        title: params.recipe.name,
        q: params.recipe.q,
        time: params.recipe.time,
        baseServings: params.recipe.servings || 2,
        kcal: params.recipe.kcal,
        ingredients: SEED_INGREDIENTS,
        steps: SEED_STEPS,
        confidence: null,
        imageDataUrl: null as string | null,
        sourceUrl: null as string | null,
      };
    }
    if (params.saved) {
      return {
        kind: 'saved' as const,
        data: params.saved,
        title: params.saved.title,
        q: params.saved.title,
        time: params.saved.time || '—',
        baseServings: params.saved.servings || 1,
        kcal: 0, // backend não extrai macros ainda
        ingredients: params.saved.ingredients,
        steps: params.saved.steps,
        confidence: params.saved.confidence,
        imageDataUrl: params.saved.imageDataUrl || null,
        sourceUrl: params.saved.sourceUrl || null,
      };
    }
    if (params.extracted) {
      return {
        kind: 'extracted' as const,
        data: params.extracted,
        title: params.extracted.title,
        q: params.extracted.title,
        time: params.extracted.time || '—',
        baseServings: params.extracted.servings || 1,
        kcal: 0,
        ingredients: params.extracted.ingredients,
        steps: params.extracted.steps,
        confidence: params.extracted.confidence,
        imageDataUrl: params.extracted.imageDataUrl || null,
        sourceUrl: params.extracted.sourceUrl || null,
      };
    }
    return null;
  }, [params]);

  const [tab, setTab] = useState<TabId>('ingredients');
  const [servings, setServings] = useState<number>(view?.baseServings || 1);
  // Marca local "despensa" — não persiste globalmente.
  // (Pantry global por nome seria outra feature; aqui é só a UX da receita.)
  const [localPantry, setLocalPantry] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);

  if (!view) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, padding: 24 }}>
        <Text style={{ color: theme.text }}>Receita não encontrada.</Text>
      </View>
    );
  }

  // ID estável pra ingrediente nesta receita — formato 'recipe-<recipeId>-<idx>'.
  // Usado pra rastrear o item no shoppingList global.
  const recipeId =
    view.kind === 'seed'
      ? params.recipe!.id
      : view.kind === 'saved'
      ? view.data.id
      : `extracted-${view.title.slice(0, 20)}`; // estável durante a sessão
  const ingredientItemId = (idx: number) => `recipe-${recipeId}-${idx}`;

  // Deriva status de cada ingrediente:
  //   - se está no shoppingList global → 'list'
  //   - se está em localPantry → 'pantry'
  //   - senão → null
  const getStatus = (idx: number): IngredientStatus => {
    const id = ingredientItemId(idx);
    if (shoppingList.some((it) => it.id === id)) return 'list';
    if (localPantry[idx]) return 'pantry';
    return null;
  };
  const ingredientStatus = view.ingredients.map((_, i) => getStatus(i));

  const scale = servings / view.baseServings;
  const scaledKcal = Math.round(view.kcal * scale);
  // Macros placeholder pra seeds (proporção fixa do design)
  const scaledP = view.kind === 'seed' ? Math.round(38 * scale) : 0;
  const scaledC = view.kind === 'seed' ? Math.round(45 * scale) : 0;
  const scaledF = view.kind === 'seed' ? Math.round(12 * scale) : 0;
  const showMacros = view.kind === 'seed' && view.kcal > 0;

  /**
   * Toggle de status. Comportamento:
   *  - tap 'list'   → adiciona ao shoppingList global (remove de pantry local)
   *  - tap 'pantry' → marca pantry local + remove do shoppingList se estava
   *  - tap no mesmo status atual → limpa
   */
  const setStatus = (idx: number, target: IngredientStatus) => {
    const current = getStatus(idx);
    const id = ingredientItemId(idx);
    const ing = view.ingredients[idx];
    const qty = `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}`.trim();

    // Toggle off: tap no que já está ativo limpa tudo
    if (current === target) {
      if (current === 'list') removeShoppingItem(id);
      if (current === 'pantry') setLocalPantry((prev) => ({ ...prev, [idx]: false }));
      return;
    }

    if (target === 'list') {
      // Adiciona ao global
      upsertShoppingItem({
        id,
        name: ing.name,
        qty,
        cat: categorize(ing.name),
        checked: false,
        inPantry: false,
        sourceRecipeTitle: view.title,
      });
      // Limpa pantry local se estava
      setLocalPantry((prev) => ({ ...prev, [idx]: false }));
    } else if (target === 'pantry') {
      // Marca pantry local e remove do shoppingList se estava
      setLocalPantry((prev) => ({ ...prev, [idx]: true }));
      removeShoppingItem(id);
    }
  };

  const inPantryCount = ingredientStatus.filter((s) => s === 'pantry').length;
  const inListCount = ingredientStatus.filter((s) => s === 'list').length;

  const addAllToList = () => {
    view.ingredients.forEach((ing, idx) => {
      if (getStatus(idx)) return; // já marcado, ignora
      const id = ingredientItemId(idx);
      const qty = `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}`.trim();
      upsertShoppingItem({
        id,
        name: ing.name,
        qty,
        cat: categorize(ing.name),
        checked: false,
        inPantry: false,
        sourceRecipeTitle: view.title,
      });
    });
  };

  const onSave = async () => {
    if (view.kind !== 'extracted') return;
    setSaving(true);
    try {
      const saved: SavedRecipe = {
        ...view.data,
        id: newRecipeId(),
        savedAt: Date.now(),
        source: view.data.sourceUrl ? 'url' : view.data.imageDataUrl ? 'image' : 'manual',
        imageDataUrl: view.data.imageDataUrl,
        sourceUrl: view.data.sourceUrl,
      };
      await addSavedRecipe(saved);
      setSavedJustNow(true);
      Alert.alert('Salvo!', `"${saved.title}" foi adicionada às suas receitas.`, [
        { text: 'Ver receitas', onPress: () => nav.navigate('Tabs') },
      ]);
    } catch (err) {
      Alert.alert('Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (view.kind !== 'saved') return;
    Alert.alert('Excluir receita?', `"${view.data.title}" será removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await removeSavedRecipe(view.data.id);
          nav.goBack();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Hero */}
        <View style={{ position: 'relative', height: 260 }}>
          {view.imageDataUrl ? (
            <Image source={{ uri: view.imageDataUrl }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
          ) : (
            <FoodImg q={view.q} w="100%" h={260} style={{ borderRadius: 0 }} />
          )}
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
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon.back size={18} color="#1B1B1B" />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {view.kind === 'saved' && (
                <Pressable
                  onPress={onDelete}
                  style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon.trash size={16} color={theme.proteinPink} />
                </Pressable>
              )}
              <Pressable
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon.more size={16} color="#1B1B1B" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Title card */}
        <View style={{ marginTop: -32, paddingHorizontal: 16 }}>
          <Card pad={20} radius={24}>
            {view.confidence && (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View
                  style={{
                    backgroundColor:
                      view.confidence === 'high'
                        ? theme.primarySoft
                        : view.confidence === 'medium'
                        ? theme.accentIce
                        : theme.accentPink,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 100,
                  }}
                >
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: theme.text }}>
                    Confiança {view.confidence === 'high' ? 'alta' : view.confidence === 'medium' ? 'média' : 'baixa'}
                  </Text>
                </View>
              </View>
            )}
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.4, lineHeight: 28 }}>
              {view.title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                marginTop: 14,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: theme.border,
              }}
            >
              <Stat label="TEMPO" value={view.time} />
              <View style={{ width: 1, height: 30, backgroundColor: theme.border }} />
              <View style={{ flex: 1.4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>PORÇÕES</Text>
                  <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, fontWeight: '800', color: theme.text, marginTop: 2 }}>
                    {servings}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Pressable
                    onPress={() => setServings(Math.max(1, servings - 1))}
                    style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', color: theme.text, fontSize: 16 }}>−</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setServings(servings + 1)}
                    style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', color: theme.text, fontSize: 16 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Macros card (só pra seeds que têm kcal) */}
        {showMacros && (
          <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
            <Card pad={16} radius={20}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <MacroRing
                  key={`recipe-ring-${replayKey}-${servings}`}
                  size={70}
                  stroke={8}
                  value={scaledKcal / 2200}
                  color={theme.primary}
                  inner={
                    <>
                      <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>
                        {scaledKcal}
                      </Text>
                      <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textMuted, marginTop: -2 }}>kcal</Text>
                    </>
                  }
                />
                <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                  {[
                    { k: 'P', v: scaledP, c: theme.proteinPink },
                    { k: 'C', v: scaledC, c: theme.carbsBlue },
                    { k: 'G', v: scaledF, c: theme.fatsGold },
                  ].map((m) => (
                    <View key={m.k} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>{m.v}g</Text>
                      <View style={{ width: 22, height: 3, backgroundColor: m.c, borderRadius: 2, marginVertical: 4 }} />
                      <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '600' }}>{m.k}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingVertical: 16 }}
        >
          {(
            [
              { id: 'ingredients', label: 'Ingredientes' },
              { id: 'steps', label: 'Modo de preparo' },
              { id: 'notes', label: 'Notas' },
            ] as { id: TabId; label: string }[]
          ).map((t) => (
            <Chip key={t.id} active={tab === t.id} onPress={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </ScrollView>

        {tab === 'ingredients' && (
          <View style={{ paddingHorizontal: 16 }}>
            {view.ingredients.length === 0 ? (
              <Card pad={18} radius={16}>
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
                  Nenhum ingrediente extraído.
                </Text>
              </Card>
            ) : (
              <>
                {/* Header com contadores + ação rápida */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 4,
                    paddingBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.primaryDeep }}>
                      {inPantryCount} na despensa
                    </Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>·</Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.text }}>
                      {inListCount} na lista
                    </Text>
                  </View>
                  <Pressable
                    onPress={addAllToList}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <Icon.cart size={14} color={theme.primaryDeep} stroke={2} />
                    <Text style={{ fontFamily: FONT.body, fontSize: 12, fontWeight: '700', color: theme.primaryDeep }}>
                      + à lista
                    </Text>
                  </Pressable>
                </View>

                {/* Lista de ingredientes */}
                <Card pad={0} radius={18}>
                  {view.ingredients.map((ing, i) => {
                    const status = ingredientStatus[i];
                    const inPantry = status === 'pantry';
                    const inList = status === 'list';
                    return (
                      <View
                        key={`${ing.name}-${i}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          borderBottomWidth: i < view.ingredients.length - 1 ? 1 : 0,
                          borderBottomColor: theme.border,
                        }}
                      >
                        {/* Checkbox pantry */}
                        <Pressable
                          onPress={() => setStatus(i, 'pantry')}
                          accessibilityLabel="Tenho na despensa"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 7,
                            borderWidth: 1.5,
                            borderColor: inPantry ? theme.primary : theme.borderStrong,
                            backgroundColor: inPantry ? theme.primary : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {inPantry && <Icon.check size={14} color="#fff" stroke={3} />}
                        </Pressable>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: FONT.body,
                              fontSize: 14,
                              fontWeight: '600',
                              color: theme.text,
                              textDecorationLine: inPantry ? 'line-through' : 'none',
                              opacity: inPantry ? 0.55 : 1,
                            }}
                          >
                            {ing.name}
                          </Text>
                          {inPantry && (
                            <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.primaryDeep, fontWeight: '700', marginTop: 1 }}>
                              Já tem na despensa
                            </Text>
                          )}
                          {inList && (
                            <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.text, fontWeight: '700', marginTop: 1 }}>
                              Na lista de compras
                            </Text>
                          )}
                          {!status && (
                            <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginTop: 1 }}>
                              Não marcado
                            </Text>
                          )}
                        </View>

                        <Text
                          style={{
                            fontFamily: FONT.head,
                            fontSize: 13,
                            fontWeight: '700',
                            color: theme.text,
                            opacity: inPantry ? 0.55 : 1,
                          }}
                        >
                          {ing.quantity}
                          {ing.unit ? ` ${ing.unit}` : ''}
                        </Text>

                        {/* Cart toggle */}
                        <Pressable
                          onPress={() => setStatus(i, 'list')}
                          accessibilityLabel="Adicionar à lista de compras"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: inList ? theme.text : theme.bgSubtle,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon.cart size={15} color={inList ? theme.bg : theme.textMuted} stroke={2} />
                        </Pressable>
                      </View>
                    );
                  })}
                </Card>

                {/* "Ver lista de compras" card — só quando tem items na lista */}
                {inListCount > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Pressable onPress={() => nav.navigate('ShoppingList')}>
                      <Card pad={14} radius={16} style={{ backgroundColor: theme.bgSubtle }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              backgroundColor: theme.text,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon.cart size={18} color={theme.bg} stroke={2} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, fontWeight: '800', color: theme.text }}>
                              Ver lista de compras
                            </Text>
                            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>
                              {inListCount} {inListCount === 1 ? 'item' : 'itens'} desta receita
                            </Text>
                          </View>
                          <Icon.forward size={16} color={theme.textMuted} />
                        </View>
                      </Card>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {tab === 'steps' && (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {view.steps.length === 0 ? (
              <Card pad={18} radius={16}>
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
                  Nenhum passo extraído.
                </Text>
              </Card>
            ) : (
              view.steps.map((s, i) => (
                <Card key={i} pad={14} radius={16}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: theme.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontFamily: FONT.headExtra, fontWeight: '800', fontSize: 13, color: theme.primaryDeep }}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 14, color: theme.text, lineHeight: 21 }}>
                      {s}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {tab === 'notes' && (
          <View style={{ paddingHorizontal: 16 }}>
            <Card pad={16} radius={16}>
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 19 }}>
                {view.kind === 'extracted' && view.sourceUrl
                  ? `Importada de: ${view.sourceUrl}`
                  : view.kind === 'saved'
                  ? `Salva em ${new Date(view.data.savedAt).toLocaleDateString('pt-BR')}${view.sourceUrl ? ` · de ${view.sourceUrl}` : ''}`
                  : 'Nenhuma nota.'}
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Sticky action — bottom */}
      <View style={{ position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', gap: 8 }}>
        {view.kind === 'extracted' && !savedJustNow ? (
          <Btn variant="primary" size="lg" icon={Icon.check} onPress={onSave} disabled={saving} full>
            {saving ? 'Salvando…' : 'Salvar receita'}
          </Btn>
        ) : (
          <Btn
            variant="primary"
            size="lg"
            icon={Icon.plus}
            onPress={() => Alert.alert('Em breve', 'Adicionar receita ao diário virá quando conectarmos refeições e receitas.')}
            full
          >
            Adicionar ao diário
          </Btn>
        )}
      </View>
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontFamily: FONT.headExtra, fontSize: 15, fontWeight: '800', color: theme.text, marginTop: 2 }}>{value}</Text>
    </View>
  );
};
