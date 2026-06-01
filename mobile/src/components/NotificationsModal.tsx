// Modal central de gerenciamento de TODAS as notificações:
// - Refeições (lembrete em cada horário configurado da meal)
// - Hábitos (lembrete diário com horário personalizável)
// - Pesagem (lembrete diário)
// Tem também o "silenciar tudo" como master switch.
//
// A modal opera com state local, escrevendo no AppContext ao salvar.

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { useTheme, FONT } from '../theme';
import { Icon } from './Icons';
import { IconBtn } from './IconBtn';
import { Btn } from './Btn';
import { TimePicker } from './TimePicker';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/ToastContext';
import {
  loadReminder,
  saveReminder,
  DEFAULT_REMINDER,
  type WeighReminderConfig,
} from '../storage/userProfile';
import {
  requestNotificationPermission,
  scheduleNamedDailyReminder,
  cancelNamedReminder,
  cancelAllReminders,
  habitNotifId,
} from '../utils/notifications';

type Props = { visible: boolean; onClose: () => void };

const SUGGESTED_TIMES = ['06:00', '07:00', '08:00', '12:00', '15:00', '18:00', '20:00', '22:00'];

const mealNotifId = (mealId: string) => `meal-${mealId}`;
const WEIGH_NOTIF_ID = 'weigh-daily';

