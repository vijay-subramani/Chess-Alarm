import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlarmRow } from '@/components/AlarmRow';
import { PuzzleSyncBanner } from '@/components/PuzzleSyncBanner';
import { SunriseOrb, ORB_LEFT_CORNER } from '@/components/SunriseOrb';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlineButton } from '@/components/OutlineButton';
import { NavForwardLink } from '@/components/NavLink';
import type { AppColors } from '@/theme/tokens';
import { fonts, navTypography, spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { Alarm } from '@/types/alarm';
import { MAX_ALARMS } from '@/types/alarm';
import {
  alarmLimitMessage,
  canAddAlarm,
  formatAlarmMeta,
  loadAlarms,
  saveAlarms,
} from '@/services/alarmStore';
import { dismissDeleteTip, loadDeleteTipDismissed } from '@/services/settingsStore';
import { refreshPuzzleSyncState } from '@/services/puzzleStore';
import { cancelAlarmNotifications, syncAllAlarms } from '@/services/alarmScheduler';
import { showAlarmSetConfirmation } from '@/services/alarmSetFeedback';
import { navigateToRing } from '@/navigation/navigationRef';
import { resolveActiveRingAlarmId, cacheAlarmSound } from '@/services/alarmRingNative';
import { resolveSoundForAlarm } from '@/services/resolveAlarmSound';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const TEST_ALARM_SECONDS = 10;

export function HomeScreen({ navigation }: Props) {
  const styles = useThemedStyles(createStyles);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [deleteTipDismissed, setDeleteTipDismissed] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testCountdown, setTestCountdown] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const atMaxAlarms = alarms.length >= MAX_ALARMS;
  const selectedCount = selectedIds.size;

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const refresh = useCallback(async () => {
    const [next, tipDismissed] = await Promise.all([loadAlarms(), loadDeleteTipDismissed()]);
    setAlarms(next);
    setDeleteTipDismissed(tipDismissed);
    refreshPuzzleSyncState().catch(() => undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      exitSelectionMode();
      refresh().catch(() => undefined);
    }, [exitSelectionMode, refresh]),
  );

  useFocusEffect(
    useCallback(() => {
      if (testing || testCountdown !== null) return;
      resolveActiveRingAlarmId()
        .then(alarmId => {
          if (alarmId) {
            navigateToRing(alarmId);
          }
        })
        .catch(() => undefined);
    }, [testing, testCountdown]),
  );

  const clearTestCountdown = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setTestCountdown(null);
    setTesting(false);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const persist = async (next: Alarm[]) => {
    setAlarms(next);
    await saveAlarms(next);
    await syncAllAlarms(next);
  };

  const onToggle = async (id: string, enabled: boolean) => {
    const next = alarms.map(a => (a.id === id ? { ...a, enabled } : a));
    await persist(next);
    if (enabled) {
      const alarm = next.find(a => a.id === id);
      if (alarm) showAlarmSetConfirmation(alarm);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelectionMode = (initialId?: string) => {
    setSelectionMode(true);
    setSelectedIds(initialId ? new Set([initialId]) : new Set());
  };

  const onDeleteSelected = () => {
    if (selectedCount === 0) return;

    Alert.alert(
      `Delete ${selectedCount} alarm${selectedCount === 1 ? '' : 's'}?`,
      'Selected alarms will be removed permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ids = [...selectedIds];
            const next = alarms.filter(a => !selectedIds.has(a.id));
            setAlarms(next);
            await saveAlarms(next);
            await Promise.all(ids.map(id => cancelAlarmNotifications(id)));
            await syncAllAlarms(next);
            exitSelectionMode();
            setDeleteTipDismissed(true);
            dismissDeleteTip().catch(() => undefined);
          },
        },
      ],
    );
  };

  const onAddAlarm = () => {
    if (!canAddAlarm(alarms.length)) {
      Alert.alert('Alarm limit reached', alarmLimitMessage());
      return;
    }
    navigation.navigate('AlarmEdit', {});
  };

  const onDismissDeleteTip = () => {
    setDeleteTipDismissed(true);
    dismissDeleteTip().catch(() => undefined);
  };

  const fireTestAlarm = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setTestCountdown(null);
    setTesting(false);
    void cancelAlarmNotifications('test-alarm');
    void resolveSoundForAlarm('test-alarm').then(sound =>
      cacheAlarmSound('test-alarm', sound),
    );
    requestAnimationFrame(() => {
      try {
        navigation.navigate('Ring', { alarmId: 'test-alarm' });
      } catch {
        navigateToRing('test-alarm');
      }
    });
  }, [navigation]);

  const onTest = () => {
    if (testing) return;
    setTesting(true);
    void cancelAlarmNotifications('test-alarm');
    void resolveSoundForAlarm('test-alarm').then(sound =>
      cacheAlarmSound('test-alarm', sound),
    );
    let remaining = TEST_ALARM_SECONDS;
    setTestCountdown(remaining);

    countdownInterval.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        fireTestAlarm();
        return;
      }
      setTestCountdown(remaining);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <SunriseOrb size={180} style={styles.orb} />
      <ScrollView contentContainerStyle={styles.content}>
        <PuzzleSyncBanner />
        <Text style={styles.brand}>Chess Alarm</Text>
        <Text style={styles.tagline}>Solve a puzzle to wake up.</Text>

        <View style={styles.list}>
          {alarms.length === 0 ? (
            <Text style={styles.empty}>No alarms yet. Add one to get started.</Text>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listCount}>
                  {alarms.length}/{MAX_ALARMS} alarms
                </Text>
                {selectionMode ? (
                  <View style={styles.listHeaderActions}>
                    <Pressable onPress={onDeleteSelected} disabled={selectedCount === 0} hitSlop={8}>
                      <Text
                        style={[
                          styles.listActionDestructive,
                          selectedCount === 0 && styles.listActionDisabled,
                        ]}
                      >
                        Delete{selectedCount > 0 ? ` (${selectedCount})` : ''}
                      </Text>
                    </Pressable>
                    <Pressable onPress={exitSelectionMode} hitSlop={8}>
                      <Text style={styles.listAction}>Cancel</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => enterSelectionMode()} hitSlop={8}>
                    <Text style={styles.listAction}>Select</Text>
                  </Pressable>
                )}
              </View>
              {!deleteTipDismissed && !selectionMode ? (
                <View style={styles.tipCard}>
                  <View style={styles.tipCopy}>
                    <Text style={styles.tipTitle}>How to manage alarms</Text>
                    <Text style={styles.tipBody}>
                      Tap to edit. Use Select, or press and hold an alarm, to delete one or more.
                    </Text>
                  </View>
                  <Pressable onPress={onDismissDeleteTip} hitSlop={8} style={styles.tipDismiss}>
                    <Text style={styles.tipDismissText}>Got it</Text>
                  </Pressable>
                </View>
              ) : null}
              {selectionMode ? (
                <Text style={styles.selectionHint}>
                  {selectedCount === 0
                    ? 'Tap alarms to select them'
                    : `${selectedCount} selected`}
                </Text>
              ) : null}
              {alarms.map(alarm => (
                <AlarmRow
                  key={alarm.id}
                  alarm={alarm}
                  meta={formatAlarmMeta(alarm)}
                  selectionMode={selectionMode}
                  selected={selectedIds.has(alarm.id)}
                  onToggle={enabled => onToggle(alarm.id, enabled)}
                  onPress={() =>
                    selectionMode
                      ? toggleSelected(alarm.id)
                      : navigation.navigate('AlarmEdit', { id: alarm.id })
                  }
                  onLongPress={() => enterSelectionMode(alarm.id)}
                />
              ))}
            </>
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={atMaxAlarms ? `Alarm limit reached (${MAX_ALARMS})` : 'Add alarm'}
            onPress={onAddAlarm}
            disabled={atMaxAlarms}
          />
          <OutlineButton
            label={
              testCountdown !== null
                ? `Ringing in ${testCountdown}s…`
                : 'Test alarm in 10 seconds'
            }
            onPress={onTest}
            disabled={testing}
          />
        </View>

        <NavForwardLink
          label="Defaults & puzzle sync"
          onPress={() => navigation.navigate('Settings')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.cream },
    orb: ORB_LEFT_CORNER,
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: 56,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
      zIndex: 1,
    },
    brand: {
      fontFamily: fonts.display,
      fontSize: navTypography.brandTitle,
      color: colors.ink,
      fontWeight: '700',
    },
    tagline: {
      fontFamily: fonts.ui,
      fontSize: 14,
      color: colors.muted,
      marginTop: -8,
    },
    list: { gap: spacing.md },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    listCount: {
      fontFamily: fonts.ui,
      fontSize: 13,
      color: colors.muted,
    },
    listHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    listAction: {
      fontFamily: fonts.uiSemi,
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    listActionDestructive: {
      fontFamily: fonts.uiSemi,
      fontSize: 14,
      fontWeight: '600',
      color: '#E85D5D',
    },
    listActionDisabled: {
      opacity: 0.4,
    },
    selectionHint: {
      fontFamily: fonts.ui,
      fontSize: 13,
      color: colors.muted,
      marginTop: -4,
    },
    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    tipCopy: {
      flex: 1,
      gap: 4,
    },
    tipTitle: {
      fontFamily: fonts.uiSemi,
      fontSize: 14,
      fontWeight: '600',
      color: colors.ink,
    },
    tipBody: {
      fontFamily: fonts.ui,
      fontSize: 13,
      color: colors.muted,
      lineHeight: 18,
    },
    tipDismiss: {
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginTop: 2,
    },
    tipDismissText: {
      fontFamily: fonts.uiSemi,
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    empty: {
      fontFamily: fonts.ui,
      color: colors.muted,
      fontSize: 14,
    },
    actions: { gap: 10 },
  });
