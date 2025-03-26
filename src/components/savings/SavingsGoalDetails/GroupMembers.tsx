
import React from 'react';
import { User, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface GroupMemberProps {
  ownerName: string;
  ownerId: string;
  members: {
    id: string;
    name: string;
  }[];
  currentUserId: string;
}

export const GroupMembers: React.FC<GroupMemberProps> = ({
  ownerName,
  ownerId,
  members,
  currentUserId
}) => {
  // Filter out invited members (non-owner)
  const invitedMembers = members.filter(member => member.id !== ownerId);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <Users className="h-5 w-5 mr-2 text-muted-foreground" />
          Savings Group Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
          <div className="flex items-center p-3 bg-primary/5 rounded-md">
            <Avatar className="h-8 w-8 mr-2 bg-primary text-primary-foreground">
              <span className="text-xs">{ownerName.charAt(0).toUpperCase()}</span>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{ownerName}</p>
            </div>
            {currentUserId === ownerId && (
              <Badge variant="outline" className="ml-auto">You</Badge>
            )}
          </div>
        </div>

        {invitedMembers.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Invited Members ({invitedMembers.length})
              </h3>
              <div className="space-y-2">
                {invitedMembers.map(member => (
                  <div key={member.id} className="flex items-center p-3 bg-muted/30 rounded-md">
                    <Avatar className="h-8 w-8 mr-2 bg-muted">
                      <span className="text-xs">{member.name.charAt(0).toUpperCase()}</span>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                    </div>
                    {currentUserId === member.id && (
                      <Badge variant="outline" className="ml-auto">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {invitedMembers.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No other members have joined yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
