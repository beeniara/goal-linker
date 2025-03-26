
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, Inbox } from 'lucide-react';
import { getUserInvitations, respondToInvitation, SavingsInvitation } from '@/services/savingsInvitationService';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertMessageDisplay } from '@/components/alerts/AlertMessageDisplay';

interface InvitationNotificationsProps {
  userEmail: string;
  userId: string;
}

export const InvitationNotifications: React.FC<InvitationNotificationsProps> = ({ userEmail, userId }) => {
  const [invitations, setInvitations] = useState<SavingsInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching invitations for:', userEmail);
        const userInvitations = await getUserInvitations(userEmail);
        console.log('Fetched invitations:', userInvitations);
        setInvitations(userInvitations);
      } catch (error: any) {
        console.error('Error fetching invitations:', error);
        setError('Failed to load invitations. Please refresh the page.');
        toast({
          title: 'Error',
          description: 'Failed to load invitations. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchInvitations();
    }
  }, [userEmail, toast]);

  const handleResponse = async (invitationId: string, accept: boolean) => {
    try {
      setRespondingTo(invitationId);
      setError(null);
      
      await respondToInvitation(invitationId, userId, accept);
      
      toast({
        title: accept ? 'Invitation Accepted' : 'Invitation Declined',
        description: accept 
          ? 'You have been added to the savings group' 
          : 'You have declined the invitation',
      });
      
      // Remove the invitation from the list
      setInvitations(prevInvitations => 
        prevInvitations.filter(inv => inv.id !== invitationId)
      );
    } catch (error: any) {
      console.error('Error responding to invitation:', error);
      setError(`Failed to process your response: ${error.message || 'Unknown error'}. Please try again or refresh the page.`);
      toast({
        title: 'Error',
        description: 'Failed to process your response. Please try again or refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setRespondingTo(null);
    }
  };

  if (error) {
    return <AlertMessageDisplay type="error" message={error} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
        <span className="text-sm text-muted-foreground">Loading invitations...</span>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium mb-1">No Pending Invitations</h3>
        <p className="text-sm text-muted-foreground">
          You don't have any pending invitations at the moment.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <motion.div
            key={invitation.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-l-4 border-l-primary">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <AlertTitle className="text-base">Savings Group Invitation</AlertTitle>
                    <AlertDescription>
                      <p className="mt-1">
                        <span className="font-semibold">{invitation.inviterName || 'Someone'}</span> has invited you to join the savings goal "{invitation.savingsTitle}".
                      </p>
                    </AlertDescription>
                  </div>
                </div>
                <div className="flex space-x-2 self-end sm:self-center mt-2 sm:mt-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center" 
                    onClick={() => handleResponse(invitation.id!, false)}
                    disabled={respondingTo === invitation.id}
                  >
                    {respondingTo === invitation.id ? (
                      <div className="animate-spin h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Decline
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex items-center" 
                    onClick={() => handleResponse(invitation.id!, true)}
                    disabled={respondingTo === invitation.id}
                  >
                    {respondingTo === invitation.id ? (
                      <div className="animate-spin h-4 w-4 mr-1 border-2 border-muted border-t-transparent rounded-full" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>
            </Alert>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
};
