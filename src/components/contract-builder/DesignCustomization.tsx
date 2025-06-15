import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ContractData, SectionDesignSettings } from '@/pages/ContractBuilder';
import { Palette, Type, Bold, List, Settings, Text, AlignLeft, AlignCenter, AlignJustify } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';

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
    '#BE185D', '#065F46', '#1E40AF', '#78350F',
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

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' }
  ];

  const sectionDesigns: { id: keyof NonNullable<ContractData['designSettings']>, title: string }[] = [
    { id: 'introduction', title: 'Agreement Introduction' },
    { id: 'parties', title: 'Parties Information' },
    { id: 'scope', title: 'Scope of Work' },
    { id: 'payment', title: 'Payment Terms' },
    { id: 'timeline', title: 'Project Timeline' },
    { id: 'ongoing', title: 'Ongoing Work' },
    { id: 'sla', title: 'Service Level Agreement' },
    { id: 'nda', title: 'Confidentiality' },
    { id: 'ip', title: 'Intellectual Property' },
    { id: 'termination', title: 'Termination & Dispute' },
    { id: 'signature', title: 'Signature' },
  ];

  const updateSectionDesign = (sectionId: keyof NonNullable<ContractData['designSettings']>, updates: Partial<SectionDesignSettings>) => {
    updateData({
      designSettings: {
        ...data.designSettings,
        [sectionId]: {
          ...data.designSettings?.[sectionId],
          ...updates
        }
      }
    });
  };

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
            Global Colors & Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Color (Default for Headers)</Label>
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
          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="apply-theme"
              checked={data.designSettings?.applyToAll}
              onCheckedChange={(checked) => updateData({ designSettings: { ...data.designSettings, applyToAll: checked } })}
            />
            <Label htmlFor="apply-theme">Apply global theme to all sections</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, all sections will use the global styles. Disable to use section-specific settings below.
          </p>
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

      {/* Individual Font Size Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Font Size Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Document Header Size</Label>
              <Select 
                value={data.headerFontSize || 'large'} 
                onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateData({ headerFontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} {size.value === 'small' && '(24px)'}
                      {size.value === 'medium' && '(28px)'}
                      {size.value === 'large' && '(32px)'}
                      {size.value === 'xlarge' && '(36px)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Section Headers Size</Label>
              <Select 
                value={data.sectionHeaderFontSize || 'large'} 
                onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateData({ sectionHeaderFontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} {size.value === 'small' && '(16px)'}
                      {size.value === 'medium' && '(18px)'}
                      {size.value === 'large' && '(20px)'}
                      {size.value === 'xlarge' && '(22px)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sub Headers Size</Label>
              <Select 
                value={data.subHeaderFontSize || 'medium'} 
                onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateData({ subHeaderFontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} {size.value === 'small' && '(13px)'}
                      {size.value === 'medium' && '(14px)'}
                      {size.value === 'large' && '(16px)'}
                      {size.value === 'xlarge' && '(18px)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Body Text Size</Label>
              <Select 
                value={data.bodyFontSize || 'medium'} 
                onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateData({ bodyFontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} {size.value === 'small' && '(11px)'}
                      {size.value === 'medium' && '(12px)'}
                      {size.value === 'large' && '(14px)'}
                      {size.value === 'xlarge' && '(16px)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section-Specific Design Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Section-Specific Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-2">
            {sectionDesigns.map(section => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4 bg-muted/50">
                <AccordionTrigger className="text-left hover:no-underline py-3 font-medium text-sm">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-4">
                  <fieldset disabled={data.designSettings?.applyToAll}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Header Controls */}
                      <div className="space-y-3 p-3 border rounded-md">
                        <h4 className="font-semibold text-xs text-muted-foreground">HEADER</h4>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <Input
                            type="color"
                            value={data.designSettings?.[section.id]?.headerColor || data.primaryColor}
                            onChange={(e) => updateSectionDesign(section.id, { headerColor: e.target.value })}
                            className="w-full h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Font Size</Label>
                          <Select 
                            value={data.designSettings?.[section.id]?.headerFontSize || 'large'}
                            onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateSectionDesign(section.id, { headerFontSize: value })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {fontSizeOptions.map(size => <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Alignment</Label>
                          <RadioGroup
                            value={data.designSettings?.[section.id]?.headerAlignment || 'left'}
                            onValueChange={(value: 'left' | 'center' | 'right') => updateSectionDesign(section.id, { headerAlignment: value })}
                            className="flex gap-2 mt-1"
                          >
                            <Button size="icon" variant={data.designSettings?.[section.id]?.headerAlignment === 'left' ? 'default' : 'outline'} onClick={() => updateSectionDesign(section.id, { headerAlignment: 'left' })}><AlignLeft className="h-4 w-4" /></Button>
                            <Button size="icon" variant={data.designSettings?.[section.id]?.headerAlignment === 'center' ? 'default' : 'outline'} onClick={() => updateSectionDesign(section.id, { headerAlignment: 'center' })}><AlignCenter className="h-4 w-4" /></Button>
                            <Button size="icon" variant={data.designSettings?.[section.id]?.headerAlignment === 'right' ? 'default' : 'outline'} onClick={() => updateSectionDesign(section.id, { headerAlignment: 'right' })}><AlignJustify className="h-4 w-4" /></Button>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* Content Controls */}
                      <div className="space-y-3 p-3 border rounded-md">
                        <h4 className="font-semibold text-xs text-muted-foreground">CONTENT</h4>
                        <div>
                          <Label className="text-xs">Color</Label>
                          <Input
                            type="color"
                            value={data.designSettings?.[section.id]?.contentColor || '#374151'}
                            onChange={(e) => updateSectionDesign(section.id, { contentColor: e.target.value })}
                            className="w-full h-8"
                          />
                        </div>
                        <div>
                           <Label className="text-xs">Alignment</Label>
                          <RadioGroup
                            value={data.designSettings?.[section.id]?.contentAlignment || 'left'}
                            onValueChange={(value: 'left' | 'center' | 'justify') => updateSectionDesign(section.id, { contentAlignment: value })}
                            className="flex gap-2 mt-1"
                          >
                            <Button size="icon" variant={data.designSettings?.[section.id]?.contentAlignment === 'left' ? 'default' : 'outline'} onClick={() => updateSectionDesign(section.id, { contentAlignment: 'left' })}><AlignLeft className="h-4 w-4" /></Button>
                            <Button size="icon" variant={data.designSettings?.[section.id]?.contentAlignment === 'center' ? 'default' : 'outline'} onClick={() => updateSectionDesign(section.id, { contentAlignment: 'center' })}><AlignCenter className="h-4 w-4" /></Button>
                            <Button size="icon" variant={data.designSettings?.[section.id]?.contentAlignment === 'justify' ? 'default' : 'outline'} onClick={() => updateSectionDesign(section.id, { contentAlignment: 'justify' })}><AlignJustify className="h-4 w-4" /></Button>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignCustomization;
