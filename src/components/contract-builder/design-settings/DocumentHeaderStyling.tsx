
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, FileText, Upload, X, Image } from 'lucide-react';
import { ContractData } from '@/pages/ContractBuilder';

interface DocumentHeaderStylingProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const DocumentHeaderStyling: React.FC<DocumentHeaderStylingProps> = ({ data, updateData }) => {
  const headerBgInputRef = useRef<HTMLInputElement>(null);
  const docBgInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateData({ headerBackgroundImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateData({ documentBackgroundImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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

          {/* Header Background Image */}
          <fieldset className="mt-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Header Background Image
            </h4>
            <p className="text-xs text-muted-foreground mb-2">Background image for the document header section only</p>
            <div className="space-y-3 p-3 border rounded-md">
              <input
                ref={headerBgInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeaderBgUpload}
                className="hidden"
              />
              {data.headerBackgroundImage ? (
                <div className="relative">
                  <img
                    src={data.headerBackgroundImage}
                    alt="Header background"
                    className="w-full h-20 object-cover rounded-md border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => updateData({ headerBackgroundImage: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => headerBgInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Header Background
                </Button>
              )}
            </div>
          </fieldset>

          {/* Document Background Image */}
          <fieldset className="mt-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Image className="h-4 w-4" />
              Document Background Image
            </h4>
            <p className="text-xs text-muted-foreground mb-2">Background image for all pages in the document</p>
            <div className="space-y-3 p-3 border rounded-md">
              <input
                ref={docBgInputRef}
                type="file"
                accept="image/*"
                onChange={handleDocBgUpload}
                className="hidden"
              />
              {data.documentBackgroundImage ? (
                <div className="relative">
                  <img
                    src={data.documentBackgroundImage}
                    alt="Document background"
                    className="w-full h-20 object-cover rounded-md border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => updateData({ documentBackgroundImage: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => docBgInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document Background
                </Button>
              )}
            </div>
          </fieldset>
      </CardContent>
    </Card>
  );
};

export default DocumentHeaderStyling;
