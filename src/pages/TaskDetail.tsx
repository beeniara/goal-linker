import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
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
  Clock, 
  Edit, 
  MoreVertical, 
  Trash, 
  Tag, 
  Star,
  StarOff,
  RefreshCw,
  Paperclip,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Task = {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  dueDate?: Date;
  dueTime?: string;
  urgency: 'low' | 'medium' | 'high';
  priority: 1 | 2 | 3 | 4 | 5;
  category?: string;
  recurring?: string;
  completed: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt?: Date;
};

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<{ name: string, url: string, type: string }[]>([]);

  useEffect(() => {
    const fetchTask = async () => {
      if (!currentUser || !id) return;
      
      try {
        const taskRef = doc(db, 'tasks', id);
        const taskSnap = await getDoc(taskRef);
        
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          
          // Fetch project name
          let projectName = "Unknown Project";
          if (taskData.projectId) {
            const projectRef = doc(db, 'projects', taskData.projectId);
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
              projectName = projectSnap.data().title;
            }
          }
          
          setTask({
            id: taskSnap.id,
            title: taskData.title,
            description: taskData.description,
            projectId: taskData.projectId,
            projectName: projectName,
            dueDate: taskData.dueDate ? taskData.dueDate.toDate() : undefined,
            dueTime: taskData.dueTime,
            urgency: taskData.urgency,
            priority: taskData.priority,
            category: taskData.category,
            recurring: taskData.recurring,
            completed: taskData.completed,
            attachments: taskData.attachments,
            createdAt: taskData.createdAt.toDate(),
            updatedAt: taskData.updatedAt ? taskData.updatedAt.toDate() : undefined,
          });
          
          // Get attachments URLs if they exist
          if (taskData.attachments && taskData.attachments.length > 0) {
            const urls = await Promise.all(
              taskData.attachments.map(async (attachmentPath: string) => {
                try {
                  const fileRef = ref(storage, attachmentPath);
                  const url = await getDownloadURL(fileRef);
                  
                  // Extract filename and guess file type
                  const name = attachmentPath.split('/').pop() || 'file';
                  const extension = name.split('.').pop()?.toLowerCase() || '';
                  let type = 'document';
                  
                  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
                    type = 'image';
                  } else if (['pdf'].includes(extension)) {
                    type = 'pdf';
                  }
                  
                  return { name, url, type };
                } catch (error) {
                  console.error('Error getting attachment URL:', error);
                  return { name: attachmentPath.split('/').pop() || 'file', url: '', type: 'error' };
                }
              })
            );
            
            setAttachmentUrls(urls.filter(url => url.url));
          }
        } else {
          toast({
            title: 'Error',
            description: 'Task not found',
            variant: 'destructive',
          });
          navigate('/tasks');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        toast({
          title: 'Error',
          description: 'Failed to load task details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [currentUser, id, navigate, toast]);

  const handleStatusChange = async (completed: boolean) => {
    if (!task || !id) return;
    
    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, { 
        completed,
        updatedAt: new Date()
      });
      
      // Update local state
      setTask(prevTask => prevTask ? { ...prevTask, completed } : null);
      
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

  const handleDeleteTask = async () => {
    if (!id) return;
    
    try {
      // Delete any attachments in storage
      if (task?.attachments && task.attachments.length > 0) {
        await Promise.all(
          task.attachments.map(async (attachmentPath) => {
            try {
              const fileRef = ref(storage, attachmentPath);
              await deleteObject(fileRef);
            } catch (error) {
              console.error('Error deleting attachment:', error);
              // Continue with deletion even if some attachments fail to delete
            }
          })
        );
      }
      
      // Delete task document
      await deleteDoc(doc(db, 'tasks', id));
      
      toast({
        title: 'Task deleted',
        description: 'The task has been successfully deleted.',
      });
      
      // Redirect to project page if we have a project ID, otherwise go to tasks
      if (task?.projectId) {
        navigate(`/projects/${task.projectId}`);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
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

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <span className="mr-2">🖼️</span>;
      case 'pdf':
        return <span className="mr-2">📄</span>;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
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

  if (!task) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Task not found</h3>
          <p className="text-muted-foreground mb-6">This task may have been deleted or you don't have access to it.</p>
          <Button asChild>
            <Link to="/tasks">Go back to Tasks</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={task.completed}
            onCheckedChange={(checked) => handleStatusChange(checked === true)}
            className="h-6 w-6"
          />
          <h1 className={`text-3xl font-bold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/tasks/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleStatusChange(!task.completed)}
              >
                <Checkbox 
                  checked={task.completed}
                  className="mr-2 h-4 w-4"
                />
                Mark as {task.completed ? 'not completed' : 'completed'}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/tasks/${id}/duplicate`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Duplicate Task
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-2">
            <CardTitle className="text-xl">Task Details</CardTitle>
            <Badge className={getUrgencyColor(task.urgency)}>
              {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)} Urgency
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Description:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-muted-foreground">Project: </span>
                <Link to={`/projects/${task.projectId}`} className="font-medium hover:underline">
                  {task.projectName}
                </Link>
              </div>
              
              {task.dueDate && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Due date:</span>
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              
              {task.dueTime && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Due time:</span>
                  {task.dueTime}
                </div>
              )}
              
              {task.category && (
                <div className="flex items-center text-sm">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Category:</span>
                  {task.category}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-1">Priority:</span>
                <div className="flex ml-1">
                  {renderPriorityStars(task.priority)}
                </div>
              </div>
              
              {task.recurring && (
                <div className="flex items-center text-sm">
                  <RefreshCw className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Recurring:</span>
                  {task.recurring}
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Created:</span>
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
              
              {task.updatedAt && (
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Last updated:</span>
                  {new Date(task.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          
          {attachmentUrls.length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attachments ({attachmentUrls.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {attachmentUrls.map((attachment, index) => (
                    <a 
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      {getAttachmentIcon(attachment.type)}
                      <span className="text-sm truncate">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Task Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone and all attachments will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-3 bg-red-50 rounded-md border border-red-200 text-red-800">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            <span className="text-sm">This will permanently delete the task "{task.title}".</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
