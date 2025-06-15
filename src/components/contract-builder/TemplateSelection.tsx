
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText, Code, Palette, PenTool, Search, Users, Video, Smartphone, Languages, Briefcase } from 'lucide-react';

interface TemplateSelectionProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const TEMPLATES = [
  {
    id: 'web-developer',
    name: 'Web Developer',
    icon: Code,
    description: 'Full-stack web development services',
    scope: 'Website development, frontend/backend coding, database design, deployment',
    paymentStructure: '50% upfront, 50% on completion',
    estimatedValue: '₹50,000 - ₹2,00,000',
    tags: ['Development', 'Technical']
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    icon: Palette,
    description: 'User interface and experience design',
    scope: 'Wireframing, prototyping, visual design, user research',
    paymentStructure: '30% upfront, 40% on design approval, 30% final',
    estimatedValue: '₹25,000 - ₹1,00,000',
    tags: ['Design', 'Creative']
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    icon: PenTool,
    description: 'Content creation and copywriting',
    scope: 'Blog posts, website copy, marketing content, SEO writing',
    paymentStructure: 'Per article or monthly retainer',
    estimatedValue: '₹5,000 - ₹50,000',
    tags: ['Writing', 'Marketing']
  },
  {
    id: 'social-media-marketer',
    name: 'Social Media Marketer',
    icon: Users,
    description: 'Social media strategy and management',
    scope: 'Content calendar, post creation, community management, analytics',
    paymentStructure: 'Monthly retainer',
    estimatedValue: '₹15,000 - ₹75,000',
    tags: ['Marketing', 'Social Media']
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    icon: Search,
    description: 'Search engine optimization services',
    scope: 'Keyword research, on-page SEO, link building, analytics',
    paymentStructure: 'Monthly retainer or project-based',
    estimatedValue: '₹20,000 - ₹1,00,000',
    tags: ['Marketing', 'Technical']
  },
  {
    id: 'virtual-assistant',
    name: 'Virtual Assistant',
    icon: Briefcase,
    description: 'Administrative and business support',
    scope: 'Email management, scheduling, data entry, customer support',
    paymentStructure: 'Hourly or monthly retainer',
    estimatedValue: '₹10,000 - ₹40,000',
    tags: ['Admin', 'Support']
  },
  {
    id: 'video-editor',
    name: 'Video Editor',
    icon: Video,
    description: 'Video production and editing',
    scope: 'Video editing, motion graphics, color correction, audio sync',
    paymentStructure: 'Per video or monthly package',
    estimatedValue: '₹15,000 - ₹1,00,000',
    tags: ['Creative', 'Media']
  },
  {
    id: 'app-developer',
    name: 'App Developer',
    icon: Smartphone,
    description: 'Mobile application development',
    scope: 'iOS/Android app development, testing, deployment',
    paymentStructure: '40% upfront, 40% on beta, 20% final',
    estimatedValue: '₹1,00,000 - ₹5,00,000',
    tags: ['Development', 'Mobile']
  },
  {
    id: 'translator',
    name: 'Translator',
    icon: Languages,
    description: 'Language translation services',
    scope: 'Document translation, localization, proofreading',
    paymentStructure: 'Per word or per project',
    estimatedValue: '₹5,000 - ₹50,000',
    tags: ['Language', 'Documentation']
  },
  {
    id: 'consultant',
    name: 'Freelance Consultant',
    icon: Briefcase,
    description: 'Business and strategy consulting',
    scope: 'Strategic planning, business analysis, process improvement',
    paymentStructure: 'Hourly or project-based',
    estimatedValue: '₹25,000 - ₹2,00,000',
    tags: ['Business', 'Strategy']
  }
];

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  data,
  updateData,
  onNext
}) => {
  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    updateData({
      templateId: template.id,
      templateName: template.name,
      services: template.scope,
      paymentSchedule: [
        { description: 'Initial payment', percentage: 50 },
        { description: 'Final payment', percentage: 50 }
      ]
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Choose a Template</h2>
        <p className="text-muted-foreground text-sm">
          Select from our pre-built templates to get started quickly
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template, index) => {
          const IconComponent = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  data.templateId === template.id ? 'ring-2 ring-accent' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Scope: </span>
                      <span className="text-muted-foreground">{template.scope}</span>
                    </div>
                    <div>
                      <span className="font-medium">Payment: </span>
                      <span className="text-muted-foreground">{template.paymentStructure}</span>
                    </div>
                    <div>
                      <span className="font-medium">Typical Value: </span>
                      <span className="text-accent font-medium">{template.estimatedValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelection;
