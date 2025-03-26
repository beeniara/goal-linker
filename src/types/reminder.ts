
export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  dueTime?: string;
  urgency: 'low' | 'medium' | 'high';
  completed: boolean;
  parentId?: string;
  isMain: boolean;
  createdAt: Date;
  children?: ReminderItem[]; // Add children array for better hierarchical structure
}
