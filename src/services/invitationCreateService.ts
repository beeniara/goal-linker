import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, DocumentData, DocumentReference } from 'firebase/firestore';
import { sendEmailNotification } from './notificationService';
import { SavingsInvitation, InvitationResponse } from '@/types/invitation';

/**
 * Checks if an invitation already exists for a specific savings goal and email
 */
export async function checkExistingInvitation(savingsId: string, inviteeEmail: string, inviterId: string): Promise<boolean> {
  try {
    console.log(`Checking if invitation exists for ${inviteeEmail} to savings group ${savingsId} by inviter ${inviterId}`);

    if (!inviterId) {
      throw new Error('Inviter not authenticated');
    }

    const invitationsRef = collection(db, 'savings', savingsId, 'invitations');
    const q = query(
      invitationsRef,
      where('inviteeEmail', '==', inviteeEmail),
      where('status', '==', 'pending'),
      where('inviterId', '==', inviterId)
    );

    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;
    console.log(`Invitation exists: ${exists}`);
    return exists;
  } catch (error: any) {
    console.error('Error checking existing invitations:', error);
    throw new Error(`Failed to check existing invitations: ${error.message}`);
  }
}

/**
 * Invites a user to join a savings goal
 */
export async function inviteUserToSavings(
  savingsId: string,
  savingsTitle: string,
  inviterId: string,
  inviterName: string,
  inviteeEmail: string
): Promise<InvitationResponse> {
  try {
    console.log(`Inviting ${inviteeEmail} to savings group ${savingsId}`);
    console.log('Authenticated user UID (inviterId):', inviterId);

    // Input validation
    if (!savingsId || !savingsTitle) {
      return { 
        success: false, 
        message: 'Missing savings information. Please provide a valid savings ID and title.' 
      };
    }

    if (!inviterId || !inviterName) {
      return { 
        success: false, 
        message: 'Missing user information. Please log out and log back in to refresh your user data.' 
      };
    }

    if (!inviteeEmail) {
      return { 
        success: false, 
        message: 'Please provide an email address for the person you want to invite.' 
      };
    }

    // Check if invitation already exists for this specific savings goal
    try {
      const invitationExists = await checkExistingInvitation(savingsId, inviteeEmail, inviterId);
      if (invitationExists) {
        console.log('Invitation already exists for this specific savings goal');
        return { success: false, message: 'Invitation already sent to this user for this savings goal' };
      }
    } catch (queryError: any) {
      console.error('Error checking existing invitations:', queryError);
      return { 
        success: false, 
        message: `Error checking existing invitations: ${queryError.message || 'Firebase permission error'}. Please verify your Firebase security rules.` 
      };
    }

    // Create invitation
    const invitation: SavingsInvitation = {
      savingsId,
      savingsTitle,
      inviterId,
      inviterName,
      inviteeEmail,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      console.log('Creating invitation with data:', JSON.stringify({
        ...invitation,
        createdAt: 'serverTimestamp()'
      }));

      const invitationsRef = collection(db, 'savings', savingsId, 'invitations');
      const docRef = await addDoc(invitationsRef, invitation);
      // Update the document to include its own ID
      await updateDoc(docRef, { id: docRef.id });
      console.log('Invitation created with ID:', docRef.id);

      // Send email notification (if implemented)
      try {
        await sendEmailNotification(
          inviteeEmail,
          'Savings Group Invitation',
          `${inviterName} has invited you to join their savings goal "${savingsTitle}". Please log in to view and respond to this invitation.`
        );
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        return { 
          success: true, 
          invitationId: docRef.id, 
          warning: 'Invitation created but email notification failed' 
        };
      }

      return { success: true, invitationId: docRef.id };
    } catch (firebaseError: any) {
      console.error('Firebase error creating invitation:', firebaseError);
      let errorMessage = 'Failed to create invitation.';
      let errorCode = firebaseError.code || 'unknown';

      if (firebaseError.code === 'permission-denied' || 
          (firebaseError.message && firebaseError.message.includes('Missing or insufficient permissions'))) {
        errorMessage = 'Permission denied. Please make sure your Firebase security rules allow creating and querying invitations.';
        errorCode = 'permission-denied';
      } else if (firebaseError.code) {
        errorMessage = `Error (${firebaseError.code}): ${firebaseError.message || 'Unknown error'}`;
      }

      return { 
        success: false, 
        message: errorMessage, 
        code: errorCode 
      };
    }
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred while creating the invitation.', 
      error 
    };
  }
}

function updateDoc(docRef: DocumentReference<DocumentData, DocumentData>, arg1: { id: string; }) {
  throw new Error('Function not implemented.');
}
