import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Edit2, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Goal } from "@/types";

export default function GoalsPage() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", type: "task" as Goal["type"], target: 10, current: 0, deadline: "" });

  const openNew = () => { setEditing(null); setForm({ title: "", type: "task", target: 10, current: 0, deadline: "" }); setModalOpen(true); };
  const openEdit = (g: Goal) => { setEditing(g); setForm({ title: g.title, type: g.type, target: g.target, current: g.current, deadline: g.deadline }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editing) { await updateGoal(editing.id, form); } else { await addGoal(form); }
    setModalOpen(false);
  };

  if (loading.goals) return <LoadingSpinner />;

  const typeColors: Record<string, string> = { task: "text-primary", habit: "text-accent", reading: "text-info" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Goals</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map(goal => {
          const pct = Math.round(goal.current / goal.target * 100);
          return (
            <div key={goal.id} className="bg-card rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className={`h-5 w-5 ${typeColors[goal.type]}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-muted ${typeColors[goal.type]}`}>{goal.type}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(goal)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-card-foreground mb-3">{goal.title}</h3>
              <Progress value={pct} className="h-2.5 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{goal.current}/{goal.target}</span>
                <span>{pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Deadline: {goal.deadline}</p>
            </div>
          );
        })}
        {goals.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No goals yet</p>}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Goal" : "Add Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as Goal["type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="habit">Habit</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Target</Label><Input type="number" value={form.target} onChange={e => setForm(p => ({ ...p, target: +e.target.value }))} /></div>
              <div><Label>Current</Label><Input type="number" value={form.current} onChange={e => setForm(p => ({ ...p, current: +e.target.value }))} /></div>
            </div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
