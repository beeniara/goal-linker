
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  PlusCircle,
  Search,
  Filter,
  Users,
  User,
  Calendar,
  DollarSign,
  Heart,
  PiggyBank,
} from 'lucide-react';

export default function Savings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("financial");
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Savings Strategies</h1>
          <p className="text-muted-foreground">
            Track your savings goals and motivational support systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/financial-strategies')}>
            <DollarSign className="mr-2 h-4 w-4" />
            New Financial Goal
          </Button>
          <Button variant="outline" onClick={() => navigate('/non-financial-support')}>
            <Heart className="mr-2 h-4 w-4" />
            New Support Strategy
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="financial">
              <DollarSign className="mr-2 h-4 w-4" />
              Financial Goals
            </TabsTrigger>
            <TabsTrigger value="support">
              <Heart className="mr-2 h-4 w-4" />
              Support Strategies
            </TabsTrigger>
          </TabsList>
          
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="financial">
          <EmptyFinancialState />
        </TabsContent>
        
        <TabsContent value="support">
          <EmptySupportState />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyFinancialState() {
  return (
    <div className="text-center py-16 border rounded-lg bg-muted/20">
      <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No savings goals yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start your saving journey by creating your first financial goal. It's the first step toward financial success!
      </p>
      <Button asChild>
        <Link to="/financial-strategies">Create Your First Savings Goal</Link>
      </Button>
    </div>
  );
}

function EmptySupportState() {
  return (
    <div className="text-center py-16 border rounded-lg bg-muted/20">
      <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No support strategies yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create your first non-financial support strategy to boost your motivation and savings success!
      </p>
      <Button asChild>
        <Link to="/non-financial-support">Create Your First Strategy</Link>
      </Button>
    </div>
  );
}

// These would be populated from Firebase in a real implementation
function SavingsGoalsList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Sample card - would be mapped from real data */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="font-bold">New Laptop</CardTitle>
            <Badge>
              <DollarSign className="h-3 w-3 mr-1" />
              Financial
            </Badge>
          </div>
          <CardDescription>Saving for a new work computer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">$400 of $1,200</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>3 months left</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <User className="h-3.5 w-3.5 mr-1" />
              <span>Personal</span>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/financial-goal/1">View Details</Link>
          </Button>
        </CardContent>
      </Card>
      
      {/* Loading states would be shown while data fetches */}
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
