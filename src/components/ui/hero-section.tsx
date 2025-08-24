
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, FileText, Edit3, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-accent/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-2xl"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-32 w-24 h-24 bg-secondary rounded-2xl"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent rounded-2xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Text Content */}
          <div className="text-left lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Floating Contract Icons */}
              <div className="relative mb-8">
                <motion.div
                  className="absolute -top-8 -left-8 text-primary/20"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FileText size={48} />
                </motion.div>
                <motion.div
                  className="absolute -top-4 -right-12 text-secondary/20"
                  animate={{ 
                    y: [0, 8, 0],
                    rotate: [0, -3, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <Edit3 size={32} />
                </motion.div>
              </div>

              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 font-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Craft 
                <span className="gradient-text"> Service Agreement</span>
                <br />
                in Minutes with Agrezy
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Fast, Freelance-Friendly & Fully Compliant Contracts with AI Assistance for Indian freelancers
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/contract/new">
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg rounded-2xl group"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Free Contract
                    </motion.span>
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-semibold px-8 py-4 text-lg rounded-2xl border-2 hover:bg-primary/5"
                >
                  Watch Demo
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span>Legally Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span>Indian Law Focused</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  <span>AI-Powered</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Logo Image */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-md w-full"
            >
              <img 
                src="/lovable-uploads/28f6cb02-0f45-48d9-9295-f187807f2538.png" 
                alt="Agrezy Logo - Contract and Document Management" 
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
