import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildManualSession } from '../lib/manual-session';
import type { Task } from '../types/task';

const task: Task = {
  id: 'task-1', title: 'Deep work', type: 'daily', priority: 1,
  date: '2026-09-29', estimateMinutes: 45, createdAt: 1, isArchived: false,
};

test('builds a timestamp-based manual session', () => {
  const session = buildManualSession(task, {
    taskId: task.id, date: '2026-09-29', startTime: '08:15', durationMinutes: 45,
  }, 'session-1');
  assert.ok(session);
  assert.equal(session.durationMs, 45 * 60_000);
  assert.equal(session.endedAt - session.startedAt, 45 * 60_000);
  assert.equal(new Date(session.startedAt).getHours(), 8);
  assert.equal(new Date(session.startedAt).getMinutes(), 15);
});

test('rejects invalid dates, times, durations, and archived tasks', () => {
  assert.equal(buildManualSession(task, { taskId: task.id, date: '2026-02-30', startTime: '08:15', durationMinutes: 30 }, 'x'), null);
  assert.equal(buildManualSession(task, { taskId: task.id, date: '2026-09-29', startTime: '25:00', durationMinutes: 30 }, 'x'), null);
  assert.equal(buildManualSession(task, { taskId: task.id, date: '2026-09-29', startTime: '08:15', durationMinutes: 0 }, 'x'), null);
  assert.equal(buildManualSession({ ...task, isArchived: true }, { taskId: task.id, date: '2026-09-29', startTime: '08:15', durationMinutes: 30 }, 'x'), null);
});
