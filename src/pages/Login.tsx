
import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InvitationNotifications } from '@/components/auth/InvitationNotifications';

const Login = () => {
  const { currentUser, userData } = useAuth();
  const [showInvitations, setShowInvitations] = useState(false);

  useEffect(() => {
    if (currentUser && userData) {
      setShowInvitations(true);
    }
  }, [currentUser, userData]);

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
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>
          
          {showInvitations && currentUser && userData && (
            <InvitationNotifications 
              userEmail={currentUser.email || ''}
              userId={currentUser.uid}
            />
          )}
          
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Firebase Index Required</AlertTitle>
            <AlertDescription>
              <p className="mb-2">If you see an error about missing Firestore indexes after login, you'll need to create it:</p>
              <ol className="list-decimal pl-5 text-sm">
                <li>Click on the error link in the console</li>
                <li>Sign in to your Firebase console</li>
                <li>In the form that appears:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Field 1: Enter <strong>userId</strong> with <strong>Ascending</strong> order</li>
                    <li>Field 2: Enter <strong>createdAt</strong> with <strong>Descending</strong> order</li>
                    <li>Select <strong>Collection</strong> for "Query scopes"</li>
                  </ul>
                </li>
                <li>Click "Create index" and wait a few minutes for it to build</li>
              </ol>
              <p className="text-xs mt-2 text-muted-foreground">This is required for sorting reminders by creation date.</p>
            </AlertDescription>
          </Alert>
          
          <LoginForm />
        </div>
      </main>
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Login;
