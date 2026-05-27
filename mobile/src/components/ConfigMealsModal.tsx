// Modal CRUD pra refeições do dia. Permite adicionar, editar nome/hora e remover.
// Persistido via storage/mealsConfig.ts (chamado pelo AppContext).

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { useTheme, FONT } from '../theme';
import { IconBtn } from './IconBtn';
import { Btn } from './Btn';
import { Icon } from './Icons';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';

type Props = { visible: boolean; onClose: () => void };

type Editing = { id?: string; name: string; time: string };

export const ConfigMealsModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const { meals, addMeal, updateMeal, removeMeal } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; name: string } | null>(null);

  const startAdd = () => setEditing({ name: '', time: '12:00' });
  const startEdit = (m: { id: string; name: string; time: string }) => setEditing({ id: m.id, name: m.name, time: m.time });

  const saveEditing = () => {
    if (!editing) return;
    const name = editing.name.trim();
    const time = editing.time.trim();
    if (!name) {
      toast('Dê um nome à refeição', 'error');
      return;
    }
    if (!/^\d{1,2}:\d{2}$/.test(time)) {
      toast('Use o formato HH:MM (ex: 07:30)', 'error');
      return;
    }
    // Pad pra "07:30"
    const [h, mm] = time.split(':');
    const pad = `${h.padStart(2, '0')}:${mm.padStart(2, '0')}`;
    if (editing.id) {
      updateMeal(editing.id, { name, time: pad });
      toast('Refeição atualizada');
    } else {
      addMeal({ name, time: pad });
      toast(`Refeição "${name}" adicionada`);
    }
    setEditing(null);
  };

  const confirmRemove = () => {
    if (!removeConfirm) return;
    removeMeal(removeConfirm.id);
    toast(`"${removeConfirm.name}" removida`);
    setRemoveConfirm(null);
    // Fecha o editor também se estava aberto na refeição removida
    if (editing?.id === removeConfirm.id) setEditing(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
          }}
        >
          <View style={{ padding: 20, paddingBottom: 12 }}>
            <View style={{ alignItems: 'center', paddingBottom: 8 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 18, fontWeight: '800', color: theme.text }}>
                Configurar refeições
              </Text>
              <IconBtn icon={Icon.close} size={32} onPress={onClose} />
            </View>
            <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, marginTop: 4, lineHeight: 17 }}>
              {editing ? (editing.id ? 'Edite o nome ou horário desta refeição.' : 'Crie uma refeição personalizada (ex: Pré-treino, Ceia).') : 'Toque pra editar. Long-press pra remover.'}
            </Text>
          </View>

          {/* Editor inline (se editando) ou lista */}
          {editing ? (
            <View style={{ paddingHorizontal: 20, gap: 14, paddingBottom: 20 }}>
              <View>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                  Nome
                </Text>
                <View style={{ backgroundColor: theme.bgElev, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <TextInput
                    value={editing.name}
                    onChangeText={(v) => setEditing({ ...editing, name: v })}
                    placeholder="Ex.: Pré-treino"
                    placeholderTextColor={theme.textFaint}
                    autoFocus={!editing.id}
                    style={{ fontFamily: FONT.body, fontSize: 15, color: theme.text }}
                  />
                </View>
              </View>
              <View>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                  Horário (HH:MM)
                </Text>
                <View style={{ backgroundColor: theme.bgElev, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <TextInput
                    value={editing.time}
                    onChangeText={(v) => setEditing({ ...editing, time: v })}
                    placeholder="07:30"
                    placeholderTextColor={theme.textFaint}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    style={{ fontFamily: FONT.body, fontSize: 15, color: theme.text }}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <Btn variant="secondary" size="md" onPress={() => setEditing(null)} full>
                    Cancelar
                  </Btn>
                </View>
                <View style={{ flex: 1 }}>
                  <Btn variant="primary" size="md" icon={Icon.check} onPress={saveEditing} full>
                    {editing.id ? 'Salvar' : 'Adicionar'}
                  </Btn>
                </View>
              </View>

              {/* Botão excluir visível só em modo edição (não em criar) */}
              {editing.id && (
                <Pressable
                  onPress={() => {
                    if (!editing.id) return;
                    const target = meals.find((m) => m.id === editing.id);
                    if (!target) return;
                    setRemoveConfirm({ id: target.id, name: target.name });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 12,
                    marginTop: 2,
                  }}
                >
                  <Icon.trash size={14} color={theme.proteinPink} stroke={2} />
                  <Text style={{ fontFamily: FONT.bodyBold, fontSize: 13, fontWeight: '700', color: theme.proteinPink }}>
                    Excluir refeição
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}>
                {meals.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => startEdit({ id: m.id, name: m.name, time: m.time })}
                    onLongPress={() => setRemoveConfirm({ id: m.id, name: m.name })}
                    delayLongPress={500}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      backgroundColor: theme.bgElev,
                      borderRadius: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: m.color || theme.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon.drumstick size={18} color={theme.text} stroke={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.bodyBold, fontSize: 15, fontWeight: '700', color: theme.text }}>{m.name}</Text>
                      <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                        {m.time} · {m.items.length} {m.items.length === 1 ? 'item' : 'itens'} · {m.kcal} kcal
                      </Text>
                    </View>
                    <Icon.pen size={16} color={theme.textMuted} stroke={2} />
                  </Pressable>
                ))}
                {meals.length === 0 && (
                  <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 16 }}>
                    Nenhuma refeição configurada. Toque em "Adicionar" abaixo.
                  </Text>
                )}
              </ScrollView>

              <View style={{ padding: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
                <Btn variant="primary" size="md" icon={Icon.plus} onPress={startAdd} full>
                  Adicionar refeição personalizada
                </Btn>
                <Text style={{ fontFamily: FONT.body, fontSize: 10, color: theme.textFaint, textAlign: 'center', marginTop: 8 }}>
                  Pressione e segure pra remover
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>

      {/* Confirmação custom de remover */}
      <Modal visible={!!removeConfirm} transparent animationType="fade" onRequestClose={() => setRemoveConfirm(null)}>
        <Pressable
          onPress={() => setRemoveConfirm(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <Pressable
            onPress={() => {}}
            style={{ backgroundColor: theme.bg, borderRadius: 20, padding: 22, width: '100%', maxWidth: 320, gap: 12 }}
          >
            <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
              Remover refeição?
            </Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: theme.textMuted, lineHeight: 19 }}>
              "{removeConfirm?.name}" e todos os items dela serão removidos do diário. As macros do dia serão recalculadas.
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn variant="secondary" size="md" onPress={() => setRemoveConfirm(null)} full>
                  Cancelar
                </Btn>
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="md" icon={Icon.trash} onPress={confirmRemove} full>
                  Remover
                </Btn>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
};
