
import React from 'react';
import { DollarSign, Calendar, PiggyBank, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function LearningCenter() {
  return (
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
  );
}
