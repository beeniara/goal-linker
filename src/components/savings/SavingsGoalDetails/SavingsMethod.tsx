
import React from 'react';
import { User, Calendar } from 'lucide-react';

interface SavingsMethodProps {
  method: string;
  contributionAmount: number;
  frequency: string;
  formatCurrency: (amount: number) => string;
}

export const SavingsMethod: React.FC<SavingsMethodProps> = ({
  method,
  contributionAmount,
  frequency,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Savings Method</h3>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="capitalize">{method}</span>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Contribution Plan</h3>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>
            {formatCurrency(contributionAmount)} every {frequency}
          </span>
        </div>
      </div>
    </div>
  );
};
