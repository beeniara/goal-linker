
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReminderItem } from '@/types/reminder';

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReminder: ReminderItem | null;
  newReminderTitle: string;
  newReminderDescription: string;
  newReminderDueDate: string;
  newReminderDueTime: string;
  newReminderUrgency: 'low' | 'medium' | 'high';
  newReminderParentId: string | undefined;
  mainReminders: ReminderItem[];
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onDueTimeChange: (value: string) => void;
  onUrgencyChange: (value: 'low' | 'medium' | 'high') => void;
  onParentIdChange: (value: string | undefined) => void;
  onSubmit: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
  open,
  onOpenChange,
  editingReminder,
  newReminderTitle,
  newReminderDescription,
  newReminderDueDate,
  newReminderDueTime,
  newReminderUrgency,
  newReminderParentId,
  mainReminders,
  isSubmitting,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onDueTimeChange,
  onUrgencyChange,
  onParentIdChange,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingReminder ? 'Edit Reminder' : newReminderParentId ? 'Add Sub-task' : 'New Reminder'}
          </DialogTitle>
          <DialogDescription>
            {editingReminder 
              ? 'Update the details of your reminder' 
              : newReminderParentId
                ? 'Add a sub-task to your main reminder'
                : 'Create a new reminder to stay on track'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newReminderTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter reminder title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={newReminderDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Add more details"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newReminderDueDate}
                onChange={(e) => onDueDateChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={newReminderDueTime}
                onChange={(e) => onDueTimeChange(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select
              value={newReminderUrgency}
              onValueChange={(value) => onUrgencyChange(value as 'low' | 'medium' | 'high')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!editingReminder && !newReminderParentId && mainReminders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentId">Add as sub-task to (optional)</Label>
              <Select
                value={newReminderParentId || 'none'}
                onValueChange={(value) => onParentIdChange(value === 'none' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a main reminder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Create as main reminder)</SelectItem>
                  {mainReminders.map((reminder) => (
                    <SelectItem key={reminder.id} value={reminder.id}>
                      {reminder.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!newReminderTitle.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Processing...
              </>
            ) : (
              editingReminder ? 'Update' : 'Add'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
