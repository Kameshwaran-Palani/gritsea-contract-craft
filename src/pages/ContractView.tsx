
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Eye, PenTool } from 'lucide-react';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import RevisionRequestModal from '@/components/contract-builder/RevisionRequestModal';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import ContractAccessForm from '@/components/contract-builder/ContractAccessForm';
import ContractDecisionPanel from '@/components/contract-builder/ContractDecisionPanel';
import SEOHead from '@/components/SEOHead';
import { ContractData } from '@/pages/ContractBuilder';

const ContractView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [contract, setContract] = useState<any>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [clientApproved, setClientApproved] = useState(false);

  useEffect(() => {
    if (id) {
      checkPublicAccess(id);
    }
  }, [id]);

  const checkPublicAccess = async (contractId: string) => {
    try {
      // First try to load contract without authentication (public access)
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .in('status', ['sent_for_signature', 'revision_requested'])
        .single();
      
      if (error || !data) {
        setLoading(false);
        return;
      }
      
      // If contract requires authentication, show access form
      if (data.accessKey && !hasAccess) {
        setLoading(false);
        return;
      }
      
      setContract(data);
      if (data.clauses_json) {
        setContractData(data.clauses_json as unknown as ContractData);
      }
      setHasAccess(true);
    } catch (error) {
      console.error('Error loading contract:', error);
      toast({
        title: "Error",
        description: "Failed to load contract",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccessGranted = (data: any) => {
    setContract(data);
    if (data.clauses_json) {
      setContractData(data.clauses_json as ContractData);
    }
    setHasAccess(true);
  };

  const handleApprove = () => {
    setClientApproved(true);
  };

  const handleReject = () => {
    toast({
      title: "Changes Requested",
      description: "Your revision request has been sent to the contract owner."
    });
  };

  const handleSignContract = async (signatureData: string) => {
    if (!contract || !contractData) return;

    setSigning(true);
    try {
      // Create signature record
      const { error: signatureError } = await supabase
        .from('signatures')
        .insert({
          contract_id: contract.id,
          signer_type: 'client',
          signer_name: contractData.clientName,
          signer_email: contractData.clientEmail,
          signature_image_url: signatureData,
          ip_address: 'client-ip'
        });

      if (signatureError) throw signatureError;

      // Update contract status to signed
      const { error: statusError } = await supabase
        .from('contracts')
        .update({ 
          status: 'signed',
          client_signature_url: signatureData,
          signed_at: new Date().toISOString(),
          signed_by_name: contractData.clientName
        })
        .eq('id', contract.id);

      if (statusError) throw statusError;

      setContract(prev => ({ ...prev, status: 'signed' }));
      
      toast({
        title: "Contract Signed Successfully",
        description: "Thank you for signing the contract. Both parties will receive confirmation."
      });

      setShowSignature(false);
    } catch (error) {
      console.error('Error signing contract:', error);
      toast({
        title: "Error",
        description: "Failed to sign contract",
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  const handleRevisionRequested = () => {
    setContract(prev => ({ ...prev, status: 'revision_requested' }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contract || !contractData) {
    return <Navigate to="/404" replace />;
  }

  // Show access form if contract requires authentication
  if (contract.accessKey && !hasAccess) {
    return <ContractAccessForm contractId={contract.id} onAccessGranted={handleAccessGranted} />;
  }

  return (
    <>
      <SEOHead 
        title={`${contractData.documentTitle} - Contract Review`}
        description="Review and sign your service contract"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <span className="text-lg font-bold gradient-text">Agrezy</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-semibold">Contract Review</h1>
              <ContractStatusBadge status={contract.status} />
            </div>

            <div className="flex items-center space-x-4">
              {contract.status === 'signed' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Signed</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-6">
          {contract.status === 'revision_requested' && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-medium">Revision Requested</h3>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                This contract is currently under revision. The contract owner will address your feedback soon.
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contract Preview - Takes 2/3 of the space */}
            <div className="lg:col-span-2">
              {showSignature ? (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <SignatureStep
                    data={contractData}
                    updateData={() => {}}
                    onNext={() => {}}
                    onPrev={() => setShowSignature(false)}
                    isFirst={false}
                    isLast={true}
                  />
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSignature(false)}
                      className="flex-1"
                    >
                      Back to Review
                    </Button>
                    <Button 
                      onClick={() => {
                        if (contractData.freelancerSignature) {
                          handleSignContract(contractData.freelancerSignature);
                        }
                      }}
                      disabled={signing || !contractData.freelancerSignature}
                      className="flex-1"
                    >
                      {signing ? 'Signing...' : 'Complete Signing'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                  <ContractPreview data={contractData} />
                </div>
              )}
            </div>

            {/* Decision Panel - Takes 1/3 of the space */}
            <div className="lg:col-span-1">
              {contract.status === 'sent_for_signature' && !showSignature && (
                <ContractDecisionPanel
                  contractData={contract}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onSign={() => setShowSignature(true)}
                />
              )}

              {clientApproved && !showSignature && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowSignature(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Sign Contract
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revision Request Modal */}
        <RevisionRequestModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          contractId={contract.id}
          onRevisionRequested={handleRevisionRequested}
        />
      </div>
    </>
  );
};

export default ContractView;
