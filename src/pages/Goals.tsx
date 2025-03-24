
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus, Search, Target, DollarSign, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Goal = {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'purchase' | 'general';
  target: number;
  current: number;
  deadline?: Date;
  projectId?: string;
  category?: string;
  milestones?: { title: string; completed: boolean }[];
  members?: string[];
  completed: boolean;
};

const Goals = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGoals = async () => {
      if (!currentUser) return;
      
      try {
        // This is a placeholder for the actual Firebase query
        const goalsRef = collection(db, 'goals');
        const q = query(goalsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const goalsList: Goal[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          goalsList.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            type: data.type,
            target: data.target,
            current: data.current,
            deadline: data.deadline ? data.deadline.toDate() : undefined,
            projectId: data.projectId,
            category: data.category,
            milestones: data.milestones,
            members: data.members,
            completed: data.completed,
          });
        });
        
        setGoals(goalsList);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load goals. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [currentUser, toast]);

  const filteredGoals = goals.filter(goal => {
    // Filter by tab
    if (activeTab === 'active' && goal.completed) return false;
    if (activeTab === 'completed' && !goal.completed) return false;
    if (activeTab === 'fundraising' && goal.type !== 'fundraising') return false;
    if (activeTab === 'purchase' && goal.type !== 'purchase') return false;
    if (activeTab === 'general' && goal.type !== 'general') return false;
    
    // Filter by search
    if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Button asChild>
          <Link to="/goals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Link>
        </Button>
      </div>
      
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search goals..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-2 w-full mt-4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGoals.map((goal) => (
                <Card key={goal.id} className={`overflow-hidden ${goal.completed ? 'bg-muted/20' : ''}`}>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'No goals match your search' : 'Get started by creating your first goal'}
              </p>
              <Button asChild>
                <Link to="/goals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Goal
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;