export const NotificationsModal: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const toast = useToast();
  const {
    meals,
    habits,
    mealReminders,
    silenceAllNotifications,
    setMealReminders,
    setSilenceAllNotifications,
    updateHabit,
  } = useApp();

  // ─── State local (commit no Save) ──
  const [silenceAll, setSilenceAll] = useState(silenceAllNotifications);
  const [weighCfg, setWeighCfg] = useState<WeighReminderConfig>(DEFAULT_REMINDER);
  const [localMealReminders, setLocalMealReminders] = useState<Record<string, boolean>>(mealReminders);
  // Hábitos: editamos diretamente pelo updateHabit ao salvar; aqui só refletimos
  // estado local enquanto edita
  const [localHabitsTimes, setLocalHabitsTimes] = useState<Record<string, string | undefined>>(
    Object.fromEntries(habits.map((h) => [h.id, h.reminderTime])),
  );
  // UI: qual TimePicker está aberto inline (key = `meal-X`, `habit-X` ou `weigh`)
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    loadReminder().then(setWeighCfg);
    setSilenceAll(silenceAllNotifications);
    setLocalMealReminders(mealReminders);
    setLocalHabitsTimes(Object.fromEntries(habits.map((h) => [h.id, h.reminderTime])));
    setPickerOpenFor(null);
  }, [visible, silenceAllNotifications, mealReminders, habits]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Persiste no contexto
      setSilenceAllNotifications(silenceAll);
      setMealReminders(localMealReminders);
      await saveReminder(weighCfg);
      // Atualiza hábitos
      for (const h of habits) {
        const newTime = localHabitsTimes[h.id];
        if (newTime !== h.reminderTime) {
          updateHabit(h.id, { reminderTime: newTime });
        }
      }

      // Aplica scheduling no OS
      if (silenceAll) {
        // Cancela tudo
        await cancelAllReminders();
        toast('Todas as notificações silenciadas');
      } else {
        const granted = await requestNotificationPermission();
        if (!granted && Platform.OS !== 'web') {
          toast('Permissão de notificação negada. Ative no sistema.', 'error');
        } else {
          // Pesagem
          if (weighCfg.enabled) {
            await scheduleNamedDailyReminder(
              WEIGH_NOTIF_ID,
              'Hora da pesagem 🥗',
              'Suba na balança e registre seu peso.',
              weighCfg.time,
            );
          } else {
            await cancelNamedReminder(WEIGH_NOTIF_ID);
          }
          // Refeições
          for (const m of meals) {
            const enabled = !!localMealReminders[m.id];
            if (enabled) {
              await scheduleNamedDailyReminder(
                mealNotifId(m.id),
                `Hora de ${m.name} 🍽️`,
                'Registre sua refeição pra manter o ritmo dos macros.',
                m.time,
              );
            } else {
              await cancelNamedReminder(mealNotifId(m.id));
            }
          }
          // Hábitos
          for (const h of habits) {
            const newTime = localHabitsTimes[h.id];
            if (newTime) {
              await scheduleNamedDailyReminder(
                habitNotifId(h.id),
                `${h.name} 💪`,
                'Bata seu hábito de hoje.',
                newTime,
              );
            } else {
              await cancelNamedReminder(habitNotifId(h.id));
            }
          }
          toast('Notificações atualizadas');
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: theme.bg, borderRadius: 24, padding: 18, gap: 12, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon.bell size={18} color={theme.text} stroke={2} />
              <Text style={{ fontFamily: FONT.headExtra, fontSize: 17, fontWeight: '800', color: theme.text }}>Notificações</Text>
            </View>
            <IconBtn icon={Icon.close} size={32} onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ gap: 14 }} keyboardShouldPersistTaps="handled">
            {/* ─── Silenciar tudo ─── */}
            <Pressable
              onPress={() => setSilenceAll((v) => !v)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 14,
                backgroundColor: silenceAll ? '#FBE9EB' : theme.bgElev,
                gap: 12,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: silenceAll ? '#D67373' : theme.bgSubtle, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{silenceAll ? '🔕' : '🔔'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: silenceAll ? '#8B2A2A' : theme.text }}>
                  Silenciar tudo
                </Text>
                <Text style={{ fontFamily: FONT.body, fontSize: 11, color: silenceAll ? '#8B2A2A' : theme.textMuted, marginTop: 1 }}>
                  Pausa todas as notificações do app
                </Text>
              </View>
              <Toggle on={silenceAll} dangerous />
            </Pressable>

            {/* ─── Refeições ─── */}
            <Section title="Refeições" disabled={silenceAll}>
              {meals.map((m) => {
                const enabled = !!localMealReminders[m.id];
                const isPicker = pickerOpenFor === `meal-${m.id}`;
                return (
                  <View key={m.id}>
                    <ReminderRow
                      icon="🍽️"
                      title={m.name}
                      time={m.time}
                      enabled={enabled}
                      disabled={silenceAll}
                      onToggle={() => setLocalMealReminders((c) => ({ ...c, [m.id]: !c[m.id] }))}
                      onTimePress={() => toast('O horário de refeição é configurado em Diário > Configurar refeições', 'info')}
                    />
                    {isPicker && (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
                        <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textMuted }}>
                          Edite o horário em Diário > Configurar refeições.
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </Section>

            {/* ─── Hábitos ─── */}
            <Section title="Hábitos" disabled={silenceAll}>
              {habits.length === 0 ? (
                <Text style={{ fontFamily: FONT.body, fontSize: 12, color: theme.textMuted, padding: 12, textAlign: 'center' }}>
                  Crie hábitos na aba Progresso > Hábitos pra receber lembretes.
                </Text>
              ) : (
                habits.map((h) => {
                  const time = localHabitsTimes[h.id];
                  const enabled = !!time;
                  const isPicker = pickerOpenFor === `habit-${h.id}`;
                  return (
                    <View key={h.id}>
                      <ReminderRow
                        icon="🔥"
                        title={h.name}
                        time={time ?? '—'}
                        enabled={enabled}
                        disabled={silenceAll}
                        onToggle={() => {
                          setLocalHabitsTimes((c) => ({
                            ...c,
                            [h.id]: c[h.id] ? undefined : (h.reminderTime ?? '08:00'),
                          }));
                        }}
                        onTimePress={() => {
                          if (silenceAll) return;
                          setPickerOpenFor(isPicker ? null : `habit-${h.id}`);
                        }}
                      />
                      {isPicker && time && (
                        <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 }}>
                          <TimePicker
                            value={time}
                            onChange={(t) => setLocalHabitsTimes((c) => ({ ...c, [h.id]: t }))}
                            suggestions={SUGGESTED_TIMES}
                          />
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </Section>

            {/* ─── Pesagem ─── */}
            <Section title="Pesagem" disabled={silenceAll}>
              <ReminderRow
                icon="⚖️"
                title="Pesagem diária"
                time={weighCfg.time}
                enabled={weighCfg.enabled}
                disabled={silenceAll}
                onToggle={() => setWeighCfg((c) => ({ ...c, enabled: !c.enabled }))}
                onTimePress={() => {
                  if (silenceAll) return;
                  setPickerOpenFor(pickerOpenFor === 'weigh' ? null : 'weigh');
                }}
              />
              {pickerOpenFor === 'weigh' && weighCfg.enabled && (
                <View style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 }}>
                  <TimePicker
                    value={weighCfg.time}
                    onChange={(t) => setWeighCfg((c) => ({ ...c, time: t }))}
                    suggestions={SUGGESTED_TIMES}
                  />
                </View>
              )}
            </Section>

            <Text style={{ fontFamily: FONT.body, fontSize: 11, color: theme.textFaint, lineHeight: 15, paddingHorizontal: 4 }}>
              💡 Notificações locais — disparadas pelo próprio aparelho, sem precisar de internet.
            </Text>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Btn variant="outline" size="md" onPress={onClose} full>Cancelar</Btn>
            </View>
            <View style={{ flex: 1 }}>
              <Btn variant="primary" size="md" onPress={save} disabled={saving} full>Salvar</Btn>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode; disabled?: boolean }> = ({ title, children, disabled }) => {
  const theme = useTheme();
  return (
    <View style={{ opacity: disabled ? 0.4 : 1 }}>
      <Text style={{ fontFamily: FONT.body, fontSize: 10, fontWeight: '800', color: theme.textMuted, letterSpacing: 1.2, marginBottom: 6, paddingHorizontal: 4 }}>
        {title.toUpperCase()}
      </Text>
      <View style={{ backgroundColor: theme.bgElev, borderRadius: 14, paddingVertical: 4 }} pointerEvents={disabled ? 'none' : 'auto'}>
        {children}
      </View>
    </View>
  );
};

const ReminderRow: React.FC<{
  icon: string;
  title: string;
  time: string;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onTimePress: () => void;
}> = ({ icon, title, time, enabled, disabled, onToggle, onTimePress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 }}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ flex: 1, fontFamily: FONT.head, fontSize: 14, fontWeight: '700', color: theme.text }} numberOfLines={1}>
        {title}
      </Text>
      <Pressable
        onPress={(e: any) => { e?.stopPropagation?.(); if (enabled && !disabled) onTimePress(); }}
        disabled={!enabled || disabled}
        hitSlop={6}
        style={{
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 100,
          backgroundColor: enabled ? theme.bgSubtle : 'transparent',
          opacity: enabled ? 1 : 0.4,
        }}
      >
        <Text style={{ fontFamily: FONT.bodyBold, fontSize: 12, fontWeight: '700', color: theme.text }}>{time}</Text>
      </Pressable>
      <Toggle on={enabled} />
    </Pressable>
  );
};

const Toggle: React.FC<{ on: boolean; dangerous?: boolean }> = ({ on, dangerous }) => {
  const theme = useTheme();
  const onColor = dangerous ? '#D67373' : theme.primaryDeep;
  return (
    <View
      style={{
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: on ? onColor : theme.border,
        padding: 3,
        alignItems: on ? 'flex-end' : 'flex-start',
      }}
    >
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' }} />
    </View>
  );
};
