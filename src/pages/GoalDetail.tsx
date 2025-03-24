
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit, 
  MoreVertical, 
  Trash, 
  Target,
  DollarSign,
  ShoppingBag,
  Users,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Milestone = {
  id: string;
  title: string;
  completed: boolean;
};

type Member = {
  id: string;
  name: string;
  role: string;
  contribution?: number;
};

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
  milestones: Milestone[];
  members: Member[];
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

const GoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      if (!currentUser || !id) return;
      
      try {
        const goalRef = doc(db, 'goals', id);
        const goalSnap = await getDoc(goalRef);
        
        if (goalSnap.exists()) {
          const goalData = goalSnap.data();
          
          // Fetch project name if there's a project ID
          let projectName;
          if (goalData.projectId) {
            try {
              const projectRef = doc(db, 'projects', goalData.projectId);
              const projectSnap = await getDoc(projectRef);
              if (projectSnap.exists()) {
                projectName = projectSnap.data().title;
              }
            } catch (error) {
              console.error('Error fetching project:', error);
            }
          }
          
          setGoal({
            id: goalSnap.id,
            title: goalData.title,
            description: goalData.description,
            type: goalData.type,
            target: goalData.target,
            current: goalData.current,
            deadline: goalData.deadline ? goalData.deadline.toDate() : undefined,
            projectId: goalData.projectId,
            projectName: projectName,
            category: goalData.category,
            milestones: goalData.milestones || [],
            members: goalData.members || [],
            completed: goalData.completed,
            createdAt: goalData.createdAt.toDate(),
            updatedAt: goalData.updatedAt ? goalData.updatedAt.toDate() : undefined,
          });
        } else {
          toast({
            title: 'Error',
            description: 'Goal not found',
            variant: 'destructive',
          });
          navigate('/goals');
        }
      } catch (error) {
        console.error('Error fetching goal:', error);
        toast({
          title: 'Error',
          description: 'Failed to load goal details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [currentUser, id, navigate, toast]);

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    if (!goal || !id) return;
    
    try {
      // Create updated milestones array
      const updatedMilestones = goal.milestones.map(milestone => 
        milestone.id === milestoneId ? { ...milestone, completed } : milestone
      );
      
      // Check if all milestones are completed
      const allMilestonesCompleted = updatedMilestones.every(m => m.completed);
      
      // Update goal in database
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, { 
        milestones: updatedMilestones,
        completed: goal.type === 'general' ? allMilestonesCompleted : goal.completed,
        updatedAt: new Date()
      });
      
      // Update local state
      setGoal(prevGoal => {
        if (!prevGoal) return null;
        return {
          ...prevGoal,
          milestones: updatedMilestones,
          completed: prevGoal.type === 'general' ? allMilestonesCompleted : prevGoal.completed,
          updatedAt: new Date(),
        };
      });
      
      toast({
        title: `Milestone ${completed ? 'completed' : 'reopened'}`,
        description: `The milestone has been marked as ${completed ? 'completed' : 'not completed'}.`,
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update milestone. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleGoalCompletion = async () => {
    if (!goal || !id) return;
    
    try {
      const newCompletionStatus = !goal.completed;
      
      // Update goal in database
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, { 
        completed: newCompletionStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setGoal(prevGoal => {
        if (!prevGoal) return null;
        return {
          ...prevGoal,
          completed: newCompletionStatus,
          updatedAt: new Date(),
        };
      });
      
      toast({
        title: newCompletionStatus ? 'Goal completed' : 'Goal reopened',
        description: `The goal has been marked as ${newCompletionStatus ? 'completed' : 'not completed'}.`,
      });
    } catch (error) {
      console.error('Error updating goal completion status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async () => {
    if (!id) return;
    
    try {
      // Delete goal document
      await deleteDoc(doc(db, 'goals', id));
      
      toast({
        title: 'Goal deleted',
        description: 'The goal has been successfully deleted.',
      });
      
      navigate('/goals');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Goal not found</h3>
          <p className="text-muted-foreground mb-6">This goal may have been deleted or you don't have access to it.</p>
          <Button asChild>
            <Link to="/goals">Go back to Goals</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded">
            {getGoalTypeIcon(goal.type)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{goal.title}</h1>
            {goal.category && (
              <span className="text-sm text-muted-foreground">
                Category: {goal.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={goal.completed ? "outline" : "default"}
            onClick={handleToggleGoalCompletion}
          >
            {goal.completed ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Reopen Goal
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/goals/${id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Goal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/goals/${id}/invite`} className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Members
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Goal Details</CardTitle>
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
          <CardDescription>{goal.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress section */}
          {goal.type !== 'general' && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Progress</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>{formatCurrency(goal.current)} raised</span>
                <span>Target: {formatCurrency(goal.target)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary rounded-full h-3 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((goal.current / goal.target) * 100))}%`
                  }}
                />
              </div>
              <div className="text-sm text-right">
                {Math.round((goal.current / goal.target) * 100)}% Complete
              </div>
              {goal.type === 'fundraising' && (
                <Button asChild variant="outline" className="mt-2">
                  <Link to={`/goals/${id}/contribute`}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Make a Contribution
                  </Link>
                </Button>
              )}
            </div>
          )}
          
          {/* Basic information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              {goal.projectId && goal.projectName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Project: </span>
                  <Link to={`/projects/${goal.projectId}`} className="font-medium hover:underline">
                    {goal.projectName}
                  </Link>
                </div>
              )}
              
              {goal.deadline && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Deadline:</span>
                  {new Date(goal.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Created:</span>
                {new Date(goal.createdAt).toLocaleDateString()}
              </div>
              
              {goal.updatedAt && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Last updated:</span>
                  {new Date(goal.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          {/* Milestones section */}
          {goal.type === 'general' && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Milestones</h3>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/goals/${id}/milestones/new`}>
                      <Plus className="mr-2 h-3 w-3" />
                      Add Milestone
                    </Link>
                  </Button>
                </div>
                
                {goal.milestones.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">No milestones have been created yet.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/goals/${id}/milestones/new`}>
                        <Plus className="mr-2 h-3 w-3" />
                        Create First Milestone
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {goal.milestones.map((milestone) => (
                      <div 
                        key={milestone.id} 
                        className="flex items-start p-3 border rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox 
                          checked={milestone.completed}
                          onCheckedChange={(checked) => 
                            handleToggleMilestone(milestone.id, checked === true)
                          }
                          className="mt-0.5"
                        />
                        <div className="ml-3 flex-1">
                          <p className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {milestone.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Members section */}
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Members</h3>
              <Button asChild variant="outline" size="sm">
                <Link to={`/goals/${id}/invite`}>
                  <Plus className="mr-2 h-3 w-3" />
                  Invite Member
                </Link>
              </Button>
            </div>
            
            {goal.members.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No members have been added yet.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/goals/${id}/invite`}>
                    <Plus className="mr-2 h-3 w-3" />
                    Invite Members
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {goal.members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    {member.contribution && (
                      <Badge variant="outline">
                        {formatCurrency(member.contribution)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Goal Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-3 bg-red-50 rounded-md border border-red-200 text-red-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            <span className="text-sm">This will permanently delete the goal "{goal.title}".</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalDetail;
