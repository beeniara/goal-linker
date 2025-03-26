
import React from 'react';
import { 
  PiggyBank, 
  Car,
  CarFront,
  Bike,
  Home,
  Laptop,
  Smartphone,
  Plane,
  ShoppingBag,
  Plus
} from 'lucide-react';
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InviteButton } from './InviteButton';

interface GoalHeaderProps {
  title: string;
  description: string;
  userId: string;
  username: string;
  savingsId: string;
  completed: boolean;
  method: string;
  onAddContribution: () => void;
}

export const GoalHeader: React.FC<GoalHeaderProps> = ({
  title,
  description,
  userId,
  username,
  savingsId,
  completed,
  method,
  onAddContribution
}) => {
  const getGoalIcon = () => {
    if (!title) return <PiggyBank className="h-8 w-8 text-primary" />;
    
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('car')) {
      return <Car className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('auto') || lowerTitle.includes('vehicle')) {
      return <CarFront className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('bike') || lowerTitle.includes('bicycle')) {
      return <Bike className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('house') || lowerTitle.includes('home')) {
      return <Home className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('laptop') || lowerTitle.includes('computer')) {
      return <Laptop className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('phone') || lowerTitle.includes('mobile')) {
      return <Smartphone className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('vacation') || lowerTitle.includes('travel') || lowerTitle.includes('trip')) {
      return <Plane className="h-8 w-8 text-primary" />;
    } else if (lowerTitle.includes('shopping')) {
      return <ShoppingBag className="h-8 w-8 text-primary" />;
    } else {
      return <PiggyBank className="h-8 w-8 text-primary" />;
    }
  };

  const isGroupSavings = method === 'group';

  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            {getGoalIcon()}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <InviteButton 
            savingsId={savingsId}
            savingsTitle={title}
            userId={userId}
            userName={username}
            isGroupSavings={isGroupSavings}
          />
          <Button 
            variant={completed ? "outline" : "default"} 
            disabled={completed} 
            onClick={onAddContribution}
          >
            <Plus className="h-4 w-4 mr-2" />
            {completed ? "Goal Reached" : "Add Contribution"}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
