import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Zap, CheckSquare, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskContext } from "@/types";

const contextLabels: Record<TaskContext, string> = { work: "Work", personal: "Personal", learning: "Learning", fitness: "Fitness" };
const contextColors: Record<TaskContext, string> = { work: "bg-info/10 text-info", personal: "bg-primary/10 text-primary", learning: "bg-accent/10 text-accent", fitness: "bg-success/10 text-success" };

export default function NextActionsPage() {
  const { tasks, projects, moveTaskStatus, toggleTask } = useApp();
  const [contextFilter, setContextFilter] = useState<TaskContext | "all">("all");

  const nextActions = tasks
    .filter(t => t.status === "next_action")
    .filter(t => contextFilter === "all" ? true : t.context === contextFilter)
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6 text-accent" /> Next Actions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Clarified, actionable tasks sorted by priority.</p>
      </div>

      {/* Context filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setContextFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${contextFilter === "all" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>All</button>
        {(Object.keys(contextLabels) as TaskContext[]).map(c => (
          <button key={c} onClick={() => setContextFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${contextFilter === c ? contextColors[c] : "bg-muted text-muted-foreground"}`}>
            {contextLabels[c]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {nextActions.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          return (
            <div key={task.id} className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
              <button
                onClick={() => toggleTask(task.id)}
                className="h-6 w-6 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors shrink-0"
              >
                {task.completed && <CheckSquare className="h-3 w-3 text-primary" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{task.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${contextColors[task.context]}`}>{contextLabels[task.context]}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${task.priority === "high" ? "bg-destructive/10 text-destructive" : task.priority === "medium" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{task.priority}</span>
                  {task.dueDate && <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>}
                  {project && <span className="text-[10px] text-muted-foreground">· {project.name}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => moveTaskStatus(task.id, "inbox")} title="Back to Inbox">
                  <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => moveTaskStatus(task.id, "completed")} title="Mark complete" className="text-success hover:text-success">
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
        {nextActions.length === 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
            <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No next actions. Process your inbox!</p>
          </div>
        )}
      </div>
    </div>
  );
}
