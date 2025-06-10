
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Save, Eye, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';

// Step Components
import TemplateSelection from '@/components/contract-builder/TemplateSelection';
import PartiesInformation from '@/components/contract-builder/PartiesInformation';
import ScopeOfWork from '@/components/contract-builder/ScopeOfWork';
import PaymentTerms from '@/components/contract-builder/PaymentTerms';
import OngoingWork from '@/components/contract-builder/OngoingWork';
import ServiceLevelAgreement from '@/components/contract-builder/ServiceLevelAgreement';
import Confidentiality from '@/components/contract-builder/Confidentiality';
import IntellectualProperty from '@/components/contract-builder/IntellectualProperty';
import TerminationDispute from '@/components/contract-builder/TerminationDispute';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import ReviewExport from '@/components/contract-builder/ReviewExport';
import AIAssistantSidebar from '@/components/contract-builder/AIAssistantSidebar';

export interface ContractData {
  // Template
  templateId?: string;
  templateName?: string;
  
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

const STEPS = [
  { id: 'template', title: 'Choose Template', component: TemplateSelection },
  { id: 'parties', title: 'Parties Information', component: PartiesInformation },
  { id: 'scope', title: 'Scope of Work', component: ScopeOfWork },
  { id: 'payment', title: 'Payment Terms', component: PaymentTerms },
  { id: 'ongoing', title: 'Ongoing Work', component: OngoingWork },
  { id: 'sla', title: 'Service Level Agreement', component: ServiceLevelAgreement },
  { id: 'nda', title: 'Confidentiality', component: Confidentiality },
  { id: 'ip', title: 'Intellectual Property', component: IntellectualProperty },
  { id: 'termination', title: 'Termination & Dispute', component: TerminationDispute },
  { id: 'signature', title: 'Signature', component: SignatureStep },
  { id: 'review', title: 'Review & Export', component: ReviewExport }
];

const ContractBuilder = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [contractData, setContractData] = useState<ContractData>({
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
  
  const [contractId, setContractId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    if (user) {
      // Initialize with user data
      setContractData(prev => ({
        ...prev,
        freelancerName: user.user_metadata?.full_name || '',
        freelancerEmail: user.email || ''
      }));
    }
  }, [user]);

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
        clauses_json: contractData as any // Type assertion to fix JSON compatibility
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
      }
      
      toast({
        title: "Progress Saved",
        description: "Your contract has been saved automatically."
      });
    } catch (error) {
      console.error('Error saving contract:', error);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      saveProgress();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateContractData = (updates: Partial<ContractData>) => {
    setContractData(prev => ({ ...prev, ...updates }));
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

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <>
      <SEOHead 
        title="Contract Builder - Agrezy"
        description="Create professional service contracts with our AI-powered step-by-step builder"
      />
      <DashboardLayout>
        <div className="min-h-screen bg-background">
          <div className="flex">
            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${showAIAssistant ? 'mr-80' : ''}`}>
              <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">Contract Builder</h1>
                      <p className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowAIAssistant(!showAIAssistant)}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Assistant
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </motion.div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {STEPS[currentStep].title}
                          {saving && <Save className="h-4 w-4 animate-pulse text-muted-foreground" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CurrentStepComponent
                          data={contractData}
                          updateData={updateContractData}
                          onNext={nextStep}
                          onPrev={prevStep}
                          isFirst={currentStep === 0}
                          isLast={currentStep === STEPS.length - 1}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center"
                >
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={saveProgress}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    
                    {currentStep < STEPS.length - 1 ? (
                      <Button
                        onClick={nextStep}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/90"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/contracts')}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/90"
                      >
                        <Eye className="h-4 w-4" />
                        View Contracts
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* AI Assistant Sidebar */}
            <AnimatePresence>
              {showAIAssistant && (
                <AIAssistantSidebar
                  contractData={contractData}
                  currentStep={STEPS[currentStep].id}
                  onClose={() => setShowAIAssistant(false)}
                  onSuggestion={(suggestion) => {
                    // Handle AI suggestions
                    console.log('AI Suggestion:', suggestion);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ContractBuilder;
