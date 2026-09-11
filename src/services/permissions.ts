import { Linking, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidNotificationSetting, AuthorizationStatus } from '@notifee/react-native';

export type PermissionStatus = 'granted' | 'denied' | 'pending';

type AlarmPermissionNative = {
  canScheduleExactAlarms(): Promise<boolean>;
  openExactAlarmSettings(): Promise<void>;
};

const alarmPermissionNative = NativeModules.AlarmPermission as AlarmPermissionNative | undefined;

export async function getNotificationStatus(): Promise<PermissionStatus> {
  const settings = await notifee.getNotificationSettings();
  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    return 'granted';
  }
  if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    return 'denied';
  }
  return 'pending';
}

export async function getExactAlarmStatus(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') return 'granted';

  if (alarmPermissionNative?.canScheduleExactAlarms) {
    const granted = await alarmPermissionNative.canScheduleExactAlarms();
    return granted ? 'granted' : 'denied';
  }

  const settings = await notifee.getNotificationSettings();
  if (settings.android.alarm === AndroidNotificationSetting.ENABLED) {
    return 'granted';
  }
  if (settings.android.alarm === AndroidNotificationSetting.DISABLED) {
    return 'denied';
  }
  return 'pending';
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      return result === PermissionsAndroid.RESULTS.DENIED ? 'denied' : 'pending';
    }
  }

  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    return 'granted';
  }
  if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    return 'denied';
  }
  return 'pending';
}

export async function openAppSettings() {
  await Linking.openSettings();
}

/** Opens the app's notification settings page. */
export async function openNotificationSettings() {
  await Linking.openSettings();
}

/** Opens Chess Alarm on the system Alarms & reminders page (Android 12+). */
export async function openExactAlarmSettings() {
  if (Platform.OS !== 'android') {
    await openAppSettings();
    return;
  }
  try {
    if (alarmPermissionNative?.openExactAlarmSettings) {
      await alarmPermissionNative.openExactAlarmSettings();
      return;
    }
    await notifee.openAlarmPermissionSettings();
  } catch {
    await openAppSettings();
  }
}

export async function openBatterySettings() {
  if (Platform.OS !== 'android') {
    await openAppSettings();
    return;
  }
  try {
    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch {
    try {
      await Linking.sendIntent('android.settings.BATTERY_SAVER_SETTINGS');
    } catch {
      await openAppSettings();
    }
  }
}
