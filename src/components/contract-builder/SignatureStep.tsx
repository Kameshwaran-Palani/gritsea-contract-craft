
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractData } from '@/types/ContractData';
import { ESignDialog } from './ESignDialog';

interface SignatureStepProps {
  data: ContractData;
  updateData: (field: keyof ContractData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SignatureStep: React.FC<SignatureStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev,
  isFirst,
  isLast
}) => {
  const [showESignDialog, setShowESignDialog] = useState(false);

  const handleFreelancerSign = () => {
    const signature = `${data.freelancerName} - ${new Date().toLocaleDateString()}`;
    updateData('freelancerSignature', signature);
    updateData('signedDate', new Date());
    
    // Show eSign dialog after freelancer signs
    setShowESignDialog(true);
  };

  const handleESignShare = (authMethod: string, clientContact: string) => {
    // Trigger share event for parent component
    const event = new CustomEvent('shareContract', {
      detail: { authMethod, clientContact }
    });
    window.dispatchEvent(event);
    setShowESignDialog(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Signature</h2>
        <p className="text-muted-foreground">
          Complete the contract by adding your signature.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="signature">Digital Signature</Label>
            <Textarea
              id="signature"
              value={data.signature}
              onChange={(e) => updateData('signature', e.target.value)}
              placeholder="Enter your digital signature or agreement statement"
              className="min-h-[100px]"
            />
          </div>
          
          {!data.freelancerSignature ? (
            <Button 
              onClick={handleFreelancerSign}
              className="w-full"
              disabled={!data.freelancerName}
            >
              Sign as {data.freelancerName || 'Freelancer'}
            </Button>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Signed by {data.freelancerName}</p>
              <p className="text-green-600 text-sm">{data.freelancerSignature}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {data.shareInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Client Signature Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">eSign link sent to client</p>
              <p className="text-blue-600 text-sm">
                Awaiting signature from {data.clientName || 'client'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        {!isFirst && (
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
        )}
        <div className="flex-1" />
        {!isLast && (
          <Button onClick={onNext}>Next</Button>
        )}
      </div>

      <ESignDialog
        open={showESignDialog}
        onOpenChange={setShowESignDialog}
        onShare={handleESignShare}
        defaultEmail={data.clientEmail}
      />
    </div>
  );
};

export default SignatureStep;
