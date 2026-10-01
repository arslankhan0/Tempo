import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/use-settings-store';

export function useAppTheme() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemTheme = useSystemColorScheme();
  const resolvedTheme = themeMode === 'system' ? (systemTheme ?? 'light') : themeMode;

  return {
    themeMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
  };
}
