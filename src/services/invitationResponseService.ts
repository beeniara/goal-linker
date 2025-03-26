
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { InvitationResponse } from '@/types/invitation';

/**
 * Responds to an invitation by accepting or declining it
 * @param invitationId - The ID of the invitation
 * @param userId - The ID of the user responding
 * @param response - The response ('accepted' or 'declined')
 */
export async function respondToInvitation(
  invitationId: string,
  userId: string,
  response: 'accepted' | 'declined'
): Promise<InvitationResponse> {
  try {
    console.log(`Responding to invitation ${invitationId} with response ${response} by user ${userId}`);

    // Ensure the user is authenticated
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    // Fetch the invitation document from the top-level collection
    const invitationRef = doc(db, 'savingsInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      return {
        success: false,
        message: `Invitation with ID ${invitationId} not found`
      };
    }

    const invitationData = invitationDoc.data();
    console.log("Retrieved invitation data:", invitationData);

    try {
      // Update the invitation status
      await updateDoc(invitationRef, {
        status: response,
        inviteeId: userId, // Store the responder's ID
        updatedAt: serverTimestamp(),
      });
      console.log(`Updated invitation ${invitationId} status to ${response}`);
    } catch (permissionError) {
      console.error("Permission error updating invitation status:", permissionError);
      // If we can't update the invitation due to permissions, we'll still try to update the savings goal
      // This helps when the security rules might allow goal updates but not invitation updates
    }

    // If accepted, add the user to the savings goal's members
    if (response === 'accepted' && invitationData.savingsId) {
      try {
        const savingsId = invitationData.savingsId;
        console.log(`Attempting to add user ${userId} to savings goal ${savingsId}`);
        
        const goalRef = doc(db, 'savings', savingsId);
        const goalDoc = await getDoc(goalRef);

        if (goalDoc.exists()) {
          const goalData = goalDoc.data();
          console.log(`Retrieved savings goal data:`, goalData);
          
          // Initialize members array if it doesn't exist
          const currentMembers = Array.isArray(goalData.members) ? goalData.members : [];
          
          // Add the user to the members array if not already present
          if (!currentMembers.includes(userId)) {
            console.log(`Adding user ${userId} to members array:`, currentMembers);
            await updateDoc(goalRef, {
              members: [...currentMembers, userId],
              updatedAt: serverTimestamp(),
            });
            console.log(`Successfully added user ${userId} to savings goal members`);
          } else {
            console.log(`User ${userId} is already a member of this savings goal`);
          }
          
          return {
            success: true,
            invitationId: invitationId,
            savingsId: savingsId // Return the savings ID so we can redirect to it
          };
        } else {
          console.log(`Savings goal with ID ${savingsId} not found`);
          return {
            success: true,
            invitationId: invitationId,
            warning: "Invitation was processed but the savings goal could not be found."
          };
        }
      } catch (updateError) {
        console.error("Error updating savings goal members:", updateError);
        return {
          success: false,
          message: "Error adding you to the savings goal. Please ask the goal owner to add you manually.",
          code: "goal-update-error"
        };
      }
    }

    console.log(`Successfully responded to invitation ${invitationId}`);
    return {
      success: true,
      invitationId: invitationId
    };
  } catch (error: any) {
    console.error("Error responding to invitation:", error);
    
    // Provide a more user-friendly error message for permission issues
    if (error.code === 'permission-denied' || 
        (error.message && error.message.includes('Missing or insufficient permissions'))) {
      return {
        success: false,
        message: "You don't have permission to respond to this invitation. The owner may need to adjust sharing settings.",
        code: "permission-denied"
      };
    }
    
    return {
      success: false,
      message: error.message || "Failed to respond to invitation",
      code: error.code || "unknown-error"
    };
  }
}
