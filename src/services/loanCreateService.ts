import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Loan } from '../types/loans';

export interface CreateLoanData {
  name: string;
  description: string;
  amount: number;
  interestRate: number;
  startDate: Date;
  dueDate: Date | null;
  lenderId: string;
  borrowerId: string;
}

export const createLoan = async (loanData: CreateLoanData): Promise<string> => {
  try {
    const loansRef = collection(db, 'loans');
    const loanWithTimestamps = {
      ...loanData,
      paidAmount: 0,
      status: 'active' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(loansRef, loanWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw new Error('Failed to create loan. Please try again.');
  }
}; 