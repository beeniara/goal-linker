
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createReminderNotification, updateReminderNotificationFrequency, deleteReminderNotification } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';
import { Bell, Clock, AlertTriangle, HelpCircle } from 'lucide-react';

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
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <DialogTitle>Reminder Notifications</DialogTitle>
          </div>
          <DialogDescription>
            Configure email notifications for "{reminderTitle}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="notification-toggle" className="font-medium">
                Email Notifications
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      When enabled, you'll receive email notifications based on your selected frequency.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="notification-toggle"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          
          {isEnabled && (
            <div className="grid gap-2">
              <Label htmlFor="frequency" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Notification Frequency
              </Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as 'once' | '12h' | '24h')}
                disabled={!isEnabled}
              >
                <SelectTrigger id="frequency" className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once (when due)</SelectItem>
                  <SelectItem value="12h">12 hours before due</SelectItem>
                  <SelectItem value="24h">24 hours before due</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-2 p-3 bg-muted rounded-md border text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" /> 
                <div>
                  {frequency === 'once'
                    ? 'You will receive one email notification when the reminder is due.'
                    : frequency === '12h'
                      ? 'You will receive an email notification 12 hours before the reminder is due.'
                      : 'You will receive an email notification 24 hours before the reminder is due.'}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
