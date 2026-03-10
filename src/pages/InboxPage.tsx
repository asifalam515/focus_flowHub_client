import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Inbox, Plus, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TaskContext } from "@/types";

const contextLabels: Record<TaskContext, string> = { work: "Work", personal: "Personal", learning: "Learning", fitness: "Fitness" };
const contextColors: Record<TaskContext, string> = { work: "bg-info/10 text-info", personal: "bg-primary/10 text-primary", learning: "bg-accent/10 text-accent", fitness: "bg-success/10 text-success" };

export default function InboxPage() {
  const { tasks, loading, captureToInbox, moveTaskStatus, deleteTask } = useApp();
  const [quickTitle, setQuickTitle] = useState("");
  const [quickContext, setQuickContext] = useState<TaskContext>("personal");

  const inboxItems = tasks.filter(t => t.status === "inbox");

  const handleCapture = async () => {
    if (!quickTitle.trim()) return;
    await captureToInbox(quickTitle, quickContext);
    setQuickTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCapture();
  };

  if (loading.tasks) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Inbox className="h-6 w-6 text-primary" /> Inbox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Capture ideas quickly. Clarify and move them to Next Actions later.</p>
      </div>

      {/* Quick Capture */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex gap-2">
          <Input
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Capture it here..."
            className="flex-1"
          />
          <Select value={quickContext} onValueChange={v => setQuickContext(v as TaskContext)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCapture}><Plus className="h-4 w-4 mr-1" />Capture</Button>
        </div>
      </div>

      {/* Inbox Items */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-card-foreground">{inboxItems.length} items in inbox</span>
        </div>
        <div className="divide-y divide-border">
          {inboxItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{item.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${contextColors[item.context]}`}>{contextLabels[item.context]}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => moveTaskStatus(item.id, "next_action")} className="text-primary border-primary/30 hover:bg-primary/10">
                  <ArrowRight className="h-3.5 w-3.5 mr-1" />Clarify
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteTask(item.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {inboxItems.length === 0 && (
            <div className="p-12 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Inbox zero! Everything has been processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
