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
      // Create a new window with the contract content for printing/PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      const contractHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${contract?.title || 'Contract'}</title>
          <style>
            body { font-family: serif; line-height: 1.6; margin: 0; padding: 20mm; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section h2 { border-bottom: 1px solid #666; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .signature-section { margin-top: 50px; border-top: 2px solid #000; padding-top: 20px; }
            .signature-box { height: 60px; border-bottom: 2px solid #666; margin-bottom: 10px; }
            @media print { body { margin: 0; padding: 20mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SERVICE AGREEMENT</h1>
            <p>${contract?.title || 'Professional Service Contract'}</p>
          </div>
          
          <div class="section">
            <h2>1. PARTIES</h2>
            <div class="grid">
              <div>
                <h3>Service Provider:</h3>
                <p><strong>${contract?.clauses_json?.freelancerName || 'Service Provider'}</strong></p>
                <p>${contract?.clauses_json?.freelancerEmail || ''}</p>
              </div>
              <div>
                <h3>Client:</h3>
                <p><strong>${contract?.client_name || 'Client'}</strong></p>
                <p>${contract?.client_email || ''}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>2. SCOPE OF WORK</h2>
            <p>${contract?.scope_of_work || 'No scope of work specified'}</p>
          </div>
          
          <div class="section">
            <h2>3. PAYMENT TERMS</h2>
            <p>Total Amount: ₹${contract?.contract_amount?.toLocaleString() || '0'}</p>
            <p>${contract?.payment_terms || 'No payment terms specified'}</p>
          </div>
          
          <div class="signature-section">
            <h2>SIGNATURES</h2>
            <div class="grid">
              <div>
                <div class="signature-box"></div>
                <p><strong>${contract?.clauses_json?.freelancerName || 'Service Provider'}</strong></p>
                <p>Service Provider</p>
                <p>Date: ________________</p>
              </div>
              <div>
                <div class="signature-box"></div>
                <p><strong>${contract?.client_name || 'Client'}</strong></p>
                <p>Client</p>
                <p>Date: ________________</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(contractHTML);
      printWindow.document.close();
      
      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({
        title: "PDF Generated",
        description: "Print dialog opened. You can save as PDF from the print options."
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
