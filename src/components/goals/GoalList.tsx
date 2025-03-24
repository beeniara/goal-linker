
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import GoalCard from './GoalCard';

type Goal = {
  id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'purchase' | 'general';
  target: number;
  current: number;
  deadline?: Date;
  projectId?: string;
  category?: string;
  milestones?: { title: string; completed: boolean }[];
  members?: string[];
  completed: boolean;
};

type GoalListProps = {
  goals: Goal[];
  loading: boolean;
  filteredGoals: Goal[];
  searchQuery: string;
  activeTab: string;
  error: string | null;
};

const GoalList = ({ goals, loading, filteredGoals, searchQuery, activeTab, error }: GoalListProps) => {
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredGoals.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No goals found</h3>
        <p className="text-muted-foreground mb-6">
          {searchQuery ? 'No goals match your search' : 'Get started by creating your first goal'}
        </p>
        <Button asChild>
          <Link to="/goals/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Goal
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredGoals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
};

export default GoalList;
