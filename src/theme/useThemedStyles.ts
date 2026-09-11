import { useMemo } from 'react';
import type { AppColors } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

export function useThemedStyles<T>(factory: (colors: AppColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
