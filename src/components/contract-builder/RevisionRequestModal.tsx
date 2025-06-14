
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onRevisionRequested: () => void;
}

const RevisionRequestModal: React.FC<RevisionRequestModalProps> = ({
  isOpen,
  onClose,
  contractId,
  onRevisionRequested
}) => {
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmitRevision = async () => {
    if (!clientName.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and revision message.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create revision request
      const { error: revisionError } = await supabase
        .from('revision_requests')
        .insert({
          contract_id: contractId,
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          message: message.trim()
        });

      if (revisionError) throw revisionError;

      // Update contract status to revision_requested
      const { error: statusError } = await supabase
        .from('contracts')
        .update({ status: 'revision_requested' })
        .eq('id', contractId);

      if (statusError) throw statusError;

      toast({
        title: "Revision Request Sent",
        description: "Your revision request has been sent to the contract owner."
      });

      onRevisionRequested();
      onClose();
    } catch (error) {
      console.error('Error submitting revision request:', error);
      toast({
        title: "Error",
        description: "Failed to submit revision request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Request Contract Revision
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            If you need changes to this contract before signing, please provide your details and explain what needs to be revised.
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="clientName">Your Name *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="clientEmail">Your Email (Optional)</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="revisionMessage">Revision Request *</Label>
              <Textarea
                id="revisionMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what changes you'd like to see in this contract..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRevision} 
              disabled={loading}
              className="flex-1 flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionRequestModal;
