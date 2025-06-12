
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ContractData } from '@/pages/ContractBuilder';
import { Palette, Upload, Image as ImageIcon } from 'lucide-react';

interface DesignCustomizationProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const DesignCustomization: React.FC<DesignCustomizationProps> = ({
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

  // Extended color palette with more options
  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#14B8A6', '#8B5A2B', '#DC2626',
    '#7C3AED', '#059669', '#0EA5E9', '#D97706',
    '#BE185D', '#0D9488', '#7C2D12', '#991B1B',
    '#6B21A8', '#047857', '#0284C7', '#92400E',
    '#BE123C', '#065F46', '#1E40AF', '#78350F',
    '#A21CAF', '#064E3B', '#1E3A8A', '#451A03'
  ];

  const fontOptions = [
    { value: 'inter', label: 'Inter (Modern)' },
    { value: 'serif', label: 'Times (Classic)' },
    { value: 'sans', label: 'Arial (Clean)' },
    { value: 'mono', label: 'Courier (Typewriter)' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small (10px)' },
    { value: 'medium', label: 'Medium (11px)' },
    { value: 'large', label: 'Large (12px)' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Design & Branding</h2>
        <p className="text-muted-foreground">
          Customize the appearance and add your brand elements
        </p>
      </div>

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

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Color</Label>
            <div className="mt-2 space-y-3">
              <div className="grid grid-cols-8 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateData({ primaryColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                      data.primaryColor === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="customColor">Custom Color:</Label>
                <Input
                  id="customColor"
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => updateData({ primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{data.primaryColor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Font Family</Label>
            <RadioGroup
              value={data.fontFamily}
              onValueChange={(value) => updateData({ fontFamily: value })}
              className="mt-2"
            >
              {fontOptions.map((font) => (
                <div key={font.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={font.value} id={font.value} />
                  <Label htmlFor={font.value}>{font.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label>Font Size</Label>
            <RadioGroup
              value={data.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') => updateData({ fontSize: value })}
              className="mt-2"
            >
              {sizeOptions.map((size) => (
                <div key={size.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={size.value} id={size.value} />
                  <Label htmlFor={size.value}>{size.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignCustomization;
