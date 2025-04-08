import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy, Timestamp, getDoc, runTransaction } from 'firebase/firestore';
import { Loan, LoanPayment, LoanTransaction } from '../types/loan';

const LOANS_COLLECTION = 'loans';
const PAYMENTS_COLLECTION = 'loanPayments';
const TRANSACTIONS_COLLECTION = 'loanTransactions';

export const createLoan = async (loan: Omit<Loan, 'createdAt' | 'updatedAt' | 'remainingAmount'>): Promise<string> => {
  try {
    const now = new Date();
    const loanData = {
      ...loan,
      remainingAmount: loan.totalAmount,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, LOANS_COLLECTION), loanData);

    // Create transaction record
    await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      loanId: docRef.id,
      type: 'loan_created',
      amount: loan.totalAmount,
      borrowerId: Object.keys(loan.borrowers)[0],
      timestamp: now,
      description: `Loan created for ${loan.name}`,
      createdAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating loan:', error);
    throw new Error('Failed to create loan');
  }
};

export const addBorrowerToLoan = async (
  loanId: string,
  borrowerId: string,
  amount: number
): Promise<void> => {
  try {
    const loanRef = doc(db, LOANS_COLLECTION, loanId);
    const now = new Date();

    await runTransaction(db, async (transaction) => {
      const loanDoc = await transaction.get(loanRef);
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loanData = loanDoc.data();
      if (borrowerId in loanData.borrowers) {
        throw new Error('Borrower already exists in this loan');
      }

      const updatedBorrowers = {
        ...loanData.borrowers,
        [borrowerId]: {
          amount,
          paidAmount: 0,
          status: 'active'
        }
      };

      const updatedRemainingAmount = loanData.remainingAmount + amount;

      transaction.update(loanRef, {
        borrowers: updatedBorrowers,
        remainingAmount: updatedRemainingAmount,
        updatedAt: now
      });

      // Create transaction record
      const transactionData = {
        loanId,
        type: 'borrower_added',
        amount,
        borrowerId,
        timestamp: now,
        description: `Added borrower with loan amount of ${amount}`,
        createdAt: now,
      };
      transaction.set(doc(collection(db, TRANSACTIONS_COLLECTION)), transactionData);
    });
  } catch (error) {
    console.error('Error adding borrower to loan:', error);
    throw new Error('Failed to add borrower to loan');
  }
};

export const makePayment = async (payment: Omit<LoanPayment, 'createdAt'>): Promise<string> => {
  try {
    const now = new Date();
    const loanRef = doc(db, LOANS_COLLECTION, payment.loanId);

    let paymentId: string;

    await runTransaction(db, async (transaction) => {
      const loanDoc = await transaction.get(loanRef);
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loanData = loanDoc.data();
      const borrowerData = loanData.borrowers[payment.borrowerId];

      if (!borrowerData) {
        throw new Error('Borrower not found in this loan');
      }

      if (borrowerData.status === 'paid') {
        throw new Error('Loan is already paid');
      }

      const newPaidAmount = borrowerData.paidAmount + payment.amount;
      if (newPaidAmount > borrowerData.amount) {
        throw new Error('Payment amount exceeds remaining loan amount');
      }

      // Update borrower data
      const updatedBorrowers = {
        ...loanData.borrowers,
        [payment.borrowerId]: {
          ...borrowerData,
          paidAmount: newPaidAmount,
          status: newPaidAmount === borrowerData.amount ? 'paid' : 'active'
        }
      };

      // Update loan data
      const newRemainingAmount = loanData.remainingAmount - payment.amount;
      const updates = {
        borrowers: updatedBorrowers,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount === 0 ? 'paid' : loanData.status,
        updatedAt: now
      };

      transaction.update(loanRef, updates);

      // Create payment record
      const paymentData = {
        ...payment,
        createdAt: now
      };
      const paymentRef = doc(collection(db, PAYMENTS_COLLECTION));
      transaction.set(paymentRef, paymentData);
      paymentId = paymentRef.id;

      // Create transaction record
      const transactionData = {
        loanId: payment.loanId,
        type: 'payment',
        amount: payment.amount,
        borrowerId: payment.borrowerId,
        timestamp: now,
        description: payment.note || 'Loan payment',
        createdAt: now,
      };
      transaction.set(doc(collection(db, TRANSACTIONS_COLLECTION)), transactionData);
    });

    return paymentId;
  } catch (error) {
    console.error('Error making payment:', error);
    throw new Error('Failed to make payment');
  }
};

