import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskForm } from '@/components/task-form';
import { useAppTheme } from '@/hooks/use-app-theme';
import { dateKey } from '@/lib/time';
import { useTaskStore } from '@/store/use-task-store';

export default function EditTaskScreen() {
  const { isDark } = useAppTheme(); const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTaskStore((state) => state.tasks.find((item) => item.id === id));
  const updateTask = useTaskStore((state) => state.updateTask); const archiveTask = useTaskStore((state) => state.archiveTask);
  if (!task) return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B1929' : '#F4F6F8' }}><View className="flex-1 items-center justify-center"><Text className="text-[#526276] dark:text-[#8B9CAF]">Task not found</Text></View></SafeAreaView>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B1929' : '#F4F6F8' }}><ScrollView contentContainerStyle={{ padding: 20 }}><View className="w-full max-w-md self-center"><View className="mb-7 flex-row items-center gap-3"><Pressable accessibilityLabel="Back" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#132338]"><Feather name="arrow-left" size={20} color={isDark ? '#8B9CAF' : '#526276'} /></Pressable><Text className="text-2xl font-bold text-[#102033] dark:text-white">Edit task</Text></View><TaskForm initial={task} defaultDate={task.date ?? dateKey()} onSave={(input) => { updateTask(task.id, input); router.back(); }} onArchive={() => { archiveTask(task.id); router.back(); }} /></View></ScrollView></SafeAreaView>;
}
