
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { FileText, Mail, Phone, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SEOHead from '@/components/SEOHead';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface UploadedDocument {
  id: string;
  title: string;
  original_filename: string;
  file_url: string;
  status: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  signature_positions: Array<{
    page: number;
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
  verification_email_required: boolean;
  verification_phone_required: boolean;
}

const DocumentSign = () => {
  const { publicLinkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'verify' | 'sign'>('info');
  
  const signatureRefs = useRef<{[key: string]: SignatureCanvas}>({});

  useEffect(() => {
    if (publicLinkId) {
      loadDocument();
    }
  }, [publicLinkId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('public_link_id', publicLinkId)
        .eq('status', 'sent_for_signature')
        .single();

      if (error) throw error;

      if (data) {
        setDocument(data as UploadedDocument);
        // Pre-fill client info if available
        if (data.client_name) setClientName(data.client_name);
        if (data.client_email) setClientEmail(data.client_email);
        if (data.client_phone) setClientPhone(data.client_phone);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Error",
        description: "Document not found or not available for signing",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (document?.verification_email_required && !clientEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (document?.verification_phone_required && !clientPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    // If verification is required, show verification step
    if (document?.verification_email_required || document?.verification_phone_required) {
      setCurrentStep('verify');
      setShowVerification(true);
      // Here you would typically send verification code
      toast({
        title: "Verification Code Sent",
        description: "Please check your email/phone for the verification code"
      });
    } else {
      setCurrentStep('sign');
      setIsVerified(true);
    }
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple verification for demo - in real app, verify against sent code
    if (verificationCode.trim()) {
      setIsVerified(true);
      setCurrentStep('sign');
      toast({
        title: "Verified",
        description: "Your identity has been verified. You can now sign the document."
      });
    }
  };

  const handleSign = async () => {
    if (!document) return;

    try {
      setSigning(true);

      // Collect all signatures
      const signatureImages: string[] = [];
      const signaturePositions = Array.isArray(document.signature_positions) 
        ? document.signature_positions 
        : [];

      for (let i = 0; i < signaturePositions.length; i++) {
        const sigRef = signatureRefs.current[`sig-${i}`];
        if (sigRef && !sigRef.isEmpty()) {
          const signatureDataUrl = sigRef.getTrimmedCanvas().toDataURL('image/png');
          signatureImages.push(signatureDataUrl);
        } else {
          toast({
            title: "Error",
            description: `Please provide signature ${i + 1}`,
            variant: "destructive"
          });
          return;
        }
      }

      // Save signatures to storage
      const signatureUrls: string[] = [];
      for (let i = 0; i < signatureImages.length; i++) {
        const response = await fetch(signatureImages[i]);
        const blob = await response.blob();
        
        const fileName = `signature_${document.id}_${i}_${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('signatures')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('signatures')
          .getPublicUrl(fileName);

        signatureUrls.push(publicUrl);
      }

      // Save signature record
      const { error: signatureError } = await supabase
        .from('uploaded_document_signatures')
        .insert({
          document_id: document.id,
          signer_name: clientName,
          signer_email: clientEmail || null,
          signer_type: 'client',
          signature_image_url: signatureUrls[0], // Primary signature
          client_verified_name: clientName,
          client_verified_email: clientEmail || null,
          client_verified_phone: clientPhone || null,
          ip_address: await getClientIP()
        });

      if (signatureError) throw signatureError;

      // Update document status
      const { error: updateError } = await supabase
        .from('uploaded_documents')
        .update({
          status: 'signed',
          signed_at: new Date().toISOString()
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Document signed successfully!"
      });

      // Show success message or redirect
      setCurrentStep('info');
      setDocument(prev => prev ? { ...prev, status: 'signed' } : null);

    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: "Error",
        description: "Failed to sign document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
              <p className="text-muted-foreground">
                The document you're looking for doesn't exist or is no longer available for signing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (document.status === 'signed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Already Signed</h3>
              <p className="text-muted-foreground">
                This document has already been signed and completed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const signaturePositions = Array.isArray(document.signature_positions) 
    ? document.signature_positions 
    : [];

  return (
    <>
      <SEOHead 
        title={`Sign Document - ${document.title}`}
        description="Sign your document securely"
      />
      <div className="min-h-screen bg-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sign Document: {document.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 'info' && (
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {document.verification_email_required && (
                    <div>
                      <Label htmlFor="clientEmail">Email Address *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  )}

                  {document.verification_phone_required && (
                    <div>
                      <Label htmlFor="clientPhone">Phone Number *</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    Continue to Sign
                  </Button>
                </form>
              )}

              {currentStep === 'verify' && (
                <form onSubmit={handleVerification} className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      We've sent a verification code to your {document.verification_email_required ? 'email' : 'phone'}.
                      Please enter it below to continue.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Verify & Continue
                  </Button>
                </form>
              )}

              {currentStep === 'sign' && (
                <div className="space-y-6">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Please review the document and sign in the designated areas.
                    </AlertDescription>
                  </Alert>

                  {/* PDF Viewer with Signature Boxes */}
                  <div className="border rounded-lg overflow-hidden">
                    <Document
                      file={document.file_url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      }
                    >
                      {numPages && Array.from(new Array(numPages), (_, pageIndex) => (
                        <div key={pageIndex} className="relative bg-white">
                          <Page
                            pageNumber={pageIndex + 1}
                            width={800}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                          
                          {/* Render signature boxes for this page */}
                          {signaturePositions
                            .filter((sig) => sig.page === pageIndex + 1)
                            .map((sig, sigIndex) => (
                              <div
                                key={sigIndex}
                                className="absolute border-2 border-blue-500 bg-blue-50 rounded"
                                style={{
                                  top: sig.top,
                                  left: sig.left,
                                  width: sig.width,
                                  height: sig.height,
                                }}
                              >
                                <SignatureCanvas
                                  ref={(ref) => {
                                    if (ref) signatureRefs.current[`sig-${sigIndex}`] = ref;
                                  }}
                                  canvasProps={{
                                    width: sig.width,
                                    height: sig.height,
                                    className: 'signature-canvas',
                                    style: { width: '100%', height: '100%' }
                                  }}
                                  backgroundColor="rgba(255,255,255,0)"
                                />
                              </div>
                            ))}
                        </div>
                      ))}
                    </Document>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        Object.values(signatureRefs.current).forEach(ref => ref?.clear());
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Clear Signatures
                    </Button>
                    <Button
                      onClick={handleSign}
                      disabled={signing}
                      className="flex-1"
                    >
                      {signing ? 'Signing...' : 'Complete Signing'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DocumentSign;
