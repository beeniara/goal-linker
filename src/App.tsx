
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
              <Route path="/projects" element={<Dashboard />} />
              <Route path="/projects/:id" element={<Dashboard />} />
              <Route path="/projects/new" element={<Dashboard />} />
              <Route path="/tasks" element={<Dashboard />} />
              <Route path="/tasks/:id" element={<Dashboard />} />
              <Route path="/tasks/new" element={<Dashboard />} />
              <Route path="/goals" element={<Dashboard />} />
              <Route path="/goals/:id" element={<Dashboard />} />
              <Route path="/goals/new" element={<Dashboard />} />
              <Route path="/profile" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
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
