
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

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
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/new" element={<Dashboard />} />
              <Route path="/projects/:id/edit" element={<Dashboard />} />
              <Route path="/projects/:id/invite" element={<Dashboard />} />
              
              {/* Task Routes */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/tasks/new" element={<Dashboard />} />
              <Route path="/tasks/:id/edit" element={<Dashboard />} />
              <Route path="/tasks/:id/duplicate" element={<Dashboard />} />
              
              {/* Goal Routes */}
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/:id" element={<GoalDetail />} />
              <Route path="/goals/new" element={<Dashboard />} />
              <Route path="/goals/:id/edit" element={<Dashboard />} />
              <Route path="/goals/:id/invite" element={<Dashboard />} />
              <Route path="/goals/:id/contribute" element={<Dashboard />} />
              <Route path="/goals/:id/milestones/new" element={<Dashboard />} />
              
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
