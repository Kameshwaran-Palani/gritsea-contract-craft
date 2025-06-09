
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Building } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    description: 'Perfect for getting started',
    icon: Zap,
    features: [
      '3 contracts per month',
      'Basic templates',
      'Email support',
      'Digital signatures',
      'Contract storage'
    ],
    limitations: [
      'Limited AI assistance',
      'Basic customization'
    ]
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/month',
    description: 'For growing freelancers',
    icon: Crown,
    popular: true,
    features: [
      'Unlimited contracts',
      'Premium templates',
      'Priority support',
      'Advanced signatures',
      'Contract analytics',
      'AI legal assistant',
      'Custom branding',
      'Payment integration'
    ]
  },
  {
    name: 'Agency',
    price: '₹2499',
    period: '/month',
    description: 'For agencies and teams',
    icon: Building,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'White-label solution',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'Multi-user management'
    ]
  }
];

const Pricing = () => {
  const { user, loading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (planName: string) => {
    setSelectedPlan(planName);
    // Here you would integrate with Razorpay or your payment processor
    console.log(`Subscribing to ${planName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your contract management needs. Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-8 md:grid-cols-3"
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-accent shadow-lg' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-accent/10">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations?.map((limitation) => (
                        <div key={limitation} className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-accent hover:bg-accent/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={selectedPlan === plan.name}
                    >
                      {plan.name === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Need a custom solution?</h3>
              <p className="text-muted-foreground mb-6">
                Contact us for enterprise pricing and custom features tailored to your business needs.
              </p>
              <Button variant="outline">Contact Sales</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Pricing;
