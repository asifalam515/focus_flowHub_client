import { dummyNotifications } from "@/data/dummy";
import { toast } from "@/hooks/use-toast";
import {
  api,
  CreateBookInput,
  CreateGoalInput,
  CreateHabitInput,
  CreateProjectInput,
  CreateTaskInput,
  removeToken,
  setToken,
} from "@/lib/api";
import {
  Book,
  Goal,
  Habit,
  Notification,
  PomodoroSession,
  Project,
  Task,
  TaskStatus,
  TaskContext as TCtx,
  User,
} from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  goals: Goal[];
  books: Book[];
  sessions: PomodoroSession[];
  notifications: Notification[];
  loading: Record<string, boolean>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  // Tasks
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "userId">) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  moveTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  // Inbox quick capture
  captureToInbox: (title: string, context?: TCtx) => Promise<void>;
  // Projects
  fetchProjects: () => Promise<void>;
  addProject: (
    p: Omit<Project, "id" | "createdAt" | "userId">,
  ) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Habits
  fetchHabits: () => Promise<void>;
  addHabit: (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "streak" | "completedToday" | "userId"
    >,
  ) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitToday: (id: string) => Promise<void>;
  // Goals
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "userId">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Books
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, "id" | "createdAt" | "userId">) => Promise<void>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  // Pomodoro
  fetchSessions: () => Promise<void>;
  addSession: (
    session: Omit<PomodoroSession, "id" | "userId" | "createdAt">,
  ) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  // Profile
  updateProfile: (name?: string, avatar?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [notifications, setNotifications] =
    useState<Notification[]>(dummyNotifications);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setL = (key: string, val: boolean) =>
    setLoading((p) => ({ ...p, [key]: val }));

  const login = useCallback(async (email: string, password: string) => {
    setL("auth", true);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.token);
      setUser(res.user);
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setL("auth", false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string, avatar?: string) => {
      setL("auth", true);
      try {
        const res = await api.auth.signup(email, password, name, avatar);
        setToken(res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        toast({
          title: "Account created!",
          description: "Welcome to FocusHub.",
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Signup failed";
        toast({
          title: "Signup failed",
          description: message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setL("auth", false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore logout errors from server
    } finally {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Tasks
  const fetchTasks = useCallback(async () => {
    setL("tasks", true);
    try {
      const tasks = await api.tasks.getAll();
      setTasks(tasks);
    } finally {
      setL("tasks", false);
    }
  }, []);

  const addTask = useCallback(
    async (task: Omit<Task, "id" | "createdAt" | "userId">) => {
      const t = await api.tasks.create(task as CreateTaskInput);
      setTasks((p) => [t, ...p]);
      toast({ title: "Task added" });
    },
    [],
  );

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const t = await api.tasks.update(id, data as Partial<CreateTaskInput>);
    setTasks((p) => p.map((x) => (x.id === id ? t : x)));
    toast({ title: "Task updated" });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await api.tasks.delete(id);
    setTasks((p) => p.filter((x) => x.id !== id));
    toast({ title: "Task deleted" });
  }, []);

  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const newCompleted = !task.completed;
      await api.tasks.update(id, {
        completed: newCompleted,
        status: newCompleted ? "completed" : "next_action",
      });
      setTasks((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                completed: newCompleted,
                status: newCompleted ? "completed" : "next_action",
              }
            : x,
        ),
      );
    },
    [tasks],
  );

  const moveTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    await api.tasks.moveInbox(id, status);
    setTasks((p) =>
      p.map((x) =>
        x.id === id ? { ...x, status, completed: status === "completed" } : x,
      ),
    );
    toast({
      title:
        status === "next_action"
          ? "Moved to Next Actions"
          : status === "completed"
            ? "Marked complete"
            : "Moved to Inbox",
    });
  }, []);

  const captureToInbox = useCallback(
    async (title: string, context: TCtx = "personal") => {
      const t = await api.tasks.createInbox({
        title,
        description: "",
        context,
      });
      setTasks((p) => [t, ...p]);
      toast({ title: "Captured to Inbox" });
    },
    [],
  );

  // Projects
  const fetchProjects = useCallback(async () => {
    setL("projects", true);
    try {
      const projects = await api.projects.getAll();
      setProjects(projects);
    } finally {
      setL("projects", false);
    }
  }, []);

  const addProject = useCallback(
    async (p: Omit<Project, "id" | "createdAt" | "userId">) => {
      const proj = await api.projects.create(p as CreateProjectInput);
      setProjects((prev) => [proj, ...prev]);
      toast({ title: "Project created" });
    },
    [],
  );

  const updateProject = useCallback(
    async (id: string, data: Partial<Project>) => {
      await api.projects.update(id, data as Partial<CreateProjectInput>);
      setProjects((prev) =>
        prev.map((x) => (x.id === id ? { ...x, ...data } : x)),
      );
      toast({ title: "Project updated" });
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    await api.projects.delete(id);
    setProjects((prev) => prev.filter((x) => x.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
    );
    toast({ title: "Project deleted" });
  }, []);

  // Habits
  const fetchHabits = useCallback(async () => {
    setL("habits", true);
    try {
      const habits = await api.habits.getAll();
      setHabits(habits);
    } finally {
      setL("habits", false);
    }
  }, []);

  const addHabit = useCallback(
    async (
      habit: Omit<
        Habit,
        "id" | "createdAt" | "streak" | "completedToday" | "userId"
      >,
    ) => {
      const h = await api.habits.create(habit as CreateHabitInput);
      setHabits((p) => [h, ...p]);
      toast({ title: "Habit added" });
    },
    [],
  );

  const updateHabit = useCallback(async (id: string, data: Partial<Habit>) => {
    await api.habits.update(id, data as Partial<CreateHabitInput>);
    setHabits((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
    toast({ title: "Habit updated" });
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    await api.habits.delete(id);
    setHabits((p) => p.filter((x) => x.id !== id));
    toast({ title: "Habit deleted" });
  }, []);

  const toggleHabitToday = useCallback(
    async (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;
      const newCompleted = !habit.completedToday;
      // Backend doesn't have toggle endpoint, so we update directly
      await api.habits.update(id, {
        completedToday: newCompleted,
        streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
      });
      setHabits((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                completedToday: newCompleted,
                streak: newCompleted ? x.streak + 1 : Math.max(0, x.streak - 1),
              }
            : x,
        ),
      );
    },
    [habits],
  );

  // Goals
  const fetchGoals = useCallback(async () => {
    setL("goals", true);
    try {
      const goals = await api.goals.getAll();
      setGoals(goals);
    } finally {
      setL("goals", false);
    }
  }, []);

  const addGoal = useCallback(
    async (goal: Omit<Goal, "id" | "createdAt" | "userId">) => {
      const g = await api.goals.create(goal as CreateGoalInput);
      setGoals((p) => [g, ...p]);
      toast({ title: "Goal added" });
    },
    [],
  );

  const updateGoal = useCallback(async (id: string, data: Partial<Goal>) => {
    await api.goals.update(id, data as Partial<CreateGoalInput>);
    setGoals((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
    toast({ title: "Goal updated" });
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await api.goals.delete(id);
    setGoals((p) => p.filter((x) => x.id !== id));
    toast({ title: "Goal deleted" });
  }, []);

  // Books
  const fetchBooks = useCallback(async () => {
    setL("books", true);
    try {
      const books = await api.books.getAll();
      setBooks(books);
    } finally {
      setL("books", false);
    }
  }, []);

  const addBook = useCallback(
    async (book: Omit<Book, "id" | "createdAt" | "userId">) => {
      const b = await api.books.create(book as CreateBookInput);
      setBooks((p) => [b, ...p]);
      toast({ title: "Book added" });
    },
    [],
  );

  const updateBook = useCallback(async (id: string, data: Partial<Book>) => {
    await api.books.update(id, data as Partial<CreateBookInput>);
    setBooks((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
    toast({ title: "Book updated" });
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    await api.books.delete(id);
    setBooks((p) => p.filter((x) => x.id !== id));
    toast({ title: "Book deleted" });
  }, []);

  // Pomodoro
  const fetchSessions = useCallback(async () => {
    setL("sessions", true);
    try {
      setSessions(await api.getSessions());
    } finally {
      setL("sessions", false);
    }
  }, []);
  const addSession = useCallback(
    async (session: Omit<PomodoroSession, "id">) => {
      const s = await api.createSession(session);
      setSessions((p) => [s, ...p]);
    },
    [],
  );
  const deleteSession = useCallback(async (id: string) => {
    await api.deleteSession(id);
    setSessions((p) => p.filter((x) => x.id !== id));
  }, []);

  // Profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    const u = await api.updateProfile(data);
    setUser(u);
    toast({ title: "Profile updated" });
  }, []);
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((p) =>
      p.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchProjects();
      fetchHabits();
      fetchGoals();
      fetchBooks();
      fetchSessions();
    }
  }, [isAuthenticated]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        tasks,
        projects,
        habits,
        goals,
        books,
        sessions,
        notifications,
        loading,
        login,
        signup,
        logout,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        moveTaskStatus,
        captureToInbox,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        fetchHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitToday,
        fetchGoals,
        addGoal,
        updateGoal,
        deleteGoal,
        fetchBooks,
        addBook,
        updateBook,
        deleteBook,
        fetchSessions,
        addSession,
        deleteSession,
        updateProfile,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
