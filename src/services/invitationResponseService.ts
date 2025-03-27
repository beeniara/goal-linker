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

    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }

    const invitationRef = doc(db, 'savingsInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      return { success: false, message: `Invitation with ID ${invitationId} not found` };
    }

    const invitationData = invitationDoc.data();
    console.log("Retrieved invitation data:", invitationData);

    try {
      await updateDoc(invitationRef, {
        status: response,
        inviteeId: userId,
        updatedAt: serverTimestamp(),
      });
      console.log(`Updated invitation ${invitationId} status to ${response}`);
    } catch (permissionError) {
      console.error("Permission error updating invitation status:", permissionError);
    }

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
            invitationId,
            savingsId,
            warning: "Invitation processed but savings goal not found."
          };
        }

        const updatePayload = {
          members: arrayUnion(userId),
          invitationId: invitationId,
          updatedAt: serverTimestamp(),
        };
        console.log("Updating savings goal with payload:", updatePayload);
        await updateDoc(goalRef, updatePayload);
        console.log(`Successfully added user ${userId} to savings goal members`);
        return { success: true, invitationId, savingsId };
      } catch (updateError) {
        console.error("Error updating savings goal members:", updateError);
        if (updateError.code === 'permission-denied' || 
            (updateError.message && updateError.message.includes('Missing or insufficient permissions'))) {
          return {
            success: false,
            message: "You don't have permission to join this goal. The owner needs to adjust settings.",
            code: "permission-denied",
            savingsId,
            invitationId
          };
        }
        return {
          success: false,
          message: "Unable to add you to the savings goal. The owner needs to manually add you.",
          code: "goal-update-error",
          savingsId,
          invitationId
        };
      }
    }

    console.log(`Successfully responded to invitation ${invitationId}`);
    return { success: true, invitationId, savingsId: invitationData.savingsId };
  } catch (error: any) {
    console.error("Error responding to invitation:", error);
    if (error.code === 'permission-denied' || 
        (error.message && error.message.includes('Missing or insufficient permissions'))) {
      return {
        success: false,
        message: "You don't have permission to respond. The owner may need to adjust settings.",
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