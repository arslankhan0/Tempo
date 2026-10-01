import type { ActiveTimer, Completion, Task, TaskData, TimeSession } from '../types/task';

export type BackupThemeMode = 'system' | 'light' | 'dark';

export type BackupData = TaskData & {
  dailyGoalMinutes: number;
  themeMode: BackupThemeMode;
};

type BackupFile = {
  app: 'tempo-task-timer';
  version: 1;
  exportedAt: string;
  data: BackupData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && (value.type === 'daily' || value.type === 'habit')
    && Number.isInteger(value.priority) && Number(value.priority) > 0
    && Number.isInteger(value.estimateMinutes) && Number(value.estimateMinutes) > 0
    && isFiniteNumber(value.createdAt)
    && typeof value.isArchived === 'boolean'
    && (value.note === undefined || typeof value.note === 'string')
    && (value.date === undefined || isDateKey(value.date))
    && (value.repeatDays === undefined || (Array.isArray(value.repeatDays) && value.repeatDays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)));
}

function isSession(value: unknown): value is TimeSession {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.taskId === 'string'
    && typeof value.taskTitle === 'string'
    && isFiniteNumber(value.startedAt)
    && isFiniteNumber(value.endedAt)
    && isFiniteNumber(value.durationMs)
    && value.endedAt >= value.startedAt
    && value.durationMs >= 0;
}

function isCompletion(value: unknown): value is Completion {
  return isRecord(value) && typeof value.taskId === 'string' && isDateKey(value.date);
}

function isTimer(value: unknown): value is ActiveTimer | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return typeof value.taskId === 'string'
    && (value.startedAt === null || isFiniteNumber(value.startedAt))
    && isFiniteNumber(value.elapsedMs)
    && value.elapsedMs >= 0;
}

export function createBackupFile(data: BackupData, now = new Date()): string {
  const backup: BackupFile = {
    app: 'tempo-task-timer',
    version: 1,
    exportedAt: now.toISOString(),
    data,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseBackupFile(contents: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error('This is not a valid JSON backup.');
  }
  if (!isRecord(parsed) || parsed.app !== 'tempo-task-timer' || parsed.version !== 1 || !isRecord(parsed.data)) {
    throw new Error('This file is not a supported Tempo backup.');
  }
  const data = parsed.data;
  if (
    !Array.isArray(data.tasks) || !data.tasks.every(isTask)
    || !Array.isArray(data.sessions) || !data.sessions.every(isSession)
    || !Array.isArray(data.completions) || !data.completions.every(isCompletion)
    || !isTimer(data.timer)
    || !Number.isInteger(data.dailyGoalMinutes) || Number(data.dailyGoalMinutes) < 1 || Number(data.dailyGoalMinutes) > 1_440
    || (data.themeMode !== 'system' && data.themeMode !== 'light' && data.themeMode !== 'dark')
  ) throw new Error('This backup is incomplete or contains invalid data.');

  return {
    tasks: data.tasks,
    sessions: data.sessions,
    completions: data.completions,
    timer: data.timer,
    dailyGoalMinutes: Number(data.dailyGoalMinutes),
    themeMode: data.themeMode,
  };
}
