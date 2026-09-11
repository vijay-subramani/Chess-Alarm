import { StyleSheet, Text, View } from 'react-native';
import type { AppColors } from '@/theme/tokens';
import { fonts } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { PuzzleSyncState } from '@/services/puzzleStore';

type Props = {
  sync: PuzzleSyncState;
  compact?: boolean;
};

function batchStatusLabel(completed: number, running: number, total: number): string {
  if (running > 0) {
    return `${completed}/${total} batches · ${running} running`;
  }
  return `${completed}/${total} batches`;
}

export function PuzzleSyncProgress({ sync, compact = false }: Props) {
  const styles = useThemedStyles(createStyles);
  const syncing = sync.status === 'syncing';
  /** Zero downloaded puzzles is not zero playable puzzles — the app ships with a full library. */
  const cachedLabel = sync.count > 0 ? `${sync.count} puzzles downloaded` : 'using bundled puzzles';

  return (
    <View style={styles.wrap}>
      <View style={styles.overallTrack}>
        <View style={[styles.overallFill, { width: `${Math.round(sync.progress * 100)}%` }]} />
      </View>

      <Text style={styles.meta}>
        {sync.fullSyncComplete && !syncing
          ? `${sync.count} puzzles cached`
          : `${cachedLabel} · ${sync.completedSteps}/${sync.totalSteps} batches`}
        {sync.stepLabel ? ` · ${sync.stepLabel}` : ''}
      </Text>

      {!compact ? (
        <View style={styles.difficultyList}>
          {sync.difficultyProgress.map(row => {
            const batchRatio =
              row.totalSteps > 0 ? Math.min(row.completedSteps / row.totalSteps, 1) : 0;
            const puzzleRatio =
              row.target > 0 ? Math.min(row.current / row.target, 1) : 0;
            const fillRatio = syncing ? batchRatio : puzzleRatio;

            return (
              <View key={row.key} style={styles.difficultyRow}>
                <View style={styles.difficultyHeader}>
                  <Text style={styles.difficultyLabel}>{row.label}</Text>
                  <Text style={styles.difficultyCount}>
                    {syncing
                      ? `${batchStatusLabel(row.completedSteps, row.runningSteps, row.totalSteps)} · ${row.current}/${row.target} puzzles`
                      : `${row.current}/${row.target} puzzles`}
                  </Text>
                </View>
                <View style={styles.difficultyTrack}>
                  <View
                    style={[
                      styles.difficultyFill,
                      { width: `${Math.round(fillRatio * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      gap: 8,
    },
    overallTrack: {
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    overallFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    meta: {
      fontFamily: fonts.ui,
      fontSize: 11,
      color: colors.muted,
      lineHeight: 16,
    },
    difficultyList: {
      gap: 8,
      marginTop: 2,
    },
    difficultyRow: {
      gap: 4,
    },
    difficultyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    difficultyLabel: {
      fontFamily: fonts.uiSemi,
      fontSize: 11,
      fontWeight: '600',
      color: colors.ink,
    },
    difficultyCount: {
      fontFamily: fonts.ui,
      fontSize: 10,
      color: colors.muted,
    },
    difficultyTrack: {
      height: 3,
      borderRadius: 999,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    difficultyFill: {
      height: '100%',
      backgroundColor: colors.gold,
      borderRadius: 999,
    },
  });
}
