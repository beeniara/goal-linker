
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createReminderNotification, updateReminderNotificationFrequency, deleteReminderNotification } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface ReminderNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminderId: string;
  reminderTitle: string;
  userId: string;
  userEmail: string;
  existingNotificationId?: string;
  existingFrequency?: 'once' | '12h' | '24h';
}

export const ReminderNotificationDialog: React.FC<ReminderNotificationDialogProps> = ({
  open,
  onOpenChange,
  reminderId,
  reminderTitle,
  userId,
  userEmail,
  existingNotificationId,
  existingFrequency
}) => {
  const [frequency, setFrequency] = useState<'once' | '12h' | '24h'>(existingFrequency || '24h');
  const [isEnabled, setIsEnabled] = useState(!!existingNotificationId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      if (isEnabled) {
        if (existingNotificationId) {
          // Update existing notification
          await updateReminderNotificationFrequency(existingNotificationId, frequency);
          toast({
            title: 'Notification Updated',
            description: `Email reminders updated for "${reminderTitle}"`,
          });
        } else {
          // Create new notification
          await createReminderNotification(reminderId, reminderTitle, userId, userEmail, frequency);
          toast({
            title: 'Notification Enabled',
            description: `Email reminders enabled for "${reminderTitle}"`,
          });
        }
      } else if (existingNotificationId) {
        // Delete existing notification
        await deleteReminderNotification(existingNotificationId);
        toast({
          title: 'Notification Disabled',
          description: `Email reminders disabled for "${reminderTitle}"`,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error managing reminder notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reminder Notifications</DialogTitle>
          <DialogDescription>
            Configure email notifications for this reminder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notification-toggle" className="font-medium">
              Email Notifications
            </Label>
            <Switch
              id="notification-toggle"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          
          {isEnabled && (
            <div className="grid gap-2">
              <Label htmlFor="frequency">Notification Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as 'once' | '12h' | '24h')}
                disabled={!isEnabled}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once (when due)</SelectItem>
                  <SelectItem value="12h">12 hours before due</SelectItem>
                  <SelectItem value="24h">24 hours before due</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {frequency === 'once'
                  ? 'You will be notified once when the reminder is due.'
                  : frequency === '12h'
                    ? 'You will be notified 12 hours before the reminder is due.'
                    : 'You will be notified 24 hours before the reminder is due.'}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
