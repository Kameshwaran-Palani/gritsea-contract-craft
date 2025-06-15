import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import DesignCustomization from '@/components/contract-builder/DesignCustomization';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import ReviewExport from '@/components/contract-builder/ReviewExport';
import AgreementIntroduction from '@/components/contract-builder/AgreementIntroduction';
import AIAssistantSidebar from '@/components/contract-builder/AIAssistantSidebar';

export interface Milestone {
  title: string;
  description: string;
  dueDate: string;
  amount?: number;
}

export interface PaymentScheduleItem {
  description: string;
  percentage: number;
  dueDate: string;
}

export interface ContractData {
  template: string;
  documentTitle: string;
  documentSubtitle: string;
  effectiveDate: string;
  freelancerName: string;
  freelancerBusinessName: string;
  freelancerAddress: string;
  freelancerEmail: string;
  freelancerPhone: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  agreementIntroText: string;
  services: string;
  deliverables: string;
  milestones: Milestone[];
  paymentType: string;
  rate: number;
  totalAmount: number;
  paymentSchedule: PaymentScheduleItem[];
  lateFeeEnabled: boolean;
  lateFeeAmount: number;
  startDate: string;
  endDate: string;
  isRetainer: boolean;
  retainerAmount: number;
  renewalCycle: string;
  autoRenew: boolean;
  responseTime: string;
  revisionLimit: number;
  uptimeRequirement: string;
  includeNDA: boolean;
  confidentialityScope: string;
  confidentialityDuration: string;
  breachPenalty: number;
  ipOwnership: string;
  usageRights: string;
  terminationConditions: string;
  noticePeriod: string;
  jurisdiction: string;
  arbitrationClause: boolean;
  primaryColor: string;
  fontFamily: string;
  fontSize: string;
  headerFontSize: string;
  subHeaderFontSize: string;
  sectionHeaderFontSize: string;
  bodyFontSize: string;
  lineSpacing: number;
  leftLogo: string;
  rightLogo: string;
  logoStyle: string;
  termsBold: boolean;
  scopeBold: boolean;
  partiesBold: boolean;
  paymentBold: boolean;
  freelancerSignature: string;
  clientSignature: string;
  signedDate: string;
}

const ContractBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeSection, setActiveSection] = useState<string>('template');
  const [contractData, setContractData] = useState<ContractData>({
    template: '',
    documentTitle: 'Service Agreement',
    documentSubtitle: 'This Agreement contains the terms and conditions for services provided by [Service Provider] to [Client]',
    effectiveDate: new Date().toISOString().split('T')[0],
    freelancerName: '',
    freelancerBusinessName: '',
    freelancerAddress: '',
    freelancerEmail: '',
    freelancerPhone: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    agreementIntroText: '',
    services: '',
    deliverables: '',
    milestones: [],
    paymentType: 'fixed',
    rate: 0,
    totalAmount: 0,
    paymentSchedule: [],
    lateFeeEnabled: false,
    lateFeeAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    isRetainer: false,
    retainerAmount: 0,
    renewalCycle: 'monthly',
    autoRenew: true,
    responseTime: '24 hours',
    revisionLimit: 3,
    uptimeRequirement: '99.9%',
    includeNDA: false,
    confidentialityScope: '',
    confidentialityDuration: '',
    breachPenalty: 0,
    ipOwnership: 'client',
    usageRights: 'full',
    terminationConditions: '',
    noticePeriod: '30 days',
    jurisdiction: 'Your Jurisdiction',
    arbitrationClause: true,
    primaryColor: '#4ade80',
    fontFamily: 'inter',
    fontSize: 'medium',
    headerFontSize: 'xlarge',
    subHeaderFontSize: 'medium',
    sectionHeaderFontSize: 'large',
    bodyFontSize: 'medium',
    lineSpacing: 1.5,
    leftLogo: '',
    rightLogo: '',
    logoStyle: 'square',
    termsBold: false,
    scopeBold: false,
    partiesBold: false,
    paymentBold: false,
    freelancerSignature: '',
    clientSignature: '',
    signedDate: new Date().toISOString().split('T')[0],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
	const [contract, setContract] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [lockedAt, setLockedAt] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadContract(id);
    } else {
      // Set a default template when creating a new contract
      setContractData(prev => ({ ...prev, template: 'basic-service-agreement' }));
    }

    // Check if contract is locked every 10 seconds
    const intervalId = setInterval(() => {
      if (id) {
        checkContractLock(id);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    // Listen for download PDF event
    const handleDownloadPDF = () => {
      handleSaveContract('download');
    };

    // Listen for share contract event
    const handleShareContract = () => {
      handleSaveContract('share');
    };

    window.addEventListener('downloadPDF', handleDownloadPDF);
    window.addEventListener('shareContract', handleShareContract);

    return () => {
      window.removeEventListener('downloadPDF', handleDownloadPDF);
      window.removeEventListener('shareContract', handleShareContract);
    };
  }, [contractData]);

  const loadContract = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();
      
      if (error || !data) {
        toast({
          title: "Error",
          description: "Failed to load contract",
          variant: "destructive"
        });
        return;
      }
      
      setContract(data);
      setContractData(data.clauses_json as unknown as ContractData);
      checkContractLock(contractId);
    } catch (error) {
      console.error('Error loading contract:', error);
      toast({
        title: "Error",
        description: "Failed to load contract",
        variant: "destructive"
      });
    }
  };

  const checkContractLock = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('is_locked, locked_by, locked_at')
        .eq('id', contractId)
        .single();
      
      if (error) throw error;
      
      setIsLocked(data?.is_locked || false);
      setLockedBy(data?.locked_by || null);
      setLockedAt(data?.locked_at || null);
      
      if (data?.is_locked && data?.locked_by !== supabase.auth.user()?.id) {
        toast({
          title: "Contract Locked",
          description: `This contract is currently being edited by another user. You can view it, but you won't be able to make changes.`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking contract lock:', error);
    }
  };

  const lockContract = useCallback(async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          is_locked: true,
          locked_by: supabase.auth.user()?.id,
          locked_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      setIsLocked(true);
      setLockedBy(supabase.auth.user()?.id || null);
      setLockedAt(new Date().toISOString());
    } catch (error) {
      console.error('Error locking contract:', error);
      toast({
        title: "Error",
        description: "Failed to lock contract",
        variant: "destructive"
      });
    }
  }, [id]);

  const unlockContract = useCallback(async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .update({ 
          is_locked: false,
          locked_by: null,
          locked_at: null
        })
        .eq('id', id);
      
      if (error) throw error;
      setIsLocked(false);
      setLockedBy(null);
      setLockedAt(null);
    } catch (error) {
      console.error('Error unlocking contract:', error);
      toast({
        title: "Error",
        description: "Failed to unlock contract",
        variant: "destructive"
      });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      lockContract();

      // Unlock contract when component unmounts
      return () => {
        unlockContract();
      };
    }
  }, [id, lockContract, unlockContract]);

  const updateContractData = (newData: Partial<ContractData>) => {
    setContractData(prev => ({ ...prev, ...newData }));
  };

  const handleSaveContract = async (action: 'save' | 'publish' | 'download' | 'share' = 'save') => {
    if (!contractData) {
      toast({
        title: "Error",
        description: "No contract data to save.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    if (action === 'publish') setIsPublishing(true);

    try {
      const clausesJson = contractData as unknown as Record<string, any>;
      const status = action === 'publish' ? 'shared' : 'draft';

      if (id) {
        // Update existing contract
        const { error } = await supabase
          .from('contracts')
          .update({ 
            clauses_json: clausesJson,
            status: status
          })
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Contract Updated",
          description: "Contract has been updated successfully."
        });
      } else {
        // Create new contract
        const { data, error } = await supabase
          .from('contracts')
          .insert([{ 
            clauses_json: clausesJson,
            user_id: supabase.auth.user()?.id,
            status: status
          }])
          .select('*')

        if (error) throw error;

        toast({
          title: "Contract Created",
          description: "Contract has been created successfully."
        });
        
        // Redirect to edit page with new contract ID
        if (data && data.length > 0) {
          navigate(`/contract/edit/${data[0].id}`);
        }
      }

      if (action === 'download') {
        // Trigger PDF download
        const previewContent = document.querySelector('.contract-preview');
        if (previewContent) {
          const { exportAsPdf } = await import('@/utils/pdfExporter');
          exportAsPdf(previewContent, contractData.documentTitle || 'Contract');
        } else {
          toast({
            title: "Error",
            description: "Could not find contract preview to download.",
            variant: "destructive"
          });
        }
      }

      if (action === 'share') {
        // Trigger eSign flow
        const { data, error } = await supabase
          .from('contracts')
          .update({ status: 'sent' })
          .eq('id', id)
          .select('*')

        if (error) throw error;

        toast({
          title: "Contract Shared",
          description: "Contract has been shared successfully."
        });

        if (data && data.length > 0) {
          navigate(`/contract/view/${data[0].id}`);
        }
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "Error",
        description: "Failed to save contract",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'template':
        return <TemplateSelection updateContractData={updateContractData} contractData={contractData} />;
      case 'documentHeaders':
        return <DocumentHeaders updateContractData={updateContractData} contractData={contractData} />;
      case 'agreementIntro':
        return <AgreementIntroduction updateContractData={updateContractData} contractData={contractData} />;
      case 'partiesInformation':
        return <PartiesInformation updateContractData={updateContractData} contractData={contractData} />;
      case 'scopeOfWork':
        return <ScopeOfWork updateContractData={updateContractData} contractData={contractData} />;
      case 'paymentTerms':
        return <PaymentTerms updateContractData={updateContractData} contractData={contractData} />;
      case 'ongoingWork':
        return <OngoingWork updateContractData={updateContractData} contractData={contractData} />;
      case 'serviceLevelAgreement':
        return <ServiceLevelAgreement updateContractData={updateContractData} contractData={contractData} />;
      case 'confidentiality':
        return <Confidentiality updateContractData={updateContractData} contractData={contractData} />;
      case 'intellectualProperty':
        return <IntellectualProperty updateContractData={updateContractData} contractData={contractData} />;
      case 'terminationDispute':
        return <TerminationDispute updateContractData={updateContractData} contractData={contractData} />;
      case 'designCustomization':
        return <DesignCustomization updateContractData={updateContractData} contractData={contractData} />;
      case 'reviewExport':
        return <ReviewExport contractData={contractData} onSave={handleSaveContract} isSaving={isSaving} isPublishing={isPublishing} />;
      default:
        return <div>Select a section to start building your contract.</div>;
    }
  };

  const isCurrentSection = (section: string) => activeSection === section;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="col-span-1">
            <nav className="space-y-1" aria-label="Sidebar">
              <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Contract Sections
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('template')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('template') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('template') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Template
                </button>
                <button
                  onClick={() => setActiveSection('documentHeaders')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('documentHeaders') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('documentHeaders') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Document Headers
                </button>
                <button
                  onClick={() => setActiveSection('agreementIntro')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('agreementIntro') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('agreementIntro') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Agreement Intro
                </button>
                <button
                  onClick={() => setActiveSection('partiesInformation')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('partiesInformation') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('partiesInformation') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Parties Information
                </button>
                <button
                  onClick={() => setActiveSection('scopeOfWork')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('scopeOfWork') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('scopeOfWork') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Scope of Work
                </button>
                <button
                  onClick={() => setActiveSection('paymentTerms')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('paymentTerms') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('paymentTerms') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Payment Terms
                </button>
                <button
                  onClick={() => setActiveSection('ongoingWork')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('ongoingWork') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('ongoingWork') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Ongoing Work & Retainer
                </button>
                <button
                  onClick={() => setActiveSection('serviceLevelAgreement')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('serviceLevelAgreement') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('serviceLevelAgreement') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Service Level Agreement
                </button>
                <button
                  onClick={() => setActiveSection('confidentiality')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('confidentiality') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('confidentiality') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Confidentiality
                </button>
                <button
                  onClick={() => setActiveSection('intellectualProperty')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('intellectualProperty') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('intellectualProperty') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Intellectual Property
                </button>
                <button
                  onClick={() => setActiveSection('terminationDispute')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('terminationDispute') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('terminationDispute') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Termination & Dispute
                </button>
              </div>
              <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-6">
                Design
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('designCustomization')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('designCustomization') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <CheckCircle className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('designCustomization') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Design Customization
                </button>
              </div>
              <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-6">
                Review & Export
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('reviewExport')}
                  className={`bg-white text-gray-700 hover:bg-gray-50 group w-full flex items-center pl-3 pr-2 py-2 text-sm font-medium rounded-md ${isCurrentSection('reviewExport') ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <Clock className={`mr-3 h-5 w-5 text-gray-400 ${isCurrentSection('reviewExport') ? 'text-blue-500' : ''}`} aria-hidden="true" />
                  Review & Export
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-1 lg:col-span-2 bg-white shadow-lg rounded-lg p-6">
            {/* Section Content */}
            {renderSectionContent()}
          </main>

          {/* Right Sidebar - AI Assistant */}
          <aside className="col-span-1 bg-white shadow-lg rounded-lg p-6">
            <AIAssistantSidebar contractData={contractData} updateContractData={updateContractData} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContractBuilder;
