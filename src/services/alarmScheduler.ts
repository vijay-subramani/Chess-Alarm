import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  EventType,
  TriggerType,
  type Event,
  type TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import type { Alarm, AlarmSound } from '@/types/alarm';
import { loadAlarms } from '@/services/alarmStore';
import { cacheAlarmSound } from '@/services/alarmRingNative';
import { loadSettings } from '@/services/settingsStore';
import { normalizeAlarmSound, notificationSoundFor } from '@/services/alarmSounds';

export const CHANNEL_ID = 'chess_alarms';
export const ANDROID_SILENT_CHANNEL_ID = 'chess_alarms_trigger';
export const RING_PRESS_ACTION = 'default';

let channelReady = false;

const IOS_ALARM_BASE = {
  interruptionLevel: 'timeSensitive' as const,
  foregroundPresentationOptions: {
    alert: true,
    badge: true,
    sound: true,
    banner: true,
    list: true,
  },
};

function iosAlarmConfig(sound: AlarmSound) {
  const normalized = normalizeAlarmSound(sound);
  return {
    ...IOS_ALARM_BASE,
    sound: notificationSoundFor(normalized).ios,
  };
}

export async function ensureAlarmChannel() {
  if (channelReady) return;
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Alarms',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      bypassDnd: true,
      visibility: AndroidVisibility.PUBLIC,
    });
    await notifee.createChannel({
      id: ANDROID_SILENT_CHANNEL_ID,
      name: 'Alarm triggers',
      importance: AndroidImportance.HIGH,
      vibration: true,
      bypassDnd: true,
      visibility: AndroidVisibility.PUBLIC,
    });
  }
  channelReady = true;
}

function nextFireDate(hour: number, minute: number, days: number[]): Date {
  const now = new Date();
  const candidate = new Date(now);
  candidate.setSeconds(0, 0);
  candidate.setHours(hour, minute, 0, 0);

  const daySet = days.length ? new Set(days) : null;

  for (let i = 0; i < 8; i++) {
    const d = new Date(candidate);
    d.setDate(candidate.getDate() + i);
    if (d.getTime() <= now.getTime()) continue;
    if (!daySet || daySet.has(d.getDay())) return d;
  }

  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(hour, minute, 0, 0);
  return fallback;
}

export function getAlarmNextFireDate(alarm: Pick<Alarm, 'hour' | 'minute' | 'days'>): Date {
  return nextFireDate(alarm.hour, alarm.minute, alarm.days);
}

function androidAlarmNotification(alarm: Pick<Alarm, 'id' | 'label'>) {
  return {
    channelId: ANDROID_SILENT_CHANNEL_ID,
    category: AndroidCategory.ALARM,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    pressAction: {
      id: RING_PRESS_ACTION,
      launchActivity: 'default',
    },
    fullScreenAction: {
      id: 'full-screen',
      launchActivity: 'default',
    },
    ongoing: true,
    autoCancel: false,
    lightUpScreen: true,
  };
}

const IOS_LEGACY_PULSE_SUFFIX = '__pulse_';
const IOS_KEEPALIVE_SUFFIX = '__ios_keepalive_';
const IOS_KEEPALIVE_COUNT = 18;
const IOS_KEEPALIVE_INTERVAL_MS = 20_000;

const IOS_SILENT_WAKE = {
  interruptionLevel: 'timeSensitive' as const,
  foregroundPresentationOptions: {
    alert: false,
    badge: false,
    sound: false,
    banner: false,
    list: false,
  },
};

async function scheduleIosKeepalives(alarmId: string, fireAtMs: number) {
  await Promise.all(
    Array.from({ length: IOS_KEEPALIVE_COUNT }, (_, index) => {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: fireAtMs + (index + 1) * IOS_KEEPALIVE_INTERVAL_MS,
      };
      return notifee.createTriggerNotification(
        {
          id: `${alarmId}${IOS_KEEPALIVE_SUFFIX}${index + 1}`,
          title: 'Chess Alarm',
          body: 'Alarm active',
          data: { alarmId, type: 'ios-keepalive' },
          ios: IOS_SILENT_WAKE,
        },
        trigger,
      );
    }),
  );
}

async function cancelIosKeepalives(alarmId: string) {
  await Promise.all(
    Array.from({ length: IOS_KEEPALIVE_COUNT }, (_, index) =>
      notifee.cancelTriggerNotification(`${alarmId}${IOS_KEEPALIVE_SUFFIX}${index + 1}`),
    ),
  );
}

export async function cancelLegacyIosPulseNotifications(): Promise<number> {
  if (Platform.OS !== 'ios') return 0;

  const triggerIds = await notifee.getTriggerNotificationIds();
  const pulseIds = triggerIds.filter(id => id.includes(IOS_LEGACY_PULSE_SUFFIX));
  await Promise.all(pulseIds.map(id => notifee.cancelTriggerNotification(id)));

  const displayed = await notifee.getDisplayedNotifications();
  const displayedPulseIds = displayed
    .map(entry => String(entry.notification?.id ?? ''))
    .filter(id => id.includes(IOS_LEGACY_PULSE_SUFFIX));
  await Promise.all(displayedPulseIds.map(id => notifee.cancelNotification(id)));

  return pulseIds.length + displayedPulseIds.length;
}

