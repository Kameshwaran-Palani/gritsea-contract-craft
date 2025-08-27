import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ESignDetails from '@/components/contract-builder/ESignDetails';
import PDFViewer from '@/components/contract-builder/PDFViewer';
import { 
  ArrowLeft, 
  FileText, 
  Send, 
  Save,
  Eye,
  MapPin
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
  public_link_id: string;
  signature_positions: any;
}

const DocumentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [emailVerification, setEmailVerification] = useState(true);
  const [phoneVerification, setPhoneVerification] = useState(false);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [signaturePositions, setSignaturePositions] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setDocument(data);
      setClientName(data.client_name || '');
      setClientEmail(data.client_email || '');
      setClientPhone(data.client_phone || '');
      setEmailVerification(data.verification_email_required);
      setPhoneVerification(data.verification_phone_required);
      setSignaturePositions(Array.isArray(data.signature_positions) ? data.signature_positions : []);
    } catch (error: any) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('uploaded_documents')
        .update({
          client_name: clientName.trim() || null,
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          verification_email_required: emailVerification,
          verification_phone_required: phoneVerification,
          signature_positions: signaturePositions
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Document details saved successfully"
      });

      // Refresh document data
      await fetchDocument();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save document",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSignaturePositions = async () => {
    if (!document || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('uploaded_documents')
        .update({
          signature_positions: signaturePositions
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Signature positions saved",
        description: "Signature positions have been saved successfully"
      });
    } catch (error: any) {
      console.error('Save signature positions error:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save signature positions",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendForSignature = async () => {
    if (!document || !user) return;

    if (!clientName.trim() || !clientEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide client name and email",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Generate secret key
      const secretKey = Math.random().toString(36).substring(2) + 
                       Math.random().toString(36).substring(2);

      const { data, error } = await supabase
        .from('uploaded_documents')
        .update({
          status: 'sent_for_signature',
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          client_phone: clientPhone.trim() || null,
          verification_email_required: emailVerification,
          verification_phone_required: phoneVerification
        })
        .eq('id', document.id)
        .select()
        .single();

      if (error) throw error;

      const signingLink = `${window.location.origin}/document-sign/${data.public_link_id}?key=${secretKey}`;
      
      const shareData = {
        link: signingLink,
        secretKey: secretKey,
        clientContact: clientEmail,
        authMethod: emailVerification ? 'email' : 'phone'
      };

      setShareInfo(shareData);

      toast({
        title: "Document sent",
        description: "Document is ready for signing"
      });

      await fetchDocument();
    } catch (error: any) {
      console.error('Send error:', error);
      toast({
        title: "Send failed",
        description: error.message || "Failed to send document",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Document not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      <SEOHead 
        title={`Edit ${document.title} - Agrezy`}
        description="Configure signature settings and client information for your uploaded document."
      />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <p className="text-muted-foreground">Configure eSign settings</p>
            </div>
          </div>
        </div>

        {/* Two Panel Layout for Document Editing */}
        {document.file_type.includes('pdf') ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Panel - Signature Tools & Client Info */}
            <div className="space-y-6">
              {/* Signature Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Signature Placement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Add signature boxes where clients need to sign. Click "Add Signature" then click on the PDF to place signature areas.
                  </div>
                  
                  {signaturePositions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Signature Positions ({signaturePositions.length})</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {signaturePositions.map((pos) => (
                          <div key={pos.id} className="text-xs p-2 bg-muted rounded flex justify-between items-center">
                            <span>Page {pos.page} - Position: {Math.round(pos.x)}, {Math.round(pos.y)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedPositions = signaturePositions.filter(p => p.id !== pos.id);
                                setSignaturePositions(updatedPositions);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client's full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientEmail">Client Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {/* Verification Settings */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Verification Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Require email verification before signing
                        </p>
                      </div>
                      <Switch
                        checked={emailVerification}
                        onCheckedChange={setEmailVerification}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Phone Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Require phone verification before signing
                        </p>
                      </div>
                      <Switch
                        checked={phoneVerification}
                        onCheckedChange={setPhoneVerification}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleSendForSignature}
                      disabled={saving || !clientName.trim() || !clientEmail.trim()}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signature
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - PDF Viewer */}
            <div className="lg:col-span-2">
              <PDFViewer
                fileUrl={document.file_url}
                signaturePositions={signaturePositions}
                onSignaturePositionsChange={setSignaturePositions}
                onSave={handleSaveSignaturePositions}
              />
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Document Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/50 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium">{document.original_filename}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Word Document - PDF preview not available
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Signature positions can be added after uploading a PDF version
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Client Information for non-PDF documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client's full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientEmail">Client Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleSendForSignature}
                      disabled={saving || !clientName.trim() || !clientEmail.trim()}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signature
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Share Details */}
        {shareInfo && (
          <div className="mt-8">
            <ESignDetails 
              shareInfo={shareInfo}
              contractId={document.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEdit;