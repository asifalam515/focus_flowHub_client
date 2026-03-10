import { Task, Habit, Goal, Book, PomodoroSession, User, Notification, Project } from "@/types";

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const dummyUser: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex@focushub.io",
  avatar: "",
  points: 2450,
  achievements: ["Early Bird", "Streak Master", "Bookworm", "Focus Champion"],
};

export const dummyNotifications: Notification[] = [
  { id: "n1", message: "You completed 5 tasks today! 🎉", read: false, createdAt: new Date().toISOString() },
  { id: "n2", message: "Your reading streak is at 7 days!", read: false, createdAt: new Date().toISOString() },
  { id: "n3", message: "New goal milestone reached!", read: true, createdAt: new Date().toISOString() },
  { id: "n4", message: "⏰ 3 tasks are overdue — review your inbox!", read: false, createdAt: new Date().toISOString() },
  { id: "n5", message: "📋 Weekly review reminder: summarize your week", read: false, createdAt: new Date().toISOString() },
];

export const dummyProjects: Project[] = [
  { id: "proj1", name: "Website Redesign", description: "Complete overhaul of the company website", color: "hsl(170 60% 40%)", createdAt: "2026-02-01T00:00:00Z" },
  { id: "proj2", name: "Fitness Journey", description: "12-week training plan with diet tracking", color: "hsl(36 90% 55%)", createdAt: "2026-01-15T00:00:00Z" },
  { id: "proj3", name: "Learn TypeScript", description: "Master advanced TypeScript patterns", color: "hsl(210 80% 55%)", createdAt: "2026-02-20T00:00:00Z" },
  { id: "proj4", name: "Q1 Content Strategy", description: "Plan and execute content for Q1", color: "hsl(280 60% 55%)", createdAt: "2026-01-01T00:00:00Z" },
];

export const dummyTasks: Task[] = [
  // Inbox items (unclarified)
  { id: "t-i1", title: "Look into new CI/CD tools", description: "", dueDate: "", priority: "low", completed: false, status: "inbox", context: "work", projectId: null, createdAt: "2026-03-08T08:00:00Z" },
  { id: "t-i2", title: "Buy new running shoes", description: "", dueDate: "", priority: "medium", completed: false, status: "inbox", context: "fitness", projectId: null, createdAt: "2026-03-08T07:30:00Z" },
  { id: "t-i3", title: "Research meal prep services", description: "", dueDate: "", priority: "low", completed: false, status: "inbox", context: "personal", projectId: null, createdAt: "2026-03-07T20:00:00Z" },
  { id: "t-i4", title: "Check out Rust programming language", description: "", dueDate: "", priority: "low", completed: false, status: "inbox", context: "learning", projectId: null, createdAt: "2026-03-07T19:00:00Z" },
  { id: "t-i5", title: "Schedule dentist appointment", description: "", dueDate: "", priority: "medium", completed: false, status: "inbox", context: "personal", projectId: null, createdAt: "2026-03-07T15:00:00Z" },

  // Next actions (clarified & actionable)
  { id: "t1", title: "Design landing page mockups", description: "Create 3 variations for the new product landing page", dueDate: "2026-03-09", startTime: "09:00", endTime: "11:00", priority: "high", completed: false, status: "next_action", context: "work", projectId: "proj1", createdAt: "2026-03-07T10:00:00Z" },
  { id: "t3", title: "Write weekly newsletter", description: "Draft and schedule this week's newsletter", dueDate: "2026-03-10", startTime: "14:00", endTime: "15:30", priority: "medium", completed: false, status: "next_action", context: "work", projectId: "proj4", createdAt: "2026-03-07T14:00:00Z" },
  { id: "t4", title: "Update API documentation", description: "Document the new endpoints added this sprint", dueDate: "2026-03-11", startTime: "10:00", endTime: "12:00", priority: "low", completed: false, status: "next_action", context: "work", projectId: "proj1", createdAt: "2026-03-05T08:00:00Z" },
  { id: "t6", title: "Prepare sprint retrospective", description: "Gather feedback and create presentation", dueDate: "2026-03-12", startTime: "15:00", endTime: "16:00", priority: "low", completed: false, status: "next_action", context: "work", projectId: null, createdAt: "2026-03-07T16:00:00Z" },
  { id: "t7", title: "Complete TypeScript generics chapter", description: "Finish exercises in chapter 8", dueDate: "2026-03-09", startTime: "13:00", endTime: "14:30", priority: "medium", completed: false, status: "next_action", context: "learning", projectId: "proj3", createdAt: "2026-03-06T10:00:00Z" },
  { id: "t8", title: "Run 5K training session", description: "Week 4, Day 2 of training plan", dueDate: "2026-03-08", startTime: "07:00", endTime: "08:00", priority: "high", completed: false, status: "next_action", context: "fitness", projectId: "proj2", createdAt: "2026-03-07T06:00:00Z" },
  { id: "t9", title: "Plan weekend grocery shopping", description: "Meal prep for next week", dueDate: "2026-03-08", startTime: "17:00", endTime: "18:00", priority: "medium", completed: false, status: "next_action", context: "personal", projectId: null, createdAt: "2026-03-06T18:00:00Z" },

  // Completed
  { id: "t2", title: "Review pull requests", description: "Review 4 pending PRs from the team", dueDate: "2026-03-08", priority: "medium", completed: true, status: "completed", context: "work", projectId: "proj1", createdAt: "2026-03-06T09:00:00Z" },
  { id: "t5", title: "Fix navigation bug", description: "Sidebar doesn't collapse on mobile", dueDate: "2026-03-08", priority: "high", completed: true, status: "completed", context: "work", projectId: "proj1", createdAt: "2026-03-04T11:00:00Z" },
  { id: "t10", title: "Set up TypeScript project", description: "Initialize project with proper tsconfig", dueDate: "2026-03-05", priority: "medium", completed: true, status: "completed", context: "learning", projectId: "proj3", createdAt: "2026-03-03T10:00:00Z" },
  { id: "t11", title: "Complete 5K run", description: "Week 3 final run", dueDate: "2026-03-06", priority: "high", completed: true, status: "completed", context: "fitness", projectId: "proj2", createdAt: "2026-03-05T07:00:00Z" },
];

