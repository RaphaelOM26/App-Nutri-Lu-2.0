// Tela "Receitas" (Tab 4) — porte do RecipesScreen em screens-recipes.jsx.
// Tabs: Minhas (grid) | Descobrir | Coleções | Despensa.

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
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
import { useToast } from '../state/ToastContext';
import { MarkdownText } from '../components/MarkdownText';
import { chatWithLu, ApiError, type ChatMessage } from '../api/client';
import { LU_COLLECTIONS, getCoverUrl, type LuCollection } from '../data/luCollections';
import type { RootStackParamList } from '../navigation/types';
import type { SavedRecipe } from '../storage/recipes';
import type { RecipeCollection } from '../storage/collections';
import { daysUntilExpiry, type PantryItem } from '../storage/pantry';
import { categorize } from '../storage/shoppingList';
import {
  estimateRecipeMacros,
  pickRecipesForRemainingMacros,
  mealContextFromHour,
  type RecipeFitCandidate,
} from '../utils/recipeMacros';
import { SEED_RECIPES } from '../data/seedRecipes';
import type { Recipe, Food } from '../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'mine' | 'discover' | 'collections' | 'pantry';
type FilterKey = 'all' | 'favorites' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
type SortMode = 'recent' | 'alpha';

// Mapeia tag em pt-BR (Recipe.tag) → categoria interna
const TAG_TO_FILTER: Record<string, FilterKey> = {
  'Café': 'breakfast',
  'Almoço': 'lunch',
  'Jantar': 'dinner',
  'Lanche': 'snack',
  'Sobremesa': 'dessert',
};

