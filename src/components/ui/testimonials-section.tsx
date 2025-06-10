
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: "Priya Sharma",
    role: "UI/UX Designer",
    company: "Upwork",
    content: "Agrezy transformed how I handle client contracts. What used to take hours now takes minutes, and my clients love the professional presentation. The AI assistance is incredible!",
    avatar: "PS",
    rating: 5,
    logo: "🎨"
  },
  {
    name: "Rajesh Kumar",
    role: "Full Stack Developer",
    company: "Fiverr",
    content: "The AI assistant helped me include clauses I never thought of. My contracts are now bulletproof and I feel much more confident in my business dealings.",
    avatar: "RK",
    rating: 5,
    logo: "💻"
  },
  {
    name: "Anita Desai",
    role: "Content Writer",
    company: "LinkedIn",
    content: "As a freelancer, legal stuff always scared me. Agrezy made it so simple that I actually understand what I'm signing now. Game changer!",
    avatar: "AD",
    rating: 5,
    logo: "✍️"
  },
  {
    name: "Vikram Singh",
    role: "Digital Marketer",
    company: "99designs",
    content: "The templates are perfect for my industry. I've closed more deals faster because clients trust the professional contracts Agrezy generates.",
    avatar: "VS",
    rating: 5,
    logo: "📈"
  },
  {
    name: "Meera Patel",
    role: "Virtual Assistant",
    company: "Freelancer.com",
    content: "I love how the payment terms are automatically calculated and the Indian law compliance gives me peace of mind. Highly recommended!",
    avatar: "MP",
    rating: 5,
    logo: "💼"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
            Loved by Freelancers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of freelancers who've streamlined their contract process with Agrezy.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Main Testimonial Carousel */}
          <div className="relative mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="bg-card rounded-2xl p-8 md:p-12 shadow-lg text-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-lg">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">{testimonials[currentIndex].name}</div>
                    <div className="text-muted-foreground">{testimonials[currentIndex].role}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xl">{testimonials[currentIndex].logo}</span>
                      <span className="text-sm text-muted-foreground">{testimonials[currentIndex].company}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
              onClick={nextTestimonial}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Testimonial Dots */}
          <div className="flex justify-center space-x-2 mb-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Platform Logos */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-muted-foreground mb-8">Trusted by freelancers from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {[
                { name: "Upwork", logo: "🌐" },
                { name: "Fiverr", logo: "🎯" },
                { name: "Freelancer", logo: "💼" },
                { name: "99designs", logo: "🎨" },
                { name: "Toptal", logo: "⭐" },
                { name: "LinkedIn", logo: "💼" }
              ].map((platform, index) => (
                <motion.div
                  key={platform.name}
                  className="flex items-center space-x-2 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 0.6, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                >
                  <span className="text-lg">{platform.logo}</span>
                  <span>{platform.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
