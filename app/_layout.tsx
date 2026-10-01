import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeController } from '@/components/theme-controller';
import { LocalDataFile } from '@/components/local-data-file';
import { MusicPlayerProvider } from '@/components/music-player-provider';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTaskStore } from '@/store/use-task-store';

export default function RootLayout() {
  const { isDark } = useAppTheme();
  const hydrated = useTaskStore((state) => state.hydrated);
  const storageError = useTaskStore((state) => state.storageError);
  return (
    <SafeAreaProvider>
      <ThemeController />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="flex-1 bg-canvas dark:bg-[#0B1929]">
        {storageError ? (
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#F5E6D5' }}><View className="px-6 py-3">
            <Text accessibilityRole="alert" className="text-sm text-ink">{storageError}</Text>
          </View></SafeAreaView>
        ) : null}
        {hydrated ? (
          <>
            <LocalDataFile />
            <MusicPlayerProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: isDark ? '#0B1929' : '#F7F8F2' } }} />
            </MusicPlayerProvider>
          </>
        ) : (
          <View className="flex-1 items-center justify-center gap-4">
            <ActivityIndicator size="large" color={isDark ? '#FF6B1A' : '#2F7BFF'} />
            <Text className="text-base text-ink dark:text-white">Getting your day ready…</Text>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
