import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Repeat, Target, BookOpen, Timer, BarChart3, User, LogOut, Inbox, Zap, FolderKanban, ClipboardCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Tasks", path: "/tasks", icon: CheckSquare },
  { title: "Habits", path: "/habits", icon: Repeat },
  { title: "Goals", path: "/goals", icon: Target },
  { title: "Books", path: "/books", icon: BookOpen },
  { title: "Pomodoro", path: "/pomodoro", icon: Timer },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Profile", path: "/profile", icon: User },
];

const gtdNav = [
  { title: "Inbox", path: "/gtd/inbox", icon: Inbox },
  { title: "Next Actions", path: "/gtd/next-actions", icon: Zap },
  { title: "Projects", path: "/gtd/projects", icon: FolderKanban },
  { title: "Weekly Review", path: "/gtd/review", icon: ClipboardCheck },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { logout, tasks } = useApp();
  const inboxCount = tasks.filter(t => t.status === "inbox").length;

  const renderLink = (item: typeof mainNav[0], badge?: number) => {
    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span className="flex-1">{item.title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Target className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">FocusHub</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainNav.map(item => renderLink(item))}

          {/* GTD Section */}
          <div className="pt-4 pb-1">
            <p className="px-3 text-[10px] uppercase tracking-widest font-semibold text-sidebar-foreground/50 mb-2">GTD Workflow</p>
          </div>
          {gtdNav.map(item => renderLink(item, item.path === "/gtd/inbox" ? inboxCount : undefined))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
