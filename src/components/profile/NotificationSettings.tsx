
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const NotificationSettings = () => {
  return (
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
  );
};

export default NotificationSettings;