export const dummyHabits: Habit[] = [
  { id: "h1", name: "Morning Meditation", frequency: "daily", streak: 14, completedToday: true, color: "hsl(170 60% 40%)", createdAt: "2026-01-01T00:00:00Z" },
  { id: "h2", name: "Read 30 minutes", frequency: "daily", streak: 7, completedToday: false, color: "hsl(210 80% 55%)", createdAt: "2026-01-15T00:00:00Z" },
  { id: "h3", name: "Exercise", frequency: "daily", streak: 21, completedToday: true, color: "hsl(36 90% 55%)", createdAt: "2026-02-01T00:00:00Z" },
  { id: "h4", name: "Journal", frequency: "daily", streak: 5, completedToday: false, color: "hsl(280 60% 55%)", createdAt: "2026-02-15T00:00:00Z" },
  { id: "h5", name: "Weekly Review", frequency: "weekly", streak: 8, completedToday: false, color: "hsl(0 72% 51%)", createdAt: "2026-01-10T00:00:00Z" },
];

export const dummyGoals: Goal[] = [
  { id: "g1", title: "Complete 50 tasks this month", type: "task", target: 50, current: 32, deadline: "2026-03-31", createdAt: "2026-03-01T00:00:00Z" },
  { id: "g2", title: "30-day meditation streak", type: "habit", target: 30, current: 14, deadline: "2026-03-31", createdAt: "2026-03-01T00:00:00Z" },
  { id: "g3", title: "Read 4 books this quarter", type: "reading", target: 4, current: 2, deadline: "2026-03-31", createdAt: "2026-01-01T00:00:00Z" },
  { id: "g4", title: "Exercise 20 times this month", type: "habit", target: 20, current: 15, deadline: "2026-03-31", createdAt: "2026-03-01T00:00:00Z" },
];

