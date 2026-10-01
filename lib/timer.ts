import type { TaskData } from '../types/task';

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function pauseTaskTimer(state: TaskData, now: number): TaskData {
  const { timer } = state;
  if (!timer || timer.startedAt === null) return state;
  const task = state.tasks.find((item) => item.id === timer.taskId);
  const durationMs = Math.max(0, now - timer.startedAt);
  return {
    ...state,
    sessions: task && durationMs > 0 ? [...state.sessions, {
      id: createId(), taskId: task.id, taskTitle: task.title,
      startedAt: timer.startedAt, endedAt: Math.max(timer.startedAt, now), durationMs,
    }] : state.sessions,
    timer: { ...timer, startedAt: null, elapsedMs: timer.elapsedMs + durationMs },
  };
}

export function startTaskTimer(state: TaskData, taskId: string, now: number): TaskData {
  const task = state.tasks.find((item) => item.id === taskId && !item.isArchived);
  if (!task) return state;
  if (state.timer?.taskId === taskId) {
    return state.timer.startedAt === null ? { ...state, timer: { ...state.timer, startedAt: now } } : state;
  }
  const paused = pauseTaskTimer(state, now);
  return { ...paused, timer: { taskId, startedAt: now, elapsedMs: 0 } };
}

export function finishTaskTimer(state: TaskData, now: number): TaskData {
  return { ...pauseTaskTimer(state, now), timer: null };
}

export function archiveTask(state: TaskData, taskId: string, now: number): TaskData {
  const next = state.timer?.taskId === taskId ? finishTaskTimer(state, now) : state;
  return { ...next, tasks: next.tasks.map((task) => task.id === taskId ? { ...task, isArchived: true } : task) };
}
