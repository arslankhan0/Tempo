import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildManualSession } from '@/lib/manual-session';
import type { BackupData } from '@/lib/backup';
import { archiveTask, createId, finishTaskTimer, pauseTaskTimer, startTaskTimer } from '@/lib/timer';
import { convertTaskType, deleteTaskPermanently } from '@/lib/task-actions';
import type { ManualSessionInput, TaskData, TaskInput, TaskType } from '@/types/task';

type SavedTaskState = TaskData & { dailyGoalMinutes: number };

type TaskStore = SavedTaskState & {
  hydrated: boolean;
  storageError: string | null;
  addTask: (input: TaskInput) => string | null;
  updateTask: (id: string, input: TaskInput) => void;
  archiveTask: (id: string) => void;
  convertTask: (id: string, type: TaskType, date: string) => void;
  deleteTask: (id: string) => void;
  toggleCompletion: (id: string, date: string) => void;
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  finishTimer: () => void;
  addManualSession: (input: ManualSessionInput) => boolean;
  restoreData: (data: Omit<BackupData, 'themeMode'>) => void;
  setDailyGoal: (minutes: number) => void;
};

function validInput(input: TaskInput) {
  return input.title.trim().length > 0
    && Number.isInteger(input.priority) && input.priority > 0
    && Number.isInteger(input.estimateMinutes) && input.estimateMinutes > 0
    && (input.type === 'daily' ? Boolean(input.date) : Boolean(input.repeatDays?.length));
}

export const useTaskStore = create<TaskStore>()((set, get, api) => {
  let storageReady = false;
  return persist<TaskStore, [], [], SavedTaskState>(
    (save, read) => ({
      tasks: [], sessions: [], completions: [], timer: null, dailyGoalMinutes: 120,
      hydrated: false, storageError: null,
      addTask: (input) => {
        if (!validInput(input)) return null;
        const id = createId();
        save((state) => ({ tasks: [...state.tasks, { ...input, title: input.title.trim(), note: input.note?.trim() || undefined, id, createdAt: Date.now(), isArchived: false }] }));
        return id;
      },
      updateTask: (id, input) => {
        if (!validInput(input)) return;
        save((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, ...input, title: input.title.trim(), note: input.note?.trim() || undefined } : task) }));
      },
      archiveTask: (id) => save(archiveTask(read(), id, Date.now())),
      convertTask: (id, type, date) => save(convertTaskType(read(), id, type, date)),
      deleteTask: (id) => save(deleteTaskPermanently(read(), id, Date.now())),
      toggleCompletion: (taskId, date) => save((state) => {
        const exists = state.completions.some((item) => item.taskId === taskId && item.date === date);
        const next = state.timer?.taskId === taskId ? finishTaskTimer(state, Date.now()) : state;
        return { ...next, completions: exists ? next.completions.filter((item) => item.taskId !== taskId || item.date !== date) : [...next.completions, { taskId, date }] };
      }),
      startTimer: (taskId) => save(startTaskTimer(read(), taskId, Date.now())),
      pauseTimer: () => save(pauseTaskTimer(read(), Date.now())),
      finishTimer: () => save(finishTaskTimer(read(), Date.now())),
      addManualSession: (input) => {
        const state = read();
        const session = buildManualSession(state.tasks.find((task) => task.id === input.taskId), input, createId());
        if (!session) return false;
        save({ sessions: [...state.sessions, session] });
        return true;
      },
      restoreData: ({ tasks, sessions, completions, timer, dailyGoalMinutes }) => save({
        tasks, sessions, completions, timer, dailyGoalMinutes,
      }),
      setDailyGoal: (minutes) => Number.isFinite(minutes) && minutes > 0 && save({ dailyGoalMinutes: Math.min(1_440, Math.round(minutes)) }),
    }),
    {
      name: 'daylight-task-timer', version: 2,
      storage: createJSONStorage(() => ({
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: async (name, value) => {
          if (!storageReady) return;
          try { await AsyncStorage.setItem(name, value); set({ storageError: null }); }
          catch { set({ storageError: 'Changes could not be saved on this device.' }); }
        },
        removeItem: (name) => AsyncStorage.removeItem(name),
      })),
      partialize: ({ tasks, sessions, completions, timer, dailyGoalMinutes }) => ({ tasks, sessions, completions, timer, dailyGoalMinutes }),
      migrate: (persisted, version) => {
        if (version >= 2) return persisted as SavedTaskState;
        const old = persisted as Record<string, unknown>;
        const oldTasks = Array.isArray(old.tasks) ? old.tasks as Record<string, unknown>[] : [];
        const oldSessions = Array.isArray(old.sessions) ? old.sessions as Record<string, unknown>[] : [];
        return {
          tasks: oldTasks.map((task) => ({
            id: String(task.id), title: String(task.title), type: 'daily' as const,
            priority: task.priority === 'high' ? 1 : task.priority === 'medium' ? 2 : 3,
            date: String(task.date), estimateMinutes: Number(task.estimateMinutes) || 25,
            createdAt: Number(task.createdAt) || Date.now(), isArchived: false,
          })),
          sessions: oldSessions.map((session) => ({
            id: String(session.id), taskId: String(session.taskId), taskTitle: String(session.taskTitle),
            startedAt: Number(session.startedAt), endedAt: Number(session.endedAt), durationMs: Number(session.durationMs),
          })),
          completions: oldTasks.filter((task) => task.completed).map((task) => ({ taskId: String(task.id), date: String(task.date) })),
          timer: old.timer as SavedTaskState['timer'] ?? null,
          dailyGoalMinutes: Number(old.dailyGoalMinutes) || 120,
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        storageReady = !error;
        set({ hydrated: true, storageError: error ? 'Saved data could not be loaded.' : null });
      },
    },
  )(set, get, api);
});
