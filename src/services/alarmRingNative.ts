import { NativeModules, Platform } from 'react-native';
import type { AlarmSound } from '@/types/alarm';
import { getBuiltInSound } from '@/services/alarmSounds';

type AlarmRingNative = {
  cacheAlarmSound(alarmId: string, configJson: string): Promise<void>;
  startAlarmRing(alarmId: string, configJson: string, launchApp: boolean): Promise<void>;
  startInAppAlarmRing(alarmId: string, configJson: string): Promise<void>;
  launchAlarmRing(alarmId: string): Promise<void>;
  getLaunchAlarmId(): Promise<string | null>;
  getActiveAlarmId(): Promise<string | null>;
  isAlarmRinging(): Promise<boolean>;
  stopAlarmRing(): Promise<void>;
};

const native = NativeModules.AlarmRing as AlarmRingNative | undefined;

export function serializeAlarmSoundForNative(sound: AlarmSound): Record<string, string> {
  if (sound.kind === 'builtin') {
    const builtIn = getBuiltInSound(sound.id);
    const id = Platform.OS === 'android' ? builtIn.androidRaw : builtIn.iosBundle;
    return { kind: 'builtin', id };
  }
  if (sound.kind === 'system') {
    return { kind: 'system', uri: sound.uri };
  }
  return { kind: 'custom', uri: sound.uri };
}

export function soundConfigJson(sound: AlarmSound): string {
  return JSON.stringify(serializeAlarmSoundForNative(sound));
}

export async function cacheAlarmSound(alarmId: string, sound: AlarmSound): Promise<void> {
  if (!native?.cacheAlarmSound) return;
  await native.cacheAlarmSound(alarmId, soundConfigJson(sound));
}

export async function getLaunchAlarmId(): Promise<string | null> {
  if (!native?.getLaunchAlarmId) return null;
  const id = await native.getLaunchAlarmId();
  return id ? String(id) : null;
}

export async function getActiveAlarmId(): Promise<string | null> {
  if (!native?.getActiveAlarmId) return null;
  const id = await native.getActiveAlarmId();
  return id ? String(id) : null;
}

/** Pending launch intent first, then any alarm currently ringing natively. */
export async function resolveActiveRingAlarmId(): Promise<string | null> {
  const launchId = await getLaunchAlarmId();
  if (launchId) return launchId;
  return getActiveAlarmId();
}

export async function startNativeAlarmRing(
  alarmId: string,
  sound: AlarmSound,
  launchApp = false,
): Promise<void> {
  if (!native?.startAlarmRing) return;
  await cacheAlarmSound(alarmId, sound);
  if (Platform.OS === 'android') {
    await native.startAlarmRing(alarmId, soundConfigJson(sound), launchApp);
    return;
  }
  const iosNative = native as unknown as {
    startAlarmRing(id: string, launchApp: boolean): Promise<void>;
  };
  await iosNative.startAlarmRing(alarmId, launchApp);
}

export async function startInAppNativeAlarmRing(
  alarmId: string,
  sound: AlarmSound,
): Promise<void> {
  if (native?.startInAppAlarmRing) {
    await native.startInAppAlarmRing(alarmId, soundConfigJson(sound));
    return;
  }
  await startNativeAlarmRing(alarmId, sound, false);
}

export async function launchAlarmRingUi(alarmId: string): Promise<void> {
  if (!native?.launchAlarmRing) return;
  await native.launchAlarmRing(alarmId);
}

export async function isNativeAlarmRinging(): Promise<boolean> {
  if (!native?.isAlarmRinging) return false;
  return native.isAlarmRinging();
}

export async function stopNativeAlarmRing(): Promise<void> {
  if (!native?.stopAlarmRing) return;
  await native.stopAlarmRing();
}

export function nativeAlarmRingSupported(): boolean {
  return Boolean(native?.startAlarmRing);
}
