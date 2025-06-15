
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Save, Eye, Sparkles, FileText, Download, Send, Lock, Clock, Copy, Mail, Phone, KeyRound } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import ESignDialog from '@/components/contract-builder/ESignDialog';
import TemplateSelection from '@/components/contract-builder/TemplateSelection';
import DocumentHeaders from '@/components/contract-builder/DocumentHeaders';
import AgreementIntroduction from '@/components/contract-builder/AgreementIntroduction';
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
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineSpacing?: number;
  headingStyle?: string;
  listStyle?: string;
  textAlignment?: string;
  paragraphSpacing?: number;
  
  // Section-specific formatting
  partiesBold?: boolean;
  partiesBullets?: boolean;
  scopeBold?: boolean;
  scopeBullets?: boolean;
  paymentBold?: boolean;
  paymentBullets?: boolean;
  termsBold?: boolean;
  termsBullets?: boolean;
  
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
  
  // Security
  accessKey?: string;
  
  // Agreement Introduction
  agreementIntroText: string;
  effectiveDate: string;
  introductionClauses?: string[];
  
  // Font size controls
  headerFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  sectionHeaderFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subHeaderFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  bodyFontSize?: 'small' | 'medium' | 'large' | 'xlarge';
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
    { id: 'introduction', title: 'Agreement Introduction', component: AgreementIntroduction },
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
  const [activeSection, setActiveSection] = useState<string | undefined>(isEditMode ? 'headers' : 'template');
  const [contractData, setContractData] = useState<ContractData>({
    documentTitle: 'SERVICE AGREEMENT',
    documentSubtitle: 'PROFESSIONAL SERVICE CONTRACT',
    agreementIntroText: 'This Service Agreement ("Agreement") is entered into between the parties identified below for the provision of professional services as outlined in this document.',
    effectiveDate: '',
    logoStyle: 'round',
    primaryColor: '#3B82F6',
    fontFamily: 'inter',
    fontSize: 'medium',
    lineSpacing: 1.5,
    headingStyle: 'h1',
    listStyle: 'ul',
    textAlignment: 'left',
    paragraphSpacing: 1.5,
    partiesBold: false,
    partiesBullets: false,
    scopeBold: false,
    scopeBullets: false,
    paymentBold: false,
    paymentBullets: false,
    termsBold: false,
    termsBullets: false,
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
  const [contractStatus, setContractStatus] = useState<'draft' | 'sent' | 'signed' | 'cancelled' | 'sent_for_signature' | 'revision_requested'>('draft');
  const [saving, setSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showESignDialog, setShowESignDialog] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState<string | null>(null);
  const [shareInfo, setShareInfo] = useState<{
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  } | null>(null);

  // Auto-save functionality with debounce
  const debouncedSave = useCallback(
    debounce(() => {
      if (contractData && user && !isLocked) {
        saveProgress();
      }
    }, 2000), // Save after 2 seconds of no changes
    [contractData, user, isLocked]
  );

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

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

  // Auto-save when contract data changes
  useEffect(() => {
    if (contractId && user && !isLocked) {
      debouncedSave();
    }
  }, [contractData, contractId, user, isLocked, debouncedSave]);

  // Check if contract can be unlocked (24 hours passed)
  useEffect(() => {
    if (isLocked && lockedAt) {
      const lockTime = new Date(lockedAt).getTime();
      const now = new Date().getTime();
      const hoursPassed = (now - lockTime) / (1000 * 60 * 60);
      
      if (hoursPassed >= 24) {
        unlockContract();
      }
    }
  }, [isLocked, lockedAt]);

  const unlockContract = async () => {
    if (!contractId) return;
    
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          is_locked: false,
          locked_at: null
        })
        .eq('id', contractId);
      
      if (error) throw error;
      
      setIsLocked(false);
      setLockedAt(null);
      
      toast({
        title: "Contract Unlocked",
        description: "24 hours have passed. You can now edit the contract again."
      });
    } catch (error) {
      console.error('Error unlocking contract:', error);
    }
  };

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
        setContractData({
          ...loadedData,
          documentTitle: loadedData.documentTitle || 'SERVICE AGREEMENT',
          documentSubtitle: loadedData.documentSubtitle || 'PROFESSIONAL SERVICE CONTRACT',
          logoStyle: loadedData.logoStyle || 'round',
          primaryColor: loadedData.primaryColor || '#3B82F6',
          fontFamily: loadedData.fontFamily || 'inter',
          fontSize: loadedData.fontSize || 'medium',
          lineSpacing: loadedData.lineSpacing || 1.5,
          headingStyle: loadedData.headingStyle || 'h1',
          listStyle: loadedData.listStyle || 'ul',
          textAlignment: loadedData.textAlignment || 'left',
          paragraphSpacing: loadedData.paragraphSpacing || 1.5,
          partiesBold: loadedData.partiesBold || false,
          partiesBullets: loadedData.partiesBullets || false,
          scopeBold: loadedData.scopeBold || false,
          scopeBullets: loadedData.scopeBullets || false,
          paymentBold: loadedData.paymentBold || false,
          paymentBullets: loadedData.paymentBullets || false,
          termsBold: loadedData.termsBold || false,
          termsBullets: loadedData.termsBullets || false
        });
        setContractId(data.id);
        setContractStatus(data.status || 'draft');
        setIsLocked(data.is_locked || false);
        setLockedAt(data.locked_at);
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
    if (!user || isLocked) return;
    
    setSaving(true);
    try {
      const contractPayload = {
        user_id: user.id,
        title: contractData.templateName || `Contract with ${contractData.clientName || 'Client'}`,
        status: contractStatus,
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
      
      if (!isLocked) {
        toast({
          title: "Auto-saved",
          description: "Your changes have been saved automatically.",
          duration: 2000
        });
      }
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
    if (!isLocked) {
      setContractData(prev => ({ ...prev, ...updates }));
    }
  };

  const handleSectionChange = (value: string | undefined) => {
    setActiveSection(value);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const previewElement = document.querySelector('.contract-preview');
      if (!previewElement) {
        throw new Error('Contract preview not found');
      }

      const canvas = await html2canvas(previewElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

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
    if (isLocked) {
      toast({
        title: "Contract Locked",
        description: "This contract is already locked and cannot generate new eSign links.",
        variant: "destructive"
      });
      return;
    }
    setShowESignDialog(true);
  };

  const handleESignSuccess = (shareData: any) => {
    setShareInfo(shareData);
    setIsLocked(true);
    setLockedAt(new Date().toISOString());
    setContractStatus('sent_for_signature');
    setShowESignDialog(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`
    });
  };

  // Add event listeners for navbar actions
  useEffect(() => {
    const handleDownloadEvent = () => {
      handleDownloadPDF();
    };

    const handleShareEvent = () => {
      handleShareLink();
    };

    window.addEventListener('downloadPDF', handleDownloadEvent);
    window.addEventListener('shareContract', handleShareEvent);

    return () => {
      window.removeEventListener('downloadPDF', handleDownloadEvent);
      window.removeEventListener('shareContract', handleShareEvent);
    };
  }, [isLocked]);

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
          {/* Left Panel */}
          <div className="w-2/5 border-r bg-card p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <ContractStatusBadge status={contractStatus} />
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Saving...
                  </div>
                )}
              </div>

              {/* Simple status indicators */}
              {contractStatus === 'revision_requested' && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-medium">Revision Requested</h3>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Client has requested changes. View details in Contract View.
                  </p>
                </div>
              )}

              {contractStatus === 'sent_for_signature' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Send className="h-5 w-5" />
                    <h3 className="font-medium">eSign Sent</h3>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Contract shared with client for signature.
                  </p>
                </div>
              )}

              {isLocked && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <Lock className="h-5 w-5" />
                    <h3 className="font-medium">Contract Locked</h3>
                  </div>
                  <p className="text-sm text-red-700 mb-2">
                    This contract is locked for editing because an eSign link has been generated.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {lockedAt && (() => {
                        const lockTime = new Date(lockedAt).getTime();
                        const now = new Date().getTime();
                        const hoursPassed = (now - lockTime) / (1000 * 60 * 60);
                        const hoursRemaining = Math.max(0, 24 - hoursPassed);
                        
                        if (hoursRemaining > 0) {
                          return `Unlocks in ${Math.ceil(hoursRemaining)} hours`;
                        } else {
                          return "Contract can be unlocked now";
                        }
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="edit" disabled={isLocked}>
                  Edit Contract {isLocked && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
                <TabsTrigger value="design" disabled={isLocked}>
                  Design {isLocked && <Lock className="h-3 w-3 ml-1" />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-3">
                <Accordion type="single" value={activeSection} onValueChange={handleSectionChange} collapsible className="space-y-3">
                  {EDIT_STEPS.map((step, index) => {
                    const Component = step.component;
                    return (
                      <AccordionItem key={step.id} value={step.id} className={`border rounded-lg px-4 ${isLocked ? 'opacity-50' : ''}`}>
                        <AccordionTrigger className="text-left hover:no-underline py-4" disabled={isLocked}>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              activeSection === step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{step.title}</span>
                            {isLocked && <Lock className="h-3 w-3 ml-auto" />}
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
                <Accordion type="single" value={activeSection} onValueChange={handleSectionChange} collapsible className="space-y-3">
                  {DESIGN_STEPS.map((step, index) => {
                    const Component = step.component;
                    return (
                      <AccordionItem key={step.id} value={step.id} className={`border rounded-lg px-4 ${isLocked ? 'opacity-50' : ''}`}>
                        <AccordionTrigger className="text-left hover:no-underline py-4" disabled={isLocked}>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                              activeSection === step.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">{step.title}</span>
                            {isLocked && <Lock className="h-3 w-3 ml-auto" />}
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

          {/* Right Panel */}
          <div className="w-3/5 bg-muted/20">
            <ContractPreview data={contractData} />
          </div>
        </div>
      </div>
      <ESignDialog 
        isOpen={showESignDialog} 
        onClose={() => setShowESignDialog(false)} 
        contractId={contractId}
        onSuccess={handleESignSuccess}
      />
    </>
  );
};

export default ContractBuilder;
