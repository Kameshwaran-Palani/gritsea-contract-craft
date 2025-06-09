
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck } from 'lucide-react';

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "3 contracts per month",
      "Basic templates",
      "Email support",
      "Digital signatures"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For serious freelancers",
    features: [
      "Unlimited contracts",
      "AI-powered assistance",
      "Custom branding",
      "Priority support",
      "Advanced templates",
      "Payment integration"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Agency",
    price: "₹2,999",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Multi-user support",
      "Team collaboration",
      "White-label solution",
      "API access",
      "Dedicated manager"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text animate-fade-in-up">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Choose the plan that fits your freelancing needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative bg-card/70 backdrop-blur-sm border-2 hover:shadow-2xl transition-all duration-300 animate-scale-in ${
                plan.popular ? 'border-accent scale-105' : 'border-border'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CircleCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full font-semibold ${
                    plan.popular 
                      ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-muted-foreground mb-4">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <span>🔒 Secure Payments</span>
            <span>💳 Razorpay Integration</span>
            <span>📞 24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
