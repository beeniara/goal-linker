
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { SavingsInvitation } from '@/types/invitation';

/**
 * Gets all pending invitations for a user by email
 */
export async function getUserInvitations(userEmail: string): Promise<SavingsInvitation[]> {
  try {
    console.log(`Fetching invitations for user ${userEmail}`);
    
    const invitationsRef = collection(db, 'savingsInvitations');
    const q = query(
      invitationsRef, 
      where('inviteeEmail', '==', userEmail),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    const invitations: SavingsInvitation[] = [];
    
    querySnapshot.forEach((doc) => {
      invitations.push({ id: doc.id, ...doc.data() } as SavingsInvitation);
    });
    
    console.log(`Found ${invitations.length} pending invitations`);
    return invitations;
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    throw error;
  }
}
