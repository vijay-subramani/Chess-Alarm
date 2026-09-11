import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingRingAlarmId: string | undefined;

export function navigateToRing(alarmId?: string) {
  const id = alarmId ?? 'alarm';
  if (!navigationRef.isReady()) {
    pendingRingAlarmId = id;
    return;
  }
  pendingRingAlarmId = undefined;
  const current = navigationRef.getCurrentRoute();
  if (current?.name === 'Ring') {
    const params = current.params as RootStackParamList['Ring'] | undefined;
    if (params?.alarmId === id) {
      return;
    }
  }
  try {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Ring', params: { alarmId: id } }],
    });
  } catch {
    navigationRef.navigate('Ring', { alarmId: id });
  }
}

export function flushPendingRingNavigation() {
  if (pendingRingAlarmId === undefined || !navigationRef.isReady()) return;
  const id = pendingRingAlarmId;
  pendingRingAlarmId = undefined;
  try {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Ring', params: { alarmId: id } }],
    });
  } catch {
    navigationRef.navigate('Ring', { alarmId: id });
  }
}
