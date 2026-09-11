import { EventType } from '@notifee/react-native';
import type { Notification } from '@notifee/react-native';
import notifee from '@notifee/react-native';
import { AppState, Platform } from 'react-native';
import {
  launchAlarmRingUi,
  startNativeAlarmRing,
  isNativeAlarmRinging,
} from '@/services/alarmRingNative';
import { resolveSoundForAlarm } from '@/services/resolveAlarmSound';
import { beginAlarmSession } from '@/services/ringAudio';

function alarmIdFromNotification(notification: Notification | undefined): string | undefined {
  const data = notification?.data;
  if (!data) return undefined;
  const type = String(data.type);
  if (type !== 'alarm' && type !== 'ios-keepalive') return undefined;
  const id = data.alarmId;
  return id ? String(id) : undefined;
}

/** Kept for index.js entry compatibility. */
export function registerAlarmForegroundService(): void {}

export async function handleAlarmBackgroundEvent(
  type: EventType,
  notification: Notification | undefined,
): Promise<void> {
  if (!notification?.data) return;

  const alarmId = alarmIdFromNotification(notification);
  if (!alarmId) return;

  if (type !== EventType.DELIVERED && type !== EventType.PRESS) return;

  const sound = await resolveSoundForAlarm(alarmId);

  if (Platform.OS === 'android') {
    const inApp = AppState.currentState === 'active';
    if (type === EventType.DELIVERED) {
      if (inApp) {
        beginAlarmSession({ alarmId, sound, inApp: true });
        return;
      }
      await startNativeAlarmRing(alarmId, sound, true);
      await delay(400);
      const notificationId = String(notification.id ?? alarmId);
      await notifeeCancelAlarmNotification(notificationId);
    } else if (!inApp) {
      await startNativeAlarmRing(alarmId, sound, false);
      await launchAlarmRingUi(alarmId);
    }
    beginAlarmSession({ alarmId, sound, inApp });
    return;
  }

  const notificationType = String(notification.data?.type ?? 'alarm');
  await ensureNativeAlarmRing(alarmId, sound);
  if (notificationType === 'ios-keepalive') return;

  beginAlarmSession({ alarmId, sound });
}

async function ensureNativeAlarmRing(
  alarmId: string,
  sound: Awaited<ReturnType<typeof resolveSoundForAlarm>>,
) {
  const alreadyRinging = await isNativeAlarmRinging().catch(() => false);
  if (!alreadyRinging) {
    await startNativeAlarmRing(alarmId, sound, false);
  }
}

async function notifeeCancelAlarmNotification(notificationId: string) {
  await notifee.cancelNotification(notificationId);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
