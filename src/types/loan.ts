export interface BorrowerData {
  amount: number;
  paidAmount: number;
  status: 'active' | 'paid' | 'overdue';
}

export interface Loan {
  name: string;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  startDate: Date;
  dueDate?: Date;
  status: 'active' | 'paid' | 'overdue';
  lenderId: string;
  borrowers: { [borrowerId: string]: BorrowerData };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanWithId extends Loan {
  id: string;
}

export interface LoanPayment {
  loanId: string;
  borrowerId: string;
  amount: number;
  interest: number;
  totalAmount: number;
  paymentDate: Date;
  note: string;
  createdAt: Date;
}

export interface LoanPaymentWithId extends LoanPayment {
  id: string;
}

export interface LoanTransaction {
  loanId: string;
  type: 'payment' | 'loan_created' | 'borrower_added' | 'status_change';
  amount: number;
  borrowerId: string;
  timestamp: Date;
  description: string;
  createdAt: Date;
}

export interface LoanTransactionWithId extends LoanTransaction {
  id: string;
} 