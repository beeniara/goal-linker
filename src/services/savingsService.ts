
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  target: number;
  frequency: string;
  contributionAmount: number;
  method: 'individual' | 'group';
  current: number;
  createdAt: any;
  updatedAt: any;
  contributions: Array<{
    id: string;
    userId: string;
    amount: number;
    note: string;
    createdAt: any;
  }>;
  members: string[];
  completed: boolean;
}

/**
 * Creates a new savings goal in Firestore
 * @param userId - The ID of the user creating the goal
 * @param data - The savings goal form data
 * @returns The ID of the newly created savings goal
 */
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
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Retrieves all savings goals for a specific user
 * @param userId - The ID of the user whose goals to fetch
 * @returns An array of savings goal objects
 */
export async function getUserSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  try {
    console.log("Fetching savings goals for user:", userId);
    
    const savingsRef = collection(db, 'savings');
    
    const q = query(savingsRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    
    const goals = querySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as SavingsGoal;
    });
    
    console.log(`Found ${goals.length} savings goals for user ${userId}`);
    return goals;
  } catch (error) {
    console.error("Error fetching user savings goals:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Retrieves a single savings goal by its ID
 * @param goalId - The ID of the savings goal to retrieve
 * @returns The savings goal object or null if not found
 */
export async function getSavingsGoalById(goalId: string): Promise<SavingsGoal | null> {
  try {
    console.log("Fetching savings goal with ID:", goalId);
    
    const goalRef = doc(db, 'savings', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      console.log("No savings goal found with ID:", goalId);
      return null;
    }
    
    const goalData = goalDoc.data();
    console.log("Retrieved savings goal:", goalData);
    
    return {
      id: goalDoc.id,
      ...goalData
    } as SavingsGoal;
  } catch (error) {
    console.error("Error fetching savings goal by ID:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Adds a contribution to a savings goal
 * @param goalId - The ID of the savings goal
 * @param userId - The ID of the user making the contribution
 * @param amount - The amount being contributed
 * @param note - Optional note for the contribution
 * @returns The updated savings goal data
 */
export async function addContribution(
  goalId: string,
  userId: string,
  amount: number,
  note: string = ''
): Promise<SavingsGoal> {
  try {
    console.log(`Adding contribution of $${amount} to goal ${goalId} by user ${userId}`);
    
    const goalRef = doc(db, 'savings', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      throw new Error(`Savings goal with ID ${goalId} not found`);
    }
    
    const goalData = goalDoc.data();
    
    const contributionId = uuidv4();
    const now = new Date();
    const contribution = {
      id: contributionId,
      userId,
      amount,
      note,
      createdAt: Timestamp.fromDate(now)
    };
    
    const newCurrentAmount = (goalData.current || 0) + amount;
    const isCompleted = newCurrentAmount >= goalData.target;
    
    await updateDoc(goalRef, {
      current: newCurrentAmount,
      contributions: [...(goalData.contributions || []), contribution],
      updatedAt: serverTimestamp(),
      completed: isCompleted
    });
    
    const updatedGoalDoc = await getDoc(goalRef);
    
    if (!updatedGoalDoc.exists()) {
      throw new Error("Failed to retrieve updated goal data");
    }
    
    return {
      id: updatedGoalDoc.id,
      ...updatedGoalDoc.data()
    } as SavingsGoal;
  } catch (error) {
    console.error("Error adding contribution:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}
