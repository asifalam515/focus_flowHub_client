import { useState, useRef, useMemo, useCallback } from "react";
import { Task, TaskContext } from "@/types";
import {
  startOfWeek, endOfWeek, addWeeks, subWeeks, addDays,
  format, isSameDay, isToday, parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskWeekCalendarViewProps {
  tasks: Task[];
  week: Date;
  onWeekChange: (d: Date) => void;
  onTaskClick: (task: Task) => void;
  onTaskTimeChange: (taskId: string, date: string, startTime: string, endTime: string) => void;
  onCreateAtTime: (date: string, startTime: string, endTime: string) => void;
}

const HOUR_HEIGHT = 60; // px per hour
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

export function TaskWeekCalendarView({
  tasks, week, onWeekChange, onTaskClick, onTaskTimeChange, onCreateAtTime
}: TaskWeekCalendarViewProps) {
  const weekStart = startOfWeek(week, { weekStartsOn: 1 });
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    days.forEach(d => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = tasks.filter(t => t.dueDate === key && t.startTime && t.endTime);
    });
    return map;
  }, [tasks, days]);

  // All-day tasks (no time set)
  const allDayByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    days.forEach(d => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = tasks.filter(t => t.dueDate === key && (!t.startTime || !t.endTime));
    });
    return map;
  }, [tasks, days]);

  const gridRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    type: "move" | "resize" | "create";
    taskId?: string;
    dayIndex: number;
    startY: number;
    originalStart?: number;
    originalEnd?: number;
    currentStart: number;
    currentEnd: number;
  } | null>(null);

  const getMinutesFromY = useCallback((clientY: number, colEl: HTMLElement) => {
    const rect = colEl.getBoundingClientRect();
    const y = clientY - rect.top;
    return snapToGrid(Math.max(0, Math.min((y / rect.height) * 24 * 60, 24 * 60 - SNAP_MINUTES)));
  }, []);

  const handleMouseDownOnTask = (e: React.MouseEvent, task: Task, dayIndex: number, isResize: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    if (!task.startTime || !task.endTime) return;
    const startMins = timeToMinutes(task.startTime);
    const endMins = timeToMinutes(task.endTime);
    setDragging({
      type: isResize ? "resize" : "move",
      taskId: task.id,
      dayIndex,
      startY: e.clientY,
      originalStart: startMins,
      originalEnd: endMins,
      currentStart: startMins,
      currentEnd: endMins,
    });
  };

  const handleMouseDownOnGrid = (e: React.MouseEvent, dayIndex: number) => {
    const col = (e.currentTarget as HTMLElement);
    const mins = getMinutesFromY(e.clientY, col);
    setDragging({
      type: "create",
      dayIndex,
      startY: e.clientY,
      currentStart: mins,
      currentEnd: mins + 60,
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !gridRef.current) return;
    const cols = gridRef.current.querySelectorAll("[data-day-col]");
    const col = cols[dragging.dayIndex] as HTMLElement;
    if (!col) return;
    const rect = col.getBoundingClientRect();
    const currentMins = snapToGrid(Math.max(0, Math.min(((e.clientY - rect.top) / rect.height) * 24 * 60, 24 * 60 - SNAP_MINUTES)));

    if (dragging.type === "create") {
      const start = Math.min(dragging.currentStart, currentMins);
      const end = Math.max(dragging.currentStart, currentMins + SNAP_MINUTES);
      setDragging(prev => prev ? {
        ...prev,
        currentEnd: Math.max(end, start + SNAP_MINUTES),
        currentStart: Math.min(dragging.currentStart, currentMins),
      } : null);
      // Simpler: just track end
      setDragging(prev => prev ? { ...prev, currentEnd: Math.max(currentMins, prev.currentStart + SNAP_MINUTES) } : null);
    } else if (dragging.type === "resize") {
      setDragging(prev => prev ? { ...prev, currentEnd: Math.max(currentMins, prev.currentStart + SNAP_MINUTES) } : null);
    } else if (dragging.type === "move") {
      const delta = currentMins - (dragging.originalStart! + (dragging.originalEnd! - dragging.originalStart!) / 2);
      const duration = dragging.originalEnd! - dragging.originalStart!;
      let newStart = snapToGrid(dragging.originalStart! + delta);
      newStart = Math.max(0, Math.min(newStart, 24 * 60 - duration));
      setDragging(prev => prev ? { ...prev, currentStart: newStart, currentEnd: newStart + duration } : null);
    }
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (!dragging) return;
    const dateStr = format(days[dragging.dayIndex], "yyyy-MM-dd");
    const startTime = minutesToTime(dragging.currentStart);
    const endTime = minutesToTime(dragging.currentEnd);

    if (dragging.type === "create") {
      if (dragging.currentEnd - dragging.currentStart >= SNAP_MINUTES) {
        onCreateAtTime(dateStr, startTime, endTime);
      }
    } else if (dragging.taskId) {
      onTaskTimeChange(dragging.taskId, dateStr, startTime, endTime);
    }
    setDragging(null);
  }, [dragging, days, onTaskTimeChange, onCreateAtTime]);

  // Current time indicator
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
        <Button variant="ghost" size="sm" onClick={() => onWeekChange(subWeeks(week, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h3 className="font-semibold text-card-foreground text-sm">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onWeekChange(addWeeks(week, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div className="border-r border-border" />
        {days.map((day, i) => (
          <div key={i} className={`text-center py-2 border-r border-border last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}>
            <div className="text-[10px] font-medium text-muted-foreground uppercase">{format(day, "EEE")}</div>
            <div className={`text-lg font-semibold mt-0.5 h-8 w-8 mx-auto flex items-center justify-center rounded-full ${
              isToday(day) ? "bg-primary text-primary-foreground" : "text-card-foreground"
            }`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border min-h-[32px]">
        <div className="border-r border-border flex items-center justify-center text-[10px] text-muted-foreground">All day</div>
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayAllDay = allDayByDay[key] || [];
          return (
            <div key={i} className="border-r border-border last:border-r-0 p-0.5 flex flex-wrap gap-0.5">
              {dayAllDay.slice(0, 2).map(task => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`text-[10px] px-1.5 py-0.5 rounded truncate max-w-full ${
                    task.completed ? "bg-muted/60 text-muted-foreground line-through" : contextColors[task.context]
                  }`}
                >
                  {task.title}
                </button>
              ))}
              {dayAllDay.length > 2 && <span className="text-[9px] text-muted-foreground">+{dayAllDay.length - 2}</span>}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]" style={{ scrollbarGutter: "stable" }}>
        <div ref={gridRef} className="grid grid-cols-[60px_repeat(7,1fr)] relative" style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="border-r border-border relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute w-full text-right pr-2 text-[10px] text-muted-foreground"
                style={{ top: h * HOUR_HEIGHT - 6 }}
              >
                {h === 0 ? "" : format(new Date(2000, 0, 1, h), "h a")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay[key] || [];
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                data-day-col
                className={`relative border-r border-border last:border-r-0 ${today ? "bg-primary/[0.02]" : ""}`}
                onMouseDown={(e) => handleMouseDownOnGrid(e, dayIndex)}
              >
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: h * HOUR_HEIGHT }}
                  />
                ))}
                {/* Half-hour lines */}
                {HOURS.map(h => (
                  <div
                    key={`half-${h}`}
                    className="absolute w-full border-t border-border/20"
                    style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                  />
                ))}

                {/* Current time line */}
                {today && (
                  <div
                    className="absolute w-full z-20 pointer-events-none"
                    style={{ top: (nowMinutes / (24 * 60)) * 24 * HOUR_HEIGHT }}
                  >
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-destructive -ml-1" />
                      <div className="flex-1 h-[2px] bg-destructive" />
                    </div>
                  </div>
                )}

                {/* Task blocks */}
                {dayTasks.map(task => {
                  const isDraggingThis = dragging?.taskId === task.id;
                  const startMins = isDraggingThis ? dragging.currentStart : timeToMinutes(task.startTime!);
                  const endMins = isDraggingThis ? dragging.currentEnd : timeToMinutes(task.endTime!);
                  const top = (startMins / (24 * 60)) * 24 * HOUR_HEIGHT;
                  const height = ((endMins - startMins) / (24 * 60)) * 24 * HOUR_HEIGHT;

                  return (
                    <div
                      key={task.id}
                      className={`absolute left-0.5 right-0.5 rounded-md border-l-[3px] px-1.5 py-0.5 cursor-grab overflow-hidden z-10 transition-shadow ${
                        task.completed
                          ? "bg-muted/80 border-muted-foreground/30 text-muted-foreground"
                          : contextColors[task.context]
                      } ${isDraggingThis ? "shadow-lg opacity-90 z-30" : "hover:shadow-md"}`}
                      style={{ top, height: Math.max(height, 20) }}
                      onMouseDown={(e) => handleMouseDownOnTask(e, task, dayIndex, false)}
                      onClick={(e) => { e.stopPropagation(); if (!dragging) onTaskClick(task); }}
                    >
                      <div className="text-[11px] font-medium leading-tight truncate">
                        {task.title}
                      </div>
                      {height > 30 && (
                        <div className="text-[9px] opacity-80">
                          {task.startTime} – {task.endTime}
                        </div>
                      )}
                      {/* Resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize hover:bg-foreground/10 rounded-b-md"
                        onMouseDown={(e) => handleMouseDownOnTask(e, task, dayIndex, true)}
                      />
                    </div>
                  );
                })}

                {/* Ghost block for creating */}
                {dragging?.type === "create" && dragging.dayIndex === dayIndex && (
                  <div
                    className="absolute left-0.5 right-0.5 rounded-md border-2 border-dashed border-primary bg-primary/10 z-20 pointer-events-none"
                    style={{
                      top: (dragging.currentStart / (24 * 60)) * 24 * HOUR_HEIGHT,
                      height: Math.max(((dragging.currentEnd - dragging.currentStart) / (24 * 60)) * 24 * HOUR_HEIGHT, 15),
                    }}
                  >
                    <div className="text-[10px] text-primary font-medium px-1">
                      {minutesToTime(dragging.currentStart)} – {minutesToTime(dragging.currentEnd)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
