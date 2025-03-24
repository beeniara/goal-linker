
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccountSettings = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and connected services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Account Type</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your current account type and status.
            </p>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1">
                <p className="font-medium">Standard Account</p>
                <p className="text-sm text-muted-foreground">
                  Access to all basic features
                </p>
              </div>
              {isAdmin && (
                <Badge>Admin</Badge>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Connected Accounts</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Manage your connected accounts and services.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="bg-[#4285F4] text-white rounded-full p-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#fff"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#fff"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#fff"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#fff"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.providerData.some(p => p.providerId === 'google.com')
                        ? 'Connected'
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentUser?.providerData.some(p => p.providerId === 'google.com')}
                >
                  {currentUser?.providerData.some(p => p.providerId === 'google.com')
                    ? 'Connected'
                    : 'Connect'}
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
