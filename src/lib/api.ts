import {
  Book,
  Goal,
  Habit,
  Notification,
  PomodoroSession,
  Project,
  Task,
  TaskStatus,
  TaskContext,
  User,
} from "@/types";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://focushubserver.vercel.app/api/v1";

const AUTH_TOKEN_KEY = "focushub_auth_token";

// Token management
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    console.error("Failed to save token");
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    console.error("Failed to remove token");
  }
};

// Response types from backend
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Request helper
async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ============ AUTH ============

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  signup: async (email: string, password: string, name: string, avatar?: string): Promise<AuthResponse> => {
    const response = await request<ApiResponse<AuthResponse>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name, avatar }),
    });
    return response.data!;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await request<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response.data!;
  },

  logout: async (): Promise<void> => {
    await request<ApiResponse>("/auth/logout", {
      method: "POST",
    });
  },

  getMe: async (): Promise<User> => {
    const response = await request<ApiResponse<User>>("/auth/me");
    return response.data!;
  },

  updateMe: async (name?: string, avatar?: string): Promise<User> => {
    const response = await request<ApiResponse<User>>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ name, avatar }),
    });
    return response.data!;
  },
};

// ============ TASKS ============

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  context: TaskContext;
  projectId?: string | null;
  completed?: boolean;
}

export interface MoveTaskInput {
  status: TaskStatus;
}

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await request<ApiResponse<Task[]>>("/tasks");
    return response.data || [];
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const response = await request<ApiResponse<Task>>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  update: async (id: string, input: Partial<CreateTaskInput>): Promise<Task> => {
    const response = await request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Inbox specific
  getInbox: async (): Promise<Task[]> => {
    const response = await request<ApiResponse<Task[]>>("/tasks/inbox");
    return response.data || [];
  },

  createInbox: async (input: Omit<CreateTaskInput, "status">): Promise<Task> => {
    const response = await request<ApiResponse<Task>>("/tasks/inbox", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  moveInbox: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await request<ApiResponse<Task>>(`/tasks/inbox/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return response.data!;
  },
};

// ============ PROJECTS ============

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await request<ApiResponse<Project[]>>("/projects");
    return response.data || [];
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const response = await request<ApiResponse<Project>>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  update: async (id: string, input: Partial<CreateProjectInput>): Promise<Project> => {
    const response = await request<ApiResponse<Project>>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/projects/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ HABITS ============

export interface CreateHabitInput {
  name: string;
  frequency: "daily" | "weekly";
  color?: string;
}

export const habitsApi = {
  getAll: async (): Promise<Habit[]> => {
    const response = await request<ApiResponse<Habit[]>>("/habits");
    return response.data || [];
  },

  create: async (input: CreateHabitInput): Promise<Habit> => {
    const response = await request<ApiResponse<Habit>>("/habits", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  update: async (id: string, input: Partial<CreateHabitInput>): Promise<Habit> => {
    const response = await request<ApiResponse<Habit>>(`/habits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/habits/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ GOALS ============

export interface CreateGoalInput {
  title: string;
  type: "task" | "habit" | "reading";
  target: number;
  deadline?: string;
}

export const goalsApi = {
  getAll: async (): Promise<Goal[]> => {
    const response = await request<ApiResponse<Goal[]>>("/goals");
    return response.data || [];
  },

  create: async (input: CreateGoalInput): Promise<Goal> => {
    const response = await request<ApiResponse<Goal>>("/goals", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  update: async (id: string, input: Partial<CreateGoalInput>): Promise<Goal> => {
    const response = await request<ApiResponse<Goal>>(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/goals/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ BOOKS ============

export interface CreateBookInput {
  title: string;
  author: string;
  totalPages: number;
  completedPages?: number;
  notes?: string;
  summary?: string;
}

export const booksApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await request<ApiResponse<Book[]>>("/books");
    return response.data || [];
  },

  create: async (input: CreateBookInput): Promise<Book> => {
    const response = await request<ApiResponse<Book>>("/books", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  update: async (id: string, input: Partial<CreateBookInput>): Promise<Book> => {
    const response = await request<ApiResponse<Book>>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/books/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ POMODORO ============

export interface CreatePomodoroInput {
  duration: number;
  completedAt?: string;
  taskTitle: string;
}

export const pomodoroApi = {
  getAll: async (): Promise<PomodoroSession[]> => {
    const response = await request<ApiResponse<PomodoroSession[]>>("/pomodoro");
    return response.data || [];
  },

  create: async (input: CreatePomodoroInput): Promise<PomodoroSession> => {
    const response = await request<ApiResponse<PomodoroSession>>("/pomodoro", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  update: async (id: string, input: Partial<CreatePomodoroInput>): Promise<PomodoroSession> => {
    const response = await request<ApiResponse<PomodoroSession>>(`/pomodoro/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/pomodoro/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ NOTIFICATIONS ============

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await request<ApiResponse<Notification[]>>("/notifications");
    return response.data || [];
  },

  markRead: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },
};

// Export all APIs as a single object for convenience
export const api = {
  auth: authApi,
  tasks: tasksApi,
  projects: projectsApi,
  habits: habitsApi,
  goals: goalsApi,
  books: booksApi,
  pomodoro: pomodoroApi,
  notifications: notificationsApi,
};
