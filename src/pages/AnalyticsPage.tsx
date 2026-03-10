import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

type Period = "weekly" | "monthly" | "quarterly";

const weeklyTasks = [
  { name: "Mon", tasks: 5 }, { name: "Tue", tasks: 8 }, { name: "Wed", tasks: 3 },
  { name: "Thu", tasks: 7 }, { name: "Fri", tasks: 6 }, { name: "Sat", tasks: 2 }, { name: "Sun", tasks: 4 },
];
const monthlyTasks = [
  { name: "Week 1", tasks: 22 }, { name: "Week 2", tasks: 28 }, { name: "Week 3", tasks: 19 }, { name: "Week 4", tasks: 31 },
];
const quarterlyTasks = [
  { name: "Jan", tasks: 85 }, { name: "Feb", tasks: 92 }, { name: "Mar", tasks: 78 },
];

const streakData = [
  { name: "Mon", streak: 12 }, { name: "Tue", streak: 13 }, { name: "Wed", streak: 13 },
  { name: "Thu", streak: 14 }, { name: "Fri", streak: 14 }, { name: "Sat", streak: 15 }, { name: "Sun", streak: 14 },
];

export default function AnalyticsPage() {
  const { tasks, habits, books } = useApp();
  const [period, setPeriod] = useState<Period>("weekly");

  const taskData = period === "weekly" ? weeklyTasks : period === "monthly" ? monthlyTasks : quarterlyTasks;

  const pieData = [
    { name: "Completed", value: tasks.filter(t => t.completed).length },
    { name: "Pending", value: tasks.filter(t => !t.completed).length },
  ];
  const COLORS = ["hsl(170, 60%, 40%)", "hsl(210, 15%, 85%)"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="flex gap-2">
          {(["weekly", "monthly", "quarterly"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks Completed */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Tasks Completed</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(220, 10%, 46%)" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(220, 10%, 46%)" }} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)" }} />
              <Bar dataKey="tasks" fill="hsl(170, 60%, 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Habit Streaks */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Habit Streak Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={streakData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 46%)" }} />
              <YAxis tick={{ fill: "hsl(220, 10%, 46%)" }} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)" }} />
              <Line type="monotone" dataKey="streak" stroke="hsl(36, 90%, 55%)" strokeWidth={2} dot={{ fill: "hsl(36, 90%, 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reading Progress */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Reading Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={books.map(b => ({ name: b.title.split(" ").slice(0, 2).join(" "), progress: Math.round(b.completedPages / b.totalPages * 100) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(220, 10%, 46%)" }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: "hsl(220, 10%, 46%)", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 20%, 90%)" }} />
              <Bar dataKey="progress" fill="hsl(210, 80%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
