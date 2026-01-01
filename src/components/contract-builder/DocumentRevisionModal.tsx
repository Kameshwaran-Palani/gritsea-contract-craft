import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentRevisionModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  clientName: string;
  clientEmail: string;
  onRevisionRequested?: () => void;
}

const DocumentRevisionModal: React.FC<DocumentRevisionModalProps> = ({
  open,
  onClose,
  documentId,
  clientName,
  clientEmail,
  onRevisionRequested
}) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide details about the changes you'd like to see.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create revision request for uploaded document (stored as a request in termination_requests)
      const { error } = await supabase
        .from('termination_requests')
        .insert({
          document_id: documentId,
          request_type: 'revision',
          requested_by: 'client',
          client_name: clientName,
          client_email: clientEmail || null,
          reason: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Revision Request Sent",
        description: "Your feedback has been sent to the document owner. They will review and make the necessary changes."
      });

      onRevisionRequested?.();
      onClose();
      setMessage('');
    } catch (error) {
      console.error('Error submitting revision request:', error);
      toast({
        title: "Error",
        description: "Failed to send revision request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            <DialogTitle>Request Document Changes</DialogTitle>
          </div>
          <DialogDescription>
            Please describe the changes you would like to see in this document. 
            The document owner will receive your feedback and can make revisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="revision-message">Revision Details</Label>
            <Textarea
              id="revision-message"
              placeholder="Please describe what changes you would like to see..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Be specific about what sections or clauses need changes.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {submitting ? 'Sending...' : 'Send Revision Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentRevisionModal;