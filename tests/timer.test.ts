import assert from 'node:assert/strict';
import { test } from 'node:test';

import { archiveTask, finishTaskTimer, pauseTaskTimer, startTaskTimer } from '../lib/timer';
import { getTaskTrackedMs, getTimerElapsed } from '../lib/time';
import type { TaskData } from '../types/task';

const start = 1_790_000_000_000;
const minute = 60_000;

function freshState(): TaskData {
  return {
    tasks: [
      { id: 'a', title: 'Build my app', type: 'daily', priority: 1, estimateMinutes: 30, date: '2026-09-29', isArchived: false, createdAt: start },
      { id: 'b', title: 'Read a chapter', type: 'daily', priority: 2, estimateMinutes: 20, date: '2026-09-29', isArchived: false, createdAt: start },
    ],
    sessions: [],
    completions: [],
    timer: null,
  };
}

test('pause and resume exclude the paused gap and never double count saved time', () => {
  let state = startTaskTimer(freshState(), 'a', start);
  state = pauseTaskTimer(state, start + 10 * minute);
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].durationMs, 10 * minute);
  assert.equal(getTimerElapsed(state.timer, start + 20 * minute), 10 * minute);
  assert.equal(getTaskTrackedMs(state.sessions, state.timer, 'a', start + 20 * minute), 10 * minute);

  assert.equal(pauseTaskTimer(state, start + 20 * minute), state);
  state = startTaskTimer(state, 'a', start + 20 * minute);
  assert.equal(getTimerElapsed(state.timer, start + 25 * minute), 15 * minute);
  assert.equal(getTaskTrackedMs(state.sessions, state.timer, 'a', start + 25 * minute), 15 * minute);
  state = finishTaskTimer(state, start + 25 * minute);
  assert.equal(state.timer, null);
  assert.equal(state.sessions.length, 2);
  assert.equal(getTaskTrackedMs(state.sessions, state.timer, 'a', start + 40 * minute), 15 * minute);
});

test('switching tasks saves the previous segment and starts a fresh display total', () => {
  let state = startTaskTimer(freshState(), 'a', start);
  assert.equal(startTaskTimer(state, 'a', start + minute), state);
  state = startTaskTimer(state, 'b', start + 5 * minute);
  assert.equal(state.sessions[0].taskId, 'a');
  assert.equal(state.sessions[0].durationMs, 5 * minute);
  assert.equal(state.timer?.taskId, 'b');
  assert.equal(state.timer?.elapsedMs, 0);
  assert.equal(getTimerElapsed(state.timer, start + 7 * minute), 2 * minute);
});

test('archiving a running task preserves its name and duration in history', () => {
  const state = archiveTask(startTaskTimer(freshState(), 'a', start), 'a', start + 3 * minute);
  assert.equal(state.tasks.find((task) => task.id === 'a')?.isArchived, true);
  assert.equal(state.timer, null);
  assert.equal(state.sessions[0].taskTitle, 'Build my app');
  assert.equal(state.sessions[0].durationMs, 3 * minute);
});

test('a serialized running timer includes time spent in the background after restore', () => {
  const original = startTaskTimer(freshState(), 'a', start);
  const restored = JSON.parse(JSON.stringify(original)) as TaskData;
  assert.equal(getTimerElapsed(restored.timer, start + 65 * minute), 65 * minute);
  const finished = finishTaskTimer(restored, start + 65 * minute);
  assert.equal(finished.sessions[0].durationMs, 65 * minute);
  assert.equal(finishTaskTimer(finished, start + 80 * minute).sessions.length, 1);
});

test('a serialized paused timer stays paused and does not add offline time', () => {
  const paused = pauseTaskTimer(startTaskTimer(freshState(), 'a', start), start + 4 * minute);
  const restored = JSON.parse(JSON.stringify(paused)) as TaskData;
  assert.equal(getTimerElapsed(restored.timer, start + 100 * minute), 4 * minute);
  assert.equal(getTaskTrackedMs(restored.sessions, restored.timer, 'a', start + 100 * minute), 4 * minute);
});

test('invalid starts and backward clock changes do not create negative sessions', () => {
  const state = freshState();
  assert.equal(startTaskTimer(state, 'missing', start), state);
  const running = startTaskTimer(state, 'a', start);
  assert.equal(getTimerElapsed(running.timer, start - minute), 0);
  const paused = pauseTaskTimer(running, start - minute);
  assert.equal(paused.sessions.length, 0);
  assert.equal(paused.timer?.elapsedMs, 0);
});
