
import { db } from '@/firebase/config';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { sendEmailNotification } from './notificationService';
import { SavingsInvitation, InvitationResponse } from '@/types/invitation';

/**
 * Responds to an invitation (accept or decline)
 */
export async function respondToInvitation(
  invitationId: string,
  userId: string,
  accept: boolean
): Promise<InvitationResponse> {
  try {
    console.log(`User ${userId} ${accept ? 'accepted' : 'declined'} invitation ${invitationId}`);
    
    // Get the invitation directly using the document reference first
    const invitationRef = doc(db, 'savingsInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      return { success: false, message: 'Invitation not found' };
    }
    
    const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as SavingsInvitation;
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: accept ? 'accepted' : 'declined',
      inviteeId: userId
    });
    
    if (accept) {
      // Add user to savings group members
      const savingsRef = doc(db, 'savings', invitation.savingsId);
      const savingsDoc = await getDoc(savingsRef);
      
      if (!savingsDoc.exists()) {
        return { success: false, message: 'Savings goal not found' };
      }
      
      const savingsData = savingsDoc.data();
      const members = savingsData.members || [];
      
      if (!members.includes(userId)) {
        // Use arrayUnion to safely add the user to the members array
        await updateDoc(savingsRef, { 
          members: arrayUnion(userId)
        });
        
        // Notify the inviter that the invitation was accepted
        try {
          await sendEmailNotification(
            invitation.inviterId,
            'Savings Group Invitation Accepted',
            `Your invitation to join "${invitation.savingsTitle}" has been accepted.`
          );
        } catch (emailError) {
          console.error('Error sending acceptance notification:', emailError);
          // Continue even if email fails
        }
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error responding to invitation:', error);
    return { 
      success: false, 
      message: `Error responding to invitation: ${error.message}` 
    };
  }
}
