
import { db } from '@/firebase/config';
import { doc, updateDoc, getDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
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
    console.log('Authenticated userId:', userId, 'inviteeEmail in invitation:', invitation.inviteeEmail);
    
    // Update invitation status
    try {
      await updateDoc(invitationRef, {
        status: accept ? 'accepted' : 'declined',
        inviteeId: userId,
        respondedAt: serverTimestamp()
      });
      console.log('Updated invitation status successfully');
    } catch (updateError: any) {
      console.error('Error updating invitation status:', updateError);
      
      // Check for permission errors
      if (updateError.code === 'permission-denied' || 
          (updateError.message && updateError.message.includes('Missing or insufficient permissions'))) {
        return { 
          success: false, 
          message: 'Permission denied. Please make sure you have access to this invitation.',
          code: 'permission-denied' 
        };
      }
      
      return { 
        success: false, 
        message: `Error updating invitation: ${updateError.message}`,
        error: updateError
      };
    }
    
    // Only attempt to add user to savings group if invitation was accepted
    if (accept) {
      // Add user to savings group members
      try {
        const savingsRef = doc(db, 'savings', invitation.savingsId);
        const savingsDoc = await getDoc(savingsRef);
        
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
          // Use arrayUnion to safely add the user to the members array
          console.log('Updating savings group with new member:', userId);
          await updateDoc(savingsRef, { 
            members: arrayUnion(userId),
            lastUpdatedAt: serverTimestamp()
          });
          console.log('Successfully added user to savings group');
          
          // Notify the inviter that the invitation was accepted
          try {
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
        } else {
          console.log('User already a member of the savings group');
        }
      } catch (savingsError: any) {
        console.error('Error accessing savings group:', savingsError);
        console.error('Error details:', JSON.stringify(savingsError, null, 2));
        
        // Return partial success - the invitation was updated but adding to group failed
        if (savingsError.code === 'permission-denied' || 
            (savingsError.message && savingsError.message.includes('Missing or insufficient permissions'))) {
          return { 
            success: true,  // Invitation was updated
            warning: 'Your response was recorded, but there was an issue accessing the savings group due to permissions.',
            code: 'permission-denied-savings'
          };
        }
        
        return { 
          success: true,  // Invitation was updated
          warning: `Your response was recorded, but there was an issue with the savings group: ${savingsError.message}`,
        };
      }
    }
    
    console.log('Invitation response process completed successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error responding to invitation:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Check for Firebase permission errors at the top level
    if (error.code === 'permission-denied' || 
        (error.message && error.message.includes('Missing or insufficient permissions'))) {
      return { 
        success: false, 
        message: 'Permission denied. Firebase security rules are preventing this operation.',
        code: 'permission-denied'
      };
    }
    
    return { 
      success: false, 
      message: `Error responding to invitation: ${error.message}`,
      error
    };
  }
}
