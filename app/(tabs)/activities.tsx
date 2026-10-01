import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { TaskActionsMenu } from '@/components/task-actions-menu';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useNow } from '@/hooks/use-now';
import { dateKey, formatDuration, getTaskTrackedMs } from '@/lib/time';
import { useTaskStore } from '@/store/use-task-store';
import type { Task } from '@/types/task';

export default function ActivitiesScreen() {
  const { isDark } = useAppTheme();
  const { tasks, sessions, timer } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const now = useNow();
  const activities = tasks.filter((task) => task.type === 'daily' && !task.isArchived).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.priority - b.priority || a.createdAt - b.createdAt);

  return <><ScrollView className="flex-1 bg-[#F4F6F8] dark:bg-[#0B1929]" contentContainerStyle={{ padding: 20 }}><View className="w-full max-w-md self-center"><View className="mb-7 flex-row items-center justify-between"><View><Text className="text-3xl font-bold text-[#102033] dark:text-white">Activities</Text><Text className="mt-1 text-sm text-[#738294] dark:text-[#8B9CAF]">{activities.length} total</Text></View><Pressable accessibilityLabel="New activity" onPress={() => router.push({ pathname: '/task/new', params: { type: 'daily', date: dateKey() } })} className="h-11 w-11 items-center justify-center rounded-full bg-[#FF6B1A]"><Feather name="plus" size={20} color="white" /></Pressable></View>
    <View className="gap-3">{activities.map((activity) => <View key={activity.id} className="flex-row items-center rounded-2xl border border-[#DDE4EA] bg-white p-3 dark:border-[#1B2D42] dark:bg-[#0D1724]"><View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E8] dark:bg-[#402012]"><Text className="font-bold text-[#FF6B1A]">{activity.priority}</Text></View><View className="flex-1"><Text numberOfLines={1} className="font-semibold text-[#102033] dark:text-white">{activity.title}</Text><Text className="mt-1 text-xs text-[#738294] dark:text-[#8B9CAF]">{activity.date ?? 'No date'} · {formatDuration(getTaskTrackedMs(sessions, timer, activity.id, now))}</Text></View><Pressable accessibilityLabel={`Actions for ${activity.title}`} onPress={() => setSelectedTask(activity)} className="h-11 w-11 items-center justify-center"><Feather name="more-vertical" size={18} color={isDark ? '#60758C' : '#738294'} /></Pressable></View>)}</View>
    {!activities.length ? <Pressable onPress={() => router.push({ pathname: '/task/new', params: { type: 'daily', date: dateKey() } })} className="min-h-36 items-center justify-center rounded-2xl border border-dashed border-[#C9D3DC] dark:border-[#2A3D52]"><Feather name="list" size={23} color="#FF6B1A" /><Text className="mt-2 font-semibold text-[#102033] dark:text-white">Add activity</Text></Pressable> : null}
  </View></ScrollView><TaskActionsMenu task={selectedTask} date={selectedTask?.date ?? dateKey()} onClose={() => setSelectedTask(null)} /></>;
}
