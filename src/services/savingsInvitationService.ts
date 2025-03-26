
import { db } from '@/firebase/config';
import { collection, doc, addDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmailNotification } from './notificationService';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface SavingsInvitation {
  id?: string;
  savingsId: string;
  savingsTitle: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeId?: string;
  status: InvitationStatus;
  createdAt: any;
}

/**
 * Checks if an invitation already exists for a specific savings goal and email
 */
export async function checkExistingInvitation(savingsId: string, inviteeEmail: string): Promise<boolean> {
  try {
    console.log(`Checking if invitation exists for ${inviteeEmail} to savings group ${savingsId}`);
    
    const invitationsRef = collection(db, 'savingsInvitations');
    const q = query(
      invitationsRef, 
      where('savingsId', '==', savingsId),
      where('inviteeEmail', '==', inviteeEmail),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
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
) {
  try {
    console.log(`Inviting ${inviteeEmail} to savings group ${savingsId}`);
    
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
    
    // Check if invitation already exists
    try {
      const invitationExists = await checkExistingInvitation(savingsId, inviteeEmail);
      if (invitationExists) {
        console.log('Invitation already exists');
        return { success: false, message: 'Invitation already sent to this user' };
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
      
      const docRef = await addDoc(collection(db, 'savingsInvitations'), invitation);
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
        // Continue even if email fails, as the invitation was created successfully
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

export async function getUserInvitations(userEmail: string) {
  try {
    console.log(`Fetching invitations for user ${userEmail}`);
    
    const invitationsRef = collection(db, 'savingsInvitations');
    const q = query(
      invitationsRef, 
      where('inviteeEmail', '==', userEmail),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    const invitations: SavingsInvitation[] = [];
    
    querySnapshot.forEach((doc) => {
      invitations.push({ id: doc.id, ...doc.data() } as SavingsInvitation);
    });
    
    console.log(`Found ${invitations.length} pending invitations`);
    return invitations;
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    throw error;
  }
}

export async function respondToInvitation(
  invitationId: string,
  userId: string,
  accept: boolean
) {
  try {
    console.log(`User ${userId} ${accept ? 'accepted' : 'declined'} invitation ${invitationId}`);
    
    const invitationRef = doc(db, 'savingsInvitations', invitationId);
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: accept ? 'accepted' : 'declined',
      inviteeId: userId
    });
    
    if (accept) {
      // Get the invitation details
      const invitationsRef = collection(db, 'savingsInvitations');
      const q = query(invitationsRef, where('__name__', '==', invitationId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const invitation = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as SavingsInvitation;
        
        // Add user to savings group members
        const savingsRef = doc(db, 'savings', invitation.savingsId);
        const savingsQ = query(collection(db, 'savings'), where('__name__', '==', invitation.savingsId));
        const savingsSnapshot = await getDocs(savingsQ);
        
        if (!savingsSnapshot.empty) {
          const savingsData = savingsSnapshot.docs[0].data();
          const members = savingsData.members || [];
          
          if (!members.includes(userId)) {
            members.push(userId);
            await updateDoc(savingsRef, { members });
            
            // Notify the inviter that the invitation was accepted
            try {
              const inviterEmail = invitation.inviterId; // This should be the inviter's email or you need to fetch it
              await sendEmailNotification(
                inviterEmail,
                'Savings Group Invitation Accepted',
                `Your invitation to join "${invitation.savingsTitle}" has been accepted.`
              );
            } catch (emailError) {
              console.error('Error sending acceptance notification:', emailError);
              // Continue even if email fails
            }
          }
        }
      }
    } else {
      // If declined, we just update the status but don't need to do anything else
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error responding to invitation:', error);
    throw error;
  }
}
