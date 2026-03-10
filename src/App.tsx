import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import HabitsPage from "./pages/HabitsPage";
import GoalsPage from "./pages/GoalsPage";
import BooksPage from "./pages/BooksPage";
import PomodoroPage from "./pages/PomodoroPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import InboxPage from "./pages/InboxPage";
import NextActionsPage from "./pages/NextActionsPage";
import ProjectsPage from "./pages/ProjectsPage";
import WeeklyReviewPage from "./pages/WeeklyReviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/pomodoro" element={<PomodoroPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/gtd/inbox" element={<InboxPage />} />
              <Route path="/gtd/next-actions" element={<NextActionsPage />} />
              <Route path="/gtd/projects" element={<ProjectsPage />} />
              <Route path="/gtd/review" element={<WeeklyReviewPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
