
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TimeFrame = 'weeks' | 'months' | 'years';

interface SavingsProgressProps {
  current: number;
  target: number;
  contributionAmount: number;
  formatCurrency: (amount: number) => string;
}

export const SavingsProgress: React.FC<SavingsProgressProps> = ({
  current,
  target,
  contributionAmount,
  formatCurrency
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weeks');

  const calculateProgress = (): number => {
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const calculateTimeRemaining = () => {
    const amountLeft = target - current;
    if (amountLeft <= 0) return { value: 0, unit: timeFrame };
    
    const weeksLeft = Math.ceil(amountLeft / contributionAmount);
    
    switch (timeFrame) {
      case 'weeks':
        return { value: weeksLeft, unit: 'weeks' };
      case 'months':
        return { value: Math.ceil(weeksLeft / 4.33), unit: 'months' };
      case 'years':
        return { value: Math.ceil(weeksLeft / 52), unit: 'years' };
      default:
        return { value: weeksLeft, unit: 'weeks' };
    }
  };

  const timeRemaining = calculateTimeRemaining();
  const progress = calculateProgress();

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">
          {formatCurrency(current)} of {formatCurrency(target)}
        </span>
      </div>
      <Progress value={progress} className="h-4" />
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Estimated time remaining:
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {timeRemaining.value} {timeRemaining.unit}
          </span>
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Time unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-sm text-right">
        {progress.toFixed(1)}% Complete
      </div>
    </div>
  );
};
