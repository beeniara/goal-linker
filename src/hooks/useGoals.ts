import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Goal = {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'purchase' | 'general';
  target: number;
  current: number;
  deadline?: Date;
  projectId?: string;
  projectName?: string;
  category?: string;
  milestones?: { title: string; completed: boolean }[];
  members?: string[];
  completed: boolean;
};

export function useGoals() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // This uses onSnapshot to listen for real-time updates
      const goalsRef = collection(db, 'goals');
      const q = query(goalsRef, where('userId', '==', currentUser.uid));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const goalsList: Goal[] = [];
        const projectCache: Record<string, string> = {};
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          if (data) {  // Make sure data exists
            let projectName;
            
            // Get project name if projectId exists
            if (data.projectId) {
              if (projectCache[data.projectId]) {
                projectName = projectCache[data.projectId];
              } else {
                try {
                  const projectDoc = await getDocs(
                    query(collection(db, 'projects'), where('__name__', '==', data.projectId))
                  );
                  if (!projectDoc.empty) {
                    projectName = projectDoc.docs[0].data().title;
                    projectCache[data.projectId] = projectName;
                  }
                } catch (err) {
                  console.error('Error fetching project name:', err);
                }
              }
            }
            
            goalsList.push({
              id: doc.id,
              title: data.title || 'Untitled Goal',
              description: data.description || '',
              type: data.type || 'general',
              target: data.target || 0,
              current: data.current || 0,
              deadline: data.deadline ? data.deadline.toDate() : undefined,
              projectId: data.projectId,
              projectName: projectName,
              category: data.category,
              milestones: data.milestones || [],
              members: data.members || [],
              completed: data.completed || false,
            });
          }
        }
        
        setGoals(goalsList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching goals:', error);
        setError('Failed to load goals. Please check your connection or permissions.');
        toast({
          title: 'Error',
          description: 'Failed to load goals. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      });
      
      // Clean up subscription when component unmounts
      return () => unsubscribe();
      
    } catch (error) {
      console.error('Error setting up goals listener:', error);
      setError('Failed to connect to goals service. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to connect to goals service. Please try again later.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }, [currentUser, toast]);

  // Filter goals based on active tab and search query
  const filteredGoals = goals.filter(goal => {
    if (!goal) return false;
    
    // Filter by tab
    if (activeTab === 'active' && goal.completed) return false;
    if (activeTab === 'completed' && !goal.completed) return false;
    if (activeTab === 'fundraising' && goal.type !== 'fundraising') return false;
    if (activeTab === 'purchase' && goal.type !== 'purchase') return false;
    if (activeTab === 'general' && goal.type !== 'general') return false;
    
    // Filter by search
    if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return {
    goals,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredGoals
  };
}
