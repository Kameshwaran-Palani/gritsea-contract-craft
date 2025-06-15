import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ContractData, SectionDesign } from '@/pages/ContractBuilder';
import { Palette, Type, Settings, AlignLeft, AlignCenter, AlignRight, AlignJustify, Brush } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DesignCustomizationProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

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

const contentSections = [
    { id: 'introduction', title: 'Agreement Introduction' },
    { id: 'parties', title: 'Parties Information' },
    { id: 'scope', title: 'Scope of Work' },
    { id: 'payment', title: 'Payment Terms' },
    { id: 'timeline', title: 'Project Timeline' },
    { id: 'sla', title: 'Service Level Agreement' },
    { id: 'ip', title: 'Intellectual Property' },
    { id: 'nda', title: 'Confidentiality' },
    { id: 'termination', title: 'Termination' },
    { id: 'signatures', title: 'Digital Signatures' },
];

interface SectionControlsProps {
    sectionId: string;
    data: ContractData;
    updateData: (updates: Partial<ContractData>) => void;
}

const SectionControls: React.FC<SectionControlsProps> = ({ sectionId, data, updateData }) => {
    // Section-specific styles are always editable.
    // Making a change will automatically disable "Apply Global Styles".
    const sectionStyle = data.sectionStyles?.[sectionId] || {};

    const handleUpdate = (updates: Partial<SectionDesign>) => {
        const updatePayload: Partial<ContractData> = {
            sectionStyles: {
                ...data.sectionStyles,
                [sectionId]: {
                    ...(data.sectionStyles?.[sectionId] || {}),
                    ...updates,
                },
            },
        };
        
        // If global styles were on, turn them off because a specific change is being made.
        if (data.applyGlobalStyles) {
            updatePayload.applyGlobalStyles = false;
        }

        updateData(updatePayload);
    };

    return (
        <div className="space-y-4">
            <fieldset>
                <h4 className="font-medium text-sm mb-2">Header Styles</h4>
                <div className="space-y-3 p-3 border rounded-md">
                    <div>
                        <Label>Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="color"
                                value={sectionStyle.headerColor || data.primaryColor}
                                onChange={(e) => handleUpdate({ headerColor: e.target.value })}
                                className="w-16 h-8"
                            />
                            <span>{sectionStyle.headerColor || data.primaryColor}</span>
                        </div>
                    </div>
                    <div>
                        <Label>Alignment</Label>
                        <ToggleGroup
                            type="single"
                            value={sectionStyle.headerAlignment || data.headerAlignment}
                            onValueChange={(value: 'left' | 'center' | 'right') => {
                                if (value) handleUpdate({ headerAlignment: value });
                            }}
                            className="w-full justify-start gap-2 mt-1"
                        >
                            <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div>
                        <Label htmlFor={`shfs-${sectionId}`}>Font Size (px)</Label>
                        <Input id={`shfs-${sectionId}`} type="number" placeholder="e.g. 20" value={sectionStyle.headerFontSize ?? data.sectionHeaderFontSize ?? ''} onChange={(e) => handleUpdate({ headerFontSize: Number(e.target.value) })} />
                    </div>
                </div>

                <h4 className="font-medium text-sm mt-4 mb-2">Content Styles</h4>
                <div className="space-y-3 p-3 border rounded-md">
                    <div>
                        <Label>Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="color"
                                value={sectionStyle.contentColor || data.contentColor}
                                onChange={(e) => handleUpdate({ contentColor: e.target.value })}
                                className="w-16 h-8"
                            />
                            <span>{sectionStyle.contentColor || data.contentColor}</span>
                        </div>
                    </div>
                    <div>
                        <Label>Alignment</Label>
                        <ToggleGroup
                            type="single"
                            value={sectionStyle.contentAlignment || data.contentAlignment}
                            onValueChange={(value: 'left' | 'center' | 'justify') => {
                                if (value) handleUpdate({ contentAlignment: value });
                            }}
                            className="w-full justify-start gap-2 mt-1"
                        >
                            <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="justify" aria-label="Align justify"><AlignJustify className="h-4 w-4" /></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div>
                        <Label htmlFor={`scfs-${sectionId}`}>Font Size (px)</Label>
                        <Input id={`scfs-${sectionId}`} type="number" placeholder="e.g. 12" value={sectionStyle.contentFontSize ?? data.bodyFontSize ?? ''} onChange={(e) => handleUpdate({ contentFontSize: Number(e.target.value) })} />
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

const DesignCustomization: React.FC<DesignCustomizationProps> = ({
  data,
  updateData
}) => {

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Design & Styling</h2>
        <p className="text-muted-foreground">
          Customize colors, typography, and formatting options
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Global Styles
            </div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="apply-global" className="text-sm font-medium">Apply to All Sections</Label>
                <Switch
                    id="apply-global"
                    checked={data.applyGlobalStyles}
                    onCheckedChange={(checked) => updateData({ applyGlobalStyles: checked })}
                />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Header Color</Label>
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
                <Label htmlFor="customColor">Custom Header Color:</Label>
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
          <div className="pt-4">
            <Label>Body Text Color</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="contentColor"
                type="color"
                value={data.contentColor || '#374151'}
                onChange={(e) => updateData({ contentColor: e.target.value })}
                className="w-20 h-10"
              />
              <span className="text-sm text-muted-foreground">{data.contentColor}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Global Typography & Alignment
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
          
          <div className="pt-4">
            <Label>Header Alignment</Label>
            <ToggleGroup
              type="single"
              value={data.headerAlignment}
              onValueChange={(value: 'left' | 'center' | 'right') => {
                if (value) updateData({ headerAlignment: value });
              }}
              className="w-full justify-start gap-2 mt-2"
            >
              <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="pt-4">
            <Label>Body Text Alignment</Label>
            <ToggleGroup
              type="single"
              value={data.contentAlignment}
              onValueChange={(value: 'left' | 'center' | 'justify') => {
                if (value) updateData({ contentAlignment: value });
              }}
              className="w-full justify-start gap-2 mt-2"
            >
              <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="justify" aria-label="Align justify"><AlignJustify className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Font Size Controls (in px)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headerFontSize">Document Header Size</Label>
              <Input id="headerFontSize" type="number" placeholder="e.g. 32" value={data.headerFontSize || ''} onChange={(e) => updateData({ headerFontSize: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="sectionHeaderFontSize">Section Headers Size</Label>
              <Input id="sectionHeaderFontSize" type="number" placeholder="e.g. 20" value={data.sectionHeaderFontSize || ''} onChange={(e) => updateData({ sectionHeaderFontSize: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="subHeaderFontSize">Sub Headers Size</Label>
              <Input id="subHeaderFontSize" type="number" placeholder="e.g. 16" value={data.subHeaderFontSize || ''} onChange={(e) => updateData({ subHeaderFontSize: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="bodyFontSize">Body Text Size</Label>
              <Input id="bodyFontSize" type="number" placeholder="e.g. 12" value={data.bodyFontSize || ''} onChange={(e) => updateData({ bodyFontSize: Number(e.target.value) })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Brush className="h-5 w-5" />
                  Section-Specific Styles
              </CardTitle>
          </CardHeader>
          <CardContent>
              <Accordion type="multiple" className="w-full">
                  {contentSections.map(section => (
                      <AccordionItem key={section.id} value={section.id}>
                          <AccordionTrigger>{section.title}</AccordionTrigger>
                          <AccordionContent>
                              <SectionControls
                                  sectionId={section.id}
                                  data={data}
                                  updateData={updateData}
                              />
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
