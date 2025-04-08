import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  projectId: z.string().min(1, { message: 'Please select a project' }),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high']),
  priority: z.enum(['1', '2', '3', '4', '5']),
  category: z.string().optional(),
  completed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type Project = {
  id: string;
  title: string;
};

const TaskForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  
  const isDuplicating = location.pathname.includes('/duplicate');
  const isEditing = !!id && id !== 'new' && !isDuplicating;
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingTask, setFetchingTask] = useState(isEditing || isDuplicating);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: projectIdParam || '',
      dueDate: undefined,
      dueTime: '',
      urgency: 'medium',
      priority: '3',
      category: '',
      completed: false,
    },
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser) return;
      
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const projectsList: Project[] = [];
        querySnapshot.forEach((doc) => {
          projectsList.push({
            id: doc.id,
            title: doc.data().title,
          });
        });
        
        setProjects(projectsList);
        
        // If we have a projectId from params and it exists in the projects list, set it
        if (projectIdParam && projectsList.some(p => p.id === projectIdParam)) {
          form.setValue('projectId', projectIdParam);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
      } finally {
        setFetchingProjects(false);
      }
    };

    fetchProjects();
  }, [currentUser, form, projectIdParam]);

  useEffect(() => {
    const fetchTask = async () => {
      if ((!isEditing && !isDuplicating) || !currentUser) {
        setFetchingTask(false);
        return;
      }
      
      try {
        const taskDoc = await getDoc(doc(db, 'tasks', id as string));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          
          // When duplicating, we keep all the data except completion status
          form.reset({
            title: isDuplicating ? `${taskData.title} (Copy)` : taskData.title,
            description: taskData.description || '',
            projectId: taskData.projectId || '',
            dueDate: taskData.dueDate ? taskData.dueDate.toDate() : undefined,
            dueTime: taskData.dueTime || '',
            urgency: taskData.urgency || 'medium',
            priority: taskData.priority?.toString() || '3',
            category: taskData.category || '',
            completed: isDuplicating ? false : taskData.completed || false,
          });
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
          description: 'Failed to load task details',
          variant: 'destructive',
        });
      } finally {
        setFetchingTask(false);
      }
    };

    fetchTask();
  }, [currentUser, form, id, isEditing, isDuplicating, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const taskData = {
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        urgency: values.urgency,
        priority: parseInt(values.priority),
        category: values.category,
        completed: values.completed,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
      };
      
      if (isEditing) {
        // Update existing task
        await updateDoc(doc(db, 'tasks', id as string), taskData);
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      } else {
        // Create new task (or duplicate)
        const tasksRef = collection(db, 'tasks');
        const newTask = {
          ...taskData,
          createdAt: serverTimestamp(),
        };
        
        const docRef = doc(tasksRef);
        await setDoc(docRef, newTask);
        
        // Update task count on the project
        if (values.projectId) {
          try {
            const projectRef = doc(db, 'projects', values.projectId);
            const projectDoc = await getDoc(projectRef);
            
            if (projectDoc.exists()) {
              const projectData = projectDoc.data();
              await updateDoc(projectRef, {
                tasksCount: (projectData.tasksCount || 0) + 1,
              });
            }
          } catch (error) {
            console.error('Error updating project task count:', error);
          }
        }
        
        toast({
          title: 'Success',
          description: isDuplicating ? 'Task duplicated successfully' : 'Task created successfully',
        });
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: isEditing 
          ? 'Failed to update task' 
          : isDuplicating
            ? 'Failed to duplicate task'
            : 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTask || fetchingProjects) {
    return (
      <div className="container py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/tasks')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEditing 
              ? 'Edit Task' 
              : isDuplicating
                ? 'Duplicate Task'
                : 'Create New Task'}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update your task details' 
              : isDuplicating
                ? 'Create a copy of this task with new details'
                : 'Fill in the details to create a new task'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your task (optional)" 
                        className="min-h-20" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.length > 0 ? (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No projects available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Time</FormLabel>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Development" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {isEditing && (
                <FormField
                  control={form.control}
                  name="completed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Mark as completed
                        </FormLabel>
                        <FormDescription>
                          Check if this task is finished
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate('/tasks')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing 
                    ? 'Update Task' 
                    : isDuplicating
                      ? 'Duplicate Task'
                      : 'Create Task'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskForm;
