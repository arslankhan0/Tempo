import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import type { Task, TaskInput, TaskType } from '@/types/task';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = { initial?: Task; defaultDate: string; defaultType?: TaskType; onSave: (input: TaskInput) => void; onArchive?: () => void };

export function TaskForm({ initial, defaultDate, defaultType = 'daily', onSave, onArchive }: Props) {
  const { isDark } = useAppTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [type, setType] = useState<TaskType>(initial?.type ?? defaultType);
  const [priority, setPriority] = useState(String(initial?.priority ?? 1));
  const [minutes, setMinutes] = useState(String(initial?.estimateMinutes ?? 25));
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [repeatDays, setRepeatDays] = useState(initial?.repeatDays ?? [1, 2, 3, 4, 5]);
  const [error, setError] = useState('');

  function submit() {
    const parsedPriority = Number(priority);
    const parsedMinutes = Number(minutes);
    if (!title.trim()) return setError('Enter a task name.');
    if (!Number.isInteger(parsedPriority) || parsedPriority < 1) return setError('Priority must be 1 or higher.');
    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 1) return setError('Minutes must be 1 or higher.');
    if (type === 'daily' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Use YYYY-MM-DD for the date.');
    if (type === 'habit' && !repeatDays.length) return setError('Choose at least one repeat day.');
    onSave({ title: title.trim(), note: note.trim() || undefined, type, priority: parsedPriority, estimateMinutes: parsedMinutes, date: type === 'daily' ? date : undefined, repeatDays: type === 'habit' ? repeatDays : undefined });
  }

  return (
    <View className="gap-5">
      <View className="flex-row gap-2 rounded-2xl bg-[#E8EDF1] p-1 dark:bg-[#132338]">
        {(['daily', 'habit'] as const).map((item) => <Pressable key={item} onPress={() => setType(item)} className={`min-h-12 flex-1 items-center justify-center rounded-xl ${type === item ? 'bg-white dark:bg-[#253A52]' : ''}`}><Text className={`font-semibold capitalize ${type === item ? 'text-[#102033] dark:text-white' : 'text-[#738294] dark:text-[#8B9CAF]'}`}>{item}</Text></Pressable>)}
      </View>
      <View><Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Name</Text><TextInput accessibilityLabel="Task name" value={title} onChangeText={setTitle} autoFocus placeholder="Task name" placeholderTextColor={isDark ? '#60758C' : '#91A0AF'} className="field" /></View>
      <View><Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Note <Text className="font-normal text-[#738294]">(optional)</Text></Text><TextInput accessibilityLabel="Task note" value={note} onChangeText={setNote} multiline placeholder="Add a note" placeholderTextColor={isDark ? '#60758C' : '#91A0AF'} className="field min-h-20" /></View>
      <View className="flex-row gap-3">
        <View className="flex-1"><Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Priority</Text><TextInput accessibilityLabel="Priority number" value={priority} onChangeText={setPriority} keyboardType="number-pad" className="field" /></View>
        <View className="flex-1"><Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Minutes</Text><TextInput accessibilityLabel="Estimate minutes" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" className="field" /></View>
      </View>
      {type === 'daily' ? <View><Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Date</Text><TextInput accessibilityLabel="Task date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={isDark ? '#60758C' : '#91A0AF'} className="field" /></View> : <View><Text className="mb-2 text-sm font-semibold text-[#102033] dark:text-white">Repeat</Text><View className="flex-row justify-between">{days.map((label, index) => { const selected = repeatDays.includes(index); return <Pressable key={index} accessibilityLabel={`Repeat ${index}`} onPress={() => setRepeatDays((current) => selected ? current.filter((day) => day !== index) : [...current, index].sort())} className={`h-11 w-11 items-center justify-center rounded-full ${selected ? 'bg-[#2F7BFF]' : 'bg-[#E8EDF1] dark:bg-[#132338]'}`}><Text className={selected ? 'font-bold text-white' : 'text-[#526276] dark:text-[#8B9CAF]'}>{label}</Text></Pressable>; })}</View></View>}
      {error ? <Text accessibilityRole="alert" className="text-sm text-[#D85D4A]">{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={submit} className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-[#FF6B1A]"><Feather accessible={false} aria-hidden name="check" size={18} color="white" /><Text className="font-bold text-white">Save task</Text></Pressable>
      {onArchive ? <Pressable accessibilityRole="button" onPress={onArchive} className="min-h-12 items-center justify-center"><Text className="text-sm font-semibold text-[#D85D4A]">Archive task</Text></Pressable> : null}
    </View>
  );
}
