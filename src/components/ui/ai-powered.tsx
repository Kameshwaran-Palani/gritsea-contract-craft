
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Wand2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AIPoweredSection = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedText(`SERVICE AGREEMENT

This agreement is between [Your Name] and [Client Name] for ${prompt.toLowerCase()}.

SCOPE OF WORK:
- Deliver high-quality ${prompt.toLowerCase()} services
- Include 2 rounds of revisions
- Provide final deliverables in agreed format

PAYMENT TERMS:
- 50% upfront payment
- 50% upon completion
- Payment due within 7 days of invoice

TIMELINE:
- Project duration: 2-4 weeks
- Regular updates every 3 days

This contract is governed by Indian law...`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
            AI-Powered Simplicity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Talk to AI to generate your agreement in plain English. No legal jargon, just simple contracts.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* AI Chat Interface */}
          <motion.div 
            className="bg-card rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold font-heading">AI Contract Assistant</h3>
                <p className="text-sm text-muted-foreground">Describe your project in plain English</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-1">AI Assistant</p>
                    <p className="text-muted-foreground">Hi! I'm here to help you create a contract. What kind of project are you working on?</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., website design for a restaurant..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Wand2 className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {generatedText && (
                <motion.div 
                  className="bg-background rounded-xl p-4 border border-success/20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm flex-1">
                      <p className="font-medium mb-2 text-success">Contract Generated!</p>
                      <div className="bg-muted/20 rounded p-3 font-mono text-xs overflow-auto max-h-48">
                        <pre className="whitespace-pre-wrap">{generatedText}</pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {[
              {
                icon: MessageSquare,
                title: "Natural Language Processing",
                description: "Just describe your project in simple English, and our AI will understand the requirements and generate appropriate clauses."
              },
              {
                icon: Wand2,
                title: "Smart Auto-Fill",
                description: "AI automatically fills in standard terms, payment schedules, and legal clauses based on your industry and project type."
              },
              {
                icon: CheckCircle,
                title: "Legal Compliance Check",
                description: "Every generated contract is checked for compliance with Indian laws and best practices for freelancer agreements."
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 font-heading">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIPoweredSection;
