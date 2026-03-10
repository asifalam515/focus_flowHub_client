export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  achievements: string[];
}

export type TaskStatus = "inbox" | "next_action" | "completed";
export type TaskContext = "work" | "personal" | "learning" | "fitness";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  startTime?: string; // "HH:mm" e.g. "09:00"
  endTime?: string;   // "HH:mm" e.g. "10:30"
  priority: "low" | "medium" | "high";
  completed: boolean;
  status: TaskStatus;
  context: TaskContext;
  projectId: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  streak: number;
  completedToday: boolean;
  color: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  type: "task" | "habit" | "reading";
  target: number;
  current: number;
  deadline: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  completedPages: number;
  notes: string;
  summary: string;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  duration: number;
  completedAt: string;
  taskTitle: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}
