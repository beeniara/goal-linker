
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inviteUserToSavings } from '@/services/savingsInvitationService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: ''
    }
  });

  // Reset form and messages when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset();
      setError(null);
      setWarningMessage(null);
      setInfoMessage(null);
    }
  }, [open, form]);

  // Validate input data before sending invitation
  const validateInputData = () => {
    if (!userId || !userName) {
      setError('Your user information is incomplete. Please log out and log back in.');
      return false;
    }
    
    if (!savingsId || !savingsTitle) {
      setError('Savings goal information is incomplete. Please refresh the page and try again.');
      return false;
    }
    
    return true;
  };

  const handleInvite = async (values: z.infer<typeof inviteSchema>) => {
    try {
      // Reset all messages
      setError(null);
      setWarningMessage(null);
      setInfoMessage(null);
      
      // Validate input data
      if (!validateInputData()) {
        return;
      }
      
      setIsSubmitting(true);
      
      setInfoMessage(`Sending invitation to ${values.email}...`);
      console.log('Sending invitation to:', values.email, 'for savings:', savingsId);
      
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
        
        if (result.warning) {
          console.warn(result.warning);
          setWarningMessage(result.warning);
        }
      } else {
        // Handle specific error cases based on result.code
        if (result.message?.includes('already sent')) {
          setError(`An invitation has already been sent to ${values.email}`);
        } else if (result.code === 'permission-denied') {
          setError('Firebase permission denied. Please verify your security rules allow creating and querying invitations.');
        } else {
          setError(result.message || 'Failed to send invitation. Please try again.');
        }
        
        toast({
          title: 'Invitation Failed',
          description: result.message || 'Failed to send invitation. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.message || 'An error occurred while sending the invitation. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
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
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {warningMessage && (
          <Alert variant="warning" className="mb-4 border-yellow-500 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{warningMessage}</AlertDescription>
          </Alert>
        )}
        
        {infoMessage && (
          <Alert variant="info" className="mb-4 border-blue-500 bg-blue-50 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>{infoMessage}</AlertDescription>
          </Alert>
        )}
        
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
