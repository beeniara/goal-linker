
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSavingsGoalById, addContribution } from '@/services/savingsService';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { PiggyBank, ArrowLeft, Calendar, User, DollarSign, Clock, Plus, ChevronRight } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

// Define the contribution form schema
const contributionFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" }),
  note: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionFormSchema>;

const SavingsGoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savingsGoal, setSavingsGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contributionLoading, setContributionLoading] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);

  // Initialize the form
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      amount: '',
      note: '',
    },
  });

  // Load the savings goal data when the component mounts
  useEffect(() => {
    const fetchSavingsGoal = async () => {
      if (!id || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        const goalData = await getSavingsGoalById(id);
        if (goalData) {
          setSavingsGoal(goalData);
        } else {
          toast({
            title: "Error",
            description: "Savings goal not found.",
            variant: "destructive",
          });
          navigate('/savings');
        }
      } catch (error) {
        console.error("Error fetching savings goal:", error);
        toast({
          title: "Error",
          description: "Failed to load savings goal details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavingsGoal();
  }, [id, currentUser, navigate, toast]);

  // Handle contribution form submission
  const onSubmit = async (data: ContributionFormValues) => {
    if (!currentUser || !id) return;

    setContributionLoading(true);
    try {
      const amount = Number(data.amount);
      const updatedGoal = await addContribution(id, currentUser.uid, amount, data.note || '');
      
      // Update the local state with the new data
      setSavingsGoal(updatedGoal);
      
      // Show success toast
      toast({
        title: "Contribution Added",
        description: `$${amount.toFixed(2)} has been added to your savings goal.`,
      });
      
      // Reset the form and hide it
      form.reset();
      setShowContributionForm(false);
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setContributionLoading(false);
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!savingsGoal || savingsGoal.target === 0) return 0;
    return Math.min(100, (savingsGoal.current / savingsGoal.target) * 100);
  };

  // Format currency amount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Show skeleton loading UI while data is being fetched
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-muted rounded w-full"></div>
        <div className="h-64 bg-muted rounded w-full"></div>
      </div>
    );
  }

  // If no savings goal was found
  if (!savingsGoal) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">
            Savings goal not found or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link to="/savings">Back to Savings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="mb-4 px-0">
        <Link to="/savings" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Savings
        </Link>
      </Button>

      {/* Savings Goal Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{savingsGoal.title}</CardTitle>
              <CardDescription>{savingsGoal.description}</CardDescription>
            </div>
            <Button 
              variant={savingsGoal.completed ? "outline" : "default"} 
              disabled={savingsGoal.completed} 
              onClick={() => setShowContributionForm(!showContributionForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {savingsGoal.completed ? "Goal Reached" : "Add Contribution"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {formatCurrency(savingsGoal.current)} of {formatCurrency(savingsGoal.target)}
              </span>
            </div>
            <Progress 
              value={calculateProgress()} 
              className="h-4" 
            />
            <div className="text-sm text-right text-muted-foreground">
              {calculateProgress().toFixed(1)}% Complete
            </div>
          </div>

          {/* Contribution Form (conditionally rendered) */}
          {showContributionForm && (
            <Card className="border-dashed">
              <CardHeader className="py-3">
                <CardTitle className="text-lg">Add Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contribution Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input className="pl-10" placeholder="0.00" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            How much would you like to contribute?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monthly contribution" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={contributionLoading}
                        onClick={() => setShowContributionForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={contributionLoading}
                      >
                        {contributionLoading ? "Saving..." : "Add Contribution"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Savings Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Savings Method</h3>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="capitalize">{savingsGoal.method}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Contribution Plan</h3>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formatCurrency(savingsGoal.contributionAmount)} every {savingsGoal.frequency}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contribution History */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
          <CardDescription>
            {savingsGoal.contributions?.length
              ? `${savingsGoal.contributions.length} contribution${savingsGoal.contributions.length !== 1 ? 's' : ''} so far`
              : "No contributions yet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!savingsGoal.contributions || savingsGoal.contributions.length === 0) ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
              <p>No contributions have been made yet.</p>
              <p className="text-sm">Start adding contributions to track your progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savingsGoal.contributions
                .slice()
                .sort((a: any, b: any) => {
                  // Sort by createdAt in descending order (newest first)
                  const dateA = a.createdAt?.toDate?.() || new Date(0);
                  const dateB = b.createdAt?.toDate?.() || new Date(0);
                  return dateB - dateA;
                })
                .map((contribution: any, index: number) => {
                  // Convert Firestore timestamp to Date object if needed
                  const date = contribution.createdAt?.toDate 
                    ? contribution.createdAt.toDate() 
                    : new Date(contribution.createdAt);
                  
                  return (
                    <div key={contribution.id || index}>
                      <div className="flex justify-between items-center py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatCurrency(contribution.amount)}
                          </span>
                          {contribution.note && (
                            <span className="text-sm text-muted-foreground">
                              {contribution.note}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isNaN(date.getTime()) 
                            ? "Date unknown" 
                            : format(date, "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      {index < savingsGoal.contributions.length - 1 && <Separator />}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Target: {formatCurrency(savingsGoal.target)}
          </div>
          <div className="text-sm font-medium">
            Current: {formatCurrency(savingsGoal.current)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SavingsGoalDetail;
