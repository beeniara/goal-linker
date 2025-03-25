
import * as z from 'zod';

export const savingsGoalSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  target: z.coerce.number().min(1, { message: "Target amount must be at least 1" }),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  amount: z.coerce.number().min(1, { message: "Contribution amount must be at least 1" }),
  method: z.enum(["single", "group"]),
});

export type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>;
