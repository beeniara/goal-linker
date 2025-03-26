
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReminderCard } from './ReminderCard';
import { ReminderItem } from '@/types/reminder';

interface ReminderListProps {
  loading: boolean;
  activeTab: 'due' | 'today' | 'overdue' | 'completed' | 'all' | 'urgency';
  selectedUrgency: 'low' | 'medium' | 'high' | 'all';
  searchQuery: string;
  mainReminders: ReminderItem[];
  filteredReminders: ReminderItem[];
  expandedReminders: Record<string, boolean>;
  displayPreferences: {
    showSubtasks: boolean;
    showDescription: boolean;
    showDueDate: boolean;
    showUrgency: boolean;
  };
  onToggleExpand: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (reminder: ReminderItem) => void;
  onDelete: (id: string) => void;
  onNotificationSettings: (reminder: ReminderItem) => void;
  onAddReminder: () => void;
  onAddSubReminder: (parentId: string) => void;
  getUrgencyColor: (urgency: string) => string;
  isOverdue: (dueDate?: Date) => boolean;
  isDueToday: (dueDate?: Date) => boolean;
  isDueWithinHours: (dueDate?: Date, hours?: number) => boolean;
}

export const ReminderList: React.FC<ReminderListProps> = ({
  loading,
  activeTab,
  selectedUrgency,
  searchQuery,
  mainReminders,
  filteredReminders,
  expandedReminders,
  displayPreferences,
  onToggleExpand,
  onToggleComplete,
  onEdit,
  onDelete,
  onNotificationSettings,
  onAddReminder,
  onAddSubReminder,
  getUrgencyColor,
  isOverdue,
  isDueToday,
  isDueWithinHours
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-2">Loading reminders...</p>
      </div>
    );
  }

  if (mainReminders.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">
          {activeTab === 'completed' ? 'No completed reminders found' :
           activeTab === 'overdue' ? 'No overdue reminders found' :
           activeTab === 'today' ? 'No reminders due today' :
           activeTab === 'due' ? 'No reminders due in the next 24 hours' :
           activeTab === 'urgency' ? `No ${selectedUrgency !== 'all' ? selectedUrgency + ' urgency' : ''} reminders found` :
           'No reminders found'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery ? 'No reminders match your search' : 
           activeTab === 'completed' ? 'Complete tasks to see them here' :
           'Get started by creating your first reminder'}
        </p>
        <Button onClick={onAddReminder}>
          <Plus className="mr-2 h-4 w-4" />
          Create Reminder
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mainReminders.map((mainReminder) => {
        const subReminders = filteredReminders.filter(r => r.parentId === mainReminder.id);
        const isExpanded = expandedReminders[mainReminder.id] !== false;
        const showCompactView = activeTab === 'due' && !isExpanded;
        
        return (
          <ReminderCard
            key={mainReminder.id}
            mainReminder={mainReminder}
            subReminders={subReminders}
            isExpanded={isExpanded}
            showCompactView={showCompactView}
            activeTab={activeTab}
            displayPreferences={displayPreferences}
            onToggleExpand={onToggleExpand}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onNotificationSettings={onNotificationSettings}
            onAddSubtask={onAddSubReminder}
            getUrgencyColor={getUrgencyColor}
            isOverdue={isOverdue}
            isDueToday={isDueToday}
            isDueWithinHours={isDueWithinHours}
          />
        );
      })}
    </div>
  );
};
