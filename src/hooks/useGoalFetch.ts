
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function useGoalFetch(goalId: string | undefined) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [goalTitle, setGoalTitle] = useState('');
  const [fetchingGoal, setFetchingGoal] = useState(true);

  useEffect(() => {
    const fetchGoal = async () => {
      if (!goalId || !currentUser) return;
      
      try {
        const goalDoc = await getDoc(doc(db, 'goals', goalId));
        if (goalDoc.exists()) {
          setGoalTitle(goalDoc.data().title);
        } else {
          toast({
            title: 'Error',
            description: 'Goal not found',
            variant: 'destructive',
          });
          navigate('/goals');
        }
      } catch (error) {
        console.error('Error fetching goal:', error);
        toast({
          title: 'Error',
          description: 'Failed to load goal details',
          variant: 'destructive',
        });
      } finally {
        setFetchingGoal(false);
      }
    };

    fetchGoal();
  }, [currentUser, goalId, navigate]);

  return { goalTitle, fetchingGoal };
}
