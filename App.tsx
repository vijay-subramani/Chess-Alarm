import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee, { EventType, type InitialNotification } from '@notifee/react-native';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { RootNavigator } from '@/navigation/RootNavigator';
import {
  flushPendingRingNavigation,
  navigationRef,
  navigateToRing,
} from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { loadSettings } from '@/services/settingsStore';
import { loadAlarms } from '@/services/alarmStore';
import {
  cancelLegacyIosPulseNotifications,
  ensureAlarmChannel,
  isAlarmEvent,
  registerExactAlarmAccess,
  syncAllAlarms,
} from '@/services/alarmScheduler';
import { resolveActiveRingAlarmId } from '@/services/alarmRingNative';
import { refreshPuzzleSyncState, startPuzzleSync } from '@/services/puzzleStore';
import { attachBackgroundSyncListener } from '@/services/backgroundSync';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';

function alarmIdFromInitialNotification(initial: InitialNotification | null): string | null {
  const data = initial?.notification?.data;
  if (!data || String(data.type) !== 'alarm') return null;
  const alarmId = data.alarmId;
  return alarmId ? String(alarmId) : null;
}

function AppShell() {
  const [bootReady, setBootReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [skipSplash, setSkipSplash] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Home');
  const [initialRingAlarmId, setInitialRingAlarmId] = useState<string | undefined>();
  const { colors, colorScheme } = useTheme();
  const splashDoneRef = useRef(false);

  const finishSplash = useCallback(() => {
    if (splashDoneRef.current) return;
    splashDoneRef.current = true;
    setSplashDone(true);
  }, []);

  const openAlarmRing = useCallback(
    (alarmId?: string) => {
      const id = alarmId ?? 'alarm';
      if (navigationRef.isReady()) {
        const current = navigationRef.getCurrentRoute();
        if (current?.name === 'Ring') {
          const params = current.params as RootStackParamList['Ring'] | undefined;
          if (params?.alarmId === id) {
            return;
          }
        }
      }
      setSkipSplash(true);
      finishSplash();
      navigateToRing(id);
    },
    [finishSplash],
  );

  const resumeActiveAlarmIfNeeded = useCallback(async () => {
    if (AppState.currentState !== 'active') return;
    if (navigationRef.isReady()) {
      const current = navigationRef.getCurrentRoute();
      if (current?.name === 'Ring') {
        const params = current.params as RootStackParamList['Ring'] | undefined;
        if (params?.alarmId === 'test-alarm') return;
      }
    }
    const alarmId = await resolveActiveRingAlarmId();
    if (!alarmId) return;
    if (navigationRef.isReady()) {
      const current = navigationRef.getCurrentRoute();
      if (current?.name === 'Ring') {
        const params = current.params as RootStackParamList['Ring'] | undefined;
        if (params?.alarmId === alarmId) return;
      }
    }
    openAlarmRing(alarmId);
  }, [openAlarmRing]);

  useEffect(() => {
    let mounted = true;

    const removeBackgroundSync = attachBackgroundSyncListener(() => {
      startPuzzleSync(true).catch(() => undefined);
    });

    /**
     * Rescheduling every alarm is slow and irrelevant to the first frame — when the app is
     * launched by a ringing alarm, blocking on it leaves the user staring at nothing.
     */
    async function syncAlarmsInBackground() {
      const alarms = await loadAlarms();
      if (Platform.OS === 'android') {
        await registerExactAlarmAccess();
      } else {
        await cancelLegacyIosPulseNotifications();
      }
      await syncAllAlarms(alarms);
    }

    async function bootstrap() {
      await ensureAlarmChannel();
      const settings = await loadSettings();
      const [initial, activeAlarmId] = await Promise.all([
        notifee.getInitialNotification(),
        resolveActiveRingAlarmId(),
      ]);
      const fromNotifee = alarmIdFromInitialNotification(initial);
      const resolvedAlarmId = fromNotifee ?? activeAlarmId;

      if (!mounted) return;

      if (resolvedAlarmId) {
        setInitialRingAlarmId(resolvedAlarmId);
        setInitialRoute('Ring');
        openAlarmRing(resolvedAlarmId);
      } else {
        setInitialRoute(settings.onboardingDone ? 'Home' : 'Onboarding');
      }

      setBootReady(true);

      syncAlarmsInBackground().catch(() => undefined);

      refreshPuzzleSyncState()
        .then(state => {
          if (state.needsRefresh) {
            startPuzzleSync().catch(() => undefined);
          }
        })
        .catch(() => undefined);
    }

    bootstrap().catch(() => {
      if (mounted) {
        setInitialRoute('Home');
        setBootReady(true);
      }
    });

    const unsub = notifee.onForegroundEvent(event => {
      if (!isAlarmEvent(event)) return;
      if (event.type === EventType.PRESS || event.type === EventType.DELIVERED) {
        const id = event.detail.notification?.data?.alarmId;
        openAlarmRing(id ? String(id) : undefined);
      }
    });

    return () => {
      mounted = false;
      unsub();
      removeBackgroundSync();
    };
  }, [openAlarmRing]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') return;
      resumeActiveAlarmIfNeeded().catch(() => undefined);
    });
    return () => sub.remove();
  }, [resumeActiveAlarmIfNeeded]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name === 'Ring') return;
      resumeActiveAlarmIfNeeded().catch(() => undefined);
    }, 2000);
    return () => clearInterval(interval);
  }, [resumeActiveAlarmIfNeeded]);

  const showSplash = !skipSplash && (!splashDone || !bootReady);
  const showApp = bootReady && (splashDone || skipSplash);
  /**
   * An alarm can skip the splash before bootstrap finishes, which used to leave neither the
   * splash nor the navigator mounted — a blank screen with the alarm audible behind it.
   */
  const showBootFallback = !showApp && !showSplash;

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {showApp ? (
          <>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <NavigationContainer
              ref={navigationRef}
              onReady={() => {
                flushPendingRingNavigation();
              }}
            >
              <RootNavigator
                initialRoute={initialRoute}
                initialRingAlarmId={initialRingAlarmId}
              />
            </NavigationContainer>
          </>
        ) : null}

        {showSplash ? (
          <SplashScreen onDone={finishSplash} waiting={splashDone && !bootReady} />
        ) : null}

        {showBootFallback ? (
          <View style={[styles.bootFallback, { backgroundColor: colors.cream }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
