
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ContractData } from '@/types/ContractData';

interface LegalTermsStepProps {
  data: ContractData;
  updateData: (field: keyof ContractData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LegalTermsStep: React.FC<LegalTermsStepProps> = ({
  data,
  updateData,
  onNext,
  onPrev
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Legal Terms and Clauses</h2>
        <p className="text-muted-foreground">
          Define the legal terms, confidentiality, and dispute resolution methods.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confidentiality Clause</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="confidentiality">Include Confidentiality Clause</Label>
            <Switch
              id="confidentiality"
              checked={data.confidentiality}
              onCheckedChange={(checked) => updateData('confidentiality', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="intellectualProperty">Intellectual Property Rights</Label>
            <Textarea
              id="intellectualProperty"
              value={data.intellectualProperty}
              onChange={(e) => updateData('intellectualProperty', e.target.value)}
              placeholder="Specify intellectual property rights and ownership."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termination Clause</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="terminationClause">Termination Clause</Label>
            <Textarea
              id="terminationClause"
              value={data.terminationClause}
              onChange={(e) => updateData('terminationClause', e.target.value)}
              placeholder="Define the conditions for contract termination."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Governing Law and Dispute Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="governingLaw">Governing Law</Label>
            <Input
              id="governingLaw"
              value={data.governingLaw}
              onChange={(e) => updateData('governingLaw', e.target.value)}
              placeholder="Specify the governing law for the contract."
            />
          </div>
          <div>
            <Label htmlFor="disputeResolution">Dispute Resolution</Label>
            <Textarea
              id="disputeResolution"
              value={data.disputeResolution}
              onChange={(e) => updateData('disputeResolution', e.target.value)}
              placeholder="Describe the dispute resolution process."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};
