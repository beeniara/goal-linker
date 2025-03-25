
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';

export async function createSavingsGoal(
  userId: string, 
  data: SavingsGoalFormValues
) {
  const savingsId = uuidv4();
  
  await setDoc(doc(db, 'savings', savingsId), {
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
  });
  
  return savingsId;
}
