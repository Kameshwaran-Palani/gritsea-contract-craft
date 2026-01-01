import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { KeyRound, Mail, Phone, Send, Copy, CheckCircle } from 'lucide-react';

interface ESignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contractId?: string | null;
  documentId?: string | null;
  onSuccess?: (shareInfo: any) => void;
  signaturePositions?: any[];
}

const ESignDialog: React.FC<ESignDialogProps> = ({ isOpen, onClose, contractId, documentId, onSuccess, signaturePositions = [] }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'setup' | 'generated'>('setup');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [clientInfo, setClientInfo] = useState({
    email: '',
    phone: ''
  });
  const [secretKey, setSecretKey] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSecretKey = () => {
    const key = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSecretKey(key);
    return key;
  };

  const handleGenerateLink = async () => {
    if (!contractId && !documentId) {
      toast({
        title: "Error",
        description: "No contract or document ID available",
        variant: "destructive"
      });
      return;
    }

    // Check if signature positions are added for documents
    if (documentId && (!signaturePositions || signaturePositions.length === 0)) {
      toast({
        title: "Signature box required",
        description: "Please add at least one signature box to the document before sending for signature",
        variant: "destructive"
      });
      return;
    }

    const contactInfo = authMethod === 'email' ? clientInfo.email : clientInfo.phone;
    if (!contactInfo) {
      toast({
        title: `${authMethod === 'email' ? 'Email' : 'Phone'} Required`,
        description: `Please enter the client's ${authMethod} address`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const generatedKey = secretKey || generateSecretKey();
      
      let link = '';
      
      if (contractId) {
        // Update contract with client info and lock it
        const { error } = await supabase
          .from('contracts')
          .update({
            status: 'sent_for_signature',
            [authMethod === 'email' ? 'client_email' : 'client_phone']: contactInfo,
            verification_email_required: authMethod === 'email',
            verification_phone_required: authMethod === 'phone',
            is_locked: true,
            locked_at: new Date().toISOString()
          })
          .eq('id', contractId);

        if (error) throw error;
        link = `${window.location.origin}/esign/${contractId}/${authMethod}`;
      } else if (documentId) {
        // Update document with client info and send for signature
        const { error } = await supabase
          .from('uploaded_documents')
          .update({
            status: 'sent_for_signature',
            [authMethod === 'email' ? 'client_email' : 'client_phone']: contactInfo,
            verification_email_required: authMethod === 'email',
            verification_phone_required: authMethod === 'phone'
          })
          .eq('id', documentId);

        if (error) throw error;
        
        // Get the public_link_id for the document
        const { data: doc, error: docError } = await supabase
          .from('uploaded_documents')
          .select('public_link_id')
          .eq('id', documentId)
          .single();
          
        if (docError) throw docError;
        link = `${window.location.origin}/document-sign/${doc.public_link_id}?key=${generatedKey}`;
      }
      
      setShareLink(link);
      setStep('generated');

      // Pass share info back to parent
      if (onSuccess) {
        onSuccess({
          link,
          secretKey: generatedKey,
          clientContact: contactInfo,
          authMethod
        });
      }

      toast({
        title: "eSign Link Generated",
        description: `${contractId ? 'Contract' : 'Document'} is now ready for signing. Share this link and secret key with your client for secure access.`
      });
    } catch (error) {
      console.error('Error generating eSign link:', error);
      toast({
        title: "Error",
        description: "Failed to generate eSign link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`
    });
  };

  const handleClose = () => {
    setStep('setup');
    setSecretKey('');
    setShareLink('');
    setClientInfo({ email: '', phone: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Generate eSign Link
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Once the eSign link is generated, this contract will be locked for editing. 
                You can only unlock it after 24 hours or if the client rejects the contract.
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Authentication Method</Label>
              <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-4">
                  <div>
                    <Label htmlFor="client-email">Client Email Address</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="client@example.com"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Client will need to enter this email to access the contract
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="mt-4">
                  <div>
                    <Label htmlFor="client-phone">Client Phone Number</Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Client will need to enter this phone number to access the contract
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Label htmlFor="secret-key" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Secret Key (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="secret-key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value.toUpperCase())}
                  placeholder="Auto-generated if empty"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSecretKey(generateSecretKey())}
                >
                  Generate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                A secret key will be auto-generated if left empty
              </p>
            </div>

            <Button 
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Generating...' : 'Generate eSign Link & Lock Contract'}
            </Button>
          </div>
        )}

        {step === 'generated' && (
          <div className="space-y-6">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900">eSign Link Generated Successfully</h3>
              <p className="text-sm text-green-700 mt-1">
                Contract is now locked for editing. Share both the link and secret key with your client.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Contract Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={shareLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareLink, 'Link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Secret Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={secretKey}
                    readOnly
                    className="font-mono text-lg text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secretKey, 'Secret key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Required Authentication</Label>
                <div className="p-3 bg-muted rounded-lg mt-1">
                  <div className="flex items-center gap-2">
                    {authMethod === 'email' ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {authMethod === 'email' ? clientInfo.email : clientInfo.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Instructions for Client:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click on the contract link</li>
                <li>Enter the secret key: <code className="bg-blue-100 px-1 rounded">{secretKey}</code></li>
                <li>Enter their {authMethod}: <code className="bg-blue-100 px-1 rounded">{authMethod === 'email' ? clientInfo.email : clientInfo.phone}</code></li>
                <li>Review and sign the contract or request revisions</li>
              </ol>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Contract Lock Policy:</h4>
              <p className="text-sm text-orange-800">
                This contract is now locked for editing. It will automatically unlock after 24 hours 
                or immediately if the client rejects it and requests revisions.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ESignDialog;
