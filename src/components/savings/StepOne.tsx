
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Target } from 'lucide-react'; // Lucide icon import
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Props interface for StepOne component
interface StepOneProps {
  form: UseFormReturn<SavingsGoalFormValues>; // The form context from react-hook-form
}

/**
 * StepOne Component - First step in the savings goal creation process
 * Handles the basic info about the savings goal (title, description, target amount, etc.)
 */
export function StepOne({ form }: StepOneProps) {
  return (
    <div className="space-y-6">
      {/* Header section with icon */}
      <div className="flex items-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full mr-4">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Define Your Purpose</h3>
          <p className="text-muted-foreground">Let's identify what you're saving for and set a target</p>
        </div>
      </div>

      {/* Title field - What the user is saving for */}
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
      
      {/* Optional description field */}
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
      
      {/* Total goal amount field */}
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
      
      {/* Contribution frequency and amount section - using a 2-column grid on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Frequency selection dropdown */}
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
        
        {/* Contribution amount field */}
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
  );
}
