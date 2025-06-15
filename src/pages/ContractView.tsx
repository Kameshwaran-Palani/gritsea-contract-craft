
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Eye, PenTool, Share2, Send } from 'lucide-react';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import RevisionRequestModal from '@/components/contract-builder/RevisionRequestModal';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import ContractDecisionPanel from '@/components/contract-builder/ContractDecisionPanel';
import ESignDialog from '@/components/contract-builder/ESignDialog';
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
  const [showESignDialog, setShowESignDialog] = useState(false);
  const [clientApproved, setClientApproved] = useState(false);

  useEffect(() => {
    if (id) {
      loadContract(id);
    }
  }, [id]);

  const loadContract = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();
      
      if (error || !data) {
        setLoading(false);
        return;
      }
      
      setContract(data);
      if (data.clauses_json) {
        setContractData(data.clauses_json as unknown as ContractData);
      }
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

  const handleApprove = () => {
    setClientApproved(true);
  };

  const handleReject = () => {
    setShowRevisionModal(true);
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
          signed_by_name: contractData.clientName,
          is_locked: false
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

  const handleESignSuccess = () => {
    setContract(prev => ({ ...prev, status: 'sent_for_signature', is_locked: true }));
    setShowESignDialog(false);
    toast({
      title: "eSign Link Generated",
      description: "Contract has been shared with client for signing."
    });
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

  return (
    <>
      <SEOHead 
        title={`${contractData.documentTitle} - Contract View`}
        description="View and manage your service contract"
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
              <h1 className="text-lg font-semibold">Contract View</h1>
              <ContractStatusBadge status={contract.status} />
            </div>

            <div className="flex items-center space-x-4">
              {contract.status === 'draft' && (
                <Button
                  onClick={() => setShowESignDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Share for Signature
                </Button>
              )}
              
              {contract.status === 'revision_requested' && (
                <Button
                  onClick={() => setShowESignDialog(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Re-share Contract
                </Button>
              )}

              {contract.status === 'signed' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Completed</span>
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
                Client has requested changes to this contract. Please review and make necessary updates.
              </p>
            </div>
          )}

          {contract.status === 'sent_for_signature' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Send className="h-5 w-5" />
                <h3 className="font-medium">Awaiting Client Signature</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Contract has been shared with client. Waiting for their review and signature.
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-1 gap-6">
            {/* Contract Preview - Full width */}
            <div className="bg-white rounded-lg shadow-sm border">
              <ContractPreview data={contractData} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <RevisionRequestModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          contractId={contract.id}
          onRevisionRequested={handleRevisionRequested}
        />

        <ESignDialog
          isOpen={showESignDialog}
          onClose={() => setShowESignDialog(false)}
          contractId={contract.id}
          onSuccess={handleESignSuccess}
        />
      </div>
    </>
  );
};

export default ContractView;
