import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Phone, Key, Send, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentShareDialogProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  onSuccess: () => void;
}

const DocumentShareDialog: React.FC<DocumentShareDialogProps> = ({
  open,
  onClose,
  documentId,
  onSuccess
}) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [customMessage, setCustomMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    link: string;
    secretKey: string;
  } | null>(null);
  const { toast } = useToast();

  const generateSecretKey = () => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  const handleShare = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide client name and email.",
        variant: "destructive"
      });
      return;
    }

    setSharing(true);
    try {
      const secretKey = generateSecretKey();
      const publicLinkId = crypto.randomUUID();

      // Update document with client info and share settings
      const { error } = await supabase
        .from('uploaded_documents')
        .update({
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          status: 'sent_for_signature',
          public_link_id: publicLinkId,
          verification_email_required: authMethod === 'email'
        })
        .eq('id', documentId);

      if (error) throw error;

      const shareLink = `${window.location.origin}/document-sign/${publicLinkId}?key=${secretKey}`;
      
      setShareResult({
        link: shareLink,
        secretKey: secretKey
      });

      toast({
        title: "Document Shared Successfully",
        description: "Share link has been generated. You can now send it to your client."
      });

      onSuccess();
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard"
    });
  };

  const handleClose = () => {
    setShareResult(null);
    setClientName('');
    setClientEmail('');
    setCustomMessage('');
    onClose();
  };

  if (shareResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Document Shared Successfully
            </DialogTitle>
            <DialogDescription>
              Your document has been prepared for signature. Share the following information with your client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Signing Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={shareResult.link} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareResult.link)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Secret Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={shareResult.secretKey} 
                    readOnly 
                    className="font-mono text-lg font-bold text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareResult.secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this secret key with your client. They will need it to access the document.
                </p>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Send the signing link to {clientEmail}</li>
                <li>2. Share the secret key: <code className="bg-blue-100 px-1 rounded">{shareResult.secretKey}</code></li>
                <li>3. Client will verify their email and use the key to access</li>
                <li>4. You'll be notified when the document is signed</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Share Document for Signature
          </DialogTitle>
          <DialogDescription>
            Prepare your document for client signature by providing their details and sharing preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Authentication Method</Label>
            <RadioGroup value={authMethod} onValueChange={(value: 'email' | 'phone') => setAuthMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email Verification (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="h-4 w-4" />
                  Phone Verification
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message for your client..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleShare} disabled={sharing}>
            {sharing ? 'Generating...' : 'Generate Share Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentShareDialog;