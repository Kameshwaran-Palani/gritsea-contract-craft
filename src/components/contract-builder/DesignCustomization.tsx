
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ContractData } from '@/pages/ContractBuilder';
import { Palette, Type, Bold, List } from 'lucide-react';

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
  // Extended color palette with more options
  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#14B8A6', '#8B5A2B', '#DC2626',
    '#7C3AED', '#059669', '#0EA5E9', '#D97706',
    '#BE185D', '#0D9488', '#7C2D12', '#991B1B',
    '#6B21A8', '#047857', '#0284C7', '#92400E',
    '#BE123C', '#065F46', '#1E40AF', '#78350F',
    '#A21CAF', '#064E3B', '#1E3A8A', '#451A03',
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#D1D5DB', '#E5E7EB', '#F3F4F6', '#FFFFFF'
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
    { value: 'large', label: 'Large (12px)' },
    { value: 'xlarge', label: 'Extra Large (14px)' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Design & Styling</h2>
        <p className="text-muted-foreground">
          Customize colors, typography, and formatting options
        </p>
      </div>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colors
          </CardTitle>
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

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Font Family</Label>
            <Select value={data.fontFamily} onValueChange={(value) => updateData({ fontFamily: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Font Size</Label>
            <Select value={data.fontSize} onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateData({ fontSize: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Line Spacing</Label>
            <div className="mt-2">
              <Slider
                value={[data.lineSpacing || 1.4]}
                onValueChange={(value) => updateData({ lineSpacing: value[0] })}
                min={1}
                max={2.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Tight (1.0)</span>
                <span>Current: {(data.lineSpacing || 1.4).toFixed(1)}</span>
                <span>Loose (2.5)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Formatting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bold className="h-5 w-5" />
            Section Formatting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Heading Style</Label>
              <Select value={data.headingStyle || 'bold'} onValueChange={(value) => updateData({ headingStyle: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="semibold">Semi Bold</SelectItem>
                  <SelectItem value="extrabold">Extra Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>List Style</Label>
              <Select value={data.listStyle || 'bullet'} onValueChange={(value) => updateData({ listStyle: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullet">• Bullet Points</SelectItem>
                  <SelectItem value="numbered">1. Numbered</SelectItem>
                  <SelectItem value="dash">- Dash</SelectItem>
                  <SelectItem value="none">No Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Text Alignment</Label>
            <RadioGroup
              value={data.textAlignment || 'left'}
              onValueChange={(value) => updateData({ textAlignment: value })}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" />
                <Label htmlFor="left">Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="center" />
                <Label htmlFor="center">Center</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="justify" id="justify" />
                <Label htmlFor="justify">Justify</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Paragraph Spacing</Label>
            <div className="mt-2">
              <Slider
                value={[data.paragraphSpacing || 1]}
                onValueChange={(value) => updateData({ paragraphSpacing: value[0] })}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Tight (0.5)</span>
                <span>Current: {(data.paragraphSpacing || 1).toFixed(1)}</span>
                <span>Wide (3.0)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section-Specific Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Section Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Parties Section</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={data.partiesBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ partiesBold: !data.partiesBold })}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={data.partiesBullets ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ partiesBullets: !data.partiesBullets })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Scope Section</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={data.scopeBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ scopeBold: !data.scopeBold })}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={data.scopeBullets ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ scopeBullets: !data.scopeBullets })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Payment Section</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={data.paymentBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ paymentBold: !data.paymentBold })}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={data.paymentBullets ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ paymentBullets: !data.paymentBullets })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Terms Section</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={data.termsBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ termsBold: !data.termsBold })}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={data.termsBullets ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateData({ termsBullets: !data.termsBullets })}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignCustomization;
