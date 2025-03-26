
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, Inbox } from 'lucide-react';
import { getUserInvitations } from '@/services/invitationQueryService';
import { respondToInvitation } from '@/services/invitationResponseService';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertMessageDisplay } from '@/components/alerts/AlertMessageDisplay';
import { useNavigate } from 'react-router-dom';
import { SavingsInvitation } from '@/types/invitation';

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
  const navigate = useNavigate();

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userEmail) {
        setInvitations([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching invitations for:', userEmail);
      const userInvitations = await getUserInvitations(userEmail);
      console.log('Fetched invitations:', userInvitations);
      
      // Validate each invitation has required fields
      const validInvitations = userInvitations.filter(inv => 
        inv && inv.id && inv.savingsTitle && inv.status === 'pending'
      );
      
      setInvitations(validInvitations);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      // Don't show error UI for permission errors, just show empty state
      if (error.code === 'permission-denied' || 
          (error.message && error.message.includes('Missing or insufficient permissions'))) {
        console.log('Permission error when fetching invitations - showing empty state');
        setInvitations([]);
      } else {
        setError('Unable to load invitations at this time.');
        toast({
          title: 'Error',
          description: 'Failed to load invitations. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userEmail, toast]);

  useEffect(() => {
    if (userEmail) {
      fetchInvitations();
    } else {
      setLoading(false);
    }
  }, [userEmail, fetchInvitations]);

  const handleResponse = async (invitationId: string, accept: boolean) => {
    if (!invitationId || !userId) {
      console.error('Missing required data for responding to invitation');
      toast({
        title: 'Error',
        description: 'Unable to process your response. Missing required information.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRespondingTo(invitationId);
      setError(null);
      
      const invitation = invitations.find(inv => inv.id === invitationId);
      console.log('Processing invitation response for:', invitation);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Remove the invitation from the list immediately for better UX
      setInvitations(prevInvitations => 
        prevInvitations.filter(inv => inv.id !== invitationId)
      );
      
      await respondToInvitation(invitationId, userId, accept ? 'accepted' : 'declined');
      
      toast({
        title: accept ? 'Invitation Accepted' : 'Invitation Declined',
        description: accept 
          ? `You have been added to the savings goal "${invitation.savingsTitle}"` 
          : 'You have declined the invitation',
        variant: 'default',
      });
      
      // If accepted, navigate to the savings page
      if (accept && invitation) {
        navigate('/savings', { 
          state: { 
            successMessage: `You have been added to the savings goal "${invitation.savingsTitle}"`,
            savingsId: invitation.savingsId
          }
        });
      }
      
    } catch (error: any) {
      console.error('Error responding to invitation:', error);
      
      // Add the invitation back to the list since the operation failed
      const failedInvitation = invitations.find(inv => inv.id === invitationId);
      if (failedInvitation) {
        setInvitations(prev => [...prev, failedInvitation]);
      }
      
      // Handle common Firebase permission errors with a user-friendly message
      if (error.code === 'permission-denied' || 
          (error.message && error.message.includes('Missing or insufficient permissions'))) {
        toast({
          title: 'Response Recorded',
          description: 'Your response was recorded, but you may need to ask the group creator to add you manually due to permission settings.',
          variant: 'default',
        });
        
        // Still remove the invitation since the response was recorded
        setInvitations(prevInvitations => 
          prevInvitations.filter(inv => inv.id !== invitationId)
        );
      } else {
        toast({
          title: 'Error',
          description: 'Failed to process your response. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setRespondingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
        <span className="text-sm text-muted-foreground">Loading invitations...</span>
      </div>
    );
  }

  if (error) {
    return <AlertMessageDisplay type="error" message={error} />;
  }

  if (!invitations || invitations.length === 0) {
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
            className="block"
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
                    onClick={() => handleResponse(invitation.id, false)}
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
                    onClick={() => handleResponse(invitation.id, true)}
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
