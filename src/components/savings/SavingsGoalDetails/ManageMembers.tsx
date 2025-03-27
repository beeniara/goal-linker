
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus, X } from 'lucide-react';
import { addMemberToSavingsGoal } from '@/services/savingsService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ManageMembersProps {
  savingsId: string;
  onMemberAdded: () => void;
  isOwner: boolean;
}

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

export const ManageMembers: React.FC<ManageMembersProps> = ({
  savingsId,
  onMemberAdded,
  isOwner
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ''
    }
  });

  // Only allow owners to add members
  if (!isOwner) {
    return null;
  }

  const handleAddMember = async (values: z.infer<typeof emailSchema>) => {
    try {
      setIsSubmitting(true);
      
      const result = await addMemberToSavingsGoal(savingsId, values.email);
      
      if (result.success) {
        toast({
          title: 'Member Added',
          description: `${values.email} has been added to the savings goal`,
        });
        form.reset();
        setShowForm(false);
        onMemberAdded();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to add member',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowForm(true)}
        className="mt-2"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Member Manually
      </Button>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-md bg-muted/20">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Add Member by Email</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowForm(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddMember)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="user@example.com"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
