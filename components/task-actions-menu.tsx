import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { useTaskStore } from '@/store/use-task-store';
import type { Task } from '@/types/task';

type Props = {
  task: Task | null;
  date: string;
  onClose: () => void;
};

const iconColor = '#2F7BFF';

export function TaskActionsMenu({ task, date, onClose }: Props) {
  const convertTask = useTaskStore((state) => state.convertTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function close() {
    setConfirmDelete(false);
    onClose();
  }

  if (!task) return null;
  const targetType = task.type === 'daily' ? 'habit' : 'daily';
  const targetLabel = task.type === 'daily' ? 'Convert to habit' : 'Convert to activity';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <Pressable accessibilityLabel="Close task actions" onPress={close} className="flex-1 justify-end bg-black/60">
        <Pressable onPress={() => undefined} className="rounded-t-[32px] bg-white px-5 pb-8 pt-4 dark:bg-[#0D1724]">
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-[#C9D3DC] dark:bg-[#2A3D52]" />
          <Text numberOfLines={1} className="mb-4 text-lg font-bold text-[#102033] dark:text-white">{task.title}</Text>
          {confirmDelete ? (
            <View>
              <Text className="mb-5 text-sm leading-5 text-[#526276] dark:text-[#8B9CAF]">Delete this {task.type === 'daily' ? 'activity' : 'habit'}? Its saved time stays in analytics.</Text>
              <View className="flex-row gap-3">
                <Pressable onPress={() => setConfirmDelete(false)} className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#E8EDF1] dark:bg-[#132338]"><Text className="font-bold text-[#526276] dark:text-white">Cancel</Text></Pressable>
                <Pressable onPress={() => { deleteTask(task.id); close(); }} className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#D94B38]"><Text className="font-bold text-white">Delete</Text></Pressable>
              </View>
            </View>
          ) : (
            <View className="gap-2">
              <Action icon="clock" label="Add time" onPress={() => { close(); router.push({ pathname: '/session/new', params: { taskId: task.id, date } }); }} />
              <Action icon="repeat" label={targetLabel} onPress={() => { convertTask(task.id, targetType, date); close(); }} />
              <Action icon="edit-3" label="Edit" onPress={() => { close(); router.push(`/task/${task.id}`); }} />
              <Action icon="trash-2" label="Delete" destructive onPress={() => setConfirmDelete(true)} />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Action({ icon, label, destructive = false, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; destructive?: boolean; onPress: () => void }) {
  const color = destructive ? '#D94B38' : iconColor;
  return <Pressable accessibilityRole="button" onPress={onPress} className="min-h-14 flex-row items-center rounded-2xl px-2"><View className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${destructive ? 'bg-[#FDECEA] dark:bg-[#401D1D]' : 'bg-[#EAF1FF] dark:bg-[#10245A]'}`}><Feather name={icon} size={18} color={color} /></View><Text className={`font-semibold ${destructive ? 'text-[#D94B38]' : 'text-[#102033] dark:text-white'}`}>{label}</Text></Pressable>;
}
