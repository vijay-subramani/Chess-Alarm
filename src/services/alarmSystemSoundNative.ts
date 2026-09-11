import { NativeModules, Platform } from 'react-native';

export type DeviceSoundItem = {
  uri: string;
  title: string;
  soundId: string;
};

type AlarmSystemSoundNative = {
  play(uri: string, loop: boolean): Promise<void>;
  playBuiltIn(name: string, loop: boolean): Promise<void>;
  stop(): Promise<void>;
  getDeviceSounds(): Promise<DeviceSoundItem[]>;
};

const native = (NativeModules.AlarmSystemSound ??
  NativeModules.AlarmSystemSoundModule) as AlarmSystemSoundNative | undefined;

export function getAlarmSystemSoundNative(): AlarmSystemSoundNative | null {
  return native ?? null;
}

export async function listDeviceSounds(): Promise<DeviceSoundItem[]> {
  if (!native?.getDeviceSounds) {
    throw new Error('Device sounds are not available. Rebuild and reinstall the app.');
  }
  const list = await native.getDeviceSounds();
  return Array.isArray(list) ? list : [];
}

export async function playBuiltInSound(name: string, loop: boolean): Promise<void> {
  if (!native?.playBuiltIn) {
    throw new Error('Built-in alarm playback is not available on this device.');
  }
  await native.playBuiltIn(name, loop);
}

export async function playSystemSound(uri: string, loop: boolean): Promise<void> {
  if (!native) {
    throw new Error('System alarm playback is not available on this device.');
  }
  await native.play(uri, loop);
}

export async function stopSystemSound(): Promise<void> {
  if (!native) return;
  await native.stop();
}

export function systemSoundsSupported(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}
