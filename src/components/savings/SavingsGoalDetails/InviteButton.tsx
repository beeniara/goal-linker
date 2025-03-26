
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { GroupInviteDialog } from '@/components/savings/GroupInviteDialog';

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

  if (!isGroupSavings) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
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
