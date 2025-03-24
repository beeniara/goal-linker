
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  status: z.enum(['active', 'completed', 'on-hold']),
  dueDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ProjectForm = () => {
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingProject, setFetchingProject] = useState(isEditing);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'active',
      dueDate: undefined,
    },
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!isEditing || !currentUser) return;
      
      try {
        const projectDoc = await getDoc(doc(db, 'projects', id as string));
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          form.reset({
            title: projectData.title,
            description: projectData.description,
            status: projectData.status,
            dueDate: projectData.dueDate ? projectData.dueDate.toDate() : undefined,
          });
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
          description: 'Failed to load project details',
          variant: 'destructive',
        });
      } finally {
        setFetchingProject(false);
      }
    };

    fetchProject();
  }, [currentUser, form, id, isEditing, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const projectData = {
        title: values.title,
        description: values.description,
        status: values.status,
        dueDate: values.dueDate,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
      };
      
      if (isEditing) {
        // Update existing project
        await updateDoc(doc(db, 'projects', id as string), projectData);
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        });
      } else {
        // Create new project
        const projectsRef = collection(db, 'projects');
        const newProject = {
          ...projectData,
          createdAt: serverTimestamp(),
          members: [currentUser.uid],
          tasksCount: 0,
          completedTasksCount: 0,
        };
        
        const docRef = doc(projectsRef);
        await setDoc(docRef, newProject);
        toast({
          title: 'Success',
          description: 'Project created successfully',
        });
      }
      
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: isEditing 
          ? 'Failed to update project' 
          : 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProject) {
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
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Project' : 'Create New Project'}</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update your project details' 
              : 'Fill in the details to create a new project'}
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
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, concise title for your project
                    </FormDescription>
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
                        placeholder="Describe your project" 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about the project goals, scope, and deliverables
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When is this project due? (Optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate('/projects')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectForm;
