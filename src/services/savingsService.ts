import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where, getDoc, updateDoc, Timestamp, arrayUnion, addDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';
import { Savings, SavingsWithId, SavingsInvitation, SavingsInvitationWithId } from '../types/savings';

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
    
    if (!invitationId) {
      console.error('Missing invitation ID');
      return {
        success: false,
        message: 'Missing invitation ID. You must provide a valid invitation ID to add a member.'
      };
    }
    
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
    
    // Verify the invitation is for this user and savings goal
    if (invitationData.savingsId !== savingsId) {
      console.log(`Invitation ${invitationId} is not for savings goal ${savingsId}`);
      return {
        success: false,
        message: `Invitation is not valid for this savings goal`
      };
    }
    
    if (invitationData.inviteeEmail !== email) {
      console.log(`Invitation ${invitationId} is not for email ${email}`);
      return {
        success: false,
        message: `Invitation is not valid for this email address`
      };
    }
    
    // Update the invitation with the user ID if not already set
    if (!invitationData.inviteeId) {
      try {
        await updateDoc(invitationRef, {
          inviteeId: userId,
          status: 'accepted',
          updatedAt: serverTimestamp()
        });
        console.log(`Updated invitation ${invitationId} with user ID ${userId}`);
      } catch (updateError) {
        console.error('Error updating invitation:', updateError);
        // Continue anyway - this is not critical
      }
    }
    
    // Update the savings goal with the new member and invitationId
    try {
      await updateDoc(goalRef, {
        members: arrayUnion(userId),
        invitationId: invitationId,  // Include invitationId in the update
        updatedAt: serverTimestamp()
      });
      
      console.log(`Successfully added user ${userId} to savings goal ${savingsId}`);
      
      return {
        success: true
      };
    } catch (updateError: any) {
      console.error('Error updating savings goal:', updateError);
      
      if (updateError.code === 'permission-denied' || 
          (updateError.message && updateError.message.includes('Missing or insufficient permissions'))) {
        return {
          success: false,
          message: "Permission denied. Ensure the invitation is valid and accepted."
        };
      }
      
      return {
        success: false,
        message: updateError.message || "Failed to add member to savings goal"
      };
    }
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

