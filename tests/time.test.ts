import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dateKey, formatDuration, formatTimer, getDayOverlap, getTrackedMs, getWeekDays } from '../lib/time';
import type { Session } from '../types/task';

process.env.TZ = 'Asia/Karachi';
const minute = 60_000;

test('date keys follow the local calendar rather than UTC', () => {
  assert.equal(dateKey(Date.parse('2026-09-28T20:00:00Z')), '2026-09-29');
});

test('duration and timer formatting handle zero, seconds, and hours', () => {
  assert.equal(formatDuration(0), '0m');
  assert.equal(formatDuration(80 * minute), '1h 20m');
  assert.equal(formatDuration(60 * minute), '1h');
  assert.equal(formatTimer(25 * minute + 1_000), '25:01');
  assert.equal(formatTimer(85 * minute + 1_000), '1:25:01');
  assert.equal(formatTimer(-1_000), '00:00');
});

test('saved and live sessions split correctly across local midnight', () => {
  const startedAt = new Date(2026, 8, 28, 23, 50).getTime();
  const endedAt = new Date(2026, 8, 29, 0, 20).getTime();
  const session: Session = { id: 's', taskId: 'a', taskTitle: 'Write', startedAt, endedAt, durationMs: 30 * minute };
  assert.equal(getTrackedMs([session], null, '2026-09-28', endedAt), 10 * minute);
  assert.equal(getTrackedMs([session], null, '2026-09-29', endedAt), 20 * minute);
  const live = { taskId: 'a', startedAt, elapsedMs: 0 };
  assert.equal(getTrackedMs([], live, '2026-09-28', endedAt), 10 * minute);
  assert.equal(getTrackedMs([], live, '2026-09-29', endedAt), 20 * minute);
  assert.equal(getTrackedMs([session], { taskId: 'a', startedAt: null, elapsedMs: 30 * minute }, '2026-09-29', endedAt), 20 * minute);
});

test('daily boundaries respect daylight saving instead of assuming a 24 hour day', () => {
  process.env.TZ = 'America/New_York';
  try {
    const start = new Date(2026, 2, 8).getTime();
    const end = new Date(2026, 2, 9).getTime();
    assert.equal(getDayOverlap(start, end, '2026-03-08'), 23 * 60 * minute);
    const fallStart = new Date(2026, 10, 1).getTime();
    const fallEnd = new Date(2026, 10, 2).getTime();
    assert.equal(getDayOverlap(fallStart, fallEnd, '2026-11-01'), 25 * 60 * minute);
  } finally {
    process.env.TZ = 'Asia/Karachi';
  }
});

test('the week includes seven local days and handles a month boundary', () => {
  const days = getWeekDays(new Date(2026, 9, 2, 1).getTime());
  assert.equal(days.length, 7);
  assert.equal(days[0].date, '2026-09-26');
  assert.equal(days[6].date, '2026-10-02');
  assert.equal(days[6].label, 'Fri');
});
