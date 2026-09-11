import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

export const ORB_LEFT_CORNER = { top: -60, left: -70 } as const;

export function SunriseOrb({ size = 160, style }: { size?: number; style?: object }) {
  const { colors } = useTheme();

  return (
    <View
      pointerEvents="none"
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.sunrise,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    top: -48,
    left: -36,
  },
});
