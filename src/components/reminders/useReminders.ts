import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { ReminderItem } from '@/types/reminder';

export const useReminders = (userId: string | undefined) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReminders, setExpandedReminders] = useState<Record<string, boolean>>({});
  
  const fetchReminders = async () => {
    if (!userId) {
      console.error("Cannot fetch reminders: No authenticated user");
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching reminders for user:", userId);
      setLoading(true);
      setError(null);
      
      const remindersRef = collection(db, 'reminders');
      const q = query(
        remindersRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} reminders`);
      
      const remindersList: ReminderItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        remindersList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
          dueTime: data.dueTime,
          urgency: data.urgency,
          completed: data.completed || false,
          parentId: data.parentId,
          isMain: data.isMain || false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        });
      });
      
      setReminders(remindersList);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError('Failed to load reminders. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load reminders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (
    title: string,
    description: string,
    dueDate: string,
    dueTime: string,
    urgency: 'low' | 'medium' | 'high',
    parentId?: string
  ) => {
    if (!userId) {
      console.error("Cannot add reminder: No authenticated user");
      setError("Authentication required. Please log in.");
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add reminders.',
        variant: 'destructive',
      });
      return false;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Reminder title is required.',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Adding new reminder for user:", userId);
      setError(null);
      
      const newReminder = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime: dueTime || null,
        urgency: urgency,
        completed: false,
        parentId: parentId || null,
        isMain: !parentId,
        userId: userId,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'reminders'), newReminder);
      console.log("Reminder added with ID:", docRef.id);
      
      toast({
        title: 'Success',
        description: 'Reminder added successfully',
      });
      
      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error adding reminder:', error);
      let errorMessage = 'Failed to add reminder. Please try again.';
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateReminder = async (
    reminderId: string,
    title: string,
    description: string,
    dueDate: string,
    dueTime: string,
    urgency: 'low' | 'medium' | 'high',
    parentId?: string
  ) => {
    if (!userId) return false;
    
    try {
      setIsSubmitting(true);
      const reminderRef = doc(db, 'reminders', reminderId);
      
      const updates = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime: dueTime || null,
        urgency: urgency,
        parentId: parentId || null,
        isMain: !parentId,
      };
      
      await updateDoc(reminderRef, updates);
      
      toast({
        title: 'Success',
        description: 'Reminder updated successfully',
      });
      
      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reminder. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!userId) return false;
    
    try {
      // Find any sub-reminders
      const subReminders = reminders.filter(rem => rem.parentId === reminderId);
      
      // Delete all sub-reminders
      if (subReminders.length > 0) {
        for (const subReminder of subReminders) {
          await deleteDoc(doc(db, 'reminders', subReminder.id));
        }
      }
      
      // Delete the main reminder
      await deleteDoc(doc(db, 'reminders', reminderId));
      
      toast({
        title: 'Success',
        description: 'Reminder deleted successfully',
      });
      
      await fetchReminders();
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reminder. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleComplete = async (reminderId: string, completed: boolean) => {
    if (!userId) return false;
    
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      await updateDoc(reminderRef, { completed });
      
      setReminders(prev => 
        prev.map(rem => 
          rem.id === reminderId ? { ...rem, completed } : rem
        )
      );
      
      toast({
        title: completed ? 'Reminder completed' : 'Reminder reopened',
        description: `The reminder has been marked as ${completed ? 'completed' : 'incomplete'}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reminder status. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleExpandReminder = (reminderId: string) => {
    setExpandedReminders(prev => ({
      ...prev,
      [reminderId]: !prev[reminderId]
    }));
  };

  const isDueToday = (dueDate?: Date) => {
    if (!dueDate) return false;
    
    const today = new Date();
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateCopy = new Date(dueDate);
    dueDateCopy.setHours(0, 0, 0, 0);
    
    return dueDateCopy < today;
  };

  const isDueWithinHours = (dueDate?: Date, hours: number = 24) => {
    if (!dueDate) return false;
    
    const now = new Date();
    const future = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    return dueDate <= future && dueDate >= now;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReminders();
    }
  }, [userId]);

  return {
    reminders,
    loading,
    error,
    isSubmitting,
    expandedReminders,
    setExpandedReminders,
    fetchReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    toggleExpandReminder,
    isDueToday,
    isOverdue,
    isDueWithinHours,
    getUrgencyColor,
  };
};
