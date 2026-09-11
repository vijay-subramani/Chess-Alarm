import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alarm, AlarmPuzzleSettings } from '@/types/alarm';
import { DEFAULT_ALARM_PUZZLE, MAX_ALARMS } from '@/types/alarm';
import { normalizeAlarmSound } from '@/services/alarmSounds';

const KEY = 'chess_alarm_alarms_v1';

export function normalizeAlarm(alarm: Alarm): Alarm {
  return {
    ...alarm,
    sound: normalizeAlarmSound(alarm.sound),
    puzzle: alarm.puzzle
      ? { ...DEFAULT_ALARM_PUZZLE, ...alarm.puzzle }
      : { ...DEFAULT_ALARM_PUZZLE },
  };
}

export async function loadAlarms(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Alarm[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAlarm);
  } catch {
    return [];
  }
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(alarms));
}

export function createAlarmId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function canAddAlarm(alarmCount: number): boolean {
  return alarmCount < MAX_ALARMS;
}

export function alarmLimitMessage(): string {
  return `You can set up to ${MAX_ALARMS} alarms. Delete one to add another.`;
}

export function formatAlarmTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatAlarmMeta(alarm: Alarm): string {
  const days =
    alarm.days.length === 0
      ? 'Every day'
      : alarm.days.length === 5 && [1, 2, 3, 4, 5].every(d => alarm.days.includes(d))
        ? 'Mon – Fri'
        : alarm.days.length === 2 && alarm.days.includes(0) && alarm.days.includes(6)
          ? 'Sat – Sun'
          : alarm.days
              .slice()
              .sort((a, b) => a - b)
              .map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
              .join(' · ');
  const diff = alarm.puzzle.difficulty.charAt(0).toUpperCase() + alarm.puzzle.difficulty.slice(1);
  return `${days}  ·  Mate in ${alarm.puzzle.mateIn}  ·  ${diff}`;
}

export function puzzleLabel(puzzle: AlarmPuzzleSettings): string {
  const diff = puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1);
  return `${diff} · Mate in ${puzzle.mateIn} · Hints after ${puzzle.hintAfter}`;
}