export const RecipesScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>('mine');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const searchRef = useRef<TextInput>(null);
  const { recipes, savedRecipes, foodDB, favoriteRecipeIds, toggleFavoriteRecipe, addRecentRecipe, removeSavedRecipe } = useApp();
  const toast = useToast();

  const tabs: { id: TabKey; label: string }[] = [
    { id: 'mine', label: 'Minhas' },
    { id: 'discover', label: 'Descobrir' },
    { id: 'collections', label: 'Coleções' },
    { id: 'pantry', label: 'Despensa' },
  ];

  const onToggleSearch = () => {
    if (searching) {
      setSearching(false);
      setQuery('');
    } else {
      setSearching(true);
      // foca após render
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  };

  const onToggleFavorite = (id: string, title: string) => {
    const wasFav = favoriteRecipeIds.includes(id);
    toggleFavoriteRecipe(id);
    toast(wasFav ? `Removida dos favoritos · ${title}` : `Adicionada aos favoritos · ${title}`);
  };

  const openRecipe = (id: string, navParam: { recipe?: Recipe; saved?: SavedRecipe }) => {
    addRecentRecipe(id);
    nav.navigate('RecipeDetail', navParam);
  };

  const onDeleteSaved = (r: SavedRecipe) => {
    Alert.alert('Excluir receita?', `"${r.title}" será removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await removeSavedRecipe(r.id);
          toast('Receita removida');
        },
      },
    ]);
  };

  const onClearFavorites = () => {
    if (favoriteRecipeIds.length === 0) {
      toast('Você não tem favoritas');
      return;
    }
    Alert.alert(
      'Limpar favoritas?',
      `${favoriteRecipeIds.length} ${favoriteRecipeIds.length === 1 ? 'receita será removida' : 'receitas serão removidas'} da lista de favoritas (as receitas continuam).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            favoriteRecipeIds.forEach((id) => toggleFavoriteRecipe(id));
            toast('Favoritas limpas');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Receitas"
        large
        right={[
          <LuBtn key="lu" onPress={() => nav.navigate('ChatLu')} />,
          <IconBtn key="s" icon={searching ? Icon.close : Icon.search} onPress={onToggleSearch} />,
          <IconBtn key="m" icon={Icon.more} onPress={() => setMenuOpen(true)} />,
          <IconBtn key="add" icon={Icon.plus} variant="filled" onPress={() => nav.navigate('ImportRecipe')} />,
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

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 14 }}>
          {tabs.map((t) => (
            <Chip key={t.id} active={tab === t.id} onPress={() => setTab(t.id)}>
              {t.label}
            </Chip>
          ))}
        </ScrollView>

        {tab === 'mine' && (
          <MyRecipes
            filter={filter}
            setFilter={setFilter}
            savedRecipes={savedRecipes}
            foodDB={foodDB}
            query={query.trim().toLowerCase()}
            sortMode={sortMode}
            favoriteIds={favoriteRecipeIds}
            onToggleFavorite={onToggleFavorite}
            onOpen={openRecipe}
            onDeleteSaved={onDeleteSaved}
            onImport={() => nav.navigate('ImportRecipe')}
          />
        )}
        {tab === 'discover' && (
          <DiscoverRecipes
            recipes={recipes}
            favoriteIds={favoriteRecipeIds}
            onOpen={openRecipe}
            onOpenLuChat={() => nav.navigate('ChatLu')}
            onOpenLuRecipes={(collectionId) => nav.navigate('LuRecipes', collectionId ? { collectionId } : {})}
          />
        )}
        {tab === 'collections' && <CollectionsView onOpen={openRecipe} />}
        {tab === 'pantry' && <PantryView nav={nav} />}
      </ScrollView>

      {/* Menu ⋮ — opções rápidas da tela Receitas */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable onPress={() => setMenuOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 28, gap: 4 }}>
            <View style={{ alignItems: 'center', paddingBottom: 6 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <MenuItem
              icon={Icon.filter}
              title={sortMode === 'alpha' ? 'Voltar a recentes primeiro' : 'Ordenar A-Z'}
              subtitle={sortMode === 'alpha' ? 'Atual: alfabética' : 'Atual: ordem de adição'}
              onPress={() => { setSortMode((m) => (m === 'alpha' ? 'recent' : 'alpha')); setMenuOpen(false); }}
            />
            <MenuItem
              icon={Icon.heart}
              title="Limpar favoritas"
              subtitle={`${favoriteRecipeIds.length} ${favoriteRecipeIds.length === 1 ? 'receita' : 'receitas'} marcadas`}
              onPress={() => { setMenuOpen(false); onClearFavorites(); }}
            />
            <MenuItem
              icon={Icon.send}
              title="Exportar receitas"
              subtitle="PDF com as receitas salvas (em breve)"
              onPress={() => { setMenuOpen(false); toast('Em breve'); }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Modal: sugestão da Lu (receita real + explicação) ─────────
type LuModalProps = {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  candidate: RecipeFitCandidate | null;
  explanation: string | null;
  remaining: { kcal: number; p: number; c: number; f: number };
  noCandidates: boolean;
  onRetry: () => void;
  onOpenRecipe: () => void;
  onOpenChat: () => void;
};

const LuSuggestionModal: React.FC<LuModalProps> = ({
  visible,
  onClose,
  loading,
  candidate,
  explanation,
  remaining,
  noCandidates,
  onRetry,
  onOpenRecipe,
  onOpenChat,
}) => {
  const theme = useTheme();
  const per = candidate?.perServing;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.sparkle size={18} color={theme.primaryDeep} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>Sugestão da Lu</Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ gap: 14 }}>
            {/* Card visual da receita */}
            {candidate ? (
              <Pressable onPress={onOpenRecipe}>
                <Card pad={0} radius={18} style={{ overflow: 'hidden' }}>
                  <View style={{ position: 'relative' }}>
                    <FoodImg q={candidate.recipe.q} w="100%" h={150} style={{ borderRadius: 0 }} />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
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
                      <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '700', color: '#fff' }}>
                        {candidate.recipe.time}
                      </Text>
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: theme.primaryDeep,
                        paddingVertical: 3,
                        paddingHorizontal: 8,
                        borderRadius: 100,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Icon.sparkle size={10} color="#fff" stroke={2} />
                      <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.4 }}>
                        ENCAIXA NO DIA
                      </Text>
                    </View>
                  </View>
                  <View style={{ padding: 14, gap: 8 }}>
                    <Text style={{ fontFamily: FONT.head, fontSize: 16, fontWeight: '800', color: theme.text }} numberOfLines={2}>
                      {candidate.recipe.name}
                    </Text>
                    {per && (
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        <MacroPill label={`${per.kcal} kcal`} color={theme.text} bg={theme.bgSubtle} />
                        <MacroPill label={`P ${per.p}g`} color={theme.proteinPink} bg="#FBE9EC" />
                        <MacroPill label={`C ${per.c}g`} color="#B07A1E" bg="#F8ECD7" />
                        <MacroPill label={`G ${per.f}g`} color="#5C8C5A" bg="#E6F0E4" />
                      </View>
                    )}
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint }}>
                      por porção · {candidate.recipe.tag}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            ) : noCandidates ? (
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, padding: 20, textAlign: 'center' }}>
                Não achei receita que encaixasse bem nos macros restantes. Tente conversar com a Lu pra outras ideias.
              </Text>
            ) : null}

            {/* Explicação da Lu */}
            {candidate && (
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon.sparkle size={12} color={theme.primaryDeep} stroke={2} />
                  <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Por que essa receita
                  </Text>
                </View>
                {loading ? (
                  <View style={{ paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted }}>Lu está pensando…</Text>
                  </View>
                ) : explanation ? (
                  <MarkdownText style={{ fontFamily: FONT.body, fontSize: 14, color: theme.text, lineHeight: 20 }}>
                    {explanation}
                  </MarkdownText>
                ) : (
                  <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted }}>
                    Encaixa bem nos {remaining.kcal} kcal restantes ({remaining.p}g de proteína).
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {candidate ? (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Btn variant="outline" size="md" icon={Icon.sparkle} onPress={onRetry} disabled={loading} full>
                    Outra ideia
                  </Btn>
                </View>
                <View style={{ flex: 1 }}>
                  <Btn variant="primary" size="md" icon={Icon.send} onPress={onOpenRecipe} full>
                    Ver receita
                  </Btn>
                </View>
              </View>
              <Pressable onPress={onOpenChat} style={{ alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '700' }}>
                  Conversar com Lu →
                </Text>
              </Pressable>
            </View>
          ) : (
            <Btn variant="primary" size="md" icon={Icon.send} onPress={onOpenChat} full>
              Conversar com Lu
            </Btn>
          )}
        </View>
      </View>
    </Modal>
  );
};

const MacroPill: React.FC<{ label: string; color: string; bg: string }> = ({ label, color, bg }) => (
  <View style={{ backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100 }}>
    <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color }}>{label}</Text>
  </View>
);

const MenuItem: React.FC<{ icon: React.FC<{ size?: number; color?: string; stroke?: number }>; title: string; subtitle: string; onPress: () => void }> = ({ icon: IconC, title, subtitle, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
        <IconC size={18} color={theme.text} stroke={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>{title}</Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{subtitle}</Text>
      </View>
    </Pressable>
  );
};

// ─── Sub-componentes ────────────────────────────────────────────

type MyRecipesProps = {
  filter: FilterKey;
  setFilter: (k: FilterKey) => void;
  savedRecipes: SavedRecipe[];
  foodDB: Food[];
  query: string;
  sortMode: SortMode;
  favoriteIds: string[];
  onToggleFavorite: (id: string, title: string) => void;
  onOpen: (id: string, navParam: { recipe?: Recipe; saved?: SavedRecipe }) => void;
  onDeleteSaved: (r: SavedRecipe) => void;
  onImport: () => void;
};

// Infere categoria pelo título de uma receita importada (SavedRecipe não tem
// campo `category` ainda). Mesmo padrão usado em mealsConfig.pickMealImageForName.
function inferCategory(title: string): Exclude<FilterKey, 'all' | 'favorites'> | null {
  const lower = title.toLowerCase();
  if (/(café\s+da\s+manh[ãa]|caf[ée]\s+manh|breakfast|tapioca|panqueca|crepioca|smoothie|vitamina|iogurte|granola|aveia|overnight|omelete|frittata|ovos\s+mexidos)/i.test(lower))
    return 'breakfast';
  if (/(sobremesa|bolo|pudim|mousse|brownie|cookie|biscoito|sequilho|cheesecake|gateau|brigadeiro|beijinho|sorvete|picol|doce|trufa)/i.test(lower))
    return 'dessert';
  if (/(jantar|sopa|caldo|noite|fim\s+de\s+dia)/i.test(lower))
    return 'dinner';
  if (/(lanche|merenda|snack|wrap|sandu|tosta|salgadinho|petisco|coxinha|pastel|empad|esfiha|quibe)/i.test(lower))
    return 'snack';
  if (/(almoço|almoco|lunch|prato|risoto|massa|macarr|lasanha|estrogonofe|strogonoff|parmegiana|frango\s+(grelhado|assado|com)|filé|file|salm|peixe|carne|costela|picanha|salada\s+principal)/i.test(lower))
    return 'lunch';
  return null;
}

const MyRecipes: React.FC<MyRecipesProps> = ({ filter, setFilter, savedRecipes, foodDB, query, sortMode, favoriteIds, onToggleFavorite, onOpen, onDeleteSaved, onImport }) => {
  const theme = useTheme();
  // "Todas" é o default — ativo quando nenhum outro filtro está selecionado.
  // Garante caminho discoverable pra voltar pra view sem filtro (sem precisar
  // saber que clicar no chip ativo desmarca).
  const filters: { k: FilterKey; label: string }[] = [
    { k: 'all', label: 'Todas' },
    { k: 'favorites', label: 'Favoritas' },
    { k: 'breakfast', label: 'Café' },
    { k: 'lunch', label: 'Almoço' },
    { k: 'dinner', label: 'Jantar' },
    { k: 'snack', label: 'Lanche' },
    { k: 'dessert', label: 'Sobremesa' },
  ];

  // Aplica filter + query + sort APENAS em savedRecipes (receitas importadas).
  // As 280 receitas seed das coleções da Lu vivem na tab Descobrir.
  const filteredSaved = useMemo(() => {
    const out = savedRecipes.filter((r) => {
      if (query && !r.title.toLowerCase().includes(query)) return false;
      if (filter === 'all') return true;
      if (filter === 'favorites') return favoriteIds.includes(r.id);
      // Prefere a categoria que a IA classificou (mealCategory) — fallback pra
      // heurística por título caso campo não exista (legacy SavedRecipes pré-fix).
      const cat =
        r.mealCategory && r.mealCategory !== 'unknown'
          ? r.mealCategory
          : inferCategory(r.title);
      return cat === filter;
    });
    return sortMode === 'alpha' ? [...out].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')) : out;
  }, [savedRecipes, filter, query, favoriteIds, sortMode]);

  const totalShown = filteredSaved.length;
  const hasAnyImported = savedRecipes.length > 0;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 14 }}>
        {filters.map((f) => (
          <Chip
            key={f.k}
            active={filter === f.k}
            onPress={() => setFilter(filter === f.k ? 'all' : f.k)}
          >
            {f.label}
          </Chip>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {filteredSaved.map((r) => (
          <SavedCard
            key={r.id}
            recipe={r}
            foodDB={foodDB}
            isFav={favoriteIds.includes(r.id)}
            onPress={() => onOpen(r.id, { saved: r })}
            onToggleFav={() => onToggleFavorite(r.id, r.title)}
            onLongPress={() => onDeleteSaved(r)}
          />
        ))}
        {totalShown === 0 && (
          <EmptyMyRecipes
            filter={filter}
            query={query}
            hasAnyImported={hasAnyImported}
            onImport={onImport}
          />
        )}
      </View>
    </View>
  );
};

// Empty state inteligente: muda o copy + CTA baseado no contexto.
const EmptyMyRecipes: React.FC<{
  filter: FilterKey;
  query: string;
  hasAnyImported: boolean;
  onImport: () => void;
}> = ({ filter, query, hasAnyImported, onImport }) => {
  const theme = useTheme();

  // Caso 1: busca sem resultado
  if (query) {
    return (
      <View style={{ width: '100%', padding: 32, alignItems: 'center', gap: 10 }}>
        <Icon.search size={28} color={theme.textMuted} stroke={1.5} />
        <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
          Nada encontrado
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', maxWidth: 280 }}>
          Não achei receita com "{query}". Tente outro nome ou explore as Coleções da Lu na aba Descobrir.
        </Text>
      </View>
    );
  }

  // Caso 2: não importou NENHUMA receita ainda → mensagem encorajadora + botão
  if (!hasAnyImported) {
    return (
      <View style={{ width: '100%', padding: 28, alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.sparkle size={32} color={theme.primaryDeep} stroke={1.5} />
        </View>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text, textAlign: 'center' }}>
          Você ainda não importou nenhuma receita
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center', maxWidth: 300, lineHeight: 19 }}>
          Importe suas receitas favoritas via foto, link de Instagram/TikTok/blog, ou crie do zero. Elas aparecem aqui pra você acessar e adicionar ao diário com 1 toque.
        </Text>
        <View style={{ marginTop: 6, flexDirection: 'row', gap: 8 }}>
          <Btn variant="primary" size="md" icon={Icon.plus} onPress={onImport}>
            Importar receita
          </Btn>
        </View>
        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, textAlign: 'center', marginTop: 6 }}>
          Dica: a aba Descobrir tem 280 receitas curadas pela Lu pra explorar.
        </Text>
      </View>
    );
  }

  // Caso 3: tem importadas, mas nada na categoria atual
  const filterLabel: Record<string, string> = {
    favorites: 'Favoritas',
    breakfast: 'Café da manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
    dessert: 'Sobremesa',
  };
  const label = filterLabel[filter] || 'nessa categoria';
  return (
    <View style={{ width: '100%', padding: 28, alignItems: 'center', gap: 12 }}>
      <Icon.sparkle size={28} color={theme.textMuted} stroke={1.5} />
      <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
        {filter === 'favorites' ? 'Nenhuma favorita ainda' : `Nenhuma receita em ${label}`}
      </Text>
      <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', maxWidth: 300, lineHeight: 18 }}>
        {filter === 'favorites'
          ? 'Toque no ❤ em qualquer receita pra adicionar aqui.'
          : `Suas receitas importadas com tema "${label}" aparecem aqui. Importe uma agora?`}
      </Text>
      {filter !== 'favorites' && (
        <View style={{ marginTop: 4 }}>
          <Btn variant="outline" size="md" icon={Icon.plus} onPress={onImport}>
            Importar receita
          </Btn>
        </View>
      )}
    </View>
  );
};

