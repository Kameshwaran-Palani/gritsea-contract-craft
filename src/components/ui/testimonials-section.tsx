
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: "Priya Sharma",
    role: "UI/UX Designer",
    content: "GritSea transformed how I handle client contracts. What used to take hours now takes minutes, and my clients love the professional presentation.",
    avatar: "PS",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "Full Stack Developer",
    content: "The AI assistant helped me include clauses I never thought of. My contracts are now bulletproof and I feel much more confident in my business dealings.",
    avatar: "RK",
    rating: 5
  },
  {
    name: "Anita Desai",
    role: "Content Writer",
    content: "As a freelancer, legal stuff always scared me. GritSea made it so simple that I actually understand what I'm signing now. Game changer!",
    avatar: "AD",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text animate-fade-in-up">
            Loved by Freelancers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Join thousands of freelancers who've streamlined their contract process with GritSea.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name} 
              className="bg-card/70 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-yellow-400">★</div>
                  ))}
                </div>
                
                <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
