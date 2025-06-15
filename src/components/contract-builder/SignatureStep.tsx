
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, PenTool, Send } from 'lucide-react';
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

  useEffect(() => {
    // Load existing signature if it exists
    if (data.freelancerSignature && freelancerSigRef.current) {
      freelancerSigRef.current.fromDataURL(data.freelancerSignature);
    }
  }, [data.freelancerSignature]);

  const clearFreelancerSignature = () => {
    if (freelancerSigRef.current) {
      freelancerSigRef.current.clear();
      updateData('freelancerSignature', '');
    }
  };

  const saveFreelancerSignature = () => {
    if (freelancerSigRef.current && !freelancerSigRef.current.isEmpty()) {
      const signatureData = freelancerSigRef.current.toDataURL();
      updateData('freelancerSignature', signatureData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Digital Signatures</h2>
        <p className="text-muted-foreground">
          Add your signature to the contract. Client signature will be collected through the e-sign process.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Freelancer Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Your Signature (Service Provider)
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

        {/* Client E-Sign Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Client E-Sign
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
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={data.clientEmail || ''}
                onChange={(e) => updateData('clientEmail', e.target.value)}
                placeholder="Client's email for e-sign"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Client signature will be collected when you send the contract for e-signing. 
                Use the "Get E-Sign" button after completing the contract.
              </p>
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
