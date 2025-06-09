
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Circle, Mail, Circle as CircleIcon } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: "AI-Powered Contract Builder",
    description: "Create professional service agreements with our intelligent assistant that understands Indian law and freelancing needs.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: CircleIcon,
    title: "Digital Signatures",
    description: "Get contracts signed digitally with our secure e-signature platform. Legally binding and court-admissible.",
    color: "bg-secondary/10 text-secondary"
  },
  {
    icon: Mail,
    title: "Client Management",
    description: "Send contracts to clients, track signature status, and manage all your agreements in one centralized dashboard.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Circle,
    title: "Payment Integration",
    description: "Seamlessly integrate payment terms with Razorpay. Get paid faster with automated invoice generation.",
    color: "bg-destructive/10 text-destructive"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text animate-fade-in-up">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            From contract creation to client signatures, we've got every step of your freelancing workflow covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "10,000+", label: "Contracts Created" },
            { number: "5,000+", label: "Happy Freelancers" },
            { number: "99.9%", label: "Uptime" },
            { number: "24/7", label: "Support" }
          ].map((stat, index) => (
            <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
