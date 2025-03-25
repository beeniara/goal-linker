
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { User, Users } from 'lucide-react';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface StepTwoProps {
  form: UseFormReturn<SavingsGoalFormValues>;
}

export function StepTwo({ form }: StepTwoProps) {
  return (
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
  );
}
