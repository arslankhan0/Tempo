import { Feather } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { exportBackupFile, pickBackupFile } from '@/lib/backup-file';
import type { BackupData } from '@/lib/backup';
import { formatDuration } from '@/lib/time';
import { type ThemeMode, useSettingsStore } from '@/store/use-settings-store';
import { useTaskStore } from '@/store/use-task-store';

const appearances: { mode: ThemeMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { mode: 'system', label: 'System', icon: 'smartphone' },
  { mode: 'light', label: 'Light', icon: 'sun' },
  { mode: 'dark', label: 'Dark', icon: 'moon' },
];

const goalOptions = [30, 60, 120, 180, 240];

export default function SettingsScreen() {
  const { isDark, themeMode } = useAppTheme();
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const dailyGoalMinutes = useTaskStore((state) => state.dailyGoalMinutes);
  const setDailyGoal = useTaskStore((state) => state.setDailyGoal);
  const restoreData = useTaskStore((state) => state.restoreData);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState('');

  async function exportData() {
    setBusy('export');
    setMessage('');
    try {
      const { tasks, sessions, completions, timer, dailyGoalMinutes: goal } = useTaskStore.getState();
      await exportBackupFile({ tasks, sessions, completions, timer, dailyGoalMinutes: goal, themeMode });
      setMessage('Backup ready.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not export data.');
    } finally {
      setBusy(null);
    }
  }

  async function chooseImport() {
    setBusy('import');
    setMessage('');
    try {
      const backup = await pickBackupFile();
      if (backup) setPendingImport(backup);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import data.');
    } finally {
      setBusy(null);
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    restoreData(pendingImport);
    setThemeMode(pendingImport.themeMode);
    setPendingImport(null);
    setMessage('Backup imported.');
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F4F6F8] dark:bg-[#0B1929]"
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 28 }}
    >
      <View className="w-full max-w-md self-center gap-7">
        <Text className="text-3xl font-bold text-[#102033] dark:text-white">Settings</Text>

        <View>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#738294] dark:text-[#60758C]">Appearance</Text>
          <View className="flex-row gap-2 rounded-2xl border border-[#DDE4EA] bg-white p-2 dark:border-[#1B2D42] dark:bg-[#0D1724]">
            {appearances.map((item) => {
              const selected = themeMode === item.mode;
              return (
                <Pressable
                  key={item.mode}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${item.label} appearance`}
                  onPress={() => setThemeMode(item.mode)}
                  className={`min-h-16 flex-1 items-center justify-center gap-1 rounded-xl ${selected ? 'bg-[#2F7BFF]' : ''}`}
                >
                  <Feather accessible={false} aria-hidden name={item.icon} size={19} color={selected ? 'white' : isDark ? '#8B9CAF' : '#526276'} />
                  <Text className={`text-xs font-semibold ${selected ? 'text-white' : 'text-[#526276] dark:text-[#8B9CAF]'}`}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#738294] dark:text-[#60758C]">Focus</Text>
          <Pressable onPress={() => router.push('/music')} className="min-h-16 flex-row items-center rounded-2xl border border-[#DDE4EA] bg-white px-4 dark:border-[#1B2D42] dark:bg-[#0D1724]">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0E8] dark:bg-[#402012]"><Feather name="music" size={18} color="#FF6B1A" /></View>
            <Text className="flex-1 font-semibold text-[#102033] dark:text-white">Focus music</Text>
            <Feather name="chevron-right" size={19} color={isDark ? '#60758C' : '#738294'} />
          </Pressable>
        </View>

        <View>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#738294] dark:text-[#60758C]">Daily goal</Text>
          <View className="flex-row flex-wrap gap-2">
            {goalOptions.map((minutes) => {
              const selected = dailyGoalMinutes === minutes;
              return (
                <Pressable
                  key={minutes}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${minutes} minute daily focus goal`}
                  onPress={() => setDailyGoal(minutes)}
                  className={`min-h-12 min-w-20 items-center justify-center rounded-xl border px-4 ${selected ? 'border-[#2F7BFF] bg-[#2F7BFF]' : 'border-[#DDE4EA] bg-white dark:border-[#1B2D42] dark:bg-[#0D1724]'}`}
                >
                  <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-[#102033] dark:text-white'}`}>{formatDuration(minutes * 60_000)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="rounded-2xl border border-[#DDE4EA] bg-white p-5 dark:border-[#1B2D42] dark:bg-[#0D1724]">
          <View className="flex-row items-center gap-3">
            <Feather accessible={false} aria-hidden name="hard-drive" size={18} color={isDark ? '#8B9CAF' : '#526276'} />
            <Text className="flex-1 text-sm text-[#526276] dark:text-[#8B9CAF]">Saved locally in tempo-data.json</Text>
          </View>
        </View>

        <View>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#738294] dark:text-[#60758C]">Data</Text>
          <View className="gap-3 rounded-2xl border border-[#DDE4EA] bg-white p-4 dark:border-[#1B2D42] dark:bg-[#0D1724]">
            <Pressable accessibilityRole="button" disabled={busy !== null} onPress={exportData} className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-[#FF6B1A] disabled:opacity-50">
              <Feather name="upload" size={18} color="white" />
              <Text className="font-bold text-white">{busy === 'export' ? 'Exporting…' : 'Export file'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy !== null} onPress={chooseImport} className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-[#2F7BFF] disabled:opacity-50">
              <Feather name="download" size={18} color="#2F7BFF" />
              <Text className="font-bold text-[#2F7BFF]">{busy === 'import' ? 'Opening…' : 'Import file'}</Text>
            </Pressable>
            {message ? <Text accessibilityRole="alert" className="text-center text-sm text-[#526276] dark:text-[#8B9CAF]">{message}</Text> : null}
          </View>
        </View>

        <View>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#738294] dark:text-[#60758C]">About</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/licenses' as Href)}
            className="min-h-16 flex-row items-center rounded-2xl border border-[#DDE4EA] bg-white px-4 dark:border-[#1B2D42] dark:bg-[#0D1724]"
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FF] dark:bg-[#142B51]">
              <Feather accessible={false} aria-hidden name="file-text" size={18} color="#2F7BFF" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-[#102033] dark:text-white">Open-source licenses</Text>
              <Text className="mt-1 text-xs text-[#738294] dark:text-[#8B9CAF]">MIT License</Text>
            </View>
            <Feather accessible={false} aria-hidden name="chevron-right" size={19} color={isDark ? '#60758C' : '#738294'} />
          </Pressable>
        </View>
      </View>

      <Modal visible={pendingImport !== null} transparent animationType="fade" onRequestClose={() => setPendingImport(null)}>
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-[#0D1724]">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#FFF0E8] dark:bg-[#402012]">
              <Feather name="download" size={21} color="#FF6B1A" />
            </View>
            <Text className="text-xl font-bold text-[#102033] dark:text-white">Replace current data?</Text>
            <Text className="mt-2 text-sm leading-5 text-[#526276] dark:text-[#8B9CAF]">The imported file will replace tasks, sessions, completions, timer state, goal, and appearance.</Text>
            <View className="mt-6 flex-row gap-3">
              <Pressable onPress={() => setPendingImport(null)} className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#E8EDF1] dark:bg-[#132338]"><Text className="font-bold text-[#526276] dark:text-white">Cancel</Text></Pressable>
              <Pressable onPress={confirmImport} className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#FF6B1A]"><Text className="font-bold text-white">Import</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
