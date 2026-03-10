import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Edit2, Trash2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Habit } from "@/types";

export default function HabitsPage() {
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleHabitToday } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: "", frequency: "daily" as Habit["frequency"], color: "hsl(170 60% 40%)" });

  const openNew = () => { setEditing(null); setForm({ name: "", frequency: "daily", color: "hsl(170 60% 40%)" }); setModalOpen(true); };
  const openEdit = (h: Habit) => { setEditing(h); setForm({ name: h.name, frequency: h.frequency, color: h.color }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) { await updateHabit(editing.id, form); } else { await addHabit(form); }
    setModalOpen(false);
  };

  if (loading.habits) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Habits</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Habit</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map(habit => (
          <div key={habit.id} className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabitToday(habit.id)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    habit.completedToday
                      ? "bg-primary text-primary-foreground scale-105"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {habit.completedToday ? "✓" : "○"}
                </button>
                <div>
                  <p className="font-semibold text-card-foreground">{habit.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(habit)}><Edit2 className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => deleteHabit(habit.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
              <Flame className="h-5 w-5 text-accent" />
              <span className="text-lg font-bold text-card-foreground">{habit.streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
          </div>
        ))}
        {habits.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No habits yet</p>}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Habit" : "Add Habit"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Morning Meditation" /></div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v as Habit["frequency"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
