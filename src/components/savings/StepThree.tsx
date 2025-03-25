
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PiggyBank } from 'lucide-react';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';

interface StepThreeProps {
  form: UseFormReturn<SavingsGoalFormValues>;
}

export function StepThree({ form }: StepThreeProps) {
  return (
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
  );
}
