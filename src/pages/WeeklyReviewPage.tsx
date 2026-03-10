import { useApp } from "@/context/AppContext";
import { ClipboardCheck, CheckCircle2, Clock, AlertTriangle, Flame, BookOpen, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WeeklyReviewPage() {
  const { tasks, habits, books, goals, projects } = useApp();

  const completed = tasks.filter(t => t.status === "completed");
  const pending = tasks.filter(t => t.status === "next_action");
  const inbox = tasks.filter(t => t.status === "inbox");
  const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().split("T")[0]);

  const contextStats = (["work", "personal", "learning", "fitness"] as const).map(c => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    completed: completed.filter(t => t.context === c).length,
    pending: pending.filter(t => t.context === c).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Weekly Review
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Reflect on your week, process inbox, and plan ahead.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{completed.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-info" />
            <span className="text-xs font-medium text-muted-foreground">Pending</span>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{pending.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-xs font-medium text-muted-foreground">Overdue</span>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{overdue.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">Inbox Items</span>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{inbox.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks by Context Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Tasks by Context</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={contextStats}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(220, 10%, 46%)" }} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)" }} />
              <Bar dataKey="completed" name="Completed" fill="hsl(170, 60%, 40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold text-card-foreground">Overdue Tasks</h3>
          </div>
          <div className="divide-y divide-border">
            {overdue.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground text-sm">🎉 No overdue tasks!</p>
            ) : overdue.map(t => (
              <div key={t.id} className="px-4 py-3">
                <p className="text-sm font-medium text-card-foreground">{t.title}</p>
                <p className="text-xs text-destructive">Due: {t.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Project Progress</h3>
          <div className="space-y-4">
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const done = projectTasks.filter(t => t.completed).length;
              const total = projectTasks.length;
              const pct = total > 0 ? Math.round(done / total * 100) : 0;
              return (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-sm font-medium text-card-foreground">{project.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Habits & Reading */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-card-foreground">Habit Highlights</h3>
            </div>
            <div className="space-y-2">
              {habits.slice(0, 4).map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{h.name}</span>
                  <span className="text-sm font-bold text-accent">{h.streak} day streak</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-info" />
              <h3 className="font-semibold text-card-foreground">Reading Progress</h3>
            </div>
            <div className="space-y-3">
              {books.filter(b => b.completedPages < b.totalPages).slice(0, 3).map(b => (
                <div key={b.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-card-foreground">{b.title}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(b.completedPages / b.totalPages * 100)}%</span>
                  </div>
                  <Progress value={b.completedPages / b.totalPages * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
