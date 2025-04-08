import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGoalFetch } from '@/hooks/useGoalFetch';
import MilestoneFormFields from '@/components/milestones/MilestoneFormFields';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  targetDate: z.date(),
  completed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const MilestoneForm = () => {
  const { id } = useParams(); // goal ID
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { goalTitle, fetchingGoal } = useGoalFetch(id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      targetDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      completed: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser || !id) return;
    
    setLoading(true);
    try {
      const milestoneData = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description || '',
        targetDate: Timestamp.fromDate(values.targetDate),
        completed: values.completed,
        createdAt: Timestamp.now(),
        createdBy: currentUser.uid,
      };
      
      // Add milestone to the goal
      const goalRef = doc(db, 'goals', id);
      await updateDoc(goalRef, {
        milestones: arrayUnion(milestoneData),
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: 'Success',
        description: 'Milestone added successfully',
      });
      
      navigate(`/goals/${id}`);
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to add milestone',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingGoal) {
    return (
      <div className="container py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/goals/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goal
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Milestone to Goal</CardTitle>
          <CardDescription>
            Adding milestone for: <span className="font-medium">{goalTitle}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MilestoneFormFields 
            form={form} 
            onSubmit={onSubmit} 
            loading={loading} 
            onCancel={() => navigate(`/goals/${id}`)}
            submitLabel={loading ? "Adding..." : "Add Milestone"}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MilestoneForm;
