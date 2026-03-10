import { useApp } from "@/context/AppContext";
import { CheckSquare, Flame, BookOpen, Timer, TrendingUp, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PomodoroWidget } from "@/components/dashboard/PomodoroWidget";

export default function DashboardPage() {
  const { tasks, habits, books, sessions, goals, loading, toggleTask, toggleHabitToday } = useApp();
  const todayTasks = tasks.slice(0, 5);
  const completedToday = tasks.filter(t => t.completed).length;

  if (loading.tasks) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Good morning, Alex 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your productivity overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tasks Done", value: `${completedToday}/${tasks.length}`, icon: CheckSquare, color: "text-primary" },
          { label: "Active Streaks", value: habits.filter(h => h.streak > 0).length, icon: Flame, color: "text-accent" },
          { label: "Books Reading", value: books.filter(b => b.completedPages < b.totalPages).length, icon: BookOpen, color: "text-info" },
          { label: "Focus Sessions", value: sessions.length, icon: Timer, color: "text-success" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-2xl font-bold text-card-foreground">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-card-foreground">Today's Tasks</h2>
          </div>
          <div className="divide-y divide-border">
            {todayTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed ? "bg-primary border-primary" : "border-border hover:border-primary"
                  }`}
                >
                  {task.completed && <CheckSquare className="h-3 w-3 text-primary-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-card-foreground"}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.priority === "high" ? "bg-destructive/10 text-destructive" :
                  task.priority === "medium" ? "bg-accent/10 text-accent" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pomodoro Widget */}
        <PomodoroWidget />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Habit Streaks */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" />
            <h2 className="font-semibold text-card-foreground">Habit Streaks</h2>
          </div>
          <div className="p-4 space-y-3">
            {habits.slice(0, 4).map(habit => (
              <div key={habit.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabitToday(habit.id)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    habit.completedToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {habit.completedToday ? "✓" : ""}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">{habit.frequency}</p>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="text-sm font-bold">{habit.streak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reading Progress */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-info" />
            <h2 className="font-semibold text-card-foreground">Reading Progress</h2>
          </div>
          <div className="p-4 space-y-4">
            {books.slice(0, 3).map(book => (
              <div key={book.id}>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium text-card-foreground">{book.title}</p>
                  <span className="text-xs text-muted-foreground">{Math.round(book.completedPages / book.totalPages * 100)}%</span>
                </div>
                <Progress value={book.completedPages / book.totalPages * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{book.completedPages}/{book.totalPages} pages</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-card-foreground">Goals Progress</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {goals.map(goal => (
            <div key={goal.id} className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-card-foreground mb-2">{goal.title}</p>
              <Progress value={goal.current / goal.target * 100} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">{goal.current}/{goal.target} · {goal.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
