export type TaskType = 'daily' | 'habit';

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  priority: number;
  note?: string;
  date?: string;
  repeatDays?: number[];
  estimateMinutes: number;
  createdAt: number;
  isArchived: boolean;
};

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'isArchived'>;

export type ManualSessionInput = {
  taskId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
};

export type TimeSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
};

export type Session = TimeSession;

export type Completion = {
  taskId: string;
  date: string;
};

export type ActiveTimer = {
  taskId: string;
  startedAt: number | null;
  elapsedMs: number;
};

export type TaskData = {
  tasks: Task[];
  sessions: TimeSession[];
  completions: Completion[];
  timer: ActiveTimer | null;
};
