import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Eye, PenTool, Share2, Send, Edit, Download } from 'lucide-react';
import ContractPreview from '@/components/contract-builder/ContractPreview';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import RevisionRequestModal from '@/components/contract-builder/RevisionRequestModal';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import ContractDecisionPanel from '@/components/contract-builder/ContractDecisionPanel';
import ESignDialog from '@/components/contract-builder/ESignDialog';
import ContractMilestone from '@/components/contract-builder/ContractMilestone';
import SEOHead from '@/components/SEOHead';
import { ContractData } from '@/pages/ContractBuilder';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ContractView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contract, setContract] = useState<any>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showESignDialog, setShowESignDialog] = useState(false);
  const [clientApproved, setClientApproved] = useState(false);
  const [revisionRequests, setRevisionRequests] = useState<any[]>([]);
  const [shareInfo, setShareInfo] = useState<{
    link: string;
    secretKey: string;
    clientContact: string;
    authMethod: string;
  } | null>(null);

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

      // Load revision requests if status is revision_requested
      if (data.status === 'revision_requested') {
        loadRevisionRequests(data.id);
      }

      // Set share info if contract has been shared
      if (data.status === 'sent_for_signature' || data.status === 'signed') {
        setShareInfo({
          link: `${window.location.origin}/esign/${contractId}/email`,
          secretKey: 'ABC123XYZ',
          clientContact: data.client_email || 'client@example.com',
          authMethod: 'email'
        });
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

  const loadRevisionRequests = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('revision_requests')
        .select('*')
        .eq('contract_id', contractId)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRevisionRequests(data || []);
    } catch (error) {
      console.error('Error loading revision requests:', error);
    }
  };

  const markRevisionAsResolved = async (revisionId: string) => {
    try {
      const { error } = await supabase
        .from('revision_requests')
        .update({ resolved: true })
        .eq('id', revisionId);
      
      if (error) throw error;
      
      // Update contract status back to draft and unlock for editing
      if (contract?.id) {
        const { error: statusError } = await supabase
          .from('contracts')
          .update({ 
            status: 'draft',
            is_locked: false,
            locked_at: null
          })
          .eq('id', contract.id);
        
        if (statusError) throw statusError;
        setContract(prev => ({ ...prev, status: 'draft', is_locked: false, locked_at: null }));
      }
      
      // Reload revision requests
      if (contract?.id) {
        loadRevisionRequests(contract.id);
      }
      
      toast({
        title: "Revision Resolved",
        description: "Contract has been unlocked and is ready for editing."
      });
    } catch (error) {
      console.error('Error resolving revision:', error);
      toast({
        title: "Error",
        description: "Failed to resolve revision request",
        variant: "destructive"
      });
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
    // Immediately unlock the contract when revision is requested
    setContract(prev => ({ 
      ...prev, 
      status: 'revision_requested',
      is_locked: false,
      locked_at: null
    }));
    
    if (contract?.id) {
      // Update database to unlock the contract
      supabase
        .from('contracts')
        .update({ 
          status: 'revision_requested',
          is_locked: false,
          locked_at: null
        })
        .eq('id', contract.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error unlocking contract:', error);
          }
        });
      
      loadRevisionRequests(contract.id);
    }
  };

  const handleESignSuccess = () => {
    setContract(prev => ({ ...prev, status: 'sent_for_signature', is_locked: true }));
    setShowESignDialog(false);
    
    // Set share info after successful eSign
    if (id) {
      setShareInfo({
        link: `${window.location.origin}/esign/${id}/email`,
        secretKey: 'ABC123XYZ',
        clientContact: contract?.client_email || 'client@example.com',
        authMethod: 'email'
      });
    }
    
    toast({
      title: "eSign Link Generated",
      description: "Contract has been shared with client for signing."
    });
  };

  const handleEditContract = () => {
    navigate(`/contract/edit/${id}`);
  };

  const downloadPDF = async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF..."
      });

      if (!contractData) {
        throw new Error('Contract data not available');
      }

      // Create PDF using jsPDF directly instead of html2canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkNewPage = (neededHeight: number) => {
        if (yPosition + neededHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number, fontStyle: string = 'normal', color: string = '#000000') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        
        // Convert hex color to RGB
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          pdf.setTextColor(r, g, b);
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;
        
        checkNewPage(lines.length * lineHeight);
        
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        return lines.length * lineHeight;
      };

      // Header Section
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(contractData.documentTitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(contractData.documentSubtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add a line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Agreement Introduction
      if (contractData.agreementIntroText) {
        addText('AGREEMENT INTRODUCTION', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        addText(contractData.agreementIntroText, 12);
        yPosition += 8;
        
        if (contractData.effectiveDate) {
          addText(`Effective Date: ${new Date(contractData.effectiveDate).toLocaleDateString()}`, 12, 'bold');
          yPosition += 10;
        }
      }

      // Parties Information
      addText('PARTIES TO THE AGREEMENT', 16, 'bold', contractData.primaryColor);
      yPosition += 5;

      addText('Service Provider:', 14, 'bold');
      yPosition += 2;
      addText(`Name: ${contractData.freelancerName}`, 12);
      if (contractData.freelancerBusinessName) {
        addText(`Business: ${contractData.freelancerBusinessName}`, 12);
      }
      addText(`Address: ${contractData.freelancerAddress}`, 12);
      addText(`Email: ${contractData.freelancerEmail}`, 12);
      if (contractData.freelancerPhone) {
        addText(`Phone: ${contractData.freelancerPhone}`, 12);
      }
      yPosition += 8;

      addText('Client:', 14, 'bold');
      yPosition += 2;
      addText(`Name: ${contractData.clientName}`, 12);
      if (contractData.clientCompany) {
        addText(`Company: ${contractData.clientCompany}`, 12);
      }
      addText(`Email: ${contractData.clientEmail}`, 12);
      if (contractData.clientPhone) {
        addText(`Phone: ${contractData.clientPhone}`, 12);
      }
      yPosition += 10;

      // Continue with other sections similar to ContractBuilder...
      // Scope of Work
      if (contractData.services) {
        addText('SCOPE OF WORK', 16, 'bold', contractData.primaryColor);
        yPosition += 5;
        addText('Services:', 14, 'bold');
        yPosition += 2;
        addText(contractData.services, 12);
        yPosition += 8;
      }

      // Payment Terms
      addText('PAYMENT TERMS', 16, 'bold', contractData.primaryColor);
      yPosition += 5;
      if (contractData.paymentType === 'hourly') {
        addText(`Hourly Rate: ₹${contractData.rate?.toLocaleString()} per hour`, 12, 'bold');
      } else {
        addText(`Total Project Amount: ₹${contractData.totalAmount?.toLocaleString()}`, 12, 'bold');
      }
      yPosition += 10;

      // Signature Section
      checkNewPage(60);
      addText('SIGNATURES', 16, 'bold', contractData.primaryColor);
      yPosition += 20;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Service Provider:', margin, yPosition);
      pdf.text(`${contractData.freelancerName}`, margin, yPosition + 15);
      pdf.text(`Date: ${contractData.signedDate ? new Date(contractData.signedDate).toLocaleDateString() : '_____________'}`, margin, yPosition + 25);

      pdf.text('Client:', pageWidth - margin - 80, yPosition);
      pdf.text(`${contractData.clientName}`, pageWidth - margin - 80, yPosition + 15);
      pdf.text(`Date: ${contractData.signedDate ? new Date(contractData.signedDate).toLocaleDateString() : '_____________'}`, pageWidth - margin - 80, yPosition + 25);

      // Download the PDF
      const fileName = `${contractData?.documentTitle || 'contract'}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: "Contract has been downloaded as PDF successfully."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
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
        title={`${contractData?.documentTitle} - Contract View`}
        description="View and manage your service contract"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
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
              <ContractStatusBadge status={contract?.status} />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>

              {(contract?.status === 'draft' || contract?.status === 'revision_requested') && (
                <Button
                  onClick={handleEditContract}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Contract
                </Button>
              )}

              {contract?.status === 'draft' && (
                <Button
                  onClick={() => setShowESignDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Share for Signature
                </Button>
              )}
              
              {contract?.status === 'revision_requested' && (
                <Button
                  onClick={() => setShowESignDialog(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Re-share Contract
                </Button>
              )}

              {contract?.status === 'signed' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Contract Milestones */}
            <div className="lg:col-span-1">
              <ContractMilestone 
                contractId={contract?.id || ''} 
                status={contract?.status || 'draft'}
                shareInfo={shareInfo}
              />
            </div>

            {/* Main Content - Contract Preview */}
            <div className="lg:col-span-2">
              {contract?.status === 'revision_requested' && revisionRequests.length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 mb-3">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-medium">Revision Requests</h3>
                  </div>
                  <div className="space-y-3">
                    {revisionRequests.map((request) => (
                      <div key={request.id} className="p-3 bg-white border border-orange-200 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-medium">{request.client_name}</div>
                          <Button
                            size="sm"
                            onClick={() => markRevisionAsResolved(request.id)}
                            className="text-xs"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contract?.status === 'sent_for_signature' && (
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

              <div className="bg-white rounded-lg shadow-sm border">
                {contractData && <ContractPreview data={contractData} />}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <RevisionRequestModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          contractId={contract?.id}
          onRevisionRequested={handleRevisionRequested}
        />

        <ESignDialog
          isOpen={showESignDialog}
          onClose={() => setShowESignDialog(false)}
          contractId={contract?.id}
          onSuccess={handleESignSuccess}
        />
      </div>
    </>
  );
};

export default ContractView;
