import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Save, Eye, Sparkles, FileText, Download, Send } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Step Components
import TemplateSelection from '@/components/contract-builder/TemplateSelection';
import DocumentHeaders from '@/components/contract-builder/DocumentHeaders';
import PartiesInformation from '@/components/contract-builder/PartiesInformation';
import ScopeOfWork from '@/components/contract-builder/ScopeOfWork';
import PaymentTerms from '@/components/contract-builder/PaymentTerms';
import OngoingWork from '@/components/contract-builder/OngoingWork';
import ServiceLevelAgreement from '@/components/contract-builder/ServiceLevelAgreement';
import Confidentiality from '@/components/contract-builder/Confidentiality';
import IntellectualProperty from '@/components/contract-builder/IntellectualProperty';
import TerminationDispute from '@/components/contract-builder/TerminationDispute';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import DesignCustomization from '@/components/contract-builder/DesignCustomization';
import ReviewExport from '@/components/contract-builder/ReviewExport';
import ContractPreview from '@/components/contract-builder/ContractPreview';

export interface ContractData {
  // Template
  templateId?: string;
  templateName?: string;
  
  // Document Headers
  documentTitle: string;
  documentSubtitle: string;
  
  // Brand Logos
  leftLogo?: string;
  rightLogo?: string;
  logoStyle: 'round' | 'rectangle';
  
  // Design
  primaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Parties
  freelancerName: string;
  freelancerBusinessName?: string;
  freelancerAddress: string;
  freelancerEmail: string;
  freelancerPhone?: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  startDate: string;
  endDate?: string;
  
  // Scope
  services: string;
  deliverables: string;
  milestones: Array<{ title: string; description: string; dueDate: string; amount?: number }>;
  
  // Payment
  paymentType: 'fixed' | 'hourly';
  rate: number;
  totalAmount?: number;
  paymentSchedule: Array<{ description: string; percentage: number; dueDate?: string }>;
  lateFeeEnabled: boolean;
  lateFeeAmount?: number;
  
  // Ongoing Work
  isRetainer: boolean;
  retainerAmount?: number;
  renewalCycle?: 'monthly' | 'quarterly' | 'yearly';
  autoRenew: boolean;
  
  // SLA
  responseTime: string;
  revisionLimit: number;
  uptimeRequirement?: string;
  
  // NDA
  includeNDA: boolean;
  confidentialityScope?: string;
  confidentialityDuration?: string;
  breachPenalty?: number;
  
  // IP
  ipOwnership: 'freelancer' | 'client' | 'joint';
  usageRights: 'limited' | 'full';
  
  // Termination
  terminationConditions: string;
  noticePeriod: string;
  jurisdiction: string;
  arbitrationClause: boolean;
  
  // Signature
  freelancerSignature?: string;
  clientSignature?: string;
  signedDate?: string;
}

