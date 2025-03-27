import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where, getDoc, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
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
  invitationId?: string; // Added to track invitation for updates
}

/**
 * Creates a new savings goal in Firestore
 */
export async function createSavingsGoal(userId: string, data: SavingsGoalFormValues) {
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
 */
export async function getUserSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  try {
    console.log("Fetching savings goals for user:", userId);
    
    const savingsRef = collection(db, 'savings');
    const q = query(savingsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const goals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavingsGoal));
    
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
 */
export async function addContribution(goalId: string, userId: string, amount: number, note: string = ''): Promise<SavingsGoal> {
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

/**
 * Adds a member to a savings goal by email using an invitation
 */
export async function addMemberToSavingsGoal(savingsId: string, email: string, invitationId: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Adding member with email ${email} to savings goal ${savingsId} using invitation ${invitationId}`);
    
    // Find the user with the given email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No user found with email ${email}`);
      return {
        success: false,
        message: `No user found with email ${email}. They must sign up first.`
      };
    }
    
    const userId = querySnapshot.docs[0].id;
    console.log(`Found user with ID ${userId} for email ${email}`);
    
    // Check if the savings goal exists
    const goalRef = doc(db, 'savings', savingsId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      console.log(`Savings goal with ID ${savingsId} not found`);
      return {
        success: false,
        message: `Savings goal not found`
      };
    }
    
    const goalData = goalDoc.data();
    
    // Check if the user is already a member
    if (goalData.members && goalData.members.includes(userId)) {
      console.log(`User ${userId} is already a member of savings goal ${savingsId}`);
      return {
        success: false,
        message: `${email} is already a member of this savings goal`
      };
    }
    
    // Verify the invitation
    const invitationRef = doc(db, 'savingsInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      console.log(`Invitation with ID ${invitationId} not found`);
      return {
        success: false,
        message: `Invalid invitation`
      };
    }
    
    const invitationData = invitationDoc.data();
    if (invitationData.status !== 'accepted' || invitationData.inviteeId !== userId) {
      console.log(`Invitation ${invitationId} is not accepted or does not match user ${userId}`);
      return {
        success: false,
        message: `Invitation is not valid or not accepted`
      };
    }
    
    // Update the savings goal with the new member and invitationId
    await updateDoc(goalRef, {
      members: arrayUnion(userId),
      invitationId: invitationId, // Include invitationId in the update
      updatedAt: serverTimestamp()
    });
    
    console.log(`Successfully added user ${userId} to savings goal ${savingsId}`);
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error("Error adding member to savings goal:", error);
    
    if (error.code === 'permission-denied' || (error.message && error.message.includes('Missing or insufficient permissions'))) {
      console.error("Permission denied error - ensure the invitation is valid and accepted");
      return {
        success: false,
        message: "You don't have permission to add members. Ensure the invitation is valid and accepted."
      };
    }
    
    return {
      success: false,
      message: error.message || "Failed to add member to savings goal"
    };
  }
}