export async function cancelAlarmNotifications(alarmId: string) {
  await notifee.cancelNotification(alarmId);
  await notifee.cancelTriggerNotification(alarmId);
  if (Platform.OS === 'ios') {
    await Promise.all([
      ...Array.from({ length: 12 }, (_, index) =>
        notifee.cancelTriggerNotification(`${alarmId}${IOS_LEGACY_PULSE_SUFFIX}${index + 1}`),
      ),
      cancelIosKeepalives(alarmId),
    ]);
  }
}

export async function scheduleAlarmNotification(alarm: Alarm) {
  await ensureAlarmChannel();
  await cancelAlarmNotifications(alarm.id);
  if (!alarm.enabled) return;

  await cacheAlarmSound(alarm.id, alarm.sound);

  const when = nextFireDate(alarm.hour, alarm.minute, alarm.days);
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: when.getTime(),
    alarmManager: {
      // setAlarmClock — the only alarm type Doze never defers, and it surfaces the
      // system's next-alarm icon. allowWhileIdle alone still slips under battery saver.
      type: AlarmType.SET_ALARM_CLOCK,
    },
  };

  await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: 'Chess Alarm',
      body: `${alarm.label || 'Alarm'} — tap to solve the puzzle`,
      data: { alarmId: alarm.id, type: 'alarm' },
      android: androidAlarmNotification(alarm),
      ios: iosAlarmConfig(alarm.sound),
    },
    trigger,
  );

  if (Platform.OS === 'ios') {
    await scheduleIosKeepalives(alarm.id, when.getTime());
  }
}

export async function syncAllAlarms(alarms: Alarm[]) {
  await ensureAlarmChannel();
  for (const alarm of alarms) {
    try {
      await scheduleAlarmNotification(alarm);
    } catch {
      // One alarm failing to schedule must not strand the rest of the list.
    }
  }
}

const EXACT_ALARM_REGISTRATION_ID = '__exact_alarm_registration__';

/** Touch AlarmManager once so Android lists this app under Alarms & reminders. */
export async function registerExactAlarmAccess(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await ensureAlarmChannel();
  await notifee.cancelTriggerNotification(EXACT_ALARM_REGISTRATION_ID);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + 365 * 24 * 60 * 60 * 1000,
    alarmManager: { allowWhileIdle: true },
  };

  try {
    await notifee.createTriggerNotification(
      {
        id: EXACT_ALARM_REGISTRATION_ID,
        title: 'Chess Alarm',
        body: 'Alarm registration',
        data: { type: 'registration' },
        android: {
          channelId: ANDROID_SILENT_CHANNEL_ID,
          importance: AndroidImportance.LOW,
          visibility: AndroidVisibility.SECRET,
        },
      },
      trigger,
    );
  } catch {
    // Still attempt to register; permission may be denied until user grants it.
  } finally {
    await notifee.cancelTriggerNotification(EXACT_ALARM_REGISTRATION_ID);
  }
}

export async function scheduleTestAlarm(seconds = 10) {
  await ensureAlarmChannel();
  const settings = await loadSettings();
  const sound = normalizeAlarmSound(settings.defaultAlarmSound);
  const id = 'test-alarm';
  await cancelAlarmNotifications(id);
  await cacheAlarmSound(id, sound);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + seconds * 1000,
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      id,
      title: 'Chess Alarm',
      body: 'Test alarm — tap to solve the puzzle',
      data: { alarmId: id, type: 'alarm' },
      android: androidAlarmNotification({ id, label: 'Test alarm' }),
      ios: iosAlarmConfig(sound),
    },
    trigger,
  );

  if (Platform.OS === 'ios') {
    await scheduleIosKeepalives(id, trigger.timestamp);
  }
}

export async function scheduleSnooze(minutes: number) {
  await ensureAlarmChannel();
  const settings = await loadSettings();
  const id = 'snooze-alarm';
  await cancelAlarmNotifications(id);
  await cacheAlarmSound(id, settings.defaultAlarmSound);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + minutes * 60 * 1000,
    alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
  };

  await notifee.createTriggerNotification(
    {
      id,
      title: 'Chess Alarm',
      body: 'Snooze ended — tap to solve the puzzle',
      data: { alarmId: id, type: 'alarm' },
      android: androidAlarmNotification({ id, label: 'Snooze' }),
      ios: iosAlarmConfig(settings.defaultAlarmSound),
    },
    trigger,
  );

  if (Platform.OS === 'ios') {
    await scheduleIosKeepalives(id, trigger.timestamp);
  }
}

export async function dismissActiveNotifications(alarmId?: string) {
  const ids = new Set<string>(['test-alarm', 'snooze-alarm']);
  if (alarmId) ids.add(alarmId);

  const alarms = await loadAlarms();
  for (const alarm of alarms) {
    ids.add(alarm.id);
  }

  await Promise.all([...ids].map(id => cancelAlarmNotifications(String(id))));
  await notifee.cancelDisplayedNotifications();
}

export function isAlarmEvent(event: Event): boolean {
  if (event.type !== EventType.PRESS && event.type !== EventType.DELIVERED) {
    return false;
  }
  const notificationType = event.detail.notification?.data?.type;
  if (notificationType === 'ios-keepalive') {
    return event.type === EventType.DELIVERED;
  }
  return notificationType === 'alarm';
}
