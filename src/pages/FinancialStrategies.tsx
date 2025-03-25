
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { savingsGoalSchema, SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';
import { createSavingsGoal } from '@/services/savingsService';

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
import { AlertCircle } from 'lucide-react';

// Import our new components
import { StepOne } from '@/components/savings/StepOne';
import { StepTwo } from '@/components/savings/StepTwo';
import { StepThree } from '@/components/savings/StepThree';
import { StepFour } from '@/components/savings/StepFour';
import { SavingsList } from '@/components/savings/SavingsList';
import { LearningCenter } from '@/components/savings/LearningCenter';

export default function FinancialStrategies() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues: Partial<SavingsGoalFormValues> = {
    frequency: "weekly",
    method: "single",
  };

  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues,
  });

  const onSubmit = async (data: SavingsGoalFormValues) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a savings goal.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createSavingsGoal(currentUser.uid, data);

      toast({
        title: "Success!",
        description: "Your savings goal has been created.",
      });

      navigate('/savings');
    } catch (error) {
      console.error("Error creating savings goal:", error);
      setError("Failed to create savings goal. Please ensure you have proper permissions and try again.");
      toast({
        title: "Error",
        description: "Failed to create savings goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

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
                  {step === 1 && <StepOne form={form} />}
                  {step === 2 && <StepTwo form={form} />}
                  {step === 3 && <StepThree form={form} />}
                  {step === 4 && <StepFour form={form} />}
                  
                  <div className="flex justify-between pt-4">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                        Back
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                        Cancel
                      </Button>
                    )}
                    
                    {step < 4 ? (
                      <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                        Continue
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Savings Goal'}
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
          <LearningCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
