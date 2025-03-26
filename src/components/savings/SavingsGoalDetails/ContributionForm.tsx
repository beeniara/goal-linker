
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addContribution } from '@/services/savingsService';
import { DollarSign } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contributionFormSchema = z.object({
  amount: z.string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" }),
  note: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionFormSchema>;

interface ContributionFormProps {
  savingsId: string;
  userId: string;
  onContributionAdded: (updatedGoal: any) => void;
  onCancel: () => void;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  savingsId,
  userId,
  onContributionAdded,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      amount: '',
      note: '',
    },
  });

  const onSubmit = async (data: ContributionFormValues) => {
    if (!userId || !savingsId) return;

    setLoading(true);
    try {
      const amount = Number(data.amount);
      const updatedGoal = await addContribution(savingsId, userId, amount, data.note || '');
      
      toast({
        title: "Contribution Added",
        description: `$${amount.toFixed(2)} has been added to your savings goal.`,
      });
      
      form.reset();
      onContributionAdded(updatedGoal);
    } catch (error) {
      console.error("Error adding contribution:", error);
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
                disabled={loading}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Contribution"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
