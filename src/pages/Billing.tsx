
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const plans = [
  {
    name: 'pro',
    price: 499,
    price_id: 'pro-monthly',
    features: [
      'Unlimited Contracts',
      'Advanced AI Assistant',
      'Community Templates',
      'E-Signatures',
      'Priority Support',
    ],
  },
  {
    name: 'agency',
    price: 999,
    price_id: 'agency-monthly',
    features: [
      'All Pro features',
      'Team Collaboration',
      'Custom Branding',
      'API Access',
      'Dedicated Account Manager',
    ],
  },
];

const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "No rows found" error
    throw new Error(error.message);
  }
  return data;
};


const BillingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { handlePayment, loading: paymentLoading } = useRazorpay();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
  });

  const isLoading = authLoading || profileLoading;

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  const currentPlan = profile?.plan || 'free';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground font-heading">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">Manage your plan and payment details.</p>
        </motion.div>
        
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="flex items-center space-x-4">
                  <Badge variant={currentPlan !== 'free' ? "default" : "secondary"} className="text-lg capitalize py-1 px-3 rounded-lg">{currentPlan}</Badge>
                  <p className="text-muted-foreground">
                    {currentPlan === 'free'
                      ? 'You are currently on the Free plan.'
                      : `Your subscription is active.`}
                  </p>
                </div>
             )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Card className={`rounded-2xl h-full flex flex-col ${currentPlan === plan.name ? 'border-primary shadow-lg' : ''}`}>
                <CardHeader>
                  <CardTitle className="capitalize text-2xl font-heading">{plan.name} Plan</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">₹{plan.price}</span>
                    <span className="text-muted-foreground"> / month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {currentPlan === plan.name ? (
                     <Button disabled className="w-full rounded-xl">Current Plan</Button>
                  ) : (
                    <Button
                      onClick={() => handlePayment({name: plan.name, price: plan.price})}
                      disabled={paymentLoading || isLoading}
                      className="w-full rounded-xl bg-primary hover:bg-primary/90"
                    >
                      {paymentLoading ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
