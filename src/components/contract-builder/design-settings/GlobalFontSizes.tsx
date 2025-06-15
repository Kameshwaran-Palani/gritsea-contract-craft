
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractData } from '@/pages/ContractBuilder';
import { Settings } from 'lucide-react';

interface GlobalFontSizesProps {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const GlobalFontSizes: React.FC<GlobalFontSizesProps> = ({ data, updateData }) => {
  return (
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
  );
};

export default GlobalFontSizes;
