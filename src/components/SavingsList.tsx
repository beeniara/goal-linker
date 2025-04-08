import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SavingsWithId } from '../types/savings';
import { useAuth } from '../contexts/AuthContext';
import { savingsService } from '../services/savingsService';

export const SavingsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [savings, setSavings] = useState<SavingsWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'savings'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const savingsData: SavingsWithId[] = [];
        snapshot.forEach((doc) => {
          savingsData.push({ id: doc.id, ...doc.data() } as SavingsWithId);
        });
        setSavings(savingsData);
        setLoading(false);
      },
      (err) => {
        setError('Error fetching savings: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Savings</h2>
      {savings.length === 0 ? (
        <p>No savings found. Create a new savings goal to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savings.map((saving) => (
            <div key={saving.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-xl font-semibold">{saving.name}</h3>
              <p className="text-gray-600">{saving.description}</p>
              <div className="mt-2">
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span>
                    {saving.currentAmount} / {saving.targetAmount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${(saving.currentAmount / saving.targetAmount) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Members: {saving.members.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 