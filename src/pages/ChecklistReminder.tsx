import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReminderNotificationDialog } from '@/components/reminders/ReminderNotificationDialog';
import { ReminderFilter } from '@/components/reminders/ReminderFilter';
import { ReminderList } from '@/components/reminders/ReminderList';
import { ReminderForm } from '@/components/reminders/ReminderForm';
import { ErrorBoundary } from '@/components/reminders/ErrorBoundary';
import { useReminders } from '@/components/reminders/useReminders';
import { ReminderItem } from '@/types/reminder';

const ChecklistReminder: React.FC = () => {
  const { currentUser } = useAuth();
  
  // State for UI
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderItem | null>(null);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'due' | 'today' | 'overdue' | 'completed' | 'all' | 'urgency'>('due');
  const [selectedUrgency, setSelectedUrgency] = useState<'low' | 'medium' | 'high' | 'all'>('all');
  const [displayPreferences, setDisplayPreferences] = useState({
    showSubtasks: true,
    showDescription: true,
    showDueDate: true,
    showUrgency: true,
  });
  
  // Form state
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderDueDate, setNewReminderDueDate] = useState('');
  const [newReminderDueTime, setNewReminderDueTime] = useState('');
  const [newReminderUrgency, setNewReminderUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [newReminderParentId, setNewReminderParentId] = useState<string | undefined>(undefined);

  // Use the custom hook for reminders functionality
  const {
    reminders,
    loading,
    error,
    isSubmitting,
    expandedReminders,
    setExpandedReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    toggleExpandReminder,
    isDueToday,
    isOverdue,
    isDueWithinHours,
    getUrgencyColor,
  } = useReminders(currentUser?.uid);

  // Filter and sort the reminders
  const filteredReminders = reminders
    .filter(reminder => {
      if (searchQuery && !reminder.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      switch (activeTab) {
        case 'due':
          // Only show reminders due within 24 hours and not completed
          return !reminder.completed && reminder.dueDate && isDueWithinHours(reminder.dueDate, 24);
        case 'completed':
          return reminder.completed;
        case 'today':
          return isDueToday(reminder.dueDate) && !reminder.completed;
        case 'overdue':
          return isOverdue(reminder.dueDate) && !reminder.completed;
        case 'urgency':
          if (selectedUrgency === 'all') {
            return !reminder.completed;
          }
          return !reminder.completed && reminder.urgency === selectedUrgency;
        case 'all':
          return true;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // For "Due" tab, sort by urgency first, then by date/time
      if (activeTab === 'due') {
        const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        
        // Then sort by date/time
        if (a.dueDate && b.dueDate) {
          // If both have time, compare the full datetime
          if (a.dueTime && b.dueTime) {
            const aDateTime = new Date(a.dueDate);
            const aParts = a.dueTime.split(':');
            aDateTime.setHours(parseInt(aParts[0]), parseInt(aParts[1]));
            
            const bDateTime = new Date(b.dueDate);
            const bParts = b.dueTime.split(':');
            bDateTime.setHours(parseInt(bParts[0]), parseInt(bParts[1]));
            
            return aDateTime.getTime() - bDateTime.getTime();
          }
          
          // Otherwise just compare dates
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
      }
      
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      
      const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  const mainReminders = filteredReminders.filter(r => r.isMain);

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
    
    // Reset expanded state when changing tabs
    if (value === 'due') {
      // Collapse all in the due tab by default
      const newExpandedState: Record<string, boolean> = {};
      mainReminders.forEach(reminder => {
        newExpandedState[reminder.id] = false;
      });
      setExpandedReminders(newExpandedState);
    }
  };

  const handleEditReminder = (reminder: ReminderItem) => {
    setEditingReminder(reminder);
    setNewReminderTitle(reminder.title);
    setNewReminderDescription(reminder.description || '');
    setNewReminderDueDate(reminder.dueDate ? reminder.dueDate.toISOString().split('T')[0] : '');
    setNewReminderDueTime(reminder.dueTime || '');
    setNewReminderUrgency(reminder.urgency);
    setNewReminderParentId(reminder.parentId);
    setDialogOpen(true);
  };

  const handleNotificationSettings = (reminder: ReminderItem) => {
    setSelectedReminder(reminder);
    setNotificationDialogOpen(true);
  };

  const handleAddReminder = () => {
    setEditingReminder(null);
    setNewReminderTitle('');
    setNewReminderDescription('');
    setNewReminderDueDate('');
    setNewReminderDueTime('');
    setNewReminderUrgency('medium');
    setNewReminderParentId(undefined);
    setDialogOpen(true);
  };

  const handleAddSubReminder = (parentId: string) => {
    setEditingReminder(null);
    setNewReminderTitle('');
    setNewReminderDescription('');
    setNewReminderDueDate('');
    setNewReminderDueTime('');
    setNewReminderUrgency('medium');
    setNewReminderParentId(parentId);
    setDialogOpen(true);
  };

  const handleSubmitForm = async () => {
    if (editingReminder) {
      const success = await updateReminder(
        editingReminder.id,
        newReminderTitle,
        newReminderDescription,
        newReminderDueDate,
        newReminderDueTime,
        newReminderUrgency,
        newReminderParentId
      );
      
      if (success) {
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const success = await addReminder(
        newReminderTitle,
        newReminderDescription,
        newReminderDueDate,
        newReminderDueTime,
        newReminderUrgency,
        newReminderParentId
      );
      
      if (success) {
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setEditingReminder(null);
    setNewReminderTitle('');
    setNewReminderDescription('');
    setNewReminderDueDate('');
    setNewReminderDueTime('');
    setNewReminderUrgency('medium');
    setNewReminderParentId(undefined);
  };

  const handleCustomizeDisplay = () => {
    const dialog = window.confirm(
      "Do you want to customize what information is shown for each reminder?\n\n" +
      "- Show subtasks\n" +
      "- Show descriptions\n" +
      "- Show due dates\n" +
      "- Show urgency"
    );
    
    if (dialog) {
      const showSubtasks = window.confirm("Show subtasks?");
      const showDescription = window.confirm("Show descriptions?");
      const showDueDate = window.confirm("Show due dates?");
      const showUrgency = window.confirm("Show urgency labels?");
      
      setDisplayPreferences({
        showSubtasks,
        showDescription,
        showDueDate,
        showUrgency
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view and manage your reminders.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="default" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Checklist Reminders</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCustomizeDisplay}>
            Customize Display
          </Button>
          <Button onClick={handleAddReminder}>
            <Plus className="mr-2 h-4 w-4" />
            New Reminder
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="block mt-1 text-sm">
            Please check your Firebase configuration and ensure you have the correct permissions.
          </span>
          <div className="mt-3 text-xs bg-red-100 p-2 rounded">
            <p>Troubleshooting Tips:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Make sure you're signed in with valid credentials</li>
              <li>Check that Firestore is properly configured in your Firebase project</li>
              <li>Verify that your Firestore security rules allow this operation</li>
              <li>Ensure you have a stable internet connection</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Filter Component */}
      <ReminderFilter
        activeTab={activeTab}
        selectedUrgency={selectedUrgency}
        searchQuery={searchQuery}
        onTabChange={handleTabChange}
        onUrgencyChange={setSelectedUrgency}
        onSearchChange={setSearchQuery}
      />
      
      {/* Tabs Content */}
      <div className="space-y-4">
        <ReminderList
          loading={loading}
          activeTab={activeTab}
          selectedUrgency={selectedUrgency}
          searchQuery={searchQuery}
          mainReminders={mainReminders}
          filteredReminders={filteredReminders}
          expandedReminders={expandedReminders}
          displayPreferences={displayPreferences}
          onToggleExpand={toggleExpandReminder}
          onToggleComplete={toggleComplete}
          onEdit={handleEditReminder}
          onDelete={deleteReminder}
          onNotificationSettings={handleNotificationSettings}
          onAddReminder={handleAddReminder}
          onAddSubReminder={handleAddSubReminder}
          getUrgencyColor={getUrgencyColor}
          isOverdue={isOverdue}
          isDueToday={isDueToday}
          isDueWithinHours={isDueWithinHours}
        />
      </div>
      
      {/* Reminder Form */}
      <ReminderForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingReminder={editingReminder}
        newReminderTitle={newReminderTitle}
        newReminderDescription={newReminderDescription}
        newReminderDueDate={newReminderDueDate}
        newReminderDueTime={newReminderDueTime}
        newReminderUrgency={newReminderUrgency}
        newReminderParentId={newReminderParentId}
        mainReminders={mainReminders}
        isSubmitting={isSubmitting}
        onTitleChange={setNewReminderTitle}
        onDescriptionChange={setNewReminderDescription}
        onDueDateChange={setNewReminderDueDate}
        onDueTimeChange={setNewReminderDueTime}
        onUrgencyChange={setNewReminderUrgency}
        onParentIdChange={setNewReminderParentId}
        onSubmit={handleSubmitForm}
      />
      
      {/* Notification Dialog */}
      {selectedReminder && (
        <ReminderNotificationDialog
          open={notificationDialogOpen}
          onOpenChange={setNotificationDialogOpen}
          reminderId={selectedReminder.id}
          reminderTitle={selectedReminder.title}
          userId={currentUser.uid}
          userEmail={currentUser.email || ''}
          existingNotificationId={undefined}
          existingFrequency={undefined}
        />
      )}
    </div>
  );
};

// Export with ErrorBoundary
const ChecklistReminderWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <ChecklistReminder />
  </ErrorBoundary>
);

export default ChecklistReminderWithErrorBoundary;
