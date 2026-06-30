// Detalhe da receita — porte completo do RecipeDetailScreen em screens-recipes.jsx.
// Mostra: hero, título, macros, tabs (Ingredientes/Modo/Notas), com toggle de
// despensa/lista nos ingredientes e atalho pra Lista de Compras.
//
// Param pode ser { recipe } (seed), { saved } (do AsyncStorage) ou { extracted }
// (recém-extraída, ainda não salva).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FONT } from '../theme';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { SheetModal } from '../components/motion';
import { Chip } from '../components/Chip';
import { Icon, type IconName } from '../components/Icons';
import { FoodImg } from '../components/FoodImg';
import { MacroRing } from '../components/MacroRing';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import { useFocusReplay } from '../utils/useFocusReplay';
import { newRecipeId, type SavedRecipe } from '../storage/recipes';
import { categorize } from '../storage/shoppingList';
import { estimateRecipeMacros, parseToGrams } from '../utils/recipeMacros';
import { SEED_RECIPES_BY_ID } from '../data/seedRecipes';
import { generateRecipeImage } from '../api/client';
import type { Ingredient, ExtractedRecipe, MealCategory } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'RecipeDetail'>;
type Rt = RouteProp<RootStackParamList, 'RecipeDetail'>;

type TabId = 'ingredients' | 'steps' | 'notes';
type IngredientStatus = 'pantry' | 'list' | null;

// Fallback pra receitas seed legadas que não estejam em SEED_RECIPES_BY_ID.
// As 262 receitas curadas têm ingredientes/passos próprios (lookup em SEED_RECIPES_BY_ID).
const FALLBACK_INGREDIENTS: Ingredient[] = [];
const FALLBACK_STEPS: string[] = [];

