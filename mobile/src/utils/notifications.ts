// Utilities pra notificações LOCAIS (agendadas pelo OS, sem servidor de push).
// Funciona em Android (Expo Go e build) e iOS (build dev/prod).
// No iOS Expo Go (SDK >= 53) e em web, a API silenciosamente falha — o toggle
// salva mesmo assim e a notificação ativará quando rodar num build real.

import * as Notifications from 'expo-notifications';
import { Platform, LogBox } from 'react-native';

// Suprime warning chato do Expo Go sobre push REMOTAS (não usamos — só locais).
// Esse warning aparece como Console Error no dev menu mas é totalmente benigno.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

// Identifier do canal Android. iOS ignora.
// (id mantém 'weigh-reminders' por compat — mudar id criaria canal novo e o
// user perderia a config de som/importância que já ajustou no sistema)
const ANDROID_CHANNEL_ID = 'weigh-reminders';

// Configura o handler padrão (como notificações se comportam quando o app
// está em foreground). Chamado uma vez no boot do App.
let handlerConfigured = false;
export function configureNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Cria/garante o canal de notificação no Android (obrigatório a partir do Android 8).
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    // Nome genérico: o canal cobre refeições, hábitos e pesagem.
    name: 'Lembretes',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#97AF8F',
  });
}

// Checa permissão SEM pedir (pra fluxos de boot — não queremos prompt surpresa).
export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// Pede permissão pro user. Retorna true se concedida.
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return req.granted;
  } catch (err) {
    console.warn('[notifications] permissão falhou:', err);
    return false;
  }
}

// Cancela TODAS as notificações do app — usa antes de re-agendar pra evitar duplicatas.
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[notifications] cancel falhou:', err);
  }
}

// Agenda lembrete DIÁRIO de pesagem no horário escolhido.
// Retorna o id agendado (ou null se falhou/web).
export async function scheduleDailyWeighReminder(time: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const [hh, mm] = time.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  try {
    await ensureAndroidChannel();
    // Garante que não dupliquem antes de criar a nova
    await cancelAllReminders();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora da pesagem 🥗',
        body: 'Bom dia! Suba na balança e registre seu peso pra manter o ritmo.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hh,
        minute: mm,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    return id;
  } catch (err) {
    console.warn('[notifications] schedule falhou:', err);
    return null;
  }
}

// Agenda lembrete genérico DIÁRIO com identifier customizado.
// Usado por hábitos: cada um tem um id estável (`habit-<habitId>`) pra
// poder cancelar individualmente sem mexer nos outros.
export async function scheduleNamedDailyReminder(
  identifier: string,
  title: string,
  body: string,
  time: string,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const [hh, mm] = time.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  try {
    await ensureAndroidChannel();
    // Garante que não duplica — cancela id anterior se houver
    await cancelNamedReminder(identifier);
    const id = await Notifications.scheduleNotificationAsync({
      identifier,
      content: { title, body, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hh,
        minute: mm,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
    console.log(`[notifications] agendado ${identifier} diário ${hh}:${String(mm).padStart(2, '0')}`);
    return id;
  } catch (err) {
    console.warn('[notifications] schedule named falhou:', err);
    return null;
  }
}

export async function cancelNamedReminder(identifier: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // ID pode não existir — tudo bem
  }
}

// ─── Identifiers gerenciados pelo app ──────────────────────────
export const habitNotifId = (habitId: string) => `habit-${habitId}`;
export const mealNotifId = (mealId: string) => `meal-${mealId}`;
export const WEIGH_NOTIF_ID = 'weigh-daily';

// Padrões de id que PERTENCEM ao app — o reconciler só mexe nesses
// (nunca cancela um agendamento que não reconhece).
const MANAGED_ID_PATTERNS = [/^meal-/, /^habit-/, /^weigh-daily$/];

export type DailyReminderSpec = {
  identifier: string;
  title: string;
  body: string;
  /** HH:MM */
  time: string;
};

// Extrai hour/minute de um trigger agendado, tolerando os shapes diferentes
// que cada plataforma retorna (Android: {hour, minute}; iOS: calendar com
// dateComponents). Retorna null se ilegível → tratamos como mismatch.
function triggerHourMinute(trigger: unknown): { hour: number; minute: number } | null {
  if (!trigger || typeof trigger !== 'object') return null;
  const t = trigger as Record<string, any>;
  if (typeof t.hour === 'number' && typeof t.minute === 'number') {
    return { hour: t.hour, minute: t.minute };
  }
  const dc = t.dateComponents;
  if (dc && typeof dc.hour === 'number' && typeof dc.minute === 'number') {
    return { hour: dc.hour, minute: dc.minute };
  }
  return null;
}

/**
 * Reconcilia os lembretes agendados no OS contra a config esperada.
 * - Agenda o que falta; re-agenda o que está com horário errado.
 * - Cancela ids gerenciados que não deveriam mais existir (órfãos).
 * - NO-OP pra agendamentos já corretos — seguro de rodar em todo boot.
 *
 * Motivação: alarmes podem se perder/corromper sem o app saber (reinício
 * automático do Samsung de madrugada, update de OS, bug do expo-notifications).
 * Caso real 2026-06-10: 4 lembretes de refeição dispararam juntos às 00:45.
 * Com o reconciler, qualquer estado quebrado se auto-corrige na próxima
 * abertura do app.
 */
export async function reconcileDailyReminders(expected: DailyReminderSpec[]): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const byId = new Map(scheduled.map((s) => [s.identifier, s]));

    for (const spec of expected) {
      const [hh, mm] = spec.time.split(':').map((n) => parseInt(n, 10));
      if (Number.isNaN(hh) || Number.isNaN(mm)) continue;
      const cur = byId.get(spec.identifier);
      const hm = cur ? triggerHourMinute(cur.trigger) : null;
      if (cur && hm && hm.hour === hh && hm.minute === mm) continue; // intacto
      console.log(
        `[notifications] reconcile: corrigindo ${spec.identifier} → ${spec.time}`,
        cur ? `(estava ${hm ? `${hm.hour}:${String(hm.minute).padStart(2, '0')}` : 'ilegível'})` : '(ausente)',
      );
      await scheduleNamedDailyReminder(spec.identifier, spec.title, spec.body, spec.time);
    }

    const expectedIds = new Set(expected.map((e) => e.identifier));
    for (const s of scheduled) {
      const managed = MANAGED_ID_PATTERNS.some((re) => re.test(s.identifier));
      if (managed && !expectedIds.has(s.identifier)) {
        console.log('[notifications] reconcile: cancelando órfão', s.identifier);
        await cancelNamedReminder(s.identifier);
      }
    }
  } catch (err) {
    console.warn('[notifications] reconcile falhou:', err);
  }
}
