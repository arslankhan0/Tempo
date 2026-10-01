import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getHabitStreak, getTasksForDate, isTaskCompleted } from '../lib/tasks';
import type { Completion, Task } from '../types/task';

const tasks: Task[] = [
  { id: 'daily', title: 'Plan', type: 'daily', priority: 2, date: '2026-09-29', estimateMinutes: 20, createdAt: 1, isArchived: false },
  { id: 'habit', title: 'Read', type: 'habit', priority: 1, repeatDays: [1, 2, 3, 4, 5], estimateMinutes: 30, createdAt: 2, isArchived: false },
  { id: 'old', title: 'Old', type: 'daily', priority: 1, date: '2026-09-29', estimateMinutes: 10, createdAt: 0, isArchived: true },
];

test('daily tasks and matching habits appear in numeric priority order', () => {
  assert.deepEqual(getTasksForDate(tasks, '2026-09-29').map((task) => task.id), ['habit', 'daily']);
  assert.deepEqual(getTasksForDate(tasks, '2026-10-03').map((task) => task.id), []);
});

test('completions are scoped to a task and calendar date', () => {
  const completions: Completion[] = [{ taskId: 'habit', date: '2026-09-29' }];
  assert.equal(isTaskCompleted(completions, 'habit', '2026-09-29'), true);
  assert.equal(isTaskCompleted(completions, 'habit', '2026-09-30'), false);
});

test('habit streak follows scheduled days and skips weekends', () => {
  const habit = tasks[1];
  const completions: Completion[] = [
    { taskId: 'habit', date: '2026-09-25' },
    { taskId: 'habit', date: '2026-09-28' },
    { taskId: 'habit', date: '2026-09-29' },
  ];
  assert.equal(getHabitStreak(completions, habit, '2026-09-29'), 3);
});
