
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    name: string;
    description: string;
    price: string;
    icon: React.ComponentType<any>;
    popular?: boolean;
  } | null;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  if (!template) return null;

  const Icon = template.icon;

  // Generate preview content based on template type
  const getPreviewContent = () => {
    switch (template.id) {
      case 'web-developer':
        return (
          <div className="space-y-4 text-sm">
            <div className="border-b pb-2">
              <h3 className="font-bold">WEB DEVELOPMENT SERVICE AGREEMENT</h3>
              <p className="text-muted-foreground">Professional Service Contract</p>
            </div>
            <div className="space-y-2">
              <p><strong>Freelancer:</strong> [Your Name]</p>
              <p><strong>Client:</strong> [Client Name]</p>
              <p><strong>Services:</strong> Website development, frontend/backend coding, database design, deployment</p>
              <p><strong>Payment:</strong> 50% upfront, 50% on completion</p>
              <p><strong>Timeline:</strong> 4-8 weeks</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="font-medium">Key Deliverables:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Responsive website design</li>
                <li>Backend API development</li>
                <li>Database setup and configuration</li>
                <li>Testing and deployment</li>
              </ul>
            </div>
          </div>
        );
      case 'ui-ux-designer':
        return (
          <div className="space-y-4 text-sm">
            <div className="border-b pb-2">
              <h3 className="font-bold">UI/UX DESIGN SERVICE AGREEMENT</h3>
              <p className="text-muted-foreground">Creative Service Contract</p>
            </div>
            <div className="space-y-2">
              <p><strong>Designer:</strong> [Your Name]</p>
              <p><strong>Client:</strong> [Client Name]</p>
              <p><strong>Services:</strong> Wireframing, prototyping, visual design, user research</p>
              <p><strong>Payment:</strong> 30% upfront, 40% on design approval, 30% final</p>
              <p><strong>Revisions:</strong> Up to 3 rounds included</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="font-medium">Design Process:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>User research and analysis</li>
                <li>Wireframe creation</li>
                <li>Visual design mockups</li>
                <li>Interactive prototypes</li>
              </ul>
            </div>
          </div>
        );
      case 'content-writer':
        return (
          <div className="space-y-4 text-sm">
            <div className="border-b pb-2">
              <h3 className="font-bold">CONTENT WRITING SERVICE AGREEMENT</h3>
              <p className="text-muted-foreground">Writing Service Contract</p>
            </div>
            <div className="space-y-2">
              <p><strong>Writer:</strong> [Your Name]</p>
              <p><strong>Client:</strong> [Client Name]</p>
              <p><strong>Services:</strong> Blog posts, website copy, marketing content, SEO writing</p>
              <p><strong>Payment:</strong> Per article or monthly retainer</p>
              <p><strong>Turnaround:</strong> 3-5 business days per article</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="font-medium">Content Deliverables:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>SEO-optimized articles</li>
                <li>Keyword research included</li>
                <li>2 rounds of revisions</li>
                <li>Meta descriptions and titles</li>
              </ul>
            </div>
          </div>
        );
      case 'digital-marketer':
        return (
          <div className="space-y-4 text-sm">
            <div className="border-b pb-2">
              <h3 className="font-bold">DIGITAL MARKETING SERVICE AGREEMENT</h3>
              <p className="text-muted-foreground">Marketing Service Contract</p>
            </div>
            <div className="space-y-2">
              <p><strong>Marketer:</strong> [Your Name]</p>
              <p><strong>Client:</strong> [Client Name]</p>
              <p><strong>Services:</strong> SEO, social media marketing, PPC campaigns, analytics</p>
              <p><strong>Payment:</strong> Monthly retainer + ad spend</p>
              <p><strong>Reporting:</strong> Weekly performance reports</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="font-medium">Marketing Deliverables:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>SEO optimization and keyword research</li>
                <li>Social media content calendar</li>
                <li>PPC campaign management</li>
                <li>Monthly analytics reports</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4 text-sm">
            <div className="border-b pb-2">
              <h3 className="font-bold">{template.name.toUpperCase()} SERVICE AGREEMENT</h3>
              <p className="text-muted-foreground">Professional Service Contract</p>
            </div>
            <div className="space-y-2">
              <p><strong>Service Provider:</strong> [Your Name]</p>
              <p><strong>Client:</strong> [Client Name]</p>
              <p><strong>Services:</strong> {template.description}</p>
              <p><strong>Rate:</strong> {template.price}</p>
            </div>
            <div className="bg-muted p-3 rounded">
              <p className="font-medium">This template includes:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Professional terms and conditions</li>
                <li>Payment schedule details</li>
                <li>Scope of work definition</li>
                <li>Termination clauses</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">{template.name} Template</DialogTitle>
                <DialogDescription className="mt-1">{template.description}</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">{template.price}</Badge>
              {template.popular && (
                <Badge variant="default" className="text-sm">Popular</Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Preview Content */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Template Preview</h4>
            <div className="border rounded-lg p-4 bg-white min-h-[400px] overflow-y-auto">
              {getPreviewContent()}
            </div>
          </div>
          
          {/* Template Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">What's Included</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h5 className="font-medium">Professional Layout</h5>
                  <p className="text-sm text-muted-foreground">Clean, professional formatting that builds trust</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h5 className="font-medium">Legal Protection</h5>
                  <p className="text-sm text-muted-foreground">Industry-standard terms and conditions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h5 className="font-medium">Customizable Sections</h5>
                  <p className="text-sm text-muted-foreground">Easily modify terms to fit your needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h5 className="font-medium">Payment Terms</h5>
                  <p className="text-sm text-muted-foreground">Clear payment schedules and late fee policies</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h5 className="font-medium">Digital Signatures</h5>
                  <p className="text-sm text-muted-foreground">E-signature ready for quick execution</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={onClose}>
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;
