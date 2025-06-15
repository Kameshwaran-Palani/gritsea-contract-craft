
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractMilestone } from './ContractMilestone';
import { ContractData } from '@/types/ContractData';

interface ContractBuilderSidebarProps {
  progress: number;
  steps: { id: string; label: string }[];
  activeStep: number;
  setActiveStep: (step: number) => void;
  saveContract: () => void;
  isSaving: boolean;
  contractId?: string;
  status: string;
  shareInfo: any;
}

export const ContractBuilderSidebar: React.FC<ContractBuilderSidebarProps> = ({
  progress,
  steps,
  activeStep,
  setActiveStep,
  saveContract,
  isSaving,
  contractId,
  status,
  shareInfo
}) => {
  return (
    <div className="md:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Contract Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Progress</Label>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">{progress}% completed</p>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Button
                key={step.id}
                variant={activeStep === index ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveStep(index)}
              >
                {step.label}
              </Button>
            ))}
          </div>
          <Separator className="my-4" />
          <Button
            variant="default"
            className="w-full"
            onClick={saveContract}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Contract'}
          </Button>
        </CardContent>
      </Card>
      <ContractMilestone 
        contractId={contractId || 'new'}
        status={status}
        shareInfo={shareInfo}
      />
    </div>
  );
};
