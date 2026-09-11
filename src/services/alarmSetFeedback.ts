import { Platform, ToastAndroid } from 'react-native';
import type { Alarm } from '@/types/alarm';
import { getAlarmNextFireDate } from '@/services/alarmScheduler';

function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatDurationFromNow(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60_000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(pluralize(days, 'day', 'days'));
  if (hours > 0) parts.push(pluralize(hours, 'hour', 'hours'));
  if (minutes > 0) parts.push(pluralize(minutes, 'minute', 'minutes'));

  return parts.join(' ');
}

export function alarmSetConfirmationMessage(alarm: Alarm): string | null {
  if (!alarm.enabled) return null;

  const when = getAlarmNextFireDate(alarm);
  const ms = when.getTime() - Date.now();
  if (ms <= 0) return null;

  return `Alarm set for ${formatDurationFromNow(ms)} from now`;
}

export function showAlarmSetConfirmation(alarm: Alarm): void {
  if (Platform.OS !== 'android') return;

  const message = alarmSetConfirmationMessage(alarm);
  if (!message) return;

  ToastAndroid.show(message, ToastAndroid.SHORT);
}
