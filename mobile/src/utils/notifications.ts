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
    name: 'Lembretes de pesagem',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#97AF8F',
  });
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
      },
    });
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

// Helper específico pra hábitos
export const habitNotifId = (habitId: string) => `habit-${habitId}`;
