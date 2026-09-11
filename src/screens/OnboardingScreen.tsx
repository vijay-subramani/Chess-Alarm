import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SunriseOrb, ORB_LEFT_CORNER } from '@/components/SunriseOrb';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { AppColors } from '@/theme/tokens';
import { fonts, navTypography, spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';
import {
  getNotificationStatus,
  getExactAlarmStatus,
  openBatterySettings,
  openExactAlarmSettings,
  openNotificationSettings,
  requestNotificationPermission,
  type PermissionStatus,
} from '@/services/permissions';
import { updateSettings } from '@/services/settingsStore';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type StepAction = 'notifications' | 'exact-alarm' | 'battery' | 'app-settings';

type Step = {
  id: string;
  title: string;
  body: string;
  cta: string;
  action: StepAction;
};

const ANDROID_STEPS: Step[] = [
  {
    id: 'notifications',
    title: 'Notifications',
    body: 'Show the ringing screen when the alarm fires.',
    cta: 'Allow notifications',
    action: 'notifications',
  },
  {
    id: 'exact-alarm',
    title: 'Alarms & reminders',
    body: 'Allow Chess Alarm to fire at the exact time you set. Opens your app on the system Alarms & reminders page.',
    cta: 'Open Alarms & reminders',
    action: 'exact-alarm',
  },
  {
    id: 'battery',
    title: 'Battery unrestricted',
    body: 'Keep the alarm alive after you swipe the app away.',
    cta: 'Open battery settings',
    action: 'battery',
  },
];

const IOS_STEPS: Step[] = [
  {
    id: 'notifications',
    title: 'Notifications',
    body: 'Required to ring and open the puzzle screen when your alarm fires — even if the app was closed.',
    cta: 'Allow notifications',
    action: 'notifications',
  },
  {
    id: 'time-sensitive',
    title: 'Time Sensitive alerts',
    body:
      'In Settings → Notifications → Chess Alarm, turn on Allow Notifications and Time Sensitive ' +
      'Notifications so Focus / Do Not Disturb does not silence your alarm.',
    cta: 'Open notification settings',
    action: 'app-settings',
  },
  {
    id: 'lock-behavior',
    title: 'Solve to dismiss',
    body:
      'When the alarm rings, tap the notification to open the app. Snooze and Turn Off stay locked ' +
      'until you solve the chess puzzle — closing the app does not skip that.',
    cta: 'Got it',
    action: 'app-settings',
  },
];

const STEPS = Platform.OS === 'ios' ? IOS_STEPS : ANDROID_STEPS;

export function OnboardingScreen({ navigation }: Props) {
  const styles = useThemedStyles(createStyles);
  const [index, setIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, PermissionStatus>>({});

  const step = STEPS[index];

  const finish = useCallback(async () => {
    await updateSettings({ onboardingDone: true });
    navigation.replace('Home');
  }, [navigation]);

  const onCta = async () => {
    if (step.action === 'notifications') {
      const status = await requestNotificationPermission();
      setStatuses(s => ({ ...s, [step.id]: status }));
    } else if (step.action === 'exact-alarm') {
      await openExactAlarmSettings();
      const status = await getExactAlarmStatus();
      setStatuses(s => ({ ...s, [step.id]: status }));
    } else if (step.action === 'battery') {
      await openBatterySettings();
      setStatuses(s => ({ ...s, [step.id]: 'granted' }));
    } else if (step.action === 'app-settings') {
      if (step.id === 'time-sensitive') {
        await openNotificationSettings();
      }
      setStatuses(s => ({ ...s, [step.id]: 'granted' }));
    }

    if (index < STEPS.length - 1) {
      setIndex(i => i + 1);
    } else {
      await finish();
    }
  };

  const refreshNotif = async () => {
    const status = await getNotificationStatus();
    setStatuses(s => ({ ...s, notifications: status }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <SunriseOrb size={180} style={styles.orb} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>Chess Alarm</Text>
        <Text style={styles.title}>Permissions that make the alarm reliable</Text>
        <Text style={styles.body}>
          {Platform.OS === 'ios'
            ? 'iOS uses notifications to wake you. Grant these so alarms still fire when the app is not open.'
            : 'Phones silence background apps. Grant these so Chess Alarm can wake you even when the screen is locked.'}
        </Text>

        {STEPS.map((s, i) => {
          const active = i === index;
          const done = statuses[s.id] === 'granted' || i < index;
          return (
            <View
              key={s.id}
              style={[styles.card, active && styles.cardActive, done && styles.cardDone]}
            >
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardBody}>{s.body}</Text>
            </View>
          );
        })}

        <View style={styles.footer}>
          <PrimaryButton label={step.cta} onPress={onCta} />
          <Pressable onPress={finish} style={styles.skip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
          {step.action === 'notifications' ? (
            <Pressable onPress={refreshNotif}>
              <Text style={styles.hint}>Refresh notification status</Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>
              Step {index + 1} of {STEPS.length}
            </Text>
          )}
        </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    zIndex: 1,
  },
    brand: {
      fontFamily: fonts.display,
      fontSize: navTypography.brandTitle,
      color: colors.ink,
      fontWeight: '700',
    },
    title: {
      fontFamily: fonts.uiSemi,
      fontSize: navTypography.sectionTitle,
      color: colors.ink,
      fontWeight: '600',
      marginTop: spacing.sm,
    },
  body: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
  },
  cardActive: {
    borderColor: colors.primary,
  },
  cardDone: {
    borderColor: colors.primary,
  },
  cardTitle: {
    fontFamily: fonts.uiSemi,
    fontWeight: '600',
    fontSize: 15,
    color: colors.ink,
  },
  cardBody: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  footer: { marginTop: spacing.lg, gap: spacing.md },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: colors.muted, fontFamily: fonts.ui, fontSize: 13 },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontFamily: fonts.ui,
    fontSize: 12,
  },
});
