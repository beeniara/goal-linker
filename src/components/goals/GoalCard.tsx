
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  CheckCircle,
  Flag,
  Edit,
  Star,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Goal = {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'purchase' | 'general';
  target: number;
  current: number;
  deadline?: Date;
  projectId?: string;
  projectName?: string;
  category?: string;
  milestones?: { title: string; completed: boolean }[];
  members?: string[];
  completed: boolean;
};

type GoalCardProps = {
  goal: Goal;
};

const GoalCard = ({ goal }: GoalCardProps) => {
  // Calculate progress percentage (prevents division by zero)
  const progress = goal.target ? Math.min(100, (goal.current / goal.target) * 100) : 0;
  
  // Format currency for fundraising and purchase goals
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get card style based on goal type
  const getGoalTypeStyles = () => {
    switch (goal.type) {
      case 'fundraising':
        return {
          badge: 'bg-blue-100 text-blue-800',
          icon: <Users className="h-4 w-4 mr-1" />,
          label: 'Fundraising'
        };
      case 'purchase':
        return {
          badge: 'bg-purple-100 text-purple-800',
          icon: <Star className="h-4 w-4 mr-1" />,
          label: 'Purchase'
        };
      case 'general':
      default:
        return {
          badge: 'bg-green-100 text-green-800',
          icon: <Flag className="h-4 w-4 mr-1" />,
          label: 'General'
        };
    }
  };
  
  const styles = getGoalTypeStyles();

  return (
    <Card className={`h-full ${goal.completed ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="font-bold">
            {goal.title}
          </CardTitle>
          <Badge className={styles.badge}>
            <span className="flex items-center">
              {styles.icon}
              {styles.label}
            </span>
          </Badge>
        </div>
        <CardDescription className="truncate max-w-full">
          {goal.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {goal.type === 'fundraising' || goal.type === 'purchase' 
                ? `${formatCurrency(goal.current)} of ${formatCurrency(goal.target)}`
                : `${Math.round(progress)}%`
              }
            </span>
          </div>
          <Progress value={progress} className={`h-2 ${goal.completed ? 'bg-green-100' : ''}`} />
        </div>
        
        <div className="flex flex-col space-y-1 text-sm">
          {goal.deadline && (
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>
                {goal.completed 
                  ? 'Completed' 
                  : `Due ${formatDistanceToNow(goal.deadline, { addSuffix: true })}`
                }
              </span>
            </div>
          )}
          
          {goal.projectId && goal.projectName && (
            <div className="flex items-center text-muted-foreground">
              <Flag className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate max-w-full">
                Linked to project: 
                <Link 
                  to={`/projects/${goal.projectId}`} 
                  className="ml-1 text-primary hover:underline"
                >
                  {goal.projectName}
                </Link>
              </span>
            </div>
          )}
          
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="flex items-center text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>
                {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link to={`/goals/${goal.id}`}>
            {goal.completed ? 'View Details' : 'Track Progress'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
