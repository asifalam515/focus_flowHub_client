import { useState, useRef, useCallback, useMemo } from "react";
import { Task, TaskContext } from "@/types";
import { format, isToday, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskDayCalendarViewProps {
  tasks: Task[];
  day: Date;
  onDayChange: (d: Date) => void;
  onTaskClick: (task: Task) => void;
  onTaskTimeChange: (taskId: string, date: string, startTime: string, endTime: string) => void;
  onCreateAtTime: (date: string, startTime: string, endTime: string) => void;
}

const HOUR_HEIGHT = 64;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SNAP_MINUTES = 15;

const contextColors: Record<TaskContext, string> = {
  work: "bg-info/80 border-info text-info-foreground",
  personal: "bg-primary/80 border-primary text-primary-foreground",
  learning: "bg-accent/80 border-accent text-accent-foreground",
  fitness: "bg-success/80 border-success text-success-foreground",
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(Math.max(0, Math.min(mins, 1439)) / 60);
  const m = Math.max(0, Math.min(mins, 1439)) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function snapToGrid(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

export function TaskDayCalendarView({
  tasks, day, onDayChange, onTaskClick, onTaskTimeChange, onCreateAtTime
}: TaskDayCalendarViewProps) {
  const dateKey = format(day, "yyyy-MM-dd");
  const today = isToday(day);

  const timedTasks = useMemo(() => tasks.filter(t => t.dueDate === dateKey && t.startTime && t.endTime), [tasks, dateKey]);
  const allDayTasks = useMemo(() => tasks.filter(t => t.dueDate === dateKey && (!t.startTime || !t.endTime)), [tasks, dateKey]);

  // Overlap detection for side-by-side rendering
  const timedLayout = useMemo(() => {
    const sorted = [...timedTasks].sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));
    const columns: { task: Task; col: number; totalCols: number }[] = [];
    const groups: Task[][] = [];
    let currentGroup: Task[] = [];
    let groupEnd = 0;

    sorted.forEach(task => {
      const start = timeToMinutes(task.startTime!);
      const end = timeToMinutes(task.endTime!);
      if (currentGroup.length === 0 || start < groupEnd) {
        currentGroup.push(task);
        groupEnd = Math.max(groupEnd, end);
      } else {
        groups.push(currentGroup);
        currentGroup = [task];
        groupEnd = end;
      }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    groups.forEach(group => {
      const cols: number[] = [];
      group.forEach((task, i) => {
        const start = timeToMinutes(task.startTime!);
        let col = 0;
        // Find first available column
        const occupied = columns.filter(c => group.includes(c.task)).map(c => ({ col: c.col, end: timeToMinutes(c.task.endTime!) }));
        while (occupied.some(o => o.col === col && o.end > start)) col++;
        cols.push(col);
        columns.push({ task, col, totalCols: 0 });
      });
      const maxCol = Math.max(...cols) + 1;
      columns.filter(c => group.includes(c.task)).forEach(c => { c.totalCols = maxCol; });
    });

    return columns;
  }, [timedTasks]);

  const colRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    type: "move" | "resize" | "create";
    taskId?: string;
    startY: number;
    originalStart?: number;
    originalEnd?: number;
    currentStart: number;
    currentEnd: number;
  } | null>(null);

  const getMinutesFromY = useCallback((clientY: number) => {
    if (!colRef.current) return 0;
    const rect = colRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    return snapToGrid(Math.max(0, Math.min((y / rect.height) * 24 * 60, 24 * 60 - SNAP_MINUTES)));
  }, []);

  const handleMouseDownOnTask = (e: React.MouseEvent, task: Task, isResize: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    if (!task.startTime || !task.endTime) return;
    const startMins = timeToMinutes(task.startTime);
    const endMins = timeToMinutes(task.endTime);
    setDragging({
      type: isResize ? "resize" : "move",
      taskId: task.id,
      startY: e.clientY,
      originalStart: startMins,
      originalEnd: endMins,
      currentStart: startMins,
      currentEnd: endMins,
    });
  };

  const handleMouseDownOnGrid = (e: React.MouseEvent) => {
    const mins = getMinutesFromY(e.clientY);
    setDragging({ type: "create", startY: e.clientY, currentStart: mins, currentEnd: mins + 60 });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !colRef.current) return;
    const currentMins = getMinutesFromY(e.clientY);

    if (dragging.type === "create") {
      setDragging(prev => prev ? { ...prev, currentEnd: Math.max(currentMins, prev.currentStart + SNAP_MINUTES) } : null);
    } else if (dragging.type === "resize") {
      setDragging(prev => prev ? { ...prev, currentEnd: Math.max(currentMins, prev.currentStart + SNAP_MINUTES) } : null);
    } else if (dragging.type === "move") {
      const duration = dragging.originalEnd! - dragging.originalStart!;
      const center = dragging.originalStart! + duration / 2;
      const delta = currentMins - center;
      let newStart = snapToGrid(dragging.originalStart! + delta);
      newStart = Math.max(0, Math.min(newStart, 24 * 60 - duration));
      setDragging(prev => prev ? { ...prev, currentStart: newStart, currentEnd: newStart + duration } : null);
    }
  }, [dragging, getMinutesFromY]);

  const handleMouseUp = useCallback(() => {
    if (!dragging) return;
    const startTime = minutesToTime(dragging.currentStart);
    const endTime = minutesToTime(dragging.currentEnd);
    if (dragging.type === "create") {
      if (dragging.currentEnd - dragging.currentStart >= SNAP_MINUTES) {
        onCreateAtTime(dateKey, startTime, endTime);
      }
    } else if (dragging.taskId) {
      onTaskTimeChange(dragging.taskId, dateKey, startTime, endTime);
    }
    setDragging(null);
  }, [dragging, dateKey, onTaskTimeChange, onCreateAtTime]);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div
      className="bg-card rounded-xl border border-border shadow-sm overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => onDayChange(subDays(day, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="text-[10px] font-medium text-muted-foreground uppercase">{format(day, "EEEE")}</div>
          <div className={`text-2xl font-bold mt-0.5 h-10 w-10 mx-auto flex items-center justify-center rounded-full ${
            today ? "bg-primary text-primary-foreground" : "text-card-foreground"
          }`}>
            {format(day, "d")}
          </div>
          <div className="text-xs text-muted-foreground">{format(day, "MMMM yyyy")}</div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDayChange(addDays(day, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* All-day section */}
      {allDayTasks.length > 0 && (
        <div className="border-b border-border p-2 flex flex-wrap gap-1">
          <span className="text-[10px] text-muted-foreground mr-1 self-center">All day</span>
          {allDayTasks.map(task => (
            <button
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={`text-xs px-2 py-1 rounded-md truncate max-w-[200px] ${
                task.completed ? "bg-muted/60 text-muted-foreground line-through" : contextColors[task.context]
              }`}
            >
              {task.title}
            </button>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[650px]" style={{ scrollbarGutter: "stable" }}>
        <div className="grid grid-cols-[60px_1fr]" style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="border-r border-border relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute w-full text-right pr-2 text-[11px] text-muted-foreground font-medium"
                style={{ top: h * HOUR_HEIGHT - 7 }}
              >
                {h === 0 ? "" : format(new Date(2000, 0, 1, h), "h a")}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            ref={colRef}
            className="relative"
            onMouseDown={handleMouseDownOnGrid}
          >
            {/* Hour lines */}
            {HOURS.map(h => (
              <div key={h} className="absolute w-full border-t border-border/50" style={{ top: h * HOUR_HEIGHT }} />
            ))}
            {/* Half-hour lines */}
            {HOURS.map(h => (
              <div key={`half-${h}`} className="absolute w-full border-t border-border/20" style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
            ))}

            {/* Current time line */}
            {today && (
              <div className="absolute w-full z-20 pointer-events-none" style={{ top: (nowMinutes / (24 * 60)) * 24 * HOUR_HEIGHT }}>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-destructive -ml-1.5" />
                  <div className="flex-1 h-[2px] bg-destructive" />
                </div>
              </div>
            )}

            {/* Task blocks */}
            {timedLayout.map(({ task, col, totalCols }) => {
              const isDraggingThis = dragging?.taskId === task.id;
              const startMins = isDraggingThis ? dragging.currentStart : timeToMinutes(task.startTime!);
              const endMins = isDraggingThis ? dragging.currentEnd : timeToMinutes(task.endTime!);
              const top = (startMins / (24 * 60)) * 24 * HOUR_HEIGHT;
              const height = ((endMins - startMins) / (24 * 60)) * 24 * HOUR_HEIGHT;
              const width = `calc(${100 / totalCols}% - 4px)`;
              const left = `calc(${(col / totalCols) * 100}% + 2px)`;

              return (
                <div
                  key={task.id}
                  className={`absolute rounded-lg border-l-[3px] px-2 py-1 cursor-grab overflow-hidden z-10 transition-shadow ${
                    task.completed
                      ? "bg-muted/80 border-muted-foreground/30 text-muted-foreground"
                      : contextColors[task.context]
                  } ${isDraggingThis ? "shadow-lg opacity-90 z-30" : "hover:shadow-md"}`}
                  style={{ top, height: Math.max(height, 24), width, left }}
                  onMouseDown={(e) => handleMouseDownOnTask(e, task, false)}
                  onClick={(e) => { e.stopPropagation(); if (!dragging) onTaskClick(task); }}
                >
                  <div className="text-xs font-semibold leading-tight truncate">{task.title}</div>
                  {height > 36 && (
                    <div className="text-[10px] opacity-80 mt-0.5">{task.startTime} – {task.endTime}</div>
                  )}
                  {height > 56 && task.description && (
                    <div className="text-[10px] opacity-70 mt-0.5 line-clamp-2">{task.description}</div>
                  )}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2.5 cursor-s-resize hover:bg-foreground/10 rounded-b-lg"
                    onMouseDown={(e) => handleMouseDownOnTask(e, task, true)}
                  />
                </div>
              );
            })}

            {/* Ghost block for creating */}
            {dragging?.type === "create" && (
              <div
                className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-primary bg-primary/10 z-20 pointer-events-none"
                style={{
                  top: (dragging.currentStart / (24 * 60)) * 24 * HOUR_HEIGHT,
                  height: Math.max(((dragging.currentEnd - dragging.currentStart) / (24 * 60)) * 24 * HOUR_HEIGHT, 15),
                }}
              >
                <div className="text-[11px] text-primary font-semibold px-2 py-0.5">
                  {minutesToTime(dragging.currentStart)} – {minutesToTime(dragging.currentEnd)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
