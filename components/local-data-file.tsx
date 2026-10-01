import { useEffect, useRef } from 'react';

import { readLocalDataFile, writeLocalDataFile } from '@/lib/backup-file';
import { useSettingsStore } from '@/store/use-settings-store';
import { useTaskStore } from '@/store/use-task-store';

export function LocalDataFile() {
  const tasks = useTaskStore((state) => state.tasks);
  const sessions = useTaskStore((state) => state.sessions);
  const completions = useTaskStore((state) => state.completions);
  const timer = useTaskStore((state) => state.timer);
  const dailyGoalMinutes = useTaskStore((state) => state.dailyGoalMinutes);
  const restoreData = useTaskStore((state) => state.restoreData);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      try {
        const saved = readLocalDataFile();
        if (saved) {
          restoreData(saved);
          setThemeMode(saved.themeMode);
          return;
        }
      } catch {
        // A malformed local mirror is replaced with the validated persisted state below.
      }
    }
    try {
      writeLocalDataFile({ tasks, sessions, completions, timer, dailyGoalMinutes, themeMode });
    } catch {
      // AsyncStorage remains the recovery source if the local mirror cannot be written.
    }
  }, [completions, dailyGoalMinutes, restoreData, sessions, setThemeMode, tasks, themeMode, timer]);

  return null;
}
