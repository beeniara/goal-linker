
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  return (
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
  );
};

export default AdminDashboard;
