
import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AlertMessageDisplay } from '@/components/alerts/AlertMessageDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { InvitationNotifications } from '@/components/auth/InvitationNotifications';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { getUserInvitations } from '@/services/savingsInvitationService';

const Login = () => {
  const { currentUser, userData } = useAuth();
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);

  useEffect(() => {
    const checkInvitations = async () => {
      if (currentUser && currentUser.email) {
        try {
          const invitations = await getUserInvitations(currentUser.email);
          setInvitationsCount(invitations.length);
          setShowInvitations(invitations.length > 0);
        } catch (error) {
          console.error("Error checking invitations:", error);
          setShowInvitations(false);
        }
      }
    };

    if (currentUser && userData) {
      checkInvitations();
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
            <div className="mb-4">
              <div className="bg-muted p-3 rounded-t-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Pending Invitations</h3>
                </div>
                {invitationsCount > 0 && (
                  <Badge variant="default" className="ml-2">
                    {invitationsCount}
                  </Badge>
                )}
              </div>
              <div className="border border-t-0 rounded-b-md p-3">
                <InvitationNotifications 
                  userEmail={currentUser.email || ''}
                  userId={currentUser.uid}
                />
              </div>
            </div>
          )}
          
          <AlertMessageDisplay 
            type="info" 
            title="Firebase Index Required"
            message={`If you see an error about missing Firestore indexes after login, you'll need to create it:
            1. Click on the error link in the console
            2. Sign in to your Firebase console
            3. In the form that appears:
               - Field 1: Enter userId with Ascending order
               - Field 2: Enter createdAt with Descending order
               - Select Collection for "Query scopes"
            4. Click "Create index" and wait a few minutes for it to build

            This is required for sorting reminders by creation date.`}
          />
          
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
