
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Free',
        price: 0,
        description: 'For individuals starting out.',
        features: [
          '3 Contracts per month',
          'Basic AI Assistant',
          'Standard Templates',
          'Email Support',
        ],
        cta: 'Get Started for Free',
        href: '/auth'
    },
    {
        name: 'Pro',
        price: 499,
        description: 'For freelancers and small businesses.',
        isPopular: true,
        features: [
          'Unlimited Contracts',
          'Advanced AI Assistant',
          'Community Templates',
          'E-Signatures',
          'Priority Support',
        ],
        cta: 'Upgrade to Pro',
        href: '/auth'
    },
    {
        name: 'Agency',
        price: 999,
        description: 'For agencies and teams.',
        features: [
          'All Pro features',
          'Team Collaboration',
          'Custom Branding',
          'API Access',
          'Dedicated Account Manager',
        ],
        cta: 'Contact Sales',
        href: '#contact'
    },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that's right for you. Get started for free, no credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card className={`w-full flex flex-col rounded-2xl ${plan.isPopular ? 'border-primary ring-2 ring-primary shadow-2xl' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                    {plan.isPopular && <div className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">Most Popular</div>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div>
                    <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground"> / month</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                   <Button asChild className="w-full rounded-xl" size="lg" variant={plan.isPopular ? 'default' : 'outline'}>
                    <Link to={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
