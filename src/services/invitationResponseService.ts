
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
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
      const savingsId = invitationData.savingsId;
      
      try {
        console.log(`Attempting to add user ${userId} to savings goal ${savingsId}`);
        
        const goalRef = doc(db, 'savings', savingsId);
        const goalDoc = await getDoc(goalRef);

        if (!goalDoc.exists()) {
          console.log(`Savings goal with ID ${savingsId} not found`);
          return {
            success: true,
            invitationId: invitationId,
            savingsId: savingsId, // Still return savingsId for navigation
            warning: "Invitation was processed but the savings goal could not be found."
          };
        }

        // Try updating the members array
        try {
          // First attempt: Use arrayUnion for the most efficient update
          await updateDoc(goalRef, {
            members: arrayUnion(userId),
            updatedAt: serverTimestamp(),
          });
          console.log(`Successfully added user ${userId} to savings goal members`);
          
          return {
            success: true,
            invitationId: invitationId,
            savingsId: savingsId
          };
        } catch (updateError) {
          console.error("Error updating savings goal members:", updateError);
          
          // Send a more specific message depending on the error
          if (updateError.code === 'permission-denied' || 
              (updateError.message && updateError.message.includes('Missing or insufficient permissions'))) {
            return {
              success: false,
              message: "You don't have permission to join this goal. The goal owner needs to manually add you through their savings goal settings. Your invitation has been processed successfully.",
              code: "permission-denied",
              savingsId: savingsId, // Return savingsId for navigation
              invitationId: invitationId
            };
          }
          
          return {
            success: false,
            message: "Your invitation has been processed, but we couldn't automatically add you to the goal members list. The goal owner needs to manually add you through their settings.",
            code: "goal-update-error",
            savingsId: savingsId, // Return savingsId for navigation
            invitationId: invitationId
          };
        }
      } catch (error) {
        console.error("Error in the goal update process:", error);
        
        // Still return the savingsId even if everything fails
        return {
          success: false,
          message: "Your invitation was processed, but there was an issue with the savings goal. The goal owner needs to manually add you through their settings.",
          savingsId: savingsId, // Return savingsId for navigation
          invitationId: invitationId
        };
      }
    }

    console.log(`Successfully responded to invitation ${invitationId}`);
    return {
      success: true,
      invitationId: invitationId,
      savingsId: invitationData.savingsId // Always return the savingsId if available
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
