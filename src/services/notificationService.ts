
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';

// Email notification service
export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
) {
  console.log(`[EMAIL NOTIFICATION] To: ${email}, Subject: ${subject}, Message: ${message}`);
  try {
    // Log the notification in Firestore for demo purposes
    const docRef = await addDoc(collection(db, 'emailNotifications'), {
      to: email,
      subject,
      message,
      sent: false, // In a real implementation with a cloud function, this would be updated when sent
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    
    console.log(`Email notification logged with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error logging email notification:', error);
    return { success: false, error };
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
  createdAt?: Date;
}

export async function createReminderNotification(
  reminderId: string,
  reminderTitle: string,
  userId: string,
  userEmail: string,
  frequency: 'once' | '12h' | '24h' = '24h'
): Promise<{ success: boolean; notificationId?: string; error?: any }> {
  try {
    console.log(`Creating reminder notification for ${userEmail} for reminder ${reminderId}`);
    
    // Check if notification already exists
    const existingNotification = await getReminderNotification(reminderId, userId);
    if (existingNotification) {
      console.log(`Notification already exists for reminder ${reminderId}, updating instead`);
      return updateReminderNotificationFrequency(existingNotification.id!, frequency);
    }
    
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
      isActive: true,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'reminderNotifications'), notification);
    console.log('Reminder notification created with ID:', docRef.id);
    
    // Send confirmation email
    await sendEmailNotification(
      userEmail,
      'Reminder Notification Enabled',
      `You've set up a reminder notification for "${reminderTitle}". You'll be notified ${frequency === 'once' ? 'when it is due' : `${frequency} before it is due`}.`
    );
    
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('Error creating reminder notification:', error);
    return { success: false, error };
  }
}

export async function getReminderNotification(
  reminderId: string,
  userId: string
): Promise<ReminderNotification | null> {
  try {
    const notificationsRef = collection(db, 'reminderNotifications');
    const q = query(
      notificationsRef, 
      where('reminderId', '==', reminderId),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { 
      id: doc.id, 
      ...doc.data(),
      nextSendTime: doc.data().nextSendTime.toDate(),
      lastSentAt: doc.data().lastSentAt ? doc.data().lastSentAt.toDate() : undefined,
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : undefined
    } as ReminderNotification;
    
  } catch (error) {
    console.error('Error getting reminder notification:', error);
    return null;
  }
}

export async function updateReminderNotificationFrequency(
  notificationId: string,
  frequency: 'once' | '12h' | '24h'
): Promise<{ success: boolean; notificationId?: string; error?: any }> {
  try {
    console.log(`Updating reminder notification ${notificationId} frequency to ${frequency}`);
    
    const notificationRef = doc(db, 'reminderNotifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);
    
    if (!notificationSnap.exists()) {
      return { success: false, error: 'Notification not found' };
    }
    
    // Calculate new next send time
    const now = new Date();
    let nextSendTime = new Date();
    
    if (frequency === '12h') {
      nextSendTime.setHours(now.getHours() - 12);
    } else if (frequency === '24h') {
      nextSendTime.setHours(now.getHours() - 24);
    } else {
      nextSendTime = now;
    }
    
    await updateDoc(notificationRef, { 
      frequency,
      nextSendTime,
      updatedAt: serverTimestamp()
    });
    
    // Send confirmation email about the update
    const data = notificationSnap.data();
    if (data.userEmail) {
      await sendEmailNotification(
        data.userEmail,
        'Reminder Notification Updated',
        `Your notification settings for "${data.reminderTitle}" have been updated. You'll now be notified ${frequency === 'once' ? 'when it is due' : `${frequency} before it is due`}.`
      );
    }
    
    return { success: true, notificationId };
  } catch (error) {
    console.error('Error updating reminder notification frequency:', error);
    return { success: false, error };
  }
}

export async function deleteReminderNotification(
  notificationId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`Deleting reminder notification ${notificationId}`);
    
    const notificationRef = doc(db, 'reminderNotifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);
    
    if (notificationSnap.exists()) {
      const data = notificationSnap.data();
      
      // Option 1: Soft delete (recommended for audit trail)
      await updateDoc(notificationRef, { 
        isActive: false,
        deactivatedAt: serverTimestamp()
      });
      
      // Option 2: Hard delete
      // await deleteDoc(notificationRef);
      
      // Send confirmation email
      if (data.userEmail) {
        await sendEmailNotification(
          data.userEmail,
          'Reminder Notification Disabled',
          `Your notification for "${data.reminderTitle}" has been disabled.`
        );
      }
    } else {
      return { success: false, error: 'Notification not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting reminder notification:', error);
    return { success: false, error };
  }
}

export async function getUserReminderNotifications(
  userId: string
): Promise<ReminderNotification[]> {
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
        lastSentAt: data.lastSentAt ? data.lastSentAt.toDate() : undefined,
        createdAt: data.createdAt ? data.createdAt.toDate() : undefined
      } as ReminderNotification);
    });
    
    console.log(`Found ${notifications.length} active reminder notifications`);
    return notifications;
  } catch (error) {
    console.error('Error fetching user reminder notifications:', error);
    return [];
  }
}

// Helper function to check if a notification should be sent
export async function checkAndSendDueNotifications() {
  try {
    const now = new Date();
    const notificationsRef = collection(db, 'reminderNotifications');
    const q = query(notificationsRef, where('isActive', '==', true), where('nextSendTime', '<=', now));
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} notifications that need to be sent`);
    
    const sendPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const notification = docSnapshot.data() as ReminderNotification;
      const notificationId = docSnapshot.id;
      
      try {
        // Send the email notification
        await sendEmailNotification(
          notification.userEmail,
          `Reminder: ${notification.reminderTitle}`,
          `This is a reminder that "${notification.reminderTitle}" is ${notification.frequency === 'once' ? 'now due' : `due in ${notification.frequency}`}.`
        );
        
        // Update the notification record
        await updateDoc(doc(db, 'reminderNotifications', notificationId), {
          lastSentAt: serverTimestamp(),
          nextSendTime: notification.frequency === 'once' 
            ? new Date(8640000000000000) // Far future date for one-time notifications
            : new Date(now.getTime() + (notification.frequency === '12h' ? 12 : 24) * 60 * 60 * 1000)
        });
        
        return { success: true, notificationId };
      } catch (err) {
        console.error(`Error processing notification ${notificationId}:`, err);
        return { success: false, notificationId, error: err };
      }
    });
    
    return Promise.all(sendPromises);
  } catch (error) {
    console.error('Error checking and sending notifications:', error);
    return [];
  }
}
