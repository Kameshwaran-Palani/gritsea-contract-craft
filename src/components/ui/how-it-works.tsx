
import React from 'react';
import { motion } from 'framer-motion';
import { FileTemplate, Edit, Share } from 'lucide-react';

const steps = [
  {
    icon: FileTemplate,
    title: "Select Template",
    description: "Choose from 10+ professional templates or start from scratch",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Edit,
    title: "Edit Easily",
    description: "Customize your contract with our intuitive editor and AI assistance",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    icon: Share,
    title: "Share & Sign",
    description: "Send to clients for digital signatures and track status in real-time",
    color: "text-accent",
    bgColor: "bg-accent/10"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional contracts in three simple steps. No legal expertise required.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Progress Timeline */}
          <div className="relative mb-16">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted rounded-full transform -translate-y-1/2 hidden md:block">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Step Number */}
                  <motion.div 
                    className="w-16 h-16 bg-background border-4 border-primary rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-primary font-bold text-lg">{index + 1}</span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div 
                    className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                    whileHover={{ 
                      scale: 1.05,
                      rotate: 5
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <step.icon className={`w-10 h-10 ${step.color}`} />
                  </motion.div>

                  <h3 className="text-2xl font-semibold mb-4 font-heading">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Interactive Demo */}
          <motion.div 
            className="bg-card rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2 font-heading">See It In Action</h3>
              <p className="text-muted-foreground">Watch how easy it is to create a contract</p>
            </div>
            
            <div className="relative bg-muted/30 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
              <motion.div 
                className="text-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileTemplate className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Interactive demo coming soon...</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
