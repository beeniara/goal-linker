
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Edit, User, Mail, Lock, Shield, Bell, Image } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }).optional(),
  bio: z.string().max(160).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url({
    message: 'Please enter a valid URL.',
  }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { currentUser, userData, isAdmin, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: userData?.displayName || '',
      email: currentUser?.email || '',
      bio: userData?.bio || '',
      phone: userData?.phone || '',
      location: userData?.location || '',
      company: userData?.company || '',
      website: userData?.website || '',
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        if (userData) {
          form.reset({
            displayName: userData.displayName || '',
            email: currentUser.email || '',
            bio: userData.bio || '',
            phone: userData.phone || '',
            location: userData.location || '',
            company: userData.company || '',
            website: userData.website || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, userData, form, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Update user document in Firestore
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        bio: data.bio || '',
        phone: data.phone || '',
        location: data.location || '',
        company: data.company || '',
        website: data.website || '',
        updatedAt: new Date(),
      });
      
      // Update display name in Firebase Auth
      await updateProfile(currentUser, {
        displayName: data.displayName,
      });
      
      // Refresh user data in context
      await refreshUserData();
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files || e.target.files.length === 0) return;
    
    try {
      setUploadingPhoto(true);
      
      const file = e.target.files[0];
      const fileRef = ref(storage, `users/${currentUser.uid}/profile.${file.name.split('.').pop()}`);
      
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, file);
      
      // Get download URL
      const photoURL = await getDownloadURL(fileRef);
      
      // Update user profile in Firebase Auth
      await updateProfile(currentUser, { photoURL });
      
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL,
        updatedAt: new Date(),
      });
      
      // Refresh user data in context
      await refreshUserData();
      
      toast({
        title: 'Photo updated',
        description: 'Your profile photo has been successfully updated.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getInitials = () => {
    if (!userData?.displayName) return 'U';
    return userData.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
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
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || 'User'} />
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <Button variant="outline" size="sm" className="text-xs" disabled={uploadingPhoto}>
                      <label className="cursor-pointer flex items-center">
                        <Image className="h-3 w-3 mr-1" />
                        {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is the name that will be displayed to other users.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your email" 
                                {...field} 
                                disabled 
                              />
                            </FormControl>
                            <FormDescription>
                              Your email is used for notifications and sign-in.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us a little about yourself" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile. Max 160 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Your location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
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
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <Input type="password" placeholder="Enter your current password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input type="password" placeholder="Enter your new password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input type="password" placeholder="Confirm your new password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enhance the security of your account with these options.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Active Sessions</p>
                        <p className="text-sm text-muted-foreground">
                          Manage devices where you're currently logged in.
                        </p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose what types of updates you receive via email.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Project Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when projects are updated or tasks are assigned to you.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Daily</Button>
                        <Button variant="outline" size="sm">Immediate</Button>
                        <Button variant="outline" size="sm">Off</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Task Reminders</p>
                        <p className="text-sm text-muted-foreground">
                          Receive reminders for upcoming tasks or due dates.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Daily</Button>
                        <Button variant="outline" size="sm">Immediate</Button>
                        <Button variant="outline" size="sm">Off</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Goal Progress</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates on your goal progress and milestones.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Weekly</Button>
                        <Button variant="outline" size="sm">Monthly</Button>
                        <Button variant="outline" size="sm">Off</Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">System Notifications</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose what types of in-app notifications you receive.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Task Assignments</p>
                        <p className="text-sm text-muted-foreground">
                          Notify me when tasks are assigned to me.
                        </p>
                      </div>
                      <Button variant="outline">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Project Invitations</p>
                        <p className="text-sm text-muted-foreground">
                          Notify me when I'm invited to collaborate on projects.
                        </p>
                      </div>
                      <Button variant="outline">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Goal Contributions</p>
                        <p className="text-sm text-muted-foreground">
                          Notify me when someone contributes to a goal I'm part of.
                        </p>
                      </div>
                      <Button variant="outline">Enabled</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage users, projects, and site-wide settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">User Management</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      View and manage all users on the platform.
                    </p>
                    <Button>Manage Users</Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Content Moderation</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Review and moderate user-generated content.
                    </p>
                    <div className="space-y-2">
                      <Button className="mr-2">Review Projects</Button>
                      <Button>Review Goals</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Announcements</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Send site-wide announcements to all users.
                    </p>
                    <div className="space-y-4">
                      <Textarea placeholder="Enter your announcement..." className="min-h-[100px]" />
                      <div className="flex space-x-2">
                        <Button>Send Announcement</Button>
                        <Button variant="outline">Schedule</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Profile;
