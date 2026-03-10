import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { FolderKanban, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Project } from "@/types";

const projectColors = [
  "hsl(170 60% 40%)", "hsl(36 90% 55%)", "hsl(210 80% 55%)", "hsl(280 60% 55%)", "hsl(0 72% 51%)", "hsl(152 60% 42%)"
];

export default function ProjectsPage() {
  const { projects, tasks, loading, addProject, updateProject, deleteProject } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: projectColors[0] });

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", color: projectColors[Math.floor(Math.random() * projectColors.length)] }); setModalOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setForm({ name: p.name, description: p.description, color: p.color }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) { await updateProject(editing.id, form); } else { await addProject(form); }
    setModalOpen(false);
  };

  if (loading.projects) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-primary" /> Projects
        </h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Project</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completed = projectTasks.filter(t => t.completed).length;
          const total = projectTasks.length;
          const pct = total > 0 ? Math.round(completed / total * 100) : 0;

          return (
            <div key={project.id} className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                  <h3 className="font-semibold text-card-foreground">{project.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(project)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              <Progress value={pct} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completed}/{total} tasks done</span>
                <span>{pct}%</span>
              </div>

              {/* Task list */}
              {projectTasks.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {projectTasks.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${t.completed ? "bg-success" : "bg-muted-foreground/40"}`} />
                      <span className={t.completed ? "text-muted-foreground line-through" : "text-card-foreground"}>{t.title}</span>
                    </div>
                  ))}
                  {projectTasks.length > 5 && <p className="text-[10px] text-muted-foreground pl-3.5">+{projectTasks.length - 5} more</p>}
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No projects yet</p>}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Project name" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What's this project about?" /></div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1">
                {projectColors.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} className={`h-7 w-7 rounded-full border-2 transition-transform ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
