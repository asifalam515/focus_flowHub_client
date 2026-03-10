import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Edit2, Trash2, CheckSquare, List, CalendarDays, Clock, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskWeekCalendarView } from "@/components/tasks/TaskWeekCalendarView";
import { TaskDayCalendarView } from "@/components/tasks/TaskDayCalendarView";
import { Task, TaskContext, TaskStatus } from "@/types";

type Filter = "all" | "completed" | "pending";
type View = "list" | "day" | "week" | "month";

const contextLabels: Record<TaskContext, string> = { work: "Work", personal: "Personal", learning: "Learning", fitness: "Fitness" };
const contextColors: Record<TaskContext, string> = { work: "bg-info/10 text-info", personal: "bg-primary/10 text-primary", learning: "bg-accent/10 text-accent", fitness: "bg-success/10 text-success" };

export default function TasksPage() {
  const { tasks, projects, loading, addTask, updateTask, deleteTask, toggleTask, moveTaskStatus } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [contextFilter, setContextFilter] = useState<TaskContext | "all">("all");
  const [view, setView] = useState<View>("week");
  const [calMonth, setCalMonth] = useState(new Date());
  const [calWeek, setCalWeek] = useState(new Date());
  const [calDay, setCalDay] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", startTime: "", endTime: "", priority: "medium" as Task["priority"], context: "work" as TaskContext, projectId: null as string | null, status: "next_action" as TaskStatus });

  const filtered = tasks
    .filter(t => filter === "all" ? true : filter === "completed" ? t.completed : !t.completed)
    .filter(t => contextFilter === "all" ? true : t.context === contextFilter);

  const openNew = (defaults?: { dueDate?: string; startTime?: string; endTime?: string }) => {
    setEditing(null);
    setForm({ title: "", description: "", dueDate: defaults?.dueDate || "", startTime: defaults?.startTime || "", endTime: defaults?.endTime || "", priority: "medium", context: "work", projectId: null, status: "next_action" });
    setModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, dueDate: t.dueDate, startTime: t.startTime || "", endTime: t.endTime || "", priority: t.priority, context: t.context, projectId: t.projectId, status: t.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const data = { ...form, startTime: form.startTime || undefined, endTime: form.endTime || undefined };
    if (editing) {
      await updateTask(editing.id, data);
    } else {
      await addTask({ ...data, completed: data.status === "completed" });
    }
    setModalOpen(false);
  };

  const handleTaskTimeChange = async (taskId: string, date: string, startTime: string, endTime: string) => {
    await updateTask(taskId, { dueDate: date, startTime, endTime });
  };

  const handleCreateAtTime = (date: string, startTime: string, endTime: string) => {
    openNew({ dueDate: date, startTime, endTime });
  };

  if (loading.tasks) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button onClick={() => setView("list")} className={`p-2 rounded-md transition-colors ${view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-label="List view"><List className="h-4 w-4" /></button>
            <button onClick={() => setView("day")} className={`p-2 rounded-md transition-colors ${view === "day" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-label="Day view"><Calendar className="h-4 w-4" /></button>
            <button onClick={() => setView("week")} className={`p-2 rounded-md transition-colors ${view === "week" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-label="Week view"><Clock className="h-4 w-4" /></button>
            <button onClick={() => setView("month")} className={`p-2 rounded-md transition-colors ${view === "month" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-label="Month view"><CalendarDays className="h-4 w-4" /></button>
          </div>
          <Button onClick={() => openNew()}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {(["all", "pending", "completed"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-border mx-1" />
        <div className="flex gap-1">
          <button onClick={() => setContextFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${contextFilter === "all" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>All Contexts</button>
          {(Object.keys(contextLabels) as TaskContext[]).map(c => (
            <button key={c} onClick={() => setContextFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${contextFilter === c ? contextColors[c] : "bg-muted text-muted-foreground"}`}>
              {contextLabels[c]}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <TaskCalendarView tasks={filtered} month={calMonth} onMonthChange={setCalMonth} onTaskClick={openEdit} />
      ) : view === "day" ? (
        <TaskDayCalendarView
          tasks={filtered}
          day={calDay}
          onDayChange={setCalDay}
          onTaskClick={openEdit}
          onTaskTimeChange={handleTaskTimeChange}
          onCreateAtTime={handleCreateAtTime}
        />
      ) : view === "week" ? (
        <TaskWeekCalendarView
          tasks={filtered}
          week={calWeek}
          onWeekChange={setCalWeek}
          onTaskClick={openEdit}
          onTaskTimeChange={handleTaskTimeChange}
          onCreateAtTime={handleCreateAtTime}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-3">Task</div>
            <div className="col-span-1">Context</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map(task => (
              <div key={task.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 items-center hover:bg-muted/30 transition-colors">
                <div className="md:col-span-1 flex md:justify-center">
                  <button onClick={() => toggleTask(task.id)} className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${task.completed ? "bg-primary border-primary" : "border-border hover:border-primary"}`}>
                    {task.completed && <CheckSquare className="h-3 w-3 text-primary-foreground" />}
                  </button>
                </div>
                <div className="md:col-span-3">
                  <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-card-foreground"}`}>{task.title}</p>
                  {task.startTime && task.endTime && (
                    <p className="text-[10px] text-muted-foreground">{task.startTime} – {task.endTime}</p>
                  )}
                </div>
                <div className="md:col-span-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${contextColors[task.context]}`}>{contextLabels[task.context]}</span>
                </div>
                <div className="hidden md:block md:col-span-2 text-sm text-muted-foreground">{task.dueDate || "—"}</div>
                <div className="md:col-span-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.priority === "high" ? "bg-destructive/10 text-destructive" : task.priority === "medium" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{task.priority}</span>
                </div>
                <div className="hidden md:flex md:col-span-2 items-center gap-1">
                  <span className={`text-xs font-medium ${task.status === "completed" ? "text-success" : task.status === "next_action" ? "text-primary" : "text-muted-foreground"}`}>
                    {task.status === "inbox" ? "Inbox" : task.status === "next_action" ? "Next Action" : "Done"}
                  </span>
                  {task.status === "inbox" && (
                    <button onClick={() => moveTaskStatus(task.id, "next_action")} className="ml-1 p-0.5 rounded hover:bg-primary/10 text-primary" title="Move to Next Actions">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="md:col-span-2 flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(task)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No tasks found</p>}
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Task" : "Add Task"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
              <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} /></div>
              <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as Task["priority"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Context</Label>
                <Select value={form.context} onValueChange={v => setForm(p => ({ ...p, context: v as TaskContext }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem><SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem><SelectItem value="fitness">Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as TaskStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="inbox">Inbox</SelectItem><SelectItem value="next_action">Next Action</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project (optional)</Label>
                <Select value={form.projectId || "none"} onValueChange={v => setForm(p => ({ ...p, projectId: v === "none" ? null : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map(pr => <SelectItem key={pr.id} value={pr.id}>{pr.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
