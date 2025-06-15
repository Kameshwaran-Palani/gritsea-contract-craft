
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Eye, 
  Lock,
  AlertCircle,
  Send
} from 'lucide-react';
import PartiesInformation from '@/components/contract-builder/PartiesInformation';
import ScopeOfWork from '@/components/contract-builder/ScopeOfWork';
import PaymentTerms from '@/components/contract-builder/PaymentTerms';
import TerminationDispute from '@/components/contract-builder/TerminationDispute';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import RevisionRequestModal from '@/components/contract-builder/RevisionRequestModal';
import ESignDialog from '@/components/contract-builder/ESignDialog';
import { useHotkeys } from 'react-hotkeys-hook';
import { Document } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

export interface ContractData {
  documentTitle: string;
  freelancerName: string;
  clientName: string;
  effectiveDate: string;
  projectTitle: string;
  projectDescription: string;
  deliverables: string;
  paymentSchedule: Array<{
    description: string;
    percentage: number;
    dueDate: string;
  }>;
  paymentAmount: number;
  paymentCurrency: string;
  latePaymentTerms: string;
  intellectualProperty: string;
  confidentiality: string;
  terminationClause: string;
  governingLaw: string;
  freelancerSignature: string;
  clientSignature: string;
  clientEmail: string;
  projectDeadline: string;
  paymentType: 'fixed' | 'hourly';
  rate: number;
  totalAmount: number;
  lateFeeEnabled: boolean;
  lateFeeAmount: number;
  [key: string]: any;
}

const ContractBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ContractData>({
    documentTitle: 'Service Contract',
    freelancerName: '',
    clientName: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    projectTitle: '',
    projectDescription: '',
    deliverables: '',
    paymentSchedule: [],
    paymentAmount: 0,
    paymentCurrency: 'USD',
    latePaymentTerms: '',
    intellectualProperty: '',
    confidentiality: '',
    terminationClause: '',
    governingLaw: '',
    freelancerSignature: '',
    clientSignature: '',
    clientEmail: '',
    projectDeadline: new Date().toISOString().split('T')[0],
    paymentType: 'fixed',
    rate: 0,
    totalAmount: 0,
    lateFeeEnabled: false,
    lateFeeAmount: 0
  });
  const [contract, setContract] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showESignDialog, setShowESignDialog] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    if (id) {
      loadContract(id);
    } else {
      // Set default values for new contract
      setData(prev => ({
        ...prev,
        freelancerName: user?.user_metadata?.name || '',
      }));
    }

    // Listen for download and share events
    window.addEventListener('downloadPDF', handleDownloadPDF);
    window.addEventListener('shareContract', handleShareContract);

    return () => {
      window.removeEventListener('downloadPDF', handleDownloadPDF);
      window.removeEventListener('shareContract', handleShareContract);
    };
  }, [id, user]);

  useEffect(() => {
    // Lock contract on load if status is not draft or revision_requested
    if (contract && !['draft', 'revision_requested'].includes(contract.status)) {
      setIsLocked(true);
    } else {
      setIsLocked(contract?.is_locked || false);
    }
  }, [contract]);

  useHotkeys('ctrl+s, command+s', (event) => {
    event.preventDefault();
    handleSave();
  });

  const loadContract = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();
      
      if (error) throw error;
      
      setContract(data);
      if (data.clauses_json) {
        setData(data.clauses_json as unknown as ContractData);
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

  const updateData = (updates: Partial<ContractData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to save a contract.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const clauses_json = data;
      const contractData = {
        title: data.documentTitle || 'Untitled Contract',
        client_name: data.clientName,
        client_email: data.clientEmail,
        contract_amount: data.paymentAmount,
        clauses_json,
        user_id: user.id,
        status: 'draft' as const
      };

      let result;
      if (id) {
        // Update existing contract
        const { data: updatedContract, error } = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        result = updatedContract;
        setContract(updatedContract);
      } else {
        // Create new contract
        const { data: newContract, error } = await supabase
          .from('contracts')
          .insert(contractData)
          .select()
          .single();

        if (error) throw error;
        result = newContract;
        navigate(`/contract/edit/${newContract.id}`);
      }

      toast({
        title: "Contract Saved",
        description: "Your contract has been successfully saved."
      });
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "Error",
        description: "Failed to save contract",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLock = async () => {
    if (!id) return;

    setIsLocked(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ is_locked: true, locked_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setContract(prev => ({ ...prev, is_locked: true, locked_at: new Date().toISOString() }));
      
      toast({
        title: "Contract Locked",
        description: "The contract is now locked for editing."
      });
    } catch (error) {
      console.error('Error locking contract:', error);
      toast({
        title: "Error",
        description: "Failed to lock contract",
        variant: "destructive"
      });
      setIsLocked(false);
    }
  };

  const handleUnlock = async () => {
    if (!id) return;

    setIsLocked(false);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ is_locked: false, locked_at: null })
        .eq('id', id);
      
      if (error) throw error;
      setContract(prev => ({ ...prev, is_locked: false, locked_at: null }));
      
      toast({
        title: "Contract Unlocked",
        description: "The contract is now unlocked for editing."
      });
    } catch (error) {
      console.error('Error unlocking contract:', error);
      toast({
        title: "Error",
        description: "Failed to unlock contract",
        variant: "destructive"
      });
      setIsLocked(true);
    }
  };

  const handleDownloadPDF = useCallback(() => {
    if (!id) return;

    // @ts-ignore
    import('@react-pdf/renderer').then((module) => {
      const { Document, PDFViewer } = module;
      const MyDocument = () => (
        <Document>
          <ContractPreview data={data} />
        </Document>
      );

      // @ts-ignore
      import('@react-pdf/renderer').then(async (module) => {
        const { pdf } = module;
        const myDoc = MyDocument();
        const pdfBlob = await pdf(myDoc).toBlob();
        saveAs(pdfBlob, `${data.documentTitle || 'Contract'}.pdf`);
      });
    });
  }, [data, id]);

  const handleShareContract = () => {
    if (!id) return;
    handleLock();
    setShowESignDialog(true);
  };

  const handleRevisionRequested = () => {
    navigate(`/contract/view/${id}`);
  };

  const handleESignSuccess = () => {
    setContract(prev => ({ ...prev, status: 'sent_for_signature', is_locked: true }));
    setShowESignDialog(false);
    
    toast({
      title: "eSign Sent",
      description: "Contract shared with client for signature. Editing is locked.",
      variant: "default",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/contract/view/${id}`)}
        >
          View Contract
        </Button>
      ),
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PartiesInformation
            data={data}
            updateData={updateData}
            onNext={nextStep}
            isFirst={true}
            isLast={false}
          />
        );
      case 1:
        return (
          <ScopeOfWork
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirst={false}
            isLast={false}
          />
        );
      case 2:
        return (
          <PaymentTerms
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirst={false}
            isLast={false}
          />
        );
      case 3:
        return (
          <TerminationDispute
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirst={false}
            isLast={false}
          />
        );
      case 4:
        return (
          <SignatureStep
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirst={false}
            isLast={true}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Alert Message if Contract is Locked */}
      {isLocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This contract is locked for editing. Please contact the administrator to unlock it.
          </AlertDescription>
        </Alert>
      )}

      {/* Stepper */}
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center space-x-4 px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving || isLocked}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {!isLocked && (
            <Button variant="ghost" size="sm" onClick={handleLock}>
              <Lock className="h-4 w-4 mr-2" />
              Lock
            </Button>
          )}
          {isLocked && (
            <Button variant="ghost" size="sm" onClick={handleUnlock}>
              <Lock className="h-4 w-4 mr-2" />
              Unlock
            </Button>
          )}
          <div className="ml-auto flex items-center space-x-2">
            Step {currentStep + 1} of {totalSteps}
            <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0 || isLocked}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextStep} disabled={currentStep === totalSteps - 1 || isLocked}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <RevisionRequestModal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        contractId={id}
        onRevisionRequested={handleRevisionRequested}
      />

      <ESignDialog
        isOpen={showESignDialog}
        onClose={() => setShowESignDialog(false)}
        contractId={id}
        onSuccess={handleESignSuccess}
      />
    </div>
  );
};

export default ContractBuilder;
