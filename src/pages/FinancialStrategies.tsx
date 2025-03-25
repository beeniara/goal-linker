
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  PiggyBank,
  DollarSign,
  Users,
  User,
  Calendar,
  Target,
  Hourglass,
  PlusCircle,
} from 'lucide-react';

// Form validation schema
const savingsGoalSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  target: z.coerce.number().min(1, { message: "Target amount must be at least 1" }),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  amount: z.coerce.number().min(1, { message: "Contribution amount must be at least 1" }),
  method: z.enum(["single", "group"]),
});

type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>;

export default function FinancialStrategies() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('create');

  const defaultValues: Partial<SavingsGoalFormValues> = {
    frequency: "weekly",
    method: "single",
  };

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues,
  });

  const onSubmit = async (data: SavingsGoalFormValues) => {
    if (!currentUser) return;

    try {
      const savingsId = uuidv4();
      await setDoc(doc(db, 'savings', savingsId), {
        id: savingsId,
        userId: currentUser.uid,
        title: data.title,
        description: data.description || '',
        target: data.target,
        frequency: data.frequency,
        contributionAmount: data.amount,
        method: data.method,
        current: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        contributions: [],
        members: data.method === 'group' ? [currentUser.uid] : [],
        completed: false,
      });

      toast({
        title: "Success!",
        description: "Your savings goal has been created.",
      });

      navigate('/savings');
    } catch (error) {
      console.error("Error creating savings goal:", error);
      toast({
        title: "Error",
        description: "Failed to create savings goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Financial Strategies for Saving</h1>

      <Tabs defaultValue="create" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="create">Create New Saving Strategy</TabsTrigger>
          <TabsTrigger value="view">View My Strategies</TabsTrigger>
          <TabsTrigger value="learn">Learning Center</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Create Savings Goal</CardTitle>
                  <CardDescription>
                    Follow these steps to set up your financial saving strategy
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={step >= 1 ? "default" : "outline"}>Step 1</Badge>
                  <Badge variant={step >= 2 ? "default" : "outline"}>Step 2</Badge>
                  <Badge variant={step >= 3 ? "default" : "outline"}>Step 3</Badge>
                  <Badge variant={step >= 4 ? "default" : "outline"}>Step 4</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Define Your Purpose</h3>
                          <p className="text-muted-foreground">Let's identify what you're saving for and set a target</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What are you saving for?</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., New Laptop, Vacation, Emergency Fund" {...field} />
                            </FormControl>
                            <FormDescription>
                              Give your savings goal a clear, specific name
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
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Why this goal matters to you" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="target"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total savings goal ($)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Savings Frequency</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contribution Amount ($)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Choose Saving Method</h3>
                          <p className="text-muted-foreground">Decide if you're saving alone or with others</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Saving Method</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'single' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('single')}
                              >
                                <div className="flex items-center mb-2">
                                  <User className="h-5 w-5 mr-2 text-primary" />
                                  <h4 className="font-medium">Single</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Save on your own with personal tools and strategies
                                </p>
                                <ul className="mt-3 text-sm space-y-1">
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Personal budgeting
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Self-accountability
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Private tracking
                                  </li>
                                </ul>
                              </div>
                              
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'group' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('group')}
                              >
                                <div className="flex items-center mb-2">
                                  <Users className="h-5 w-5 mr-2 text-primary" />
                                  <h4 className="font-medium">Group</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Save with friends or family for shared goals
                                </p>
                                <ul className="mt-3 text-sm space-y-1">
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Shared responsibility
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Group motivation
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Collective tracking
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('method') === 'group' && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Group Saving Tips
                          </h4>
                          <ul className="text-sm space-y-2">
                            <li>• Choose reliable people who share your commitment</li>
                            <li>• Decide on roles (organizer, treasurer, etc.)</li>
                            <li>• Set clear rules for contributions</li>
                            <li>• Establish regular check-ins</li>
                            <li>• After saving this goal, you can invite members from the details page</li>
                          </ul>
                        </div>
                      )}
                      
                      {form.watch('method') === 'single' && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Personal Saving Tips
                          </h4>
                          <ul className="text-sm space-y-2">
                            <li>• Set up automatic transfers on payday</li>
                            <li>• Use the envelope method for cash savings</li>
                            <li>• Track your progress regularly</li>
                            <li>• Celebrate small milestones</li>
                            <li>• Try the 50/30/20 rule (needs/wants/savings)</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <PiggyBank className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Implementation Planning</h3>
                          <p className="text-muted-foreground">Getting ready to start your savings journey</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-4">Your Savings Plan Summary</h4>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Saving for:</span>
                            <span className="font-medium">{form.watch('title') || 'Not specified'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total goal:</span>
                            <span className="font-medium">${form.watch('target') || '0'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contributing:</span>
                            <span className="font-medium">
                              ${form.watch('amount') || '0'} {form.watch('frequency')}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Saving method:</span>
                            <span className="font-medium capitalize">{form.watch('method')}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time to reach goal:</span>
                            <span className="font-medium">
                              {form.watch('amount') && form.watch('target') 
                                ? `${Math.ceil(form.watch('target') / form.watch('amount'))} ${form.watch('frequency') === 'daily' ? 'days' : form.watch('frequency') === 'weekly' ? 'weeks' : 'months'}`
                                : 'Calculate your contribution'
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h5 className="font-medium mb-2">Implementation Tips:</h5>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>Set up a designated savings account or container</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>Schedule automatic transfers if possible</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>Create visual reminders of your saving goal</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>Plan a small reward for hitting each 25% milestone</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Hourglass className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Monitoring & Adjusting</h3>
                          <p className="text-muted-foreground">Planning how to track and update your progress</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-4">Monitoring Strategy</h4>
                        
                        <div className="space-y-4 mb-6">
                          <p>Based on your {form.watch('frequency')} savings of ${form.watch('amount') || '0'}, we recommend:</p>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">Check-in Schedule</h5>
                            {form.watch('frequency') === 'daily' && (
                              <p>Log your savings daily and review your progress weekly</p>
                            )}
                            {form.watch('frequency') === 'weekly' && (
                              <p>Log your savings weekly and review your progress monthly</p>
                            )}
                            {form.watch('frequency') === 'monthly' && (
                              <p>Log your savings monthly and review your progress quarterly</p>
                            )}
                          </div>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">Adjustment Periods</h5>
                            <p>Plan to evaluate your saving strategy after the first month, then every three months</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              You might need to adjust your contribution amount or frequency based on your experience
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">Progress Tracking</h5>
                            <p>After creating this goal, you'll be able to:</p>
                            <ul className="text-sm mt-2 space-y-1">
                              <li>• Log contributions</li>
                              <li>• View progress charts</li>
                              <li>• See estimated completion date</li>
                              <li>• Set up reminders</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                      </Button>
                    )}
                    
                    {step < 4 ? (
                      <Button type="button" onClick={nextStep}>
                        Continue
                      </Button>
                    ) : (
                      <Button type="submit">
                        Create Savings Goal
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="view">
          <SavingsList />
        </TabsContent>
        
        <TabsContent value="learn">
          <Card>
            <CardHeader>
              <CardTitle>Financial Savings Learning Center</CardTitle>
              <CardDescription>Tips and strategies to help you save more effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-primary" />
                    The 50/30/20 Budget Rule
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Allocate 50% of income to needs, 30% to wants, and 20% to savings
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Simplifies budgeting decisions</li>
                    <li>• Creates a sustainable saving habit</li>
                    <li>• Balances present needs with future goals</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Pay Yourself First
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Automatically save a portion of income before spending on anything else
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Makes saving a priority, not an afterthought</li>
                    <li>• Reduces temptation to spend first</li>
                    <li>• Creates consistent saving habits</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <PiggyBank className="h-5 w-5 mr-2 text-primary" />
                    The Envelope System
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Allocate cash to different envelopes for different expenses
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Creates physical boundaries for spending</li>
                    <li>• Makes overspending immediately visible</li>
                    <li>• Works well for controlling discretionary spending</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Saving Challenges
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Fun savings games to boost motivation
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• 52-Week Challenge: Save increasing amounts each week</li>
                    <li>• No-Spend Challenge: Designate days or weeks with no discretionary spending</li>
                    <li>• Round-Up Challenge: Round all purchases up and save the difference</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SavingsList() {
  // This component would fetch and display the user's savings goals
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Savings Goals</h2>
        <Button asChild>
          <a href="/financial-strategies">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Goal
          </a>
        </Button>
      </div>
      
      <div className="text-center py-16 border rounded-lg bg-muted/20">
        <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No savings goals yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start your saving journey by creating your first goal. It's the first step toward financial success!
        </p>
        <Button asChild>
          <a href="/financial-strategies">Create Your First Savings Goal</a>
        </Button>
      </div>
    </div>
  );
}
