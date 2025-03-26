import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Invitation {
  id: string;
  type: 'project' | 'goal';
  itemId: string;
  itemTitle: string;
  senderId: string;
  senderName: string;
  recipientEmail: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

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
): Promise<void> {
  try {
    console.log(`Responding to invitation ${invitationId} with response ${response} by user ${userId}`);

    // Ensure the user is authenticated
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Fetch the invitation document
    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      throw new Error(`Invitation with ID ${invitationId} not found`);
    }

    const invitationData = invitationDoc.data() as Invitation;

    // Verify the user is the recipient
    if (invitationData.recipientId !== userId) {
      throw new Error('You are not authorized to respond to this invitation');
    }

    // Update the invitation status
    await updateDoc(invitationRef, {
      status: response,
      updatedAt: serverTimestamp(),
    });

    // If accepted, add the user to the savings goal's members
    if (response === 'accepted' && invitationData.type === 'goal') {
      const goalRef = doc(db, 'savings', invitationData.itemId);
      const goalDoc = await getDoc(goalRef);

      if (!goalDoc.exists()) {
        throw new Error(`Savings goal with ID ${invitationData.itemId} not found`);
      }

      const goalData = goalDoc.data();
      const currentMembers = goalData.members || [];

      // Add the user to the members array if not already present
      if (!currentMembers.includes(userId)) {
        await updateDoc(goalRef, {
          members: [...currentMembers, userId],
          updatedAt: serverTimestamp(),
        });
      }
    }

    console.log(`Successfully responded to invitation ${invitationId}`);
  } catch (error) {
    console.error("Error responding to invitation:", error);
    throw error;
  }
}