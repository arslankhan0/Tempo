import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getHabitCompletionRate, getTimePerTask, getTotalTimeForDay } from '../lib/analytics';
import type { Completion, Task, TimeSession } from '../types/task';

const minute = 60_000;
const start = new Date(2026, 8, 29, 9).getTime();
const sessions: TimeSession[] = [
  { id: '1', taskId: 'a', taskTitle: 'Plan', startedAt: start, endedAt: start + 30 * minute, durationMs: 30 * minute },
  { id: '2', taskId: 'a', taskTitle: 'Plan', startedAt: start + 40 * minute, endedAt: start + 50 * minute, durationMs: 10 * minute },
];

test('analytics totals derive from sessions without stored aggregates', () => {
  assert.equal(getTotalTimeForDay(sessions, '2026-09-29'), 40 * minute);
  assert.equal(getTimePerTask(sessions, start, start + 60 * minute)[0].durationMs, 40 * minute);
});

test('habit completion rate counts only scheduled opportunities', () => {
  const habits: Task[] = [{ id: 'h', title: 'Read', type: 'habit', priority: 1, repeatDays: [1, 2], estimateMinutes: 10, createdAt: 1, isArchived: false }];
  const completions: Completion[] = [{ taskId: 'h', date: '2026-09-28' }];
  assert.equal(getHabitCompletionRate(completions, habits, ['2026-09-28', '2026-09-29']), 0.5);
});
