import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface DocumentDecisionPanelProps {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
}

const DocumentDecisionPanel: React.FC<DocumentDecisionPanelProps> = ({
  onApprove,
  onReject,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Document Review Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Please review the document carefully and make your decision:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={onApprove}
            disabled={disabled}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <CheckCircle className="h-5 w-5" />
            Approve & Sign
          </Button>
          
          <Button
            onClick={onReject}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
            size="lg"
          >
            <XCircle className="h-5 w-5" />
            Request Changes
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2">
          <p>• Approving will proceed to digital signature</p>
          <p>• Requesting changes will send feedback to the document owner</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentDecisionPanel;