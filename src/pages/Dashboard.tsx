import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Calendar, Clock, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [upcomingTasks, setUpcomingTasks] = useState<DocumentData[]>([]);
  const [recentProjects, setRecentProjects] = useState<DocumentData[]>([]);
  const [goalProgress, setGoalProgress] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch upcoming tasks
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', currentUser.uid),
          where('completed', '==', false),
          where('dueDate', '>=', Timestamp.now()),
          orderBy('dueDate', 'asc'),
          limit(5)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUpcomingTasks(tasksData);
        
        // Fetch recent projects
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentProjects(projectsData);
        
        // Fetch goals with progress
        const goalsQuery = query(
          collection(db, 'goals'),
          where('userId', '==', currentUser.uid),
          limit(3)
        );
        
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsData = goalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGoalProgress(goalsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  const renderUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'high':
        return <Badge variant="outline" className="urgency-badge-high">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="urgency-badge-medium">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="urgency-badge-low">Low</Badge>;
      default:
        return null;
    }
  };

  const renderStars = (priority: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < priority ? 'text-amber-500 fill-amber-500' : 'text-muted stroke-muted'}`}
      />
    ));
  };

  // Sample data for demo purposes (in case Firebase data isn't fetched yet)
  const sampleTasks = [
    {
      id: '1',
      title: 'Complete project proposal',
      dueDate: Timestamp.fromDate(new Date(Date.now() + 86400000)), // tomorrow
      urgency: 'high',
      priority: 5,
      projectId: '1',
      projectTitle: 'Marketing Campaign'
    },
    {
      id: '2',
      title: 'Review team designs',
      dueDate: Timestamp.fromDate(new Date(Date.now() + 172800000)), // day after tomorrow
      urgency: 'medium',
      priority: 3,
      projectId: '2',
      projectTitle: 'Website Redesign'
    },
    {
      id: '3',
      title: 'Prepare for client meeting',
      dueDate: Timestamp.fromDate(new Date(Date.now() + 259200000)), // 3 days from now
      urgency: 'low',
      priority: 2,
      projectId: '1',
      projectTitle: 'Marketing Campaign'
    }
  ];

  const sampleProjects = [
    {
      id: '1',
      title: 'Marketing Campaign',
      description: 'Q3 Marketing Campaign for product launch',
      tasksTotal: 12,
      tasksCompleted: 5
    },
    {
      id: '2',
      title: 'Website Redesign',
      description: 'Overhaul company website with new branding',
      tasksTotal: 24,
      tasksCompleted: 16
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'Build companion mobile app for our web platform',
      tasksTotal: 18,
      tasksCompleted: 3
    }
  ];

  const sampleGoals = [
    {
      id: '1',
      title: 'Annual Fundraiser',
      type: 'fundraising',
      target: 10000,
      current: 7500,
      currency: 'USD'
    },
    {
      id: '2',
      title: 'New Office Equipment',
      type: 'purchase',
      target: 5000,
      current: 3000,
      currency: 'USD'
    },
    {
      id: '3',
      title: 'Team Training Completion',
      type: 'general',
      milestones: 5,
      completed: 3
    }
  ];

  // Use sample data if Firebase data is empty
  const displayTasks = upcomingTasks.length > 0 ? upcomingTasks : sampleTasks;
  const displayProjects = recentProjects.length > 0 ? recentProjects : sampleProjects;
  const displayGoals = goalProgress.length > 0 ? goalProgress : sampleGoals;

  const calculateProgress = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your projects and tasks.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/projects/new')}
              >
                New Project
              </Button>
              <Button
                onClick={() => navigate('/tasks/new')}
              >
                New Task
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                  <CardDescription>
                    Your tasks due soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : displayTasks.length > 0 ? (
                    <div className="space-y-4">
                      {displayTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{task.title}</p>
                              {renderUrgencyBadge(task.urgency)}
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {format(task.dueDate.toDate(), 'MMM dd, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-0.5">
                                {renderStars(task.priority)}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              From: {task.projectTitle || 'No project'}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm" 
                        onClick={() => navigate('/tasks')}
                      >
                        View all tasks
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No upcoming tasks</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/tasks/new')}
                      >
                        Add a task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Projects</CardTitle>
                  <CardDescription>
                    Your most recent projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : displayProjects.length > 0 ? (
                    <div className="space-y-4">
                      {displayProjects.map((project) => (
                        <div key={project.id} className="space-y-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{project.title}</h4>
                            <Badge variant="secondary">{project.tasksCompleted}/{project.tasksTotal} tasks</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          <Progress 
                            value={calculateProgress(project.tasksCompleted, project.tasksTotal)} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm" 
                        onClick={() => navigate('/projects')}
                      >
                        View all projects
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No projects yet</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/projects/new')}
                      >
                        Create a project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Goal Progress</CardTitle>
                  <CardDescription>
                    Track your goals progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : displayGoals.length > 0 ? (
                    <div className="space-y-4">
                      {displayGoals.map((goal) => (
                        <div key={goal.id} className="space-y-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{goal.title}</h4>
                            <Badge>{goal.type}</Badge>
                          </div>
                          {goal.type === 'fundraising' || goal.type === 'purchase' ? (
                            <>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  {goal.current} {goal.currency} of {goal.target} {goal.currency}
                                </span>
                                <span className="font-medium">
                                  {Math.round((goal.current / goal.target) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(goal.current / goal.target) * 100} 
                                className="h-2" 
                              />
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  {goal.completed} of {goal.milestones} milestones
                                </span>
                                <span className="font-medium">
                                  {Math.round((goal.completed / goal.milestones) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(goal.completed / goal.milestones) * 100} 
                                className="h-2" 
                              />
                            </>
                          )}
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm" 
                        onClick={() => navigate('/goals')}
                      >
                        View all goals
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No goals yet</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/goals/new')}
                      >
                        Create a goal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Recent activity across your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l space-y-6">
                  <div className="relative">
                    <div className="absolute left-[-1.625rem] rounded-full w-5 h-5 bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="font-medium">New task created</span>
                        <span className="ml-auto text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You created a new task "Design homepage wireframes" in <span className="text-foreground">Website Redesign</span> project.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-[-1.625rem] rounded-full w-5 h-5 bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Project updated</span>
                        <span className="ml-auto text-xs text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You updated the due date for <span className="text-foreground">Marketing Campaign</span> project.
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-[-1.625rem] rounded-full w-5 h-5 bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Goal milestone reached</span>
                        <span className="ml-auto text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You reached 75% of your fundraising goal for <span className="text-foreground">Annual Fundraiser</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>
                  Manage and track your upcoming tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Upcoming Tasks</h3>
                    <Button 
                      onClick={() => navigate('/tasks/new')}
                      size="sm"
                    >
                      Add Task
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : displayTasks.length > 0 ? (
                    <div className="space-y-2">
                      {displayTasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          <div className="mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{task.title}</p>
                              {renderUrgencyBadge(task.urgency)}
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {format(task.dueDate.toDate(), 'MMM dd, yyyy')}
                                </span>
                                {task.dueTime && (
                                  <>
                                    <Clock className="h-4 w-4 mx-1" />
                                    <span>{task.dueTime}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-0.5">
                                {renderStars(task.priority)}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              From: {task.projectTitle || 'No project'}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm" 
                        onClick={() => navigate('/tasks')}
                      >
                        View all tasks
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No upcoming tasks</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/tasks/new')}
                      >
                        Add a task
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  Track progress on your ongoing projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Active Projects</h3>
                    <Button 
                      onClick={() => navigate('/projects/new')}
                      size="sm"
                    >
                      New Project
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : displayProjects.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {displayProjects.map((project) => (
                        <div 
                          key={project.id} 
                          className="rounded-md border p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{project.title}</h4>
                              <Badge variant="secondary">{project.tasksCompleted}/{project.tasksTotal} tasks</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  {calculateProgress(project.tasksCompleted, project.tasksTotal)}%
                                </span>
                              </div>
                              <Progress 
                                value={calculateProgress(project.tasksCompleted, project.tasksTotal)} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No projects yet</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/projects/new')}
                      >
                        Create a project
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={() => navigate('/projects')}
                  >
                    View all projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>
                  Track progress on your personal and professional goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Active Goals</h3>
                    <Button 
                      onClick={() => navigate('/goals/new')}
                      size="sm"
                    >
                      New Goal
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin-slow h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : displayGoals.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {displayGoals.map((goal) => (
                        <div 
                          key={goal.id} 
                          className="rounded-md border p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/goals/${goal.id}`)}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge>{goal.type}</Badge>
                            </div>
                            
                            {goal.type === 'fundraising' || goal.type === 'purchase' ? (
                              <>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {goal.current} {goal.currency} of {goal.target} {goal.currency}
                                  </span>
                                  <span className="font-medium">
                                    {Math.round((goal.current / goal.target) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(goal.current / goal.target) * 100} 
                                  className="h-2" 
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {goal.completed} of {goal.milestones} milestones
                                  </span>
                                  <span className="font-medium">
                                    {Math.round((goal.completed / goal.milestones) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(goal.completed / goal.milestones) * 100} 
                                  className="h-2" 
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No goals yet</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/goals/new')}
                      >
                        Create a goal
                      </Button>
                    </div>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={() => navigate('/goals')}
                  >
                    View all goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
