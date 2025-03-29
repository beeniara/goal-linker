
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus, X, AlertCircle } from 'lucide-react';
import { addMemberToSavingsGoal } from '@/services/savingsService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ManageMembersProps {
  savingsId: string;
  onMemberAdded: () => void;
  isOwner: boolean;
}

const emailInviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  invitationId: z.string().optional()
});

export const ManageMembers: React.FC<ManageMembersProps> = ({
  savingsId,
  onMemberAdded,
  isOwner
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<z.infer<typeof emailInviteSchema>>({
    resolver: zodResolver(emailInviteSchema),
    defaultValues: {
      email: '',
      invitationId: ''
    }
  });

  // Only allow owners to add members
  if (!isOwner) {
    return null;
  }

  const handleAddMember = async (values: z.infer<typeof emailInviteSchema>) => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      
      // Check if there's no invitation ID
      if (!values.invitationId) {
        setErrorMessage('You need to invite this user first and provide their invitation ID. Use the "Invite Member" button instead.');
        toast({
          title: 'Missing Invitation',
          description: 'You need to invite this user first. Use the "Invite Member" button.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const result = await addMemberToSavingsGoal(savingsId, values.email, values.invitationId);
      
      if (result.success) {
        toast({
          title: 'Member Added',
          description: `${values.email} has been added to the savings goal`,
        });
        form.reset();
        setShowForm(false);
        onMemberAdded();
      } else {
        setErrorMessage(result.message || 'Failed to add member');
        toast({
          title: 'Error',
          description: result.message || 'Failed to add member',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
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
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddMember)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="user@example.com"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="invitationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invitation ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter invitation ID"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  You need to invite the user first using the "Invite Member" button and then enter the invitation ID here.
                </p>
              </FormItem>
            )}
          />
          
          <div className="flex space-x-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
