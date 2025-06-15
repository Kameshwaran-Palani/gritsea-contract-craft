
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ContractData } from '@/types/ContractData';

interface GeneralInfoStepProps {
  data: ContractData;
  updateData: (field: keyof ContractData, value: any) => void;
  onNext: () => void;
}

export const GeneralInfoStep: React.FC<GeneralInfoStepProps> = ({
  data,
  updateData,
  onNext
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">General Information</h2>
        <p className="text-muted-foreground">
          Enter basic details about the contract and the parties involved.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contractTitle">Contract Title</Label>
            <Input
              id="contractTitle"
              value={data.contractTitle}
              onChange={(e) => updateData('contractTitle', e.target.value)}
              placeholder="e.g., Service Agreement"
            />
          </div>
          <div>
            <Label htmlFor="contractSubtitle">Contract Subtitle</Label>
            <Input
              id="contractSubtitle"
              value={data.contractSubtitle}
              onChange={(e) => updateData('contractSubtitle', e.target.value)}
              placeholder="e.g., General Service Contract"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={data.clientName}
              onChange={(e) => updateData('clientName', e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={data.clientEmail}
              onChange={(e) => updateData('clientEmail', e.target.value)}
              placeholder="Enter client email"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="freelancerName">Your Name</Label>
            <Input
              id="freelancerName"
              value={data.freelancerName}
              onChange={(e) => updateData('freelancerName', e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <Label htmlFor="freelancerEmail">Your Email</Label>
            <Input
              id="freelancerEmail"
              type="email"
              value={data.freelancerEmail}
              onChange={(e) => updateData('freelancerEmail', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};
