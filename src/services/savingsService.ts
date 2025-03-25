
import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { SavingsGoalFormValues } from '@/schemas/savingsGoalSchema';

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
    // Log the userId and data for debugging
    console.log("Creating savings goal for user:", userId);
    console.log("Savings goal data:", data);
    
    // Generate a unique ID for the savings goal
    const savingsId = uuidv4();
    const savingsRef = doc(db, 'savings', savingsId);
    
    // Prepare the data object to be saved in Firestore
    const savingsData = {
      id: savingsId,
      userId: userId,              // Link the goal to the user
      title: data.title,           // The name of the savings goal
      description: data.description || '', // Optional description
      target: data.target,         // Total amount to save
      frequency: data.frequency,   // How often contributions will be made
      contributionAmount: data.amount, // Amount per contribution
      method: data.method,         // Single user or group savings
      current: 0,                  // Initial amount saved (always 0)
      createdAt: serverTimestamp(), // When the goal was created
      updatedAt: serverTimestamp(), // When the goal was last updated
      contributions: [],           // Array to track individual contributions
      members: data.method === 'group' ? [userId] : [], // Group members (if applicable)
      completed: false,            // Whether the goal has been achieved
    };
    
    // Log the complete data being saved for debugging
    console.log("Saving document with data:", savingsData);
    
    // Save the data to Firestore
    await setDoc(savingsRef, savingsData);
    console.log("Savings goal created successfully with ID:", savingsId);
    
    return savingsId;
  } catch (error) {
    // Enhanced error logging for debugging
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
export async function getUserSavingsGoals(userId: string) {
  try {
    console.log("Fetching savings goals for user:", userId);
    
    // Create a reference to the savings collection
    const savingsRef = collection(db, 'savings');
    
    // Create a query to find goals where userId matches the provided ID
    const q = query(savingsRef, where('userId', '==', userId));
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Map the results to an array of goals with their data
    const goals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${goals.length} savings goals for user ${userId}`);
    return goals;
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("Error fetching user savings goals:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}
