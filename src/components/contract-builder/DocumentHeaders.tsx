
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText, Upload, Image as ImageIcon } from 'lucide-react';

interface DocumentHeadersProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const DocumentHeaders: React.FC<DocumentHeadersProps> = ({
  data,
  updateData
}) => {
  const handleLogoUpload = (side: 'left' | 'right', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateData({ 
          [side === 'left' ? 'leftLogo' : 'rightLogo']: result 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Document Headers & Branding</h2>
        <p className="text-muted-foreground">
          Customize the main title, subtitle, and brand logos of your contract
        </p>
      </div>

      {/* Document Headers */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Headers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="documentTitle">Document Title</Label>
            <Input
              id="documentTitle"
              value={data.documentTitle}
              onChange={(e) => updateData({ documentTitle: e.target.value })}
              placeholder="SERVICE AGREEMENT"
              className="text-center font-semibold"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will appear as the main heading of your contract
            </p>
          </div>

          <div>
            <Label htmlFor="documentSubtitle">Document Subtitle</Label>
            <Input
              id="documentSubtitle"
              value={data.documentSubtitle}
              onChange={(e) => updateData({ documentSubtitle: e.target.value })}
              placeholder="PROFESSIONAL SERVICE CONTRACT"
              className="text-center"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This will appear below the main title
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Preview</h4>
            <div className="text-center border border-border rounded p-4 bg-background">
              <h1 className="text-lg font-bold uppercase tracking-wider mb-1">
                {data.documentTitle || 'SERVICE AGREEMENT'}
              </h1>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {data.documentSubtitle || 'PROFESSIONAL SERVICE CONTRACT'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Logos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Brand Logos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo Style</Label>
            <RadioGroup
              value={data.logoStyle}
              onValueChange={(value: 'round' | 'rectangle') => updateData({ logoStyle: value })}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="round" id="round" />
                <Label htmlFor="round">Round</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rectangle" id="rectangle" />
                <Label htmlFor="rectangle">Rectangle</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leftLogo">Service Provider Logo</Label>
              <div className="mt-2 space-y-2">
                {data.leftLogo && (
                  <img 
                    src={data.leftLogo} 
                    alt="Service Provider logo" 
                    className={`w-16 h-16 object-cover border ${
                      data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('leftLogo')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <Input
                    id="leftLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload('left', e)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="rightLogo">Client Logo</Label>
              <div className="mt-2 space-y-2">
                {data.rightLogo && (
                  <img 
                    src={data.rightLogo} 
                    alt="Client logo" 
                    className={`w-16 h-16 object-cover border ${
                      data.logoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('rightLogo')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <Input
                    id="rightLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload('right', e)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentHeaders;
