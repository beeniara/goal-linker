export interface Loan {
  id: string;
  name: string;
  description: string;
  amount: number;
  paidAmount: number;
  interestRate: number;
  startDate: Date;
  dueDate: Date | null;
  status: 'active' | 'paid' | 'overdue';
  lenderId: string;
  borrowerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanWithId extends Loan {
  id: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: Date;
  notes: string | null;
  createdAt: Date;
}

export interface LoanPaymentWithId extends LoanPayment {
  id: string;
} 