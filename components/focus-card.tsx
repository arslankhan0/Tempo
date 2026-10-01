import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { formatTimer, getTimerElapsed } from '@/lib/time';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTaskStore } from '@/store/use-task-store';
import type { Task } from '@/types/task';

type FocusCardProps = {
  now: number;
  suggestedTask?: Task;
  onAdd: () => void;
};

export function FocusCard({ now, suggestedTask, onAdd }: FocusCardProps) {
  const { isDark } = useAppTheme();
  const { timer, tasks, startTimer, pauseTimer, finishTimer } = useTaskStore();
  const task = tasks.find((item) => item.id === timer?.taskId) ?? suggestedTask;
  const elapsed = getTimerElapsed(timer, now);
  const running = timer?.startedAt != null;
  const progress = task ? Math.min(elapsed / (task.estimateMinutes * 60_000), 1) : 0;

  function toggleTimer() {
    if (running) pauseTimer();
    else if (task) startTimer(task.id);
    else onAdd();
  }

  return (
    <View className="items-center px-2 pb-5 pt-2">
      <Text className="mb-2 text-[10px] font-semibold tracking-[3px] text-[#738294] dark:text-[#60758C]">
        {running ? 'FOCUSING' : timer ? 'PAUSED' : 'READY'}
      </Text>
      <Text
        accessibilityLabel={`${formatTimer(elapsed)} elapsed`}
        className="text-[64px] font-light leading-[74px] tracking-[-3px] text-[#102033] dark:text-white"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatTimer(elapsed)}
      </Text>
      <Text numberOfLines={1} className="mt-1 max-w-[280px] text-center text-sm text-[#526276] dark:text-[#8B9CAF]">
        {task?.title ?? 'Select a task'}
      </Text>

      <View className="mt-6 h-1 w-full overflow-hidden rounded-full bg-[#DCE4EA] dark:bg-[#1A2A3F]">
        <View className="h-1 rounded-full bg-[#2F7BFF]" style={{ width: `${progress * 100}%` }} />
      </View>

      <View className="mt-6 flex-row items-center gap-5">
        {timer ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Finish session"
            onPress={finishTimer}
            className="h-12 w-12 items-center justify-center rounded-full border border-[#CBD6DF] dark:border-[#2C4057]"
          >
            <Feather accessible={false} aria-hidden name="square" size={17} color={isDark ? '#8B9CAF' : '#526276'} />
          </Pressable>
        ) : <View className="h-12 w-12" />}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pause timer' : task ? 'Start timer' : 'Add task'}
          onPress={toggleTimer}
          className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF6B1A] shadow-lg"
        >
          <Feather
            accessible={false}
            aria-hidden
            name={running ? 'pause' : task ? 'play' : 'plus'}
            size={27}
            color="#FFFFFF"
          />
        </Pressable>

        <View className="h-12 w-12 items-center justify-center">
          {task ? <Text className="text-xs text-[#738294] dark:text-[#60758C]">{task.estimateMinutes}m</Text> : null}
        </View>
      </View>
    </View>
  );
}
