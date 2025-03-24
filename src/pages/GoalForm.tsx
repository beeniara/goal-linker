
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
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
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  category: z.string().optional(),
  targetDate: z.date(),
  status: z.enum(['not-started', 'in-progress', 'completed', 'abandoned']),
  priority: z.enum(['low', 'medium', 'high']),
});

type FormValues = z.infer<typeof formSchema>;

const GoalForm = () => {
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingGoal, setFetchingGoal] = useState(isEditing);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'not-started',
      priority: 'medium',
    },
  });

  useEffect(() => {
    const fetchGoal = async () => {
      if (!isEditing || !currentUser) return;
      
      try {
        const goalDoc = await getDoc(doc(db, 'goals', id as string));
        if (goalDoc.exists()) {
          const goalData = goalDoc.data();
          form.reset({
            title: goalData.title,
            description: goalData.description,
            category: goalData.category || '',
            targetDate: goalData.targetDate.toDate(),
            status: goalData.status,
            priority: goalData.priority,
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
          description: 'Failed to load goal details',
          variant: 'destructive',
        });
      } finally {
        setFetchingGoal(false);
      }
    };

    fetchGoal();
  }, [currentUser, form, id, isEditing, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const goalData = {
        title: values.title,
        description: values.description,
        category: values.category,
        targetDate: values.targetDate,
        status: values.status,
        priority: values.priority,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
      };
      
      if (isEditing) {
        // Update existing goal
        await updateDoc(doc(db, 'goals', id as string), goalData);
        toast({
          title: 'Success',
          description: 'Goal updated successfully',
        });
      } else {
        // Create new goal
        const goalsRef = collection(db, 'goals');
        const newGoal = {
          ...goalData,
          createdAt: serverTimestamp(),
          contributors: [currentUser.uid],
          progress: 0,
          milestones: [],
        };
        
        const docRef = doc(goalsRef);
        await setDoc(docRef, newGoal);
        toast({
          title: 'Success',
          description: 'Goal created successfully',
        });
      }
      
      navigate('/goals');
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: 'Error',
        description: isEditing 
          ? 'Failed to update goal' 
          : 'Failed to create goal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingGoal) {
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
          onClick={() => navigate('/goals')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update your goal details' 
              : 'Set a new goal to track your progress'}
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
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter goal title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, specific title for your goal
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
                        placeholder="Describe your goal in detail" 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      What do you want to achieve? Why is this goal important?
                    </FormDescription>
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
                        placeholder="e.g., Career, Health, Finance, Personal" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Categorize your goal (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1 flex flex-col">
                      <FormLabel>Target Date</FormLabel>
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
                      <FormDescription>
                        When do you want to achieve this goal?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="abandoned">Abandoned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current progress status
                      </FormDescription>
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
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How important is this goal?
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
                  onClick={() => navigate('/goals')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalForm;
