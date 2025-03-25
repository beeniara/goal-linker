
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';

export async function createSavingsGoal(
  userId: string, 
  data: SavingsGoalFormValues
) {
  try {
    console.log("Creating savings goal for user:", userId);
    console.log("Savings goal data:", data);
    
    const savingsId = uuidv4();
    const savingsRef = doc(db, 'savings', savingsId);
    
    const savingsData = {
      id: savingsId,
      userId: userId,
      title: data.title,
      description: data.description || '',
      target: data.target,
      frequency: data.frequency,
      contributionAmount: data.amount,
      method: data.method,
      current: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      contributions: [],
      members: data.method === 'group' ? [userId] : [],
      completed: false,
    };
    
    console.log("Saving document with data:", savingsData);
    
    await setDoc(savingsRef, savingsData);
    console.log("Savings goal created successfully with ID:", savingsId);
    
    return savingsId;
  } catch (error) {
    console.error("Error creating savings goal:", error);
    throw error;
  }
}

// Helper function to get a user's savings goals
export async function getUserSavingsGoals(userId: string) {
  try {
    const savingsRef = collection(db, 'savings');
    const q = query(savingsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user savings goals:", error);
    throw error;
  }
}
