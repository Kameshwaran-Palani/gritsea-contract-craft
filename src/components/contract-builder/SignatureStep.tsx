
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, PenTool, CheckCircle } from 'lucide-react';
import { ContractData } from '@/pages/ContractBuilder';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
      
      // Show success message
      toast({
        title: "Signature Saved",
        description: "Your signature has been saved successfully."
      });
    }
  };

  const isSignatureComplete = data.freelancerSignature && data.freelancerName;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Digital Signature</h2>
        <p className="text-muted-foreground">
          Add your digital signature to the contract. Once you sign, an eSign link will be automatically generated for your client.
        </p>
      </div>

      <div className="max-w-md">
        {/* Freelancer Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Your Signature (Service Provider)
              {isSignatureComplete && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
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

            {isSignatureComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Signature Complete</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  eSign link will be automatically generated for your client.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
        <p className="text-sm text-blue-800">
          Once you complete your signature above, an eSign link will be automatically created and ready to share with your client. 
          They will be able to review the contract and add their signature digitally.
        </p>
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
