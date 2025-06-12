import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/pages/ContractBuilder';
import { PenTool, RotateCcw, Check } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface SignatureStepProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SignatureStep: React.FC<SignatureStepProps> = ({
  data,
  updateData
}) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const [signatureImage, setSignatureImage] = useState<string>(data.freelancerSignature || '');

  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
      setSignatureImage('');
      updateData({ freelancerSignature: undefined, signedDate: undefined });
    }
  };

  const saveSignature = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const signatureData = sigRef.current.toDataURL();
      setSignatureImage(signatureData);
      updateData({ 
        freelancerSignature: signatureData,
        signedDate: new Date().toISOString()
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <PenTool className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your Digital Signature</h2>
        <p className="text-muted-foreground">
          Sign below to create your digital signature for this contract
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Digital Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Draw your signature in the box below
              </p>
              
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 mb-4 bg-white">
                <SignatureCanvas
                  ref={sigRef}
                  canvasProps={{
                    className: 'signature-canvas w-full h-40 rounded',
                    width: 600,
                    height: 160
                  }}
                  backgroundColor="white"
                  penColor="black"
                  onEnd={saveSignature}
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={clearSignature}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={saveSignature}
                  className="flex items-center gap-2"
                  disabled={!sigRef.current}
                >
                  <Check className="h-4 w-4" />
                  Save Signature
                </Button>
              </div>
            </div>

            {signatureImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Signature Saved</span>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={signatureImage} 
                    alt="Your signature" 
                    className="max-w-xs border rounded bg-white p-2"
                  />
                </div>
                <p className="text-sm text-green-700 mt-2 text-center">
                  Signed on: {data.signedDate ? new Date(data.signedDate).toLocaleDateString() : 'Today'}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Legal Declaration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">By signing this contract, you confirm that:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You have read and understood all terms and conditions</li>
                <li>• You agree to be legally bound by this agreement</li>
                <li>• All information provided is accurate and complete</li>
                <li>• You have the authority to enter into this contract</li>
                <li>• This digital signature has the same legal effect as a handwritten signature</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">After You Sign:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Contract will be saved as "Signed"</li>
                  <li>• PDF will be generated automatically</li>
                  <li>• Client will receive signing invitation</li>
                  <li>• You'll get confirmation email</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Client Signing:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Client gets secure signing link</li>
                  <li>• No account required for client</li>
                  <li>• Email notifications to both parties</li>
                  <li>• Contract becomes legally binding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignatureStep;
