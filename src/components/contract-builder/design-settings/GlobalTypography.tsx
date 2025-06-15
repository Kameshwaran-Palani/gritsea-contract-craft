
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ContractData } from '@/pages/ContractBuilder';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface GlobalTypographyProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const fontOptions = [
    { value: 'inter', label: 'Inter (Modern)' },
    { value: 'serif', label: 'Times (Classic)' },
    { value: 'sans', label: 'Arial (Clean)' },
    { value: 'mono', label: 'Courier (Typewriter)' }
];

const GlobalTypography: React.FC<GlobalTypographyProps> = ({ data, updateData }) => {
  return (
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
  );
};

export default GlobalTypography;
