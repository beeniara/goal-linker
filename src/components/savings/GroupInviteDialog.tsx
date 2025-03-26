
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteUserToSavings } from '@/services/savingsInvitationService';
import { useToast } from '@/hooks/use-toast';

interface GroupInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savingsId: string;
  savingsTitle: string;
  userId: string;
  userName: string;
}

export const GroupInviteDialog: React.FC<GroupInviteDialogProps> = ({
  open,
  onOpenChange,
  savingsId,
  savingsTitle,
  userId,
  userName
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await inviteUserToSavings(
        savingsId,
        savingsTitle,
        userId,
        userName,
        email
      );

      if (result.success) {
        toast({
          title: 'Invitation Sent',
          description: `An invitation has been sent to ${email}`,
        });
        setEmail('');
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
