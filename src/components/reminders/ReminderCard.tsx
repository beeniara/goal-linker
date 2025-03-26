
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  Bell, 
  Edit, 
  Trash, 
  Plus, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { ReminderItem } from '@/types/reminder';

interface ReminderCardProps {
  mainReminder: ReminderItem;
  subReminders: ReminderItem[];
  isExpanded: boolean;
  showCompactView: boolean;
  activeTab: string;
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
  onAddSubtask: (parentId: string) => void;
  getUrgencyColor: (urgency: string) => string;
  isOverdue: (dueDate?: Date) => boolean;
  isDueToday: (dueDate?: Date) => boolean;
  isDueWithinHours: (dueDate?: Date, hours?: number) => boolean;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  mainReminder,
  subReminders,
  isExpanded,
  showCompactView,
  activeTab,
  displayPreferences,
  onToggleExpand,
  onToggleComplete,
  onEdit,
  onDelete,
  onNotificationSettings,
  onAddSubtask,
  getUrgencyColor,
  isOverdue,
  isDueToday,
  isDueWithinHours
}) => {
  return (
    <Card 
      className={`
        ${mainReminder.completed ? 'bg-muted/20' : ''}
        ${isOverdue(mainReminder.dueDate) && !mainReminder.completed ? 'border-red-300' : ''}
        ${isDueToday(mainReminder.dueDate) && !mainReminder.completed ? 'border-yellow-300' : ''}
      `}
    >
      <CardHeader className={`${showCompactView ? 'pb-3' : 'pb-2'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {activeTab === 'due' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-6 w-6"
                onClick={() => onToggleExpand(mainReminder.id)}
              >
                {isExpanded ? 
                  <ChevronDown className="h-5 w-5" /> : 
                  <ChevronRight className="h-5 w-5" />
                }
              </Button>
            ) : (
              <Checkbox 
                checked={mainReminder.completed}
                onCheckedChange={(checked) => 
                  onToggleComplete(mainReminder.id, checked === true)
                }
                className="mt-1"
              />
            )}
            <div>
              <CardTitle className={`${mainReminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                {mainReminder.title}
              </CardTitle>
              {displayPreferences.showDescription && !showCompactView && mainReminder.description && (
                <CardDescription className={`${mainReminder.completed ? 'line-through' : ''}`}>
                  {mainReminder.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {displayPreferences.showUrgency && !mainReminder.completed && !showCompactView && (
              <Badge className={getUrgencyColor(mainReminder.urgency)}>
                {mainReminder.urgency.charAt(0).toUpperCase() + mainReminder.urgency.slice(1)}
              </Badge>
            )}
            
            {!showCompactView && (
              <div className="flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onNotificationSettings(mainReminder)}
                  title="Set up reminders"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEdit(mainReminder)}
                  title="Edit reminder"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDelete(mainReminder.id)}
                  title="Delete reminder"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {displayPreferences.showDueDate && (mainReminder.dueDate || mainReminder.dueTime) && !showCompactView && (
          <div className={`flex items-center text-sm mt-1 ${
            isOverdue(mainReminder.dueDate) && !mainReminder.completed 
              ? 'text-red-500' 
              : isDueToday(mainReminder.dueDate) && !mainReminder.completed
                ? 'text-yellow-600'
                : 'text-muted-foreground'
          }`}>
            {mainReminder.dueDate && (
              <>
                <Calendar className="h-3 w-3 mr-1" />
                {mainReminder.dueDate.toLocaleDateString()}
              </>
            )}
            {mainReminder.dueTime && (
              <>
                <Clock className="h-3 w-3 mx-1" />
                {mainReminder.dueTime}
              </>
            )}
            {isOverdue(mainReminder.dueDate) && !mainReminder.completed && (
              <span className="ml-1 font-medium">(Overdue)</span>
            )}
            {isDueToday(mainReminder.dueDate) && !mainReminder.completed && !isOverdue(mainReminder.dueDate) && (
              <span className="ml-1 font-medium">(Today)</span>
            )}
            {isDueWithinHours(mainReminder.dueDate, 24) && !isDueToday(mainReminder.dueDate) && !mainReminder.completed && (
              <span className="ml-1 font-medium">(Due Soon)</span>
            )}
          </div>
        )}
      </CardHeader>
      
      {displayPreferences.showSubtasks && subReminders.length > 0 && !showCompactView && (
        <CardContent>
          <div className="border-l-2 border-muted pl-4 space-y-2 ml-6">
            {subReminders.map((subReminder) => (
              <div 
                key={subReminder.id}
                className={`flex items-start justify-between p-2 rounded-md ${
                  subReminder.completed ? 'bg-muted/10' : 'hover:bg-muted/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={subReminder.completed}
                    onCheckedChange={(checked) => 
                      onToggleComplete(subReminder.id, checked === true)
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className={`font-medium ${subReminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subReminder.title}
                    </div>
                    {displayPreferences.showDescription && subReminder.description && (
                      <p className={`text-sm ${subReminder.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {subReminder.description}
                      </p>
                    )}
                    {displayPreferences.showDueDate && (subReminder.dueDate || subReminder.dueTime) && (
                      <div className={`flex items-center text-xs mt-1 ${
                        isOverdue(subReminder.dueDate) && !subReminder.completed 
                          ? 'text-red-500' 
                          : isDueToday(subReminder.dueDate) && !subReminder.completed
                            ? 'text-yellow-600'
                            : 'text-muted-foreground'
                      }`}>
                        {subReminder.dueDate && (
                          <>
                            <Calendar className="h-3 w-3 mr-1" />
                            {subReminder.dueDate.toLocaleDateString()}
                          </>
                        )}
                        {subReminder.dueTime && (
                          <>
                            <Clock className="h-3 w-3 mx-1" />
                            {subReminder.dueTime}
                          </>
                        )}
                        {isOverdue(subReminder.dueDate) && !subReminder.completed && (
                          <span className="ml-1 font-medium">(Overdue)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {displayPreferences.showUrgency && !subReminder.completed && (
                    <Badge className={`text-xs ${getUrgencyColor(subReminder.urgency)}`}>
                      {subReminder.urgency.charAt(0).toUpperCase() + subReminder.urgency.slice(1)}
                    </Badge>
                  )}
                  
                  <div className="flex">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(subReminder)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(subReminder.id)}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      
      <CardContent className={subReminders.length > 0 && !showCompactView ? 'pt-0' : ''}>
        {!showCompactView && (
          <Button 
            variant="ghost" 
            className="text-sm" 
            onClick={() => onAddSubtask(mainReminder.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Sub-task
          </Button>
        )}
        {showCompactView && (
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="text-sm" 
              onClick={() => onToggleExpand(mainReminder.id)}
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Show Details
            </Button>
            <Checkbox 
              checked={mainReminder.completed}
              onCheckedChange={(checked) => 
                onToggleComplete(mainReminder.id, checked === true)
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
