import { useState, useCallback, useMemo, useContext, type ReactNode } from 'react';
import { ThemeContext, type ThemeMode, type ThemeColors, lightColors, darkColors } from '@/lib/theme';

const STORAGE_KEY = 'shadow-alert-theme';

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const newMode: ThemeMode = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, newMode);
      } catch {}
      return newMode;
    });
  }, []);

  const colors: ThemeColors = useMemo(() => (mode === 'dark' ? darkColors : lightColors), [mode]);

  const value = useMemo(
    () => ({ mode, colors, toggleTheme, setTheme }),
    [mode, colors, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
