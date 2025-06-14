
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { KeyRound, Mail, Phone, Send, Copy, Check } from 'lucide-react';

interface ESignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  clientEmail?: string;
  clientPhone?: string;
}

const ESignDialog: React.FC<ESignDialogProps> = ({
  isOpen,
  onClose,
  contractId,
  clientEmail,
  clientPhone
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'generate' | 'share'>('generate');
  const [secretKey, setSecretKey] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [contactInfo, setContactInfo] = useState({
    email: clientEmail || '',
    phone: clientPhone || ''
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSecretKey = () => {
    const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSecretKey(key.toUpperCase());
    setStep('share');
  };

  const handleSendInvitation = async () => {
    if (!secretKey) return;
    
    if (authMethod === 'email' && !contactInfo.email) {
      toast({
        title: "Email Required",
        description: "Please enter the client's email address",
        variant: "destructive"
      });
      return;
    }

    if (authMethod === 'phone' && !contactInfo.phone) {
      toast({
        title: "Phone Required", 
        description: "Please enter the client's phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update contract with secret key and contact info
      const { error } = await supabase
        .from('contracts')
        .update({
          status: 'sent_for_signature',
          accessKey: secretKey,
          client_email: authMethod === 'email' ? contactInfo.email : null,
          client_phone: authMethod === 'phone' ? contactInfo.phone : null,
          verification_email_required: authMethod === 'email',
          verification_phone_required: authMethod === 'phone'
        })
        .eq('id', contractId);

      if (error) throw error;

      const signingLink = `${window.location.origin}/contract/view/${contractId}`;
      
      // In a real app, you'd send this via email/SMS
      toast({
        title: "Invitation Sent",
        description: `Contract invitation has been prepared for ${authMethod === 'email' ? contactInfo.email : contactInfo.phone}`,
      });

      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send contract invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Signing link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const signingLink = secretKey ? `${window.location.origin}/contract/view/${contractId}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Get E-Signature
          </DialogTitle>
        </DialogHeader>

        {step === 'generate' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Secure Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a secure key that the client will use to access and sign the contract.
                </p>
                <Button 
                  onClick={generateSecretKey}
                  className="w-full"
                  size="lg"
                >
                  Generate Secret Key
                </Button>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                The client will need this key along with their contact information to access the contract
              </p>
            </div>
          </div>
        )}

        {step === 'share' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-green-700">Secret Key Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-green-50 border border-green-200 rounded font-mono text-center text-lg font-bold text-green-800">
                  {secretKey}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Authentication</CardTitle>
              </CardHeader>
              <CardContent>
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

                  <TabsContent value="email" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="email">Client Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="client@example.com"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="phone">Client Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1234567890"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signing Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={signingLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(signingLink)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('generate')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSendInvitation}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              <strong>Instructions for Client:</strong>
              <br />
              1. Visit the signing link
              <br />
              2. Enter their {authMethod} and the secret key
              <br />
              3. Review, approve/reject, and sign the contract
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ESignDialog;
