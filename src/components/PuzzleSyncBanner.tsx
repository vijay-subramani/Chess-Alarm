import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { AppColors } from '@/theme/tokens';
import { fonts, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useThemedStyles } from '@/theme/useThemedStyles';
import { PuzzleSyncProgress } from '@/components/PuzzleSyncProgress';
import {
  refreshPuzzleSyncState,
  startPuzzleSync,
  subscribePuzzleSync,
  type PuzzleSyncState,
} from '@/services/puzzleStore';

type Props = {
  autoStart?: boolean;
};

export function PuzzleSyncBanner({ autoStart = true }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [sync, setSync] = useState<PuzzleSyncState | null>(null);

  useEffect(() => subscribePuzzleSync(setSync), []);

  useFocusEffect(
    useCallback(() => {
      refreshPuzzleSyncState()
        .then(state => {
          if (!autoStart || state.status === 'syncing') return;
          if (state.needsRefresh) {
            startPuzzleSync().catch(() => undefined);
          }
        })
        .catch(() => undefined);
    }, [autoStart]),
  );

  if (!sync) return null;

  const showBanner =
    !sync.playable || sync.status === 'syncing' || (!sync.fullSyncComplete && sync.playable);

  if (!showBanner) return null;

  const onRefresh = () => {
    if (sync.status === 'syncing') return;
    startPuzzleSync(true).catch(() => undefined);
  };

  const title = !sync.playable
    ? 'Download puzzles to use alarms'
    : sync.status === 'syncing'
      ? 'Downloading puzzle library'
      : 'Finish downloading puzzles';

  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{sync.message}</Text>
        {sync.status === 'syncing' || !sync.fullSyncComplete ? (
          <PuzzleSyncProgress sync={sync} compact />
        ) : null}
      </View>

      {sync.status === 'syncing' ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Pressable style={styles.button} onPress={onRefresh}>
          <Text style={styles.buttonText}>{sync.playable ? 'Resume' : 'Download'}</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    copy: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontFamily: fonts.uiSemi,
      fontSize: 13,
      fontWeight: '600',
      color: colors.ink,
      letterSpacing: 0.3,
    },
    message: {
      fontFamily: fonts.ui,
      fontSize: 12,
      color: colors.muted,
      lineHeight: 17,
    },
    button: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    buttonText: {
      fontFamily: fonts.uiSemi,
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
  });
}
