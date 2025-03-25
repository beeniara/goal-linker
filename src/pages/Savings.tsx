
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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

// Type definition for a savings goal
interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  target: number;
  current: number;
  frequency: string;
  contributionAmount: number;
  method: string;
  createdAt: any;
  updatedAt: any;
  completed: boolean;
}

// Type definition for a support strategy
interface SupportStrategy {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  method: string;
  createdAt: any;
  updatedAt: any;
}

export default function Savings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("financial");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [financialGoals, setFinancialGoals] = useState<SavingsGoal[]>([]);
  const [supportStrategies, setSupportStrategies] = useState<SupportStrategy[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch financial goals
        const financialQuery = query(
          collection(db, 'savings'),
          where('userId', '==', currentUser.uid)
        );
        
        const financialSnapshot = await getDocs(financialQuery);
        const financialData = financialSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavingsGoal[];
        
        setFinancialGoals(financialData);
        
        // Fetch support strategies
        const supportQuery = query(
          collection(db, 'support'),
          where('userId', '==', currentUser.uid)
        );
        
        const supportSnapshot = await getDocs(supportQuery);
        const supportData = supportSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SupportStrategy[];
        
        setSupportStrategies(supportData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load your savings data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load your savings data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, toast]);
  
  // Filter goals/strategies based on search query
  const filteredFinancialGoals = financialGoals.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredSupportStrategies = supportStrategies.filter(strategy => 
    strategy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    strategy.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}
      
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
          {isLoading ? (
            <SavingsGoalsSkeletons />
          ) : filteredFinancialGoals.length > 0 ? (
            <SavingsGoalsList goals={filteredFinancialGoals} />
          ) : (
            <EmptyFinancialState />
          )}
        </TabsContent>
        
        <TabsContent value="support">
          {isLoading ? (
            <SavingsGoalsSkeletons />
          ) : filteredSupportStrategies.length > 0 ? (
            <SupportStrategiesList strategies={filteredSupportStrategies} />
          ) : (
            <EmptySupportState />
          )}
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

function SavingsGoalsSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
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

function SavingsGoalsList({ goals }: { goals: SavingsGoal[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="font-bold">{goal.title}</CardTitle>
              <Badge>
                <DollarSign className="h-3 w-3 mr-1" />
                Financial
              </Badge>
            </div>
            <CardDescription>{goal.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">${goal.current} of ${goal.target}</span>
              </div>
              <Progress 
                value={(goal.current / goal.target) * 100} 
                className="h-2" 
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>
                  {Math.ceil((goal.target - goal.current) / goal.contributionAmount)} {goal.frequency}s left
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="capitalize">{goal.method}</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/savings/${goal.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SupportStrategiesList({ strategies }: { strategies: SupportStrategy[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {strategies.map((strategy) => (
        <Card key={strategy.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="font-bold">{strategy.title}</CardTitle>
              <Badge variant="secondary">
                <Heart className="h-3 w-3 mr-1" />
                Support
              </Badge>
            </div>
            <CardDescription>{strategy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm mb-2">
              <span className="text-muted-foreground mr-2">Type:</span>
              <Badge variant="outline" className="capitalize">
                {strategy.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                {strategy.method === 'single' ? (
                  <User className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Users className="h-3.5 w-3.5 mr-1" />
                )}
                <span className="capitalize">{strategy.method}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Created {new Date(strategy.createdAt.toDate()).toLocaleDateString()}</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/support/${strategy.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
