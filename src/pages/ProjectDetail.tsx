
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Edit, 
  MoreVertical, 
  Plus, 
  Trash, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Tag, 
  Star,
  StarOff 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  dueTime?: string;
  urgency: 'low' | 'medium' | 'high';
  priority: 1 | 2 | 3 | 4 | 5;
  category?: string;
  recurring?: string;
  completed: boolean;
  attachments?: string[];
};

type Project = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  dueDate?: Date;
  status: 'active' | 'completed' | 'on-hold';
  members: { id: string; name: string; role: string }[];
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      if (!currentUser || !id) return;
      
      try {
        // Fetch project details
        const projectRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          setProject({
            id: projectSnap.id,
            title: projectData.title,
            description: projectData.description,
            createdAt: projectData.createdAt.toDate(),
            dueDate: projectData.dueDate ? projectData.dueDate.toDate() : undefined,
            status: projectData.status,
            members: projectData.members || [{ id: currentUser.uid, name: 'You', role: 'Owner' }],
          });
          
          // Fetch tasks
          const tasksRef = collection(db, 'tasks');
          const q = query(tasksRef, where('projectId', '==', id));
          const querySnapshot = await getDocs(q);
          
          const tasksList: Task[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasksList.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
              dueTime: data.dueTime,
              urgency: data.urgency,
              priority: data.priority,
              category: data.category,
              recurring: data.recurring,
              completed: data.completed,
              attachments: data.attachments,
            });
          });
          
          setTasks(tasksList);
        } else {
          toast({
            title: 'Error',
            description: 'Project not found',
            variant: 'destructive',
          });
          navigate('/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [currentUser, id, navigate, toast]);

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { completed });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      );
      
      toast({
        title: `Task ${completed ? 'completed' : 'reopened'}`,
        description: `The task has been marked as ${completed ? 'completed' : 'not completed'}.`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    
    try {
      // Delete project document
      await deleteDoc(doc(db, 'projects', id));
      
      // In a real app, you would also:
      // 1. Delete all tasks associated with this project
      // 2. Remove project references from user documents
      // 3. Delete any files/attachments from storage
      
      toast({
        title: 'Project deleted',
        description: 'The project has been successfully deleted.',
      });
      
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPriorityStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < priority ? (
          <Star className="h-4 w-4 fill-primary text-primary" />
        ) : (
          <StarOff className="h-4 w-4 text-muted-foreground" />
        )}
      </span>
    ));
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
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Project not found</h3>
          <p className="text-muted-foreground mb-6">This project may have been deleted or you don't have access to it.</p>
          <Button asChild>
            <Link to="/projects">Go back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/tasks/new?projectId=${id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/projects/${id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/projects/${id}/invite`} className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Members
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <CardTitle className="text-xl">Project Details</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            <Badge className={
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Created:</span>
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Due date:</span>
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Project Members</h3>
            <div className="flex flex-wrap gap-2">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center text-sm bg-muted rounded-full px-3 py-1">
                  <span>{member.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link to={`/projects/${id}/invite`}>
                  <Plus className="h-3 w-3 mr-1" />
                  Invite
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">Active Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/tasks/new?projectId=${id}`}>
              <Plus className="h-3 w-3 mr-1" />
              New Task
            </Link>
          </Button>
        </div>
        
        <TabsContent value="active" className="space-y-4">
          {tasks.filter(task => !task.completed).length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium mb-2">No active tasks</h3>
              <p className="text-muted-foreground mb-4">All tasks have been completed or you haven't created any yet.</p>
              <Button asChild>
                <Link to={`/tasks/new?projectId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks
                .filter(task => !task.completed)
                .map(task => (
                  <Card key={task.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => 
                              handleTaskStatusChange(task.id, checked === true)
                            }
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <Link 
                              to={`/tasks/${task.id}`}
                              className="font-medium hover:underline"
                            >
                              {task.title}
                            </Link>
                            <Badge className={getUrgencyColor(task.urgency)}>
                              {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                                {task.dueTime && (
                                  <>
                                    <Clock className="h-3 w-3 mx-1" />
                                    {task.dueTime}
                                  </>
                                )}
                              </div>
                            )}
                            
                            {task.category && (
                              <div className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category}
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <span className="mr-1">Priority:</span>
                              <div className="flex">
                                {renderPriorityStars(task.priority)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {tasks.filter(task => task.completed).length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium mb-2">No completed tasks</h3>
              <p className="text-muted-foreground">Complete some tasks to see them here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks
                .filter(task => task.completed)
                .map(task => (
                  <Card key={task.id} className="hover:bg-muted/30 transition-colors bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => 
                              handleTaskStatusChange(task.id, checked === true)
                            }
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <Link 
                              to={`/tasks/${task.id}`}
                              className="font-medium line-through hover:underline text-muted-foreground"
                            >
                              {task.title}
                            </Link>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first task for this project.</p>
              <Button asChild>
                <Link to={`/tasks/new?projectId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <Card 
                  key={task.id} 
                  className={`hover:bg-muted/30 transition-colors ${task.completed ? 'bg-muted/20' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => 
                            handleTaskStatusChange(task.id, checked === true)
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <Link 
                            to={`/tasks/${task.id}`}
                            className={`font-medium hover:underline ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {task.title}
                          </Link>
                          {!task.completed && (
                            <Badge className={getUrgencyColor(task.urgency)}>
                              {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        
                        {!task.completed && (
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                                {task.dueTime && (
                                  <>
                                    <Clock className="h-3 w-3 mx-1" />
                                    {task.dueTime}
                                  </>
                                )}
                              </div>
                            )}
                            
                            {task.category && (
                              <div className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and all associated tasks will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-3 bg-red-50 rounded-md border border-red-200 text-red-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            <span className="text-sm">This will permanently delete the project "{project.title}" and all its tasks.</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
