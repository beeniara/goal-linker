
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/layout/PrivateRoute';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import TaskForm from './pages/TaskForm';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import GoalForm from './pages/GoalForm';
import MilestoneForm from './pages/MilestoneForm';
import ChecklistReminder from './pages/ChecklistReminder';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';
import './App.css';
import FinancialStrategies from './pages/FinancialStrategies';
import NonFinancialSupport from './pages/NonFinancialSupport';
import Savings from './pages/Savings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
                
                {/* Projects Routes */}
                <Route path="/projects" element={<PrivateRoute element={<Projects />} />} />
                <Route path="/projects/:id" element={<PrivateRoute element={<ProjectDetail />} />} />
                <Route path="/projects/new" element={<PrivateRoute element={<ProjectForm />} />} />
                <Route path="/projects/:id/edit" element={<PrivateRoute element={<ProjectForm />} />} />
                
                {/* Tasks Routes */}
                <Route path="/tasks" element={<PrivateRoute element={<Tasks />} />} />
                <Route path="/tasks/:id" element={<PrivateRoute element={<TaskDetail />} />} />
                <Route path="/tasks/new" element={<PrivateRoute element={<TaskForm />} />} />
                <Route path="/tasks/:id/edit" element={<PrivateRoute element={<TaskForm />} />} />
                <Route path="/tasks/:id/duplicate" element={<PrivateRoute element={<TaskForm />} />} />
                
                {/* Goals Routes */}
                <Route path="/goals" element={<PrivateRoute element={<Goals />} />} />
                <Route path="/goals/:id" element={<PrivateRoute element={<GoalDetail />} />} />
                <Route path="/goals/new" element={<PrivateRoute element={<GoalForm />} />} />
                <Route path="/goals/:id/edit" element={<PrivateRoute element={<GoalForm />} />} />
                <Route path="/goals/:goalId/milestones/new" element={<PrivateRoute element={<MilestoneForm />} />} />
                <Route path="/goals/:goalId/milestones/:id/edit" element={<PrivateRoute element={<MilestoneForm />} />} />
                
                {/* Savings Routes */}
                <Route path="/savings" element={<PrivateRoute element={<Savings />} />} />
                <Route path="/financial-strategies" element={<PrivateRoute element={<FinancialStrategies />} />} />
                <Route path="/non-financial-support" element={<PrivateRoute element={<NonFinancialSupport />} />} />
                
                {/* Static Pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Checklist Reminder Route */}
                <Route path="/reminders" element={<PrivateRoute element={<ChecklistReminder />} />} />
                
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
