
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

const Login = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <Link to="/" className="inline-block mb-6">
                <div className="font-semibold text-xl flex items-center justify-center space-x-2">
                  <span className="bg-primary text-primary-foreground p-1 rounded text-sm">TF</span>
                  <span>TaskFlow</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground mt-2">
                Enter your credentials to access your account
              </p>
            </div>
            <LoginForm />
          </div>
        </main>
        <footer className="py-6 border-t">
          <div className="container text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default Login;