const ContractBuilder = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  
  // Determine if this is editing mode
  const isEditMode = Boolean(id);
  
  // Filter steps based on edit mode - split into Edit and Design tabs
  const EDIT_STEPS = [
    ...(isEditMode ? [] : [{ id: 'template', title: 'Choose Template', component: TemplateSelection }]),
    { id: 'headers', title: 'Document Headers', component: DocumentHeaders },
    { id: 'parties', title: 'Parties Information', component: PartiesInformation },
    { id: 'scope', title: 'Scope of Work', component: ScopeOfWork },
    { id: 'payment', title: 'Payment Terms', component: PaymentTerms },
    { id: 'ongoing', title: 'Ongoing Work', component: OngoingWork },
    { id: 'sla', title: 'Service Level Agreement', component: ServiceLevelAgreement },
    { id: 'nda', title: 'Confidentiality', component: Confidentiality },
    { id: 'ip', title: 'Intellectual Property', component: IntellectualProperty },
    { id: 'termination', title: 'Termination & Dispute', component: TerminationDispute },
    { id: 'signature', title: 'Signature', component: SignatureStep },
  ];

  const DESIGN_STEPS = [
    { id: 'design', title: 'Design & Branding', component: DesignCustomization },
  ];
  
  const [activeTab, setActiveTab] = useState('edit');
  const [activeSection, setActiveSection] = useState(isEditMode ? 'headers' : 'template');
  const [contractData, setContractData] = useState<ContractData>({
    documentTitle: 'SERVICE AGREEMENT',
    documentSubtitle: 'PROFESSIONAL SERVICE CONTRACT',
    logoStyle: 'round',
    primaryColor: '#3B82F6',
    fontFamily: 'inter',
    fontSize: 'medium',
    freelancerName: '',
    freelancerAddress: '',
    freelancerEmail: '',
    clientName: '',
    clientEmail: '',
    startDate: '',
    services: '',
    deliverables: '',
    milestones: [],
    paymentType: 'fixed',
    rate: 0,
    paymentSchedule: [{ description: 'Full payment', percentage: 100 }],
    lateFeeEnabled: false,
    isRetainer: false,
    autoRenew: false,
    responseTime: '24 hours',
    revisionLimit: 3,
    includeNDA: true,
    ipOwnership: 'client',
    usageRights: 'full',
    terminationConditions: 'Either party may terminate this agreement with written notice.',
    noticePeriod: '30 days',
    jurisdiction: 'India',
    arbitrationClause: true
  });
  
  const [contractId, setContractId] = useState<string | null>(id || null);
  const [saving, setSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (user) {
      setContractData(prev => ({
        ...prev,
        freelancerName: user.user_metadata?.full_name || '',
        freelancerEmail: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (id && user) {
      loadContract(id);
    }
  }, [id, user]);

  const loadContract = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      
      if (data && data.clauses_json) {
        const loadedData = data.clauses_json as unknown as ContractData;
        // Ensure document headers exist
        setContractData({
          ...loadedData,
          documentTitle: loadedData.documentTitle || 'SERVICE AGREEMENT',
          documentSubtitle: loadedData.documentSubtitle || 'PROFESSIONAL SERVICE CONTRACT',
          logoStyle: loadedData.logoStyle || 'round',
          primaryColor: loadedData.primaryColor || '#3B82F6',
          fontFamily: loadedData.fontFamily || 'inter',
          fontSize: loadedData.fontSize || 'medium'
        });
        setContractId(data.id);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
      toast({
        title: "Error",
        description: "Failed to load contract",
        variant: "destructive"
      });
    }
  };

  const saveProgress = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const contractPayload = {
        user_id: user.id,
        title: contractData.templateName || `Contract with ${contractData.clientName || 'Client'}`,
        status: 'draft' as const,
        client_name: contractData.clientName,
        client_email: contractData.clientEmail,
        client_phone: contractData.clientPhone,
        scope_of_work: contractData.services,
        payment_terms: JSON.stringify(contractData.paymentSchedule),
        project_timeline: contractData.endDate,
        contract_amount: contractData.totalAmount || contractData.rate,
        clauses_json: contractData as any
      };

      if (contractId) {
        const { error } = await supabase
          .from('contracts')
          .update(contractPayload)
          .eq('id', contractId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('contracts')
          .insert(contractPayload)
          .select('id')
          .single();
        if (error) throw error;
        setContractId(data.id);
        navigate(`/contract/edit/${data.id}`, { replace: true });
      }
      
      toast({
        title: "Contract Saved",
        description: "Your progress has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "Error",
        description: "Failed to save contract",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateContractData = (updates: Partial<ContractData>) => {
    setContractData(prev => ({ ...prev, ...updates }));
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Get the contract preview element
      const previewElement = document.querySelector('.contract-preview');
      if (!previewElement) {
        throw new Error('Contract preview not found');
      }

      // Generate canvas from the preview
      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF-like download
      const link = document.createElement('a');
      link.download = `${contractData.templateName || 'contract'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "PDF Downloaded",
        description: "Your contract has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareLink = async () => {
    if (!contractId) {
      // Save the contract first
      await saveProgress();
    }

    setIsSharing(true);
    try {
      const shareableLink = `${window.location.origin}/contract/view/${contractId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Contract Sharing',
          text: 'Please review and sign this contract',
          url: shareableLink
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareableLink);
        toast({
          title: "Link Copied",
          description: "Contract sharing link copied to clipboard."
        });
      }
    } catch (error) {
      console.error('Error sharing contract:', error);
      toast({
        title: "Error",
        description: "Failed to share contract",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
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
    <>
      <SEOHead 
        title="Contract Builder - Agrezy"
        description="Create professional service contracts with our AI-powered step-by-step builder"
      />
      <div className="min-h-screen bg-background">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Panel - Tabbed Interface */}
          <div className="w-1/2 border-r bg-card p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isEditMode ? 'Edit Your Contract' : 'Build Your Contract'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update your contract details and design' : 'Complete each section to create your contract'}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="edit">Edit Contract</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-3">
                <Accordion type="single" value={activeSection} onValueChange={setActiveSection} className="space-y-3">
                  {EDIT_STEPS.map((step, index) => {
                    const Component = step.component;
                    return (
                      <AccordionItem key={step.id} value={step.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              activeSection === step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{step.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          <Component
                            data={contractData}
                            updateData={updateContractData}
                            onNext={() => {}}
                            onPrev={() => {}}
                            isFirst={index === 0}
                            isLast={index === EDIT_STEPS.length - 1}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>

              <TabsContent value="design" className="space-y-3">
                <Accordion type="single" value={activeSection} onValueChange={setActiveSection} className="space-y-3">
                  {DESIGN_STEPS.map((step, index) => {
                    const Component = step.component;
                    return (
                      <AccordionItem key={step.id} value={step.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              activeSection === step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{step.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          <Component
                            data={contractData}
                            updateData={updateContractData}
                            onNext={() => {}}
                            onPrev={() => {}}
                            isFirst={index === 0}
                            isLast={index === DESIGN_STEPS.length - 1}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-1/2 bg-muted/20">
            <ContractPreview data={contractData} />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t bg-white/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button
              variant="outline"
              onClick={() => navigate('/contracts')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Contracts
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={saveProgress}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? 'Generating...' : 'Download'}
              </Button>
              
              <Button
                onClick={handleShareLink}
                disabled={isSharing || !contractData.clientName || !contractData.services}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                {isSharing ? 'Sharing...' : 'Share Contract'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractBuilder;
