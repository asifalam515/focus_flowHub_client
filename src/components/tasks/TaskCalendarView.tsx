import { useMemo } from "react";
import { Task } from "@/types";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday, parseISO, addMonths, subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskCalendarViewProps {
  tasks: Task[];
  month: Date;
  onMonthChange: (d: Date) => void;
  onTaskClick: (task: Task) => void;
}

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-accent",
  low: "bg-muted-foreground/40",
};

export function TaskCalendarView({ tasks, month, onMonthChange, onTaskClick }: TaskCalendarViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      const key = t.dueDate; // "YYYY-MM-DD"
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(subMonths(month, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-card-foreground">{format(month, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(addMonths(month, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekdays.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate[key] || [];
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);

          return (
            <div
              key={i}
              className={`min-h-[90px] md:min-h-[110px] border-b border-r border-border p-1.5 transition-colors ${
                !inMonth ? "bg-muted/30" : "hover:bg-muted/20"
              } ${i % 7 === 0 ? "border-l-0" : ""}`}
            >
              <div className={`text-xs font-medium mb-1 h-6 w-6 flex items-center justify-center rounded-full ${
                today ? "bg-primary text-primary-foreground" : inMonth ? "text-card-foreground" : "text-muted-foreground/40"
              }`}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`w-full text-left text-[11px] leading-tight px-1.5 py-0.5 rounded truncate transition-colors ${
                      task.completed
                        ? "bg-muted/60 text-muted-foreground line-through"
                        : "bg-primary/10 text-card-foreground hover:bg-primary/20"
                    }`}
                  >
                    <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${priorityDot[task.priority]}`} />
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-muted-foreground pl-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
