
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { SavingsInvitation } from '@/types/invitation';

/**
 * Gets all pending invitations for a user by email
 */
export async function getUserInvitations(userEmail: string): Promise<SavingsInvitation[]> {
  try {
    console.log(`Fetching invitations for user ${userEmail}`);
    
    if (!userEmail) {
      console.warn('No user email provided for fetching invitations');
      return [];
    }
    
    const invitationsRef = collection(db, 'savingsInvitations');
    const q = query(
      invitationsRef, 
      where('inviteeEmail', '==', userEmail),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    const invitations: SavingsInvitation[] = [];
    
    querySnapshot.forEach((doc) => {
      // Validate document data before adding to array
      const docData = doc.data();
      if (docData && docData.savingsId && docData.inviteeEmail) {
        invitations.push({ 
          id: doc.id, 
          ...docData 
        } as SavingsInvitation);
      } else {
        console.warn('Skipping invalid invitation document:', doc.id);
      }
    });
    
    console.log(`Found ${invitations.length} pending invitations`);
    return invitations;
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    // Return empty array instead of throwing to prevent UI breakage
    return [];
  }
}
