import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createLoan, CreateLoanData } from '../../services/loanCreateService';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/config/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, User } from '../../services/userService';

const loanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  interestRate: z.number().min(0).max(100).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().optional(),
  borrowerId: z.string().min(1, 'Borrower is required'),
});

type LoanFormValues = z.infer<typeof loanSchema>;

export const LoanForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    };

    fetchUsers();
  }, [toast]);

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: 0,
      interestRate: 0,
      startDate: new Date().toISOString().split('T')[0],
      borrowerId: '',
    },
  });

  const onSubmit = async (data: LoanFormValues) => {
    if (!auth.currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a loan',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const loanData: CreateLoanData = {
        name: data.name,
        description: data.description || '',
        amount: data.amount,
        interestRate: data.interestRate || 0,
        startDate: new Date(data.startDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        lenderId: auth.currentUser.uid,
        borrowerId: data.borrowerId,
      };

      await createLoan(loanData);
      toast({
        title: 'Success',
        description: 'Loan created successfully',
      });
      form.reset();
    } catch (error) {
      console.error('Error creating loan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create loan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter loan name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter loan description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter loan amount"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interestRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interest Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter interest rate"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="borrowerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Borrower</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a borrower" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.displayName || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Loan'}
        </Button>
      </form>
    </Form>
  );
}; 