
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContractData } from '@/pages/ContractBuilder';
import { FileText } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Document Headers</h2>
        <p className="text-muted-foreground">
          Customize the main title and subtitle of your contract
        </p>
      </div>

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
    </div>
  );
};

export default DocumentHeaders;
