import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getColors, type AppColors, type ColorScheme } from '@/theme/tokens';
import { loadSettings, updateSettings } from '@/services/settingsStore';

type ThemeContextValue = {
  colorScheme: ColorScheme;
  colors: AppColors;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');

  useEffect(() => {
    loadSettings()
      .then(settings => {
        setColorSchemeState(settings.colorScheme ?? 'dark');
      })
      .catch(() => undefined);
  }, []);

  const colors = useMemo(() => getColors(colorScheme), [colorScheme]);

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await updateSettings({ colorScheme: scheme });
  }, []);

  const value = useMemo(
    () => ({ colorScheme, colors, setColorScheme }),
    [colorScheme, colors, setColorScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