export const RecipeDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<Rt>();
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const replayKey = useFocusReplay();
  const {
    addSavedRecipe,
    removeSavedRecipe,
    shoppingList,
    upsertShoppingItem,
    removeShoppingItem,
    foodDB,
    displayedMeals,
    addToMeal,
  } = useApp();
  const toast = useToast();
  const params = route.params ?? {};

  // Normaliza pra uma representação única
  const view = useMemo(() => {
    if (params.recipe) {
      // Tenta lookup nos dados curados (262 receitas dos PDFs).
      // Se a receita seed não estiver lá, usa o fallback vazio.
      const detailed = SEED_RECIPES_BY_ID[params.recipe.id];
      return {
        kind: 'seed' as const,
        title: params.recipe.name,
        q: params.recipe.q,
        time: params.recipe.time,
        baseServings: params.recipe.servings || 2,
        kcal: params.recipe.kcal,
        ingredients: detailed?.ingredients || FALLBACK_INGREDIENTS,
        steps: detailed?.steps || FALLBACK_STEPS,
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
        // Prefere imageQuery gerada pela Lu; cai pro title se não houver
        q: params.saved.imageQuery || params.saved.title,
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
        q: params.extracted.imageQuery || params.extracted.title,
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
  // Porções que a PESSOA vai comer — sempre inicia em 1, independente de
  // quantas pessoas a receita serve (view.baseServings é só o divisor dos
  // macros). Semântica corrigida em 2026-06-10: antes o stepper iniciava em
  // baseServings e MULTIPLICAVA o total, inflando os macros importados.
  const [servings, setServings] = useState<number>(1);
  // Marca local "despensa" — não persiste globalmente.
  // (Pantry global por nome seria outra feature; aqui é só a UX da receita.)
  const [localPantry, setLocalPantry] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [mealPickerOpen, setMealPickerOpen] = useState(false);
  // ─── Foto da receita (Feature #1) ──────────────────────────────
  // photo.changed=false → usa a imagem original (view.imageDataUrl).
  // true → usa photo.value (string = foto escolhida/gerada; null = removida,
  // cai pro Unsplash). genMode/genPreview controlam o fluxo de geração por IA.
  const [photo, setPhoto] = useState<{ changed: boolean; value: string | null }>({ changed: false, value: null });
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [genMode, setGenMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genPreview, setGenPreview] = useState<string | null>(null);
  // Aberta SEMPRE no Salvar de extracted. User decide em quais categorias
  // a receita vai (multi-select). Pode pular pra salvar sem categoria.
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  // Categorias marcadas no picker. Pré-marcadas com a sugestão da IA ou
  // do inferCategory(title) quando abre.
  const [pickerSelected, setPickerSelected] = useState<MealCategory[]>([]);
  // Notas livres do usuário — só editável em receitas saved (já persistidas).
  // Pra extracted: ainda sem id estável, então campo só ativa depois de salvar.
  const initialNotes = view?.kind === 'saved' ? (view.data.userNotes ?? '') : '';
  const [userNotes, setUserNotes] = useState(initialNotes);
  const notesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persistência debounced das notas — só pra receitas saved.
  useEffect(() => {
    if (view?.kind !== 'saved') return;
    if (userNotes === (view.data.userNotes ?? '')) return; // sem mudança
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(async () => {
      try {
        const updated: SavedRecipe = { ...view.data, userNotes };
        await addSavedRecipe(updated); // upsert pelo id
      } catch (err) {
        console.warn('[recipe] falha ao salvar notas:', err);
      }
    }, 600);
    return () => {
      if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userNotes]);

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

  // Quantas pessoas a receita serve (divisor dos macros estimados). A IA
  // extrai isso do post; o backend já aplica sanity check (reconcileServings).
  const recipeServes = Math.max(1, view.baseServings);
  // Macros exibidos = POR PORÇÃO × porções que o user vai comer.
  // Seeds já têm kcal por porção no design (scale = servings direto);
  // saved/extracted têm o TOTAL estimado dos ingredientes (÷ recipeServes).
  const scale = view.kind === 'seed' ? servings : servings / recipeServes;
  // Pra seeds: usa kcal do recipe + macros placeholder fixos do design.
  // Pra saved/extracted: estima via foodDB.
  const estimated = useMemo(
    () => (view.kind === 'seed' ? null : estimateRecipeMacros(view.ingredients, foodDB)),
    [view.kind, view.ingredients, foodDB],
  );
  const baseKcal = view.kind === 'seed' ? view.kcal : estimated?.kcal ?? 0;
  const baseP = view.kind === 'seed' ? 38 : estimated?.p ?? 0;
  const baseC = view.kind === 'seed' ? 45 : estimated?.c ?? 0;
  const baseF = view.kind === 'seed' ? 12 : estimated?.f ?? 0;
  const scaledKcal = Math.round(baseKcal * scale);
  const scaledP = Math.round(baseP * scale);
  const scaledC = Math.round(baseC * scale);
  const scaledF = Math.round(baseF * scale);
  // Mostra card de macros se temos dados. Pra estimativa, exige match >= 30% pra não exibir lixo.
  const showMacros = baseKcal > 0 && (view.kind === 'seed' || (estimated && estimated.matchRatio >= 0.3));
  const isEstimate = view.kind !== 'seed' && showMacros;

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

  const onSave = () => {
    if (view.kind !== 'extracted') return;
    // SEMPRE abre o picker — usuário decide as categorias. A IA fica apenas
    // como pré-marcação no checkbox correspondente (hint, não decisão).
    const aiHint = view.data.mealCategory;
    setPickerSelected(aiHint && aiHint !== 'unknown' ? [aiHint] : []);
    setCategoryPickerOpen(true);
  };

  const togglePickerCategory = (cat: MealCategory) => {
    setPickerSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const saveWithCategories = async (categories: MealCategory[]) => {
    if (view.kind !== 'extracted') return;
    setSaving(true);
    setCategoryPickerOpen(false);
    try {
      // Foto final: a escolhida/gerada (se o usuário trocou) ou a original.
      const finalImage = photo.changed ? photo.value ?? undefined : view.data.imageDataUrl;
      const saved: SavedRecipe = {
        ...view.data,
        mealCategories: categories,
        id: newRecipeId(),
        savedAt: Date.now(),
        source: view.data.sourceUrl ? 'url' : finalImage ? 'image' : 'manual',
        imageDataUrl: finalImage,
        sourceUrl: view.data.sourceUrl,
      };
      await addSavedRecipe(saved);
      setSavedJustNow(true);
      toast(
        categories.length === 0
          ? 'Receita salva sem categoria'
          : categories.length === 1
            ? 'Receita salva'
            : `Receita salva em ${categories.length} categorias`,
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar receita', 'error');
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
          toast('Receita removida');
          nav.goBack();
        },
      },
    ]);
  };

  // ─── Foto: derivados + handlers (Feature #1) ────────────────────
  // Só receitas saved/extracted podem trocar foto (seed é curada/read-only).
  const canChangePhoto = view.kind === 'saved' || view.kind === 'extracted';
  const imageQueryForGen = canChangePhoto ? view.data.imageQuery : undefined;
  const heroImage = photo.changed ? photo.value : view.imageDataUrl;

  // Aplica a foto escolhida/gerada/removida. Em receita já salva, persiste na
  // hora (upsert pelo id); em extracted, fica no estado e entra no Salvar.
  const applyPhoto = async (value: string | null) => {
    setPhoto({ changed: true, value });
    setPhotoSheetOpen(false);
    setGenMode(false);
    setGenPreview(null);
    if (view.kind === 'saved') {
      try {
        await addSavedRecipe({ ...view.data, imageDataUrl: value ?? undefined });
        toast(value ? 'Foto atualizada' : 'Foto removida');
      } catch {
        toast('Erro ao salvar foto', 'error');
      }
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast('Permissão da galeria negada', 'error'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', quality: 0.5, allowsEditing: true, aspect: [4, 3], base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    await applyPhoto(`data:image/jpeg;base64,${res.assets[0].base64}`);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { toast('Permissão da câmera negada', 'error'); return; }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images', quality: 0.5, allowsEditing: true, aspect: [4, 3], base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    await applyPhoto(`data:image/jpeg;base64,${res.assets[0].base64}`);
  };

  // Chama o backend pra gerar a foto. Reusável pelo "Gerar novamente".
  const runGenerate = async () => {
    setGenerating(true);
    setGenPreview(null);
    try {
      const { image } = await generateRecipeImage({
        title: view.title,
        imageQuery: imageQueryForGen,
        ingredients: view.ingredients.map((i) => i.name).slice(0, 6),
      });
      setGenPreview(image);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao gerar imagem', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const openPhotoSheet = () => { setGenMode(false); setGenPreview(null); setPhotoSheetOpen(true); };
  const startGenerate = () => { setGenMode(true); runGenerate(); };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Hero */}
        <View style={{ position: 'relative', height: 260 }}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
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
              <Pressable
                onPress={() => nav.navigate('ChatLu')}
                accessibilityLabel="Perguntar à Lu sobre esta receita"
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon.sparkle size={16} color={theme.primaryDeep} stroke={2} />
              </Pressable>
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
          {canChangePhoto && (
            <Pressable
              onPress={openPhotoSheet}
              accessibilityLabel="Alterar foto da receita"
              style={{
                position: 'absolute',
                bottom: 44,
                right: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(0,0,0,0.55)',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 100,
              }}
            >
              <Icon.camera size={14} color="#fff" stroke={2} />
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 12, fontWeight: '700', color: '#fff' }}>Alterar foto</Text>
            </Pressable>
          )}
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

        {/* Macros card — seeds usam valores do design; saved/extracted usam estimativa via foodDB */}
        {showMacros && (
          <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
            <Card pad={16} radius={20}>
              {isEstimate && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Estimativa de {servings} {servings === 1 ? 'porção' : 'porções'} · {estimated?.matchedCount}/{estimated?.totalCount} ingr.
                  </Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, marginTop: 2 }}>
                    Total da receita: ~{Math.round((estimated?.kcal ?? 0))} kcal
                  </Text>
                  {recipeServes > 1 && (
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.warningDeep, marginTop: 4, lineHeight: 14 }}>
                      🍽 Esta receita serve ~{recipeServes} pessoas — os macros mostrados são de {servings} {servings === 1 ? 'porção' : 'porções'}.
                    </Text>
                  )}
                  {scaledKcal > 1500 && (
                    <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.warningDeep, marginTop: 4, lineHeight: 14 }}>
                      ⚠ Valor por porção parece alto — confira os ingredientes antes de adicionar ao diário.
                    </Text>
                  )}
                </View>
              )}
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
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {/* Campo livre de notas — editável apenas em saved (pra ter id pra persistir). */}
            {view.kind === 'saved' ? (
              <Card pad={14} radius={16}>
                <TextInput
                  value={userNotes}
                  onChangeText={setUserNotes}
                  placeholder="Escreva suas observações: dicas, ajustes, variações…"
                  placeholderTextColor={theme.textFaint}
                  multiline
                  textAlignVertical="top"
                  style={{
                    minHeight: 140,
                    fontFamily: FONT.body,
                    fontSize: 14,
                    color: theme.text,
                    lineHeight: 21,
                  }}
                />
                {userNotes.trim().length > 0 && (
                  <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, marginTop: 6, textAlign: 'right' }}>
                    {userNotes.trim().length} caractere{userNotes.trim().length === 1 ? '' : 's'} · salvo automaticamente
                  </Text>
                )}
              </Card>
            ) : (
              <Card pad={16} radius={16}>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                  {view.kind === 'extracted'
                    ? 'Salve a receita pra poder escrever notas.'
                    : 'As notas viram quando você importar suas próprias receitas.'}
                </Text>
              </Card>
            )}

            {/* Metadata discreta no rodapé (não dentro do campo de notas) */}
            {(view.kind === 'saved' || view.kind === 'extracted') && view.sourceUrl && (
              <View style={{ paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon.link size={12} color={theme.textFaint} stroke={2} />
                <Text style={{ flex: 1, fontFamily: FONT.body, fontSize: 11, color: theme.textFaint }} numberOfLines={1}>
                  Importada de {view.sourceUrl}
                </Text>
              </View>
            )}
            {view.kind === 'saved' && (
              <View style={{ paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon.clock size={12} color={theme.textFaint} stroke={2} />
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint }}>
                  Salva em {new Date(view.data.savedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky action — bottom */}
      <View style={{ position: 'absolute', bottom: Math.max(24, insets.bottom + 12), left: 16, right: 16, flexDirection: 'row', gap: 8 }}>
        {view.kind === 'extracted' && !savedJustNow ? (
          <Btn variant="primary" size="lg" icon={Icon.check} onPress={onSave} disabled={saving} full>
            {saving ? 'Salvando…' : 'Salvar receita'}
          </Btn>
        ) : (
          <Btn
            variant="primary"
            size="lg"
            icon={Icon.plus}
            onPress={() => {
              if (scaledKcal === 0) {
                Alert.alert('Sem cálculo de macros', 'Não consegui estimar a nutrição dessa receita. Marque mais ingredientes ou edite os campos antes de adicionar ao diário.');
                return;
              }
              setMealPickerOpen(true);
            }}
            full
          >
            Adicionar ao diário
          </Btn>
        )}
      </View>

      {/* Bottom-sheet: escolha da refeição pra adicionar a receita */}
      <SheetModal
        visible={mealPickerOpen}
        onClose={() => setMealPickerOpen(false)}
        sheetStyle={{
          backgroundColor: theme.bg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 32,
          gap: 12,
        }}
      >
            <View style={{ alignItems: 'center', paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center' }}>
              Adicionar a qual refeição?
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', marginBottom: 4 }}>
              {`${servings} ${servings === 1 ? 'porção' : 'porções'} · ${scaledKcal} kcal`}
              {isEstimate ? ' · estimativa' : ''}
            </Text>
            {displayedMeals.map((meal) => (
              <Pressable
                key={meal.id}
                onPress={async () => {
                  // Calcula portion em gramas somando ingredientes (×scale).
                  // Fallback 100g se a soma der 0.
                  const totalGrams = Math.max(
                    1,
                    Math.round(view.ingredients.reduce((s, ing) => s + parseToGrams(ing.quantity, ing.unit), 0) * scale),
                  );
                  const itemName = `${view.title}${servings > 1 ? ` · ${servings} porç.` : ''}`;
                  // Fecha o sheet ANTES do addToMeal: em dia passado/futuro ele
                  // abre Alert de confirmação, que não pode disputar foco com o
                  // Modal. Toast só depois do user confirmar.
                  setMealPickerOpen(false);
                  const ok = await addToMeal(
                    meal.id,
                    [{ name: itemName, portion: `${totalGrams}g`, amount: 1, kcal: scaledKcal, p: scaledP, c: scaledC, f: scaledF }],
                    { kcal: scaledKcal, p: scaledP, c: scaledC, f: scaledF },
                  );
                  if (!ok) return;
                  toast(`Adicionada a ${meal.name} · ${scaledKcal} kcal`);
                }}
                style={{
                  backgroundColor: theme.bgElev,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: meal.color || theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.drumstick size={18} color={theme.text} stroke={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 15, fontWeight: '700', color: theme.text }}>{meal.name}</Text>
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                    {meal.time} · {meal.items.length} {meal.items.length === 1 ? 'item' : 'itens'} · {meal.kcal} kcal
                  </Text>
                </View>
                <Icon.forward size={18} color={theme.textMuted} stroke={2} />
              </Pressable>
            ))}
            <Pressable onPress={() => setMealPickerOpen(false)} style={{ padding: 12, alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '600', color: theme.textMuted }}>Cancelar</Text>
            </Pressable>
      </SheetModal>

      {/* Picker de categorias — sempre abre ao Salvar. Multi-select. */}
      <SheetModal
        visible={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        sheetStyle={{
          backgroundColor: theme.bg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: Math.max(24, insets.bottom + 16),
          gap: 10,
        }}
      >
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Em quais categorias salvar?
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 18, marginBottom: 4 }}>
              Pode marcar mais de uma — a receita aparece em todas. Algumas combinam (panqueca de banana → Café + Sobremesa).
            </Text>
            {([
              { k: 'breakfast', label: 'Café da manhã' },
              { k: 'lunch', label: 'Almoço' },
              { k: 'dinner', label: 'Jantar' },
              { k: 'snack', label: 'Lanche' },
              { k: 'dessert', label: 'Sobremesa' },
            ] as { k: MealCategory; label: string }[]).map((opt) => {
              const checked = pickerSelected.includes(opt.k);
              return (
                <Pressable
                  key={opt.k}
                  onPress={() => togglePickerCategory(opt.k)}
                  style={{
                    backgroundColor: checked ? theme.primarySoft : theme.bgElev,
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderWidth: 1.5,
                    borderColor: checked ? theme.primary : 'transparent',
                  }}
                >
                  {/* Checkbox visual */}
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: checked ? theme.primary : theme.borderStrong,
                      backgroundColor: checked ? theme.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {checked && <Icon.check size={14} color={theme.bg} stroke={3} />}
                  </View>
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text, flex: 1 }}>{opt.label}</Text>
                </Pressable>
              );
            })}
            {/* Botão Confirmar */}
            <View style={{ marginTop: 8 }}>
              <Btn
                variant="primary"
                size="lg"
                icon={Icon.check}
                full
                disabled={saving}
                onPress={() => saveWithCategories(pickerSelected)}
              >
                {pickerSelected.length === 0
                  ? 'Salvar sem categoria'
                  : pickerSelected.length === 1
                    ? 'Salvar em 1 categoria'
                    : `Salvar em ${pickerSelected.length} categorias`}
              </Btn>
            </View>
            <Pressable onPress={() => setCategoryPickerOpen(false)} style={{ padding: 8, alignItems: 'center' }}>
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '600', color: theme.textMuted }}>Cancelar</Text>
            </Pressable>
      </SheetModal>

      {/* Bottom-sheet: trocar/gerar foto da receita (Feature #1) */}
      <SheetModal
        visible={photoSheetOpen}
        onClose={() => { setPhotoSheetOpen(false); setGenMode(false); setGenPreview(null); }}
        sheetStyle={{
          backgroundColor: theme.bg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: Math.max(24, insets.bottom + 16),
          gap: 10,
        }}
      >
        <View style={{ alignItems: 'center', paddingBottom: 6 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
        </View>

        {genMode ? (
          <>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text, textAlign: 'center' }}>
              Foto gerada pela Lu
            </Text>
            <View
              style={{
                height: 220,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: theme.bgSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              {generating ? (
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Lu está pintando seu prato… 🎨</Text>
                </View>
              ) : genPreview ? (
                <Image source={{ uri: genPreview }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Sem imagem ainda</Text>
              )}
            </View>
            {!generating && genPreview && (
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, textAlign: 'center' }}>
                Não ficou boa? Gere novamente até acertar.
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="secondary" size="md" icon={Icon.sparkle} onPress={runGenerate} disabled={generating} full>
                  {generating ? 'Gerando…' : 'Gerar novamente'}
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn
                  variant="primary"
                  size="md"
                  icon={Icon.check}
                  onPress={() => genPreview && applyPhoto(genPreview)}
                  disabled={generating || !genPreview}
                  full
                >
                  Usar esta
                </Btn>
              </View>
            </View>
            <Pressable onPress={() => { setGenMode(false); setGenPreview(null); }} style={{ padding: 10, alignItems: 'center' }}>
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '600', color: theme.textMuted }}>Voltar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Foto da receita
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 18, marginBottom: 4 }}>
              Use uma foto sua ou peça pra Lu gerar uma com IA.
            </Text>
            {([
              { icon: 'gallery', label: 'Escolher da galeria', sub: 'Uma foto do seu celular', onPress: pickFromLibrary },
              { icon: 'camera', label: 'Tirar foto', sub: 'Abrir a câmera agora', onPress: pickFromCamera },
              { icon: 'sparkle', label: 'Gerar com a Lu (IA)', sub: 'A IA cria uma foto da receita', onPress: startGenerate },
            ] as { icon: IconName; label: string; sub: string; onPress: () => void }[]).map((opt) => {
              const IconC = Icon[opt.icon];
              return (
                <Pressable
                  key={opt.label}
                  onPress={opt.onPress}
                  style={{
                    backgroundColor: theme.bgElev,
                    borderRadius: 14,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <IconC size={18} color={theme.primaryDeep} stroke={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.bodyBold, fontSize: 14, fontWeight: '700', color: theme.text }}>{opt.label}</Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{opt.sub}</Text>
                  </View>
                  <Icon.forward size={16} color={theme.textMuted} />
                </Pressable>
              );
            })}
            {heroImage && (
              <Pressable onPress={() => applyPhoto(null)} style={{ padding: 12, alignItems: 'center', marginTop: 2 }}>
                <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '600', color: theme.proteinPink }}>Remover foto (usar padrão)</Text>
              </Pressable>
            )}
          </>
        )}
      </SheetModal>
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
