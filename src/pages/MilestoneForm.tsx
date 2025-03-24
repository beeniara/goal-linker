
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
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
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  targetDate: z.date(),
  completed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const MilestoneForm = () => {
  const { id } = useParams(); // goal ID
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [fetchingGoal, setFetchingGoal] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      completed: false,
    },
  });

  useEffect(() => {
    const fetchGoal = async () => {
      if (!id || !currentUser) return;
      
      try {
        const goalDoc = await getDoc(doc(db, 'goals', id));
        if (goalDoc.exists()) {
          setGoalTitle(goalDoc.data().title);
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
  }, [currentUser, id, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (!currentUser || !id) return;
    
    setLoading(true);
    try {
      const milestoneData = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description || '',
        targetDate: Timestamp.fromDate(values.targetDate),
        completed: values.completed,
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid,
      };
      
      // Add milestone to the goal
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, {
        milestones: arrayUnion(milestoneData),
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: 'Success',
        description: 'Milestone added successfully',
      });
      
      navigate(`/goals/${id}`);
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to add milestone',
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
          onClick={() => navigate(`/goals/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goal
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Milestone to Goal</CardTitle>
          <CardDescription>
            Adding milestone for: <span className="font-medium">{goalTitle}</span>
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
                    <FormLabel>Milestone Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter milestone title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear description of this milestone
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
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional details about this milestone" 
                        className="min-h-20" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      What needs to be accomplished for this milestone? (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
                      When should this milestone be completed?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => navigate(`/goals/${id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Milestone
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestoneForm;
