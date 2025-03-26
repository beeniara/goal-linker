
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { getUserInvitations, respondToInvitation, SavingsInvitation } from '@/services/savingsInvitationService';
import { useToast } from '@/hooks/use-toast';

interface InvitationNotificationsProps {
  userEmail: string;
  userId: string;
}

export const InvitationNotifications: React.FC<InvitationNotificationsProps> = ({ userEmail, userId }) => {
  const [invitations, setInvitations] = useState<SavingsInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        const userInvitations = await getUserInvitations(userEmail);
        setInvitations(userInvitations);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchInvitations();
    }
  }, [userEmail]);

  const handleResponse = async (invitationId: string, accept: boolean) => {
    try {
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
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 my-4">
      {invitations.map((invitation) => (
        <Alert key={invitation.id}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <AlertTitle className="text-base">Savings Group Invitation</AlertTitle>
              <AlertDescription>
                <p className="mt-1">{invitation.inviterName || 'Someone'} has invited you to join the savings goal "{invitation.savingsTitle}".</p>
              </AlertDescription>
            </div>
            <div className="flex space-x-2 self-end sm:self-center mt-2 sm:mt-0">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center" 
                onClick={() => handleResponse(invitation.id!, false)}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
              <Button 
                size="sm" 
                className="flex items-center" 
                onClick={() => handleResponse(invitation.id!, true)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};
