
import React from 'react';
import { format } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ContributionsHistoryProps {
  contributions: any[];
  current: number;
  target: number;
  formatCurrency: (amount: number) => string;
  username: string;
}

export const ContributionsHistory: React.FC<ContributionsHistoryProps> = ({
  contributions,
  current,
  target,
  formatCurrency,
  username
}) => {
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Date unknown';
    
    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), "MMM d, yyyy 'at' h:mm a");
      }
      
      if (timestamp instanceof Date) {
        return format(timestamp, "MMM d, yyyy 'at' h:mm a");
      }
      
      if (timestamp.seconds) {
        return format(new Date(timestamp.seconds * 1000), "MMM d, yyyy 'at' h:mm a");
      }
      
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution History</CardTitle>
        <div className="flex flex-col">
          <CardDescription>
            {contributions?.length
              ? `${contributions.length} contribution${contributions.length !== 1 ? 's' : ''} so far`
              : "No contributions yet"}
          </CardDescription>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 mr-1" />
            <span>{username}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(!contributions || contributions.length === 0) ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
            <p>No contributions have been made yet.</p>
            <p className="text-sm">Start adding contributions to track your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contributions
              .slice()
              .sort((a: any, b: any) => {
                const getTimestamp = (item: any) => {
                  if (!item.createdAt) return 0;
                  if (item.createdAt.toDate) return item.createdAt.toDate().getTime();
                  if (item.createdAt.seconds) return item.createdAt.seconds * 1000;
                  if (item.createdAt instanceof Date) return item.createdAt.getTime();
                  return new Date(item.createdAt).getTime();
                };
                
                return getTimestamp(b) - getTimestamp(a);
              })
              .map((contribution: any, index: number) => (
                <div key={contribution.id || index}>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatCurrency(contribution.amount)}
                      </span>
                      {contribution.note && (
                        <span className="text-sm text-muted-foreground">
                          {contribution.note}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimestamp(contribution.createdAt)}
                    </div>
                  </div>
                  {index < contributions.length - 1 && <Separator />}
                </div>
              ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Target: {formatCurrency(target)}
        </div>
        <div className="text-sm font-medium">
          Current: {formatCurrency(current)}
        </div>
      </CardFooter>
    </Card>
  );
};
