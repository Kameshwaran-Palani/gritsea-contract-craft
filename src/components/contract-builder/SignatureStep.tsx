
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
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  signerType?: 'freelancer' | 'client';
}

const SignatureStep: React.FC<SignatureStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast,
  signerType = 'freelancer'
}) => {
  const isClient = signerType === 'client';

  const sigCanvasRef = useRef<SignatureCanvas>(null);
  
  const signerName = isClient ? data.clientName : data.freelancerName;
  const signatureDataUrl = isClient ? data.clientSignature : data.freelancerSignature;

  const [signatureType, setSignatureType] = useState<'draw' | 'font'>('draw');
  const [fontSignatureName, setFontSignatureName] = useState(signerName || '');
  const [isSignatureSaved, setIsSignatureSaved] = useState(!!signatureDataUrl);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const { toast } = useToast();

  // Load existing signature when component mounts or signature type changes
  useEffect(() => {
    if (signatureDataUrl && sigCanvasRef.current && signatureType === 'draw' && !isCanvasLoaded) {
      // Delay loading to ensure canvas is ready
      const timer = setTimeout(() => {
        try {
          sigCanvasRef.current?.fromDataURL(signatureDataUrl);
          setIsCanvasLoaded(true);
          console.log(`[SignatureStep - ${signerType}] Loaded existing signature from data:`, signatureDataUrl.slice(0, 50));
        } catch (error) {
          console.error('Error loading signature:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    setIsSignatureSaved(!!signatureDataUrl);
  }, [signatureDataUrl, signatureType, signerType, isCanvasLoaded]);

  // Reset canvas loaded state when signature type changes
  useEffect(() => {
    setIsCanvasLoaded(false);
  }, [signatureType]);

  useEffect(() => {
    // Update font signature name when name changes
    if (signatureType === 'font' && signerName && !fontSignatureName) {
      setFontSignatureName(signerName);
    }
  }, [signerName, signatureType, fontSignatureName]);

  // Wrap updateData to log
  const debugUpdateData = (updates: Partial<ContractData>) => {
    console.log(`[SignatureStep - ${signerType}] updateData called with:`, updates);
    updateData(updates);
  };

  // Real-time signature update for drawing
  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureData = sigCanvasRef.current.toDataURL();
      console.log(`[SignatureStep - ${signerType}] Real-time signature update:`, signatureData.slice(0, 50), '...');
      const updates = isClient
        ? { clientSignature: signatureData, signedDate: new Date().toISOString() }
        : { freelancerSignature: signatureData, signedDate: new Date().toISOString() };
      debugUpdateData(updates);
      setIsSignatureSaved(true);
    }
  };

  // Real-time signature update for font
  const handleFontSignatureChange = (name: string) => {
    setFontSignatureName(name);
    const nameUpdate = isClient ? { clientName: name } : { freelancerName: name };
    updateData(nameUpdate);
    if (name.trim()) {
      generateFontSignature(name);
    } else {
      const signatureClear = isClient
        ? { clientSignature: '', signedDate: '' }
        : { freelancerSignature: '', signedDate: '' };
      debugUpdateData(signatureClear);
      setIsSignatureSaved(false);
    }
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
    const signatureClear = isClient
      ? { clientSignature: '', signedDate: '' }
      : { freelancerSignature: '', signedDate: '' };
    debugUpdateData(signatureClear);
    setIsSignatureSaved(false);
    setIsCanvasLoaded(false);
    
    toast({
      title: "Signature Cleared",
      description: "Your signature has been cleared successfully."
    });
  };

  const saveSignature = () => {
    if (signatureType === 'draw') {
      if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
        const signatureData = sigCanvasRef.current.toDataURL();
        console.log(`[SignatureStep - ${signerType}] Saving drawn signature:`, signatureData.slice(0, 50), '...');
        const updates = isClient
          ? { clientSignature: signatureData, signedDate: new Date().toISOString() }
          : { freelancerSignature: signatureData, signedDate: new Date().toISOString() };
        debugUpdateData(updates);
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
      console.log(`[SignatureStep - ${signerType}] Generating font signature:`, signatureData.slice(0, 50), '...');
      const updates = isClient
        ? { clientSignature: signatureData, signedDate: new Date().toISOString() }
        : { freelancerSignature: signatureData, signedDate: new Date().toISOString() };
      debugUpdateData(updates);
      setIsSignatureSaved(true);
    }
  };

  const handleSignatureTypeChange = (type: 'draw' | 'font') => {
    setSignatureType(type);
    // Clear existing signature when switching types
    const signatureClear = isClient
      ? { clientSignature: '', signedDate: '' }
      : { freelancerSignature: '', signedDate: '' };
    updateData(signatureClear);
    setIsSignatureSaved(false);
    setIsCanvasLoaded(false);
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
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

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            {isClient ? 'Your Signature (Client)' : 'Your Signature (Service Provider)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={isClient ? "clientName" : "freelancerName"}>Full Name</Label>
            <Input
              id={isClient ? "clientName" : "freelancerName"}
              value={signerName || ''}
              onChange={(e) => {
                const newName = e.target.value;
                const nameUpdate = isClient ? { clientName: newName } : { freelancerName: newName };
                updateData(nameUpdate);
                if (signatureType === 'font') {
                  handleFontSignatureChange(newName);
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
                  ref={sigCanvasRef}
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
                  onClick={clearSignature}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={saveSignature}
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
                  onClick={saveSignature}
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
          {signatureDataUrl && isSignatureSaved && (
            <div>
              <Label>Signature Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
                <img 
                  src={signatureDataUrl} 
                  alt="Your Signature" 
                  className="h-16 object-contain"
                  onError={() => {
                    console.error(`[SignatureStep - ${signerType}] Error loading signature preview in left panel`);
                  }}
                  onLoad={() => {
                    console.log(`[SignatureStep - ${signerType}] Signature preview image loaded in left panel`);
                  }}
                />
              </div>
              {data.signedDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Signed on: {new Date(data.signedDate).toLocaleString()}
                </p>
              )}
              <div className="mt-2">
                <p className="text-sm text-green-600 font-medium">✓ Signature saved and will appear in the contract</p>
                <p className="text-xs text-gray-400">
                  [DEBUG] <span className="break-all">{signatureDataUrl?.slice(0, 40)}...</span>
                </p>
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
