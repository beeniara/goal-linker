
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { GroupInviteDialog } from '@/components/savings/GroupInviteDialog';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  if (!isGroupSavings) {
    return null;
  }

  const handleOpenDialog = () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to invite members.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if we have all the necessary information before opening the dialog
    if (!savingsId) {
      toast({
        title: "Missing Information",
        description: "Savings information is incomplete. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setOpen(true);
  };

  return (
    <>
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
        onOpenChange={setOpen}
        savingsId={savingsId}
        savingsTitle={savingsTitle}
        userId={userId}
        userName={userName}
      />
    </>
  );
};
