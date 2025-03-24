
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type GoalFilterProps = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const GoalFilter = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }: GoalFilterProps) => {
  return (
    <>
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search goals..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <TabsList className="mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
        <TabsTrigger value="purchase">Purchase</TabsTrigger>
        <TabsTrigger value="general">General</TabsTrigger>
      </TabsList>
    </>
  );
};

export default GoalFilter;
