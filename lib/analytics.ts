import { dateKey, getDayOverlap } from './time';
import type { Completion, Task, TimeSession } from '../types/task';

export function getTotalTimeForDay(sessions: TimeSession[], date: string) {
  return sessions.reduce((total, session) => total + getDayOverlap(session.startedAt, session.endedAt, date), 0);
}

export function getTimePerTask(sessions: TimeSession[], start: number, end: number) {
  const totals = new Map<string, { taskId: string; title: string; durationMs: number }>();
  for (const session of sessions) {
    const duration = Math.max(0, Math.min(session.endedAt, end) - Math.max(session.startedAt, start));
    if (!duration) continue;
    const current = totals.get(session.taskId);
    totals.set(session.taskId, { taskId: session.taskId, title: session.taskTitle, durationMs: (current?.durationMs ?? 0) + duration });
  }
  return [...totals.values()].sort((a, b) => b.durationMs - a.durationMs);
}

export function getCompletionCount(completions: Completion[], date: string) {
  return completions.filter((item) => item.date === date).length;
}

export function getHabitCompletionRate(completions: Completion[], habits: Task[], dates: string[]) {
  let expected = 0;
  let complete = 0;
  for (const date of dates) {
    const weekday = new Date(`${date}T12:00:00`).getDay();
    for (const habit of habits) {
      if (!habit.isArchived && habit.repeatDays?.includes(weekday)) {
        expected += 1;
        if (completions.some((item) => item.taskId === habit.id && item.date === date)) complete += 1;
      }
    }
  }
  return expected ? complete / expected : 0;
}

export function getRangeDays(endTimestamp: number, count: number) {
  const end = new Date(endTimestamp);
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - count + index + 1);
    return dateKey(day.getTime());
  });
}
