import type { TaskData, TaskType } from '../types/task';
import { finishTaskTimer } from './timer';

export function convertTaskType(state: TaskData, taskId: string, type: TaskType, date: string): TaskData {
  const task = state.tasks.find((item) => item.id === taskId && !item.isArchived);
  if (!task || task.type === type) return state;
  return {
    ...state,
    tasks: state.tasks.map((item) => item.id !== taskId ? item : type === 'habit'
      ? { ...item, type, date: undefined, repeatDays: [0, 1, 2, 3, 4, 5, 6] }
      : { ...item, type, date, repeatDays: undefined }),
  };
}

export function deleteTaskPermanently(state: TaskData, taskId: string, now: number): TaskData {
  if (!state.tasks.some((task) => task.id === taskId)) return state;
  const next = state.timer?.taskId === taskId ? finishTaskTimer(state, now) : state;
  return {
    ...next,
    tasks: next.tasks.filter((task) => task.id !== taskId),
    completions: next.completions.filter((completion) => completion.taskId !== taskId),
  };
}
