
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Hourglass } from 'lucide-react';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';

interface StepFourProps {
  form: UseFormReturn<SavingsGoalFormValues>;
}

export function StepFour({ form }: StepFourProps) {
  return (
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
  );
}
