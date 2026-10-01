import assert from 'node:assert/strict';
import { test } from 'node:test';

import { convertTaskType, deleteTaskPermanently } from '../lib/task-actions';
import type { TaskData } from '../types/task';

const state: TaskData = {
  tasks: [{ id: 'a', title: 'Plan', type: 'daily', priority: 1, date: '2026-09-30', estimateMinutes: 30, createdAt: 1, isArchived: false }],
  sessions: [], completions: [{ taskId: 'a', date: '2026-09-30' }], timer: null,
};

test('converts activities and habits while setting the required schedule fields', () => {
  const habit = convertTaskType(state, 'a', 'habit', '2026-09-30');
  assert.equal(habit.tasks[0].type, 'habit');
  assert.equal(habit.tasks[0].date, undefined);
  assert.deepEqual(habit.tasks[0].repeatDays, [0, 1, 2, 3, 4, 5, 6]);
  const daily = convertTaskType(habit, 'a', 'daily', '2026-10-01');
  assert.equal(daily.tasks[0].date, '2026-10-01');
  assert.equal(daily.tasks[0].repeatDays, undefined);
});

test('deleting a task removes it and its completions', () => {
  const deleted = deleteTaskPermanently(state, 'a', 100);
  assert.equal(deleted.tasks.length, 0);
  assert.equal(deleted.completions.length, 0);
});
