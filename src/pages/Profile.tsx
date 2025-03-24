
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Lock, Bell, Shield } from 'lucide-react';

// Import refactored components
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import GeneralInfoForm from '@/components/profile/GeneralInfoForm';
import AccountSettings from '@/components/profile/AccountSettings';
import SecuritySettings from '@/components/profile/SecuritySettings';
import NotificationSettings from '@/components/profile/NotificationSettings';
import AdminDashboard from '@/components/profile/AdminDashboard';
import ProfileLoading from '@/components/profile/ProfileLoading';

const Profile = () => {
  const { userData, isAdmin, refreshUserData, loading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsPageLoading(false);
    }
  }, [loading]);

  if (isPageLoading) {
    return <ProfileLoading />;
  }

  return (
    <div className="container py-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <User className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="account">
            <Mail className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <ProfileAvatar userData={userData} refreshUserData={refreshUserData} />
                <div className="flex-1">
                  <GeneralInfoForm userData={userData} refreshUserData={refreshUserData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Profile;
