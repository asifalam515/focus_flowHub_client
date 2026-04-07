import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AnalyticsPage from "./pages/AnalyticsPage";
import AuthPage from "./pages/AuthPage";
import BooksPage from "./pages/BooksPage";
import DashboardPage from "./pages/DashboardPage";
import GoalsPage from "./pages/GoalsPage";
import HabitsPage from "./pages/HabitsPage";
import InboxPage from "./pages/InboxPage";
import NextActionsPage from "./pages/NextActionsPage";
import NotFound from "./pages/NotFound";
import PomodoroPage from "./pages/PomodoroPage";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import WeeklyReviewPage from "./pages/WeeklyReviewPage";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? (
    <DashboardLayout />
  ) : (
    <Navigate to="/auth" replace />
  );
};

const AuthOnlyRoute = () => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthOnlyRoute />} />
            <Route element={<ProtectedRoutes />}>
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
