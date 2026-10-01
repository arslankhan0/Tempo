import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createBackupFile, parseBackupFile, type BackupData } from '../lib/backup';

const data: BackupData = {
  tasks: [{
    id: 'task-1', title: 'Deep work', type: 'daily', priority: 1, date: '2026-09-30',
    estimateMinutes: 45, createdAt: 1, isArchived: false,
  }],
  sessions: [{ id: 'session-1', taskId: 'task-1', taskTitle: 'Deep work', startedAt: 100, endedAt: 200, durationMs: 100 }],
  completions: [{ taskId: 'task-1', date: '2026-09-30' }],
  timer: null,
  dailyGoalMinutes: 120,
  themeMode: 'system',
};

test('backup files round trip all persisted app data', () => {
  const contents = createBackupFile(data, new Date('2026-09-30T12:00:00.000Z'));
  assert.deepEqual(parseBackupFile(contents), data);
  assert.match(contents, /"version": 1/);
});

test('backup parser rejects unrelated, malformed, and incomplete files', () => {
  assert.throws(() => parseBackupFile('not json'), /valid JSON/);
  assert.throws(() => parseBackupFile('{"app":"another-app","version":1,"data":{}}'), /supported Tempo/);
  assert.throws(() => parseBackupFile('{"app":"tempo-task-timer","version":1,"data":{}}'), /incomplete/);
});
