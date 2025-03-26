
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

    // Update the invitation status
    await updateDoc(invitationRef, {
      status: response,
      inviteeId: userId, // Store the responder's ID
      updatedAt: serverTimestamp(),
    });

    // If accepted, add the user to the savings goal's members
    if (response === 'accepted' && invitationData.savingsId) {
      const goalRef = doc(db, 'savings', invitationData.savingsId);
      const goalDoc = await getDoc(goalRef);

      if (goalDoc.exists()) {
        const goalData = goalDoc.data();
        const currentMembers = goalData.members || [];

        // Add the user to the members array if not already present
        if (!currentMembers.includes(userId)) {
          try {
            await updateDoc(goalRef, {
              members: [...currentMembers, userId],
              updatedAt: serverTimestamp(),
            });
          } catch (updateError) {
            console.error("Error updating savings goal members:", updateError);
            return {
              success: true,
              invitationId: invitationId,
              warning: "Invitation was processed but there was an issue adding you to the savings goal. The owner may need to add you manually."
            };
          }
        }
      } else {
        return {
          success: true,
          invitationId: invitationId,
          warning: "Invitation was processed but the savings goal could not be found."
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
    return {
      success: false,
      message: error.message || "Failed to respond to invitation",
      code: error.code || "unknown-error"
    };
  }
}
