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

export async function inviteUserToSavings(
  savingsId: string,
  savingsTitle: string,
  inviterId: string,
  inviterName: string,
  inviteeEmail: string
) {
  try {
    console.log(`Inviting ${inviteeEmail} to savings group ${savingsId}`);
    
    // Check if invitation already exists
    const invitationsRef = collection(db, 'savingsInvitations');
    const q = query(
      invitationsRef, 
      where('savingsId', '==', savingsId),
      where('inviteeEmail', '==', inviteeEmail),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      console.log('Invitation already exists');
      return { success: false, message: 'Invitation already sent to this user' };
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
        return { success: true, invitationId: docRef.id, warning: 'Invitation created but email notification failed' };
      }
      
      return { success: true, invitationId: docRef.id };
    } catch (firebaseError: any) {
      console.error('Firebase error creating invitation:', firebaseError);
      let errorMessage = 'Failed to create invitation. Please check your permissions.';
      
      if (firebaseError.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure Firebase security rules are properly set up.';
      }
      
      return { success: false, message: errorMessage, error: firebaseError };
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
