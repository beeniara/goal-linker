
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// This is a placeholder function that would connect to a backend service
// In a real app, this would trigger an email via a cloud function or backend
export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
) {
  console.log(`[EMAIL NOTIFICATION] To: ${email}, Subject: ${subject}, Message: ${message}`);
  try {
    // Log the notification in Firestore for demo purposes
    await addDoc(collection(db, 'emailNotifications'), {
      to: email,
      subject,
      message,
      sent: false, // In a real implementation with a cloud function, this would be updated when sent
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error logging email notification:', error);
    return false;
  }
}

export interface ReminderNotification {
  id?: string;
  reminderId: string;
  reminderTitle: string;
  userId: string;
  userEmail: string;
  frequency: 'once' | '12h' | '24h';
  nextSendTime: Date;
  lastSentAt?: Date;
  isActive: boolean;
}

export async function createReminderNotification(
  reminderId: string,
  reminderTitle: string,
  userId: string,
  userEmail: string,
  frequency: 'once' | '12h' | '24h' = '24h'
) {
  try {
    console.log(`Creating reminder notification for ${userEmail} for reminder ${reminderId}`);
    
    // Calculate next send time based on frequency
    const now = new Date();
    let nextSendTime = new Date();
    
    if (frequency === '12h') {
      nextSendTime.setHours(now.getHours() - 12); // Send when 12 hours are left
    } else if (frequency === '24h') {
      nextSendTime.setHours(now.getHours() - 24); // Send when 24 hours are left
    } else {
      // For 'once', send right away
      nextSendTime = now;
    }
    
    const notification: ReminderNotification = {
      reminderId,
      reminderTitle,
      userId,
      userEmail,
      frequency,
      nextSendTime,
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'reminderNotifications'), notification);
    console.log('Reminder notification created with ID:', docRef.id);
    
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('Error creating reminder notification:', error);
    throw error;
  }
}

export async function updateReminderNotificationFrequency(
  notificationId: string,
  frequency: 'once' | '12h' | '24h'
) {
  try {
    console.log(`Updating reminder notification ${notificationId} frequency to ${frequency}`);
    
    const notificationRef = doc(db, 'reminderNotifications', notificationId);
    await updateDoc(notificationRef, { frequency });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating reminder notification frequency:', error);
    throw error;
  }
}

export async function deleteReminderNotification(notificationId: string) {
  try {
    console.log(`Deleting reminder notification ${notificationId}`);
    
    await deleteDoc(doc(db, 'reminderNotifications', notificationId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting reminder notification:', error);
    throw error;
  }
}

export async function getUserReminderNotifications(userId: string) {
  try {
    console.log(`Fetching reminder notifications for user ${userId}`);
    
    const notificationsRef = collection(db, 'reminderNotifications');
    const q = query(notificationsRef, where('userId', '==', userId), where('isActive', '==', true));
    
    const querySnapshot = await getDocs(q);
    const notifications: ReminderNotification[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        nextSendTime: data.nextSendTime.toDate(),
        lastSentAt: data.lastSentAt ? data.lastSentAt.toDate() : undefined
      } as ReminderNotification);
    });
    
    console.log(`Found ${notifications.length} active reminder notifications`);
    return notifications;
  } catch (error) {
    console.error('Error fetching user reminder notifications:', error);
    throw error;
  }
}
