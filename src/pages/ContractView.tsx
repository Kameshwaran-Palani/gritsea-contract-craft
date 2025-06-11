import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Share, Edit, Calendar, User, DollarSign, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

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
    const colors: Record<string, string> = {
      draft: "text-muted-foreground",
      sent: "text-secondary",
      signed: "text-success",
      cancelled: "text-destructive"
    };
    return (
      <Badge variant={variants[status] || "outline"} className={`capitalize ${colors[status]}`}>
        {status}
      </Badge>
    );
  };

  if (loading || loadingContract) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Contract Not Found</h2>
            <p className="text-muted-foreground mb-6">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/contracts')}
                className="rounded-2xl"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-heading">{contract.title}</h1>
                <p className="text-muted-foreground">Contract ID: {contract.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(contract.status)}
              <Button variant="outline" size="sm" onClick={handleEditContract}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareContract} disabled={isSharing}>
                <Share className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>

          {/* Contract Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-semibold">{contract.client_name || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">{contract.client_email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      {contract.contract_amount ? `₹${contract.contract_amount.toLocaleString()}` : 'Not specified'}
                    </p>
                    <p className="text-xs text-muted-foreground">{contract.payment_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold">{contract.project_timeline || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">Project duration</p>
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
            <CardContent className="space-y-4">
              {/* Scope of Work */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">Scope of Work</h3>
                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="whitespace-pre-wrap text-sm">{contract.scope_of_work || 'No scope of work specified'}</p>
                </div>
              </div>

              <Separator />

              {/* Payment Terms */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-secondary">Payment Terms</h3>
                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="whitespace-pre-wrap text-sm">{contract.payment_terms || 'No payment terms specified'}</p>
                </div>
              </div>

              <Separator />

              {/* Contract Metadata */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Created</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(contract.created_at).toLocaleDateString()} at {new Date(contract.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Last Updated</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(contract.updated_at).toLocaleDateString()} at {new Date(contract.updated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ContractView;
