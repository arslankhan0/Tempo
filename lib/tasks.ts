import type { Completion, Task } from '../types/task';

export function isTaskCompleted(completions: Completion[], taskId: string, date: string) {
  return completions.some((item) => item.taskId === taskId && item.date === date);
}

export function getTasksForDate(tasks: Task[], date: string) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return tasks
    .filter((task) => !task.isArchived)
    .filter((task) => task.type === 'daily' ? task.date === date : task.repeatDays?.includes(weekday))
    .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
}

export function getHabitStreak(completions: Completion[], task: Task, today: string) {
  if (task.type !== 'habit') return 0;
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  for (let checked = 0; checked < 366; checked += 1) {
    const weekday = cursor.getDay();
    const date = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (task.repeatDays?.includes(weekday)) {
      if (!isTaskCompleted(completions, task.id, date)) break;
      streak += 1;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
