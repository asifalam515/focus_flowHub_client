import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Play, Pause, RotateCcw, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PomodoroPage() {
  const { sessions, addSession, deleteSession } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const totalTime = isBreak ? 5 * 60 : 25 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  }, [isBreak]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            addSession({ duration: 25, completedAt: new Date().toISOString(), taskTitle: "Focus session" });
            setIsBreak(true);
            return 5 * 60;
          } else {
            setIsBreak(false);
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, addSession]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1>

      <div className="max-w-md mx-auto bg-card rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center">
        <p className="text-sm font-medium text-muted-foreground mb-6">{isBreak ? "☕ Break Time" : "🎯 Focus Time"}</p>
        <div className="relative h-52 w-52 mb-6">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="5" className="stroke-muted" />
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="5" className="stroke-primary transition-all duration-1000" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-card-foreground tabular-nums">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button size="lg" onClick={() => setIsRunning(!isRunning)} variant={isRunning ? "secondary" : "default"}>
            {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-card-foreground">Completed Sessions</h2>
        </div>
        <div className="divide-y divide-border">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-card-foreground">{s.taskTitle}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.completedAt).toLocaleString()} · {s.duration} min</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteSession(s.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          {sessions.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No sessions yet</p>}
        </div>
      </div>
    </div>
  );
}