const cardWidth = '47%' as const; // 2-col grid com gap

type SavedCardProps = {
  recipe: SavedRecipe;
  foodDB: Food[];
  isFav: boolean;
  onPress: () => void;
  onToggleFav: () => void;
  onLongPress: () => void;
};

const SavedCard: React.FC<SavedCardProps> = ({ recipe, foodDB, isFav, onPress, onToggleFav, onLongPress }) => {
  const theme = useTheme();
  const time = recipe.time || '—';
  // Estimativa de macros via lookup no foodDB (memo por id pra não recalcular)
  const macros = useMemo(() => estimateRecipeMacros(recipe.ingredients, foodDB), [recipe.id, foodDB]);
  const hasMacros = macros.matchRatio >= 0.3 && macros.kcal > 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
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
          <FoodImg q={recipe.imageQuery || recipe.title} w="100%" h={120} style={{ borderRadius: 0 }} />
        )}
        <FavBadge isFav={isFav} onPress={onToggleFav} />
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
            {hasMacros ? `~${macros.kcal} kcal · ${recipe.ingredients.length} ingr.` : `${recipe.ingredients.length} ingredientes`}
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint }}>{recipe.servings || '—'} porç.</Text>
        </View>
      </View>
    </Pressable>
  );
};

type SeedCardProps = {
  recipe: Recipe;
  isFav: boolean;
  onPress: () => void;
  onToggleFav: () => void;
};

