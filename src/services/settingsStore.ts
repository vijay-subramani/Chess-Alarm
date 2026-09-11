import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, type Settings } from '@/types/alarm';
import { normalizeAlarmSound } from '@/services/alarmSounds';

const KEY = 'chess_alarm_settings_v1';
const DELETE_TIP_KEY = 'chess_alarm_delete_tip_dismissed';

export async function loadDeleteTipDismissed(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(DELETE_TIP_KEY);
  return raw === '1';
}

export async function dismissDeleteTip(): Promise<void> {
  await AsyncStorage.setItem(DELETE_TIP_KEY, '1');
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const merged = { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    return {
      ...merged,
      defaultAlarmSound: normalizeAlarmSound(merged.defaultAlarmSound),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await saveSettings(next);
  return next;
}
