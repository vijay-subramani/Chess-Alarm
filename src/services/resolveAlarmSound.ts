import type { AlarmSound } from '@/types/alarm';
import { loadAlarms, normalizeAlarm } from '@/services/alarmStore';
import { loadSettings } from '@/services/settingsStore';
import { normalizeAlarmSound } from '@/services/alarmSounds';

export async function resolveSoundForAlarm(alarmId?: string): Promise<AlarmSound> {
  const settings = await loadSettings();
  const defaultSound = normalizeAlarmSound(settings.defaultAlarmSound);

  if (!alarmId || alarmId === 'test-alarm' || alarmId === 'snooze-alarm') {
    return defaultSound;
  }

  const alarms = await loadAlarms();
  const alarm = alarms.find(a => a.id === alarmId);
  if (!alarm) return defaultSound;
  return normalizeAlarm(alarm).sound;
}
