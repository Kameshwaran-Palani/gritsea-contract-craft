import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Shield, KeyRound, Mail, Download } from 'lucide-react';
import ContractStatusBadge from '@/components/contract-builder/ContractStatusBadge';
import SignatureStep from '@/components/contract-builder/SignatureStep';
import PDFViewer from '@/components/contract-builder/PDFViewer';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UploadedDocument {
  id: string;
  title: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  status: 'draft' | 'sent_for_signature' | 'signed' | 'cancelled';
  client_name?: string;
  client_email?: string;
  verification_email_required: boolean;
  public_link_id: string;
  signature_positions: any;
  user_id: string;
}

const DocumentSign = () => {
  const { publicLinkId } = useParams();
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('key') || '';
  const { toast } = useToast();
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [clientSignature, setClientSignature] = useState('');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    secretKey: secretKey
  });
  const [ownerName, setOwnerName] = useState('');
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  useEffect(() => {
    if (secretKey) {
      setCredentials(prev => ({ ...prev, secretKey }));
    }
  }, [secretKey]);

  useEffect(() => {
    const fetchDocumentOwner = async () => {
      if (!publicLinkId) {
        setCreatorLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('uploaded_documents')
          .select(`
            user_id,
            profiles!inner(full_name)
          `)
          .eq('public_link_id', publicLinkId)
          .single();

        if (error || !data) return;

        const profile = data.profiles as any;
        setOwnerName(profile?.full_name || '');
      } catch {
        // do nothing
      } finally {
        setCreatorLoading(false);
      }
    };

    fetchDocumentOwner();
  }, [publicLinkId]);

  const handleAccess = async () => {
    if (!credentials.secretKey) {
      toast({
        title: "Secret Key Required",
        description: "Please enter the secret key provided to you",
        variant: "destructive"
      });
      return;
    }

    if (!credentials.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('public_link_id', publicLinkId)
        .eq('status', 'sent_for_signature')
        .single();

      if (error || !data) {
        toast({
          title: "Document Not Found",
          description: "Invalid document link or document not found",
          variant: "destructive"
        });
        return;
      }

      const expectedEmail = data.client_email;
      if (expectedEmail && expectedEmail !== credentials.email) {
        toast({
          title: "Authentication Failed",
          description: `The email doesn't match our records`,
          variant: "destructive"
        });
        return;
      }

      setDocument({
        ...data,
        status: data.status as UploadedDocument['status'],
        signature_positions: Array.isArray(data.signature_positions) ? data.signature_positions : []
      });
      setHasAccess(true);

      toast({
        title: "Access Granted",
        description: "Welcome! You can now review and sign the document."
      });
    } catch (error) {
      console.error('Access error:', error);
      toast({
        title: "Error",
        description: "Failed to access document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = async (signatureData: string) => {
    if (!document) return;

    try {
      await supabase
        .from('uploaded_document_signatures')
        .insert({
          document_id: document.id,
          signer_type: 'client',
          signer_name: document.client_name || 'Client',
          signer_email: document.client_email,
          signature_image_url: signatureData,
          client_verified_name: credentials.email,
          client_verified_email: credentials.email,
          ip_address: 'client-ip' // TODO: Replace with real IP capture if needed
        });

      const signedAtDate = new Date().toISOString();

      const { data: updatedDocument, error: statusError } = await supabase
        .from('uploaded_documents')
        .update({ 
          status: 'signed',
          signed_at: signedAtDate
        })
        .eq('id', document.id)
        .select()
        .single();

      if (statusError) throw statusError;

      {/*setDocument({
        ...updatedDocument,
        status: updatedDocument.status as UploadedDocument['status'],
        signature_positions: Array.isArray(updatedDocument.signature_positions) ? updatedDocument.signature_positions : []
      });*/}

      setDocument({
        ...updatedDocument,
        status: updatedDocument.status as UploadedDocument['status'],
        signature_positions: Array.isArray(updatedDocument.signature_positions)
          ? updatedDocument.signature_positions.map((sig: any) => ({
              ...sig,
              image: signatureData // inject the captured signature into all signature boxes
            }))
          : []
      });

      
      setClientSignature(signatureData);
      
      toast({
        title: "Document Signed Successfully",
        description: "Thank you for signing the document. You can now download the PDF."
      });

      setShowSignature(false);
      setShowDownloadDialog(true);
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: "Error",
        description: "Failed to sign document",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      });

      const downloadLink = window.document.createElement('a');
      downloadLink.href = document!.file_url;
      downloadLink.download = `Signed_${document!.original_filename}`;
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      window.document.body.removeChild(downloadLink);

      toast({
        title: "Download Complete",
        description: "Document PDF has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (!publicLinkId) return <Navigate to="/404" replace />;

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar variant="centered-logo" />
        <main className="flex-grow flex flex-col items-center justify-center p-6 pt-24">
          <SEOHead 
            title="Document Access - Secure eSign"
            description="Secure document access and digital signing portal"
          />
          {!creatorLoading && ownerName && (
            <p className="text-center text-muted-foreground mb-4">
              {ownerName} has shared this document with you.
            </p>
          )}
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Document Access</CardTitle>
              <p className="text-muted-foreground">
                Enter your details to securely access and sign the document
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
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

              <Button 
                onClick={handleAccess}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Verifying...' : 'Access Document'}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <p>This is a secure document signing portal. Your information is protected and used only for authentication purposes.</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${document?.title || 'Document'} - Document Review`}
        description="Review and sign your document"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="grid grid-cols-3 h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">Document Review</h1>
              <ContractStatusBadge status={document?.status || 'sent_for_signature'} />
            </div>

            <Link to="/" className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-lg font-bold gradient-text">Agrezy</span>
            </Link>

            <div className="flex items-center justify-end space-x-4">
              {document?.status === 'signed' && (
                <>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Signed</span>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {downloadingPDF ? 'Downloading...' : 'Download PDF'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow w-full">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border" id="document-preview">
                  {document?.file_type.includes('pdf') ? (
                    <PDFViewer
                      fileUrl={document.file_url}
                      signaturePositions={Array.isArray(document.signature_positions) ? document.signature_positions : []}
                      onSignaturePositionsChange={() => {}}
                      onSave={() => {}}
                      readonly
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">Document preview not available for this file type.</p>
                      <Button onClick={handleDownloadPDF} variant="outline" className="mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </Button>
                    </div>
                  )}
                </div>

                {showSignature && (
                  <div className="bg-white rounded-lg shadow-sm border p-6" id="signature-section">
                    <h3 className="text-lg font-semibold mb-4">Sign Document</h3>
                    <SignatureStep
                      data={{
                        documentTitle: document?.title || '',
                        documentSubtitle: '',
                        logoStyle: 'round',
                        primaryColor: '#3B82F6',
                        contentColor: '#374151',
                        fontFamily: 'Inter',
                        agreementIntroText: 'This is a service agreement between the parties.',
                        effectiveDate: new Date().toISOString().split('T')[0],
                        applyGlobalStyles: true,
                        sectionStyles: {},
                        freelancerName: 'Service Provider',
                        freelancerAddress: 'Provider Address',
                        freelancerEmail: 'provider@example.com',
                        clientName: document?.client_name || 'Client',
                        clientEmail: document?.client_email || '',
                        startDate: new Date().toISOString().split('T')[0],
                        services: 'Service Description',
                        deliverables: 'Project Deliverables',
                        milestones: [],
                        paymentType: 'fixed' as const,
                        rate: 1000,
                        paymentSchedule: [],
                        lateFeeEnabled: false,
                        isRetainer: false,
                        autoRenew: false,
                        responseTime: '24 hours',
                        revisionLimit: 3,
                        includeNDA: false,
                        ipOwnership: 'client' as const,
                        usageRights: 'full' as const,
                        terminationConditions: 'Standard termination conditions apply.',
                        noticePeriod: '30 days',
                        jurisdiction: 'Local jurisdiction',
                        arbitrationClause: false,
                        clientSignature: clientSignature
                      }}
                      updateData={(updates) => {
                        if (updates.clientSignature) {
                          setClientSignature(updates.clientSignature);
                        }
                      }}
                      onNext={() => {}}
                      onPrev={() => setShowSignature(false)}
                      isFirst={false}
                      isLast={true}
                      signerType="client"
                    />
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => setShowSignature(false)} className="flex-1">
                        Back to Review
                      </Button>
                      <Button
                        onClick={() => clientSignature && handleSignDocument(clientSignature)}
                        disabled={!clientSignature}
                        className="flex-1"
                      >
                        Complete Signing
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                {document?.status === 'sent_for_signature' && !showSignature && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Please review the document carefully. Once you're ready, you can sign it digitally.
                      </p>

                      <div className="space-y-3">
                        <Button onClick={() => setShowSignature(true)} className="w-full" size="lg">
                          Sign Document
                        </Button>

                        <Button variant="outline" onClick={handleDownloadPDF} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download for Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Document Signed Successfully</DialogTitle>
              <DialogDescription>
                Your signature has been recorded. You can now download the signed document.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>Close</Button>
              <Button onClick={handleDownloadPDF} disabled={downloadingPDF}>
                <Download className="h-4 w-4 mr-2" />
                {downloadingPDF ? 'Downloading...' : 'Download Signed Document'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DocumentSign;
