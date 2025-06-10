
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Lightbulb,
  Clock,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const examplePrompts = [
  {
    title: "Video Editing Contract",
    prompt: "Create a ₹15,000 video editing contract for a YouTube channel with 3-day turnaround",
    category: "Creative"
  },
  {
    title: "Web Development Project",
    prompt: "Generate a contract for building an e-commerce website with ₹80,000 budget and 2-month timeline",
    category: "Development"
  },
  {
    title: "Social Media Management",
    prompt: "Create a monthly retainer contract for social media management at ₹12,000/month",
    category: "Marketing"
  },
  {
    title: "Logo Design",
    prompt: "Make a contract for logo design work with 3 revisions included for ₹8,000",
    category: "Design"
  }
];

const AIPrompt = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      // Navigate to contract builder with the prompt
      navigate('/contract/new?prompt=' + encodeURIComponent(prompt));
    }, 2000);
  };

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 font-heading">AI Contract Generator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your project in plain English and let AI create a professional contract for you
          </p>
        </motion.div>

        {/* Main Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Generate Your Contract
              </CardTitle>
              <CardDescription>
                Be specific about your service, budget, timeline, and any special requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Textarea
                  placeholder="Example: Create a contract for developing a mobile app with React Native. Budget is ₹1,20,000 with 3-month timeline. Include UI/UX design, backend integration, and 2 weeks of bug fixes after delivery..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none rounded-xl"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {prompt.length}/500 characters
                  </span>
                  <Badge variant="secondary">Free to use</Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Contract...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Contract
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2 font-heading">Need Inspiration?</h2>
            <p className="text-muted-foreground">Try these example prompts to get started</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {examplePrompts.map((example, index) => (
              <motion.div
                key={example.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 rounded-2xl border hover:border-primary/20"
                  onClick={() => useExamplePrompt(example.prompt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm">{example.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {example.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {example.prompt}
                    </p>
                    <div className="flex items-center mt-3 text-primary text-sm">
                      <span>Use this prompt</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Card className="text-center rounded-2xl">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Understanding</h3>
              <p className="text-sm text-muted-foreground">
                AI understands your requirements and creates appropriate clauses
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-2xl">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Generation</h3>
              <p className="text-sm text-muted-foreground">
                Get a complete contract draft in seconds, not hours
              </p>
            </CardContent>
          </Card>

          <Card className="text-center rounded-2xl">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Cost Effective</h3>
              <p className="text-sm text-muted-foreground">
                Save money on legal consultation for standard contracts
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AIPrompt;
