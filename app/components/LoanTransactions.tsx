import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { formatCurrency } from '../utils/formatters';

interface Transaction {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  type: 'payment' | 'addition';
  timestamp: Date;
  description: string;
}

interface LoanTransactionsProps {
  loanId: string;
  borrowerId?: string;
}

const LoanTransactions: React.FC<LoanTransactionsProps> = ({ loanId, borrowerId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(db, 'loanTransactions');
        let transactionQuery;

        if (borrowerId) {
          transactionQuery = query(
            transactionsRef,
            where('loanId', '==', loanId),
            where('borrowerId', '==', borrowerId),
            orderBy('timestamp', 'desc')
          );
        } else {
          transactionQuery = query(
            transactionsRef,
            where('loanId', '==', loanId),
            orderBy('timestamp', 'desc')
          );
        }

        const querySnapshot = await getDocs(transactionQuery);
        const transactionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as Transaction[];

        setTransactions(transactionData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [loanId, borrowerId]);

  if (loading) {
    return <div className="p-4">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="p-4 text-gray-500">No transactions found.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Transaction History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.timestamp.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'payment'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanTransactions; 