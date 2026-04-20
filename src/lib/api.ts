import {
  Book,
  Goal,
  Habit,
  Notification,
  PomodoroSession,
  Project,
  Task,
  TaskContext,
  TaskStatus,
  User,
} from "@/types";

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_BAS_URL ||
  "https://focushubserver.vercel.app/api/v1";

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

const unwrapData = <T>(response: ApiResponse<T> | T | null): T | null => {
  if (response === null) return null;
  if (typeof response !== "object") return response as T;

  if ("data" in (response as ApiResponse<T>)) {
    return ((response as ApiResponse<T>).data ?? null) as T | null;
  }

  return response as T;
};

// Request helper
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ============ AUTH ============

export interface AuthResponse {
  token: string | null;
  user: User;
}

const normalizeAuthResponse = (
  payload: ApiResponse<AuthResponse | User>,
): AuthResponse => {
  const data = unwrapData<AuthResponse | User>(payload);

  if (!data || typeof data !== "object") {
    throw new Error("Invalid auth response from server");
  }

  if ("user" in data) {
    const authData = data as AuthResponse;
    return {
      token: authData.token ?? null,
      user: authData.user,
    };
  }

  return {
    token: null,
    user: data as User,
  };
};

export const authApi = {
  signup: async (
    email: string,
    password: string,
    name: string,
    avatar?: string,
  ): Promise<AuthResponse> => {
    const response = await request<ApiResponse<AuthResponse | User>>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({ email, password, name, avatar }),
      },
    );
    return normalizeAuthResponse(response);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await request<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return normalizeAuthResponse(response);
  },

  logout: async (): Promise<void> => {
    await request<ApiResponse>("/auth/logout", {
      method: "POST",
    });
  },

  getMe: async (): Promise<User> => {
    const response = await request<ApiResponse<User>>("/auth/me");
    const user = unwrapData<User>(response);
    if (!user) throw new Error("User not found in /auth/me response");
    return user;
  },

  updateMe: async (name?: string, avatar?: string): Promise<User> => {
    const response = await request<ApiResponse<User>>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ name, avatar }),
    });
    const user = unwrapData<User>(response);
    if (!user) throw new Error("User not found in profile update response");
    return user;
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
    return unwrapData<Task[]>(response) || [];
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const response = await request<ApiResponse<Task>>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const task = unwrapData<Task>(response);
    if (!task) throw new Error("Task not returned from create endpoint");
    return task;
  },

  update: async (
    id: string,
    input: Partial<CreateTaskInput>,
  ): Promise<Task> => {
    const response = await request<ApiResponse<Task>>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    const task = unwrapData<Task>(response);
    if (!task) throw new Error("Task not returned from update endpoint");
    return task;
  },

  delete: async (id: string): Promise<void> => {
    await request<ApiResponse>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Inbox specific
  getInbox: async (): Promise<Task[]> => {
    const response = await request<ApiResponse<Task[]>>("/tasks/inbox");
    return unwrapData<Task[]>(response) || [];
  },

  createInbox: async (
    input: Omit<CreateTaskInput, "status">,
  ): Promise<Task> => {
    const response = await request<ApiResponse<Task>>("/tasks/inbox", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const task = unwrapData<Task>(response);
    if (!task) throw new Error("Task not returned from inbox create endpoint");
    return task;
  },

  moveInbox: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await request<ApiResponse<Task>>(
      `/tasks/inbox/${id}/move`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    const task = unwrapData<Task>(response);
    if (!task) throw new Error("Task not returned from inbox move endpoint");
    return task;
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
    return unwrapData<Project[]>(response) || [];
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const response = await request<ApiResponse<Project>>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const project = unwrapData<Project>(response);
    if (!project) throw new Error("Project not returned from create endpoint");
    return project;
  },

  update: async (
    id: string,
    input: Partial<CreateProjectInput>,
  ): Promise<Project> => {
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
    return unwrapData<Habit[]>(response) || [];
  },

  create: async (input: CreateHabitInput): Promise<Habit> => {
    const response = await request<ApiResponse<Habit>>("/habits", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const habit = unwrapData<Habit>(response);
    if (!habit) throw new Error("Habit not returned from create endpoint");
    return habit;
  },

  update: async (
    id: string,
    input: Partial<CreateHabitInput>,
  ): Promise<Habit> => {
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
    return unwrapData<Goal[]>(response) || [];
  },

  create: async (input: CreateGoalInput): Promise<Goal> => {
    const response = await request<ApiResponse<Goal>>("/goals", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const goal = unwrapData<Goal>(response);
    if (!goal) throw new Error("Goal not returned from create endpoint");
    return goal;
  },

  update: async (
    id: string,
    input: Partial<CreateGoalInput>,
  ): Promise<Goal> => {
    const response = await request<ApiResponse<Goal>>(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    const goal = unwrapData<Goal>(response);
    if (!goal) throw new Error("Goal not returned from update endpoint");
    return goal;
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
    return unwrapData<Book[]>(response) || [];
  },

  create: async (input: CreateBookInput): Promise<Book> => {
    const response = await request<ApiResponse<Book>>("/books", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const book = unwrapData<Book>(response);
    if (!book) throw new Error("Book not returned from create endpoint");
    return book;
  },

  update: async (
    id: string,
    input: Partial<CreateBookInput>,
  ): Promise<Book> => {
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
    return unwrapData<PomodoroSession[]>(response) || [];
  },

  create: async (input: CreatePomodoroInput): Promise<PomodoroSession> => {
    const response = await request<ApiResponse<PomodoroSession>>("/pomodoro", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const session = unwrapData<PomodoroSession>(response);
    if (!session) {
      throw new Error("Pomodoro session not returned from create endpoint");
    }
    return session;
  },

  update: async (
    id: string,
    input: Partial<CreatePomodoroInput>,
  ): Promise<PomodoroSession> => {
    const response = await request<ApiResponse<PomodoroSession>>(
      `/pomodoro/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
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
    const response =
      await request<ApiResponse<Notification[]>>("/notifications");
    return unwrapData<Notification[]>(response) || [];
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
