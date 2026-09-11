import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { AppColors } from '@/theme/tokens';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useThemedStyles } from '@/theme/useThemedStyles';
import type { Alarm } from '@/types/alarm';
import { formatAlarmTime } from '@/services/alarmStore';

type Props = {
  alarm: Alarm;
  meta: string;
  onToggle: (enabled: boolean) => void;
  onPress: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

export function AlarmRow({
  alarm,
  meta,
  onToggle,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={selectionMode ? undefined : onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.row,
        selectionMode && selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole={selectionMode ? 'checkbox' : 'button'}
      accessibilityState={selectionMode ? { checked: selected } : undefined}
      accessibilityHint={
        selectionMode
          ? 'Tap to select or deselect this alarm'
          : onLongPress
            ? 'Double tap and hold to delete this alarm'
            : undefined
      }
    >
      {selectionMode ? (
        <View style={[styles.selector, selected && styles.selectorOn]}>
          {selected ? <Text style={styles.selectorMark}>✓</Text> : null}
        </View>
      ) : null}
      <View style={styles.textCol}>
        <Text style={styles.time}>{formatAlarmTime(alarm.hour, alarm.minute)}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      {selectionMode ? null : (
        <Switch
          value={alarm.enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.toggleOff, true: colors.toggleOn }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.toggleOff}
        />
      )}
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      backgroundColor: colors.creamDeep,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    },
    rowSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    rowPressed: {
      opacity: 0.92,
    },
    selector: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    selectorOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    selectorMark: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 16,
    },
    textCol: {
      flex: 1,
      gap: 4,
    },
    time: {
      fontFamily: fonts.displaySemi,
      fontSize: 28,
      color: colors.ink,
      fontWeight: '600',
    },
    meta: {
      fontFamily: fonts.ui,
      fontSize: 12,
      color: colors.muted,
    },
  });
}
