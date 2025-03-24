
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Target, DollarSign, ShoppingBag } from 'lucide-react';

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    description: string;
    type: 'fundraising' | 'purchase' | 'general';
    target: number;
    current: number;
    deadline?: Date;
    milestones?: { title: string; completed: boolean }[];
    completed: boolean;
  };
};

const GoalCard = ({ goal }: GoalCardProps) => {
  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'fundraising':
        return <DollarSign className="h-5 w-5" />;
      case 'purchase':
        return <ShoppingBag className="h-5 w-5" />;
      case 'general':
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={`overflow-hidden ${goal.completed ? 'bg-muted/20' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-1 rounded">
              {getGoalTypeIcon(goal.type)}
            </div>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
          </div>
          
          {goal.completed ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : goal.deadline && new Date(goal.deadline) < new Date() ? (
            <Badge className="bg-red-100 text-red-800">
              <Clock className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800">
              {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {goal.description}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {goal.type !== 'general' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress:</span>
                <span className="font-medium">
                  {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                  {goal.type === 'fundraising' ? ' raised' : ''}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary rounded-full h-2.5"
                  style={{
                    width: `${Math.min(100, Math.round((goal.current / goal.target) * 100))}%`
                  }}
                />
              </div>
              <div className="text-xs text-right text-muted-foreground">
                {Math.round((goal.current / goal.target) * 100)}% {goal.completed ? 'Achieved' : 'Complete'}
              </div>
            </div>
          )}
          
          {goal.type === 'general' && goal.milestones && goal.milestones.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm flex justify-between">
                <span>Milestones:</span>
                <span>
                  {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} completed
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary rounded-full h-2.5"
                  style={{
                    width: `${Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
          
          {goal.deadline && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Deadline: {new Date(goal.deadline).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/goals/${goal.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
