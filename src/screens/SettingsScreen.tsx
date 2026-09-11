import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavBackLink, NavForwardLink } from '@/components/NavLink';
import type { AppColors, ColorScheme } from '@/theme/tokens';
import { fonts, navTypography, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { Difficulty, MateIn, Settings } from '@/types/alarm';
import { AlarmSoundPicker } from '@/components/alarm/AlarmSoundPicker';
import { loadSettings, saveSettings } from '@/services/settingsStore';
import { openExactAlarmSettings, openNotificationSettings } from '@/services/permissions';
import { getPuzzlePackMeta, refreshPuzzleSyncState, startPuzzleSync, subscribePuzzleSync, type PuzzleSyncState } from '@/services/puzzleStore';
import { PuzzleSyncProgress } from '@/components/PuzzleSyncProgress';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

type PuzzleMeta = Awaited<ReturnType<typeof getPuzzlePackMeta>>;

function formatDifficultyCounts(byDifficulty: Record<string, number> | undefined) {
  if (!byDifficulty) return '';
  const beginner = byDifficulty.beginner ?? 0;
  const club = byDifficulty.club ?? 0;
  const master = byDifficulty.master ?? 0;
  return ` · easy ${beginner} · medium ${club} · hard ${master}`;
}

function formatFetchedAt(iso: string | null) {
  if (!iso) return 'Not downloaded yet';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

export function SettingsScreen({ navigation }: Props) {
  const { colors, colorScheme, setColorScheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [puzzleMeta, setPuzzleMeta] = useState<PuzzleMeta | null>(null);
  const [sync, setSync] = useState<PuzzleSyncState | null>(null);
  const [refreshingPuzzles, setRefreshingPuzzles] = useState(false);

  const refreshPuzzleMeta = useCallback(async () => {
    const meta = await getPuzzlePackMeta();
    setPuzzleMeta(meta);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);
      refreshPuzzleMeta().catch(() => undefined);
      refreshPuzzleSyncState().catch(() => undefined);
    }, [refreshPuzzleMeta]),
  );

  useEffect(() => {
    return subscribePuzzleSync(state => {
      setSync(state);
      if (state.status !== 'syncing') {
        refreshPuzzleMeta().catch(() => undefined);
      }
    });
  }, [refreshPuzzleMeta]);

  const onRefreshPuzzles = async () => {
    if (refreshingPuzzles) return;
    setRefreshingPuzzles(true);
    try {
      await startPuzzleSync(true);
      await refreshPuzzleMeta();
      await refreshPuzzleSyncState();
    } finally {
      setRefreshingPuzzles(false);
    }
  };

  const patch = async (partial: Partial<Settings>) => {
    if (!settings) return;
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  };

  if (!settings) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <NavBackLink label="Alarms" onPress={() => navigation.goBack()} />

        <Text style={styles.section}>APPEARANCE</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dark mode</Text>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={enabled => {
              const scheme: ColorScheme = enabled ? 'dark' : 'light';
              setColorScheme(scheme).catch(() => undefined);
              patch({ colorScheme: scheme });
            }}
            trackColor={{ false: colors.toggleOff, true: colors.toggleOn }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.toggleOff}
          />
        </View>

        <Text style={styles.title}>Puzzle defaults</Text>
        <Text style={styles.sub}>
          Used for new alarms and the test alarm. Edit any alarm to set its own puzzle or sound.
        </Text>

        <Text style={styles.section}>DEFAULT SOUND</Text>
        <Text style={styles.hint}>
          Used for new alarms, test alarm, and snooze. Phone/system sounds play on the ring screen.
        </Text>
        <AlarmSoundPicker
          value={settings.defaultAlarmSound}
          onChange={sound => patch({ defaultAlarmSound: sound })}
        />

        <Text style={styles.section}>DIFFICULTY</Text>
        <View style={styles.pills}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
            const on = settings.difficulty === d;
            return (
              <Pressable
                key={d}
                onPress={() => patch({ difficulty: d })}
                style={[styles.pill, on && styles.pillOn]}
              >
                <Text style={[styles.pillText, on && styles.pillTextOn]}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>MATE IN N</Text>
        <View style={styles.pills}>
          {([1, 2, 3] as MateIn[]).map(n => {
            const on = settings.mateIn === n;
            return (
              <Pressable
                key={n}
                onPress={() => patch({ mateIn: n })}
                style={[styles.pill, on && styles.pillOn]}
              >
                <Text style={[styles.pillText, on && styles.pillTextOn]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>HINTS & SNOOZE</Text>
        <StepperRow
          label="Hint after wrong moves"
          value={String(settings.hintAfter)}
          onDec={() => patch({ hintAfter: Math.max(1, settings.hintAfter - 1) })}
          onInc={() => patch({ hintAfter: Math.min(8, settings.hintAfter + 1) })}
        />
        <StepperRow
          label="Snooze duration"
          value={`${settings.snoozeMinutes} min`}
          onDec={() =>
            patch({ snoozeMinutes: Math.max(1, settings.snoozeMinutes - 1) })
          }
          onInc={() =>
            patch({ snoozeMinutes: Math.min(30, settings.snoozeMinutes + 1) })
          }
        />
        <StepperRow
          label="Max snoozes"
          value={String(settings.maxSnoozes)}
          onDec={() => patch({ maxSnoozes: Math.max(0, settings.maxSnoozes - 1) })}
          onInc={() => patch({ maxSnoozes: Math.min(10, settings.maxSnoozes + 1) })}
        />

        <Text style={styles.hint}>
          After {settings.hintAfter} wrong moves: show the from-square (e.g. e1). After{' '}
          {settings.hintAfter + 1}: show from → to (e.g. e1 → e8). After {settings.hintAfter + 2}:
          show the puzzle hint text.
        </Text>

        <Text style={styles.section}>ALARM RELIABILITY</Text>
        {Platform.OS === 'android' ? (
          <Pressable style={styles.row} onPress={() => openExactAlarmSettings()}>
            <Text style={styles.rowLabel}>Alarms & reminders</Text>
            <NavForwardLink label="Open" variant="row" />
          </Pressable>
        ) : null}
        <Pressable style={styles.row} onPress={() => openNotificationSettings()}>
          <Text style={styles.rowLabel}>
            {Platform.OS === 'ios'
              ? 'Notification & Time Sensitive settings'
              : 'Notification settings'}
          </Text>
          <NavForwardLink label="Open" variant="row" />
        </Pressable>
        <Text style={styles.hint}>
          {Platform.OS === 'ios'
            ? 'Alarms still fire when the app is closed. Tap the notification to open the puzzle — Snooze and Turn Off stay locked until you solve it.'
            : 'Tap Alarms & reminders and turn it ON for Chess Alarm. If Chess Alarm is missing from that list, uninstall then reinstall the app after updating. Avoid setting battery to Unrestricted — that can hide the app from Alarms & reminders on some phones.'}
        </Text>

        <Text style={styles.section}>DAILY PUZZLES</Text>
        <View style={styles.metaCard}>
          <Text style={styles.metaLine}>
            {sync?.status === 'syncing'
              ? `${sync.count} puzzles saved`
              : puzzleMeta
                ? `${puzzleMeta.count} puzzles cached (${puzzleMeta.source})${formatDifficultyCounts(puzzleMeta.byDifficulty)}`
                : 'Loading puzzle cache…'}
          </Text>
          {sync?.status === 'syncing' ? (
            <PuzzleSyncProgress sync={sync} />
          ) : (
            <Text style={styles.metaSub}>
              Last updated: {formatFetchedAt(puzzleMeta?.fetchedAt ?? null)}
              {puzzleMeta?.stale ? ' · refresh recommended' : ''}
              {puzzleMeta?.fullSyncComplete === false ? ' · download incomplete' : ''}
            </Text>
          )}
        </View>
        <Pressable
          style={[styles.row, (refreshingPuzzles || sync?.status === 'syncing') && styles.rowDisabled]}
          onPress={onRefreshPuzzles}
          disabled={refreshingPuzzles || sync?.status === 'syncing'}
        >
          <Text style={styles.rowLabel}>Refresh puzzles now</Text>
          {refreshingPuzzles || sync?.status === 'syncing' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <NavForwardLink label="Sync" variant="row" />
          )}
        </Pressable>
        {Platform.OS === 'ios' ? (
          <>
            <Pressable style={styles.row} onPress={() => openNotificationSettings()}>
              <Text style={styles.rowLabel}>Background App Refresh</Text>
              <NavForwardLink label="Open" variant="row" />
            </Pressable>
            <Text style={styles.hint}>
              Optional — refreshes the daily puzzle cache while the app is in the background.
              {'\n\n'}
              If the toggle is greyed out:{'\n'}
              1. Settings → General → Background App Refresh → Wi‑Fi & Cellular Data{'\n'}
              2. Turn off Low Power Mode{'\n'}
              3. Return to Chess Alarm and enable Background App Refresh{'\n\n'}
              Alarms do not need Background App Refresh — only puzzle updates.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepperRow({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={onDec} style={styles.stepBtn}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.rowValue}>{value}</Text>
        <Pressable onPress={onInc} style={styles.stepBtn}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.cream },
    content: {
      padding: spacing.xl,
      gap: spacing.md,
      paddingBottom: 40,
      zIndex: 1,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: navTypography.pageTitle,
      color: colors.ink,
      fontWeight: '700',
    },
    sub: {
      fontFamily: fonts.ui,
      color: colors.muted,
      fontSize: 13,
      marginTop: -4,
    },
    section: {
      marginTop: spacing.md,
      fontFamily: fonts.uiSemi,
      fontSize: 12,
      letterSpacing: 1.2,
      color: colors.muted,
      fontWeight: '600',
    },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    pillOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    pillText: {
      fontFamily: fonts.uiSemi,
      color: colors.ink,
      fontWeight: '600',
      fontSize: 14,
    },
    pillTextOn: { color: colors.onPrimary },
    row: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowDisabled: { opacity: 0.65 },
    metaCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 4,
    },
    metaLine: {
      fontFamily: fonts.uiSemi,
      color: colors.ink,
      fontSize: 14,
      fontWeight: '600',
    },
    metaSub: {
      fontFamily: fonts.ui,
      color: colors.muted,
      fontSize: 12,
      lineHeight: 18,
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: 'hidden',
      marginTop: 6,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    rowLabel: {
      fontFamily: fonts.ui,
      color: colors.ink,
      fontSize: 14,
      flex: 1,
    },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    stepBtn: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.creamDeep,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: { fontSize: 16, color: colors.ink, fontWeight: '700' },
    rowValue: {
      fontFamily: fonts.uiSemi,
      color: colors.ink,
      fontWeight: '600',
      minWidth: 48,
      textAlign: 'center',
    },
    hint: {
      fontFamily: fonts.ui,
      color: colors.muted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: spacing.sm,
    },
  });
}
