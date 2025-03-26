
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
      console.error('Invitation not found:', invitationId);
      return { success: false, message: 'Invitation not found' };
    }
    
    const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as SavingsInvitation;
    console.log('Found invitation:', invitation);
    
    // Update invitation status
    try {
      await updateDoc(invitationRef, {
        status: accept ? 'accepted' : 'declined',
        inviteeId: userId
      });
      console.log('Updated invitation status successfully');
    } catch (updateError: any) {
      console.error('Error updating invitation status:', updateError);
      return { 
        success: false, 
        message: `Error updating invitation: ${updateError.message}`,
        error: updateError
      };
    }
    
    if (accept) {
      // Add user to savings group members
      const savingsRef = doc(db, 'savings', invitation.savingsId);
      
      try {
        const savingsDoc = await getDoc(savingsRef);
        
        if (!savingsDoc.exists()) {
          console.error('Savings goal not found:', invitation.savingsId);
          return { success: false, message: 'Savings goal not found' };
        }
        
        const savingsData = savingsDoc.data();
        const members = savingsData.members || [];
        
        if (!members.includes(userId)) {
          // Use arrayUnion to safely add the user to the members array
          console.log('Adding user to savings group members:', userId);
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
            console.log('Sent acceptance notification email');
          } catch (emailError) {
            console.error('Error sending acceptance notification:', emailError);
            // Continue even if email fails
          }
        } else {
          console.log('User already a member of the savings group');
        }
      } catch (savingsError: any) {
        console.error('Error updating savings group:', savingsError);
        return { 
          success: false, 
          message: `Error updating savings group: ${savingsError.message}`,
          error: savingsError
        };
      }
    }
    
    console.log('Invitation response process completed successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error responding to invitation:', error);
    return { 
      success: false, 
      message: `Error responding to invitation: ${error.message}`,
      error
    };
  }
}
