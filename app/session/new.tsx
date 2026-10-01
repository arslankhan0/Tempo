import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import { dateKey } from '@/lib/time';
import { useTaskStore } from '@/store/use-task-store';

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function NewSessionScreen() {
  const { isDark } = useAppTheme();
  const params = useLocalSearchParams<{ date?: string; taskId?: string }>();
  const tasks = useTaskStore((state) => state.tasks);
  const addManualSession = useTaskStore((state) => state.addManualSession);
  const availableTasks = useMemo(
    () => tasks.filter((task) => !task.isArchived).sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt),
    [tasks],
  );
  const [taskId, setTaskId] = useState(params.taskId ?? availableTasks[0]?.id ?? '');
  const [date, setDate] = useState(params.date ?? dateKey());
  const [startTime, setStartTime] = useState(currentTime);
  const [duration, setDuration] = useState('30');
  const [error, setError] = useState('');

  function save() {
    const durationMinutes = Number(duration);
    if (!taskId) return setError('Choose a task.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Use YYYY-MM-DD.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) return setError('Use 24-hour HH:MM.');
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 1_440) return setError('Enter 1–1440 minutes.');
    if (!addManualSession({ taskId, date, startTime, durationMinutes })) return setError('Check the date and time.');
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#091525' : '#F4F6F8' }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-md self-center">
          <View className="mb-7 flex-row items-center justify-between pt-2">
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#132338]">
              <Feather name="x" size={20} color={isDark ? '#FFFFFF' : '#102033'} />
            </Pressable>
            <Text className="text-lg font-bold text-[#102033] dark:text-white">Add time</Text>
            <View className="h-11 w-11" />
          </View>

          {availableTasks.length ? (
            <View className="gap-5">
              <View>
                <Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Task</Text>
                <View className="gap-2">
                  {availableTasks.map((task) => {
                    const selected = task.id === taskId;
                    return (
                      <Pressable
                        key={task.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => { setTaskId(task.id); setError(''); }}
                        className={`min-h-14 flex-row items-center rounded-2xl border px-4 ${selected ? 'border-[#2F7BFF] bg-[#EAF1FF] dark:bg-[#10245A]' : 'border-[#DDE4EA] bg-white dark:border-[#1B2D42] dark:bg-[#0D1724]'}`}
                      >
                        <View className={`mr-3 h-8 w-8 items-center justify-center rounded-lg ${selected ? 'bg-[#2F7BFF]' : 'bg-[#FF6B1A]'}`}>
                          <Text className="font-bold text-white">{task.priority}</Text>
                        </View>
                        <Text numberOfLines={1} className="flex-1 font-semibold text-[#102033] dark:text-white">{task.title}</Text>
                        {selected ? <Feather name="check" size={18} color="#2F7BFF" /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Date</Text>
                  <TextInput accessibilityLabel="Session date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={isDark ? '#60758C' : '#91A0AF'} className="field" />
                </View>
                <View className="w-28">
                  <Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Start</Text>
                  <TextInput accessibilityLabel="Start time" value={startTime} onChangeText={setStartTime} placeholder="HH:MM" placeholderTextColor={isDark ? '#60758C' : '#91A0AF'} className="field" />
                </View>
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Minutes</Text>
                <TextInput accessibilityLabel="Duration minutes" value={duration} onChangeText={setDuration} keyboardType="number-pad" className="field" />
                <View className="mt-3 flex-row gap-2">
                  {[15, 30, 45, 60].map((minutes) => (
                    <Pressable key={minutes} onPress={() => setDuration(String(minutes))} className={`min-h-11 flex-1 items-center justify-center rounded-xl ${duration === String(minutes) ? 'bg-[#FF6B1A]' : 'bg-white dark:bg-[#132338]'}`}>
                      <Text className={`text-xs font-bold ${duration === String(minutes) ? 'text-white' : 'text-[#526276] dark:text-[#8B9CAF]'}`}>{minutes}m</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {error ? <Text accessibilityRole="alert" className="text-sm text-[#D94B38]">{error}</Text> : null}
              <Pressable accessibilityRole="button" onPress={save} className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-[#FF6B1A] shadow-md">
                <Feather name="check" size={18} color="white" />
                <Text className="font-bold text-white">Save time</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => router.replace('/task/new')} className="min-h-40 items-center justify-center rounded-3xl border border-dashed border-[#C9D3DC] dark:border-[#2A3D52]">
              <Feather name="plus" size={23} color="#FF6B1A" />
              <Text className="mt-3 font-semibold text-[#102033] dark:text-white">Create a task first</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
