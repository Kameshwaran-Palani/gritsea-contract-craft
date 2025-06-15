
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ContractData } from '@/types/ContractData';
import { ContractBuilderSidebar } from '@/components/contract-builder/ContractBuilderSidebar';
import { GeneralInfoStep } from '@/components/contract-builder/GeneralInfoStep';
import { ScopePaymentStep } from '@/components/contract-builder/ScopePaymentStep';
import { TimelineMilestonesStep } from '@/components/contract-builder/TimelineMilestonesStep';
import { LegalTermsStep } from '@/components/contract-builder/LegalTermsStep';
import { SignatureStep } from '@/components/contract-builder/SignatureStep';
import { ContractPreviewSection } from '@/components/contract-builder/ContractPreviewSection';

const ContractBuilder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [shareInfo, setShareInfo] = useState<{
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  } | null>(null);
  const [status, setStatus] = useState('draft');
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<ContractData>({
    contractTitle: 'Service Agreement',
    contractSubtitle: 'General Service Contract',
    clientName: '',
    clientEmail: '',
    freelancerName: '',
    freelancerEmail: '',
    introduction: '',
    scopeOfWork: '',
    paymentTerms: '',
    totalAmount: 0,
    paymentSchedule: [{ description: '', amount: 0 }],
    timelineStartDate: undefined,
    timelineEndDate: undefined,
    milestones: [{ title: '', description: '', dueDate: null, amount: 0 }],
    confidentiality: false,
    intellectualProperty: '',
    terminationClause: '',
    governingLaw: '',
    disputeResolution: '',
    signature: '',
    freelancerSignature: '',
    signedDate: undefined,
    shareInfo: undefined
  });

  const steps = [
    { id: 'general', label: 'General Info' },
    { id: 'scope', label: 'Scope & Payments' },
    { id: 'timeline', label: 'Timeline & Milestones' },
    { id: 'legal', label: 'Legal Terms' },
    { id: 'signature', label: 'Signature' }
  ];

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const updateData = (field: keyof ContractData, value: any) => {
    setData(prevData => ({ ...prevData, [field]: value }));
  };

  const nextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const calculateProgress = () => {
    let completed = 0;
    if (data.contractTitle) completed += 1;
    if (data.clientName) completed += 1;
    if (data.freelancerName) completed += 1;
    if (data.scopeOfWork) completed += 1;
    if (data.paymentTerms) completed += 1;

    const calculatedProgress = Math.min((completed / 5) * 100, 100);
    setProgress(calculatedProgress);
  };

  useEffect(() => {
    calculateProgress();
  }, [data]);

  useEffect(() => {
    if (id) {
      loadContract(id);
    }
  }, [id]);

  const loadContract = async (contractId: string) => {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) {
        throw error;
      }

      if (contract) {
        setData(contract);
        setStatus(contract.status || 'draft');
        setShareInfo(contract.shareInfo || null);
      }
    } catch (error: any) {
      console.error('Error loading contract:', error.message);
      toast({
        title: "Error",
        description: "Failed to load contract. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveContract = async () => {
    setIsSaving(true);
    try {
      const contractData = {
        ...data,
        user_id: user?.id,
        status: status
      };

      if (id) {
        const { error } = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast({
          title: "Contract Updated",
          description: "Contract has been updated successfully."
        });
      } else {
        const { data: newContract, error } = await supabase
          .from('contracts')
          .insert([contractData])
          .select()

        if (error) {
          throw error;
        }

        toast({
          title: "Contract Saved",
          description: "Contract has been saved successfully."
        });

        if (newContract && newContract.length > 0) {
          navigate(`/contract/${newContract[0].id}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving contract:', error.message);
      toast({
        title: "Error",
        description: "Failed to save contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (authMethod: string, clientContact: string) => {
    try {
      const mockResponse = {
        link: `${window.location.origin}/esign/${id}/${authMethod}`,
        secretKey: 'ABC123XYZ',
        clientContact: clientContact,
        authMethod: authMethod
      };

      const shareData = {
        link: mockResponse.link,
        secretKey: mockResponse.secretKey,
        clientContact: mockResponse.clientContact,
        authMethod: mockResponse.authMethod
      };

      const { error } = await supabase
        .from('contracts')
        .update({ shareInfo: shareData, status: 'sent_for_signature' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setData(prevData => ({ ...prevData, shareInfo: shareData }));
      setShareInfo(shareData);
      setStatus('sent_for_signature');

      toast({
        title: "eSign Link Generated",
        description: "eSign link has been generated and sent to the client."
      });
    } catch (error: any) {
      console.error('Error sharing contract:', error.message);
      toast({
        title: "Error",
        description: "Failed to generate eSign link. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Emit contract data updates for PDF generation
  useEffect(() => {
    const event = new CustomEvent('contractDataUpdated', { detail: data });
    window.dispatchEvent(event);
  }, [data]);

  // Handle automatic eSign when freelancer signs
  useEffect(() => {
    if (data.freelancerSignature && data.freelancerName && !data.shareInfo) {
      handleShare('email', data.clientEmail || 'client@example.com');
    }
  }, [data.freelancerSignature, data.freelancerName]);

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return <GeneralInfoStep data={data} updateData={updateData} onNext={nextStep} />;
      case 1:
        return <ScopePaymentStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 2:
        return <TimelineMilestonesStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <LegalTermsStep data={data} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return (
          <SignatureStep
            data={data}
            updateData={updateData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirst={isFirstStep}
            isLast={isLastStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-100/20">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ContractBuilderSidebar
            progress={progress}
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            saveContract={saveContract}
            isSaving={isSaving}
            contractId={id}
            status={status}
            shareInfo={shareInfo}
          />

          <div className="md:col-span-2 space-y-6">
            {renderCurrentStep()}
          </div>
        </div>
      </div>

      <ContractPreviewSection data={data} />
    </div>
  );
};

export default ContractBuilder;
