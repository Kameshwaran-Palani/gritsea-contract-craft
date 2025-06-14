import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Share, Edit, Calendar, User, DollarSign, Clock, ArrowLeft, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Contract {
  id: string;
  title: string;
  status: 'draft' | 'sent' | 'signed' | 'cancelled';
  client_name: string;
  client_email: string;
  contract_amount: number;
  payment_type?: string;
  project_timeline: string;
  scope_of_work: string;
  payment_terms: string;
  created_at: string;
  updated_at: string;
  clauses_json?: any;
}

const ContractView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchContract();
    }
  }, [user, id]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const mappedContract: Contract = {
        id: data.id,
        title: data.title,
        status: data.status,
        client_name: data.client_name || '',
        client_email: data.client_email || '',
        contract_amount: data.contract_amount || 0,
        payment_type: 'fixed',
        project_timeline: data.project_timeline || '',
        scope_of_work: data.scope_of_work || '',
        payment_terms: data.payment_terms || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        clauses_json: data.clauses_json
      };
      
      setContract(mappedContract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast({
        title: "Error",
        description: "Failed to load contract",
        variant: "destructive"
      });
    } finally {
      setLoadingContract(false);
    }
  };

  const handleEditContract = () => {
    navigate(`/contract/edit/${id}`);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a temporary div for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.padding = '40px';

      const contractHTML = `
        <div style="font-family: serif; line-height: 1.6; color: #000;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; letter-spacing: 2px;">SERVICE AGREEMENT</h1>
            <p style="font-size: 14px; color: #666; margin: 0; letter-spacing: 1px;">${contract?.title || 'Professional Service Contract'}</p>
            <p style="font-size: 12px; color: #888; margin: 10px 0 0 0;">
              Effective Date: ${contract?.created_at ? new Date(contract.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
            </p>
          </div>
          
          <!-- Parties Section -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">1. PARTIES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div>
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Service Provider:</h3>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${contract?.clauses_json?.freelancerName || 'Service Provider'}</p>
                ${contract?.clauses_json?.freelancerBusinessName ? `<p style="font-size: 12px; font-style: italic; margin: 5px 0;">${contract.clauses_json.freelancerBusinessName}</p>` : ''}
                <p style="font-size: 12px; margin: 5px 0;">Email: ${contract?.clauses_json?.freelancerEmail || 'N/A'}</p>
                ${contract?.clauses_json?.freelancerPhone ? `<p style="font-size: 12px; margin: 5px 0;">Phone: ${contract.clauses_json.freelancerPhone}</p>` : ''}
              </div>
              <div>
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Client:</h3>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${contract?.client_name || 'Client'}</p>
                ${contract?.clauses_json?.clientCompany ? `<p style="font-size: 12px; font-style: italic; margin: 5px 0;">${contract.clauses_json.clientCompany}</p>` : ''}
                <p style="font-size: 12px; margin: 5px 0;">Email: ${contract?.client_email || 'N/A'}</p>
                ${contract?.clauses_json?.clientPhone ? `<p style="font-size: 12px; margin: 5px 0;">Phone: ${contract.clauses_json.clientPhone}</p>` : ''}
              </div>
            </div>
          </div>
          
          <!-- Scope of Work -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">2. SCOPE OF WORK</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
              <p style="font-size: 12px; text-align: justify; line-height: 1.6; margin: 0;">${contract?.scope_of_work || 'No scope of work specified'}</p>
            </div>
            ${contract?.clauses_json?.deliverables ? `
              <div style="margin-top: 15px;">
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Deliverables:</h3>
                <p style="font-size: 12px; text-align: justify; line-height: 1.6; margin: 0;">${contract.clauses_json.deliverables}</p>
              </div>
            ` : ''}
          </div>
          
          <!-- Payment Terms -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">3. PAYMENT TERMS</h2>
            <div style="background-color: #f0f8f0; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <p style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #28a745;">
                Total Amount: ₹${contract?.contract_amount?.toLocaleString() || '0'}
              </p>
              <p style="font-size: 12px; margin: 0; line-height: 1.6;">${formatPaymentTerms(contract?.payment_terms || '')}</p>
            </div>
          </div>
          
          <!-- Timeline -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">4. PROJECT TIMELINE</h2>
            <p style="font-size: 12px; line-height: 1.6; margin: 0;">${contract?.project_timeline || 'No timeline specified'}</p>
          </div>
          
          <!-- Additional Terms -->
          ${contract?.clauses_json?.includeNDA || contract?.clauses_json?.ipOwnership ? `
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #666; padding-bottom: 5px; margin-bottom: 15px;">5. ADDITIONAL TERMS</h2>
              <div style="font-size: 12px; line-height: 1.6;">
                ${contract?.clauses_json?.includeNDA ? '<p style="margin: 5px 0;"><strong>Confidentiality:</strong> Both parties agree to maintain confidentiality of all project information.</p>' : ''}
                ${contract?.clauses_json?.ipOwnership ? `<p style="margin: 5px 0;"><strong>IP Rights:</strong> <span style="text-transform: capitalize;">${contract.clauses_json.ipOwnership}</span> retains intellectual property rights.</p>` : ''}
                ${contract?.clauses_json?.responseTime ? `<p style="margin: 5px 0;"><strong>Response Time:</strong> ${contract.clauses_json.responseTime}</p>` : ''}
                ${contract?.clauses_json?.revisionLimit ? `<p style="margin: 5px 0;"><strong>Revisions:</strong> ${contract.clauses_json.revisionLimit} revisions included</p>` : ''}
                ${contract?.clauses_json?.terminationConditions ? `<p style="margin: 5px 0;"><strong>Termination:</strong> ${contract.clauses_json.terminationConditions}</p>` : ''}
                ${contract?.clauses_json?.jurisdiction ? `<p style="margin: 5px 0;"><strong>Jurisdiction:</strong> ${contract.clauses_json.jurisdiction}</p>` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Signature Section -->
          <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #000;">
            <h2 style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 40px;">SIGNATURES</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
              <div style="text-align: center;">
                <div style="height: 60px; border-bottom: 2px solid #666; margin-bottom: 15px;"></div>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${contract?.clauses_json?.freelancerName || 'Service Provider'}</p>
                <p style="font-size: 11px; color: #666; margin: 5px 0;">Service Provider</p>
                <p style="font-size: 11px; color: #666; margin: 10px 0 0 0;">Date: ________________</p>
              </div>
              <div style="text-align: center;">
                <div style="height: 60px; border-bottom: 2px solid #666; margin-bottom: 15px;"></div>
                <p style="font-size: 12px; font-weight: bold; margin: 5px 0;">${contract?.client_name || 'Client'}</p>
                <p style="font-size: 11px; color: #666; margin: 5px 0;">Client</p>
                <p style="font-size: 11px; color: #666; margin: 10px 0 0 0;">Date: ________________</p>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; font-size: 10px; color: #888; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
            <p style="margin: 0;">Governed by Indian Contract Act, 1872 | Generated by Agrezy</p>
          </div>
        </div>
      `;

      tempDiv.innerHTML = contractHTML;
      document.body.appendChild(tempDiv);

      // Generate canvas from the temporary div
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: tempDiv.scrollHeight
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${contract?.title?.replace(/[^a-z0-9]/gi, '_') || 'contract'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: "Contract has been successfully downloaded as PDF."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShareContract = async () => {
    setIsSharing(true);
    try {
      const shareableLink = `${window.location.origin}/contract/view/${id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: contract?.title || 'Contract',
          text: 'Please review this contract',
          url: shareableLink
        });
      } else {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      sent: "secondary", 
      signed: "default",
      cancelled: "destructive"
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatPaymentTerms = (paymentTerms: string) => {
    try {
      const parsed = JSON.parse(paymentTerms);
      if (Array.isArray(parsed)) {
        return parsed.map(term => `${term.description}: ${term.percentage}%`).join(', ');
      }
      return paymentTerms;
    } catch {
      return paymentTerms || 'No payment terms specified';
    }
  };

  if (loading || loadingContract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Contract Not Found</h2>
          <p className="text-muted-foreground mb-6">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/contracts')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Agrezy
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>3 free contracts left</span>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Contract Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
              <p className="text-gray-500 mt-2">Contract ID: {contract.id.slice(0, 8)}...</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {getStatusBadge(contract.status)}
              <Button 
                variant="outline" 
                onClick={() => setShowPDFPreview(!showPDFPreview)} 
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{showPDFPreview ? 'Hide' : 'Show'} PDF Preview</span>
              </Button>
              <Button variant="outline" onClick={handleEditContract} className="flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>
              <Button variant="outline" onClick={handleShareContract} disabled={isSharing} className="flex items-center space-x-2">
                <Share className="w-4 h-4" />
                <span>{isSharing ? 'Sharing...' : 'Share'}</span>
              </Button>
              <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
              </Button>
            </div>
          </div>

          {/* PDF Preview Section - Now shown by default */}
          {showPDFPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="bg-gray-100 px-6 py-4 border-b">
                <h2 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  PDF Preview
                </h2>
                <p className="text-sm text-gray-600 mt-1">This is how your contract will appear when downloaded as PDF</p>
              </div>
              
              <div className="p-8 bg-gray-50">
                <div className="max-w-4xl mx-auto bg-white shadow-lg" style={{ fontFamily: 'serif', minHeight: '842px', padding: '60px' }}>
                  {/* PDF Header */}
                  <div className="text-center border-b-2 border-black pb-6 mb-8">
                    <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">SERVICE AGREEMENT</h1>
                    <p className="text-gray-600 uppercase tracking-wide">{contract.title}</p>
                  </div>

                  {/* Parties Section */}
                  <div className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-2">1. PARTIES</h2>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold mb-2">Service Provider:</h3>
                        <p className="font-semibold">{contract.clauses_json?.freelancerName || 'Service Provider'}</p>
                        <p className="text-sm text-gray-600">{contract.clauses_json?.freelancerEmail || ''}</p>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">Client:</h3>
                        <p className="font-semibold">{contract.client_name || 'Client'}</p>
                        <p className="text-sm text-gray-600">{contract.client_email || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scope of Work */}
                  <div className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-2">2. SCOPE OF WORK</h2>
                    <p className="text-justify leading-relaxed">{contract.scope_of_work || 'No scope of work specified'}</p>
                  </div>

                  {/* Payment Terms */}
                  <div className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-2">3. PAYMENT TERMS</h2>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-semibold text-lg mb-2">Total Amount: ₹{contract.contract_amount?.toLocaleString() || '0'}</p>
                      <p className="leading-relaxed">{formatPaymentTerms(contract.payment_terms)}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mb-8">
                    <h2 className="text-lg font-bold uppercase mb-4 border-b border-gray-400 pb-2">4. PROJECT TIMELINE</h2>
                    <p className="leading-relaxed">{contract.project_timeline || 'No timeline specified'}</p>
                  </div>

                  {/* Signature Section */}
                  <div className="mt-16 pt-8 border-t-2 border-black">
                    <h2 className="text-lg font-bold uppercase mb-8 text-center">SIGNATURES</h2>
                    <div className="grid grid-cols-2 gap-16">
                      <div className="text-center">
                        <div className="h-16 border-b-2 border-gray-400 mb-4"></div>
                        <p className="font-bold">{contract.clauses_json?.freelancerName || 'Service Provider'}</p>
                        <p className="text-sm text-gray-600">Service Provider</p>
                        <p className="text-sm text-gray-600 mt-2">Date: ________________</p>
                      </div>
                      <div className="text-center">
                        <div className="h-16 border-b-2 border-gray-400 mb-4"></div>
                        <p className="font-bold">{contract.client_name || 'Client'}</p>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="text-sm text-gray-600 mt-2">Date: ________________</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-gray-500 mt-12 pt-4 border-t border-gray-300">
                    <p>Governed by Indian Contract Act, 1872 | Generated by Agrezy</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contract Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-semibold text-lg">
                      {contract.client_name || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-500">{contract.client_email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-lg">
                      {contract.contract_amount ? `₹${contract.contract_amount.toLocaleString()}` : 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-500">{contract.payment_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="font-semibold text-lg">
                      {contract.project_timeline || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-500">Project duration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scope of Work */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">Scope of Work</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {contract.scope_of_work || 'No scope of work specified'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Payment Terms */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-secondary">Payment Terms</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm leading-relaxed">
                    {formatPaymentTerms(contract.payment_terms)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contract Metadata */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Created</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(contract.created_at).toLocaleDateString()} at {new Date(contract.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Last Updated</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(contract.updated_at).toLocaleDateString()} at {new Date(contract.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractView;
