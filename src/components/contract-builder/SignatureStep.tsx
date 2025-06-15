
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, PenTool, Type, Save } from 'lucide-react';
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
  const [signatureType, setSignatureType] = useState<'draw' | 'font'>('draw');
  const [fontSignatureName, setFontSignatureName] = useState(data.freelancerName || '');
  const [isSignatureSaved, setIsSignatureSaved] = useState(!!data.freelancerSignature);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const { toast } = useToast();

  // Load existing signature when component mounts or signature type changes
  useEffect(() => {
    if (data.freelancerSignature && freelancerSigRef.current && signatureType === 'draw' && !isCanvasLoaded) {
      // Delay loading to ensure canvas is ready
      const timer = setTimeout(() => {
        try {
          freelancerSigRef.current?.fromDataURL(data.freelancerSignature);
          setIsCanvasLoaded(true);
          console.log('Loaded existing signature from data:', data.freelancerSignature);
        } catch (error) {
          console.error('Error loading signature:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    setIsSignatureSaved(!!data.freelancerSignature);
  }, [data.freelancerSignature, signatureType]);

  // Reset canvas loaded state when signature type changes
  useEffect(() => {
    setIsCanvasLoaded(false);
  }, [signatureType]);

  useEffect(() => {
    // Update font signature name when freelancer name changes
    if (signatureType === 'font' && data.freelancerName && !fontSignatureName) {
      setFontSignatureName(data.freelancerName);
    }
  }, [data.freelancerName, signatureType, fontSignatureName]);

  // Real-time signature update for drawing
  const handleSignatureEnd = () => {
    if (freelancerSigRef.current && !freelancerSigRef.current.isEmpty()) {
      const signatureData = freelancerSigRef.current.toDataURL();
      console.log('Real-time signature update:', signatureData);
      updateData('freelancerSignature', signatureData);
      updateData('signedDate', new Date().toISOString());
      setIsSignatureSaved(true);
    }
  };

  // Real-time signature update for font
  const handleFontSignatureChange = (name: string) => {
    setFontSignatureName(name);
    if (name.trim()) {
      generateFontSignature(name);
    } else {
      updateData('freelancerSignature', '');
      updateData('signedDate', '');
      setIsSignatureSaved(false);
    }
  };

  const clearFreelancerSignature = () => {
    if (freelancerSigRef.current) {
      freelancerSigRef.current.clear();
    }
    updateData('freelancerSignature', '');
    updateData('signedDate', '');
    setIsSignatureSaved(false);
    setIsCanvasLoaded(false);
    
    toast({
      title: "Signature Cleared",
      description: "Your signature has been cleared successfully."
    });
  };

  const saveFreelancerSignature = () => {
    if (signatureType === 'draw') {
      if (freelancerSigRef.current && !freelancerSigRef.current.isEmpty()) {
        const signatureData = freelancerSigRef.current.toDataURL();
        console.log('Saving drawn signature:', signatureData);
        updateData('freelancerSignature', signatureData);
        updateData('signedDate', new Date().toISOString());
        setIsSignatureSaved(true);
        
        toast({
          title: "Signature Saved",
          description: "Your drawn signature has been saved successfully."
        });
      } else {
        toast({
          title: "No Signature",
          description: "Please draw your signature before saving.",
          variant: "destructive"
        });
      }
    } else if (signatureType === 'font') {
      if (fontSignatureName.trim()) {
        generateFontSignature(fontSignatureName);
        
        toast({
          title: "Signature Saved",
          description: "Your font signature has been saved successfully."
        });
      } else {
        toast({
          title: "No Name Entered",
          description: "Please enter your name for the font signature.",
          variant: "destructive"
        });
      }
    }
  };

  const generateFontSignature = (name: string) => {
    if (!name.trim()) return;
    
    // Create a canvas to generate font-based signature
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set font style for signature look
      ctx.font = '32px "Dancing Script", cursive, serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw the name as signature
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);
      
      // Convert to data URL and update
      const signatureData = canvas.toDataURL();
      console.log('Generating font signature:', signatureData);
      updateData('freelancerSignature', signatureData);
      updateData('signedDate', new Date().toISOString());
      setIsSignatureSaved(true);
    }
  };

  const handleSignatureTypeChange = (type: 'draw' | 'font') => {
    setSignatureType(type);
    // Clear existing signature when switching types
    updateData('freelancerSignature', '');
    updateData('signedDate', '');
    setIsSignatureSaved(false);
    setIsCanvasLoaded(false);
    if (freelancerSigRef.current) {
      freelancerSigRef.current.clear();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Digital Signature</h2>
        <p className="text-muted-foreground">
          Add your signature to the contract. You can either draw your signature or use a stylized font version of your name.
        </p>
      </div>

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
              onChange={(e) => {
                updateData('freelancerName', e.target.value);
                if (signatureType === 'font') {
                  handleFontSignatureChange(e.target.value);
                }
              }}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label>Signature Type</Label>
            <RadioGroup
              value={signatureType}
              onValueChange={(value) => handleSignatureTypeChange(value as 'draw' | 'font')}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draw" id="draw" />
                <Label htmlFor="draw" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Draw Signature
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="font" id="font" />
                <Label htmlFor="font" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Signature
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {signatureType === 'draw' ? (
            <div>
              <Label>Draw Your Signature</Label>
              <div className="border rounded-lg p-4 bg-white">
                <SignatureCanvas
                  ref={freelancerSigRef}
                  onEnd={handleSignatureEnd}
                  canvasProps={{
                    width: 300,
                    height: 120,
                    className: 'signature-canvas w-full'
                  }}
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
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={saveFreelancerSignature}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save Signature
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="fontSignatureName">Name for Font Signature</Label>
              <Input
                id="fontSignatureName"
                value={fontSignatureName}
                onChange={(e) => handleFontSignatureChange(e.target.value)}
                placeholder="Enter name to create font signature"
                style={{ fontFamily: '"Dancing Script", cursive, serif', fontSize: '18px' }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Preview: <span style={{ fontFamily: '"Dancing Script", cursive, serif', fontSize: '24px' }}>{fontSignatureName}</span>
              </p>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={saveFreelancerSignature}
                  className="flex items-center gap-1"
                  disabled={!fontSignatureName.trim()}
                >
                  <Save className="h-3 w-3" />
                  Save Signature
                </Button>
              </div>
            </div>
          )}

          {/* Signature Preview */}
          {data.freelancerSignature && isSignatureSaved && (
            <div>
              <Label>Signature Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
                <img 
                  src={data.freelancerSignature} 
                  alt="Your Signature" 
                  className="h-16 object-contain"
                />
              </div>
              {data.signedDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Signed on: {new Date(data.signedDate).toLocaleString()}
                </p>
              )}
              <div className="mt-2">
                <p className="text-sm text-green-600 font-medium">✓ Signature saved and will appear in the contract</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
