
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, FileText } from 'lucide-react';
import { ContractData } from '@/pages/ContractBuilder';

interface DocumentHeaderStylingProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const DocumentHeaderStyling: React.FC<DocumentHeaderStylingProps> = ({ data, updateData }) => {
  return (
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Header Styles
          </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
          <fieldset>
            <h4 className="font-medium text-sm mb-2">Title Styles</h4>
            <div className="space-y-3 p-3 border rounded-md">
                <div>
                    <Label>Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <Input
                            type="color"
                            value={data.documentHeaderColor || data.primaryColor}
                            onChange={(e) => updateData({ documentHeaderColor: e.target.value })}
                            className="w-16 h-8"
                        />
                        <span>{data.documentHeaderColor || data.primaryColor}</span>
                    </div>
                </div>
                <div>
                    <Label>Alignment</Label>
                    <ToggleGroup
                        type="single"
                        value={data.documentHeaderAlignment || data.headerAlignment}
                        onValueChange={(value: 'left' | 'center' | 'right') => {
                            if (value) updateData({ documentHeaderAlignment: value });
                        }}
                        className="w-full justify-start gap-2 mt-1"
                    >
                        <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div>
                    <Label htmlFor="docHeaderFontSize">Font Size (px)</Label>
                    <Input id="docHeaderFontSize" type="number" placeholder="e.g. 32" value={data.documentHeaderFontSize ?? data.headerFontSize ?? ''} onChange={(e) => updateData({ documentHeaderFontSize: Number(e.target.value) })} />
                </div>
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <h4 className="font-medium text-sm mb-2">Subtitle Styles</h4>
            <div className="space-y-3 p-3 border rounded-md">
                <div>
                    <Label>Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <Input
                            type="color"
                            value={data.documentSubtitleColor || data.contentColor}
                            onChange={(e) => updateData({ documentSubtitleColor: e.target.value })}
                            className="w-16 h-8"
                        />
                        <span>{data.documentSubtitleColor || data.contentColor}</span>
                    </div>
                </div>
                <div>
                    <Label>Alignment</Label>
                    <ToggleGroup
                        type="single"
                        value={data.documentSubtitleAlignment || 'center'}
                        onValueChange={(value: 'left' | 'center' | 'right') => {
                            if (value) updateData({ documentSubtitleAlignment: value });
                        }}
                        className="w-full justify-start gap-2 mt-1"
                    >
                        <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                        <ToggleGroupItem value="right" aria-label="Align right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div>
                    <Label htmlFor="docSubtitleFontSize">Font Size (px)</Label>
                    <Input id="docSubtitleFontSize" type="number" placeholder="e.g. 16" value={data.documentSubtitleFontSize ?? data.subHeaderFontSize ?? ''} onChange={(e) => updateData({ documentSubtitleFontSize: Number(e.target.value) })} />
                </div>
            </div>
          </fieldset>
      </CardContent>
    </Card>
  );
};

export default DocumentHeaderStyling;
