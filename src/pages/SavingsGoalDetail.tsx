
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSavingsGoalById } from '@/services/savingsService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PiggyBank, ArrowLeft } from 'lucide-react';

// Import our refactored components
import { GoalHeader } from '@/components/savings/SavingsGoalDetails/GoalHeader';
import { SavingsProgress } from '@/components/savings/SavingsGoalDetails/SavingsProgress';
import { ContributionForm } from '@/components/savings/SavingsGoalDetails/ContributionForm';
import { SavingsMethod } from '@/components/savings/SavingsGoalDetails/SavingsMethod';
import { ContributionsHistory } from '@/components/savings/SavingsGoalDetails/ContributionsHistory';

const SavingsGoalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savingsGoal, setSavingsGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchSavingsGoal = async () => {
      if (!id || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        const goalData = await getSavingsGoalById(id);
        if (goalData) {
          setSavingsGoal(goalData);
          // Set username from currentUser
          setUsername(currentUser.displayName || currentUser.email || 'User');
        } else {
          toast({
            title: "Error",
            description: "Savings goal not found.",
            variant: "destructive",
          });
          navigate('/savings');
        }
      } catch (error) {
        console.error("Error fetching savings goal:", error);
        toast({
          title: "Error",
          description: "Failed to load savings goal details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavingsGoal();
  }, [id, currentUser, navigate, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleContributionAdded = (updatedGoal: any) => {
    setSavingsGoal(updatedGoal);
    setShowContributionForm(false);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-muted rounded w-full"></div>
        <div className="h-64 bg-muted rounded w-full"></div>
      </div>
    );
  }

  if (!savingsGoal) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <PiggyBank className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">
            Savings goal not found or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link to="/savings">Back to Savings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" asChild className="mb-4 px-0">
        <Link to="/savings" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Savings
        </Link>
      </Button>

      <Card>
        <GoalHeader 
          title={savingsGoal.title}
          description={savingsGoal.description}
          userId={currentUser?.uid || ''}
          username={username}
          savingsId={id || ''}
          completed={savingsGoal.completed}
          method={savingsGoal.method}
          onAddContribution={() => setShowContributionForm(!showContributionForm)}
        />
        <CardContent className="space-y-6">
          <SavingsProgress 
            current={savingsGoal.current}
            target={savingsGoal.target}
            contributionAmount={savingsGoal.contributionAmount}
            formatCurrency={formatCurrency}
          />

          {showContributionForm && (
            <ContributionForm 
              savingsId={id || ''}
              userId={currentUser?.uid || ''}
              onContributionAdded={handleContributionAdded}
              onCancel={() => setShowContributionForm(false)}
            />
          )}

          <SavingsMethod 
            method={savingsGoal.method}
            contributionAmount={savingsGoal.contributionAmount}
            frequency={savingsGoal.frequency}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      <ContributionsHistory 
        contributions={savingsGoal.contributions || []}
        current={savingsGoal.current}
        target={savingsGoal.target}
        formatCurrency={formatCurrency}
        username={username}
      />
    </div>
  );
};

export default SavingsGoalDetail;
