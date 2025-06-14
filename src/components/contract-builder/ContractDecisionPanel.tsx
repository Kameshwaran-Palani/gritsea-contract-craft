
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Edit, PenTool } from 'lucide-react';

interface ContractDecisionPanelProps {
  contractData: any;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onSign: () => void;
}

const ContractDecisionPanel: React.FC<ContractDecisionPanelProps> = ({
  contractData,
  onApprove,
  onReject,
  onSign
}) => {
  const { toast } = useToast();
  const [decision, setDecision] = useState<'none' | 'approve' | 'reject'>('none');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = () => {
    setDecision('approve');
    onApprove();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for requesting changes",
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
          contract_id: contractData.id,
          message: rejectionReason,
          client_name: contractData.clauses_json?.clientName || 'Client',
          client_email: contractData.client_email
        });

      if (revisionError) throw revisionError;

      // Update contract status
      const { error: statusError } = await supabase
        .from('contracts')
        .update({ status: 'revision_requested' })
        .eq('id', contractData.id);

      if (statusError) throw statusError;

      onReject(rejectionReason);
      
      toast({
        title: "Changes Requested",
        description: "Your feedback has been sent to the contract owner for review."
      });
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Error",
        description: "Failed to submit revision request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (decision === 'approve') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Contract Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            You have approved this contract. You can now proceed to sign it digitally.
          </p>
          <Button 
            onClick={onSign}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <PenTool className="h-4 w-4 mr-2" />
            Proceed to Sign
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Decision</CardTitle>
        <p className="text-muted-foreground">
          Please review the contract and choose your action
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            onClick={handleApprove}
            variant="outline"
            className="h-auto p-4 border-green-200 hover:bg-green-50"
            size="lg"
          >
            <div className="text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-700">Approve & Sign</div>
              <div className="text-xs text-green-600">
                I agree with all terms and conditions
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setDecision('reject')}
            variant="outline"
            className="h-auto p-4 border-orange-200 hover:bg-orange-50"
            size="lg"
          >
            <div className="text-center">
              <Edit className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="font-medium text-orange-700">Request Changes</div>
              <div className="text-xs text-orange-600">
                I need modifications to this contract
              </div>
            </div>
          </Button>
        </div>

        {decision === 'reject' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Request Contract Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reason">Please specify what changes you need:</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Describe the specific changes you would like to see in this contract..."
                  rows={4}
                  className="bg-white"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDecision('none')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? 'Sending...' : 'Submit Changes Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractDecisionPanel;