export const getLoans = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, LOANS_COLLECTION),
      where('borrowers', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting loans:', error);
    throw new Error('Failed to get loans');
  }
};

export const getLenderLoans = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, LOANS_COLLECTION),
      where('lenderId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting lender loans:', error);
    throw new Error('Failed to get lender loans');
  }
};

export const getLoansByStatus = async (status: 'active' | 'paid' | 'overdue'): Promise<any[]> => {
  const q = query(
    collection(db, LOANS_COLLECTION),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateLoan = async (loanId: string, updates: Partial<Loan>): Promise<void> => {
  const loanRef = doc(db, LOANS_COLLECTION, loanId);
  await updateDoc(loanRef, {
    ...updates,
    updatedAt: new Date()
  });
};

export const deleteLoan = async (loanId: string): Promise<void> => {
  const loanRef = doc(db, LOANS_COLLECTION, loanId);
  await deleteDoc(loanRef);
};

export const getPayments = async (loanId: string, borrowerId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('loanId', '==', loanId),
      where('borrowerId', '==', borrowerId),
      orderBy('paymentDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting payments:', error);
    throw new Error('Failed to get payments');
  }
};

export const getTransactionHistory = async (loanId: string, borrowerId?: string): Promise<any[]> => {
  try {
    let q;
    if (borrowerId) {
      q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('loanId', '==', loanId),
        where('borrowerId', '==', borrowerId),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('loanId', '==', loanId),
        orderBy('timestamp', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw new Error('Failed to get transaction history');
  }
};

export const updateLoanStatus = async (loanId: string, status: 'active' | 'paid' | 'overdue'): Promise<void> => {
  try {
    const now = new Date();
    const loanRef = doc(db, LOANS_COLLECTION, loanId);

    await runTransaction(db, async (transaction) => {
      const loanDoc = await transaction.get(loanRef);
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      transaction.update(loanRef, {
        status,
        updatedAt: now
      });

      // Create transaction record
      const transactionData = {
        loanId,
        type: 'status_change',
        amount: 0,
        borrowerId: Object.keys(loanDoc.data().borrowers)[0],
        timestamp: now,
        description: `Loan status updated to ${status}`,
        createdAt: now,
      };
      transaction.set(doc(collection(db, TRANSACTIONS_COLLECTION)), transactionData);
    });
  } catch (error) {
    console.error('Error updating loan status:', error);
    throw new Error('Failed to update loan status');
  }
};

export const calculateInterest = (loan: Loan, paymentDate: Date): number => {
  if (!loan.interestRate || loan.interestRate === 0) return 0;
  
  const startDate = loan.startDate instanceof Timestamp ? loan.startDate.toDate() : new Date(loan.startDate);
  const days = Math.max(0, Math.floor((paymentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyRate = loan.interestRate / 36500; // Convert annual rate to daily rate (percentage)
  const remainingAmount = loan.amount - loan.paidAmount;
  
  return remainingAmount * dailyRate * days;
};

export const checkAndUpdateOverdueStatus = async (loanId: string): Promise<void> => {
  const loanRef = doc(db, LOANS_COLLECTION, loanId);
  const loanDoc = await getDoc(loanRef);
  const loan = loanDoc.data();
  
  if (!loan || loan.status === 'paid') return;
  
  const now = new Date();
  const dueDate = loan.dueDate instanceof Timestamp ? loan.dueDate.toDate() : new Date(loan.dueDate);
  
  if (dueDate && now > dueDate && loan.status !== 'overdue') {
    await updateDoc(loanRef, {
      status: 'overdue',
      updatedAt: now
    });
  }
}; 