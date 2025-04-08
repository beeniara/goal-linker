import React, { useState } from 'react';
import { LoanForm } from '@/components/loans/LoanForm';
import { LoanList } from '@/components/loans/LoanList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const Loans: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Loans</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Hide Form' : 'New Loan'}
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <LoanForm />
        </div>
      )}

      <LoanList />
    </div>
  );
}; 