export const dummyBooks: Book[] = [
  { id: "b1", title: "Atomic Habits", author: "James Clear", totalPages: 320, completedPages: 320, notes: "Great insights on building systems over goals.", summary: "A practical guide to building good habits and breaking bad ones using the four laws of behavior change.", createdAt: "2026-01-10T00:00:00Z" },
  { id: "b2", title: "Deep Work", author: "Cal Newport", totalPages: 296, completedPages: 180, notes: "The concept of attention residue is fascinating.", summary: "Rules for focused success in a distracted world.", createdAt: "2026-02-01T00:00:00Z" },
  { id: "b3", title: "The Pragmatic Programmer", author: "David Thomas", totalPages: 352, completedPages: 90, notes: "DRY and orthogonality concepts are key.", summary: "A classic guide to software craftsmanship.", createdAt: "2026-02-20T00:00:00Z" },
  { id: "b4", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", totalPages: 499, completedPages: 45, notes: "", summary: "Explores the two systems of thinking that drive our decisions.", createdAt: "2026-03-01T00:00:00Z" },
];

export const dummySessions: PomodoroSession[] = [
  { id: "p1", duration: 25, completedAt: "2026-03-08T09:30:00Z", taskTitle: "Design landing page mockups" },
  { id: "p2", duration: 25, completedAt: "2026-03-08T10:05:00Z", taskTitle: "Design landing page mockups" },
  { id: "p3", duration: 25, completedAt: "2026-03-07T14:00:00Z", taskTitle: "Review pull requests" },
  { id: "p4", duration: 25, completedAt: "2026-03-07T15:00:00Z", taskTitle: "Write weekly newsletter" },
  { id: "p5", duration: 25, completedAt: "2026-03-06T11:00:00Z", taskTitle: "Fix navigation bug" },
];

// Dummy API functions
export const api = {
  login: async (_email: string, _password: string) => { await delay(500); return { user: dummyUser, token: "dummy-jwt-token" }; },
  signup: async (_email: string, _password: string, _name: string) => { await delay(500); return { user: dummyUser, token: "dummy-jwt-token" }; },

  // Tasks (includes inbox items)
  getTasks: async (): Promise<Task[]> => { await delay(); return [...dummyTasks]; },
  createTask: async (task: Omit<Task, "id" | "createdAt">): Promise<Task> => { await delay(); return { ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString() }; },
  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => { await delay(); const t = dummyTasks.find(t => t.id === id); return { ...t!, ...data }; },
  deleteTask: async (_id: string): Promise<void> => { await delay(); },

  // Inbox shortcuts
  getInbox: async (): Promise<Task[]> => { await delay(); return dummyTasks.filter(t => t.status === "inbox"); },
  createInboxItem: async (item: { title: string; description: string; context: Task["context"] }): Promise<Task> => {
    await delay();
    return { ...item, id: `t${Date.now()}`, dueDate: "", priority: "low", completed: false, status: "inbox", projectId: null, createdAt: new Date().toISOString() };
  },

  // Projects
  getProjects: async (): Promise<Project[]> => { await delay(); return [...dummyProjects]; },
  createProject: async (p: Omit<Project, "id" | "createdAt">): Promise<Project> => { await delay(); return { ...p, id: `proj${Date.now()}`, createdAt: new Date().toISOString() }; },
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => { await delay(); const p = dummyProjects.find(p => p.id === id); return { ...p!, ...data }; },
  deleteProject: async (_id: string): Promise<void> => { await delay(); },

  // Habits
  getHabits: async (): Promise<Habit[]> => { await delay(); return [...dummyHabits]; },
  createHabit: async (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedToday">): Promise<Habit> => { await delay(); return { ...habit, id: `h${Date.now()}`, streak: 0, completedToday: false, createdAt: new Date().toISOString() }; },
  updateHabit: async (id: string, data: Partial<Habit>): Promise<Habit> => { await delay(); const h = dummyHabits.find(h => h.id === id); return { ...h!, ...data }; },
  deleteHabit: async (_id: string): Promise<void> => { await delay(); },

  // Goals
  getGoals: async (): Promise<Goal[]> => { await delay(); return [...dummyGoals]; },
  createGoal: async (goal: Omit<Goal, "id" | "createdAt">): Promise<Goal> => { await delay(); return { ...goal, id: `g${Date.now()}`, createdAt: new Date().toISOString() }; },
  updateGoal: async (id: string, data: Partial<Goal>): Promise<Goal> => { await delay(); const g = dummyGoals.find(g => g.id === id); return { ...g!, ...data }; },
  deleteGoal: async (_id: string): Promise<void> => { await delay(); },

  // Books
  getBooks: async (): Promise<Book[]> => { await delay(); return [...dummyBooks]; },
  createBook: async (book: Omit<Book, "id" | "createdAt">): Promise<Book> => { await delay(); return { ...book, id: `b${Date.now()}`, createdAt: new Date().toISOString() }; },
  updateBook: async (id: string, data: Partial<Book>): Promise<Book> => { await delay(); const b = dummyBooks.find(b => b.id === id); return { ...b!, ...data }; },
  deleteBook: async (_id: string): Promise<void> => { await delay(); },

  // Pomodoro
  getSessions: async (): Promise<PomodoroSession[]> => { await delay(); return [...dummySessions]; },
  createSession: async (session: Omit<PomodoroSession, "id">): Promise<PomodoroSession> => { await delay(); return { ...session, id: `p${Date.now()}` }; },
  deleteSession: async (_id: string): Promise<void> => { await delay(); },

  // Profile
  getProfile: async (): Promise<User> => { await delay(); return { ...dummyUser }; },
  updateProfile: async (data: Partial<User>): Promise<User> => { await delay(); return { ...dummyUser, ...data }; },
};
