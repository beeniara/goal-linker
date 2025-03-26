
import { db } from '@/firebase/config';
import { doc, updateDoc, getDoc, serverTimestamp, runTransaction, arrayUnion } from 'firebase/firestore';
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
    
    // First, get the invitation details to have all the necessary data
    const invitationRef = doc(db, 'savingsInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      console.error('Invitation not found:', invitationId);
      return { success: false, message: 'Invitation not found' };
    }
    
    const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as SavingsInvitation;
    console.log('Found invitation:', invitation);
    console.log('Authenticated userId:', userId, 'inviteeEmail in invitation:', invitation.inviteeEmail);
    
    // Update the invitation status, which should succeed regardless of savings permissions
    await updateDoc(invitationRef, {
      status: accept ? 'accepted' : 'declined',
      inviteeId: userId,
      respondedAt: serverTimestamp()
    });
    console.log('Updated invitation status successfully');
    
    // Only try to add the user to the savings group if the invitation was accepted
    if (accept) {
      try {
        // Now, try to add the user to the savings group
        const savingsRef = doc(db, 'savings', invitation.savingsId);
        const savingsDoc = await getDoc(savingsRef);
        
        if (!savingsDoc.exists()) {
          console.error('Savings goal not found:', invitation.savingsId);
          return { 
            success: true,
            warning: 'Invitation was accepted but the savings goal may no longer exist.'
          };
        }
        
        // Get current members to check if user is already a member
        const savingsData = savingsDoc.data();
        const members = savingsData.members || [];
        console.log('Current members in savings group:', members);
        
        // Check if user is already a member to prevent duplicates
        if (!members.includes(userId)) {
          console.log('Adding userId to members:', userId);
          
          // Use arrayUnion to safely add the user without duplicates
          await updateDoc(savingsRef, { 
            members: arrayUnion(userId),
            lastUpdatedAt: serverTimestamp()
          });
          
          console.log('Successfully added user to savings group');
        } else {
          console.log('User already a member of the savings group');
        }
        
        // Send notification after successful update
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
        
        return { success: true };
        
      } catch (savingsError: any) {
        console.error('Error accessing savings group:', savingsError);
        console.error('Error details:', JSON.stringify(savingsError, null, 2));
        
        // The invitation update was successful, but we couldn't add the user to the group
        return { 
          success: true, 
          warning: 'Your response was recorded, but you may need to ask the group owner to add you manually due to permission settings.'
        };
      }
    }
    
    // For declined invitations that were successfully processed
    return { success: true };
    
  } catch (error: any) {
    console.error('Error responding to invitation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    return { 
      success: false, 
      message: `Error responding to invitation: ${error.message}`,
      error
    };
  }
}
