
import React from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
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
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground mt-2">
              Sign up to start managing your projects and tasks
            </p>
          </div>
          <SignupForm />
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
