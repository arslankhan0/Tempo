import { Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { FocusCard } from '@/components/focus-card';
import { TaskActionsMenu } from '@/components/task-actions-menu';
import { TaskCard } from '@/components/task-card';
import { useNow } from '@/hooks/use-now';
import { useAppTheme } from '@/hooks/use-app-theme';
import { dateKey, formatDuration, getTrackedMs } from '@/lib/time';
import { getTasksForDate, isTaskCompleted } from '@/lib/tasks';
import { useTaskStore } from '@/store/use-task-store';
import type { Task } from '@/types/task';

export default function TodayScreen() {
  const now = useNow();
  const { isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const { tasks, sessions, completions, timer, dailyGoalMinutes } = useTaskStore();
  const [dateOverride, setDateOverride] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const today = dateKey(now);
  const selectedDate = dateOverride ?? today;
  const dayTasks = getTasksForDate(tasks, selectedDate).sort((a, b) => Number(isTaskCompleted(completions, a.id, selectedDate)) - Number(isTaskCompleted(completions, b.id, selectedDate)) || a.priority - b.priority || a.createdAt - b.createdAt);
  const tracked = getTrackedMs(sessions, timer, selectedDate, now);
  const completed = dayTasks.filter((task) => isTaskCompleted(completions, task.id, selectedDate)).length;
  const progress = Math.min(tracked / (dailyGoalMinutes * 60_000), 1);
  const suggestedTask = dayTasks.find((task) => !isTaskCompleted(completions, task.id, selectedDate));
  const selectedDay = new Date(`${selectedDate}T12:00:00`);
  const dateLabel = selectedDate === today
    ? new Date(now).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : selectedDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  function changeDay(offset: number) {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    const next = dateKey(date.getTime());
    setDateOverride(next === today ? null : next);
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#F4F6F8] dark:bg-[#0B1929]"
        contentContainerStyle={{ paddingHorizontal: width < 480 ? 20 : 28, paddingTop: 18, paddingBottom: 36 }}
      >
        <View className="w-full max-w-md self-center">
          <View className="mb-5 flex-row items-center justify-between">
            <Link href="/settings" asChild>
              <Pressable accessibilityRole="link" accessibilityLabel="Settings" className="h-11 w-11 items-center justify-center">
                <Feather accessible={false} aria-hidden name="sliders" size={20} color={isDark ? '#60758C' : '#526276'} />
              </Pressable>
            </Link>
            <Text className="text-sm font-semibold tracking-[3px] text-[#102033] dark:text-white">FOCUS</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New task"
              onPress={() => router.push({ pathname: '/task/new', params: { date: selectedDate } })}
              className="h-10 w-10 items-center justify-center rounded-full bg-[#FF6B1A] shadow-md"
            >
              <Feather accessible={false} aria-hidden name="plus" size={20} color="white" />
            </Pressable>
          </View>

          <View className="mb-3 flex-row items-center justify-center gap-1">
            <Pressable accessibilityRole="button" accessibilityLabel="Previous day" onPress={() => changeDay(-1)} className="h-11 w-11 items-center justify-center">
              <Feather accessible={false} aria-hidden name="chevron-left" size={17} color={isDark ? '#60758C' : '#738294'} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Return to today" onPress={() => setDateOverride(null)} className="min-h-11 min-w-32 items-center justify-center px-3">
              <Text className="text-xs font-medium text-[#526276] dark:text-[#8B9CAF]">{dateLabel}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Next day" onPress={() => changeDay(1)} className="h-11 w-11 items-center justify-center">
              <Feather accessible={false} aria-hidden name="chevron-right" size={17} color={isDark ? '#60758C' : '#738294'} />
            </Pressable>
          </View>

          <FocusCard now={now} suggestedTask={suggestedTask} onAdd={() => router.push({ pathname: '/task/new', params: { date: selectedDate } })} />

          <View className="mb-7 mt-2 flex-row rounded-2xl border border-[#DDE4EA] bg-white px-4 py-3 dark:border-[#1B2D42] dark:bg-[#0D1724]">
            <View className="flex-1 items-center border-r border-[#DDE4EA] dark:border-[#1B2D42]">
              <Text className="text-lg font-semibold text-[#102033] dark:text-white">{formatDuration(tracked)}</Text>
              <Text className="text-[10px] uppercase tracking-wider text-[#738294] dark:text-[#60758C]">Today</Text>
            </View>
            <View className="flex-1 items-center border-r border-[#DDE4EA] dark:border-[#1B2D42]">
              <Text className="text-lg font-semibold text-[#102033] dark:text-white">{completed}/{dayTasks.length}</Text>
              <Text className="text-[10px] uppercase tracking-wider text-[#738294] dark:text-[#60758C]">Done</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-semibold text-[#102033] dark:text-white">{Math.round(progress * 100)}%</Text>
              <Text className="text-[10px] uppercase tracking-wider text-[#738294] dark:text-[#60758C]">Goal</Text>
            </View>
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-[#102033] dark:text-white">Tasks</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add time manually"
              onPress={() => router.push({ pathname: '/session/new', params: { date: selectedDate } })}
              className="min-h-11 flex-row items-center gap-2 rounded-full bg-[#EAF1FF] px-4 dark:bg-[#10245A]"
            >
              <Feather name="edit-3" size={14} color="#2F7BFF" />
              <Text className="text-xs font-bold text-[#2F7BFF]">Add time</Text>
            </Pressable>
          </View>

          {dayTasks.length ? (
            dayTasks.map((task) => (
              <TaskCard key={task.id} task={task} date={selectedDate} now={now} onMenu={() => setSelectedTask(task)} />
            ))
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/task/new', params: { date: selectedDate } })}
              className="min-h-28 items-center justify-center rounded-2xl border border-dashed border-[#C9D3DC] bg-white dark:border-[#2A3D52] dark:bg-[#0D1724]"
            >
              <Feather accessible={false} aria-hidden name="plus" size={20} color="#FF6B1A" />
              <Text className="mt-2 text-sm text-[#526276] dark:text-[#8B9CAF]">Add task</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <TaskActionsMenu task={selectedTask} date={selectedDate} onClose={() => setSelectedTask(null)} />
    </>
  );
}
