// Modal "Configurar lembretes" — toggle pra lembrete diário de pesagem + horário.
// Agenda notificações LOCAIS via expo-notifications (sem servidor de push).
// Em web e iOS Expo Go a programação não dispara, mas a config fica salva.

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { Btn } from './Btn';
import { TimePicker } from './TimePicker';
import { loadReminder, saveReminder, DEFAULT_REMINDER, type WeighReminderConfig } from '../storage/userProfile';
import { useToast } from '../state/ToastContext';
import { requestNotificationPermission, scheduleDailyWeighReminder, cancelAllReminders } from '../utils/notifications';

type Props = { visible: boolean; onClose: () => void };

// Horários sugeridos (manhã ao acordar é o ideal pra pesagem consistente)
const SUGGESTED_TIMES = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'];

export const WeightRemindersModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const toast = useToast();
  const [cfg, setCfg] = useState<WeighReminderConfig>(DEFAULT_REMINDER);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    loadReminder().then(setCfg);
  }, [visible]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Salva config localmente sempre (mesmo se permissão for negada — permite retomar depois)
      await saveReminder(cfg);

      if (cfg.enabled) {
        // Pede permissão e agenda
        const granted = await requestNotificationPermission();
        if (!granted) {
          if (Platform.OS === 'web') {
            toast('Notificações não funcionam no preview web — vai disparar no celular', 'info');
          } else {
            toast('Permissão negada. Ative em Configurações do sistema.', 'error');
          }
        } else {
          await scheduleDailyWeighReminder(cfg.time);
          toast(`Lembrete diário às ${cfg.time} ativado`);
        }
      } else {
        await cancelAllReminders();
        toast('Lembrete desativado');
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 22, gap: 16, maxHeight: '85%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.clock size={18} color="#B07A1E" stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>Lembretes</Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ gap: 16 }}>
            {/* Toggle principal */}
            <Pressable
              onPress={() => setCfg((c) => ({ ...c, enabled: !c.enabled }))}
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
                  Lembrete diário de pesagem
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  Notificação no horário escolhido
                </Text>
              </View>
              <Toggle on={cfg.enabled} />
            </Pressable>

            {/* Seletor de horário personalizável */}
            {cfg.enabled && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  Horário
                </Text>
                <TimePicker
                  value={cfg.time}
                  onChange={(time) => setCfg((c) => ({ ...c, time }))}
                  suggestions={SUGGESTED_TIMES}
                />
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, marginTop: 4, textAlign: 'center' }}>
                  💡 Pesagem logo ao acordar dá medições mais consistentes.
                </Text>
              </View>
            )}

            {/* Aviso sobre permissão / plataformas */}
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: theme.bgSubtle, gap: 4 }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: '700', color: theme.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Como funciona
              </Text>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, lineHeight: 17 }}>
                Ao salvar, o app pede permissão pra enviar notificações. É uma notificação local diária — não precisa de internet pra disparar.
              </Text>
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Btn variant="outline" size="md" onPress={onClose} full>Cancelar</Btn>
            </View>
            <View style={{ flex: 1 }}>
              <Btn variant="primary" size="md" onPress={save} full>Salvar</Btn>
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
