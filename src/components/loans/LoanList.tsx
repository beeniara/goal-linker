import React, { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { getLoans, getPayments, addPayment, updateLoan } from '@/services/loanService';
import { LoanWithId, LoanPayment } from '@/types/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export const LoanList: React.FC = () => {
  const [loans, setLoans] = useState<LoanWithId[]>([]);
  const [payments, setPayments] = useState<Record<string, LoanPayment[]>>({});
  const [newPayment, setNewPayment] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchLoans = async () => {
      if (!auth.currentUser) return;
      const userLoans = await getLoans(auth.currentUser.uid);
      setLoans(userLoans);
      
      // Fetch payments for each loan
      const paymentsMap: Record<string, LoanPayment[]> = {};
      for (const loan of userLoans) {
        const loanPayments = await getPayments(loan.id);
        paymentsMap[loan.id] = loanPayments;
      }
      setPayments(paymentsMap);
    };

    fetchLoans();
  }, []);

  const handleAddPayment = async (loanId: string) => {
    if (!auth.currentUser) return;
    const amount = newPayment[loanId];
    if (!amount || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addPayment({
        loanId,
        amount,
        paymentDate: new Date(),
      });

      // Update loan's paid amount
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        const newPaidAmount = loan.paidAmount + amount;
        await updateLoan(loanId, {
          paidAmount: newPaidAmount,
          status: newPaidAmount >= loan.amount ? 'paid' : 'active',
        });

        // Refresh loans and payments
        const updatedLoans = await getLoans(auth.currentUser.uid);
        setLoans(updatedLoans);
        const updatedPayments = await getPayments(loanId);
        setPayments(prev => ({ ...prev, [loanId]: updatedPayments }));
        setNewPayment(prev => ({ ...prev, [loanId]: 0 }));
      }

      toast({
        title: 'Success',
        description: 'Payment added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add payment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {loans.map((loan) => (
        <div key={loan.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{loan.name}</h3>
              <p className="text-sm text-gray-500">{loan.description}</p>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${
              loan.status === 'paid' ? 'bg-green-100 text-green-800' :
              loan.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {loan.status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold">${loan.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="font-semibold">${loan.paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="font-semibold">${(loan.amount - loan.paidAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interest Rate</p>
              <p className="font-semibold">{loan.interestRate || 0}%</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter payment amount"
                value={newPayment[loan.id] || ''}
                onChange={(e) => setNewPayment(prev => ({
                  ...prev,
                  [loan.id]: Number(e.target.value)
                }))}
              />
              <Button
                onClick={() => handleAddPayment(loan.id)}
                disabled={loan.status === 'paid'}
              >
                Add Payment
              </Button>
            </div>
          </div>

          {payments[loan.id]?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Payment History</h4>
              <div className="space-y-2">
                {payments[loan.id].map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span>{format(new Date(payment.paymentDate), 'MMM d, yyyy')}</span>
                    <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 