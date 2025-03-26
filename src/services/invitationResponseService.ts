
import { db } from '@/firebase/config';
import { doc, updateDoc, getDoc, arrayUnion, serverTimestamp, runTransaction } from 'firebase/firestore';
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
    
    // Use a transaction to ensure that both the invitation update and the savings update happen atomically
    return await runTransaction(db, async (transaction) => {
      const invitationDoc = await transaction.get(invitationRef);
      
      if (!invitationDoc.exists()) {
        console.error('Invitation not found:', invitationId);
        return { success: false, message: 'Invitation not found' };
      }
      
      const invitation = { id: invitationDoc.id, ...invitationDoc.data() } as SavingsInvitation;
      console.log('Found invitation:', invitation);
      console.log('Authenticated userId:', userId, 'inviteeEmail in invitation:', invitation.inviteeEmail);
      
      // Update invitation status
      transaction.update(invitationRef, {
        status: accept ? 'accepted' : 'declined',
        inviteeId: userId,
        respondedAt: serverTimestamp()
      });
      
      console.log('Updated invitation status in transaction');
      
      // Only attempt to add user to savings group if invitation was accepted
      if (accept) {
        // Add user to savings group members
        const savingsRef = doc(db, 'savings', invitation.savingsId);
        const savingsDoc = await transaction.get(savingsRef);
        
        if (!savingsDoc.exists()) {
          console.error('Savings goal not found:', invitation.savingsId);
          return { 
            success: true,  // Invitation was updated successfully even if savings wasn't
            warning: 'Invitation was accepted but the savings goal may no longer exist.'
          };
        }
        
        const savingsData = savingsDoc.data();
        const members = savingsData.members || [];
        console.log('Current members in savings group:', members);
        console.log('Adding userId to members:', userId);
        
        // Check if user is already a member to prevent duplicates
        if (!members.includes(userId)) {
          // Add the user to the members array
          console.log('Updating savings group with new member:', userId);
          
          // Create a new members array with the user added
          const updatedMembers = [...members, userId];
          
          transaction.update(savingsRef, { 
            members: updatedMembers,
            lastUpdatedAt: serverTimestamp()
          });
          
          console.log('Successfully added user to savings group in transaction');
        } else {
          console.log('User already a member of the savings group');
        }
      }
      
      console.log('Invitation response transaction completed successfully');
      
      // Even if we can't send an email notification, the invitation was successfully processed
      if (accept) {
        try {
          // This is outside the transaction since it's not critical to the data consistency
          await sendEmailNotification(
            invitation.inviterId, // This should be an email or UID
            'Savings Group Invitation Accepted',
            `Your invitation to join "${invitation.savingsTitle}" has been accepted.`
          );
          console.log('Sent acceptance notification email');
        } catch (emailError) {
          console.error('Error sending acceptance notification:', emailError);
          // Continue even if email fails, as the invitation was created successfully
          return { 
            success: true, 
            warning: 'Invitation accepted and user added to group, but email notification failed.'
          };
        }
      }
      
      return { success: true };
    });
  } catch (error: any) {
    console.error('Error responding to invitation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Check for transaction/permission errors
    if (error.code === 'permission-denied' || 
        (error.message && error.message.includes('Missing or insufficient permissions'))) {
      console.log('Permission denied error - falling back to basic invitation update');
      
      // Fallback: Just update the invitation status without modifying the savings group
      try {
        const invitationRef = doc(db, 'savingsInvitations', invitationId);
        await updateDoc(invitationRef, {
          status: accept ? 'accepted' : 'declined',
          inviteeId: userId,
          respondedAt: serverTimestamp()
        });
        
        console.log('Fallback: Successfully updated invitation status only');
        
        return { 
          success: true, 
          warning: accept 
            ? 'Your response was recorded, but you may need to ask the group owner to add you manually due to permission settings.'
            : 'Your response was recorded successfully.'
        };
      } catch (fallbackError: any) {
        console.error('Fallback also failed:', fallbackError);
        return { 
          success: false, 
          message: 'Permission denied. Could not process your response. Please contact the group owner.',
          code: 'permission-denied'
        };
      }
    }
    
    return { 
      success: false, 
      message: `Error responding to invitation: ${error.message}`,
      error
    };
  }
}
