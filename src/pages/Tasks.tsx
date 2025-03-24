
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Plus, 
  Search,
  Tag,
  Star,
  StarOff,
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Task = {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  dueDate?: Date;
  dueTime?: string;
  urgency: 'low' | 'medium' | 'high';
  priority: 1 | 2 | 3 | 4 | 5;
  category?: string;
  completed: boolean;
  overdue: boolean;
};

const Tasks = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      try {
        // This is a placeholder for the actual Firebase query
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const tasksList: Task[] = [];
        const uniqueCategories = new Set<string>();
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // Fetch project name for each task
          let projectName = "Unknown Project";
          if (data.projectId) {
            try {
              const projectDoc = await getDocs(
                query(collection(db, 'projects'), where('__name__', '==', data.projectId))
              );
              if (!projectDoc.empty) {
                projectName = projectDoc.docs[0].data().title;
              }
            } catch (error) {
              console.error('Error fetching project name:', error);
            }
          }
          
          // Check if task is overdue
          const dueDate = data.dueDate ? data.dueDate.toDate() : null;
          const isOverdue = dueDate ? dueDate < new Date() && !data.completed : false;
          
          // Add to categories list
          if (data.category) {
            uniqueCategories.add(data.category);
          }
          
          tasksList.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            projectId: data.projectId,
            projectName: projectName,
            dueDate: dueDate,
            dueTime: data.dueTime,
            urgency: data.urgency,
            priority: data.priority,
            category: data.category,
            completed: data.completed,
            overdue: isOverdue,
          });
        }
        
        setTasks(tasksList);
        setCategories(Array.from(uniqueCategories));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tasks. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser, toast]);

  const filteredAndSortedTasks = tasks
    .filter(task => {
      // Filter by tab (completed status)
      if (activeTab === 'active' && task.completed) return false;
      if (activeTab === 'completed' && !task.completed) return false;
      if (activeTab === 'overdue' && (!task.overdue || task.completed)) return false;
      
      // Filter by search query
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by urgency
      if (filterUrgency !== 'all' && task.urgency !== filterUrgency) {
        return false;
      }
      
      // Filter by priority
      if (filterPriority !== 'all' && task.priority !== parseInt(filterPriority)) {
        return false;
      }
      
      // Filter by category
      if (filterCategory !== 'all' && task.category !== filterCategory) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort tasks
      switch (sortBy) {
        case 'dueDate':
          // Tasks without due dates come last
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        
        case 'priority':
          return b.priority - a.priority;
        
        case 'urgency':
          const urgencyOrder = { high: 0, medium: 1, low: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        
        case 'title':
          return a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPriorityStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < priority ? (
          <Star className="h-3 w-3 fill-primary text-primary" />
        ) : (
          <StarOff className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
    ));
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button asChild>
          <Link to="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Sort by
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="urgency">Urgency</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-[130px]">
              <span className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Urgency
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px]">
              <span className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                Priority
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
          
          {categories.length > 0 && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[130px]">
                <span className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Category
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-1/3" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedTasks.length > 0 ? (
            <div className="space-y-2">
              {filteredAndSortedTasks.map((task) => (
                <Link to={`/tasks/${task.id}`} key={task.id}>
                  <Card className={`hover:bg-muted/30 transition-colors ${task.completed ? 'bg-muted/20' : ''} ${task.overdue && !task.completed ? 'border-red-300' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={task.completed}
                          className="mt-1"
                          // Stop propagation to prevent navigation when clicking the checkbox
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                            {!task.completed && (
                              <Badge className={getUrgencyColor(task.urgency)}>
                                {task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}
                              </Badge>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              Project: {task.projectName}
                            </span>
                            
                            {task.dueDate && (
                              <span className={`flex items-center ${task.overdue && !task.completed ? 'text-red-500 font-medium' : ''}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                                {task.dueTime && (
                                  <>
                                    <Clock className="h-3 w-3 mx-1" />
                                    {task.dueTime}
                                  </>
                                )}
                                {task.overdue && !task.completed && (
                                  <span className="ml-1">(Overdue)</span>
                                )}
                              </span>
                            )}
                            
                            {task.category && (
                              <span className="flex items-center">
                                <Tag className="h-3 w-3 mr-1" />
                                {task.category}
                              </span>
                            )}
                            
                            <span className="flex items-center">
                              <div className="flex ml-1">
                                {renderPriorityStars(task.priority)}
                              </div>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterUrgency !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                  ? 'No tasks match your current filters'
                  : 'Get started by creating your first task'}
              </p>
              <Button asChild>
                <Link to="/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Task
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
