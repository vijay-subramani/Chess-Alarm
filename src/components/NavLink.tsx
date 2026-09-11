import { Pressable, StyleSheet, Text } from 'react-native';
import type { AppColors } from '@/theme/tokens';
import { fonts, navTypography } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';

type BackProps = {
  label: string;
  onPress: () => void;
};

export function NavBackLink({ label, onPress }: BackProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={styles.backRoot}>
        <Text style={styles.backChevron}>‹</Text>
        <Text style={styles.backLabel}> {label}</Text>
      </Text>
    </Pressable>
  );
}

type ForwardProps = {
  label: string;
  onPress?: () => void;
  style?: object;
  /** Match chevron alignment to row labels (e.g. Settings list rows). */
  variant?: 'link' | 'row';
};

export function NavForwardLink({ label, onPress, style, variant = 'link' }: ForwardProps) {
  const styles = useThemedStyles(createStyles);
  const rootStyle = variant === 'row' ? styles.forwardRootRow : styles.forwardRoot;
  const labelStyle = variant === 'row' ? styles.forwardRowLabel : styles.forwardLabel;
  const chevronStyle = variant === 'row' ? styles.forwardChevronRow : styles.forwardChevron;

  const content = (
    <Text style={rootStyle}>
      <Text style={[labelStyle, style]}>{label}</Text>
      <Text style={chevronStyle}> ›</Text>
    </Text>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {content}
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  const backLabelLine = navTypography.backLabel + 6;
  const linkLabelLine = navTypography.linkLabel + 6;

  return StyleSheet.create({
    backRoot: {
      fontFamily: fonts.uiSemi,
      fontSize: navTypography.backLabel,
      lineHeight: backLabelLine,
      color: colors.primary,
      fontWeight: '600',
      includeFontPadding: false,
    },
    backChevron: {
      fontSize: navTypography.backChevron,
      lineHeight: backLabelLine,
      transform: [{ translateY: navTypography.chevronNudge.back }],
    },
    backLabel: {
      fontSize: navTypography.backLabel,
      lineHeight: backLabelLine,
    },
    forwardRoot: {
      fontFamily: fonts.uiSemi,
      fontSize: navTypography.linkLabel,
      lineHeight: linkLabelLine,
      color: colors.primary,
      fontWeight: '600',
      includeFontPadding: false,
    },
    forwardRootRow: {
      fontFamily: fonts.ui,
      fontSize: 14,
      lineHeight: 20,
      color: colors.primary,
      fontWeight: '600',
      includeFontPadding: false,
    },
    forwardLabel: {
      fontSize: navTypography.linkLabel,
      lineHeight: linkLabelLine,
    },
    forwardRowLabel: {
      fontSize: 14,
      lineHeight: 20,
    },
    forwardChevron: {
      fontSize: navTypography.linkChevron,
      lineHeight: linkLabelLine,
      transform: [{ translateY: navTypography.chevronNudge.linkForward }],
    },
    forwardChevronRow: {
      fontSize: navTypography.linkChevron,
      lineHeight: 20,
      transform: [{ translateY: navTypography.chevronNudge.rowForward }],
    },
  });
}