const SeedCard: React.FC<SeedCardProps> = ({ recipe, isFav, onPress, onToggleFav }) => {
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
        <FavBadge isFav={isFav} onPress={onToggleFav} />
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

const FavBadge: React.FC<{ isFav: boolean; onPress: () => void }> = ({ isFav, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={(e: any) => {
        e?.stopPropagation?.();
        onPress();
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
  );
};

type DiscoverProps = {
  recipes: Recipe[];
  favoriteIds: string[];
  onOpen: (id: string, navParam: { recipe?: Recipe; saved?: SavedRecipe }) => void;
  onOpenLuChat: () => void;
  /** Abre LuRecipesScreen — sem id = todas as curadas, com id = só daquela coleção */
  onOpenLuRecipes: (collectionId?: string) => void;
};

const DiscoverRecipes: React.FC<DiscoverProps> = ({ recipes, onOpen, onOpenLuChat, onOpenLuRecipes }) => {
  const theme = useTheme();
  const { displayedMacros, water, foodDB } = useApp();
  const toast = useToast();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [candidates, setCandidates] = useState<RecipeFitCandidate[]>([]);
  const [cursor, setCursor] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const explanationCache = useRef<Record<string, string>>({});

  const remaining = useMemo(() => ({
    kcal: Math.max(0, displayedMacros.kcal.target - displayedMacros.kcal.value),
    p: Math.max(0, displayedMacros.p.target - displayedMacros.p.value),
    c: Math.max(0, displayedMacros.c.target - displayedMacros.c.value),
    f: Math.max(0, displayedMacros.f.target - displayedMacros.f.value),
  }), [displayedMacros]);

  const fetchExplanation = async (cand: RecipeFitCandidate) => {
    const cacheKey = cand.recipe.id;
    if (explanationCache.current[cacheKey]) {
      setExplanation(explanationCache.current[cacheKey]);
      return;
    }
    setLoadingExplanation(true);
    setExplanation(null);
    try {
      const per = cand.perServing;
      const userMsg: ChatMessage = {
        role: 'user',
        text:
          `Pra fechar minha meta hoje me faltam ~${remaining.kcal} kcal (${remaining.p}g proteína, ${remaining.c}g carbo, ${remaining.f}g gordura).\n\n` +
          `Receita escolhida: **${cand.recipe.name}** — uma porção tem aproximadamente ${per.kcal} kcal, ${per.p}g de proteína, ${per.c}g de carbo e ${per.f}g de gordura.\n\n` +
          `Em 2-3 frases curtas, explique por que essa receita encaixa bem no que me falta hoje. Compare os números de forma direta (ex.: "supre Xg da proteína que falta"). Não invente ingredientes — só compare os macros. Sem listar a receita.`,
      };
      const { reply } = await chatWithLu([userMsg], { macros: displayedMacros, water });
      const txt = (reply || '').trim();
      if (txt) explanationCache.current[cacheKey] = txt;
      setExplanation(txt || null);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não consegui falar com a Lu agora.';
      toast(msg, 'error');
      setExplanation(null);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const askLuForSuggestion = () => {
    setSuggestOpen(true);
    // Contexto da refeição baseado no horário atual — evita sugerir bife às 9h
    // ou suco de 700 kcal como "lanche da tarde". Recalcula sempre que abre.
    const context = mealContextFromHour(new Date().getHours());
    const top = pickRecipesForRemainingMacros(SEED_RECIPES, remaining, foodDB, 6, context);
    setCandidates(top);
    setCursor(0);
    if (top.length > 0) {
      fetchExplanation(top[0]);
    } else {
      setExplanation(null);
    }
  };

  const cycleNext = () => {
    if (candidates.length < 2) return;
    const next = (cursor + 1) % candidates.length;
    setCursor(next);
    fetchExplanation(candidates[next]);
  };

  const currentCandidate = candidates[cursor] || null;

  const onOpenRecipeFromModal = () => {
    if (!currentCandidate) return;
    setSuggestOpen(false);
    // SeedRecipe é compatível com Recipe (mesmos campos base) + extras ignorados pelo nav.
    onOpen(currentCandidate.recipe.id, { recipe: currentCandidate.recipe as Recipe });
  };

  const remainingK = remaining.kcal;

  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
        <Pressable onPress={askLuForSuggestion}>
          <Card pad={0} radius={22} style={{ overflow: 'hidden' }}>
            <FoodImg q="bowl,protein,colorful" w="100%" h={160} style={{ borderRadius: 0 }} />
            <View style={{ padding: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon.sparkle size={12} color={theme.primaryDeep} stroke={2} />
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  Pergunte à Lu
                </Text>
              </View>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 6 }}>
                O que comer pra fechar o dia?
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, marginTop: 4 }}>
                {remainingK > 0
                  ? `Faltam ~${remainingK} kcal — toque pra ver a receita que melhor encaixa`
                  : 'Você já atingiu sua meta — toque pra ver opções leves'}
              </Text>
            </View>
          </Card>
        </Pressable>
      </View>

      <LuSuggestionModal
        visible={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        loading={loadingExplanation}
        candidate={currentCandidate}
        explanation={explanation}
        remaining={remaining}
        noCandidates={candidates.length === 0}
        onRetry={cycleNext}
        onOpenRecipe={onOpenRecipeFromModal}
        onOpenChat={() => { setSuggestOpen(false); onOpenLuChat(); }}
      />

      {/* Coleção da Nutri Lu — carrossel de coleções curadas */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.text }}>
          Coleção da Nutri Lu
        </Text>
        <Pressable onPress={() => onOpenLuRecipes()} accessibilityLabel="Ver todas as receitas curadas">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.primaryDeep, fontWeight: '700' }}>Ver mais</Text>
            <Icon.forward size={12} color={theme.primaryDeep} stroke={2.5} />
          </View>
        </Pressable>
      </View>
      <LuCollectionsCarousel collections={LU_COLLECTIONS} onPickCollection={onOpenLuRecipes} />

      {/* Em alta esta semana — DESABILITADO no MVP (vira backend de tendências) */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 }}>
        <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: theme.textMuted }}>
          Em alta esta semana
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: theme.bgSubtle,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 100,
          }}
        >
          <Icon.lock size={10} color={theme.textMuted} stroke={2} />
          <Text style={{ fontFamily: FONT.body, fontSize: 9, color: theme.textMuted, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Em breve
          </Text>
        </View>
      </View>
      <View style={{ opacity: 0.45 }} pointerEvents="none">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {recipes.slice(0, 5).map((r) => (
            <View
              key={r.id}
              style={{ width: 150, backgroundColor: theme.bgElev, borderRadius: 16, overflow: 'hidden' }}
            >
              <FoodImg q={r.q} w={150} h={110} style={{ borderRadius: 0 }} />
              <View style={{ padding: 10 }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 12, fontWeight: '700', color: theme.text, lineHeight: 16, height: 32 }} numberOfLines={2}>
                  {r.name}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textMuted, marginTop: 4 }}>{r.kcal} kcal</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

// Carrossel de coleções com botões flutuantes de seta (esquerda/direita) pra
// rolar mais cards. Cada seta aparece só quando faz sentido (a da esquerda
// some quando está no início; a da direita some quando chega no fim).
const LuCollectionsCarousel: React.FC<{
  collections: LuCollection[];
  onPickCollection: (id: string) => void;
}> = ({ collections, onPickCollection }) => {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const contentWRef = useRef(0);
  const viewportWRef = useRef(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const SLOT = 170; // card 160 + gap 10
  const STEP = SLOT * 2; // avança/volta 2 cards por toque

  const scrollMore = () => {
    scrollRef.current?.scrollTo({ x: offsetRef.current + STEP, animated: true });
  };

  const scrollLess = () => {
    scrollRef.current?.scrollTo({ x: Math.max(0, offsetRef.current - STEP), animated: true });
  };

  const onScroll = (e: any) => {
    offsetRef.current = e.nativeEvent.contentOffset.x;
    // Start: tolerância de 4px pra não piscar
    const start = offsetRef.current <= 4;
    if (start !== atStart) setAtStart(start);
    // End: offset + viewport >= contentWidth
    if (contentWRef.current > 0 && viewportWRef.current > 0) {
      const end = offsetRef.current + viewportWRef.current >= contentWRef.current - 8;
      if (end !== atEnd) setAtEnd(end);
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 18, paddingRight: 56 }}
        onScroll={onScroll}
        onContentSizeChange={(w) => { contentWRef.current = w; }}
        onLayout={(e) => { viewportWRef.current = e.nativeEvent.layout.width; }}
        scrollEventThrottle={32}
      >
        {collections.map((c) => (
          <LuCollectionCard key={c.id} collection={c} onPress={() => onPickCollection(c.id)} />
        ))}
      </ScrollView>

      {/* Seta esquerda — esconde quando está no início */}
      {!atStart && (
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', left: 8, top: 0, bottom: 18, justifyContent: 'center' }}
        >
          <Pressable
            onPress={scrollLess}
            accessibilityLabel="Voltar coleções"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.text,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Icon.back size={16} color={theme.bg} stroke={2.5} />
          </Pressable>
        </View>
      )}

      {/* Seta direita — esconde quando chega no fim */}
      {!atEnd && (
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', right: 8, top: 0, bottom: 18, justifyContent: 'center' }}
        >
          <Pressable
            onPress={scrollMore}
            accessibilityLabel="Ver mais coleções"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.text,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Icon.forward size={16} color={theme.bg} stroke={2.5} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const LuCollectionCard: React.FC<{ collection: LuCollection; onPress: () => void }> = ({ collection, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Abrir coleção ${collection.name}`}
      style={{
        width: 160,
        borderRadius: 18,
        backgroundColor: collection.bgColor,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: getCoverUrl(collection) }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.92)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon.sparkle size={9} color={theme.primaryDeep} stroke={2} />
          <Text style={{ fontFamily: FONT.body, fontSize: 9, fontWeight: '800', color: theme.primaryDeep, letterSpacing: 0.4 }}>
            LU
          </Text>
        </View>
      </View>
      <View style={{ padding: 12, gap: 2 }}>
        <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '800', color: collection.textColor, lineHeight: 16 }} numberOfLines={2}>
          {collection.name}
        </Text>
        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: collection.textColor, opacity: 0.75, marginTop: 2 }} numberOfLines={1}>
          {collection.recipeIds.length > 0
            ? `${collection.recipeIds.length} ${collection.recipeIds.length === 1 ? 'receita' : 'receitas'}`
            : 'Em breve'}
        </Text>
      </View>
    </Pressable>
  );
};

// Helper: gera query do Unsplash pra preview da coleção. Usa coverQuery se houver,
// senão pega o `q` da primeira receita seed correspondente.
function previewQueryFor(col: RecipeCollection, recipes: Recipe[]): string {
  if (col.coverQuery) return col.coverQuery;
  const firstSeed = recipes.find((r) => col.recipeIds.includes(r.id));
  return firstSeed?.q || 'food,plate';
}

type CollectionsViewProps = {
  onOpen: (id: string, navParam: { recipe?: Recipe; saved?: SavedRecipe }) => void;
};

const CollectionsView: React.FC<CollectionsViewProps> = ({ onOpen }) => {
  const theme = useTheme();
  const { collections, recipes, savedRecipes, deleteCollection } = useApp();
  const toast = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const onLongPress = (col: RecipeCollection) => {
    Alert.alert('Excluir coleção?', `"${col.name}" será removida (as receitas continuam).`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteCollection(col.id);
          toast(`Coleção removida · ${col.name}`);
        },
      },
    ]);
  };

  const detailCol = collections.find((c) => c.id === detailId) || null;

  return (
    <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Pressable
        onPress={() => setCreateOpen(true)}
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

      {collections.map((c) => {
        const q = previewQueryFor(c, recipes);
        return (
          <Pressable
            key={c.id}
            onPress={() => setDetailId(c.id)}
            onLongPress={() => onLongPress(c)}
            delayLongPress={400}
            style={{ width: cardWidth }}
          >
            <Card pad={0} radius={18} style={{ overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', height: 110 }}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={{ width: '50%', height: '50%' }}>
                    <FoodImg q={`${q},${i}`} w="100%" h="100%" style={{ borderRadius: 0 }} />
                  </View>
                ))}
              </View>
              <View style={{ padding: 12 }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  {c.recipeIds.length} {c.recipeIds.length === 1 ? 'receita' : 'receitas'}
                </Text>
              </View>
            </Card>
          </Pressable>
        );
      })}

      {collections.length === 0 && (
        <View style={{ width: '100%', padding: 24, alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', maxWidth: 240 }}>
            Você ainda não tem coleções. Toque em "Nova coleção" pra agrupar receitas por tema.
          </Text>
        </View>
      )}

      <CreateCollectionModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        recipes={recipes}
        savedRecipes={savedRecipes}
      />

      <CollectionDetailModal
        collection={detailCol}
        onClose={() => setDetailId(null)}
        recipes={recipes}
        savedRecipes={savedRecipes}
        onOpenRecipe={(id, navParam) => {
          setDetailId(null);
          onOpen(id, navParam);
        }}
      />
    </View>
  );
};

// ─── Modal: criar nova coleção ─────────────────────────────────
const CreateCollectionModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  recipes: Recipe[];
  savedRecipes: SavedRecipe[];
}> = ({ visible, onClose, recipes, savedRecipes }) => {
  const theme = useTheme();
  const { createCollection } = useApp();
  const toast = useToast();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const reset = () => {
    setName('');
    setSelected(new Set());
  };

  const onSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast('Dê um nome à coleção', 'error');
      return;
    }
    createCollection(trimmed, Array.from(selected));
    toast(`Coleção criada · ${trimmed}`);
    reset();
    onClose();
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const items: Array<{ id: string; title: string; sub: string; q: string }> = [
    ...savedRecipes.map((r) => ({ id: r.id, title: r.title, sub: `${r.ingredients.length} ingredientes`, q: r.title })),
    ...recipes.map((r) => ({ id: r.id, title: r.name, sub: `${r.kcal} kcal · ${r.tag}`, q: r.q })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}>
          <View style={{ padding: 20, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>Nova coleção</Text>
              <IconBtn icon={Icon.close} size={32} onPress={() => { reset(); onClose(); }} />
            </View>
            <View style={{ marginTop: 14, backgroundColor: theme.bgElev, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Pré-treino"
                placeholderTextColor={theme.textFaint}
                style={{ fontFamily: FONT.body, fontSize: 15, color: theme.text }}
              />
            </View>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {selected.size} selecionada{selected.size === 1 ? '' : 's'}
            </Text>
          </View>

          <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            {items.map((it) => {
              const isSel = selected.has(it.id);
              return (
                <Pressable
                  key={it.id}
                  onPress={() => toggle(it.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 1.5,
                      borderColor: isSel ? theme.primary : theme.borderStrong,
                      backgroundColor: isSel ? theme.primary : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSel && <Icon.check size={14} color="#fff" stroke={3} />}
                  </View>
                  <FoodImg q={it.q} w={40} h={40} style={{ borderRadius: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                      {it.title}
                    </Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                      {it.sub}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
            {items.length === 0 && (
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 20 }}>
                Nenhuma receita pra adicionar ainda. Importe uma primeiro.
              </Text>
            )}
          </ScrollView>

          <View style={{ padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
            <Btn variant="primary" size="lg" icon={Icon.check} onPress={onSave} full>
              Criar coleção
            </Btn>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Modal: detalhe da coleção ─────────────────────────────────
const CollectionDetailModal: React.FC<{
  collection: RecipeCollection | null;
  onClose: () => void;
  recipes: Recipe[];
  savedRecipes: SavedRecipe[];
  onOpenRecipe: (id: string, navParam: { recipe?: Recipe; saved?: SavedRecipe }) => void;
}> = ({ collection, onClose, recipes, savedRecipes, onOpenRecipe }) => {
  const theme = useTheme();
  const { removeRecipeFromCollection, addRecipeToCollection } = useApp();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  if (!collection) return null;

  type CollectionItem = { id: string; title: string; sub: string; q: string; navParam: { recipe?: Recipe; saved?: SavedRecipe } };
  const inCol: CollectionItem[] = collection.recipeIds
    .map<CollectionItem | null>((rid) => {
      const seed = recipes.find((r) => r.id === rid);
      if (seed) return { id: seed.id, title: seed.name, sub: `${seed.kcal} kcal · ${seed.time}`, q: seed.q, navParam: { recipe: seed } };
      const saved = savedRecipes.find((r) => r.id === rid);
      if (saved) return { id: saved.id, title: saved.title, sub: `${saved.ingredients.length} ingredientes`, q: saved.title, navParam: { saved } };
      return null;
    })
    .filter((x): x is CollectionItem => x !== null);

  const outOfCol = [
    ...savedRecipes
      .filter((r) => !collection.recipeIds.includes(r.id))
      .map((r) => ({ id: r.id, title: r.title, sub: `${r.ingredients.length} ingredientes`, q: r.title })),
    ...recipes
      .filter((r) => !collection.recipeIds.includes(r.id))
      .map((r) => ({ id: r.id, title: r.name, sub: `${r.kcal} kcal · ${r.tag}`, q: r.q })),
  ];

  return (
    <Modal visible={!!collection} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}>
          <View style={{ padding: 20, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Coleção
                </Text>
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 2 }} numberOfLines={1}>
                  {collection.name}
                </Text>
              </View>
              <IconBtn icon={Icon.close} size={32} onPress={onClose} />
            </View>
          </View>

          <ScrollView style={{ maxHeight: 480 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            {!adding ? (
              <>
                {inCol.length === 0 ? (
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 24 }}>
                    Coleção vazia. Toque em "Adicionar receitas" abaixo.
                  </Text>
                ) : (
                  inCol.map((it) => (
                    <View key={it.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                      <Pressable onPress={() => onOpenRecipe(it.id, it.navParam)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <FoodImg q={it.q} w={48} h={48} style={{ borderRadius: 10 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                            {it.title}
                          </Text>
                          <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                            {it.sub}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          removeRecipeFromCollection(collection.id, it.id);
                          toast(`Removida de "${collection.name}"`);
                        }}
                        hitSlop={8}
                        accessibilityLabel="Remover da coleção"
                        style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Icon.close size={14} color={theme.textMuted} />
                      </Pressable>
                    </View>
                  ))
                )}
                <View style={{ marginTop: 16 }}>
                  <Btn variant="outline" size="md" icon={Icon.plus} onPress={() => setAdding(true)} full>
                    Adicionar receitas
                  </Btn>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
                  Selecione pra adicionar
                </Text>
                {outOfCol.map((it) => (
                  <Pressable
                    key={it.id}
                    onPress={() => {
                      addRecipeToCollection(collection.id, it.id);
                      toast(`Adicionada a "${collection.name}"`);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}
                  >
                    <FoodImg q={it.q} w={40} h={40} style={{ borderRadius: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                        {it.title}
                      </Text>
                      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }} numberOfLines={1}>
                        {it.sub}
                      </Text>
                    </View>
                    <Icon.plus size={18} color={theme.primaryDeep} stroke={2.5} />
                  </Pressable>
                ))}
                {outOfCol.length === 0 && (
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 20 }}>
                    Todas as receitas já estão na coleção.
                  </Text>
                )}
                <View style={{ marginTop: 16 }}>
                  <Btn variant="secondary" size="md" onPress={() => setAdding(false)} full>
                    Voltar à coleção
                  </Btn>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Quantas receitas da lista cabem na despensa (>= 50% dos ingredientes batem por substring).
function countFittingRecipes(pantry: PantryItem[], savedRecipes: SavedRecipe[]): number {
  if (pantry.length === 0) return 0;
  const pantryNames = pantry.map((it) => it.name.toLowerCase().trim());
  const matchIngredient = (ingName: string) => {
    const lower = ingName.toLowerCase().trim();
    return pantryNames.some((p) => lower.includes(p) || p.includes(lower));
  };
  return savedRecipes.filter((r) => {
    if (r.ingredients.length === 0) return false;
    const hits = r.ingredients.filter((i) => matchIngredient(i.name)).length;
    return hits / r.ingredients.length >= 0.5;
  }).length;
}

const PantryView: React.FC<{ nav: Nav }> = ({ nav }) => {
  const theme = useTheme();
  const { pantry, savedRecipes, removePantryItem } = useApp();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);

  // Agrupa itens por categoria (preserva ordem de adição dentro de cada grupo)
  const groups = useMemo(() => {
    const map = new Map<string, PantryItem[]>();
    for (const it of pantry) {
      const arr = map.get(it.cat) || [];
      arr.push(it);
      map.set(it.cat, arr);
    }
    // Ordem preferida; categorias extras ficam no fim
    const order = ['Hortifruti', 'Proteínas', 'Laticínios', 'Grãos', 'Temperos', 'Outros'];
    return Array.from(map.entries()).sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [pantry]);

  const fitting = countFittingRecipes(pantry, savedRecipes);

  const onRemove = (it: PantryItem) => {
    Alert.alert('Remover da despensa?', `"${it.name}" será removido.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          removePantryItem(it.id);
          toast(`Removido · ${it.name}`);
        },
      },
    ]);
  };

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Btn variant="secondary" size="md" icon={Icon.plus} full onPress={() => setAddOpen(true)}>
            Adicionar
          </Btn>
        </View>
        <View style={{ flex: 1 }}>
          <Btn variant="outline" size="md" icon={Icon.camera} full onPress={() => nav.navigate('Camera', { mode: 'pantry' })}>
            Foto geladeira
          </Btn>
        </View>
      </View>

      {pantry.length > 0 && savedRecipes.length > 0 && (
        <Card pad={14} radius={16} style={{ marginBottom: 14, backgroundColor: theme.primarySoft }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon.sparkle size={22} color={theme.primaryDeep} stroke={2} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.primaryDeep }}>
                {fitting === 0
                  ? 'Nada bate com suas receitas'
                  : `${fitting} ${fitting === 1 ? 'receita cabe' : 'receitas cabem'} na sua despensa`}
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.primaryDeep, opacity: 0.8, marginTop: 2 }}>
                {fitting === 0 ? 'Importe receitas pra ver sugestões' : 'Considera ingredientes em comum'}
              </Text>
            </View>
            {fitting > 0 && <Icon.forward size={18} color={theme.primaryDeep} />}
          </View>
        </Card>
      )}

      {pantry.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center', gap: 10 }}>
          <Icon.sparkle size={32} color={theme.primary} stroke={1.5} />
          <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
            Despensa vazia
          </Text>
          <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', maxWidth: 260 }}>
            Toque em "Adicionar" pra registrar o que você tem em casa, ou marque ingredientes como "na despensa" nas receitas.
          </Text>
        </View>
      ) : (
        groups.map(([catName, items]) => (
          <View key={catName} style={{ marginBottom: 14 }}>
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
              {catName}
            </Text>
            <Card pad={0} radius={16}>
              {items.map((it, i) => {
                const dl = daysUntilExpiry(it);
                const warn = dl !== null && dl <= 3;
                const expired = dl !== null && dl < 0;
                return (
                  <Pressable
                    key={it.id}
                    onLongPress={() => onRemove(it)}
                    delayLongPress={500}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: i < items.length - 1 ? 1 : 0,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: warn ? theme.warning : theme.primary }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: '600', color: theme.text }}>{it.name}</Text>
                      {dl !== null && (
                        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: warn ? theme.warningDeep : theme.textMuted, marginTop: 1 }}>
                          {expired ? 'Vencido' : dl === 0 ? 'Vence hoje' : `Vence em ${dl} ${dl === 1 ? 'dia' : 'dias'}`}
                        </Text>
                      )}
                    </View>
                    <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.text }}>{it.qty}</Text>
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))
      )}

      {pantry.length > 0 && (
        <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
          Pressione e segure pra remover
        </Text>
      )}

      <AddPantryModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
};

