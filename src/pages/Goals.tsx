
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import GoalFilter from '@/components/goals/GoalFilter';
import GoalList from '@/components/goals/GoalList';
import { Tabs, TabsContent } from '@/components/ui/tabs';

const Goals = () => {
  const { 
    loading, 
    error, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    filteredGoals,
    goals
  } = useGoals();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Button asChild>
          <Link to="/goals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Link>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <GoalFilter 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <TabsContent value={activeTab} className="space-y-4 mt-0">
          <GoalList 
            goals={goals}
            loading={loading} 
            filteredGoals={filteredGoals} 
            searchQuery={searchQuery} 
            activeTab={activeTab} 
            error={error} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;
