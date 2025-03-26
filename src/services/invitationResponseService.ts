
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
        
        if (!members.includes(userId)) {
          // Use arrayUnion to safely add the user to the members array
          console.log('Adding user to savings group members:', userId);
          try {
            await updateDoc(savingsRef, { 
              members: arrayUnion(userId),
              lastUpdatedAt: serverTimestamp()
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
          } catch (memberUpdateError: any) {
            console.error('Error adding member to savings group:', memberUpdateError);
            
            // Return partial success - the invitation was updated but adding to group failed
            if (memberUpdateError.code === 'permission-denied' || 
                (memberUpdateError.message && memberUpdateError.message.includes('Missing or insufficient permissions'))) {
              return { 
                success: true,  // Invitation was updated successfully
                warning: 'Your response was recorded, but you could not be added to the savings group due to permission settings.',
                code: 'permission-denied-savings'
              };
            }
            
            return { 
              success: true,  // Invitation was updated successfully
              warning: `Your response was recorded, but you could not be added to the savings group: ${memberUpdateError.message}`,
            };
          }
        } else {
          console.log('User already a member of the savings group');
        }
      } catch (savingsError: any) {
        console.error('Error accessing savings group:', savingsError);
        
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
