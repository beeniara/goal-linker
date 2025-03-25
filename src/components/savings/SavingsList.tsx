
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSavingsGoals } from '@/services/savingsService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Calendar, User, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  target: number;
  current: number;
  frequency: string;
  contributionAmount: number;
  method: string;
  createdAt: any;
  updatedAt: any;
  completed: boolean;
}

export function SavingsList() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const savingsGoals = await getUserSavingsGoals(currentUser.uid);
        setGoals(savingsGoals as SavingsGoal[]);
        setError(null);
      } catch (err) {
        console.error("Error fetching goals:", err);
        setError("Failed to load your savings goals. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load your savings goals. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [currentUser, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-muted rounded w-full mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 border rounded-lg bg-destructive/10">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/20">
        <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-6">
          Your saved financial strategies will appear here.
        </p>
        <Button asChild>
          <Link to="/financial-strategies">Create Your First Savings Goal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="font-bold">{goal.title}</CardTitle>
              <Badge>
                <DollarSign className="h-3 w-3 mr-1" />
                Financial
              </Badge>
            </div>
            <CardDescription>{goal.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">${goal.current} of ${goal.target}</span>
              </div>
              <Progress 
                value={(goal.current / goal.target) * 100} 
                className="h-2" 
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>
                  {Math.ceil((goal.target - goal.current) / goal.contributionAmount)} {goal.frequency}s left
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="capitalize">{goal.method}</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/savings/${goal.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
