import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { AppColors } from '@/theme/tokens';
import { fonts, spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { AlarmSound } from '@/types/alarm';
import { BUILTIN_ALARM_SOUNDS } from '@/services/alarmSounds';
import { pickCustomAlarmSound } from '@/services/alarmSoundService';
import {
  loadSystemAlarmSounds,
  systemSoundsSectionTitle,
  toSystemAlarmSound,
  type SystemAlarmSoundItem,
} from '@/services/systemAlarmSounds';
import { previewAlarmSound, stopPreviewSound } from '@/services/ringAudio';

type Props = {
  value: AlarmSound;
  onChange: (sound: AlarmSound) => void;
};

export function AlarmSoundPicker({ value, onChange }: Props) {
  const styles = useThemedStyles(createStyles);
  const [picking, setPicking] = useState(false);
  const [systemSounds, setSystemSounds] = useState<SystemAlarmSoundItem[]>([]);
  const [loadingSystemSounds, setLoadingSystemSounds] = useState(true);
  const [systemSoundsError, setSystemSoundsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadSystemAlarmSounds()
      .then(list => {
        if (!mounted) return;
        setSystemSounds(list);
        setSystemSoundsError(null);
      })
      .catch(error => {
        if (!mounted) return;
        setSystemSounds([]);
        setSystemSoundsError(
          error instanceof Error ? error.message : 'Could not load alarm sounds.',
        );
      })
      .finally(() => {
        if (mounted) setLoadingSystemSounds(false);
      });

    return () => {
      mounted = false;
      stopPreviewSound().catch(() => undefined);
    };
  }, []);

  const selectSound = (sound: AlarmSound) => {
    onChange(sound);
    previewAlarmSound(sound).catch(() => undefined);
  };

  const onPickCustom = async () => {
    if (picking) return;
    setPicking(true);
    try {
      const picked = await pickCustomAlarmSound();
      if (picked) selectSound(picked);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not use that file. Try another audio track.';
      Alert.alert('Could not add sound', message);
    } finally {
      setPicking(false);
    }
  };

  const customSelected = value.kind === 'custom';
  const systemSelected = value.kind === 'system';

  return (
    <View style={styles.root}>
      <Text style={styles.sectionLabel}>App sounds</Text>
      <View style={styles.pills}>
        {BUILTIN_ALARM_SOUNDS.map(builtIn => {
          const selected = value.kind === 'builtin' && value.id === builtIn.id;
          return (
            <Pressable
              key={builtIn.id}
              onPress={() => selectSound({ kind: 'builtin', id: builtIn.id })}
              style={[styles.pill, selected && styles.pillOn]}
            >
              <Text style={[styles.pillText, selected && styles.pillTextOn]}>
                {builtIn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>{systemSoundsSectionTitle()}</Text>
      {loadingSystemSounds ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>
            {Platform.OS === 'android' ? 'Loading alarm sounds…' : 'Loading ringtones…'}
          </Text>
        </View>
      ) : systemSoundsError ? (
        <Text style={styles.hint}>{systemSoundsError}</Text>
      ) : systemSounds.length === 0 ? (
        <Text style={styles.hint}>
          {Platform.OS === 'android' ? 'No phone alarm sounds found.' : 'No ringtones found.'}
        </Text>
      ) : (
        <ScrollView style={styles.systemList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {systemSounds.map(item => {
            const selected =
              systemSelected && value.uri === item.uri && value.title === item.title;
            return (
              <Pressable
                key={`${item.soundId}:${item.uri}`}
                onPress={() => selectSound(toSystemAlarmSound(item))}
                style={[styles.systemRow, selected && styles.systemRowOn]}
              >
                <Text style={[styles.systemRowText, selected && styles.systemRowTextOn]} numberOfLines={1}>
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Pressable
        onPress={onPickCustom}
        disabled={picking}
        style={[styles.customRow, customSelected && styles.customRowOn]}
      >
        <View style={styles.customCopy}>
          <Text style={styles.customTitle}>
            {picking ? 'Opening library…' : 'Choose from device'}
          </Text>
          {customSelected ? (
            <Text style={styles.customName} numberOfLines={1}>
              {value.displayName}
            </Text>
          ) : (
            <Text style={styles.customHint}>Pick any music or audio file</Text>
          )}
        </View>
        {picking ? <ActivityIndicator size="small" /> : null}
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    root: { gap: spacing.sm },
    sectionLabel: {
      fontFamily: fonts.uiSemi,
      fontSize: 11,
      color: colors.muted,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginTop: spacing.xs,
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
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    loadingText: {
      fontFamily: fonts.ui,
      fontSize: 13,
      color: colors.muted,
    },
    hint: {
      fontFamily: fonts.ui,
      fontSize: 12,
      color: colors.muted,
      lineHeight: 17,
    },
    systemList: {
      maxHeight: 180,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },
    systemRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    systemRowOn: {
      backgroundColor: colors.creamDeep,
    },
    systemRowText: {
      fontFamily: fonts.ui,
      fontSize: 14,
      color: colors.ink,
    },
    systemRowTextOn: {
      fontFamily: fonts.uiSemi,
      color: colors.primary,
      fontWeight: '600',
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    customRowOn: {
      borderColor: colors.primary,
    },
    customCopy: { flex: 1, gap: 2 },
    customTitle: {
      fontFamily: fonts.uiSemi,
      fontSize: 14,
      fontWeight: '600',
      color: colors.ink,
    },
    customName: {
      fontFamily: fonts.ui,
      fontSize: 12,
      color: colors.primary,
    },
    customHint: {
      fontFamily: fonts.ui,
      fontSize: 12,
      color: colors.muted,
    },
  });
