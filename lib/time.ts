import type { ActiveTimer, Session } from '../types/task';

export function dateKey(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60_000);
  const hours = Math.floor(minutes / 60);
  if (!hours) return `${minutes}m`;
  return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
}

export function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${String(minutes).padStart(2, '0')}:${seconds}`;
}

export function getTimerElapsed(timer: ActiveTimer | null, now: number): number {
  if (!timer) return 0;
  return timer.elapsedMs + (timer.startedAt === null ? 0 : Math.max(0, now - timer.startedAt));
}

/** Attribute only the part of an interval that falls inside the local calendar day. */
export function getDayOverlap(startedAt: number, endedAt: number, date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  if (dateKey(start.getTime()) !== date) return 0;
  const end = new Date(year, month - 1, day + 1);
  return Math.max(0, Math.min(endedAt, end.getTime()) - Math.max(startedAt, start.getTime()));
}

export function getTrackedMs(
  sessions: Session[],
  timer: ActiveTimer | null,
  date: string,
  now: number,
): number {
  const saved = sessions.reduce(
    (total, session) => total + getDayOverlap(session.startedAt, session.endedAt, date),
    0,
  );
  // Paused time is already in sessions; only add the currently running segment.
  return saved + (timer?.startedAt != null ? getDayOverlap(timer.startedAt, now, date) : 0);
}

export function getTaskTrackedMs(
  sessions: Session[],
  timer: ActiveTimer | null,
  taskId: string,
  now: number,
): number {
  const saved = sessions.reduce(
    (total, session) => total + (session.taskId === taskId ? session.durationMs : 0),
    0,
  );
  return saved + (timer?.taskId === taskId && timer.startedAt !== null ? Math.max(0, now - timer.startedAt) : 0);
}

export function getWeekDays(now = Date.now()): { date: string; label: string }[] {
  const today = new Date(now);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
    return { date: dateKey(day.getTime()), label: day.toLocaleDateString('en-US', { weekday: 'short' }) };
  });
}
