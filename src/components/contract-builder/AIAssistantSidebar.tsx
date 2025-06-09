
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContractData } from '@/pages/ContractBuilder';
import { X, Send, Sparkles, Lightbulb, AlertCircle, FileText } from 'lucide-react';

interface AIAssistantSidebarProps {
  contractData: ContractData;
  currentStep: string;
  onClose: () => void;
  onSuggestion: (suggestion: string) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  {
    id: 'improve-scope',
    title: 'Improve Scope Description',
    description: 'Make the scope more detailed and specific',
    icon: FileText
  },
  {
    id: 'suggest-payment',
    title: 'Suggest Payment Terms',
    description: 'Recommend payment structure for this project',
    icon: Sparkles
  },
  {
    id: 'check-legal',
    title: 'Check Legal Compliance',
    description: 'Review for legal gaps and issues',
    icon: AlertCircle
  },
  {
    id: 'simplify-language',
    title: 'Simplify Language',
    description: 'Make contract language clearer',
    icon: Lightbulb
  }
];

const AIAssistantSidebar: React.FC<AIAssistantSidebarProps> = ({
  contractData,
  currentStep,
  onClose,
  onSuggestion
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi! I'm your AI contract assistant. I can help you improve your contract language, suggest payment terms, check for legal compliance, and answer questions about freelance contracts in India. What would you like help with?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response based on current step and contract data
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, currentStep, contractData);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (actionId: string) => {
    const responses = {
      'improve-scope': `Based on your ${contractData.templateName || 'contract'}, here are suggestions to improve your scope:\n\n1. Add specific deliverables with formats\n2. Include revision limits\n3. Specify what's NOT included\n4. Add timeline for each deliverable\n5. Define acceptance criteria`,
      'suggest-payment': `For ${contractData.paymentType} projects, I recommend:\n\n• 30-50% upfront payment\n• Milestone-based payments\n• Net 15-30 day payment terms\n• Late fee clause (2-5% per month)\n• Hold final 10-20% until project completion`,
      'check-legal': `Legal compliance check for Indian freelance contracts:\n\n✅ Include jurisdiction (India)\n✅ Add termination clause\n✅ Define IP ownership\n⚠️ Consider adding confidentiality clause\n⚠️ Include dispute resolution mechanism`,
      'simplify-language': `I can help simplify complex legal terms:\n\n• Replace "whereas" with "because"\n• Use "agrees to" instead of "shall"\n• Break long sentences into shorter ones\n• Use bullet points for lists\n• Define technical terms clearly`
    };

    const aiMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: responses[actionId as keyof typeof responses] || 'I can help you with that!',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const generateAIResponse = (userInput: string, step: string, data: ContractData): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('payment') || lowerInput.includes('rate')) {
      return `For ${data.paymentType} pricing, consider:\n\n• Market rates for ${data.templateName}: ₹${data.rate ? data.rate.toLocaleString() : '25,000-1,00,000'}\n• Payment security: Request 30-50% upfront\n• Include late fee clause: ₹500-1000 per day\n• Define payment method and currency clearly`;
    }
    
    if (lowerInput.includes('scope') || lowerInput.includes('service')) {
      return `Your scope looks good! To make it stronger:\n\n• Be specific about deliverables\n• Add "out of scope" section\n• Include revision limits (2-3 revisions)\n• Specify file formats and delivery method\n• Add timeline for each milestone`;
    }
    
    if (lowerInput.includes('legal') || lowerInput.includes('compliant')) {
      return `Legal compliance tips for Indian contracts:\n\n• Include governing law (Indian Contract Act 1872)\n• Add jurisdiction clause\n• Define termination conditions\n• Include IP ownership terms\n• Consider arbitration clause for disputes`;
    }
    
    return `I understand you're asking about "${userInput}". Based on your current contract step (${step}), I recommend focusing on clarity and completeness. Would you like specific suggestions for this section?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50"
    >
      <Card className="h-full rounded-none border-0">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b">
            <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
            <div className="grid gap-2">
              {QUICK_ACTIONS.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.id)}
                    className="justify-start h-auto p-2"
                  >
                    <IconComponent className="h-3 w-3 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about contracts, clauses, or legal advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="text-sm"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIAssistantSidebar;
