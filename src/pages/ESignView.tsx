
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Shield, KeyRound, Mail, Phone } from 'lucide-react';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import ContractDecisionPanel from '@/components/contract-builder/ContractDecisionPanel';
import SEOHead from '@/components/SEOHead';
import { ContractData } from '@/pages/ContractBuilder';

const ESignView = () => {
  const { contractId, authMethod } = useParams();
  const { toast } = useToast();
  const [contract, setContract] = useState<any>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    phone: '',
    secretKey: ''
  });

  const handleAccess = async () => {
    if (!credentials.secretKey) {
      toast({
        title: "Secret Key Required",
        description: "Please enter the secret key provided to you",
        variant: "destructive"
      });
      return;
    }

    const contactInfo = authMethod === 'email' ? credentials.email : credentials.phone;
    if (!contactInfo) {
      toast({
        title: `${authMethod === 'email' ? 'Email' : 'Phone'} Required`,
        description: `Please enter your ${authMethod} address`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error || !data) {
        toast({
          title: "Contract Not Found",
          description: "Invalid contract ID or contract not found",
          variant: "destructive"
        });
        return;
      }

      // Verify contact information matches
      const expectedContact = authMethod === 'email' ? data.client_email : data.client_phone;
      if (expectedContact && expectedContact !== contactInfo) {
        toast({
          title: "Authentication Failed",
          description: `The ${authMethod} address doesn't match our records`,
          variant: "destructive"
        });
        return;
      }

      setContract(data);
      if (data.clauses_json) {
        setContractData(data.clauses_json as unknown as ContractData);
      }
      setHasAccess(true);

      toast({
        title: "Access Granted",
        description: "Welcome! You can now review and sign the contract."
      });
    } catch (error) {
      console.error('Access error:', error);
      toast({
        title: "Error",
        description: "Failed to access contract",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async (signatureData: string) => {
    if (!contract || !contractData) return;

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
    }
  };

  if (!contractId || !authMethod) {
    return <Navigate to="/404" replace />;
  }

  if (!hasAccess) {
    return (
      <>
        <SEOHead 
          title="Contract Access - Secure eSign"
          description="Secure contract access and digital signing portal"
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Contract Access</CardTitle>
              <p className="text-muted-foreground">
                Enter your details to securely access and sign the contract
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="secretKey" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Secret Key
                </Label>
                <Input
                  id="secretKey"
                  value={credentials.secretKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value.toUpperCase() }))}
                  placeholder="Enter the secret key provided to you"
                  className="font-mono"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  {authMethod === 'email' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                  {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </Label>
                <Input
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  value={authMethod === 'email' ? credentials.email : credentials.phone}
                  onChange={(e) => setCredentials(prev => ({ 
                    ...prev, 
                    [authMethod]: e.target.value 
                  }))}
                  placeholder={authMethod === 'email' ? 'your@email.com' : '+1234567890'}
                />
              </div>

              <Button 
                onClick={handleAccess}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Verifying...' : 'Access Contract'}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <p>
                  This is a secure contract signing portal. Your information is protected and used only for authentication purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${contractData?.documentTitle || 'Contract'} - Contract Review`}
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
              <ContractStatusBadge status={contract?.status || 'sent_for_signature'} />
            </div>

            <div className="flex items-center space-x-4">
              {contract?.status === 'signed' && (
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
          {contract?.status === 'revision_requested' && (
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
            {/* Contract Preview */}
            <div className="lg:col-span-2">
              {showSignature ? (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <SignatureStep
                    data={contractData!}
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
                        if (contractData?.freelancerSignature) {
                          handleSignContract(contractData.freelancerSignature);
                        }
                      }}
                      disabled={!contractData?.freelancerSignature}
                      className="flex-1"
                    >
                      Complete Signing
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                  <ContractPreview data={contractData!} />
                </div>
              )}
            </div>

            {/* Decision Panel */}
            <div className="lg:col-span-1">
              {contract?.status === 'sent_for_signature' && !showSignature && (
                <ContractDecisionPanel
                  contractData={contract}
                  onApprove={() => {}}
                  onReject={() => {}}
                  onSign={() => setShowSignature(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ESignView;
