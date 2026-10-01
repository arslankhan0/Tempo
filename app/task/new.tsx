import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskForm } from '@/components/task-form';
import { useAppTheme } from '@/hooks/use-app-theme';
import { dateKey } from '@/lib/time';
import { useTaskStore } from '@/store/use-task-store';

export default function NewTaskScreen() {
  const { isDark } = useAppTheme();
  const params = useLocalSearchParams<{ date?: string; type?: 'daily' | 'habit' }>();
  const addTask = useTaskStore((state) => state.addTask);
  return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B1929' : '#F4F6F8' }}><ScrollView contentContainerStyle={{ padding: 20 }}><View className="w-full max-w-md self-center"><View className="mb-7 flex-row items-center gap-3"><Pressable accessibilityLabel="Back" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#132338]"><Feather name="arrow-left" size={20} color={isDark ? '#8B9CAF' : '#526276'} /></Pressable><Text className="text-2xl font-bold text-[#102033] dark:text-white">New task</Text></View><TaskForm defaultDate={params.date ?? dateKey()} defaultType={params.type ?? 'daily'} onSave={(input) => { addTask(input); router.back(); }} /></View></ScrollView></SafeAreaView>;
}
