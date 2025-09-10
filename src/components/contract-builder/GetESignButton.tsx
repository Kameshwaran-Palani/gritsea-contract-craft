import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import ESignDialog from './ESignDialog';

interface GetESignButtonProps {
  contractId?: string;
  documentId?: string;
  onSuccess?: () => void;
}

const GetESignButton: React.FC<GetESignButtonProps> = ({
  contractId,
  documentId,
  onSuccess
}) => {
  const [showESignDialog, setShowESignDialog] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowESignDialog(true)}
        className="w-full"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        Get E-Sign
      </Button>

      <ESignDialog
        isOpen={showESignDialog}
        onClose={() => setShowESignDialog(false)}
        contractId={contractId}
        documentId={documentId}
        onSuccess={(shareInfo) => {
          setShowESignDialog(false);
          onSuccess?.();
        }}
      />
    </>
  );
};

export default GetESignButton;