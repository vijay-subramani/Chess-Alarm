import { Platform } from 'react-native';
import type { AlarmSound } from '@/types/alarm';
import {
  listDeviceSounds,
  playSystemSound,
  stopSystemSound,
  type DeviceSoundItem,
} from '@/services/alarmSystemSoundNative';

export type SystemAlarmSoundItem = DeviceSoundItem;

export async function loadSystemAlarmSounds(): Promise<SystemAlarmSoundItem[]> {
  const list = await listDeviceSounds();
  const seen = new Set<string>();
  const sounds: SystemAlarmSoundItem[] = [];

  for (const item of list) {
    const uri = item.uri?.trim();
    const title = item.title?.trim();
    if (!uri || !title) continue;
    const key = `${title}:${uri}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sounds.push({
      uri,
      title,
      soundId: item.soundId,
    });
  }

  return sounds.sort((a, b) => a.title.localeCompare(b.title));
}

export function toSystemAlarmSound(item: SystemAlarmSoundItem): AlarmSound {
  return {
    kind: 'system',
    uri: item.uri,
    title: item.title,
  };
}

export async function previewSystemAlarmSound(uri: string): Promise<void> {
  await stopSystemSound();
  await playSystemSound(uri, false);
}

export async function stopSystemAlarmPreview(): Promise<void> {
  await stopSystemSound();
}

export function systemSoundsSectionTitle(): string {
  return Platform.OS === 'android' ? 'Phone alarm sounds' : 'Ringtones';
}
