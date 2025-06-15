
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, PenTool } from 'lucide-react';
import { ContractData } from '@/pages/ContractBuilder';

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
  const freelancerSigRef = useRef<SignatureCanvas>(null);
  const clientSigRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    // Load existing signatures if they exist
    if (data.freelancerSignature && freelancerSigRef.current) {
      freelancerSigRef.current.fromDataURL(data.freelancerSignature);
    }
    if (data.clientSignature && clientSigRef.current) {
      clientSigRef.current.fromDataURL(data.clientSignature);
    }
  }, [data.freelancerSignature, data.clientSignature]);

  const clearFreelancerSignature = () => {
    if (freelancerSigRef.current) {
      freelancerSigRef.current.clear();
      updateData('freelancerSignature', '');
    }
  };

  const clearClientSignature = () => {
    if (clientSigRef.current) {
      clientSigRef.current.clear();
      updateData('clientSignature', '');
    }
  };

  const saveFreelancerSignature = () => {
    if (freelancerSigRef.current && !freelancerSigRef.current.isEmpty()) {
      const signatureData = freelancerSigRef.current.toDataURL();
      updateData('freelancerSignature', signatureData);
    }
  };

  const saveClientSignature = () => {
    if (clientSigRef.current && !clientSigRef.current.isEmpty()) {
      const signatureData = clientSigRef.current.toDataURL();
      updateData('clientSignature', signatureData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Digital Signatures</h2>
        <p className="text-muted-foreground">
          Add digital signatures to complete the contract signing process.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Freelancer Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Your Signature (Freelancer)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="freelancerName">Full Name</Label>
              <Input
                id="freelancerName"
                value={data.freelancerName || ''}
                onChange={(e) => updateData('freelancerName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label>Digital Signature</Label>
              <div className="border rounded-lg p-4 bg-white">
                <SignatureCanvas
                  ref={freelancerSigRef}
                  canvasProps={{
                    width: 300,
                    height: 150,
                    className: 'signature-canvas w-full'
                  }}
                  onEnd={saveFreelancerSignature}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFreelancerSignature}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Client Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientSignatureName">Client Name</Label>
              <Input
                id="clientSignatureName"
                value={data.clientName || ''}
                onChange={(e) => updateData('clientName', e.target.value)}
                placeholder="Client's full name"
              />
            </div>
            
            <div>
              <Label>Digital Signature</Label>
              <div className="border rounded-lg p-4 bg-white">
                <SignatureCanvas
                  ref={clientSigRef}
                  canvasProps={{
                    width: 300,
                    height: 150,
                    className: 'signature-canvas w-full'
                  }}
                  onEnd={saveClientSignature}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearClientSignature}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isFirst}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={isLast}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default SignatureStep;
