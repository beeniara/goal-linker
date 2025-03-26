
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { GroupInviteDialog } from '@/components/savings/GroupInviteDialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InviteButtonProps {
  savingsId: string;
  savingsTitle: string;
  userId: string;
  userName: string;
  isGroupSavings: boolean;
}

export const InviteButton: React.FC<InviteButtonProps> = ({
  savingsId,
  savingsTitle,
  userId,
  userName,
  isGroupSavings
}) => {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  if (!isGroupSavings) {
    return null;
  }

  const handleOpenDialog = () => {
    setError(null);
    
    // Validate user authentication
    if (!userId) {
      setError("Authentication Required: You must be logged in to invite members.");
      toast({
        title: "Authentication Required",
        description: "You must be logged in to invite members.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate savings information
    if (!savingsId || !savingsTitle) {
      setError("Missing Information: Savings details are incomplete. Please refresh the page and try again.");
      toast({
        title: "Missing Information",
        description: "Savings information is incomplete. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }
    
    // All validations passed, open the dialog
    setOpen(true);
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    
      <Button 
        variant="outline" 
        onClick={handleOpenDialog}
        className="flex items-center"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Invite Member
      </Button>

      <GroupInviteDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setError(null);
        }}
        savingsId={savingsId}
        savingsTitle={savingsTitle}
        userId={userId}
        userName={userName}
      />
    </>
  );
};
