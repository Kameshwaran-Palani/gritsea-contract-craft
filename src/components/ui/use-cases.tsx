
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Palette, PenTool, Megaphone, Search, Users, Video, Smartphone, Languages, Briefcase } from 'lucide-react';
import AnimatedPen from '@/components/ui/animated-pen';

const useCases = [
  {
    id: 'developer',
    icon: Code,
    title: 'Web Developer',
    description: 'Full-stack development services',
    contract: {
      scope: 'Website development with React/Node.js',
      timeline: '4-6 weeks',
      payment: '₹50,000 - ₹2,00,000'
    }
  },
  {
    id: 'designer',
    icon: Palette,
    title: 'UI/UX Designer',
    description: 'Digital design and user experience',
    contract: {
      scope: 'Mobile app UI design with prototyping',
      timeline: '2-4 weeks',
      payment: '₹25,000 - ₹75,000'
    }
  },
  {
    id: 'writer',
    icon: PenTool,
    title: 'Content Writer',
    description: 'Blog posts, articles, and copywriting',
    contract: {
      scope: '10 blog articles (1500 words each)',
      timeline: '2 weeks',
      payment: '₹15,000 - ₹30,000'
    }
  },
  {
    id: 'marketer',
    icon: Megaphone,
    title: 'Digital Marketer',
    description: 'Social media and performance marketing',
    contract: {
      scope: 'Social media management + ad campaigns',
      timeline: '3 months',
      payment: '₹20,000/month'
    }
  },
  {
    id: 'seo',
    icon: Search,
    title: 'SEO Specialist',
    description: 'Search engine optimization services',
    contract: {
      scope: 'Complete SEO audit and optimization',
      timeline: '6 months',
      payment: '₹30,000/month'
    }
  },
  {
    id: 'va',
    icon: Users,
    title: 'Virtual Assistant',
    description: 'Administrative and support services',
    contract: {
      scope: 'Email management + scheduling (20hrs/week)',
      timeline: 'Ongoing',
      payment: '₹25,000/month'
    }
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video Editor',
    description: 'Video production and post-editing',
    contract: {
      scope: '10 YouTube videos with thumbnails',
      timeline: '3 weeks',
      payment: '₹35,000'
    }
  },
  {
    id: 'app',
    icon: Smartphone,
    title: 'App Developer',
    description: 'Mobile application development',
    contract: {
      scope: 'iOS/Android app development',
      timeline: '8-12 weeks',
      payment: '₹1,50,000 - ₹5,00,000'
    }
  },
  {
    id: 'translator',
    icon: Languages,
    title: 'Translator',
    description: 'Language translation services',
    contract: {
      scope: 'English to Hindi translation (50 pages)',
      timeline: '1 week',
      payment: '₹12,000'
    }
  },
  {
    id: 'consultant',
    icon: Briefcase,
    title: 'Business Consultant',
    description: 'Strategy and business advisory',
    contract: {
      scope: 'Business strategy consultation',
      timeline: '4 weeks',
      payment: '₹1,00,000'
    }
  }
];

const UseCasesSection = () => {
  const [activeCase, setActiveCase] = useState('developer');

  const activeData = useCases.find(uc => uc.id === activeCase);

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
          <AnimatedPen 
            text="Built for Every Freelancer" 
            className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading" 
          />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how professionals in your field use Agrezy to create winning contracts
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Use Cases Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {useCases.map((useCase, index) => (
                <motion.button
                  key={useCase.id}
                  onClick={() => setActiveCase(useCase.id)}
                  className={`p-4 rounded-2xl text-left transition-all duration-300 ${
                    activeCase === useCase.id 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                      : 'bg-card hover:bg-card/80 shadow-sm hover:shadow-md'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <useCase.icon className={`w-8 h-8 mb-3 ${
                    activeCase === useCase.id ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                  <h3 className="font-semibold text-sm mb-1">{useCase.title}</h3>
                  <p className={`text-xs ${
                    activeCase === useCase.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {useCase.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Contract Preview */}
            <div className="bg-card rounded-2xl p-8 shadow-lg">
              <AnimatePresence mode="wait">
                {activeData && (
                  <motion.div
                    key={activeCase}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
                        <activeData.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold font-heading">{activeData.title}</h3>
                        <p className="text-muted-foreground">{activeData.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-xl p-4">
                        <h4 className="font-semibold text-sm text-primary mb-2">SCOPE OF WORK</h4>
                        <p className="text-sm">{activeData.contract.scope}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-xl p-4">
                          <h4 className="font-semibold text-sm text-secondary mb-2">TIMELINE</h4>
                          <p className="text-sm">{activeData.contract.timeline}</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-4">
                          <h4 className="font-semibold text-sm text-accent mb-2">PAYMENT</h4>
                          <p className="text-sm">{activeData.contract.payment}</p>
                        </div>
                      </div>
                    </div>

                    <motion.div 
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-sm text-success font-medium">✓ Template Available</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
