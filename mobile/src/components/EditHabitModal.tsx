// Modal de criar/editar hábito.
// - Nome do hábito (text input)
// - Toggle "Lembrete diário" + sugestões de horário (chips)
// - Botão Excluir (quando editando)

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TextInput, Platform } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { Btn } from './Btn';
import { TimePicker } from './TimePicker';
import type { Habit } from '../storage/habits';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Quando passado, é edição; quando undefined, é criação. */
  habit?: Habit;
  onSave: (data: { name: string; reminderTime?: string }) => void;
  onDelete?: () => void;
};

const SUGGESTED_TIMES = ['07:00', '09:00', '12:00', '15:00', '18:00', '20:00', '22:00'];

export const EditHabitModal: React.FC<Props> = ({ visible, onClose, habit, onSave, onDelete }) => {
  const theme = useTheme();
  const [name, setName] = useState(habit?.name ?? '');
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(!!habit?.reminderTime);
  const [reminderTime, setReminderTime] = useState<string>(habit?.reminderTime ?? '08:00');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(habit?.name ?? '');
    setReminderEnabled(!!habit?.reminderTime);
    setReminderTime(habit?.reminderTime ?? '08:00');
    setConfirmDelete(false);
  }, [visible, habit]);

  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 60;

  const submit = () => {
    if (!valid) return;
    onSave({ name: trimmed, reminderTime: reminderEnabled ? reminderTime : undefined });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 22, gap: 14, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.flame size={18} color={theme.warning} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>
                {habit ? 'Editar hábito' : 'Novo hábito'}
              </Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ gap: 16 }} keyboardShouldPersistTaps="handled">
            {/* Nome */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Hábito
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Caminhar 30 minutos"
                placeholderTextColor={theme.textFaint}
                autoFocus={!habit}
                maxLength={60}
                style={{
                  fontFamily: FONT.body,
                  fontSize: 15,
                  color: theme.text,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.bgElev,
                }}
              />
            </View>

            {/* Toggle lembrete */}
            <Pressable
              onPress={() => setReminderEnabled((v) => !v)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 14,
                backgroundColor: theme.bgElev,
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }}>
                  Lembrete diário
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  Notificação no horário escolhido
                </Text>
              </View>
              <Toggle on={reminderEnabled} />
            </Pressable>

            {reminderEnabled && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  Horário
                </Text>
                <TimePicker value={reminderTime} onChange={setReminderTime} suggestions={SUGGESTED_TIMES} />
              </View>
            )}

            {/* Excluir (só na edição) */}
            {habit && onDelete && !confirmDelete && (
              <Pressable
                onPress={() => setConfirmDelete(true)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginTop: 4 }}
              >
                <Icon.trash size={14} color="#D67373" stroke={2} />
                <Text style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: '700', color: '#D67373' }}>
                  Excluir hábito
                </Text>
              </Pressable>
            )}

            {habit && onDelete && confirmDelete && (
              <View style={{ padding: 14, borderRadius: 14, backgroundColor: '#FBE9EB', gap: 8 }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 13, fontWeight: '700', color: '#8B2A2A' }}>
                  Excluir mesmo?
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: '#8B2A2A' }}>
                  O histórico desse hábito será perdido.
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <View style={{ flex: 1 }}>
                    <Btn variant="outline" size="sm" onPress={() => setConfirmDelete(false)} full>Cancelar</Btn>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Btn variant="primary" size="sm" onPress={() => { onDelete?.(); onClose(); }} full>Excluir</Btn>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Btn variant="outline" size="md" onPress={onClose} full>Cancelar</Btn>
            </View>
            <View style={{ flex: 1 }}>
              <Btn variant="primary" size="md" onPress={submit} disabled={!valid} full>
                {habit ? 'Salvar' : 'Criar'}
              </Btn>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const Toggle: React.FC<{ on: boolean }> = ({ on }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: on ? theme.primaryDeep : theme.border,
        padding: 3,
        alignItems: on ? 'flex-end' : 'flex-start',
      }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
    </View>
  );
};
