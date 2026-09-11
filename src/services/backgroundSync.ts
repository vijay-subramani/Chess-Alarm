import { AppState, NativeModules, Platform } from 'react-native';

type BackgroundSyncModule = {
  registerBackgroundFetch: () => void;
  consumePendingPuzzleSync: () => Promise<boolean>;
};

const native: BackgroundSyncModule | undefined = NativeModules.BackgroundSyncModule;

/** Register for iOS background fetch (puzzle cache refresh). No-op on Android. */
export function registerBackgroundFetch() {
  if (Platform.OS !== 'ios') return;
  native?.registerBackgroundFetch?.();
}

/** True when iOS background fetch ran since last consume. */
export async function consumePendingBackgroundSync(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !native?.consumePendingPuzzleSync) return false;
  try {
    return await native.consumePendingPuzzleSync();
  } catch {
    return false;
  }
}

export function attachBackgroundSyncListener(onSync: () => void) {
  registerBackgroundFetch();

  const runIfPending = () => {
    consumePendingBackgroundSync()
      .then(pending => {
        if (pending) onSync();
      })
      .catch(() => undefined);
  };

  runIfPending();
  const sub = AppState.addEventListener('change', state => {
    if (state === 'active') runIfPending();
  });

  return () => sub.remove();
}
