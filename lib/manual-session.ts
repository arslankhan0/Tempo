import type { ManualSessionInput, Task, TimeSession } from '../types/task';

export function buildManualSession(
  task: Task | undefined,
  input: ManualSessionInput,
  id: string,
): TimeSession | null {
  if (!task || task.isArchived || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startTime)) return null;
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1 || input.durationMinutes > 1_440) return null;

  const [year, month, day] = input.date.split('-').map(Number);
  const [hour, minute] = input.startTime.split(':').map(Number);
  const start = new Date(year, month - 1, day, hour, minute);
  if (
    start.getFullYear() !== year
    || start.getMonth() !== month - 1
    || start.getDate() !== day
    || start.getHours() !== hour
    || start.getMinutes() !== minute
  ) return null;

  const durationMs = input.durationMinutes * 60_000;
  return {
    id,
    taskId: task.id,
    taskTitle: task.title,
    startedAt: start.getTime(),
    endedAt: start.getTime() + durationMs,
    durationMs,
  };
}
