import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlarmClockPicker } from '@/components/alarm/AlarmClockPicker';
import { AlarmSoundPicker } from '@/components/alarm/AlarmSoundPicker';
import { NavBackLink } from '@/components/NavLink';
import type { AppColors } from '@/theme/tokens';
import { fonts, navTypography, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { Alarm, AlarmPuzzleSettings, AlarmSound, Difficulty, MateIn } from '@/types/alarm';
import { DAY_LABELS, DEFAULT_ALARM_PUZZLE, DEFAULT_ALARM_SOUND } from '@/types/alarm';
import {
  alarmLimitMessage,
  canAddAlarm,
  createAlarmId,
  loadAlarms,
  normalizeAlarm,
  saveAlarms,
} from '@/services/alarmStore';
import {
  cancelAlarmNotifications,
  scheduleAlarmNotification,
} from '@/services/alarmScheduler';
import { showAlarmSetConfirmation } from '@/services/alarmSetFeedback';
import { loadSettings } from '@/services/settingsStore';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmEdit'>;

export function AlarmEditScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const editId = route.params?.id;
  const isNew = !editId;

  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(30);
  const [label, setLabel] = useState('Morning Tactics');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [enabled, setEnabled] = useState(true);
  const [initialEnabled, setInitialEnabled] = useState(true);
  const [sound, setSound] = useState<AlarmSound>({ ...DEFAULT_ALARM_SOUND });
  const [puzzle, setPuzzle] = useState<AlarmPuzzleSettings>({ ...DEFAULT_ALARM_PUZZLE });
  const [loaded, setLoaded] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      loadAlarms().then(existing => {
        if (!canAddAlarm(existing.length)) {
          Alert.alert('Alarm limit reached', alarmLimitMessage(), [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        loadSettings().then(settings => {
          setPuzzle({
            difficulty: settings.difficulty,
            mateIn: settings.mateIn,
            hintAfter: settings.hintAfter,
          });
          setSound(settings.defaultAlarmSound);
          setLoaded(true);
        });
      });
      return;
    }

    loadAlarms().then(list => {
      const found = list.find(a => a.id === editId);
      if (found) {
        const alarm = normalizeAlarm(found);
        setHour(alarm.hour);
        setMinute(alarm.minute);
        setLabel(alarm.label);
        setDays(alarm.days);
        setEnabled(alarm.enabled);
        setInitialEnabled(alarm.enabled);
        setSound(alarm.sound);
        setPuzzle({ ...alarm.puzzle });
      }
      setLoaded(true);
    });
  }, [editId, isNew, navigation]);

  const title = useMemo(() => (isNew ? 'Add alarm' : 'Edit alarm'), [isNew]);

  const toggleDay = (d: number) => {
    setDays(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()));
  };

  const onSave = async () => {
    const alarms = await loadAlarms();
    if (isNew && !canAddAlarm(alarms.length)) {
      Alert.alert('Alarm limit reached', alarmLimitMessage());
      return;
    }
    const nextAlarm: Alarm = normalizeAlarm({
      id: editId ?? createAlarmId(),
      hour,
      minute,
      label: label.trim() || 'Alarm',
      days,
      enabled,
      sound,
      puzzle,
    });
    const next = isNew
      ? [...alarms, nextAlarm]
      : alarms.map(a => (a.id === nextAlarm.id ? nextAlarm : a));
    await saveAlarms(next);
    await scheduleAlarmNotification(nextAlarm);
    if (nextAlarm.enabled && (isNew || !initialEnabled)) {
      showAlarmSetConfirmation(nextAlarm);
    }
    navigation.goBack();
  };

  const onDelete = async () => {
    if (!editId) return;
    const alarms = await loadAlarms();
    await saveAlarms(alarms.filter(a => a.id !== editId));
    await cancelAlarmNotifications(editId);
    navigation.goBack();
  };

  if (!loaded) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <NavBackLink label="Alarms" onPress={() => navigation.goBack()} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.topActions}>
            {!isNew ? (
              <Pressable onPress={onDelete} hitSlop={8}>
                <Text style={styles.deleteAction}>Delete</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onSave} hitSlop={8}>
              <Text style={styles.saveAction}>Save</Text>
            </Pressable>
          </View>
        </View>

        <AlarmClockPicker
          hour={hour}
          minute={minute}
          onChange={(nextHour, nextMinute) => {
            setHour(nextHour);
            setMinute(nextMinute);
          }}
        />

        <Text style={styles.label}>Label</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          style={styles.input}
          placeholder="Morning Tactics"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>Repeat</Text>
        <View style={styles.days}>
          {DAY_LABELS.map((name, i) => {
            const on = days.includes(i);
            return (
              <Pressable
                key={name}
                onPress={() => toggleDay(i)}
                style={[styles.dayChip, on && styles.dayChipOn]}
              >
                <Text style={[styles.dayText, on && styles.dayTextOn]}>{name[0]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => setEnabled(e => !e)}>
          <Text style={styles.enabled}>
            {enabled ? 'Enabled' : 'Disabled'} — tap to toggle
          </Text>
        </Pressable>

        <Text style={styles.label}>Sound</Text>
        <Text style={styles.hint}>
          App and phone alarm sounds play on the ring screen. Custom music from your library too.
          Notifications use app sounds for phone/system picks.
        </Text>
        <AlarmSoundPicker value={sound} onChange={setSound} />

        <Text style={styles.label}>Puzzle for this alarm</Text>
        <Text style={styles.hint}>Overrides the global defaults in Settings for this alarm only.</Text>

        <Text style={styles.subLabel}>Difficulty</Text>
        <View style={styles.pills}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
            const on = puzzle.difficulty === d;
            return (
              <Pressable
                key={d}
                onPress={() => setPuzzle(p => ({ ...p, difficulty: d }))}
                style={[styles.pill, on && styles.pillOn]}
              >
                <Text style={[styles.pillText, on && styles.pillTextOn]}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.subLabel}>Mate in</Text>
        <View style={styles.pills}>
          {([1, 2, 3] as MateIn[]).map(n => {
            const on = puzzle.mateIn === n;
            return (
              <Pressable
                key={n}
                onPress={() => setPuzzle(p => ({ ...p, mateIn: n }))}
                style={[styles.pill, on && styles.pillOn]}
              >
                <Text style={[styles.pillText, on && styles.pillTextOn]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Hint after wrong moves</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setPuzzle(p => ({ ...p, hintAfter: Math.max(1, p.hintAfter - 1) }))}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{puzzle.hintAfter}</Text>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setPuzzle(p => ({ ...p, hintAfter: Math.min(8, p.hintAfter + 1) }))}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 40,
    zIndex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: navTypography.pageTitle,
    color: colors.ink,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  saveAction: {
    fontFamily: fonts.uiSemi,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteAction: {
    fontFamily: fonts.uiSemi,
    color: '#E85D5D',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  subLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
    marginTop: -4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.ink,
  },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dayChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: { color: colors.ink, fontFamily: fonts.uiSemi, fontWeight: '600' },
  dayTextOn: { color: colors.onPrimary },
  enabled: {
    fontFamily: fonts.ui,
    color: colors.muted,
    fontSize: 13,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepperLabel: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
    paddingRight: spacing.md,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 20,
  },
  stepValue: {
    fontFamily: fonts.uiSemi,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    minWidth: 20,
    textAlign: 'center',
  },
});
