import type { AlarmSound, BuiltInAlarmSoundId } from '@/types/alarm';
import { DEFAULT_ALARM_SOUND } from '@/types/alarm';

export type BuiltInAlarmSound = {
  id: BuiltInAlarmSoundId;
  label: string;
  /** Android res/raw name without extension */
  androidRaw: string;
  /** iOS bundle filename */
  iosBundle: string;
};

export const BUILTIN_ALARM_SOUNDS: BuiltInAlarmSound[] = [
  { id: 'classic', label: 'Classic', androidRaw: 'alarm_classic', iosBundle: 'alarm_classic.wav' },
  { id: 'digital', label: 'Digital', androidRaw: 'alarm_digital', iosBundle: 'alarm_digital.wav' },
  { id: 'gentle', label: 'Gentle', androidRaw: 'alarm_gentle', iosBundle: 'alarm_gentle.wav' },
  { id: 'urgent', label: 'Urgent', androidRaw: 'alarm_urgent', iosBundle: 'alarm_urgent.wav' },
  { id: 'chime', label: 'Chime', androidRaw: 'alarm_chime', iosBundle: 'alarm_chime.wav' },
];

const BUILTIN_BY_ID = new Map(BUILTIN_ALARM_SOUNDS.map(s => [s.id, s]));

export function getBuiltInSound(id: BuiltInAlarmSoundId): BuiltInAlarmSound {
  return BUILTIN_BY_ID.get(id) ?? BUILTIN_BY_ID.get('classic')!;
}

export function normalizeAlarmSound(value: unknown): AlarmSound {
  if (!value || typeof value !== 'object') return { ...DEFAULT_ALARM_SOUND };

  const raw = value as Record<string, unknown>;
  const kind = raw.kind ?? raw.type;

  if (kind === 'custom') {
    const uri = typeof raw.uri === 'string' ? raw.uri.trim() : '';
    const displayName =
      typeof raw.displayName === 'string' && raw.displayName.trim()
        ? raw.displayName.trim()
        : 'Custom sound';
    if (uri) return { kind: 'custom', uri, displayName };
    return { ...DEFAULT_ALARM_SOUND };
  }

  if (kind === 'system') {
    const uri = typeof raw.uri === 'string' ? raw.uri.trim() : '';
    const title =
      typeof raw.title === 'string' && raw.title.trim()
        ? raw.title.trim()
        : 'System sound';
    if (uri) return { kind: 'system', uri, title };
    return { ...DEFAULT_ALARM_SOUND };
  }

  if (kind === 'builtin' && typeof raw.id === 'string' && BUILTIN_BY_ID.has(raw.id as BuiltInAlarmSoundId)) {
    return { kind: 'builtin', id: raw.id as BuiltInAlarmSoundId };
  }

  return { ...DEFAULT_ALARM_SOUND };
}

export function alarmSoundLabel(sound: AlarmSound): string {
  if (sound.kind === 'custom') return sound.displayName;
  if (sound.kind === 'system') return sound.title;
  return getBuiltInSound(sound.id).label;
}

export function alarmSoundsEqual(a: AlarmSound, b: AlarmSound): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'custom' && b.kind === 'custom') {
    return a.uri === b.uri && a.displayName === b.displayName;
  }
  if (a.kind === 'system' && b.kind === 'system') {
    return a.uri === b.uri && a.title === b.title;
  }
  if (a.kind === 'builtin' && b.kind === 'builtin') {
    return a.id === b.id;
  }
  return false;
}

/** Notification sound when the app is in background (system/custom play in-app only). */
export function notificationSoundFor(sound: AlarmSound): { ios: string; android: string } {
  const fallback = getBuiltInSound('classic');
  if (sound.kind === 'custom' || sound.kind === 'system') {
    return { ios: fallback.iosBundle, android: fallback.androidRaw };
  }
  const builtIn = getBuiltInSound(sound.id);
  return { ios: builtIn.iosBundle, android: builtIn.androidRaw };
}
