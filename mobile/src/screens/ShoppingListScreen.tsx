// Lista de compras — usa state global persistido em AsyncStorage.
// Items são adicionados a partir de RecipeDetail (toggle de cart nos ingredientes).

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Vibration, Share, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FONT } from '../theme';
import { ScreenHeader } from '../components/ScreenHeader';
import { IconBtn } from '../components/IconBtn';
import { Card } from '../components/Card';
import { Btn } from '../components/Btn';
import { Icon } from '../components/Icons';
import { useApp, type ShoppingListItem } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

const CATEGORY_ORDER = ['Hortifruti', 'Proteínas', 'Laticínios', 'Grãos', 'Temperos', 'Outros'];
const CATEGORY_ICONS: Record<string, string> = {
  Hortifruti: '🥦',
  Proteínas: '🐟',
  Laticínios: '🧀',
  Grãos: '🌾',
  Temperos: '🌿',
  Outros: '🛒',
};

export const ShoppingListScreen: React.FC = () => {
  const theme = useTheme();
  const nav = useNavigation();
  const toast = useToast();
  const {
    shoppingList,
    toggleShoppingChecked,
    toggleShoppingPantry,
    removeShoppingItem,
    clearShoppingList,
  } = useApp();
  const [marketMode, setMarketMode] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const checked = shoppingList.filter((i) => i.checked).length;
  const total = shoppingList.length;
  const pct = total ? Math.round((checked / total) * 100) : 0;

  if (marketMode) {
    return (
      <MarketMode
        items={shoppingList}
        toggle={(id) => {
          Vibration.vibrate(10);
          toggleShoppingChecked(id);
        }}
        onExit={() => setMarketMode(false)}
      />
    );
  }

  const byCategory = shoppingList.reduce<Record<string, ShoppingListItem[]>>((acc, it) => {
    (acc[it.cat] = acc[it.cat] || []).push(it);
    return acc;
  }, {});

  const onClear = () => {
    if (shoppingList.length === 0) {
      toast('Lista já está vazia');
      return;
    }
    // Modal custom em vez de Alert.alert — funciona consistente em mobile e web
    setClearConfirmOpen(true);
  };

  const confirmClear = () => {
    setClearConfirmOpen(false);
    clearShoppingList();
    toast('Lista limpa');
  };

  /** Monta texto da lista pra Share/WhatsApp. */
  const buildShareText = (): string => {
    const lines: string[] = ['🛒 *Lista de compras*', ''];
    const grouped = shoppingList.reduce<Record<string, ShoppingListItem[]>>((acc, it) => {
      (acc[it.cat] = acc[it.cat] || []).push(it);
      return acc;
    }, {});
    for (const cat of CATEGORY_ORDER) {
      const list = grouped[cat];
      if (!list?.length) continue;
      lines.push(`${CATEGORY_ICONS[cat] || '•'} *${cat}*`);
      for (const it of list) {
        const mark = it.checked ? '✓' : '☐';
        lines.push(`${mark} ${it.name} — ${it.qty}`);
      }
      lines.push('');
    }
    const checkedCount = shoppingList.filter((i) => i.checked).length;
    lines.push(`${checkedCount}/${shoppingList.length} comprados`);
    return lines.join('\n').trim();
  };

  const onShare = async () => {
    if (shoppingList.length === 0) {
      toast('Lista vazia — nada pra compartilhar');
      return;
    }
    const message = buildShareText();
    try {
      // Web: tenta navigator.share, senão copia pro clipboard
      if (Platform.OS === 'web') {
        const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
        if (nav?.share) {
          await nav.share({ title: 'Lista de compras', text: message });
          return;
        }
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(message);
          toast('Lista copiada — cole onde quiser');
          return;
        }
        toast('Compartilhamento não suportado neste navegador', 'error');
        return;
      }
      await Share.share({ message, title: 'Lista de compras' });
    } catch (err) {
      // user cancelou ou erro real — ignora silenciosamente em cancel
      if (err instanceof Error && !/cancel|abort/i.test(err.message)) {
        toast('Não consegui compartilhar', 'error');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScreenHeader
        title="Lista de compras"
        large
        sub={
          total === 0
            ? 'Vazia — adicione marcando ingredientes nas receitas'
            : `${total - checked} ${total - checked === 1 ? 'item restante' : 'itens restantes'}`
        }
        left={[<IconBtn key="b" icon={Icon.back} onPress={() => nav.goBack()} />]}
        right={[
          <IconBtn key="trash" icon={Icon.trash} onPress={onClear} />,
        ]}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Empty state */}
        {total === 0 ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Card pad={32} radius={22}>
              <View style={{ alignItems: 'center', gap: 14 }}>
                <Icon.cart size={42} color={theme.primary} stroke={1.5} />
                <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center' }}>
                  Sua lista está vazia
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, textAlign: 'center', lineHeight: 19 }}>
                  Vá em uma receita e toque no ícone de carrinho ao lado dos ingredientes que você precisa comprar — eles aparecem aqui.
                </Text>
                <Btn variant="primary" icon={Icon.recipe} onPress={() => nav.navigate('Tabs' as never)}>
                  Ver receitas
                </Btn>
              </View>
            </Card>
          </View>
        ) : (
          <>
            {/* Progresso */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
              <Card pad={16} radius={20}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View>
                    <Text style={{ fontFamily: FONT.headExtra, fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -0.4 }}>
                      {checked}
                      <Text style={{ fontSize: 16, color: theme.textMuted, fontWeight: '600' }}> / {total}</Text>
                    </Text>
                    <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 4 }}>itens comprados</Text>
                  </View>
                  <View style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
                    <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.primaryDeep }}>{pct}%</Text>
                  </View>
                </View>
                <View style={{ height: 8, borderRadius: 100, backgroundColor: theme.ringTrack, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${pct}%`, backgroundColor: theme.primary }} />
                </View>
              </Card>
            </View>

            {/* Ações */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" icon={Icon.cart} size="md" full onPress={() => setMarketMode(true)}>
                  Modo mercado
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="outline" icon={Icon.send} size="md" full onPress={onShare}>
                  Compartilhar
                </Btn>
              </View>
            </View>

            {/* Categorias */}
            <View style={{ paddingHorizontal: 16 }}>
              {CATEGORY_ORDER.filter((c) => byCategory[c]).map((cat) => {
                const list = byCategory[cat];
                const remaining = list.filter((i) => !i.checked).length;
                return (
                  <View key={cat} style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat]}</Text>
                        <Text style={{ fontFamily: FONT.headExtra, fontSize: 13, fontWeight: '800', color: theme.text, letterSpacing: 0.2 }}>
                          {cat}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '600' }}>
                        {remaining} de {list.length}
                      </Text>
                    </View>
                    <Card pad={0} radius={16}>
                      {list.map((it, i) => (
                        <ItemRow
                          key={it.id}
                          item={it}
                          isLast={i === list.length - 1}
                          onToggleChecked={() => toggleShoppingChecked(it.id)}
                          onTogglePantry={() => toggleShoppingPantry(it.id)}
                          onRemove={() => removeShoppingItem(it.id)}
                        />
                      ))}
                    </Card>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal custom de confirmação — substitui Alert.alert (que falha no RN-Web) */}
      <Modal visible={clearConfirmOpen} transparent animationType="fade" onRequestClose={() => setClearConfirmOpen(false)}>
        <Pressable
          onPress={() => setClearConfirmOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <Pressable
            onPress={() => {}}
            style={{ backgroundColor: theme.bg, borderRadius: 20, padding: 22, width: '100%', maxWidth: 320, gap: 14 }}
          >
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
              Limpar lista?
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 14, color: theme.textMuted, lineHeight: 20 }}>
              {shoppingList.length} {shoppingList.length === 1 ? 'item será removido' : 'itens serão removidos'}.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="secondary" size="md" onPress={() => setClearConfirmOpen(false)} full>
                  Cancelar
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="md" icon={Icon.trash} onPress={confirmClear} full>
                  Limpar
                </Btn>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const ItemRow: React.FC<{
  item: ShoppingListItem;
  isLast: boolean;
  onToggleChecked: () => void;
  onTogglePantry: () => void;
  onRemove: () => void;
}> = ({ item, isLast, onToggleChecked, onTogglePantry, onRemove }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Pressable
        onPress={onToggleChecked}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          borderWidth: 1.5,
          borderColor: item.checked ? theme.primary : theme.borderStrong,
          backgroundColor: item.checked ? theme.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.checked && <Icon.check size={14} color="#fff" stroke={3} />}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONT.body,
            fontSize: 14,
            fontWeight: '600',
            color: item.checked ? theme.textMuted : theme.text,
            textDecorationLine: item.checked ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </Text>
        {item.sourceRecipeTitle && (
          <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, marginTop: 1 }} numberOfLines={1}>
            de {item.sourceRecipeTitle}
          </Text>
        )}
      </View>
      <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: theme.textMuted }}>{item.qty}</Text>
      <Pressable
        onPress={onRemove}
        style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
        hitSlop={8}
      >
        <Icon.trash size={14} color={theme.textFaint} />
      </Pressable>
    </View>
  );
};

// ─── Modo Mercado fullscreen ─────────────────────────────────────
const MarketMode: React.FC<{
  items: ShoppingListItem[];
  toggle: (id: string) => void;
  onExit: () => void;
}> = ({ items, toggle, onExit }) => {
  const theme = useTheme();
  const remaining = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1B1B1B' }} edges={['top']}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={onExit}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon.close size={20} color="#fff" />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: FONT.body,
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: '700',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Modo mercado
          </Text>
          <Text style={{ fontFamily: FONT.headExtra, fontSize: 16, fontWeight: '800', color: '#fff' }}>
            {remaining.length} {remaining.length === 1 ? 'item pra pegar' : 'itens pra pegar'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        {remaining.length === 0 && done.length === 0 && (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              Lista vazia — adicione itens primeiro.
            </Text>
          </View>
        )}
        {remaining.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => toggle(it.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 18,
              paddingVertical: 18,
              paddingHorizontal: 20,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 18,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>
                {it.name}
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                {it.qty} · {it.cat}
              </Text>
            </View>
          </Pressable>
        ))}

        {done.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontFamily: FONT.body,
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: '700',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                paddingHorizontal: 4,
                paddingBottom: 10,
              }}
            >
              No carrinho · {done.length}
            </Text>
            {done.map((it) => (
              <Pressable
                key={it.id}
                onPress={() => toggle(it.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 18,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  opacity: 0.5,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.check size={14} color="#fff" stroke={3} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONT.head,
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#fff',
                    textDecorationLine: 'line-through',
                  }}
                >
                  {it.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