// ─── Modal: adicionar item à despensa ───────────────────────────
const AddPantryModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const theme = useTheme();
  const { addPantryItem } = useApp();
  const toast = useToast();
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [days, setDays] = useState('');

  const reset = () => {
    setName('');
    setQty('');
    setDays('');
  };

  const onSave = () => {
    const n = name.trim();
    if (!n) {
      toast('Dê um nome ao item', 'error');
      return;
    }
    const d = parseInt(days, 10);
    let expiresAt: string | undefined;
    if (!isNaN(d) && d > 0) {
      const exp = new Date();
      exp.setDate(exp.getDate() + d);
      expiresAt = exp.toISOString().slice(0, 10);
    }
    addPantryItem({
      name: n,
      qty: qty.trim() || '1 un',
      cat: categorize(n),
      expiresAt,
    });
    toast(`Adicionado à despensa · ${n}`);
    reset();
    onClose();
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: theme.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>Adicionar à despensa</Text>
            <IconBtn icon={Icon.close} size={32} onPress={close} />
          </View>

          <View>
            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
              Item
            </Text>
            <View style={{ backgroundColor: theme.bgElev, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Tomate"
                placeholderTextColor={theme.textFaint}
                style={{ fontFamily: FONT.body, fontSize: 15, color: theme.text }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                Quantidade
              </Text>
              <View style={{ backgroundColor: theme.bgElev, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
                <TextInput
                  value={qty}
                  onChangeText={setQty}
                  placeholder="4 un"
                  placeholderTextColor={theme.textFaint}
                  style={{ fontFamily: FONT.body, fontSize: 15, color: theme.text }}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                Vence em (dias)
              </Text>
              <View style={{ backgroundColor: theme.bgElev, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
                <TextInput
                  value={days}
                  onChangeText={setDays}
                  keyboardType="number-pad"
                  placeholder="opcional"
                  placeholderTextColor={theme.textFaint}
                  style={{ fontFamily: FONT.body, fontSize: 15, color: theme.text }}
                />
              </View>
            </View>
          </View>

          <Btn variant="primary" size="lg" icon={Icon.check} onPress={onSave} full>
            Adicionar
          </Btn>
        </View>
      </View>
    </Modal>
  );
};
