import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { formatDuration, getTaskTrackedMs } from '@/lib/time';
import { isTaskCompleted } from '@/lib/tasks';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTaskStore } from '@/store/use-task-store';
import type { Task } from '@/types/task';

export function TaskCard({ task, date, now, onMenu }: { task: Task; date: string; now: number; onMenu: () => void }) {
  const { isDark } = useAppTheme();
  const { timer, sessions, completions, toggleCompletion, startTimer, pauseTimer } = useTaskStore();
  const completed = isTaskCompleted(completions, task.id, date);
  const active = timer?.taskId === task.id; const running = active && timer.startedAt !== null;
  const tracked = getTaskTrackedMs(sessions, timer, task.id, now);
  return <View className={`mb-3 flex-row items-center rounded-2xl border px-3 py-3 ${active ? 'border-[#6F83E8] bg-[#EEF0FF] dark:border-[#3D50B8] dark:bg-[#10155B]' : 'border-[#DDE4EA] bg-white dark:border-[#192A3D] dark:bg-[#07101B]'}`}>
    <Pressable accessibilityRole="checkbox" accessibilityLabel={`Complete ${task.title}`} accessibilityState={{ checked: completed }} onPress={() => toggleCompletion(task.id, date)} className="h-11 w-11 items-center justify-center"><View className={`h-5 w-5 items-center justify-center rounded-full border ${completed ? 'border-[#2F7BFF] bg-[#2F7BFF]' : 'border-[#91A0AF] dark:border-[#53677C]'}`}>{completed ? <Feather name="check" size={12} color="white" /> : null}</View></Pressable>
    <View className="min-h-11 flex-1 justify-center px-1"><View className="mb-1 flex-row items-center gap-2"><View className="h-5 min-w-5 items-center justify-center rounded-md bg-[#FF6B1A]"><Text className="text-[10px] font-bold text-white">{task.priority}</Text></View><Text numberOfLines={1} className={`flex-1 text-[15px] font-semibold ${completed ? 'text-[#91A0AF] line-through' : 'text-[#102033] dark:text-white'}`}>{task.title}</Text>{task.type === 'habit' ? <Feather name="repeat" size={13} color={isDark ? '#8B9CAF' : '#526276'} /> : null}</View><Text numberOfLines={1} className="pl-7 text-xs text-[#738294] dark:text-[#60758C]">{formatDuration(tracked)}{task.note ? ` · ${task.note}` : ''}</Text></View>
    {!completed ? <Pressable accessibilityLabel={`${running ? 'Pause' : 'Start'} ${task.title}`} onPress={() => running ? pauseTimer() : startTimer(task.id)} className={`h-11 w-11 items-center justify-center rounded-full ${active ? 'bg-[#FF6B1A]' : 'bg-[#E8EDF1] dark:bg-[#132338]'}`}><Feather name={running ? 'pause' : 'play'} size={16} color={active ? 'white' : isDark ? '#8B9CAF' : '#526276'} /></Pressable> : null}
    <Pressable accessibilityLabel={`Actions for ${task.title}`} onPress={onMenu} className="h-11 w-9 items-center justify-center"><Feather name="more-vertical" size={17} color={isDark ? '#60758C' : '#738294'} /></Pressable>
  </View>;
}
