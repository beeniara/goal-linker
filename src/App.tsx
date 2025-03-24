
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/layout/PrivateRoute";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Private Pages
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectForm from "./pages/ProjectForm";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import TaskForm from "./pages/TaskForm";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import GoalForm from "./pages/GoalForm";
import MilestoneForm from "./pages/MilestoneForm";
import Profile from "./pages/Profile";

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Project Routes */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/edit" element={<ProjectForm />} />
              
              {/* Task Routes */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/tasks/:id/edit" element={<TaskForm />} />
              
              {/* Goal Routes */}
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/new" element={<GoalForm />} />
              <Route path="/goals/:id" element={<GoalDetail />} />
              <Route path="/goals/:id/edit" element={<GoalForm />} />
              <Route path="/goals/:id/milestones/new" element={<MilestoneForm />} />
              
              {/* User Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute requireAdmin={true} />}>
              <Route path="/admin" element={<Dashboard />} />
            </Route>
            
            {/* Catch All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
