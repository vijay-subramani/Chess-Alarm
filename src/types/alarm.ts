import type { ColorScheme } from '@/theme/tokens';

export type BuiltInAlarmSoundId = 'classic' | 'digital' | 'gentle' | 'urgent' | 'chime';

export type AlarmSound =
  | { kind: 'builtin'; id: BuiltInAlarmSoundId }
  | { kind: 'system'; uri: string; title: string }
  | { kind: 'custom'; uri: string; displayName: string };

export const DEFAULT_ALARM_SOUND: AlarmSound = { kind: 'builtin', id: 'classic' };

export type Alarm = {
  id: string;
  hour: number;
  minute: number;
  label: string;
  /** 0=Sun … 6=Sat; empty = every day (next occurrence) */
  days: number[];
  enabled: boolean;
  sound: AlarmSound;
  puzzle: AlarmPuzzleSettings;
};

export type AlarmPuzzleSettings = {
  difficulty: Difficulty;
  mateIn: MateIn;
  hintAfter: number;
};

export type Difficulty = 'easy' | 'medium' | 'hard';
export type MateIn = 1 | 2 | 3;

export const DEFAULT_ALARM_PUZZLE: AlarmPuzzleSettings = {
  difficulty: 'medium',
  mateIn: 2,
  hintAfter: 1,
};

export type Settings = {
  difficulty: Difficulty;
  mateIn: MateIn;
  hintAfter: number;
  defaultAlarmSound: AlarmSound;
  snoozeMinutes: number;
  maxSnoozes: number;
  onboardingDone: boolean;
  colorScheme: ColorScheme;
};

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'medium',
  mateIn: 2,
  hintAfter: 1,
  defaultAlarmSound: DEFAULT_ALARM_SOUND,
  snoozeMinutes: 5,
  maxSnoozes: 3,
  onboardingDone: false,
  colorScheme: 'dark',
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Maximum alarms a user can create (matches typical clock app limits). */
export const MAX_ALARMS = 20;