export const createSaving = async (userId: string, title: string, targetAmount: number) => {
  const savingsRef = collection(db, 'savings');
  
  const newSaving: Savings = {
    userId,
    title,
    targetAmount,
    currentAmount: 0,
    members: [userId],
    contributions: {
      [userId]: 0
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(savingsRef, newSaving);
  return { id: docRef.id, ...newSaving };
};

export const inviteToSaving = async (savingId: string, inviterId: string, inviteeEmail: string) => {
  const invitationsRef = collection(db, 'savingsInvitations');
  
  const newInvitation: SavingsInvitation = {
    savingsId: savingId,
    inviterId,
    inviteeEmail,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(invitationsRef, newInvitation);
  return { id: docRef.id, ...newInvitation };
};

export const acceptInvitation = async (invitationId: string, savingId: string, userId: string) => {
  const savingRef = doc(db, 'savings', savingId);
  const invitationRef = doc(db, 'savingsInvitations', invitationId);
  
  // Update saving to add new member
  await updateDoc(savingRef, {
    members: [...(await getDoc(savingRef)).data()?.members || [], userId],
    contributions: {
      ...(await getDoc(savingRef)).data()?.contributions || {},
      [userId]: 0
    },
    updatedAt: serverTimestamp()
  });

  // Update invitation status
  await updateDoc(invitationRef, {
    status: 'accepted',
    inviteeId: userId,
    updatedAt: serverTimestamp()
  });
};

export const contributeToSaving = async (savingId: string, userId: string, amount: number) => {
  const savingRef = doc(db, 'savings', savingId);
  const savingDoc = await getDoc(savingRef);
  const savingData = savingDoc.data();
  
  if (!savingData) throw new Error('Saving not found');
  if (savingData.currentAmount + amount > savingData.targetAmount) {
    throw new Error('Contribution would exceed target amount');
  }

  await updateDoc(savingRef, {
    currentAmount: increment(amount),
    [`contributions.${userId}`]: increment(amount),
    updatedAt: serverTimestamp()
  });
};

export const getSaving = async (savingId: string) => {
  const savingRef = doc(db, 'savings', savingId);
  const savingDoc = await getDoc(savingRef);
  return savingDoc.exists() ? { id: savingDoc.id, ...savingDoc.data() } : null;
};

export const getUserSavings = async (userId: string) => {
  const savingsRef = collection(db, 'savings');
  const q = query(savingsRef, where('members', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPendingInvitations = async (email: string) => {
  const invitationsRef = collection(db, 'savingsInvitations');
  const q = query(
    invitationsRef,
    where('inviteeEmail', '==', email),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteSaving = async (savingId: string) => {
  const savingRef = doc(db, 'savings', savingId);
  const savingDoc = await getDoc(savingRef);
  
  if (!savingDoc.exists()) throw new Error('Saving not found');
  if (savingDoc.data()?.currentAmount > 0) {
    throw new Error('Cannot delete saving with contributions');
  }

  await deleteDoc(savingRef);
};

const SAVINGS_COLLECTION = 'savings';
const INVITATIONS_COLLECTION = 'savingsInvitations';

export const savingsService = {
  // Savings operations
  async createSavings(savings: Omit<Savings, 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const savingsData = {
      ...savings,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, SAVINGS_COLLECTION), savingsData);
    return docRef.id;
  },

  async updateSavings(id: string, updates: Partial<Savings>): Promise<void> {
    const savingsRef = doc(db, SAVINGS_COLLECTION, id);
    await updateDoc(savingsRef, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async getSavings(id: string): Promise<SavingsWithId | null> {
    const savingsRef = doc(db, SAVINGS_COLLECTION, id);
    const savingsDoc = await getDoc(savingsRef);
    
    if (!savingsDoc.exists()) {
      return null;
    }

    return {
      id: savingsDoc.id,
      ...savingsDoc.data(),
    } as SavingsWithId;
  },

  async deleteSavings(id: string): Promise<void> {
    const savingsRef = doc(db, SAVINGS_COLLECTION, id);
    await deleteDoc(savingsRef);
  },

  async getUserSavings(userId: string): Promise<SavingsWithId[]> {
    const q = query(
      collection(db, SAVINGS_COLLECTION),
      where('members', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SavingsWithId));
  },

  // Contribution operations
  async addContribution(savingsId: string, userId: string, amount: number, note: string = ''): Promise<void> {
    const savingsRef = doc(db, SAVINGS_COLLECTION, savingsId);
    const savingsDoc = await getDoc(savingsRef);
    
    if (!savingsDoc.exists()) {
      throw new Error('Savings not found');
    }

    const savingsData = savingsDoc.data() as Savings;
    const newCurrentAmount = savingsData.currentAmount + amount;

    if (newCurrentAmount > savingsData.targetAmount) {
      throw new Error('Contribution would exceed target amount');
    }

    const contribution = {
      id: uuidv4(),
      userId,
      amount,
      note,
      createdAt: new Date(),
    };

    await updateDoc(savingsRef, {
      currentAmount: newCurrentAmount,
      contributions: arrayUnion(contribution),
      updatedAt: new Date(),
    });
  },

  // Member operations
  async addMember(savingsId: string, userId: string): Promise<void> {
    const savingsRef = doc(db, SAVINGS_COLLECTION, savingsId);
    await updateDoc(savingsRef, {
      members: arrayUnion(userId),
      updatedAt: new Date(),
    });
  },

  async removeMember(savingsId: string, userId: string): Promise<void> {
    const savingsRef = doc(db, SAVINGS_COLLECTION, savingsId);
    const savingsDoc = await getDoc(savingsRef);
    
    if (!savingsDoc.exists()) {
      throw new Error('Savings not found');
    }

    const savingsData = savingsDoc.data() as Savings;
    const updatedMembers = savingsData.members.filter(id => id !== userId);

    await updateDoc(savingsRef, {
      members: updatedMembers,
      updatedAt: new Date(),
    });
  },

  // Invitation operations
  async createInvitation(invitation: Omit<SavingsInvitation, 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const invitationData = {
      ...invitation,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, INVITATIONS_COLLECTION), invitationData);
    return docRef.id;
  },

  async updateInvitation(id: string, updates: Partial<SavingsInvitation>): Promise<void> {
    const invitationRef = doc(db, INVITATIONS_COLLECTION, id);
    await updateDoc(invitationRef, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async getInvitation(id: string): Promise<SavingsInvitationWithId | null> {
    const invitationRef = doc(db, INVITATIONS_COLLECTION, id);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      return null;
    }

    return {
      id: invitationDoc.id,
      ...invitationDoc.data(),
    } as SavingsInvitationWithId;
  },

  async getInvitationsByInvitee(inviteeId: string): Promise<SavingsInvitationWithId[]> {
    const q = query(
      collection(db, INVITATIONS_COLLECTION),
      where('inviteeId', '==', inviteeId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SavingsInvitationWithId));
  },

  async getInvitationsBySavings(savingsId: string): Promise<SavingsInvitationWithId[]> {
    const q = query(
      collection(db, INVITATIONS_COLLECTION),
      where('savingsId', '==', savingsId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SavingsInvitationWithId));
  },

  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitationData = invitationDoc.data() as SavingsInvitation;
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
      inviteeId: userId,
      updatedAt: new Date(),
    });

    // Add user to savings members
    await this.addMember(invitationData.savingsId, userId);
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
    await updateDoc(invitationRef, {
      status: 'rejected',
      updatedAt: new Date(),
    });
  },
};
