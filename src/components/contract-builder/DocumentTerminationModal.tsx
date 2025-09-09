import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentTerminationModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  clientName: string;
  clientEmail: string;
  onTerminationRequested: () => void;
}

const DocumentTerminationModal = ({
  open,
  onClose,
  documentId,
  clientName,
  clientEmail,
  onTerminationRequested
}: DocumentTerminationModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for termination",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('termination_requests')
        .insert({
          document_id: documentId,
          request_type: 'document',
          requested_by: 'client',
          client_name: clientName,
          client_email: clientEmail,
          reason: reason.trim()
        });

      if (error) throw error;

      toast({
        title: "Termination Request Submitted",
        description: "Your termination request has been sent to the document owner."
      });

      onTerminationRequested();
    } catch (error: any) {
      console.error('Error submitting termination request:', error);
      toast({
        title: "Error",
        description: "Failed to submit termination request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Document Termination</DialogTitle>
          <DialogDescription>
            Submit a request to terminate this document. The document owner will review your request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Your Name</Label>
            <Input
              id="clientName"
              value={clientName}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Your Email</Label>
            <Input
              id="clientEmail"
              value={clientEmail}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Termination *</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you want to terminate this document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason.trim() || submitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTerminationModal;