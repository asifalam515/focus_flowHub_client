import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Task, Habit, Goal, Book, PomodoroSession, User, Notification, Project, TaskStatus, TaskContext as TCtx } from "@/types";
import { api, dummyUser, dummyNotifications } from "@/data/dummy";
import { toast } from "@/hooks/use-toast";

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
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  moveTaskStatus: (id: string, status: TaskStatus) => void;
  // Inbox quick capture
  captureToInbox: (title: string, context?: TCtx) => Promise<void>;
  // Projects
  fetchProjects: () => Promise<void>;
  addProject: (p: Omit<Project, "id" | "createdAt">) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Habits
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedToday">) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitToday: (id: string) => Promise<void>;
  // Goals
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  // Books
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, "id" | "createdAt">) => Promise<void>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  // Pomodoro
  fetchSessions: () => Promise<void>;
  addSession: (session: Omit<PomodoroSession, "id">) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  // Profile
  updateProfile: (data: Partial<User>) => Promise<void>;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(dummyUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setL = (key: string, val: boolean) => setLoading(p => ({ ...p, [key]: val }));

  const login = useCallback(async (email: string, password: string) => {
    setL("auth", true);
    try {
      const res = await api.login(email, password);
      setUser(res.user); setIsAuthenticated(true);
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
    } finally { setL("auth", false); }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setL("auth", true);
    try {
      const res = await api.signup(email, password, name);
      setUser(res.user); setIsAuthenticated(true);
      toast({ title: "Account created!", description: "Welcome to FocusHub." });
    } finally { setL("auth", false); }
  }, []);

  const logout = useCallback(() => { setUser(null); setIsAuthenticated(false); }, []);

  // Tasks
  const fetchTasks = useCallback(async () => { setL("tasks", true); try { setTasks(await api.getTasks()); } finally { setL("tasks", false); } }, []);
  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => { const t = await api.createTask(task); setTasks(p => [t, ...p]); toast({ title: "Task added" }); }, []);
  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const t = await api.updateTask(id, data);
    setTasks(p => p.map(x => x.id === id ? { ...x, ...data, ...t } : x));
    toast({ title: "Task updated" });
  }, []);
  const deleteTask = useCallback(async (id: string) => { await api.deleteTask(id); setTasks(p => p.filter(x => x.id !== id)); toast({ title: "Task deleted" }); }, []);
  const toggleTask = useCallback(async (id: string) => {
    setTasks(p => p.map(x => x.id === id ? { ...x, completed: !x.completed, status: !x.completed ? "completed" : "next_action" } : x));
  }, []);
  const moveTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(p => p.map(x => x.id === id ? { ...x, status, completed: status === "completed" } : x));
    toast({ title: status === "next_action" ? "Moved to Next Actions" : status === "completed" ? "Marked complete" : "Moved to Inbox" });
  }, []);
  const captureToInbox = useCallback(async (title: string, context: TCtx = "personal") => {
    const t = await api.createInboxItem({ title, description: "", context });
    setTasks(p => [t, ...p]);
    toast({ title: "Captured to Inbox" });
  }, []);

  // Projects
  const fetchProjects = useCallback(async () => { setL("projects", true); try { setProjects(await api.getProjects()); } finally { setL("projects", false); } }, []);
  const addProject = useCallback(async (p: Omit<Project, "id" | "createdAt">) => { const proj = await api.createProject(p); setProjects(prev => [proj, ...prev]); toast({ title: "Project created" }); }, []);
  const updateProject = useCallback(async (id: string, data: Partial<Project>) => { const p = await api.updateProject(id, data); setProjects(prev => prev.map(x => x.id === id ? { ...x, ...data } : x)); toast({ title: "Project updated" }); }, []);
  const deleteProject = useCallback(async (id: string) => { await api.deleteProject(id); setProjects(prev => prev.filter(x => x.id !== id)); setTasks(prev => prev.map(t => t.projectId === id ? { ...t, projectId: null } : t)); toast({ title: "Project deleted" }); }, []);

  // Habits
  const fetchHabits = useCallback(async () => { setL("habits", true); try { setHabits(await api.getHabits()); } finally { setL("habits", false); } }, []);
  const addHabit = useCallback(async (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedToday">) => { const h = await api.createHabit(habit); setHabits(p => [h, ...p]); toast({ title: "Habit added" }); }, []);
  const updateHabit = useCallback(async (id: string, data: Partial<Habit>) => { await api.updateHabit(id, data); setHabits(p => p.map(x => x.id === id ? { ...x, ...data } : x)); toast({ title: "Habit updated" }); }, []);
  const deleteHabit = useCallback(async (id: string) => { await api.deleteHabit(id); setHabits(p => p.filter(x => x.id !== id)); toast({ title: "Habit deleted" }); }, []);
  const toggleHabitToday = useCallback(async (id: string) => {
    setHabits(p => p.map(x => x.id === id ? { ...x, completedToday: !x.completedToday, streak: !x.completedToday ? x.streak + 1 : x.streak - 1 } : x));
  }, []);

  // Goals
  const fetchGoals = useCallback(async () => { setL("goals", true); try { setGoals(await api.getGoals()); } finally { setL("goals", false); } }, []);
  const addGoal = useCallback(async (goal: Omit<Goal, "id" | "createdAt">) => { const g = await api.createGoal(goal); setGoals(p => [g, ...p]); toast({ title: "Goal added" }); }, []);
  const updateGoal = useCallback(async (id: string, data: Partial<Goal>) => { await api.updateGoal(id, data); setGoals(p => p.map(x => x.id === id ? { ...x, ...data } : x)); toast({ title: "Goal updated" }); }, []);
  const deleteGoal = useCallback(async (id: string) => { await api.deleteGoal(id); setGoals(p => p.filter(x => x.id !== id)); toast({ title: "Goal deleted" }); }, []);

  // Books
  const fetchBooks = useCallback(async () => { setL("books", true); try { setBooks(await api.getBooks()); } finally { setL("books", false); } }, []);
  const addBook = useCallback(async (book: Omit<Book, "id" | "createdAt">) => { const b = await api.createBook(book); setBooks(p => [b, ...p]); toast({ title: "Book added" }); }, []);
  const updateBook = useCallback(async (id: string, data: Partial<Book>) => { await api.updateBook(id, data); setBooks(p => p.map(x => x.id === id ? { ...x, ...data } : x)); toast({ title: "Book updated" }); }, []);
  const deleteBook = useCallback(async (id: string) => { await api.deleteBook(id); setBooks(p => p.filter(x => x.id !== id)); toast({ title: "Book deleted" }); }, []);

  // Pomodoro
  const fetchSessions = useCallback(async () => { setL("sessions", true); try { setSessions(await api.getSessions()); } finally { setL("sessions", false); } }, []);
  const addSession = useCallback(async (session: Omit<PomodoroSession, "id">) => { const s = await api.createSession(session); setSessions(p => [s, ...p]); }, []);
  const deleteSession = useCallback(async (id: string) => { await api.deleteSession(id); setSessions(p => p.filter(x => x.id !== id)); }, []);

  // Profile
  const updateProfile = useCallback(async (data: Partial<User>) => { const u = await api.updateProfile(data); setUser(u); toast({ title: "Profile updated" }); }, []);
  const markNotificationRead = useCallback((id: string) => { setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n)); }, []);

  useEffect(() => { if (isAuthenticated) { fetchTasks(); fetchProjects(); fetchHabits(); fetchGoals(); fetchBooks(); fetchSessions(); } }, [isAuthenticated]);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated, tasks, projects, habits, goals, books, sessions, notifications, loading,
      login, signup, logout,
      fetchTasks, addTask, updateTask, deleteTask, toggleTask, moveTaskStatus, captureToInbox,
      fetchProjects, addProject, updateProject, deleteProject,
      fetchHabits, addHabit, updateHabit, deleteHabit, toggleHabitToday,
      fetchGoals, addGoal, updateGoal, deleteGoal,
      fetchBooks, addBook, updateBook, deleteBook,
      fetchSessions, addSession, deleteSession,
      updateProfile, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
