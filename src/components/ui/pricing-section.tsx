
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      icon: Zap,
      description: "Perfect for getting started",
      price: { monthly: 0, yearly: 0 },
      features: [
        "3 contracts per month",
        "Basic templates",
        "Email support",
        "Digital signatures",
        "Basic AI assistance"
      ],
      cta: "Get Started",
      popular: false,
      color: "border-muted"
    },
    {
      name: "Pro",
      icon: Crown,
      description: "For serious freelancers",
      price: { monthly: 199, yearly: 1990 },
      features: [
        "Unlimited contracts",
        "Advanced AI tools",
        "Custom branding",
        "Priority support",
        "Advanced templates",
        "Payment integration",
        "Client management",
        "Contract analytics"
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "border-accent"
    },
    {
      name: "Agency",
      icon: Building,
      description: "For teams and agencies",
      price: { monthly: 499, yearly: 4990 },
      features: [
        "Everything in Pro",
        "Multi-user support",
        "Team collaboration",
        "White-label solution",
        "API access",
        "Dedicated manager",
        "Custom integrations",
        "Advanced reporting"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "border-primary"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your freelancing needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <motion.div 
            className="flex items-center justify-center space-x-4 bg-muted/30 rounded-2xl p-2 max-w-sm mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className={`text-sm font-medium ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <motion.span 
                className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                Save 16%
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-card rounded-2xl p-8 shadow-lg border-2 ${plan.color} hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-heading">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold">
                    ₹{isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground ml-1">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                
                {isYearly && plan.price.monthly > 0 && (
                  <motion.p 
                    className="text-sm text-success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Save ₹{(plan.price.monthly * 12) - plan.price.yearly} annually
                  </motion.p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                  >
                    <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Button 
                className={`w-full font-semibold text-lg py-6 rounded-2xl ${
                  plan.popular 
                    ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-muted-foreground mb-6">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💳</span>
              <span>Razorpay Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📞</span>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🇮🇳</span>
              <span>Made for India</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
