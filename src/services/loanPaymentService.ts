import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LoanPayment, Loan } from '../types/loans';
import { calculateInterest } from './loanService';

export interface CreateLoanPaymentData {
  loanId: string;
  amount: number;
  paymentDate: Date;
  notes?: string;
}

export const createLoanPayment = async (paymentData: CreateLoanPaymentData): Promise<string> => {
  try {
    // Get the loan document
    const loanRef = doc(db, 'loans', paymentData.loanId);
    const loanDoc = await getDoc(loanRef);
    const loanData = loanDoc.data();

    if (!loanData) {
      throw new Error('Loan not found');
    }

    const loan = loanData as Loan;

    if (loan.status === 'paid') {
      throw new Error('Cannot make payment on a paid loan');
    }

    // Calculate interest
    const interest = calculateInterest(loan, paymentData.paymentDate);
    const totalPayment = paymentData.amount + interest;

    // Validate payment amount
    const remainingAmount = loan.amount - loan.paidAmount;
    if (totalPayment > remainingAmount) {
      throw new Error(`Payment amount (${totalPayment}) exceeds remaining loan amount (${remainingAmount})`);
    }

    // Create the payment
    const paymentsRef = collection(db, 'loanPayments');
    const paymentWithTimestamp = {
      ...paymentData,
      interest,
      totalAmount: totalPayment,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(paymentsRef, paymentWithTimestamp);

    // Update the loan's paid amount and status
    const newPaidAmount = loan.paidAmount + paymentData.amount;
    const updates: any = {
      paidAmount: increment(paymentData.amount),
      updatedAt: serverTimestamp(),
    };

    if (newPaidAmount >= loan.amount) {
      updates.status = 'paid';
    }

    await updateDoc(loanRef, updates);

    return docRef.id;
  } catch (error) {
    console.error('Error creating loan payment:', error);
    throw new Error('Failed to create loan payment. Please try again.');
  }
}; 