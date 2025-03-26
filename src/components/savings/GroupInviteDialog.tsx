
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteUserToSavings } from '@/services/savingsInvitationService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface GroupInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsId: string;
  savingsTitle: string;
  userId: string;
  userName: string;
}

const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

export const GroupInviteDialog: React.FC<GroupInviteDialogProps> = ({
  open,
  onOpenChange,
  savingsId,
  savingsTitle,
  userId,
  userName
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: ''
    }
  });

  const handleInvite = async (values: z.infer<typeof inviteSchema>) => {
    try {
      setIsSubmitting(true);
      const result = await inviteUserToSavings(
        savingsId,
        savingsTitle,
        userId,
        userName,
        values.email
      );

      if (result.success) {
        toast({
          title: 'Invitation Sent',
          description: `An invitation has been sent to ${values.email}`,
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          title: 'Invitation Failed',
          description: result.message || 'Failed to send invitation. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while sending the invitation. Please try again.',
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
          <DialogTitle>Invite to Savings Group</DialogTitle>
          <DialogDescription>
            Invite someone to join this savings goal. They'll need to accept the invitation to participate.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="friend@example.com"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
