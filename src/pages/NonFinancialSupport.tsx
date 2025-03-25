
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
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  User,
  Calendar,
  Target,
  PlusCircle,
  BrainCircuit,
  MessageSquare,
  ImageIcon,
  Bell,
} from 'lucide-react';

// Form validation schema
const supportStrategySchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  strategyType: z.enum(["motivation", "accountability", "visualization", "reminder"]),
  method: z.enum(["single", "group"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  notes: z.string().optional(),
});

type SupportStrategyFormValues = z.infer<typeof supportStrategySchema>;

export default function NonFinancialSupport() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('create');

  const defaultValues: Partial<SupportStrategyFormValues> = {
    frequency: "weekly",
    method: "single",
    strategyType: "motivation",
  };

  const form = useForm<SupportStrategyFormValues>({
    resolver: zodResolver(supportStrategySchema),
    defaultValues,
  });

  const onSubmit = async (data: SupportStrategyFormValues) => {
    if (!currentUser) return;

    try {
      const strategyId = uuidv4();
      await setDoc(doc(db, 'supportStrategies', strategyId), {
        id: strategyId,
        userId: currentUser.uid,
        title: data.title,
        description: data.description || '',
        strategyType: data.strategyType,
        method: data.method,
        frequency: data.frequency,
        notes: data.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        checkIns: [],
        members: data.method === 'group' ? [currentUser.uid] : [],
        active: true,
      });

      toast({
        title: "Success!",
        description: "Your support strategy has been created.",
      });

      navigate('/support-strategies');
    } catch (error) {
      console.error("Error creating support strategy:", error);
      toast({
        title: "Error",
        description: "Failed to create support strategy. Please try again.",
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
      <h1 className="text-3xl font-bold mb-6">Non-Financial Support Strategies</h1>

      <Tabs defaultValue="create" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="create">Create New Support Strategy</TabsTrigger>
          <TabsTrigger value="view">View My Strategies</TabsTrigger>
          <TabsTrigger value="learn">Learning Center</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Create Support Strategy</CardTitle>
                  <CardDescription>
                    Follow these steps to set up your non-financial support strategy
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
                          <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Define Non-Financial Support</h3>
                          <p className="text-muted-foreground">Let's identify what kind of support you need</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strategy Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Daily Motivation, Weekly Accountability" {...field} />
                            </FormControl>
                            <FormDescription>
                              Give your support strategy a meaningful name
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
                              <Textarea 
                                placeholder="How this strategy will help your savings goals" 
                                {...field} 
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="strategyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strategy Type</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'motivation' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('motivation')}
                              >
                                <div className="flex items-center mb-2">
                                  <Heart className="h-5 w-5 mr-2 text-rose-500" />
                                  <h4 className="font-medium">Motivation</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Strategies to keep you inspired and excited about your saving goals
                                </p>
                              </div>
                              
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'accountability' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('accountability')}
                              >
                                <div className="flex items-center mb-2">
                                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                                  <h4 className="font-medium">Accountability</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Systems to help you stay committed to your savings plan
                                </p>
                              </div>
                              
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'visualization' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('visualization')}
                              >
                                <div className="flex items-center mb-2">
                                  <ImageIcon className="h-5 w-5 mr-2 text-purple-500" />
                                  <h4 className="font-medium">Visualization</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Tools to help you visualize your progress and end goal
                                </p>
                              </div>
                              
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'reminder' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('reminder')}
                              >
                                <div className="flex items-center mb-2">
                                  <Bell className="h-5 w-5 mr-2 text-amber-500" />
                                  <h4 className="font-medium">Reminders</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Regular prompts to keep your savings goals top of mind
                                </p>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How often do you want to use this strategy?</FormLabel>
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
                            <FormDescription>
                              How frequently you'll engage with this support strategy
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Choose Support Method</h3>
                          <p className="text-muted-foreground">Decide if you want individual or group support</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Method</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'single' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('single')}
                              >
                                <div className="flex items-center mb-2">
                                  <User className="h-5 w-5 mr-2 text-primary" />
                                  <h4 className="font-medium">Individual Support</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Self-directed strategies that you'll implement on your own
                                </p>
                                <ul className="mt-3 text-sm space-y-1">
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Personal reflection time
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Self-motivated tools
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Private goal tracking
                                  </li>
                                </ul>
                              </div>
                              
                              <div 
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'group' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => field.onChange('group')}
                              >
                                <div className="flex items-center mb-2">
                                  <Users className="h-5 w-5 mr-2 text-primary" />
                                  <h4 className="font-medium">Group Support</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Invite friends or family for encouragement (not financial contributions)
                                </p>
                                <ul className="mt-3 text-sm space-y-1">
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Mutual encouragement
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Shared accountability
                                  </li>
                                  <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Community celebration
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('method') === 'single' && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2">Individual Support Recommendations</h4>
                          
                          {form.watch('strategyType') === 'motivation' && (
                            <ul className="text-sm space-y-2">
                              <li>• Create a vision board with images of your goal</li>
                              <li>• Write a letter to your future self about why this goal matters</li>
                              <li>• Set up a "motivation jar" with quotes to read when needed</li>
                              <li>• Schedule regular progress celebration moments</li>
                            </ul>
                          )}
                          
                          {form.watch('strategyType') === 'accountability' && (
                            <ul className="text-sm space-y-2">
                              <li>• Keep a detailed savings journal</li>
                              <li>• Set up calendar reminders for regular check-ins</li>
                              <li>• Create a habit tracker for your savings contributions</li>
                              <li>• Publicly commit to your goal (social media, blog)</li>
                            </ul>
                          )}
                          
                          {form.watch('strategyType') === 'visualization' && (
                            <ul className="text-sm space-y-2">
                              <li>• Create a visual progress tracker (thermometer chart)</li>
                              <li>• Make a digital vision board for your device backgrounds</li>
                              <li>• Take before/during/after photos of your journey</li>
                              <li>• Use a goal-tracking app with visual elements</li>
                            </ul>
                          )}
                          
                          {form.watch('strategyType') === 'reminder' && (
                            <ul className="text-sm space-y-2">
                              <li>• Set up automated notifications on your phone</li>
                              <li>• Place physical reminders in strategic locations</li>
                              <li>• Create calendar events for regular check-ins</li>
                              <li>• Use sticky notes in places you'll see daily</li>
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {form.watch('method') === 'group' && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2">Group Support Recommendations</h4>
                          
                          {form.watch('strategyType') === 'motivation' && (
                            <ul className="text-sm space-y-2">
                              <li>• Create a group chat for sharing wins and struggles</li>
                              <li>• Schedule regular video catch-ups to share progress</li>
                              <li>• Exchange motivational messages or quotes</li>
                              <li>• Plan celebrations for when major milestones are reached</li>
                            </ul>
                          )}
                          
                          {form.watch('strategyType') === 'accountability' && (
                            <ul className="text-sm space-y-2">
                              <li>• Set up weekly check-ins with accountability partners</li>
                              <li>• Create shared tracking documents to monitor progress</li>
                              <li>• Establish friendly competitions or challenges</li>
                              <li>• Implement a buddy system for regular check-ins</li>
                            </ul>
                          )}
                          
                          {form.watch('strategyType') === 'visualization' && (
                            <ul className="text-sm space-y-2">
                              <li>• Create a shared digital vision board</li>
                              <li>• Exchange photos of progress or inspiration</li>
                              <li>• Schedule group visualization sessions</li>
                              <li>• Share before/during progress photos</li>
                            </ul>
                          )}
                          
                          {form.watch('strategyType') === 'reminder' && (
                            <ul className="text-sm space-y-2">
                              <li>• Schedule group check-in calls or messages</li>
                              <li>• Assign rotating reminder roles within the group</li>
                              <li>• Create shared calendar events</li>
                              <li>• Use an app that allows for group notifications</li>
                            </ul>
                          )}
                        </div>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any specific ideas or customizations for your strategy" 
                                {...field} 
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Implementation Planning</h3>
                          <p className="text-muted-foreground">Getting ready to implement your support strategy</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-4">Implementation Steps</h4>
                        
                        <div className="space-y-4">
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">1. Preparation</h5>
                            <ul className="text-sm space-y-2">
                              {form.watch('strategyType') === 'motivation' && (
                                <>
                                  <li>• Gather materials for a vision board or motivation tools</li>
                                  <li>• Set aside time in your schedule for motivation activities</li>
                                  <li>• Identify your personal motivators and rewards</li>
                                </>
                              )}
                              
                              {form.watch('strategyType') === 'accountability' && (
                                <>
                                  <li>• Create or purchase a tracking journal or tool</li>
                                  <li>• Schedule regular check-in times on your calendar</li>
                                  <li>• Define what "success" looks like for each check-in</li>
                                </>
                              )}
                              
                              {form.watch('strategyType') === 'visualization' && (
                                <>
                                  <li>• Collect images that represent your savings goal</li>
                                  <li>• Find or create a progress tracking template</li>
                                  <li>• Set up a physical or digital space for your visualizations</li>
                                </>
                              )}
                              
                              {form.watch('strategyType') === 'reminder' && (
                                <>
                                  <li>• Set up notification systems on your devices</li>
                                  <li>• Create or purchase physical reminders</li>
                                  <li>• Identify key locations for placing reminder cues</li>
                                </>
                              )}
                            </ul>
                          </div>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">2. Initial Setup</h5>
                            <ul className="text-sm space-y-2">
                              {form.watch('method') === 'single' && (
                                <>
                                  <li>• Create your personal support system</li>
                                  <li>• Set up any digital tools or physical items needed</li>
                                  <li>• Establish a regular routine for engaging with your strategy</li>
                                </>
                              )}
                              
                              {form.watch('method') === 'group' && (
                                <>
                                  <li>• Identify and invite 2-5 supportive individuals</li>
                                  <li>• Establish group communication channels</li>
                                  <li>• Set clear expectations for everyone's involvement</li>
                                </>
                              )}
                            </ul>
                          </div>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">3. Regular Engagement</h5>
                            <ul className="text-sm space-y-2">
                              <li>• Follow your {form.watch('frequency')} engagement schedule</li>
                              <li>• Document your experiences and feelings</li>
                              <li>• Adjust your approach as needed based on what works</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center mb-6">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <BrainCircuit className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Monitoring & Adjusting</h3>
                          <p className="text-muted-foreground">Planning how to keep your strategy effective</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold text-lg mb-4">Monitoring Strategy</h4>
                        
                        <div className="space-y-4 mb-6">
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">Success Indicators</h5>
                            <p className="text-sm">How will you know if this strategy is working?</p>
                            <ul className="text-sm mt-2 space-y-1">
                              <li>• You feel more motivated toward your savings goal</li>
                              <li>• You're making consistent contributions</li>
                              <li>• You think about your goal more frequently</li>
                              <li>• You're making progress faster than before</li>
                            </ul>
                          </div>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">Adjustment Periods</h5>
                            <p className="text-sm">
                              Plan to evaluate your support strategy after two weeks, then monthly
                            </p>
                            <p className="text-sm mt-2">
                              Ask yourself: Is this still motivating? Does it fit into my routine? 
                              What could make it more effective?
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-md p-4">
                            <h5 className="font-medium mb-2">After Creating This Strategy</h5>
                            <p className="text-sm">You'll be able to:</p>
                            <ul className="text-sm mt-2 space-y-1">
                              <li>• Log your interactions with the strategy</li>
                              <li>• Invite support members (if group method)</li>
                              <li>• Track how the strategy affects your savings</li>
                              <li>• Make adjustments as needed</li>
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
                        Create Support Strategy
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="view">
          <StrategiesList />
        </TabsContent>
        
        <TabsContent value="learn">
          <Card>
            <CardHeader>
              <CardTitle>Non-Financial Support Learning Center</CardTitle>
              <CardDescription>Tips and strategies to help you stay motivated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-rose-500" />
                    The "Single Drop" Philosophy
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Small, consistent efforts adding up to significant results over time
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Focuses on daily small actions</li>
                    <li>• Builds momentum through consistency</li>
                    <li>• Makes large goals feel manageable</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Visualization Techniques
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Using mental imagery to strengthen motivation and commitment
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Creates emotional connection to your goal</li>
                    <li>• Activates same brain regions as actual experience</li>
                    <li>• Reinforces the "why" behind your saving</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    The Accountability Effect
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    How sharing goals with others dramatically increases success rates
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Creates social commitment to your goals</li>
                    <li>• Provides external motivation</li>
                    <li>• Offers support during challenging times</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                    Positive Self-Talk
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    How changing your internal dialogue affects saving behavior
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Reframes saving as empowering rather than restrictive</li>
                    <li>• Builds resilience against impulse spending</li>
                    <li>• Creates positive associations with financial discipline</li>
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

function StrategiesList() {
  // This component would fetch and display the user's support strategies
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Support Strategies</h2>
        <Button asChild>
          <a href="/non-financial-support">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Strategy
          </a>
        </Button>
      </div>
      
      <div className="text-center py-16 border rounded-lg bg-muted/20">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No support strategies yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create your first non-financial support strategy to boost your motivation and savings success!
        </p>
        <Button asChild>
          <a href="/non-financial-support">Create Your First Strategy</a>
        </Button>
      </div>
    </div>
  );
}
