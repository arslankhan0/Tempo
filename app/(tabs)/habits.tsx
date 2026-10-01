import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { TaskActionsMenu } from '@/components/task-actions-menu';
import { useAppTheme } from '@/hooks/use-app-theme';
import { dateKey } from '@/lib/time';
import { getHabitStreak } from '@/lib/tasks';
import { useTaskStore } from '@/store/use-task-store';
import type { Task } from '@/types/task';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitsScreen() {
  const { isDark } = useAppTheme();
  const { tasks, completions } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const habits = tasks.filter((task) => task.type === 'habit' && !task.isArchived).sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
  return <><ScrollView className="flex-1 bg-[#F4F6F8] dark:bg-[#0B1929]" contentContainerStyle={{ padding: 20 }}><View className="w-full max-w-md self-center"><View className="mb-7 flex-row items-center justify-between"><Text className="text-3xl font-bold text-[#102033] dark:text-white">Habits</Text><Pressable accessibilityLabel="New habit" onPress={() => router.push({ pathname: '/task/new', params: { type: 'habit' } })} className="h-11 w-11 items-center justify-center rounded-full bg-[#FF6B1A]"><Feather name="plus" size={20} color="white" /></Pressable></View>
    {habits.map((habit) => { const streak = getHabitStreak(completions, habit, dateKey()); return <View key={habit.id} className="mb-3 rounded-2xl border border-[#DDE4EA] bg-white p-4 dark:border-[#1B2D42] dark:bg-[#0D1724]"><View className="mb-3 flex-row items-center"><View className="mr-3 h-8 min-w-8 items-center justify-center rounded-lg bg-[#FF6B1A]"><Text className="font-bold text-white">{habit.priority}</Text></View><View className="flex-1"><Text className="font-semibold text-[#102033] dark:text-white">{habit.title}</Text>{habit.note ? <Text numberOfLines={1} className="mt-1 text-xs text-[#738294] dark:text-[#8B9CAF]">{habit.note}</Text> : null}</View><View className="mr-1 flex-row items-center gap-1"><Feather name="zap" size={15} color="#FF6B1A" /><Text className="font-semibold text-[#102033] dark:text-white">{streak}</Text></View><Pressable accessibilityLabel={`Actions for ${habit.title}`} onPress={() => setSelectedTask(habit)} className="h-11 w-9 items-center justify-center"><Feather name="more-vertical" size={18} color={isDark ? '#60758C' : '#738294'} /></Pressable></View><View className="flex-row justify-between">{dayLabels.map((label, index) => <View key={index} className={`h-8 w-8 items-center justify-center rounded-full ${habit.repeatDays?.includes(index) ? 'bg-[#2F7BFF]' : 'bg-[#E8EDF1] dark:bg-[#132338]'}`}><Text className={habit.repeatDays?.includes(index) ? 'text-xs font-bold text-white' : 'text-xs text-[#91A0AF]'}>{label}</Text></View>)}</View></View>; })}
    {!habits.length ? <Pressable onPress={() => router.push({ pathname: '/task/new', params: { type: 'habit' } })} className="min-h-32 items-center justify-center rounded-2xl border border-dashed border-[#C9D3DC] dark:border-[#2A3D52]"><Feather name="repeat" size={22} color={isDark ? '#8B9CAF' : '#526276'} /><Text className="mt-2 text-sm text-[#526276] dark:text-[#8B9CAF]">Add habit</Text></Pressable> : null}
  </View></ScrollView><TaskActionsMenu task={selectedTask} date={dateKey()} onClose={() => setSelectedTask(null)} /></>;
}
