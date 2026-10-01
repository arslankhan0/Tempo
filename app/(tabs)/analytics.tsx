import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNow } from '@/hooks/use-now';
import { getHabitCompletionRate, getRangeDays, getTimePerTask, getTotalTimeForDay } from '@/lib/analytics';
import { dateKey, formatDuration } from '@/lib/time';
import { useTaskStore } from '@/store/use-task-store';

type Period = 'Day' | 'Week' | 'Month';

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('Week');
  const now = useNow();
  const { tasks, sessions, completions } = useTaskStore();
  const count = period === 'Day' ? 1 : period === 'Week' ? 7 : 30;
  const dates = getRangeDays(now, count); const start = new Date(`${dates[0]}T00:00:00`).getTime();
  const endDate = new Date(`${dates[dates.length - 1]}T00:00:00`); endDate.setDate(endDate.getDate() + 1);
  const daily = dates.map((date) => ({ date, total: getTotalTimeForDay(sessions, date) }));
  const total = daily.reduce((sum, item) => sum + item.total, 0); const max = Math.max(...daily.map((item) => item.total), 60_000);
  const topTasks = getTimePerTask(sessions, start, endDate.getTime()).slice(0, 5);
  const habits = tasks.filter((task) => task.type === 'habit'); const rate = getHabitCompletionRate(completions, habits, dates);
  return <ScrollView className="flex-1 bg-[#F4F6F8] dark:bg-[#0B1929]" contentContainerStyle={{ padding: 20 }}><View className="w-full max-w-md self-center"><Text className="mb-5 text-3xl font-bold text-[#102033] dark:text-white">Analytics</Text><View className="mb-6 flex-row rounded-2xl bg-[#E8EDF1] p-1 dark:bg-[#132338]">{(['Day','Week','Month'] as const).map((item) => <Pressable key={item} onPress={() => setPeriod(item)} className={`min-h-11 flex-1 items-center justify-center rounded-xl ${period === item ? 'bg-white dark:bg-[#253A52]' : ''}`}><Text className={`font-semibold ${period === item ? 'text-[#102033] dark:text-white' : 'text-[#738294]'}`}>{item}</Text></Pressable>)}</View>
    <View className="mb-4 flex-row gap-3"><View className="panel flex-1"><Text className="text-xs text-[#738294] dark:text-[#8B9CAF]">FOCUS</Text><Text className="mt-2 text-2xl font-bold text-[#102033] dark:text-white">{formatDuration(total)}</Text></View><View className="panel flex-1"><Text className="text-xs text-[#738294] dark:text-[#8B9CAF]">HABITS</Text><Text className="mt-2 text-2xl font-bold text-[#102033] dark:text-white">{Math.round(rate * 100)}%</Text></View></View>
    <View className="panel mb-4"><Text className="mb-5 text-lg font-semibold text-[#102033] dark:text-white">Focus by day</Text><View className="h-40 flex-row items-end gap-1">{daily.map((item) => <View key={item.date} className="flex-1 items-center justify-end"><View className="w-full rounded-t-md bg-[#2F7BFF]" style={{ height: Math.max(4, item.total / max * 125) }} /><Text className="mt-2 text-[9px] text-[#738294]">{period === 'Month' ? new Date(`${item.date}T12:00:00`).getDate() : new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US',{weekday:'narrow'})}</Text></View>)}</View></View>
    <View className="panel"><Text className="mb-4 text-lg font-semibold text-[#102033] dark:text-white">Top tasks</Text>{topTasks.map((item, index) => <View key={item.taskId} className="mb-3 flex-row items-center"><Text className="mr-3 text-xs text-[#738294]">{index + 1}</Text><Text className="flex-1 text-sm font-medium text-[#102033] dark:text-white">{item.title}</Text><Text className="text-sm text-[#526276] dark:text-[#8B9CAF]">{formatDuration(item.durationMs)}</Text></View>)}{!topTasks.length ? <Text className="text-sm text-[#738294] dark:text-[#8B9CAF]">No sessions yet.</Text> : null}</View>
    <Text className="mt-4 text-center text-xs text-[#738294]">Through {dateKey(now)}</Text></View></ScrollView>;
}
