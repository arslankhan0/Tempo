import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';

import { useSettingsStore } from '@/store/use-settings-store';

export function ThemeController() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(themeMode);
  }, [setColorScheme, themeMode]);

  return null;
}
