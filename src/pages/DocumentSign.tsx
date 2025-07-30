import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PDFViewer from '@/components/contract-builder/PDFViewer';
import SignatureCanvas from 'react-signature-canvas';
import { 
  FileText, 
  CheckCircle, 
  Loader2,
  Pen,
  Shield
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';

interface UploadedDocument {
  id: string;
  title: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  status: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  verification_email_required: boolean;
  verification_phone_required: boolean;
  signature_positions: any;
}

const DocumentSign = () => {
  const { id: publicLinkId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('key');
  const { toast } = useToast();
  
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStep, setVerificationStep] = useState(true);
  const [signingStep, setSigningStep] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [signing, setSigning] = useState(false);
  
  // Verification fields
  const [verificationName, setVerificationName] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  
  // Signature
  const [signatureCanvas, setSignatureCanvas] = useState<SignatureCanvas | null>(null);

  useEffect(() => {
    if (publicLinkId) {
      fetchDocument();
    }
  }, [publicLinkId]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('public_link_id', publicLinkId)
        .eq('status', 'sent_for_signature')
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Document not found or not available for signing');
      }

      setDocument({
        ...data,
        signature_positions: Array.isArray(data.signature_positions) ? data.signature_positions : []
      });
      setVerificationEmail(data.client_email || '');
      setVerificationName(data.client_name || '');
      setVerificationPhone(data.client_phone || '');
    } catch (error: any) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: "Document not found or not available for signing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = () => {
    if (!verificationName.trim() || !verificationEmail.trim()) {
      toast({
        title: "Verification required",
        description: "Please provide your name and email",
        variant: "destructive"
      });
      return;
    }

    if (document?.verification_phone_required && !verificationPhone.trim()) {
      toast({
        title: "Phone verification required",
        description: "Please provide your phone number",
        variant: "destructive"
      });
      return;
    }

    setVerificationStep(false);
    setSigningStep(true);
  };

  const handleSign = async () => {
    if (!document || !signatureCanvas) return;

    if (signatureCanvas.isEmpty()) {
      toast({
        title: "Signature required",
        description: "Please provide your signature",
        variant: "destructive"
      });
      return;
    }

    setSigning(true);
    try {
      // Get signature image
      const signatureDataURL = signatureCanvas.toDataURL();
      
      // Upload signature to storage
      const signatureFileName = `signature-${document.id}-${Date.now()}.png`;
      const signatureBlob = await fetch(signatureDataURL).then(r => r.blob());
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(signatureFileName, signatureBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: signatureUrl } = supabase.storage
        .from('signatures')
        .getPublicUrl(uploadData.path);

      // Create signature record
      const { error: signatureError } = await supabase
        .from('uploaded_document_signatures')
        .insert({
          document_id: document.id,
          signer_type: 'client',
          signer_name: verificationName,
          signer_email: verificationEmail,
          signature_image_url: signatureUrl.publicUrl,
          client_verified_name: verificationName,
          client_verified_email: verificationEmail,
          client_verified_phone: verificationPhone || null,
          ip_address: await fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(data => data.ip)
            .catch(() => null)
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

      setSigningStep(false);
      setCompleted(true);

      toast({
        title: "Document signed successfully",
        description: "Your signature has been recorded"
      });
    } catch (error: any) {
      console.error('Error signing document:', error);
      toast({
        title: "Signing failed",
        description: error.message || "Failed to sign document",
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  const clearSignature = () => {
    if (signatureCanvas) {
      signatureCanvas.clear();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
            <p className="text-muted-foreground">
              This document is not available for signing or the link has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold mb-2">Document Signed Successfully</h2>
            <p className="text-muted-foreground">
              Thank you for signing "{document.title}". Your signature has been recorded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <SEOHead 
        title={`Sign ${document.title} - Agrezy`}
        description="Review and electronically sign your document."
      />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Document Signing</h1>
          </div>
          <p className="text-muted-foreground">
            You have been requested to review and sign: <strong>{document.title}</strong>
          </p>
        </div>

        {verificationStep && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please verify your identity before proceeding to sign the document.
                </p>
                
                <div>
                  <Label htmlFor="verifyName">Full Name *</Label>
                  <Input
                    id="verifyName"
                    value={verificationName}
                    onChange={(e) => setVerificationName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="verifyEmail">Email Address *</Label>
                  <Input
                    id="verifyEmail"
                    type="email"
                    value={verificationEmail}
                    onChange={(e) => setVerificationEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                {document.verification_phone_required && (
                  <div>
                    <Label htmlFor="verifyPhone">Phone Number *</Label>
                    <Input
                      id="verifyPhone"
                      type="tel"
                      value={verificationPhone}
                      onChange={(e) => setVerificationPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                )}

                <Button 
                  onClick={handleVerification}
                  className="w-full"
                  disabled={!verificationName.trim() || !verificationEmail.trim()}
                >
                  Proceed to Document
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {signingStep && (
          <div className="space-y-8">
            {/* Document Viewer */}
            {document.file_type.includes('pdf') ? (
              <PDFViewer
                fileUrl={document.file_url}
                signaturePositions={Array.isArray(document.signature_positions) ? document.signature_positions : []}
                onSignaturePositionsChange={() => {}}
                onSave={() => {}}
                readonly={true}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Document Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">{document.original_filename}</p>
                    <p className="text-sm text-muted-foreground">
                      Please download and review the document before signing
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(document.file_url, '_blank')}
                    >
                      Download Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Signature Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pen className="h-5 w-5" />
                  Your Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Please sign below:</Label>
                  <div className="border rounded-lg mt-2 bg-white">
                    <SignatureCanvas
                      ref={(ref) => setSignatureCanvas(ref)}
                      canvasProps={{
                        width: 500,
                        height: 200,
                        className: 'signature-canvas w-full h-48 rounded-lg'
                      }}
                      backgroundColor="white"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={clearSignature}>
                      Clear Signature
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSigningStep(false);
                      setVerificationStep(true);
                    }}
                  >
                    Back to Verification
                  </Button>
                  <Button
                    onClick={handleSign}
                    disabled={signing}
                    className="flex-1"
                  >
                    {signing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      'Complete Signature'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSign;