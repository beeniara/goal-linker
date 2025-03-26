import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  Flag,
  Plus,
  Check,
  Trash,
  ArrowUp,
  ArrowDown,
  Edit,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ReminderItem = {
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
};

const ChecklistReminder = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');
  const [newReminderDueDate, setNewReminderDueDate] = useState('');
  const [newReminderDueTime, setNewReminderDueTime] = useState('');
  const [newReminderUrgency, setNewReminderUrgency] = useState('medium');
  const [newReminderParentId, setNewReminderParentId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('due');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchReminders();
    } else {
      console.log("No authenticated user found. Please log in first.");
      setLoading(false);
      setError("You need to be logged in to view reminders.");
    }
  }, [currentUser]);

  const fetchReminders = async () => {
    if (!currentUser) {
      console.error("Cannot fetch reminders: No authenticated user");
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching reminders for user:", currentUser.uid);
      setLoading(true);
      setError(null);
      
      const remindersRef = collection(db, 'reminders');
      const q = query(
        remindersRef, 
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc') // Fall back to creation date if due date is not available
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} reminders`);
      
      const remindersList: ReminderItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        remindersList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
          dueTime: data.dueTime,
          urgency: data.urgency,
          completed: data.completed || false,
          parentId: data.parentId,
          isMain: data.isMain || false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        });
      });
      
      setReminders(remindersList);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError('Failed to load reminders. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load reminders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!currentUser) {
      console.error("Cannot add reminder: No authenticated user");
      setError("Authentication required. Please log in.");
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add reminders.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newReminderTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Reminder title is required.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Adding new reminder for user:", currentUser.uid);
      setError(null);
      
      const newReminder = {
        title: newReminderTitle.trim(),
        description: newReminderDescription.trim() || null,
        dueDate: newReminderDueDate ? new Date(newReminderDueDate) : null,
        dueTime: newReminderDueTime || null,
        urgency: newReminderUrgency as 'low' | 'medium' | 'high',
        completed: false,
        parentId: newReminderParentId || null,
        isMain: !newReminderParentId,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };
      
      console.log("New reminder data:", newReminder);
      
      // Test if db is accessible
      console.log("Firestore database instance:", db);
      
      const docRef = await addDoc(collection(db, 'reminders'), newReminder);
      console.log("Reminder added with ID:", docRef.id);
      
      toast({
        title: 'Success',
        description: 'Reminder added successfully',
      });
      
      // Reset form
      setNewReminderTitle('');
      setNewReminderDescription('');
      setNewReminderDueDate('');
      setNewReminderDueTime('');
      setNewReminderUrgency('medium');
      setNewReminderParentId(undefined);
      setDialogOpen(false);
      
      // Refresh reminders
      fetchReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to add reminder. Please try again.';
      
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
        console.error('Stack trace:', error.stack);
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReminder = async () => {
    if (!currentUser || !editingReminder || !newReminderTitle.trim()) return;
    
    try {
      setIsSubmitting(true);
      const reminderRef = doc(db, 'reminders', editingReminder.id);
      
      const updates = {
        title: newReminderTitle.trim(),
        description: newReminderDescription.trim() || null,
        dueDate: newReminderDueDate ? new Date(newReminderDueDate) : null,
        dueTime: newReminderDueTime || null,
        urgency: newReminderUrgency as 'low' | 'medium' | 'high',
        parentId: newReminderParentId || null,
        isMain: !newReminderParentId,
      };
      
      await updateDoc(reminderRef, updates);
      
      toast({
        title: 'Success',
        description: 'Reminder updated successfully',
      });
      
      // Reset form
      setEditingReminder(null);
      setNewReminderTitle('');
      setNewReminderDescription('');
      setNewReminderDueDate('');
      setNewReminderDueTime('');
      setNewReminderUrgency('medium');
      setNewReminderParentId(undefined);
      setDialogOpen(false);
      
      // Refresh reminders
      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reminder. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if this is a main reminder with sub-reminders
      const subReminders = reminders.filter(rem => rem.parentId === reminderId);
      
      // If there are sub-reminders, delete them first
      if (subReminders.length > 0) {
        for (const subReminder of subReminders) {
          await deleteDoc(doc(db, 'reminders', subReminder.id));
        }
      }
      
      // Delete the main reminder
      await deleteDoc(doc(db, 'reminders', reminderId));
      
      toast({
        title: 'Success',
        description: 'Reminder deleted successfully',
      });
      
      // Refresh reminders
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reminder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleComplete = async (reminderId: string, completed: boolean) => {
    if (!currentUser) return;
    
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      await updateDoc(reminderRef, { completed });
      
      // Update local state
      setReminders(prev => 
        prev.map(rem => 
          rem.id === reminderId ? { ...rem, completed } : rem
        )
      );
      
      toast({
        title: completed ? 'Reminder completed' : 'Reminder reopened',
        description: `The reminder has been marked as ${completed ? 'completed' : 'incomplete'}`,
      });
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reminder status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditReminder = (reminder: ReminderItem) => {
    setEditingReminder(reminder);
    setNewReminderTitle(reminder.title);
    setNewReminderDescription(reminder.description || '');
    setNewReminderDueDate(reminder.dueDate ? reminder.dueDate.toISOString().split('T')[0] : '');
    setNewReminderDueTime(reminder.dueTime || '');
    setNewReminderUrgency(reminder.urgency);
    setNewReminderParentId(reminder.parentId);
    setDialogOpen(true);
  };

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

  const isDueToday = (dueDate?: Date) => {
    if (!dueDate) return false;
    
    const today = new Date();
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateCopy = new Date(dueDate);
    dueDateCopy.setHours(0, 0, 0, 0);
    
    return dueDateCopy < today;
  };

  const filteredReminders = reminders
    .filter(reminder => {
      if (activeTab === 'due' && reminder.completed) return false;
      if (activeTab === 'completed' && !reminder.completed) return false;
      if (activeTab === 'today' && (!isDueToday(reminder.dueDate) || reminder.completed)) return false;
      if (activeTab === 'overdue' && (!isOverdue(reminder.dueDate) || reminder.completed)) return false;
      
      if (searchQuery && !reminder.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  const mainReminders = filteredReminders.filter(r => r.isMain);

  if (!currentUser) {
    return (
      <div className="container py-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view and manage your reminders.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="default" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Checklist Reminders</h1>
        <Button onClick={() => {
          setEditingReminder(null);
          setNewReminderTitle('');
          setNewReminderDescription('');
          setNewReminderDueDate('');
          setNewReminderDueTime('');
          setNewReminderUrgency('medium');
          setNewReminderParentId(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Reminder
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="block mt-1 text-sm">
            Please check your Firebase configuration and ensure you have the correct permissions.
          </span>
          <div className="mt-3 text-xs bg-red-100 p-2 rounded">
            <p>Troubleshooting Tips:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Make sure you're signed in with valid credentials</li>
              <li>Check that Firestore is properly configured in your Firebase project</li>
              <li>Verify that your Firestore security rules allow this operation</li>
              <li>Ensure you have a stable internet connection</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search reminders..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="due" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="due">Due</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
              <p className="mt-2">Loading reminders...</p>
            </div>
          ) : mainReminders.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No reminders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No reminders match your search' : 'Get started by creating your first reminder'}
              </p>
              <Button onClick={() => {
                setEditingReminder(null);
                setNewReminderTitle('');
                setNewReminderDescription('');
                setNewReminderDueDate('');
                setNewReminderDueTime('');
                setNewReminderUrgency('medium');
                setNewReminderParentId(undefined);
                setDialogOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Reminder
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {mainReminders.map((mainReminder) => {
                const subReminders = filteredReminders.filter(r => r.parentId === mainReminder.id);
                
                return (
                  <Card key={mainReminder.id} className={`
                    ${mainReminder.completed ? 'bg-muted/20' : ''}
                    ${isOverdue(mainReminder.dueDate) && !mainReminder.completed ? 'border-red-300' : ''}
                    ${isDueToday(mainReminder.dueDate) && !mainReminder.completed ? 'border-yellow-300' : ''}
                  `}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={mainReminder.completed}
                            onCheckedChange={(checked) => 
                              handleToggleComplete(mainReminder.id, checked === true)
                            }
                            className="mt-1"
                          />
                          <div>
                            <CardTitle className={`${mainReminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {mainReminder.title}
                            </CardTitle>
                            {mainReminder.description && (
                              <CardDescription className={`${mainReminder.completed ? 'line-through' : ''}`}>
                                {mainReminder.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!mainReminder.completed && (
                            <Badge className={getUrgencyColor(mainReminder.urgency)}>
                              {mainReminder.urgency.charAt(0).toUpperCase() + mainReminder.urgency.slice(1)}
                            </Badge>
                          )}
                          
                          <div className="flex">
                            <Button variant="ghost" size="icon" onClick={() => handleEditReminder(mainReminder)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(mainReminder.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {(mainReminder.dueDate || mainReminder.dueTime) && (
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
                        </div>
                      )}
                    </CardHeader>
                    
                    {subReminders.length > 0 && (
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
                                    handleToggleComplete(subReminder.id, checked === true)
                                  }
                                  className="mt-1"
                                />
                                <div>
                                  <div className={`font-medium ${subReminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {subReminder.title}
                                  </div>
                                  {subReminder.description && (
                                    <p className={`text-sm ${subReminder.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                      {subReminder.description}
                                    </p>
                                  )}
                                  {(subReminder.dueDate || subReminder.dueTime) && (
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
                                {!subReminder.completed && (
                                  <Badge className={`text-xs ${getUrgencyColor(subReminder.urgency)}`}>
                                    {subReminder.urgency.charAt(0).toUpperCase() + subReminder.urgency.slice(1)}
                                  </Badge>
                                )}
                                
                                <div className="flex">
                                  <Button variant="ghost" size="icon" onClick={() => handleEditReminder(subReminder)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(subReminder.id)}>
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                    
                    <CardContent className={subReminders.length > 0 ? 'pt-0' : ''}>
                      <Button 
                        variant="ghost" 
                        className="text-sm" 
                        onClick={() => {
                          setEditingReminder(null);
                          setNewReminderTitle('');
                          setNewReminderDescription('');
                          setNewReminderDueDate('');
                          setNewReminderDueTime('');
                          setNewReminderUrgency('medium');
                          setNewReminderParentId(mainReminder.id);
                          setDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Sub-task
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                onChange={(e) => setNewReminderTitle(e.target.value)}
                placeholder="Enter reminder title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newReminderDescription}
                onChange={(e) => setNewReminderDescription(e.target.value)}
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
                  onChange={(e) => setNewReminderDueDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueTime">Due Time</Label>
                <Input
                  id="dueTime"
                  type="time"
                  value={newReminderDueTime}
                  onChange={(e) => setNewReminderDueTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select
                value={newReminderUrgency}
                onValueChange={setNewReminderUrgency}
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
                  value={newReminderParentId || ''}
                  onValueChange={(value) => setNewReminderParentId(value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a main reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Create as main reminder)</SelectItem>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={editingReminder ? handleUpdateReminder : handleAddReminder}
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
    </div>
  );
};

export default ChecklistReminder;
