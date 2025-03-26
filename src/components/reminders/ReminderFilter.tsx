
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ReminderFilterProps {
  activeTab: 'due' | 'today' | 'overdue' | 'completed' | 'all' | 'urgency';
  selectedUrgency: 'low' | 'medium' | 'high' | 'all';
  searchQuery: string;
  onTabChange: (value: string) => void;
  onUrgencyChange: (value: 'low' | 'medium' | 'high' | 'all') => void;
  onSearchChange: (value: string) => void;
}

export const ReminderFilter: React.FC<ReminderFilterProps> = ({
  activeTab,
  selectedUrgency,
  searchQuery,
  onTabChange,
  onUrgencyChange,
  onSearchChange
}) => {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search reminders..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="due" value={activeTab} onValueChange={onTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="due">Due Soon</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="urgency">Urgency</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        {activeTab === 'urgency' && (
          <div className="mb-4 flex space-x-2">
            <Badge 
              className={`cursor-pointer ${selectedUrgency === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              onClick={() => onUrgencyChange('all')}
            >
              All
            </Badge>
            <Badge 
              className={`cursor-pointer ${selectedUrgency === 'high' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}
              onClick={() => onUrgencyChange('high')}
            >
              High
            </Badge>
            <Badge 
              className={`cursor-pointer ${selectedUrgency === 'medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}
              onClick={() => onUrgencyChange('medium')}
            >
              Medium
            </Badge>
            <Badge 
              className={`cursor-pointer ${selectedUrgency === 'low' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}`}
              onClick={() => onUrgencyChange('low')}
            >
              Low
            </Badge>
          </div>
        )}
      </Tabs>
    </>
  );
};
