import { Pressable, StyleSheet, Text } from 'react-native';
import type { AppColors } from '@/theme/tokens';
import { fonts } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
      width: '100%',
    },
    label: {
      color: colors.onPrimary,
      fontFamily: fonts.uiSemi,
      fontWeight: '600',
      fontSize: 15,
    },
  });
}
